/*
 * Ai-Snack ERP/POS - Offline Durability Layer v3
 *
 * Design goals:
 * 1) IndexedDB is the durable transaction journal; localStorage is only a mirror/UI fallback.
 * 2) Every business POST is journaled BEFORE any network attempt.
 * 3) Queue entries survive browser close, PC shutdown/restart, and multi-day offline periods.
 * 4) A transaction is removed only after the server acknowledges the same _req_id.
 * 5) SYNCING entries are recovered to PENDING after restart/crash.
 * 6) Server idempotency is expected to be durable (_RequestLedger in Code.gs).
 */
(function () {
  'use strict';

  const DB_NAME = 'aisnack-offline-v3';
  const DB_VERSION = 1;
  const QUEUE = 'journal';
  const META = 'meta';
  const LEGACY_QUEUE = 'queue';

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB tidak tersedia'));
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(QUEUE)) {
          const s = db.createObjectStore(QUEUE, { keyPath: '_req_id' });
          s.createIndex('status', '_queue_status', { unique: false });
          s.createIndex('queuedAt', '_queued_at', { unique: false });
        }
        if (!db.objectStoreNames.contains(META)) db.createObjectStore(META, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('Gagal membuka IndexedDB'));
      req.onblocked = () => reject(new Error('IndexedDB sedang dikunci tab lain'));
    });
  }

  function tx(storeName, mode, fn) {
    return openDB().then(db => new Promise((resolve, reject) => {
      let result;
      const t = db.transaction(storeName, mode);
      try { result = fn(t.objectStore(storeName)); } catch (e) { try { db.close(); } catch (_) {} reject(e); return; }
      t.oncomplete = () => { try { db.close(); } catch (_) {} resolve(result); };
      t.onerror = () => { try { db.close(); } catch (_) {} reject(t.error || new Error('IndexedDB transaction gagal')); };
      t.onabort = () => { try { db.close(); } catch (_) {} reject(t.error || new Error('IndexedDB transaction dibatalkan')); };
    }));
  }

  const Store = {
    async put(item) {
      if (!item || !item._req_id) throw new Error('Journal item tanpa _req_id');
      return tx(QUEUE, 'readwrite', s => s.put(item));
    },
    async delete(id) {
      if (!id) return;
      return tx(QUEUE, 'readwrite', s => s.delete(id));
    },
    async getAll() {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const t = db.transaction(QUEUE, 'readonly');
        const r = t.objectStore(QUEUE).getAll();
        r.onsuccess = () => { try { db.close(); } catch (_) {} resolve(r.result || []); };
        r.onerror = () => { try { db.close(); } catch (_) {} reject(r.error); };
      });
    },
    async count() {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const r = db.transaction(QUEUE, 'readonly').objectStore(QUEUE).count();
        r.onsuccess = () => { try { db.close(); } catch (_) {} resolve(r.result || 0); };
        r.onerror = () => { try { db.close(); } catch (_) {} reject(r.error); };
      });
    },
    async clear() { return tx(QUEUE, 'readwrite', s => s.clear()); },
    async metaPut(value) { return tx(META, 'readwrite', s => s.put(value)); },
    async metaGet(id) {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const r = db.transaction(META, 'readonly').objectStore(META).get(id);
        r.onsuccess = () => { try { db.close(); } catch (_) {} resolve(r.result || null); };
        r.onerror = () => { try { db.close(); } catch (_) {} reject(r.error); };
      });
    }
  };

  function reqId() {
    const c = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() :
      (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12));
    return 'REQ-' + c;
  }

  function mergeMemory(items) {
    const map = new Map();
    (Array.isArray(superApp.offlineQueue) ? superApp.offlineQueue : []).forEach(x => {
      if (x && x._req_id) map.set(x._req_id, x);
    });
    (items || []).forEach(x => {
      if (x && x._req_id) map.set(x._req_id, x);
    });
    superApp.offlineQueue = Array.from(map.values()).sort((a,b) => String(a._queued_at || '').localeCompare(String(b._queued_at || '')));
  }

  async function mirrorLocalStorage() {
    try {
      localStorage.setItem('aisnack_offline_queue', JSON.stringify(superApp.offlineQueue || []));
    } catch (_) { /* never block a transaction because localStorage is full */ }
  }

  async function hydrate() {
    let idb = [];
    try { idb = await Store.getAll(); } catch (e) { console.warn('[Offline] IndexedDB unavailable:', e); }

    // Recover entries that were being sent when the browser/PC stopped.
    idb.forEach(x => {
      if (x && x._queue_status === 'syncing') x._queue_status = 'pending';
    });
    for (const x of idb) {
      if (x && x._req_id && x._queue_status === 'pending') {
        try { await Store.put(x); } catch (_) {}
      }
    }

    // Import old v1/localStorage queue only once if it exists and is not already in the journal.
    let legacy = [];
    try {
      const raw = localStorage.getItem('aisnack_offline_queue');
      legacy = JSON.parse(raw || '[]');
      if (!Array.isArray(legacy)) legacy = [];
    } catch (_) { legacy = []; }

    const all = await Store.getAll().catch(() => []);
    const ids = new Set(all.map(x => x && x._req_id).filter(Boolean));
    for (const item of legacy) {
      if (!item || !item._req_id) continue;
      if (!ids.has(item._req_id)) {
        item._queue_status = item._queue_status === 'syncing' ? 'pending' : (item._queue_status || 'pending');
        item._queued_at = item._queued_at || new Date().toISOString();
        try { await Store.put(item); all.push(item); ids.add(item._req_id); } catch (_) {}
      }
    }
    mergeMemory(all);
    await mirrorLocalStorage();
    updateUI();
  }

  function updateUI() {
    try { if (typeof superApp.updateNetworkUI === 'function') superApp.updateNetworkUI(); } catch (_) {}
    try { if (typeof superApp.renderSyncQueue === 'function') superApp.renderSyncQueue(); } catch (_) {}
  }

  async function journal(payload, reason) {
    if (!payload._req_id) payload._req_id = reqId();
    payload._queue_status = 'pending';
    payload._queued_at = payload._queued_at || new Date().toISOString();
    payload._queue_reason = reason || 'network';
    payload._attempts = Number(payload._attempts || 0);
    payload._last_attempt_at = null;
    payload._last_error = '';

    // THE critical durability boundary: IndexedDB commit happens before network.
    await Store.put(payload);
    mergeMemory([payload]);
    await mirrorLocalStorage();
    updateUI();
    return { status: 'sukses', is_offline: true, queued: true, trx_id: payload.trx_id || payload.id_shift || payload._req_id, _req_id: payload._req_id };
  }

  async function postRaw(item) {
    const response = await fetch((typeof API_URL !== 'undefined' ? API_URL : superApp.webAppUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(item),
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    let body = {};
    try { body = await response.json(); } catch (_) { throw new Error('Respons server bukan JSON'); }
    const acknowledged = body && (body.status === 'sukses' || body.status === 'success' || body.pesan === 'Already Synced');
    if (!acknowledged) throw new Error((body && (body.pesan || body.message || body.error)) || 'Server belum mengonfirmasi');
    return body;
  }

  async function sync() {
    if (superApp._durableSyncing) return;
    if (!navigator.onLine && !superApp.isOnline) return;
    superApp._durableSyncing = true;
    try {
      const items = await Store.getAll();
      mergeMemory(items);
      if (!items.length) { updateUI(); return; }

      for (const original of items.sort((a,b) => String(a._queued_at || '').localeCompare(String(b._queued_at || '')))) {
        if (!navigator.onLine && !superApp.isOnline) break;
        const item = Object.assign({}, original, { _queue_status: 'syncing', _attempts: Number(original._attempts || 0) + 1, _last_attempt_at: new Date().toISOString() });
        try { await Store.put(item); } catch (_) {}
        mergeMemory([item]);
        await mirrorLocalStorage();

        try {
          await postRaw(item);
          // Remove ONLY after an acknowledged response. If power fails before this delete,
          // the same _req_id is retried and the durable server ledger answers Already Synced.
          await Store.delete(item._req_id);
          superApp.offlineQueue = (superApp.offlineQueue || []).filter(x => x && x._req_id !== item._req_id);
          await mirrorLocalStorage();
        } catch (e) {
          item._queue_status = 'pending';
          item._last_error = String(e && e.message || e);
          try { await Store.put(item); } catch (_) {}
          mergeMemory([item]);
          await mirrorLocalStorage();
          if (!navigator.onLine) break;
        }
      }
      updateUI();
    } finally {
      superApp._durableSyncing = false;
      updateUI();
    }
  }

  async function durableApiPost(payload) {
    if (!payload || typeof payload !== 'object') throw new Error('Payload transaksi tidak valid');
    if (!payload._req_id) payload._req_id = reqId();

    // Always journal first. This is what makes an online transaction recoverable too.
    const queued = await journal(payload, navigator.onLine ? 'durable-online-first' : 'offline');
    if (!navigator.onLine || superApp.isOnline === false) return queued;

    const item = Object.assign({}, payload, { _queue_status: 'syncing', _attempts: Number(payload._attempts || 0) + 1, _last_attempt_at: new Date().toISOString() });
    try { await Store.put(item); } catch (_) {}
    mergeMemory([item]);
    await mirrorLocalStorage();

    try {
      const response = await postRaw(item);
      await Store.delete(item._req_id);
      superApp.offlineQueue = (superApp.offlineQueue || []).filter(x => x && x._req_id !== item._req_id);
      await mirrorLocalStorage();
      updateUI();
      return response;
    } catch (e) {
      item._queue_status = 'pending';
      item._last_error = String(e && e.message || e);
      try { await Store.put(item); } catch (_) {}
      mergeMemory([item]);
      await mirrorLocalStorage();
      updateUI();
      return { status: 'sukses', is_offline: true, queued: true, trx_id: item.trx_id || item.id_shift || item._req_id, _req_id: item._req_id, _error: item._last_error };
    }
  }

  async function exportBackup() {
    const items = await Store.getAll();
    const backup = { format: 'AISNACK-OFFLINE-BACKUP', version: 3, exportedAt: new Date().toISOString(), queue: items };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'AiSnack_Offline_Backup_' + new Date().toISOString().replace(/[:.]/g,'-') + '.json';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    return items.length;
  }

  async function importBackup(file) {
    const text = await file.text();
    const backup = JSON.parse(text);
    if (!backup || backup.format !== 'AISNACK-OFFLINE-BACKUP' || !Array.isArray(backup.queue)) throw new Error('File backup Ai-Snack tidak valid');
    for (const item of backup.queue) {
      if (!item || !item._req_id) continue;
      item._queue_status = 'pending';
      await Store.put(item);
    }
    await hydrate();
    return backup.queue.length;
  }

  async function install() {
    // Replace the weak clear-and-rewrite queue persistence with durable journal semantics.
    superApp.persistOfflineQueue = async function () {
      const items = await Store.getAll().catch(() => []);
      mergeMemory(items);
      await mirrorLocalStorage();
      updateUI();
    };
    superApp.enqueueOfflinePayload = journal;
    superApp.apiPost = durableApiPost;
    superApp.syncOfflineQueue = sync;
    superApp.getPendingQueueCount = function () { return Array.isArray(this.offlineQueue) ? this.offlineQueue.length : 0; };

    // The old bulk approval used fetch() directly and bypassed the queue.
    superApp.executeBulkApproval = async function (status, trCbs) {
      if (this.isProcessing) return;
      this.closeModal('modal-confirm-bulk');
      this.setLoading(true, `Memproses Masal (${status})...`);
      try {
        const items = Array.from(trCbs || []).map(cb => cb.value).filter(Boolean);
        if (items.length) {
          const res = await this.apiPost({ action: 'bulk_approve_mutasi', items, status_app: status });
          if (!res || res.status !== 'sukses') throw new Error('Server belum mengonfirmasi persetujuan masal');
        }
        this.showToast(`Proses Masal (${status}) berhasil disimpan.`, 'success');
        if (typeof this.pullFreshData === 'function' && !this.offlineQueue.length) await this.pullFreshData(true);
      } catch (e) {
        console.error(e);
        this.showToast('Gagal memproses persetujuan masal: ' + (e.message || e), 'error');
      } finally { this.setLoading(false); }
    };

    // Public durability controls for operators/admins.
    window.AiSnackOffline = {
      version: 3,
      hydrate, sync, exportBackup, importBackup,
      getQueue: () => Store.getAll(),
      count: () => Store.count()
    };

    await hydrate();
    if (navigator.onLine) setTimeout(sync, 1000);

    // Reconnect + periodic retry + visibility recovery.
    window.addEventListener('online', () => { superApp.isOnline = true; setTimeout(sync, 250); });
    window.addEventListener('offline', () => { superApp.isOnline = false; updateUI(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && navigator.onLine) setTimeout(sync, 250); });
    setInterval(() => { if (navigator.onLine) sync(); }, 60000);
  }

  // app.js registers window.onload first; replace it after loading this layer.
  const originalInit = superApp.init.bind(superApp);
  superApp.init = async function () {
    await originalInit();
    try { await install(); } catch (e) { console.error('[Offline] Durable layer gagal dipasang:', e); }
  };
  window.onload = () => superApp.init();
})();
