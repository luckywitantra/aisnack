const API_URL = "https://script.google.com/macros/s/AKfycbwRss8HzQwPardxTi4Scd-QOUZ2pitnsubY6pqASyLZA7oaagmym61VuFJvWjb91NRhfg/exec"; // <-- GANTI DENGAN URL API ANDA

const superApp = {
    outlet: '', cart: [], printerChar: null, db: null, filteredProducts: [],
    payTotal: 0, payCash: 0, payChange: 0, payMethod: 'Tunai', activeShiftId: null, activeStaffTeam: [],
    activeReprintTrx: null, currentUser: null, pinBuffer: '', ADMIN_PIN: '1234',
    offlineQueue: [], isOnline: navigator.onLine, cfdWindow: null, isLoadingData: false, isProcessing: false,
    vnActiveInputId: '', vnIsCalcChange: false,

    // ==========================================
    // 1. FORMATTER & VIRTUAL NUMPAD ENGINE
    // ==========================================
    formatRupiahInput: function(el) {
        let val = el.value.replace(/[^0-9]/g, '');
        if(val !== '') el.value = parseInt(val, 10).toLocaleString('id-ID'); else el.value = '';
    },
    getNumericValue: function(val) { return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0; },
    cleanDateOnly: function(str) {
        if(!str) return ''; let s = String(str);
        let match = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (match) { let pad = n => String(n).length < 2 ? '0' + n : n; return `${pad(match[1])}/${pad(match[2])}/${match[3]}`; }
        if (s.includes('T')) { let d = new Date(s); if (!isNaN(d.getTime())) { let pad = n => n < 10 ? '0' + n : n; return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; } }
        return s.split(' ')[0];
    },
    cleanTimeOnly: function(str) {
        if(!str) return ''; let s = String(str);
        let match = s.match(/(\d{1,2})[.:](\d{1,2})[.:](\d{1,2})/);
        if (match) { let pad = n => String(n).length < 2 ? '0' + n : n; return `${pad(match[1])}.${pad(match[2])}.${pad(match[3])}`; }
        if(s.includes('T') && s.includes('Z')) { let d = new Date(s); if (!isNaN(d.getTime())) { let pad = n => n < 10 ? '0' + n : n; return `${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`; } } 
        let parts = s.split(' '); return parts.length > 1 ? parts[1] : s;
    },
    parseDateId: function(dateStr) {
        if(!dateStr) return new Date(0); let s = String(dateStr);
        let match = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (match) { let p1 = parseInt(match[1]); let p2 = parseInt(match[2]); let y = parseInt(match[3]); let d = p1, m = p2; if (p2 > 12) { m = p1; d = p2; } return new Date(y, m - 1, d, 0, 0, 0, 0); }
        if(s.includes('T')) { let d = new Date(s); if (!isNaN(d.getTime())) { d.setHours(0,0,0,0); return d; } }
        let fPart = s.split(' ')[0]; let d2 = new Date(fPart); if (!isNaN(d2.getTime())) { d2.setHours(0,0,0,0); return d2; }
        return new Date(0);
    },
    openVirtualNumpad: function(inputId, title, calcChange = false) {
        superApp.vnActiveInputId = inputId; superApp.vnIsCalcChange = calcChange;
        let titleEl = document.getElementById('vnumpad-title'); if(titleEl) titleEl.innerText = title;
        let el = document.getElementById(inputId); let currentVal = el ? superApp.getNumericValue(el.value) : 0;
        let displayEl = document.getElementById('vnumpad-display'); if(displayEl) displayEl.innerText = currentVal > 0 ? currentVal.toLocaleString('id-ID') : '0';
        const np = document.getElementById('virtual-numpad'); if(np) np.classList.remove('translate-y-full');
    },
    closeVirtualNumpad: function() { const np = document.getElementById('virtual-numpad'); if(np) np.classList.add('translate-y-full'); },
    vnumpadAdd: function(val) {
        let display = document.getElementById('vnumpad-display'); if(!display) return;
        let currentRaw = String(superApp.getNumericValue(display.innerText)); if(currentRaw === '0') currentRaw = '';
        let newVal = currentRaw + val; if(newVal.length > 11) return;
        display.innerText = parseInt(newVal, 10).toLocaleString('id-ID');
    },
    vnumpadDel: function() {
        let display = document.getElementById('vnumpad-display'); if(!display) return;
        let currentRaw = String(superApp.getNumericValue(display.innerText));
        if(currentRaw.length > 1) { let newVal = currentRaw.slice(0, -1); display.innerText = parseInt(newVal, 10).toLocaleString('id-ID'); } 
        else { display.innerText = '0'; }
    },
    vnumpadClear: function() { let disp = document.getElementById('vnumpad-display'); if(disp) disp.innerText = '0'; },
    vnumpadDone: function() {
        let display = document.getElementById('vnumpad-display'); if(!display) return;
        let displayVal = display.innerText; let el = document.getElementById(superApp.vnActiveInputId);
        if(el) {
            el.value = displayVal === '0' ? '' : displayVal;
            if(superApp.vnIsCalcChange) { superApp.payCash = superApp.getNumericValue(displayVal); superApp.calcChange(); }
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
        superApp.closeVirtualNumpad();
    },

    // ==========================================
    // 2. GLOBAL UTILS & API
    // ==========================================
    pullFreshData: async function() {
        if(superApp.isProcessing) return; superApp.setLoading(true, "Menarik Data Terbaru...");
        try {
            const res = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); const data = await res.json();
            if(data && data.status === 'sukses') { superApp.db = data; localStorage.setItem('aisnack_db_cache', JSON.stringify(data)); superApp.refreshData(); superApp.showToast("Data berhasil diperbarui!"); } 
            else throw new Error("Gagal");
        } catch (e) { superApp.showToast("Gagal menarik data. Periksa internet.", "error"); }
        superApp.setLoading(false);
    },
    getEmptyState: function(icon, title, desc) { return `<div class="flex flex-col items-center justify-center h-full p-8 text-center opacity-70"><div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl text-slate-300 mb-4 mx-auto"><i class="fas ${icon}"></i></div><h4 class="font-black text-slate-600 text-lg mb-1">${title}</h4><p class="text-xs font-bold text-slate-400">${desc}</p></div>`; },
    showToast: function(msg, type = 'success') {
        const container = document.getElementById('toast-container'); if(!container) return;
        const icon = type === 'success' ? '<i class="fas fa-check-circle text-green-500 text-xl"></i>' : (type === 'warning' ? '<i class="fas fa-cloud-arrow-up text-orange-500 text-xl"></i>' : '<i class="fas fa-exclamation-circle text-red-500 text-xl"></i>');
        const t = document.createElement('div'); t.className = `bg-white p-4 rounded-2xl shadow-2xl shadow-slate-200 flex items-center gap-3 toast-animate z-[999] dark:bg-slate-800 dark:border-slate-700 pointer-events-auto`;
        t.innerHTML = `${icon}<p class="font-bold text-sm text-slate-800">${msg}</p>`;
        container.appendChild(t); setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000); superApp.syncStorage();
    },
    toggleSidebar: function() { const sb = document.getElementById('sidebar'); const ov = document.getElementById('mobile-overlay'); if(sb && ov) { sb.classList.toggle('-translate-x-full'); ov.classList.toggle('hidden'); } },
    setLoading: function(show, text="Memproses...") { 
        const loader = document.getElementById('app-loader'); const lText = document.getElementById('loader-text'); superApp.isProcessing = show;
        if(loader && lText) { lText.innerText = text; if (show) { loader.classList.remove('hidden'); loader.classList.add('flex'); } else { loader.classList.add('hidden'); loader.classList.remove('flex'); } }
    },
    closeModal: function(id) { const content = document.getElementById(id+'-content'); const modal = document.getElementById(id); if(content && modal) { content.classList.remove('modal-enter-active'); setTimeout(() => modal.classList.add('hidden'), 300); } },
    toggleDarkMode: function() { 
        document.documentElement.classList.toggle('dark'); let ic = document.getElementById('dark-icon'); 
        if(ic) { if(document.documentElement.classList.contains('dark')) { ic.classList.replace('fa-moon', 'fa-sun'); ic.classList.replace('text-slate-600', 'text-yellow-400'); } else { ic.classList.replace('fa-sun', 'fa-moon'); ic.classList.replace('text-yellow-400', 'text-slate-600'); } }
    },
    apiPost: async function(payload) {
        if(!superApp.isOnline) { superApp.offlineQueue.push(payload); localStorage.setItem('aisnack_offline_queue', JSON.stringify(superApp.offlineQueue)); superApp.updateNetworkUI(); return { status: 'sukses', is_offline: true, trx_id: payload.trx_id || payload.id_shift }; }
        try { const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) }); return await res.json(); } 
        catch(e) { superApp.offlineQueue.push(payload); localStorage.setItem('aisnack_offline_queue', JSON.stringify(superApp.offlineQueue)); superApp.updateNetworkUI(); return { status: 'sukses', is_offline: true, trx_id: payload.trx_id || payload.id_shift }; }
    },
    syncOfflineQueue: async function() {
        if(!superApp.isOnline || superApp.offlineQueue.length === 0) return;
        superApp.showToast("Menyinkronkan data offline...", "warning"); let failedQueue = [];
        for (let i = 0; i < superApp.offlineQueue.length; i++) { try { await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(superApp.offlineQueue[i]) }); } catch(e) { failedQueue.push(superApp.offlineQueue[i]); } }
        superApp.offlineQueue = failedQueue; localStorage.setItem('aisnack_offline_queue', JSON.stringify(superApp.offlineQueue));
        if(superApp.offlineQueue.length === 0) { superApp.showToast("Semua data tersinkronisasi!"); try { const res = await fetch(API_URL, { redirect: 'follow' }); superApp.db = await res.json(); superApp.refreshData(); } catch(e){} }
        superApp.updateNetworkUI();
    },
    updateNetworkUI: function() {
        const ind = document.getElementById('network-indicator'); const dot = document.getElementById('net-dot'); const txt = document.getElementById('net-text'); if(!ind || !dot || !txt) return;
        if(superApp.isOnline) {
            if(superApp.offlineQueue.length > 0) { ind.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 cursor-pointer transition'; dot.className = 'w-2 h-2 rounded-full bg-orange-500 animate-pulse'; txt.className = 'text-[10px] font-bold text-orange-600 hidden md:inline'; txt.innerText = `Menyinkron ${superApp.offlineQueue.length} data...`; } 
            else { ind.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 transition'; dot.className = 'w-2 h-2 rounded-full bg-green-500'; txt.className = 'text-[10px] font-bold text-green-600 hidden md:inline'; txt.innerText = 'Online & Sinkron'; }
        } else { ind.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 transition'; dot.className = 'w-2 h-2 rounded-full bg-red-500'; txt.className = 'text-[10px] font-bold text-red-600 hidden md:inline'; txt.innerText = `Offline (${superApp.offlineQueue.length} Pending)`; }
    },

    // ==========================================
    // 3. DUAL MONITOR (CFD)
    // ==========================================
    openCFD: async function() {
        try { if ('getScreenDetails' in window) { const screens = await window.getScreenDetails(); const extScreen = screens.screens.find(s => s !== screens.currentScreen); if (extScreen) { superApp.cfdWindow = window.open(window.location.href + '?mode=cfd', 'CFD_WINDOW', `left=${extScreen.availLeft},top=${extScreen.availTop},width=${extScreen.availWidth},height=${extScreen.availHeight},fullscreen=yes`); return; } } } catch(e) {}
        superApp.cfdWindow = window.open(window.location.href + '?mode=cfd', 'CFD_WINDOW', `left=${window.screen.width},top=0,width=1024,height=768`);
    },
    changePromoImage: function() {
        let fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.accept = 'image/*';
        fileInput.onchange = (event) => {
            const file = event.target.files[0]; if(!file) return; if(superApp.isProcessing) return; superApp.setLoading(true, "Mengunggah Promo...");
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas'); let w = img.width; let h = img.height; const maxW = 1920; 
                    if(w > maxW) { h = Math.round((h * maxW) / w); w = maxW; } canvas.width = w; canvas.height = h;
                    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, h); const base64 = canvas.toDataURL('image/jpeg', 0.8);
                    const payload = { action: 'update_promo', url: base64 };
                    superApp.apiPost(payload).then(res => { if(res.status === 'sukses') { localStorage.setItem('cfd_promo_url', base64); superApp.syncStorage(); superApp.setLoading(false); superApp.showToast("Banner Promo Diperbarui!"); } }).catch(() => superApp.setLoading(false));
                }; img.src = e.target.result;
            }; reader.readAsDataURL(file);
        }; fileInput.click();
    },
    syncStorage: function(status = 'ordering') {
        if(new URLSearchParams(window.location.search).get('mode') === 'cfd') return; 
        localStorage.setItem('ai_snack_cfd', JSON.stringify({ outlet: superApp.outlet || 'Ai-Snack', items: superApp.cart, total: superApp.payTotal, kembali: superApp.payChange, status: status, timestamp: new Date().getTime(), promoUrl: localStorage.getItem('cfd_promo_url') }));
    },
    initCFD: function() {
        document.getElementById('login-screen').classList.add('hidden'); document.getElementById('sidebar').classList.add('hidden'); document.getElementById('main-app').classList.add('hidden');
        const cfdScreen = document.getElementById('cfd-screen'); if(cfdScreen) cfdScreen.classList.remove('hidden');
        window.addEventListener('storage', (e) => { if(e.key === 'ai_snack_cfd' || e.key === 'cfd_promo_url') { let data = JSON.parse(localStorage.getItem('ai_snack_cfd') || '{}'); if(data.outlet) superApp.renderCFD(data); } });
        let initialData = localStorage.getItem('ai_snack_cfd'); if(initialData) superApp.renderCFD(JSON.parse(initialData));
        let savedBg = localStorage.getItem('cfd_promo_url'); if(savedBg) { const bg = document.getElementById('cfd-promo-bg'); if(bg) bg.style.backgroundImage = `url('${savedBg}')`; }
    },
    renderCFD: function(data) {
        const outNameEl = document.getElementById('cfd-outlet-name'); if(outNameEl) outNameEl.innerText = `Cabang ${data.outlet}`;
        if(data.promoUrl) { const bg = document.getElementById('cfd-promo-bg'); if(bg) bg.style.backgroundImage = `url('${data.promoUrl}')`; }
        const cfdStandby = document.getElementById('cfd-standby'); const cfdSuccess = document.getElementById('cfd-success');
        if(data.status === 'paid') { cfdSuccess.classList.remove('hidden'); document.getElementById('cfd-kembali').innerText = `Rp ${data.kembali.toLocaleString('id-ID')}`; setTimeout(() => { cfdSuccess.classList.add('hidden'); }, 5000); } 
        else { cfdSuccess.classList.add('hidden'); }
        if(data.items.length === 0 && data.status !== 'paid') { cfdStandby.classList.remove('opacity-0', 'pointer-events-none'); } 
        else {
            cfdStandby.classList.add('opacity-0', 'pointer-events-none'); let html = '';
            data.items.forEach(i => { html += `<div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center"><div><h4 class="font-black text-slate-800 text-lg">${i.nama}</h4><p class="text-slate-500 font-bold">${i.qty} x Rp ${i.price.toLocaleString('id-ID')}</p></div><p class="font-black text-brand-500 text-xl">Rp ${(i.price * i.qty).toLocaleString('id-ID')}</p></div>`; });
            const listEl = document.getElementById('cfd-cart-list'); if(listEl) listEl.innerHTML = html; 
            const totEl = document.getElementById('cfd-total'); if(totEl) totEl.innerText = `Rp ${data.total.toLocaleString('id-ID')}`;
        }
    },

    // ==========================================
    // 4. STARTUP & LOGIN
    // ==========================================
    init: async function() {
        if(new URLSearchParams(window.location.search).get('mode') === 'cfd') { superApp.initCFD(); return; }
        window.addEventListener('beforeunload', () => { if(superApp.cfdWindow && !superApp.cfdWindow.closed) superApp.cfdWindow.close(); });
        window.addEventListener('online', () => { superApp.isOnline = true; superApp.syncOfflineQueue(); });
        window.addEventListener('offline', () => { superApp.isOnline = false; superApp.updateNetworkUI(); });
        superApp.offlineQueue = JSON.parse(localStorage.getItem('aisnack_offline_queue')) || [];
        
        try {
            let cacheDb = localStorage.getItem('aisnack_db_cache'); if(cacheDb) { superApp.db = JSON.parse(cacheDb); }
            const logStat = document.getElementById('login-status'); if(logStat) { logStat.innerText = 'Mengunduh Database Google...'; logStat.className = 'text-[10px] text-brand-500 font-bold uppercase tracking-widest text-center animate-pulse'; }
            
            let data = null;
            for (let i = 0; i < 3; i++) {
                try { const res = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); data = await res.json(); if(data && data.status === 'sukses') break; } 
                catch (e) { if(logStat) logStat.innerText = `Mencoba ulang koneksi (${i+1}/3)...`; await new Promise(r => setTimeout(r, 2000)); }
            }
            if(!data || data.status === 'error') throw new Error(data ? data.pesan : "Server Timeout");
            
            superApp.db = data; localStorage.setItem('aisnack_db_cache', JSON.stringify(data)); 
            let promoData = (superApp.db.pengaturan || []).find(x => x.Pengaturan === 'Promo_CFD'); if(promoData) localStorage.setItem('cfd_promo_url', promoData.Nilai);

            let today = new Date(); let yyyy = today.getFullYear(); let mm = String(today.getMonth() + 1).padStart(2, '0'); let dd = String(today.getDate()).padStart(2, '0');
            let todayStr = `${yyyy}-${mm}-${dd}`; const fs = document.getElementById('filter-start'); const fe = document.getElementById('filter-end');
            if(fs && !fs.value) fs.value = todayStr; if(fe && !fe.value) fe.value = todayStr;

            if(logStat) { logStat.innerText = 'Sistem Terkoneksi. Silakan Masukkan PIN.'; logStat.className = 'text-[10px] text-green-500 font-bold uppercase tracking-widest text-center'; }
            document.querySelectorAll('.pin-btn').forEach(btn => { btn.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed'); });
        } catch (err) { 
            const logStat = document.getElementById('login-status');
            if(logStat && superApp.db) { 
                logStat.innerText = 'Offline Mode Aktif (Gunakan PIN Anda)'; logStat.className = 'text-[10px] text-orange-500 font-bold uppercase tracking-widest text-center'; 
                document.querySelectorAll('.pin-btn').forEach(btn => { btn.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed'); });
            } 
            else if (logStat) { logStat.innerText = 'Gagal! Buka aplikasi pertama kali butuh Internet.'; logStat.className = 'text-[10px] text-red-500 font-bold uppercase tracking-widest text-center'; }
        }
    },
    addPin: function(num) {
        if(superApp.pinBuffer.length < 4) { superApp.pinBuffer += num; const dot = document.getElementById(`dot-${superApp.pinBuffer.length}`); if(dot) { dot.classList.replace('border-slate-300', 'bg-brand-500'); dot.classList.replace('border-2', 'border-0'); } }
        if(superApp.pinBuffer.length === 4) setTimeout(() => superApp.processLogin(), 200);
    },
    delPin: function() {
        if(superApp.pinBuffer.length > 0) { const dot = document.getElementById(`dot-${superApp.pinBuffer.length}`); if(dot) { dot.classList.replace('bg-brand-500', 'border-slate-300'); dot.classList.replace('border-0', 'border-2'); } superApp.pinBuffer = superApp.pinBuffer.slice(0, -1); }
    },
    clearPin: function() { 
        superApp.pinBuffer = ''; 
        for(let i=1; i<=4; i++) { const dot = document.getElementById(`dot-${i}`); if(dot) { dot.classList.replace('bg-brand-500', 'border-slate-300'); dot.classList.replace('border-0', 'border-2'); } } 
    },
    processLogin: function() {
        if(superApp.isProcessing) return; superApp.isProcessing = true;
        if (!superApp.db || !superApp.db.users) { superApp.showToast('Koneksi ke Database belum siap.', 'error'); superApp.clearPin(); superApp.isProcessing = false; return; }
        
        let user = superApp.db.users.find(u => String(u.PIN) === String(superApp.pinBuffer));
        if(user) {
            superApp.currentUser = user; superApp.outlet = user.Outlet === 'Pusat' ? ((superApp.db.outlets||[])[0]?.ID_Outlet || 'Penajam') : user.Outlet;
            const sbRole = document.getElementById('sb-role'); if(sbRole) sbRole.innerText = user.Role; 
            const hInit = document.getElementById('header-initial'); if(hInit) hInit.innerText = user.Username.charAt(0).toUpperCase();
            
            let isAdmin = String(user.Role).toLowerCase().includes('admin');
            const adminMenus = document.getElementById('admin-menus'); const selOut = document.getElementById('select-outlet'); const repOut = document.getElementById('report-outlet-filter');

            if(isAdmin) {
                if(adminMenus) adminMenus.classList.remove('hidden'); if(selOut) selOut.classList.remove('hidden'); if(repOut) repOut.classList.remove('hidden');
                let outOptions = ''; let outFilters = '<option value="Semua">Semua Outlet</option>';
                (superApp.db.outlets||[]).forEach(o => { outOptions += `<option value="${o.ID_Outlet}">📍 ${o.Nama_Outlet}</option>`; outFilters += `<option value="${o.ID_Outlet}">Hanya: ${o.Nama_Outlet}</option>`; });
                if(selOut) { selOut.innerHTML = outOptions; selOut.value = superApp.outlet; selOut.disabled = false; }
                if(repOut) repOut.innerHTML = outFilters;
                const btnPromo = document.getElementById('btn-ubah-promo'); if(btnPromo) btnPromo.style.display = 'flex';
            } else {
                if(adminMenus) adminMenus.classList.add('hidden'); 
                if(selOut) { selOut.classList.add('hidden'); selOut.innerHTML = `<option value="${superApp.outlet}">📍 ${superApp.outlet}</option>`; selOut.disabled = true; }
                if(repOut) repOut.classList.add('hidden');
                const btnPromo = document.getElementById('btn-ubah-promo'); if(btnPromo) btnPromo.style.display = 'none';
            }
            
            const ls = document.getElementById('login-screen'); if(ls) ls.classList.add('hidden');
            const sbar = document.getElementById('sidebar'); if(sbar) sbar.classList.remove('hidden');
            const mainApp = document.getElementById('main-app'); if(mainApp) mainApp.classList.remove('hidden');
            
            superApp.updateNetworkUI(); superApp.syncOfflineQueue(); superApp.refreshData(); superApp.checkShiftStatus(); superApp.showToast(`Selamat datang, ${user.Username}!`);
        } else { superApp.showToast('PIN Tidak Dikenali', 'error'); superApp.clearPin(); }
        superApp.isProcessing = false;
    },

    // ==========================================
    // 5. SHIFT & KAS KELUAR
    // ==========================================
    checkShiftStatus: function() {
        const shiftOutName = document.getElementById('shift-outlet-name'); if(shiftOutName) shiftOutName.innerText = superApp.outlet;
        let openShift = (superApp.db.shifts || []).find(s => s.Outlet === superApp.outlet && s.Waktu_Tutup === '');
        const posView = document.getElementById('view-pos'); 

        if(openShift) {
            superApp.activeShiftId = openShift.ID_Shift;
            try { superApp.activeStaffTeam = JSON.parse(openShift.Tim_Operasional); } catch(e){ superApp.activeStaffTeam = []; }
            if(posView) posView.classList.remove('blur-lock');
        } else {
            superApp.activeShiftId = null; superApp.activeStaffTeam = [];
            if(posView) posView.classList.add('blur-lock');
            
            const shiftUserName = document.getElementById('shift-user-name');
            if(shiftUserName && superApp.currentUser) shiftUserName.innerText = superApp.currentUser.Username;
            
            let staffHtml = '';
            (superApp.db.users || []).filter(u => u.Outlet === superApp.outlet || u.Outlet === 'Pusat').forEach(u => {
                let badge = String(u.Role).toLowerCase().includes('senior') || String(u.Role).toLowerCase().includes('admin') ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-slate-100 text-slate-500';
                staffHtml += `<label class="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition"><input type="checkbox" value="${u.Username}" data-role="${u.Role}" class="shift-cb w-5 h-5 text-brand-500 rounded"><div class="flex-1 font-bold text-sm text-slate-800">${u.Username}</div><span class="px-2 py-0.5 border rounded text-[10px] font-black uppercase ${badge}"></span></label>`;
            });
            
            const staffListEl = document.getElementById('shift-staff-list'); if(staffListEl) staffListEl.innerHTML = staffHtml || '<p class="text-sm text-red-500">Tidak ada staf terdaftar di cabang ini.</p>';
            
            const mAwal = document.getElementById('shift-modal-awal'); 
            if(mAwal) { mAwal.value = ''; }

            const modalShift = document.getElementById('modal-shift'); const modalShiftContent = document.getElementById('modal-shift-content');
            if(modalShift && modalShiftContent) { modalShift.classList.remove('hidden'); setTimeout(() => modalShiftContent.classList.add('modal-enter-active'), 10); }
        }
    },
    executeBukaShift: async function() {
        if(superApp.isProcessing) return;
        let cbs = document.querySelectorAll('.shift-cb:checked');
        if(cbs.length === 0) return superApp.showToast("Pilih minimal 1 anggota tim!", "error");
        let mAwalEl = document.getElementById('shift-modal-awal'); let m_awal = mAwalEl ? superApp.getNumericValue(mAwalEl.value) : 0;
        if(m_awal === 0 && (!mAwalEl || mAwalEl.value === '')) return superApp.showToast("Uang Laci Awal wajib diisi!", "error");
        
        let tim = []; let hasSenior = false;
        cbs.forEach(cb => {
            tim.push({username: cb.value, role: cb.getAttribute('data-role')});
            if(String(cb.getAttribute('data-role')).toLowerCase().includes('senior') || String(cb.getAttribute('data-role')).toLowerCase().includes('admin')) hasSenior = true;
        });
        if(!hasSenior) return superApp.showToast("Ditolak: Wajib 1 Senior dalam Shift!", "error");

        superApp.setLoading(true, "Membuka Laci Kasir...");
        let shiftID = 'SHF' + new Date().getTime();
        const payload = { action: 'buka_shift', outlet: superApp.outlet, tim: tim, modal_awal: m_awal, id_shift: shiftID };
        let res = await superApp.apiPost(payload);
        
        if(res.status === 'sukses') {
            superApp.activeShiftId = shiftID; superApp.activeStaffTeam = tim;
            if(res.is_offline) {
                let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
                superApp.db.shifts.push({ID_Shift: shiftID, Tanggal: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`, Outlet: superApp.outlet, Waktu_Tutup: '', Tim_Operasional: JSON.stringify(tim), Modal_Awal: m_awal});
            }
            superApp.closeModal('modal-shift'); const posView = document.getElementById('view-pos'); if(posView) posView.classList.remove('blur-lock');
            superApp.showToast(res.is_offline ? "Shift Dibuka (Mode Offline)" : "Shift Dibuka! Laci siap digunakan.");
        }
        superApp.setLoading(false);
    },
    openKasKeluar: function() {
        const nom = document.getElementById('kas-out-nominal'); if(nom) nom.value = '';
        const ket = document.getElementById('kas-out-ket'); if(ket) ket.value = '';
        const mod = document.getElementById('modal-kas-keluar'); const modc = document.getElementById('modal-kas-keluar-content');
        if(mod && modc) { mod.classList.remove('hidden'); setTimeout(() => modc.classList.add('modal-enter-active'), 10); }
    },
    executeKasKeluar: async function() {
        if(superApp.isProcessing) return;
        let nomEl = document.getElementById('kas-out-nominal'); let ketEl = document.getElementById('kas-out-ket');
        if(!nomEl || !ketEl) return; let nom = superApp.getNumericValue(nomEl.value); let ket = ketEl.value;
        if(nom === 0 || !ket) return superApp.showToast("Nominal dan Keterangan wajib diisi!", "error");
        
        superApp.setLoading(true, "Mencatat Pengeluaran...");
        let kasId = 'KAS' + new Date().getTime();
        const payload = { action: 'kas_keluar', id_kas: kasId, outlet: superApp.outlet, kasir: superApp.currentUser.Username, nominal: nom, keterangan: ket, id_shift: superApp.activeShiftId };
        
        let res = await superApp.apiPost(payload);
        if(res.status === 'sukses') {
            if(res.is_offline) {
                let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
                if(!superApp.db.kasKeluar) superApp.db.kasKeluar = [];
                superApp.db.kasKeluar.push({ID_Kas: kasId, Tanggal: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`, Waktu: `${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`, Outlet: superApp.outlet, Kasir: superApp.currentUser.Username, Nominal: nom, Keterangan: ket, ID_Shift: superApp.activeShiftId});
            }
            superApp.closeModal('modal-kas-keluar'); superApp.showToast("Kas Keluar Tersimpan.");
            if(!res.is_offline) { const r = await fetch(API_URL, { redirect: 'follow' }); superApp.db = await r.json(); superApp.refreshData(); }
        }
        superApp.setLoading(false);
    },
    promptTutupShift: function() {
        const setAkhir = document.getElementById('shift-setoran-akhir'); if(setAkhir) setAkhir.value = '';
        let shiftData = (superApp.db.shifts || []).find(s => s.ID_Shift === superApp.activeShiftId);
        let modal = shiftData ? Number(shiftData.Modal_Awal) : 0;
        let salesTunai = 0; let totalKasKeluar = 0;
        
        (superApp.db.transactions || []).forEach(t => { 
            let t_tunai = t.Tunai !== undefined ? t.Tunai : (t.Dibayar || 0); 
            if(t.ID_Shift === superApp.activeShiftId && t.Status === 'Sukses' && String(t.Metode_Bayar||'').toUpperCase() === 'TUNAI') salesTunai += Number(t.Total_Bayar); 
        });
        (superApp.db.kasKeluar || []).forEach(k => { if(k.ID_Shift === superApp.activeShiftId) totalKasKeluar += Number(k.Nominal); });
        
        let expected = modal + salesTunai - totalKasKeluar;

        const tMod = document.getElementById('ts-modal'); if(tMod) tMod.innerText = `Rp ${modal.toLocaleString('id-ID')}`;
        const tSal = document.getElementById('ts-sales'); if(tSal) tSal.innerText = `Rp ${salesTunai.toLocaleString('id-ID')}`;
        const tKas = document.getElementById('ts-kasout'); if(tKas) tKas.innerText = `Rp ${totalKasKeluar.toLocaleString('id-ID')}`;
        const tExp = document.getElementById('ts-expected'); if(tExp) tExp.innerText = `Rp ${expected.toLocaleString('id-ID')}`;

        const modalTutup = document.getElementById('modal-tutup-shift'); const modalTutupContent = document.getElementById('modal-tutup-shift-content');
        if(modalTutup && modalTutupContent) { modalTutup.classList.remove('hidden'); setTimeout(() => modalTutupContent.classList.add('modal-enter-active'), 10); }
    },
    executeTutupShift: async function() {
        if(superApp.isProcessing) return;
        let setAkhirEl = document.getElementById('shift-setoran-akhir'); let setor = setAkhirEl ? superApp.getNumericValue(setAkhirEl.value) : 0;
        if(setor === 0 && (!setAkhirEl || setAkhirEl.value === '')) return superApp.showToast("Hitung uang fisik di laci!", "error");
        
        let shiftData = (superApp.db.shifts || []).find(s => s.ID_Shift === superApp.activeShiftId);
        let modal = shiftData ? Number(shiftData.Modal_Awal) : 0;
        let salesTunai = 0; let totalKasKeluar = 0;
        
        (superApp.db.transactions || []).forEach(t => { if(t.ID_Shift === superApp.activeShiftId && t.Status === 'Sukses' && String(t.Metode_Bayar||'').toUpperCase() === 'TUNAI') salesTunai += Number(t.Total_Bayar); });
        (superApp.db.kasKeluar || []).forEach(k => { if(k.ID_Shift === superApp.activeShiftId) totalKasKeluar += Number(k.Nominal); });

        let expected = modal + salesTunai - totalKasKeluar; let selisih = setor - expected;

        superApp.setLoading(true, "Merekap Penjualan Hari Ini...");
        const payload = { action: 'tutup_shift', id_shift: superApp.activeShiftId, setoran_akhir: setor, selisih: selisih };
        let res = await superApp.apiPost(payload);
        
        if(res.status === 'sukses') {
            alert(`SHIFT DITUTUP!\nUang Sistem: Rp ${expected.toLocaleString('id-ID')}\nUang Fisik (Setoran): Rp ${setor.toLocaleString('id-ID')}\nSelisih: Rp ${selisih.toLocaleString('id-ID')}`);
            location.reload(); 
        }
        superApp.setLoading(false);
    },

    // ==========================================
    // 6. POS & MAIN NAVIGATION
    // ==========================================
    refreshData: function() {
        const hSub = document.getElementById('header-subtitle'); if(hSub) hSub.innerText = `${superApp.outlet}`;
        const lOutManage = document.getElementById('label-outlet-manage'); if(lOutManage) lOutManage.innerText = superApp.outlet;
        
        superApp.filteredProducts = [];
        if(superApp.db && superApp.db.masterProduk) {
            superApp.db.masterProduk.forEach(master => {
                if(String(master.Kategori||'').toLowerCase() !== 'bahan' && String(master.Kategori||'').toLowerCase() !== 'pendukung') { 
                    let hargaOutlet = (superApp.db.hargaStokOutlet || []).find(x => x.SKU === master.SKU && x.ID_Outlet === superApp.outlet);
                    let stokReference = master.SKU_Bahan ? master.SKU_Bahan : master.SKU;
                    let stokBahan = (superApp.db.hargaStokOutlet || []).find(x => x.SKU === stokReference && x.ID_Outlet === superApp.outlet);
                    if(hargaOutlet && hargaOutlet.Harga_Jual > 0) {
                        let qtySisa = stokBahan ? stokBahan.Stok_Toko : 0;
                        superApp.filteredProducts.push({ sku: master.SKU, nama: master.Nama_Produk, img: master.Gambar_URL, harga: hargaOutlet.Harga_Jual, maxStok: qtySisa, sku_bahan: master.SKU_Bahan });
                    }
                }
            });
        }
        superApp.filteredProducts.sort((a,b) => String(a.nama||'').localeCompare(String(b.nama||'')));
        
        if(document.getElementById('product-list')) superApp.renderProducts(); 
        if(document.getElementById('report-trx-tbody')) superApp.renderReport(); 
        if(document.getElementById('gudang-tbody-utama')) superApp.renderGudang(); 
        if(document.getElementById('staf-outlet-leaderboard')) superApp.renderStaf(); 
        if(document.getElementById('opname-tbody-utama')) superApp.renderOpname(); 
        if(document.getElementById('audit-opname-tbody')) superApp.renderAudit(); 
        if(document.getElementById('terima-tbody-utama')) superApp.renderTerimaBarang(); 
        if(document.getElementById('ai-insight-cards')) superApp.generateAIReport();
    },
    changeOutlet: function(val) { superApp.outlet = val; superApp.cart = []; superApp.renderCart(); superApp.checkShiftStatus(); superApp.refreshData(); },
    switchMenu: function(menu) {
        document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.nav-btn').forEach(b => { b.classList.remove('nav-active'); b.classList.add('text-slate-500'); });
        
        const activeNav = document.getElementById(`nav-${menu}`); if(activeNav) { activeNav.classList.add('nav-active'); activeNav.classList.remove('text-slate-500'); }
        const activeView = document.getElementById(`view-${menu}`); if(activeView) activeView.classList.remove('hidden');

        const titles = { 'pos': 'Point of Sale', 'opname': 'Opname Fisik Stok', 'terima': 'Penerimaan Barang', 'audit': 'Audit Laporan', 'report': 'Laporan Terpadu', 'ai': 'Asisten AI', 'gudang': 'Gudang Pusat', 'master': 'Master Varian POS', 'outlet': 'Cabang & Harga Khusus', 'staf': 'Kinerja Karyawan' };
        const pageTitle = document.getElementById('page-title'); if(pageTitle) pageTitle.innerText = titles[menu] || 'Aplikasi';
        
        if(window.innerWidth < 1024) superApp.toggleSidebar();
        
        if(menu === 'pos' && !superApp.activeShiftId) superApp.checkShiftStatus();
        if(menu === 'report' && typeof superApp.renderReport === 'function') superApp.renderReport();
        if(menu === 'opname' && typeof superApp.renderOpname === 'function') superApp.renderOpname();
        if(menu === 'audit' && typeof superApp.renderAudit === 'function') superApp.renderAudit();
        if(menu === 'terima' && typeof superApp.renderTerimaBarang === 'function') superApp.renderTerimaBarang();
        if(menu === 'ai' && typeof superApp.generateAIReport === 'function') superApp.generateAIReport();
        if(menu === 'staf' && typeof superApp.renderStaf === 'function') superApp.renderStaf(); 
    },
    filterProducts: function(key) {
        let pList = document.getElementById('product-list');
        if(pList) { if(superApp.isLoadingData) return; pList.innerHTML = superApp.filteredProducts.filter(p => String(p.nama||'').toLowerCase().includes(key.toLowerCase())).map(p => superApp.createProductCard(p)).join(''); }
    },
    renderProducts: function() {
        const list = document.getElementById('product-list'); if(!list) return;
        if(superApp.isLoadingData) { list.innerHTML = Array(8).fill(0).map(() => `<div class="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex flex-col h-40"><div class="skeleton h-24 rounded-xl mb-3 w-full"></div><div class="skeleton h-4 w-3/4 rounded mb-2"></div><div class="skeleton h-4 w-1/2 rounded"></div></div>`).join(''); return; }
        list.innerHTML = superApp.filteredProducts.map(p => superApp.createProductCard(p)).join('');
    },
    createProductCard: function(p) {
        let img = p.img ? `<img src="${p.img}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/150x150/f8fafc/94a3b8?text=Err';" class="w-full h-full object-cover transition duration-300 group-hover:scale-105">` : `<div class="w-full h-full flex items-center justify-center text-2xl text-slate-300 opacity-50"><img src="https://cdn-icons-png.flaticon.com/512/3081/3081308.png" class="w-12 h-12 grayscale opacity-50"></div>`;
        let isHabis = p.maxStok <= 0 ? 'item-empty' : '';
        return `<div onclick="${p.maxStok>0 ? `superApp.addToCart('${p.sku}', '${p.nama}', ${p.harga}, ${p.maxStok}, '${p.sku_bahan||''}', event)` : ''}" class="bg-white border border-slate-100 rounded-[1.5rem] p-3 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col relative group ${isHabis}">
            <span class="absolute top-3 right-3 ${p.maxStok<=0?'bg-red-500':'bg-slate-900/80 backdrop-blur'} text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10 shadow-sm">${p.maxStok<=0?'Habis':`Sisa: ${p.maxStok}`}</span>
            <div class="aspect-square mb-3 overflow-hidden rounded-xl bg-slate-50 relative">${img}</div>
            <h3 class="font-extrabold text-xs text-slate-800 leading-tight mb-1 flex-1">${p.nama}</h3>
            <p class="text-brand-500 font-black text-sm">Rp ${p.harga.toLocaleString('id-ID')}</p>
        </div>`;
    },
    addToCart: function(sku, nama, price, maxStok, skuBahan, event) { 
        let currentStokBahanDiKeranjang = 0; let refBahan = skuBahan || sku;
        superApp.cart.forEach(i => { if((i.sku_bahan || i.sku) === refBahan) currentStokBahanDiKeranjang += i.qty; });
        if(currentStokBahanDiKeranjang >= maxStok) return superApp.showToast(`Stok Habis! Sisa di Toko: ${maxStok - currentStokBahanDiKeranjang}`, 'error');
        
        if(event) {
            const cartIcon = document.getElementById('cart-badge');
            if(cartIcon) {
                const rect = cartIcon.getBoundingClientRect(); const dot = document.createElement('div');
                dot.className = 'fly-dot'; dot.style.left = event.clientX + 'px'; dot.style.top = event.clientY + 'px';
                document.body.appendChild(dot);
                requestAnimationFrame(() => { dot.style.transform = `translate(${rect.left - event.clientX}px, ${rect.top - event.clientY}px) scale(0.5)`; dot.style.opacity = '0'; });
                setTimeout(() => dot.remove(), 500);
            }
        }
        let item = superApp.cart.find(i => i.sku === sku); 
        if(item) item.qty++; else superApp.cart.push({sku, nama, price, qty: 1, sku_bahan: skuBahan, maxStok: maxStok}); 
        superApp.renderCart(); 
        setTimeout(() => { const cont = document.getElementById('cart-container'); if(cont) cont.scrollTop = cont.scrollHeight; }, 50);
    },
    changeQty: function(idx, val) { superApp.cart[idx].qty += val; if(superApp.cart[idx].qty <= 0) superApp.cart.splice(idx, 1); superApp.renderCart(); },
    renderCart: function() {
        const cont = document.getElementById('cart-container'); let total = 0, items = 0, html = ''; if(!cont) return;
        superApp.cart.forEach((i, idx) => {
            total += (i.price * i.qty); items += i.qty;
            let sisaBahanDiKeranjang = 0; let refBahan = i.sku_bahan || i.sku;
            superApp.cart.forEach(c => { if((c.sku_bahan || c.sku) === refBahan) sisaBahanDiKeranjang += c.qty; });
            let stokTersisaVisual = i.maxStok - sisaBahanDiKeranjang;

            html += `<div class="flex bg-white border border-slate-100 p-3 rounded-[1rem] shadow-sm items-center gap-2 text-slate-800 transition transform hover:-translate-x-1"><div class="flex-1 min-w-0"><h4 class="font-bold text-xs truncate text-slate-700">${i.nama}</h4><p class="text-[10px] text-slate-400 mb-1">Sisa Stok: <span class="font-bold ${stokTersisaVisual<=0?'text-red-500':'text-brand-500'}">${stokTersisaVisual}</span></p><p class="text-brand-500 font-black text-sm">Rp ${(i.price * i.qty).toLocaleString('id-ID')}</p></div><div class="flex bg-slate-50 rounded-lg border border-slate-200 shadow-inner"><button onclick="superApp.changeQty(${idx}, -1)" class="w-8 h-8 font-bold hover:text-brand-500 hover:bg-slate-100 rounded-l-lg transition">-</button><span class="w-8 text-center text-xs font-black flex items-center justify-center">${i.qty}</span><button onclick="superApp.changeQty(${idx}, 1)" class="w-8 h-8 font-bold hover:text-brand-500 hover:bg-slate-100 rounded-r-lg transition">+</button></div></div>`;
        });
        cont.innerHTML = superApp.cart.length ? html : superApp.getEmptyState('fa-basket-shopping', 'Keranjang Kosong', 'Yuk, tambahkan pesanan!');
        
        const totalEl = document.getElementById('total-price'); if(totalEl) totalEl.innerText = `Rp ${total.toLocaleString('id-ID')}`; 
        const badge = document.getElementById('cart-badge'); if(badge) badge.innerText = `${items} Item`; 
        superApp.payTotal = total; superApp.syncStorage(); 
    },
    openPaymentModal: function() {
        if (superApp.cart.length === 0) return superApp.showToast("Pilih produk dahulu!", "error");
        const pt = document.getElementById('pay-total'); if(pt) pt.innerText = `Rp ${superApp.payTotal.toLocaleString('id-ID')}`;
        superApp.setPaymentMethod('Tunai'); superApp.setCash(''); 
        const mp = document.getElementById('modal-payment'); const mpc = document.getElementById('modal-payment-content');
        if(mp && mpc) { mp.classList.remove('hidden'); setTimeout(() => { mpc.classList.add('modal-enter-active'); }, 100); }
    },
    setPaymentMethod: function(method) {
        superApp.payMethod = method;
        const btnTunai = document.getElementById('btn-pay-tunai'); const btnQris = document.getElementById('btn-pay-qris'); const sectTunai = document.getElementById('tunai-section');
        if(method === 'Tunai') {
            if(btnTunai) btnTunai.className = 'py-3.5 border-2 border-brand-500 bg-brand-50 text-brand-600 rounded-xl font-bold transition';
            if(btnQris) btnQris.className = 'py-3.5 border-2 border-slate-200 bg-white text-slate-500 rounded-xl font-bold transition hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50';
            if(sectTunai) sectTunai.classList.remove('hidden');
        } else {
            if(btnQris) btnQris.className = 'py-3.5 border-2 border-blue-500 bg-blue-50 text-blue-600 rounded-xl font-bold transition';
            if(btnTunai) btnTunai.className = 'py-3.5 border-2 border-slate-200 bg-white text-slate-500 rounded-xl font-bold transition hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50';
            if(sectTunai) sectTunai.classList.add('hidden');
            superApp.setCash('pas'); 
        }
    },
    setCash: function(val) {
        let input = document.getElementById('pay-cash-input');
        if(input) {
            if(val === 'pas') { input.value = superApp.payTotal.toLocaleString('id-ID'); superApp.payCash = superApp.payTotal; } 
            else if(val === 0 || val === '') { input.value = ''; superApp.payCash = 0; } 
            else { input.value = val.toLocaleString('id-ID'); superApp.payCash = val; }
        }
        superApp.calcChange();
    },
    calcChange: function() {
        let input = document.getElementById('pay-cash-input');
        if(input) superApp.payCash = superApp.getNumericValue(input.value); 
        superApp.payChange = superApp.payCash - superApp.payTotal;
        let btn = document.getElementById('btn-execute-pay'), changeEl = document.getElementById('pay-change');
        if(changeEl && btn) {
            if (superApp.payChange < 0) { changeEl.innerText = `Kurang Rp ${Math.abs(superApp.payChange).toLocaleString('id-ID')}`; changeEl.classList.replace('text-slate-800', 'text-red-500'); btn.disabled = true; btn.classList.add('opacity-50', 'cursor-not-allowed'); } 
            else { changeEl.innerText = `Rp ${superApp.payChange.toLocaleString('id-ID')}`; changeEl.classList.replace('text-red-500', 'text-slate-800'); btn.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed'); }
        }
    },
    executeCheckout: async function() {
        if(superApp.isProcessing) return;
        superApp.setLoading(true, "Memproses Transaksi...");
        let trxID = 'TRX' + new Date().getTime();
        const payload = { action: 'checkout', trx_id: trxID, outlet: superApp.outlet, kasir: superApp.currentUser.Username, metode_bayar: superApp.payMethod, total: superApp.payTotal, tunai: superApp.payCash, kembali: superApp.payChange, items: superApp.cart, id_shift: superApp.activeShiftId, tim_operasional: superApp.activeStaffTeam };
        
        let res = await superApp.apiPost(payload);
        if(res.status === 'sukses') {
            superApp.showToast(`Transaksi Sukses!`);
            try { await superApp.printReceipt(res.trx_id, superApp.outlet, superApp.payTotal, superApp.payCash, superApp.payChange, superApp.cart, 'Sukses'); } catch(e) {}
            superApp.syncStorage('paid'); 
            
            if(res.is_offline) {
                let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
                superApp.db.transactions.push({ID_TRX: res.trx_id, Tanggal: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`, Waktu: `${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`, Outlet: superApp.outlet, Kasir: superApp.currentUser.Username, Metode_Bayar: superApp.payMethod, Total_Bayar: superApp.payTotal, Tunai: superApp.payCash, Kembalian: superApp.payChange, Items_JSON: JSON.stringify(superApp.cart), ID_Shift: superApp.activeShiftId, Status: 'Sukses'});
            } else { const refreshRes = await fetch(API_URL, { redirect: 'follow' }); superApp.db = await refreshRes.json(); }
            superApp.refreshData();
        }
        superApp.cart = []; superApp.renderCart(); 
        superApp.closeModal('modal-payment'); superApp.setLoading(false);
    },

    // ==========================================
    // 7. TERIMA BARANG & OPNAME
    // ==========================================
    renderTerimaBarang: function() {
        const lbl = document.getElementById('lbl-terima-outlet'); if(lbl) lbl.innerText = superApp.outlet;
        let htmlUtamaDesk = ''; let htmlPdkDesk = ''; let htmlUtamaMobile = ''; let htmlPdkMobile = '';
        [...(superApp.db.masterProduk || [])].sort((a,b) => String(a.Nama_Produk||'').localeCompare(String(b.Nama_Produk||''))).forEach(m => {
            if(String(m.Kategori||'').toLowerCase() === 'bahan' || String(m.Kategori||'').toLowerCase() === 'pendukung') {
                let strHtml = `<tr class="border-b border-slate-50"><td class="py-3 px-4 min-w-[150px] whitespace-normal text-slate-800">${m.Nama_Produk}<br><span class="text-[10px] text-slate-400 font-normal">${m.SKU}</span></td><td class="py-3 px-4 text-center"><input type="text" id="trm-qty-${m.SKU}" class="w-24 border-2 border-slate-200 rounded-lg px-2 py-1 text-center outline-none focus:border-brand-500 bg-white text-slate-800 font-bold cursor-pointer" readonly onclick="superApp.openVirtualNumpad('trm-qty-${m.SKU}', 'Qty Diterima (Pcs)')" placeholder="0"></td><td class="py-3 px-4"><input type="text" id="trm-note-${m.SKU}" class="w-full border border-slate-200 rounded-lg px-3 py-1 outline-none text-xs text-slate-800" placeholder="Keterangan kurir/kondisi..."></td></tr>`;
                let strMobile = `<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3"><h4 class="font-extrabold text-sm text-slate-800">${m.Nama_Produk}</h4><div class="flex gap-2"><input type="text" id="trm-qty-mob-${m.SKU}" class="w-1/3 border-2 border-slate-200 rounded-xl px-3 py-2 text-center outline-none focus:border-brand-500 bg-white text-slate-800 font-bold text-sm cursor-pointer" readonly onclick="superApp.openVirtualNumpad('trm-qty-mob-${m.SKU}', 'Qty Diterima')" placeholder="Qty"><input type="text" id="trm-note-mob-${m.SKU}" class="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 outline-none text-xs text-slate-800" placeholder="Catatan..."></div></div>`;
                if(String(m.Kategori||'').toLowerCase() === 'bahan') { htmlUtamaDesk += strHtml; htmlUtamaMobile += strMobile; } else { htmlPdkDesk += strHtml; htmlPdkMobile += strMobile; }
            }
        });
        const tU = document.getElementById('terima-tbody-utama'); if(tU) tU.innerHTML = htmlUtamaDesk || `<tr><td colspan="3" class="text-center py-6 h-32">${superApp.getEmptyState('fa-box-open', 'Belum Ada Bahan', 'Tambahkan bahan di menu gudang')}</td></tr>`;
        const tP = document.getElementById('terima-tbody-pendukung'); if(tP) tP.innerHTML = htmlPdkDesk || `<tr><td colspan="3" class="text-center py-6 h-32">${superApp.getEmptyState('fa-box-open', 'Belum Ada Barang', 'Tambahkan pendukung di gudang')}</td></tr>`;
        const tMob = document.getElementById('terima-mobile-cards'); if(tMob) tMob.innerHTML = `<h4 class="font-extrabold text-brand-600 mt-2 mb-2 bg-brand-50 p-3 rounded-xl border border-brand-100 text-sm">A. Bahan Utama</h4>` + (htmlUtamaMobile || '<p class="text-xs text-center">Kosong</p>') + `<h4 class="font-extrabold text-slate-600 mt-6 mb-2 bg-slate-100 p-3 rounded-xl border border-slate-200 text-sm">B. Pendukung & Packaging</h4>` + (htmlPdkMobile || '<p class="text-xs text-center">Kosong</p>');
    },
    submitTerimaBarang: async function() {
        if(superApp.isProcessing) return;
        if(!confirm("Kirim Laporan Barang Datang ke Owner? Stok tidak akan bertambah hingga di-Setujui.")) return;
        superApp.setLoading(true, "Menyimpan...");
        let items = [];
        let waText = `*LAPORAN BARANG DATANG PUSAT*\n📍 Cabang: ${superApp.outlet}\n👤 Kasir: ${superApp.currentUser.Username}\n📅 Waktu: ${new Date().toLocaleString('id-ID')}\n\n*_Mohon cek aplikasi menu Audit untuk memverifikasi agar stok masuk ke sistem_*\n\n`;
        
        (superApp.db.masterProduk || []).forEach(m => {
            if(String(m.Kategori||'').toLowerCase() === 'bahan' || String(m.Kategori||'').toLowerCase() === 'pendukung') {
                let inputDesk = document.getElementById(`trm-qty-${m.SKU}`); let inputMob = document.getElementById(`trm-qty-mob-${m.SKU}`);
                let qtyStr = inputDesk && inputDesk.value !== '' ? inputDesk.value : (inputMob && inputMob.value !== '' ? inputMob.value : '');
                if(qtyStr !== '' && parseInt(qtyStr) > 0) {
                    let noteDesk = document.getElementById(`trm-note-${m.SKU}`); let noteMob = document.getElementById(`trm-note-mob-${m.SKU}`);
                    let note = noteDesk && noteDesk.value !== '' ? noteDesk.value : (noteMob && noteMob.value !== '' ? noteMob.value : '');
                    items.push({ sku: m.SKU, qty: parseInt(qtyStr), catatan: note });
                    waText += `📦 *${m.Nama_Produk}*\nQty Diterima: *${qtyStr} Pcs*\nCatatan: ${note || '-'}\n\n`;
                }
            }
        });
        if(items.length === 0) { superApp.setLoading(false); return superApp.showToast("Tidak ada barang masuk yang diinput!", "error"); }
        
        const payload = { action: 'terima_barang_kasir', outlet: superApp.outlet, kasir: superApp.currentUser.Username, items: items };
        let res = await superApp.apiPost(payload);
        if(res.status === 'sukses') {
            superApp.showToast("Berhasil dilaporkan ke Owner!");
            if(confirm("Apakah Anda ingin meneruskan notifikasi ini via WhatsApp ke Owner sekarang?")) { let waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`; window.open(waUrl, '_blank'); }
            if(!res.is_offline) { const r = await fetch(API_URL, { redirect: 'follow' }); superApp.db = await r.json(); superApp.refreshData(); superApp.switchMenu('pos'); }
        }
        superApp.setLoading(false);
    },
    renderOpname: function() {
        const lbl = document.getElementById('lbl-opname-outlet'); if(lbl) lbl.innerText = superApp.outlet;
        let hu = ''; let hp = ''; let hum = ''; let hpm = '';
        [...(superApp.db.masterProduk || [])].sort((a,b) => String(a.Nama_Produk||'').localeCompare(String(b.Nama_Produk||''))).forEach(m => {
            if(String(m.Kategori||'').toLowerCase() === 'bahan' || String(m.Kategori||'').toLowerCase() === 'pendukung') {
                let sData = (superApp.db.hargaStokOutlet || []).find(x => x.SKU === m.SKU && x.ID_Outlet === superApp.outlet);
                let sys = sData ? Number(sData.Stok_Toko) : 0;
                
                let desk = `<tr class="border-b border-slate-50"><td class="py-3 px-4 min-w-[150px] whitespace-normal text-slate-800">${m.Nama_Produk}<br><span class="text-[10px] text-slate-400 font-normal">${m.SKU}</span></td><td class="py-3 px-4 text-center text-brand-600" id="opn-sys-${m.SKU}">${sys}</td><td class="py-3 px-4 text-center"><input type="text" id="opn-fisik-${m.SKU}" class="w-20 border-2 border-slate-200 rounded-lg px-2 py-1 text-center outline-none focus:border-brand-500 bg-white text-slate-800 cursor-pointer" readonly onclick="superApp.openVirtualNumpad('opn-fisik-${m.SKU}', 'Input Fisik', false)" oninput="superApp.calcOpname('${m.SKU}')" placeholder="0"></td><td class="py-3 px-4 text-right font-black text-slate-300" id="opn-selisih-${m.SKU}">-</td><td class="py-3 px-4"><input type="text" id="opn-note-${m.SKU}" class="w-full border border-slate-200 rounded-lg px-2 py-1 outline-none text-xs text-slate-800" placeholder="Kondisi Fisik..."></td></tr>`;
                let mob = `<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3"><div class="flex justify-between items-start"><div><h4 class="font-extrabold text-sm text-slate-800">${m.Nama_Produk}</h4><p class="text-[10px] text-slate-400">Sys: <span id="opn-sys-mob-${m.SKU}" class="font-bold text-brand-500">${sys}</span></p></div><span class="font-black text-slate-300 text-lg" id="opn-selisih-mob-${m.SKU}">-</span></div><div class="flex gap-2"><input type="text" id="opn-fisik-mob-${m.SKU}" class="w-1/3 border-2 border-slate-200 rounded-xl px-3 py-2 text-center outline-none focus:border-brand-500 bg-white text-slate-800 font-bold text-sm cursor-pointer" readonly onclick="superApp.openVirtualNumpad('opn-fisik-mob-${m.SKU}', 'Input Fisik', false)" oninput="superApp.calcOpnameMob('${m.SKU}')" placeholder="Fisik"><input type="text" id="opn-note-mob-${m.SKU}" class="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 outline-none text-xs text-slate-800" placeholder="Catatan Kondisi..."></div></div>`;

                if (String(m.Kategori||'').toLowerCase() === 'bahan') { hu += desk; hum += mob; } else { hp += desk; hpm += mob; }
            }
        });
        
        const tU = document.getElementById('opname-tbody-utama'); if(tU) tU.innerHTML = hu || superApp.getEmptyState('fa-box-open', 'Belum Ada Bahan', 'Tambahkan bahan di menu gudang');
        const tP = document.getElementById('opname-tbody-pendukung'); if(tP) tP.innerHTML = hp || superApp.getEmptyState('fa-box-open', 'Belum Ada Barang', 'Tambahkan pendukung di gudang');
        const mobCards = document.getElementById('opname-mobile-cards'); if(mobCards) mobCards.innerHTML = `<h4 class="font-extrabold text-brand-600 mt-2 mb-2 bg-brand-50 p-3 rounded-xl border border-brand-100 text-sm">A. Bahan Utama</h4>` + (hum || '<p class="text-xs text-center">Kosong</p>') + `<h4 class="font-extrabold text-slate-600 mt-6 mb-2 bg-slate-100 p-3 rounded-xl border border-slate-200 text-sm">B. Pendukung & Packaging</h4>` + (hpm || '<p class="text-xs text-center">Kosong</p>');
    },
    calcOpname: function(sku) {
        const sysEl = document.getElementById(`opn-sys-${sku}`); let sys = parseInt(sysEl?sysEl.innerText:0) || 0;
        let fisikEl = document.getElementById(`opn-fisik-${sku}`); let fisik = superApp.getNumericValue(fisikEl?fisikEl.value:0);
        let selEl = document.getElementById(`opn-selisih-${sku}`); if(!selEl) return;
        if(isNaN(fisik) || (fisikEl && fisikEl.value === '')) { selEl.innerText = '-'; selEl.className = 'py-3 px-4 text-right font-black text-slate-300'; return; }
        let selisih = fisik - sys; selEl.innerText = selisih > 0 ? `+${selisih}` : selisih;
        if(selisih < 0) selEl.className = 'py-3 px-4 text-right text-red-500 font-black'; else if(selisih > 0) selEl.className = 'py-3 px-4 text-right text-green-500 font-black'; else selEl.className = 'py-3 px-4 text-right text-slate-400 font-black';
    },
    calcOpnameMob: function(sku) {
        const sysEl = document.getElementById(`opn-sys-mob-${sku}`); let sys = parseInt(sysEl?sysEl.innerText:0) || 0;
        let fisikEl = document.getElementById(`opn-fisik-mob-${sku}`); let fisik = superApp.getNumericValue(fisikEl?fisikEl.value:0);
        let selEl = document.getElementById(`opn-selisih-mob-${sku}`); if(!selEl) return;
        if(isNaN(fisik) || (fisikEl && fisikEl.value === '')) { selEl.innerText = '-'; selEl.className = 'font-black text-slate-300 text-lg'; return; }
        let selisih = fisik - sys; selEl.innerText = selisih > 0 ? `+${selisih}` : selisih;
        if(selisih < 0) selEl.className = 'font-black text-red-500 text-lg'; else if(selisih > 0) selEl.className = 'font-black text-green-500 text-lg'; else selEl.className = 'font-black text-slate-400 text-lg';
    },
    submitOpname: async function() {
        if(superApp.isProcessing) return;
        if(!confirm("Kirim Opname ke Owner? Stok fisik akan diverifikasi (Audit) terlebih dahulu sebelum dirubah pada sistem.")) return;
        superApp.setLoading(true, "Menyimpan & Mengirim Audit...");
        let items = [];
        let waText = `*LAPORAN OPNAME FISIK & AUDIT*\n📍 Cabang: ${superApp.outlet}\n👤 Kasir: ${superApp.currentUser.Username}\n📅 Waktu: ${new Date().toLocaleString('id-ID')}\n\n*_Mohon cek aplikasi menu Audit Opname untuk menyetujui_*\n\n`;
        
        (superApp.db.masterProduk || []).forEach(m => {
            if(String(m.Kategori||'').toLowerCase() === 'bahan' || String(m.Kategori||'').toLowerCase() === 'pendukung') {
                let inputDesk = document.getElementById(`opn-fisik-${m.SKU}`); let inputMob = document.getElementById(`opn-fisik-mob-${m.SKU}`);
                let fisikStr = inputDesk && inputDesk.value !== '' ? inputDesk.value : (inputMob && inputMob.value !== '' ? inputMob.value : '');
                
                if(fisikStr !== '') {
                    let sysDesk = document.getElementById(`opn-sys-${m.SKU}`); let sysMob = document.getElementById(`opn-sys-mob-${m.SKU}`);
                    let sys = parseInt(sysDesk ? sysDesk.innerText : (sysMob ? sysMob.innerText : 0)) || 0;
                    let fisik = superApp.getNumericValue(fisikStr);
                    let noteDesk = document.getElementById(`opn-note-${m.SKU}`); let noteMob = document.getElementById(`opn-note-mob-${m.SKU}`);
                    let note = noteDesk && noteDesk.value !== '' ? noteDesk.value : (noteMob && noteMob.value !== '' ? noteMob.value : '');
                    
                    items.push({ sku: m.SKU, sistem: sys, fisik: fisik, selisih: fisik - sys, catatan: note });
                    let itemName = m.Nama_Produk || 'Unknown';
                    waText += `🔹 *${itemName}*\nSys: ${sys} | Fisik: ${fisik} | Selisih: *${fisik - sys}*\nCatatan: ${note || '-'}\n\n`;
                }
            }
        });
        if(items.length === 0) { superApp.setLoading(false); return superApp.showToast("Tidak ada stok yang dihitung!", "error"); }
        
        const payload = { action: 'submit_opname', outlet: superApp.outlet, kasir: superApp.currentUser.Username, items: items };
        let res = await superApp.apiPost(payload);
        if(res.status === 'sukses') {
            superApp.showToast("Opname terkirim untuk di Audit Owner!");
            if(confirm("Apakah Anda ingin meneruskan laporan rincian ini via WhatsApp ke Owner sekarang?")) { let waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`; window.open(waUrl, '_blank'); }
            if(!res.is_offline) { const r = await fetch(API_URL, { redirect: 'follow' }); superApp.db = await r.json(); superApp.refreshData(); superApp.switchMenu('pos'); }
        }
        superApp.setLoading(false);
    },

    // ==========================================
    // 8. AUDIT DENGAN BULK APPROVAL (OWNER)
    // ==========================================
    toggleAuditTab: function(tab) {
        const co = document.getElementById('audit-content-opname'); if(co) co.classList.add('hidden'); 
        const ct = document.getElementById('audit-content-terima'); if(ct) ct.classList.add('hidden');
        const to = document.getElementById('tab-audit-opname'); if(to) to.className = 'px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold whitespace-nowrap transition border border-transparent';
        const tt = document.getElementById('tab-audit-terima'); if(tt) tt.className = 'px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold whitespace-nowrap transition border border-transparent';
        const vContent = document.getElementById(`audit-content-${tab}`); if(vContent) vContent.classList.remove('hidden'); 
        const vBtn = document.getElementById(`tab-audit-${tab}`); if(vBtn) vBtn.className = 'px-5 py-2.5 bg-white text-slate-800 rounded-lg text-sm font-bold shadow-sm whitespace-nowrap transition border border-slate-200';
    },
    renderAudit: function() {
        const tbodyOp = document.getElementById('audit-opname-tbody'); 
        if(tbodyOp) {
            let html = '';
            (superApp.db.opname || []).forEach(op => {
                if(op.Status_Approval === 'Pending') {
                    let itemName = superApp.db.masterProduk.find(m => m.SKU === op.SKU)?.Nama_Produk || op.SKU || 'Unknown';
                    let selColor = op.Selisih < 0 ? 'text-red-500' : (op.Selisih > 0 ? 'text-green-500' : 'text-slate-500');
                    let wStr = superApp.cleanDateOnly(op.Waktu) + ' ' + superApp.cleanTimeOnly(op.Waktu);

                    html += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-3 px-4 w-10"><input type="checkbox" class="cb-audit-opname w-5 h-5 rounded cursor-pointer accent-brand-500" value="${op.Waktu}|${op.SKU}|${op.Outlet}|${op.Stok_Fisik}" onchange="superApp.checkBulkAudit()"></td><td class="py-3 px-4 text-xs whitespace-nowrap">${wStr}</td><td class="py-3 px-4 text-xs whitespace-nowrap">${op.Outlet}<br><span class="text-brand-500">${op.Kasir}</span></td><td class="py-3 px-4 text-xs font-bold whitespace-normal min-w-[150px]">${itemName}</td><td class="py-3 px-4 text-center text-xs whitespace-nowrap">Sys: ${op.Stok_Sistem} <i class="fas fa-arrow-right mx-1 text-slate-300"></i> Fisik: ${op.Stok_Fisik}</td><td class="py-3 px-4 text-right font-black ${selColor}">${op.Selisih > 0 ? '+'+op.Selisih : op.Selisih}</td><td class="py-3 px-4 text-xs italic whitespace-normal min-w-[150px]">${op.Keterangan_Fisik || '-'}</td><td class="py-3 px-4 text-center whitespace-nowrap"><button onclick="superApp.processApproval('${op.Waktu}', '${op.SKU}', '${op.Outlet}', ${op.Stok_Fisik}, 'Disetujui', 'opname')" class="bg-green-100 text-green-600 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-green-200 mr-1 transition"><i class="fas fa-check"></i></button><button onclick="superApp.processApproval('${op.Waktu}', '${op.SKU}', '${op.Outlet}', ${op.Stok_Fisik}, 'Ditolak', 'opname')" class="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-red-200 transition"><i class="fas fa-times"></i></button></td></tr>`;
                }
            });
            tbodyOp.innerHTML = html || `<tr><td colspan="8" class="text-center py-6 h-32">${superApp.getEmptyState('fa-clipboard-check', 'Audit Bersih', 'Tidak ada laporan opname yang pending')}</td></tr>`;
        }
        
        const tbodyTr = document.getElementById('audit-terima-tbody');
        if(tbodyTr) {
            let html = '';
            (superApp.db.mutasi || []).forEach(mt => {
                if(mt.Status_Approval === 'Pending') {
                    let itemName = superApp.db.masterProduk.find(m => m.SKU === mt.SKU)?.Nama_Produk || mt.SKU || 'Unknown';
                    let safeWaktu = String(mt.Waktu||''); let wStr = safeWaktu.includes('T') ? superApp.cleanDateOnly(safeWaktu) + ' ' + superApp.cleanTimeOnly(safeWaktu) : safeWaktu;

                    html += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-3 px-4 w-10"><input type="checkbox" class="cb-audit-terima w-5 h-5 rounded cursor-pointer accent-brand-500" value="${mt.ID_Mutasi}" onchange="superApp.checkBulkAudit()"></td><td class="py-3 px-4 text-xs whitespace-nowrap">${wStr}</td><td class="py-3 px-4 text-xs whitespace-nowrap">${mt.Outlet_Tujuan}<br><span class="text-brand-500">${mt.Kasir || '-'}</span></td><td class="py-3 px-4 text-xs font-bold whitespace-normal min-w-[150px]">${itemName}</td><td class="py-3 px-4 text-center text-sm font-black text-brand-500 whitespace-nowrap">${mt.Qty} Pcs</td><td class="py-3 px-4 text-xs italic whitespace-normal min-w-[150px]">${mt.Keterangan || '-'}</td><td class="py-3 px-4 text-center whitespace-nowrap"><button onclick="superApp.processApproval('${mt.ID_Mutasi}', '', '', 0, 'Disetujui', 'terima')" class="bg-green-100 text-green-600 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-green-200 mr-1 transition"><i class="fas fa-check"></i></button><button onclick="superApp.processApproval('${mt.ID_Mutasi}', '', '', 0, 'Ditolak', 'terima')" class="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-red-200 transition"><i class="fas fa-times"></i></button></td></tr>`;
                }
            });
            tbodyTr.innerHTML = html || `<tr><td colspan="7" class="text-center py-6 h-32">${superApp.getEmptyState('fa-box-open', 'Audit Bersih', 'Tidak ada penerimaan barang yang pending')}</td></tr>`;
        }
        superApp.checkBulkAudit();
    },
    toggleAllAuditCb: function(type, isChecked) {
        let cbs = document.querySelectorAll(`.cb-audit-${type}`);
        cbs.forEach(cb => cb.checked = isChecked);
        superApp.checkBulkAudit();
    },
    checkBulkAudit: function() {
        let opChecked = document.querySelectorAll('.cb-audit-opname:checked').length;
        let trChecked = document.querySelectorAll('.cb-audit-terima:checked').length;
        let bar = document.getElementById('bulk-action-bar');
        if(bar) {
            if(opChecked > 0 || trChecked > 0) bar.classList.remove('hidden');
            else bar.classList.add('hidden');
        }
    },
    processBulkApproval: async function(status) {
        if(superApp.isProcessing) return;
        let opCbs = document.querySelectorAll('.cb-audit-opname:checked');
        let trCbs = document.querySelectorAll('.cb-audit-terima:checked');
        if(opCbs.length === 0 && trCbs.length === 0) return superApp.showToast("Tidak ada data dipilih", "warning");

        if(!confirm(`Yakin ingin memproses (${status}) ${opCbs.length + trCbs.length} laporan sekaligus?`)) return;
        superApp.setLoading(true, `Memproses Masal (${status})...`);

        try {
            if(opCbs.length > 0) {
                let items = Array.from(opCbs).map(cb => { let p = cb.value.split('|'); return { waktu: p[0], sku: p[1], outlet: p[2], fisik: parseInt(p[3]) }; });
                await fetch(API_URL, { method: 'POST', headers: {'Content-Type':'text/plain'}, body: JSON.stringify({ action: 'bulk_approve_opname', items: items, status_app: status }) });
            }
            if(trCbs.length > 0) {
                let items = Array.from(trCbs).map(cb => cb.value);
                await fetch(API_URL, { method: 'POST', headers: {'Content-Type':'text/plain'}, body: JSON.stringify({ action: 'bulk_approve_mutasi', items: items, status_app: status }) });
            }
            superApp.showToast(`Proses Masal Selesai!`);
            const res = await fetch(API_URL, { redirect: 'follow' }); superApp.db = await res.json(); superApp.refreshData();
        } catch(e) { superApp.showToast("Gagal memproses", "error"); }
        superApp.setLoading(false);
    },
    processApproval: async function(id1, sku, outlet, fisik, status, type) {
        if(superApp.isProcessing) return;
        if(!confirm(`Anda yakin ingin ${status} laporan ini?`)) return;
        superApp.setLoading(true, "Memproses Audit...");
        try {
            if(type === 'opname') { await fetch(API_URL, { method: 'POST', headers: {'Content-Type':'text/plain'}, body: JSON.stringify({ action: 'approve_opname', waktu: id1, sku: sku, outlet: outlet, fisik: fisik, status_app: status }) }); } 
            else if (type === 'terima') { await fetch(API_URL, { method: 'POST', headers: {'Content-Type':'text/plain'}, body: JSON.stringify({ action: 'approve_mutasi', id_mutasi: id1, status_app: status }) }); }
            superApp.showToast(`Laporan ${status}!`);
            const res = await fetch(API_URL, { redirect: 'follow' }); superApp.db = await res.json(); superApp.refreshData();
        } catch(e) { superApp.showToast("Gagal memproses", "error"); }
        superApp.setLoading(false);
    },

    // ==========================================
    // 9. TRANSFER OWNER
    // ==========================================
    openTransferModalOwner: function() {
        let outletOpts = ''; (superApp.db.outlets || []).forEach(o => { outletOpts += `<option value="${o.ID_Outlet}">${o.Nama_Outlet}</option>`; });
        let opt = ''; 
        [...(superApp.db.masterProduk || [])].sort((a,b) => String(a.Nama_Produk||'').localeCompare(String(b.Nama_Produk||''))).forEach(m => {
            if(String(m.Kategori||'').toLowerCase()==='bahan' || String(m.Kategori||'').toLowerCase()==='pendukung') { opt += `<option value="${m.SKU}">${m.Nama_Produk}</option>`; }
        });

        let inputs = `
            <div><label class="text-xs font-bold text-slate-500 block mb-1">Toko Asal (Sumber)</label><select id="frm-trf-out-asal" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold outline-none text-sm bg-white text-slate-800 transition focus:border-brand-500" onchange="superApp.updateTransferStokInfo()">${outletOpts}</select></div>
            <div><label class="text-xs font-bold text-slate-500 block mb-1">Barang yang Ditransfer</label><select id="frm-trf-sku" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold outline-none text-sm bg-white text-slate-800 transition focus:border-brand-500" onchange="superApp.updateTransferStokInfo()">${opt}</select></div>
            <div class="bg-blue-50 text-blue-600 p-4 rounded-2xl text-sm font-bold mb-2 hidden shadow-inner border border-blue-100 flex items-center justify-between" id="trf-stok-info-box"><span><i class="fas fa-box-open mr-2"></i> Stok Tersedia</span> <span id="trf-stok-info" class="text-xl font-black">0</span></div>
            <div><label class="text-xs font-bold text-slate-500 block mb-1">Toko Tujuan</label><select id="frm-trf-out-tujuan" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold outline-none text-sm bg-white text-slate-800 transition focus:border-brand-500">${outletOpts}</select></div>
            ${superApp.makeInput('Jumlah Kirim (Pcs)', 'trf-qty', '', 'text', '', false, 'superApp.formatRupiahInput(this)')}
        `;
        superApp.buildForm("Transfer Stok Antar Toko", inputs, "superApp.executeTransferOwner()");
        setTimeout(() => {
            let trfInput = document.getElementById('frm-trf-qty');
            if(trfInput) {
                trfInput.setAttribute('readonly', 'readonly');
                trfInput.classList.add('cursor-pointer');
                trfInput.onclick = () => superApp.openVirtualNumpad('frm-trf-qty', 'Jumlah Kirim', false);
            }
            superApp.updateTransferStokInfo();
        }, 100);
    },
    updateTransferStokInfo: function() {
        const asal = document.getElementById('frm-trf-out-asal'); const sku = document.getElementById('frm-trf-sku');
        const info = document.getElementById('trf-stok-info'); const box = document.getElementById('trf-stok-info-box');
        if(asal && sku && info && box) {
            let sData = (superApp.db.hargaStokOutlet || []).find(x => x.SKU === sku.value && x.ID_Outlet === asal.value);
            let sisa = sData ? Number(sData.Stok_Toko) : 0;
            info.innerText = sisa; box.classList.remove('hidden');
        }
    },
    executeTransferOwner: async function() {
        if(superApp.isProcessing) return;
        const elAsal = document.getElementById('frm-trf-out-asal'); const elSku = document.getElementById('frm-trf-sku'); 
        const elQty = document.getElementById('frm-trf-qty'); const elTujuan = document.getElementById('frm-trf-out-tujuan');

        if(!elSku || !elQty || !elTujuan) return;
        let sku = elSku.value; let qty = superApp.getNumericValue(elQty.value); let targetOutlet = elTujuan.value; let asalOutlet = elAsal ? elAsal.value : superApp.outlet; 
        
        if(asalOutlet === targetOutlet) return superApp.showToast("Toko asal dan tujuan tidak boleh sama", "error");
        if(!qty || parseInt(qty) <= 0) return superApp.showToast("Qty tidak valid", "error"); 
        
        let sData = (superApp.db.hargaStokOutlet || []).find(x => x.SKU === sku && x.ID_Outlet === asalOutlet);
        let sisa = sData ? Number(sData.Stok_Toko) : 0;
        if(parseInt(qty) > sisa) return superApp.showToast(`Qty melebihi sisa fisik di ${asalOutlet}!`, "error");

        if(!confirm(`Kirim barang ini dari ${asalOutlet} ke ${targetOutlet}? Stok ${asalOutlet} akan langsung terpotong.`)) return;

        superApp.setLoading(true, "Memproses Transfer...");
        const payload = { action: 'transfer_stok', sku: sku, outlet_asal: asalOutlet, outlet_tujuan: targetOutlet, qty: parseInt(qty), kasir: superApp.currentUser.Username };
        let res = await superApp.apiPost(payload);
        
        if(res.status === 'sukses') {
            superApp.closeModal('modal-form'); superApp.showToast("Transfer dikirim! Menunggu Penerimaan di toko tujuan.");
            if(!res.is_offline) { const r = await fetch(API_URL, { redirect: 'follow' }); superApp.db = await r.json(); }
            superApp.refreshData(); 
        } else { superApp.setLoading(false); }
    },

    // ==========================================
    // 10. REPORT & ANALYTICS
    // ==========================================
    toggleReportTab: function(tab) {
        const rt = document.getElementById('report-content-trx'); if(rt) rt.classList.add('hidden'); 
        const rr = document.getElementById('report-content-rekap'); if(rr) rr.classList.add('hidden');
        const rk = document.getElementById('report-content-kas'); if(rk) rk.classList.add('hidden');
        const rs = document.getElementById('report-content-selisih'); if(rs) rs.classList.add('hidden');
        
        const tt = document.getElementById('tab-trx'); if(tt) tt.className = 'px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold whitespace-nowrap transition border border-transparent';
        const tr = document.getElementById('tab-rekap'); if(tr) tr.className = 'px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold whitespace-nowrap transition border border-transparent';
        const tk = document.getElementById('tab-kas'); if(tk) tk.className = 'px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold whitespace-nowrap transition border border-transparent';
        const ts = document.getElementById('tab-selisih'); if(ts) ts.className = 'px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold whitespace-nowrap transition border border-transparent';
        
        const rct = document.getElementById(`report-content-${tab}`); if(rct) rct.classList.remove('hidden'); 
        const tbtn = document.getElementById(`tab-${tab}`); if(tbtn) tbtn.className = 'px-5 py-2.5 bg-white text-slate-800 rounded-lg text-sm font-bold shadow-sm whitespace-nowrap transition border border-slate-200';
    },
    renderReport: function() {
        const rof = document.getElementById('report-outlet-filter');
        let filterVal = rof ? rof.value : superApp.outlet;
        if(superApp.currentUser && String(superApp.currentUser.Role).toLowerCase().includes('admin') && rof) { filterVal = rof.value; } else { filterVal = superApp.outlet; }
        
        let dStartEl = document.getElementById('filter-start'); let dEndEl = document.getElementById('filter-end');
        let dStart = dStartEl ? dStartEl.value : ''; let dEnd = dEndEl ? dEndEl.value : '';
        let dateStart = dStart ? new Date(dStart + "T00:00:00") : new Date(0);
        let dateEnd = dEnd ? new Date(dEnd + "T23:59:59") : new Date(8640000000000000);
        
        let searchTrxEl = document.getElementById('filter-search-trx');
        let searchTrx = searchTrxEl ? String(searchTrxEl.value||'').toLowerCase() : '';

        const rdl = document.getElementById('report-date-label'); if(rdl) rdl.innerText = new Date().toLocaleString('id-ID');
        const rtl = document.getElementById('report-title-label'); if(rtl) rtl.innerText = `Filter Outlet: ${filterVal} ${dStart ? `| Tgl: ${dStart} s/d ${dEnd}` : ''}`;

        let totalRev = 0, totalTunai = 0, totalQris = 0, countTrx = 0, totalKas = 0, trxHtml = ''; let productSales = {};
        
        [...(superApp.db.transactions || [])].reverse().forEach((t, i) => {
            let trxDate = superApp.parseDateId(t.Tanggal);
            if((filterVal === 'Semua' || t.Outlet === filterVal) && trxDate >= dateStart && trxDate <= dateEnd) {
                
                let safeID = String(t.ID_TRX || '');
                if(searchTrx && !safeID.toLowerCase().includes(searchTrx)) return;

                if (t.Status === 'Sukses') { 
                    totalRev += Number(t.Total_Bayar) || 0; countTrx++;
                    if(String(t.Metode_Bayar||'').toUpperCase() === 'QRIS') totalQris += Number(t.Total_Bayar) || 0; else totalTunai += Number(t.Total_Bayar) || 0;
                }
                let statBadge = t.Status === 'Sukses' ? `<span class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold">Sukses</span>` : `<span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold">Batal</span>`;
                let isCoret = t.Status === 'Sukses' ? 'text-brand-500' : 'text-slate-400 line-through';
                let rowBg = t.Status === 'Sukses' ? 'border-b border-slate-50 hover:bg-slate-50' : 'row-void';
                
                let cleanDate = superApp.cleanDateOnly(t.Tanggal);
                let cleanTime = superApp.cleanTimeOnly(t.Waktu);

                if(i < 500) {
                    trxHtml += `<tr class="${rowBg} transition"><td class="py-4 px-5 whitespace-nowrap text-xs"><div class="font-black text-slate-700">${safeID || 'N/A'}</div><div class="text-[10px] text-slate-400 mt-0.5">${cleanDate} ${cleanTime}</div></td><td class="py-4 px-5 whitespace-nowrap text-xs text-slate-700 font-bold">${t.Kasir || t.Outlet}</td><td class="py-4 px-5 whitespace-nowrap text-xs font-black uppercase text-blue-500">${t.Metode_Bayar||'Tunai'}</td><td class="py-4 px-5 whitespace-nowrap">${statBadge}</td><td class="py-4 px-5 whitespace-nowrap text-right font-black ${isCoret}">Rp ${(Number(t.Total_Bayar)||0).toLocaleString('id-ID')}</td><td class="py-4 px-5 whitespace-nowrap text-center" data-html2canvas-ignore="true"><button onclick="superApp.openDetailTrx('${safeID}')" class="bg-white border border-slate-200 hover:border-slate-400 text-slate-600 text-[10px] font-bold px-4 py-2 rounded-lg shadow-sm transition"><i class="fas fa-eye mr-1"></i> Detail</button></td></tr>`;
                }
                if (t.Status === 'Sukses') {
                    let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
                    items.forEach(item => {
                        let safeNama = item.nama || 'Unknown';
                        if(!productSales[safeNama]) productSales[safeNama] = { qty: 0, rev: 0 };
                        productSales[safeNama].qty += Number(item.qty) || 0;
                        productSales[safeNama].rev += (Number(item.price)||0) * (Number(item.qty)||0);
                    });
                }
            }
        });
        const rtt = document.getElementById('rep-total-trx'); if(rtt) rtt.innerText = countTrx; 
        const rtrT = document.getElementById('rep-total-tunai'); if(rtrT) rtrT.innerText = `Rp ${totalTunai.toLocaleString('id-ID')}`;
        const rtrQ = document.getElementById('rep-total-qris'); if(rtrQ) rtrQ.innerText = `Rp ${totalQris.toLocaleString('id-ID')}`;
        const rtb = document.getElementById('report-trx-tbody'); if(rtb) rtb.innerHTML = trxHtml || `<tr><td colspan="6" class="text-center py-12 h-32">${superApp.getEmptyState('fa-file-invoice', 'Tidak Ada Transaksi', 'Belum ada transaksi di rentang tanggal/resi ini')}</td></tr>`;

        let rekapHtml = '';
        for (const [nama, data] of Object.entries(productSales)) { rekapHtml += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-4 px-5 whitespace-normal min-w-[150px] text-slate-700 font-bold">${nama}</td><td class="py-4 px-5 whitespace-nowrap text-center font-black text-slate-700 bg-slate-50/50">${data.qty} Pcs</td><td class="py-4 px-5 whitespace-nowrap text-right font-black text-green-600">Rp ${data.rev.toLocaleString('id-ID')}</td></tr>`; }
        const rreb = document.getElementById('report-rekap-tbody'); if(rreb) rreb.innerHTML = rekapHtml || `<tr><td colspan="3" class="text-center py-12 h-32">${superApp.getEmptyState('fa-box-open', 'Belum Ada Penjualan', 'Data rekapitulasi kosong')}</td></tr>`;
        
        let mutasiHtml = '';
        [...(superApp.db.mutasi || [])].reverse().forEach((m, i) => {
            let safeWaktu = String(m.Waktu || '');
            let mDate = superApp.parseDateId(safeWaktu.split(' ')[0]);
            if((filterVal === 'Semua' || m.Outlet_Tujuan === filterVal) && mDate >= dateStart && mDate <= dateEnd) {
                let mWaktuStr = safeWaktu.includes('T') ? superApp.cleanDateOnly(safeWaktu) + ' ' + superApp.cleanTimeOnly(safeWaktu) : safeWaktu;
                if(i < 100) mutasiHtml += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-4 px-5 whitespace-nowrap text-xs text-slate-500">${mWaktuStr}</td><td class="py-4 px-5 whitespace-nowrap text-slate-700 font-bold">${m.SKU || '-'}</td><td class="py-4 px-5 whitespace-nowrap font-bold text-brand-600"><i class="fas fa-location-dot mr-1"></i>${m.Outlet_Tujuan || '-'}</td><td class="py-4 px-5 whitespace-nowrap text-right font-black bg-blue-50/30 text-blue-700">${m.Qty || 0} Pcs</td><td class="py-4 px-5 whitespace-normal min-w-[150px] text-xs italic text-slate-500">${m.Keterangan || '-'}</td></tr>`;
            }
        });
        const rmb = document.getElementById('report-mutasi-tbody'); if(rmb) rmb.innerHTML = mutasiHtml || `<tr><td colspan="5" class="text-center py-12 h-32">${superApp.getEmptyState('fa-truck', 'Belum Ada Mutasi', 'Tidak ada data distribusi di rentang ini')}</td></tr>`;

        let kasHtml = '';
        [...(superApp.db.kasKeluar || [])].reverse().forEach((k, i) => {
            let kDate = superApp.parseDateId(k.Tanggal);
            if((filterVal === 'Semua' || k.Outlet === filterVal) && kDate >= dateStart && kDate <= dateEnd) {
                totalKas += Number(k.Nominal) || 0;
                let kDateStr = superApp.cleanDateOnly(k.Tanggal);
                let kTimeStr = superApp.cleanTimeOnly(k.Waktu);
                if(i < 100) kasHtml += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-4 px-5 whitespace-nowrap text-xs text-slate-500">${kDateStr} ${kTimeStr}</td><td class="py-4 px-5 whitespace-nowrap font-bold text-slate-700">${k.Outlet} <span class="text-xs text-slate-400">(${k.Kasir})</span></td><td class="py-4 px-5 whitespace-normal min-w-[150px] font-medium text-slate-600">${k.Keterangan}</td><td class="py-4 px-5 whitespace-nowrap text-right font-black text-red-500 bg-red-50/30">- Rp ${(Number(k.Nominal)||0).toLocaleString('id-ID')}</td></tr>`;
            }
        });
        const repKas = document.getElementById('rep-total-kas'); if(repKas) repKas.innerText = `Rp ${totalKas.toLocaleString('id-ID')}`;
        const kBody = document.getElementById('report-kas-tbody'); if(kBody) kBody.innerHTML = kasHtml || `<tr><td colspan="4" class="text-center py-12 h-32">${superApp.getEmptyState('fa-wallet', 'Tidak Ada Kas Keluar', 'Belum ada pengeluaran dicatat')}</td></tr>`;
        
        let selisihHtml = '';
        [...(superApp.db.opname || [])].reverse().forEach((op, i) => {
            let safeWaktu = String(op.Waktu || '');
            let opDate = superApp.parseDateId(safeWaktu.split(' ')[0]);
            if((filterVal === 'Semua' || op.Outlet === filterVal) && opDate >= dateStart && opDate <= dateEnd) {
                let itemName = superApp.db.masterProduk.find(m => m.SKU === op.SKU)?.Nama_Produk || op.SKU || 'Unknown';
                let selColor = op.Selisih < 0 ? 'text-red-500' : (op.Selisih > 0 ? 'text-green-500' : 'text-slate-500');
                let badge = '';
                if(op.Status_Approval === 'Pending') badge = '<span class="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-[10px] font-bold"><i class="fas fa-clock mr-1"></i>Pending</span>';
                else if(op.Status_Approval === 'Disetujui') badge = '<span class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold"><i class="fas fa-check mr-1"></i>Disetujui</span>';
                else badge = '<span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold"><i class="fas fa-times mr-1"></i>Ditolak</span>';
                
                let opWaktuStr = safeWaktu.includes('T') ? superApp.cleanDateOnly(safeWaktu) + ' ' + superApp.cleanTimeOnly(safeWaktu) : safeWaktu;

                if(i < 500) {
                    selisihHtml += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-4 px-5 whitespace-nowrap text-xs text-slate-500">${opWaktuStr}</td><td class="py-4 px-5 whitespace-normal min-w-[150px] font-bold text-slate-700">${itemName}</td><td class="py-4 px-5 whitespace-nowrap text-xs font-bold">${op.Outlet} <span class="text-slate-400">(${op.Kasir})</span></td><td class="py-4 px-5 whitespace-nowrap text-center text-xs font-medium text-slate-500 bg-slate-50/50 rounded-lg">Sys: ${op.Stok_Sistem} <i class="fas fa-arrow-right mx-2 text-slate-300"></i> Fis: ${op.Stok_Fisik}</td><td class="py-4 px-5 whitespace-nowrap text-right font-black ${selColor} text-lg">${op.Selisih > 0 ? '+'+op.Selisih : op.Selisih}</td><td class="py-4 px-5 whitespace-nowrap text-center">${badge}</td></tr>`;
                }
            }
        });
        const rsTbody = document.getElementById('report-selisih-tbody'); if(rsTbody) rsTbody.innerHTML = selisihHtml || `<tr><td colspan="6" class="text-center py-12 h-32">${superApp.getEmptyState('fa-clipboard-check', 'Audit Selisih Kosong', 'Tidak ada histori opname disini')}</td></tr>`;
    },
    exportPDF: function() {
        superApp.showToast("Mempersiapkan PDF Laporan...");
        const element = document.getElementById('pdf-export-area'); if(!element) return;
        element.classList.add('pdf-container'); 
        
        const rct = document.getElementById('report-content-trx'); if(rct) rct.classList.remove('hidden'); 
        const rcr = document.getElementById('report-content-rekap'); if(rcr) rcr.classList.remove('hidden');
        const rck = document.getElementById('report-content-kas'); if(rck) rck.classList.remove('hidden');
        const rcs = document.getElementById('report-content-selisih'); if(rcs) rcs.classList.remove('hidden');
        
        const opt = { margin: 0.3, filename: `Laporan_ERP_${new Date().getTime()}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
        html2pdf().set(opt).from(element).save().then(()=> { 
            element.classList.remove('pdf-container'); superApp.toggleReportTab('trx'); superApp.showToast("PDF Diunduh!"); 
        });
    },
    openDetailTrx: function(trxId) {
        let trx = (superApp.db.transactions || []).find(x => x.ID_TRX === trxId); if(!trx) return;
        superApp.activeReprintTrx = trx; let items = []; try { items = JSON.parse(trx.Items_JSON || '[]'); } catch(e){}
        let statText = trx.Status === 'Sukses' ? '' : '\n*** DIBATALKAN ***\n';
        
        let cleanDate = superApp.cleanDateOnly(trx.Tanggal);
        let cleanTime = superApp.cleanTimeOnly(trx.Waktu);

        let strukHtml = `<div class="text-center font-bold mb-4 text-slate-800 border-b-2 border-slate-800 pb-2">=== Ai-Snack ===\nCabang: ${trx.Outlet}\nNo. Resi: ${trx.ID_TRX}\n${cleanDate} ${cleanTime}${statText}</div>`;
        items.forEach(i => { strukHtml += `<div class="mb-2 text-slate-800 font-bold">${i.nama}\n<div class="flex justify-between font-normal text-slate-600"><span>${i.qty} x Rp ${Number(i.price).toLocaleString('id-ID')}</span><span class="font-bold text-slate-800">Rp ${(i.price * i.qty).toLocaleString('id-ID')}</span></div></div>`; });
        strukHtml += `<div class="border-t-2 border-slate-800 mt-4 pt-2 flex justify-between font-black text-slate-800 text-lg"><span>TOTAL</span><span>Rp ${Number(trx.Total_Bayar).toLocaleString('id-ID')}</span></div>`;
        let tunaiVal = trx.Tunai !== undefined ? trx.Tunai : (trx.Dibayar || 0);
        strukHtml += `<div class="flex justify-between text-slate-600 font-bold mt-2"><span>${trx.Metode_Bayar||'TUNAI'}</span><span>Rp ${Number(tunaiVal).toLocaleString('id-ID')}</span></div><div class="flex justify-between text-slate-600 font-bold"><span>KEMBALI</span><span>Rp ${Number(trx.Kembalian).toLocaleString('id-ID')}</span></div>`;
        
        const dsb = document.getElementById('detail-struk-body'); if(dsb) dsb.innerHTML = strukHtml;
        let btnVoid = document.getElementById('btn-void-trx');
        if(btnVoid) { if(trx.Status === 'Sukses') { btnVoid.classList.remove('hidden'); } else { btnVoid.classList.add('hidden'); } }
        const md = document.getElementById('modal-detail'); const mdc = document.getElementById('modal-detail-content');
        if(md && mdc) { md.classList.remove('hidden'); setTimeout(() => mdc.classList.add('modal-enter-active'), 10); }
    },
    executeReprint: async function() {
        if(!superApp.activeReprintTrx) return; let t = superApp.activeReprintTrx; let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
        let tunaiVal = t.Tunai !== undefined ? t.Tunai : (t.Dibayar || 0);
        let cleanDate = superApp.cleanDateOnly(t.Tanggal);
        let cleanTime = superApp.cleanTimeOnly(t.Waktu);
        try { await superApp.printReceipt(t.ID_TRX, t.Outlet, t.Total_Bayar, tunaiVal, t.Kembalian, items, t.Status, cleanDate + ' ' + cleanTime); } catch(e) {}
    },
    promptVoidTrx: function() {
        let pin = prompt("Masukkan PIN Super Admin (Owner) untuk Membatalkan & Mengembalikan Stok:");
        let adminUser = (superApp.db.users || []).find(u => String(u.Role).toLowerCase().includes('admin') && String(u.PIN) === String(pin));
        if(adminUser) { superApp.executeVoidTrx(superApp.activeReprintTrx.ID_TRX); } else { superApp.showToast("PIN Salah atau Anda bukan Admin! Batal ditolak.", "error"); }
    },
    executeVoidTrx: async function(trxId) {
        if(superApp.isProcessing) return;
        superApp.setLoading(true, "Membatalkan Transaksi...");
        const payload = { action: 'batal_trx', trx_id: trxId, tim_operasional: superApp.activeStaffTeam };
        let res = await superApp.apiPost(payload);
        if(res.status === 'sukses') {
            superApp.showToast("Transaksi Dibatalkan!"); 
            let t = superApp.activeReprintTrx; let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
            let tunaiVal = t.Tunai !== undefined ? t.Tunai : (t.Dibayar || 0);
            let cleanDate = superApp.cleanDateOnly(t.Tanggal);
            let cleanTime = superApp.cleanTimeOnly(t.Waktu);
            try { await superApp.printReceipt(t.ID_TRX, t.Outlet, t.Total_Bayar, tunaiVal, t.Kembalian, items, 'Batal', cleanDate + ' ' + cleanTime); } catch(e){}

            if(!res.is_offline) { const refreshRes = await fetch(API_URL, { redirect: 'follow' }); superApp.db = await refreshRes.json(); }
            superApp.refreshData(); superApp.closeModal('modal-detail');
        }
        superApp.setLoading(false);
    },

    // ==========================================
    // 11. AI ASSISTANT
    // ==========================================
    generateAIReport: function() {
        const aiCards = document.getElementById('ai-insight-cards'); const aiRekBody = document.getElementById('ai-rekomendasi-tbody');
        if(!aiCards || !aiRekBody || !superApp.db) return;

        const filterEl = document.getElementById('ai-filter-outlet');
        if(filterEl && filterEl.options.length <= 1) {
            let opts = '<option value="Semua">Semua Cabang Terpantau</option>';
            (superApp.db.outlets || []).forEach(o => opts += `<option value="${o.ID_Outlet}">${o.Nama_Outlet}</option>`);
            filterEl.innerHTML = opts;
            filterEl.value = superApp.outlet;
        }
        let aiOutlet = filterEl ? filterEl.value : superApp.outlet;

        let oldestDate = new Date();
        (superApp.db.transactions || []).forEach(t => { let d = superApp.parseDateId(t.Tanggal); if(d < oldestDate) oldestDate = d; });
        let daysActive = Math.ceil((new Date() - oldestDate) / (1000 * 60 * 60 * 24));
        if(daysActive < 1) daysActive = 1;

        let warnings = [];
        (superApp.db.masterProduk || []).forEach(mp => {
            if(String(mp.Kategori||'').toLowerCase() === 'pendukung' || String(mp.Kategori||'').toLowerCase() === 'bahan') {
                let totalMasuk = 0;
                (superApp.db.mutasi || []).forEach(m => { 
                    if(m.SKU === mp.SKU && (aiOutlet === 'Semua' || m.Outlet_Tujuan === aiOutlet)) totalMasuk += Number(m.Qty)||0; 
                });
                
                let sisa = 0;
                if(aiOutlet === 'Semua') {
                    (superApp.db.hargaStokOutlet || []).forEach(x => { if(x.SKU === mp.SKU) sisa += Number(x.Stok_Toko)||0; });
                } else {
                    let sData = (superApp.db.hargaStokOutlet || []).find(x => x.SKU === mp.SKU && x.ID_Outlet === aiOutlet);
                    sisa = sData ? Number(sData.Stok_Toko)||0 : 0;
                }

                let pemakaian = totalMasuk - sisa; if(pemakaian < 0) pemakaian = 0; 
                let velocity = pemakaian / daysActive; velocity = Number(velocity) || 0; 
                let daysRem = velocity > 0 ? (sisa / velocity) : 999;
                
                if(daysRem < 4 && sisa > 0) { warnings.push({ sku: mp.SKU, name: mp.Nama_Produk, type: mp.Kategori, vel: velocity, stock: sisa, days: Math.floor(daysRem) }); } 
                else if (sisa <= 0) { warnings.push({ sku: mp.SKU, name: mp.Nama_Produk, type: mp.Kategori, vel: velocity, stock: 0, days: 0 }); }
            }
        });

        let productSales = {};
        (superApp.db.transactions || []).forEach(t => {
            if(t.Status === 'Sukses' && (aiOutlet === 'Semua' || t.Outlet === aiOutlet)) {
                let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
                items.forEach(item => { 
                    let safeNama = item.nama || 'Unknown';
                    if(!productSales[safeNama]) productSales[safeNama] = 0; 
                    productSales[safeNama] += Number(item.qty)||0; 
                });
            }
        });
        let topSellers = []; 
        for (const [nama, qty] of Object.entries(productSales)) { 
            let v = Number(qty)/daysActive;
            topSellers.push({ name: nama, vel: Number(v)||0 }); 
        }
        topSellers.sort((a,b) => b.vel - a.vel); 
        let top1 = topSellers.length > 0 ? topSellers[0] : {name: '-', vel: 0};

        let lblCabang = aiOutlet === 'Semua' ? 'Keseluruhan Cabang' : `Cabang ${aiOutlet}`;

        // Trend Visualizer
        let trendHtml = top1.vel > 5 ? `<span class="text-green-300 text-sm ml-2 bg-green-900/30 px-2 py-1 rounded-lg"><i class="fas fa-arrow-trend-up"></i> Naik</span>` : `<span class="text-orange-200 text-sm ml-2 bg-orange-900/30 px-2 py-1 rounded-lg"><i class="fas fa-minus"></i> Stabil</span>`;

        aiCards.innerHTML = `
            <div class="bg-gradient-to-br from-orange-400 to-brand-600 p-8 rounded-3xl shadow-[0_10px_30px_rgba(249,115,22,0.3)] text-white transform hover:-translate-y-2 transition duration-300 relative overflow-hidden">
                <div class="absolute top-0 right-0 opacity-10 text-9xl transform translate-x-4 -
