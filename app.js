const API_URL = "https://script.google.com/macros/s/AKfycbwRss8HzQwPardxTi4Scd-QOUZ2pitnsubY6pqASyLZA7oaagmym61VuFJvWjb91NRhfg/exec"; // <-- GANTI DENGAN URL API ANDA

/* ========================================== */
/* 1. MESIN VIRTUAL KEYBOARD (IN-APP OSK)     */
/* ========================================== */
const osKeyboard = {
    targetElement: null, mode: 'numeric', isOpen: false,
    layouts: {
        numeric: [ ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['C', '0', '000'] ],
        text: [ ['1','2','3','4','5','6','7','8','9','0'], ['Q','W','E','R','T','Y','U','I','O','P'], ['A','S','D','F','G','H','J','K','L'], ['Z','X','C','V','B','N','M','SPACE'] ]
    },
    open: function(elOrId, type = 'text') {
        this.targetElement = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
        if (!this.targetElement) return;
        this.mode = type; this.isOpen = true; this.render();
        const vk = document.getElementById('virtual-keyboard'); const ov = document.getElementById('virtual-keyboard-overlay');
        if (vk) { vk.classList.remove('hidden'); setTimeout(() => vk.classList.remove('translate-y-full'), 10); }
        if (ov) { ov.classList.remove('hidden'); }
    },
    close: function() {
        this.isOpen = false; const vk = document.getElementById('virtual-keyboard'); const ov = document.getElementById('virtual-keyboard-overlay');
        if (vk) { vk.classList.add('translate-y-full'); setTimeout(() => vk.classList.add('hidden'), 300); }
        if (ov) { ov.classList.add('hidden'); }
        this.targetElement = null;
    },
    render: function() {
        const container = document.getElementById('vk-keys'); if (!container) return;
        let html = ''; let rows = this.layouts[this.mode];
        rows.forEach(row => {
            html += `<div class="flex justify-center gap-1 sm:gap-2 w-full mb-1 sm:mb-2">`;
            row.forEach(key => {
                if (key === 'SPACE') { html += `<button class="flex-[3] py-3 sm:py-4 bg-white text-slate-800 font-bold rounded-xl shadow-sm border border-slate-200 hover:bg-brand-50 transition active:scale-95" onclick="osKeyboard.insert(' ')">SPASI</button>`; } 
                else if (key === 'C') { html += `<button class="flex-1 py-3 sm:py-4 bg-red-50 text-red-500 font-bold rounded-xl shadow-sm border border-red-200 hover:bg-red-100 transition active:scale-95" onclick="osKeyboard.clear()">C</button>`; } 
                else { html += `<button class="flex-1 py-3 sm:py-4 bg-white text-slate-800 font-bold rounded-xl shadow-sm border border-slate-200 hover:bg-brand-50 transition active:scale-95 text-lg" onclick="osKeyboard.insert('${key}')">${key}</button>`; }
            });
            html += `</div>`;
        });
        html += `<div class="flex justify-center gap-2 w-full mt-2"><button class="flex-1 py-4 bg-slate-200 text-slate-700 font-bold rounded-xl shadow-sm border border-slate-300 hover:bg-slate-300 transition active:scale-95" onclick="osKeyboard.backspace()"><i class="fas fa-backspace"></i> HAPUS</button><button class="flex-[2] py-4 bg-brand-500 text-white font-black rounded-xl shadow-md hover:bg-brand-600 transition active:scale-95 text-lg" onclick="osKeyboard.close()"><i class="fas fa-check-circle"></i> SELESAI</button></div>`;
        container.innerHTML = html;
    },
    insert: function(char) { if (!this.targetElement) return; this.targetElement.value += char; this.targetElement.dispatchEvent(new Event('input', { bubbles: true })); },
    backspace: function() { if (!this.targetElement) return; this.targetElement.value = this.targetElement.value.slice(0, -1); this.targetElement.dispatchEvent(new Event('input', { bubbles: true })); },
    clear: function() { if (!this.targetElement) return; this.targetElement.value = ''; this.targetElement.dispatchEvent(new Event('input', { bubbles: true })); }
};

/* ========================================== */
/* 2. MESIN UTAMA APLIKASI (SUPERAPP)         */
/* ========================================== */
const superApp = {
    outlet: '', cart: [], printerChar: null, db: null, filteredProducts: [],
    payTotal: 0, payCash: 0, payChange: 0, payMethod: 'Tunai', activeShiftId: null, activeStaffTeam: [],
    activeReprintTrx: null, currentUser: null, pinBuffer: '', ADMIN_PIN: '1234',
    offlineQueue: [], isOnline: navigator.onLine, cfdWindow: null, isLoadingData: false, printerCharacteristic: null, printerDevice: null, isBluetoothSearching: false, isProcessing: false,
    cfdFocusHandlerAdded: false,

    // FORMATTER & PARSER
    formatRupiahInput: function(el) { let val = el.value.replace(/[^0-9]/g, ''); el.value = val !== '' ? parseInt(val, 10).toLocaleString('id-ID') : ''; },
    getNumericValue: function(val) { return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0; },
    
    cleanDateOnly: function(str) {
        if (!str) return ''; 
        let s = String(str).trim();
        
        // 1. Cek jika data dari Google Sheets berupa Object Date (ISO/GMT)
        if ((s.includes('T') && (s.includes('Z') || s.includes('+'))) || s.includes('GMT')) { 
            let d = new Date(s); 
            if (!isNaN(d.getTime())) { 
                let pad = n => n < 10 ? '0' + n : n; 
                return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; 
            } 
        }
        
        // 2. Cek jika data berupa teks manual
        let match = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (match) { 
            let pad = n => String(n).length < 2 ? '0' + n : n; 
            return `${pad(match[1])}/${pad(match[2])}/${match[3]}`; 
        }
        return s.split(' ')[0];
    },

    cleanTimeOnly: function(str) {
        if (!str) return '00.00.00'; 
        let s = String(str).trim();

        // 1. Cek jika data dari Google Sheets berupa Object Date (ISO/GMT)
        if ((s.includes('T') && (s.includes('Z') || s.includes('+'))) || s.includes('GMT')) { 
            let d = new Date(s); 
            if (!isNaN(d.getTime())) { 
                let pad = n => n < 10 ? '0' + n : n; 
                return `${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`; 
            } 
        }

        // 2. Cek jika data berupa Desimal Murni (Cara Google Sheets simpan nilai Waktu)
        if (!isNaN(Number(s)) && Number(s) > 0 && Number(s) < 1) {
            let totalSec = Math.floor(Number(s) * 86400);
            let h = Math.floor(totalSec / 3600);
            let m = Math.floor((totalSec % 3600) / 60);
            let sec = totalSec % 60;
            let pad = n => n < 10 ? '0' + n : n;
            return `${pad(h)}.${pad(m)}.${pad(sec)}`;
        }

        // 3. Cek jika data berupa teks manual dari kasir (HH.MM.SS atau HH:MM:SS)
        let match = s.match(/(\d{1,2})[.:](\d{1,2})[.:](\d{1,2})/);
        if (match) { 
            let pad = n => String(n).length < 2 ? '0' + n : n; 
            return `${pad(match[1])}.${pad(match[2])}.${pad(match[3])}`; 
        }
        
        let parts = s.split(' '); 
        return parts.length > 1 ? parts[1] : s;
    },
    parseDateId: function(dateStr) {
        if (!dateStr) return new Date(0); let s = String(dateStr); let match = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (match) { let p1 = parseInt(match[1]); let p2 = parseInt(match[2]); let y = parseInt(match[3]); let d = p1, m = p2; if (p2 > 12) { m = p1; d = p2; } return new Date(y, m - 1, d, 0, 0, 0, 0); }
        if (s.includes('T')) { let d = new Date(s); if (!isNaN(d.getTime())) { d.setHours(0, 0, 0, 0); return d; } }
        let fPart = s.split(' ')[0]; let d2 = new Date(fPart); if (!isNaN(d2.getTime())) { d2.setHours(0, 0, 0, 0); return d2; }
        return new Date(0);
    },

    // GLOBAL UTILS
    // Tambahkan parameter silent (default false)
    pullFreshData: async function(silent = false) {
        if (this.isProcessing && !silent) return; 
        if (!silent) this.setLoading(true, "Menarik Data Terbaru...");
        
        try {
            const res = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); 
            const data = await res.json();
            
            if (data && data.status === 'sukses') { 
                
                // --- 🚀 RADAR PENDETEKSI UPDATE VERSI KODINGAN ---
                let serverVersion = (data.pengaturan || []).find(x => x.Pengaturan === 'Versi_Aplikasi');
                if (serverVersion) {
                    let localVersion = localStorage.getItem('app_version');
                    
                    // Jika baru pertama kali buka, simpan versinya
                    if (!localVersion) {
                        localStorage.setItem('app_version', serverVersion.Nilai);
                    } 
                    // JIKA VERSI DI GOOGLE SHEETS BERBEDA DENGAN DI HP KASIR
                    else if (localVersion !== serverVersion.Nilai) {
                        
                        // 1. Tampilkan Pop-up Pembaruan Paksa
                        alert(`🚀 UPDATE SISTEM TERSEDIA!\n\nKodingan versi baru (${serverVersion.Nilai}) telah dirilis oleh Owner.\n\nSistem akan dimuat ulang (Refresh) secara otomatis untuk menerapkan pembaruan.`);
                        
                        // 2. Perbarui ingatan memori versi di HP
                        localStorage.setItem('app_version', serverVersion.Nilai);
                        
                        // 3. Paksa Service Worker PWA untuk memeriksa pembaruan file cache
                        if ('serviceWorker' in navigator) {
                            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                                for(let registration of registrations) { registration.update(); }
                            });
                        }
                        
                        // 4. Paksa aplikasi memuat ulang (reload) detik itu juga
                        window.location.reload(true);
                        return; // Hentikan fungsi ke bawah agar data lama tidak ditimpa
                    }
                }
                // ------------------------------------------------
                
                this.db = data; 
                localStorage.setItem('aisnack_db_cache', JSON.stringify(data)); 
                
                // Hanya perbarui layar jika keranjang kosong (tidak mengganggu transaksi)
                if (this.cart.length === 0) {
                    this.refreshData(); 
                }
                
                if (!silent) this.showToast("Data diperbarui!"); 
            } 
        } catch (e) { 
            if (!silent) this.showToast("Gagal menarik data.", "error"); 
        }
        
        if (!silent) this.setLoading(false);
    },
    
    getEmptyState: function(icon, title, desc) { return `<div class="flex flex-col items-center justify-center h-full p-8 text-center opacity-70"><div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl text-slate-300 mb-4 mx-auto"><i class="fas ${icon}"></i></div><h4 class="font-black text-slate-600 text-lg mb-1">${title}</h4><p class="text-xs font-bold text-slate-400">${desc}</p></div>`; },
    showToast: function(msg, type = 'success') {
        const container = document.getElementById('toast-container'); if (!container) return;
        const icon = type === 'success' ? '<i class="fas fa-check-circle text-green-500 text-xl"></i>' : (type === 'warning' ? '<i class="fas fa-cloud-arrow-up text-orange-500 text-xl"></i>' : '<i class="fas fa-exclamation-circle text-red-500 text-xl"></i>');
        const t = document.createElement('div'); t.className = `bg-white p-4 rounded-2xl shadow-2xl shadow-slate-200 flex items-center gap-3 toast-animate z-[999] pointer-events-auto`;
        t.innerHTML = `${icon}<p class="font-bold text-sm text-slate-800">${msg}</p>`;
        container.appendChild(t); setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000); this.syncStorage();
    },
    toggleSidebar: function() { const sb = document.getElementById('sidebar'); const ov = document.getElementById('mobile-overlay'); if (sb && ov) { sb.classList.toggle('-translate-x-full'); ov.classList.toggle('hidden'); } },
    setLoading: function(show, text = "Memproses...") { 
        const loader = document.getElementById('app-loader'); const lText = document.getElementById('loader-text'); this.isProcessing = show;
        if (loader && lText) { lText.innerText = text; if (show) { loader.classList.remove('hidden'); loader.classList.add('flex'); } else { loader.classList.add('hidden'); loader.classList.remove('flex'); } }
    },
    closeModal: function(id) { const content = document.getElementById(id + '-content'); const modal = document.getElementById(id); if (content && modal) { content.classList.remove('modal-enter-active'); setTimeout(() => modal.classList.add('hidden'), 300); } },
    toggleDarkMode: function() { 
        document.documentElement.classList.toggle('dark'); let ic = document.getElementById('dark-icon'); 
        if (ic) { if (document.documentElement.classList.contains('dark')) { ic.classList.replace('fa-moon', 'fa-sun'); ic.classList.replace('text-slate-600', 'text-yellow-400'); } else { ic.classList.replace('fa-sun', 'fa-moon'); ic.classList.replace('text-yellow-400', 'text-slate-600'); } }
    },
    apiPost: async function(payload) {
        if (!this.isOnline) { this.offlineQueue.push(payload); localStorage.setItem('aisnack_offline_queue', JSON.stringify(this.offlineQueue)); this.updateNetworkUI(); return { status: 'sukses', is_offline: true, trx_id: payload.trx_id || payload.id_shift }; }
        try { const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) }); return await res.json(); } 
        catch (e) { this.offlineQueue.push(payload); localStorage.setItem('aisnack_offline_queue', JSON.stringify(this.offlineQueue)); this.updateNetworkUI(); return { status: 'sukses', is_offline: true, trx_id: payload.trx_id || payload.id_shift }; }
    },
    syncOfflineQueue: async function() {
        if (!this.isOnline || this.offlineQueue.length === 0) return;
        this.showToast("Menyinkronkan data offline...", "warning"); let failedQueue = [];
        for (let i = 0; i < this.offlineQueue.length; i++) { try { await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(this.offlineQueue[i]) }); } catch (e) { failedQueue.push(this.offlineQueue[i]); } }
        this.offlineQueue = failedQueue; localStorage.setItem('aisnack_offline_queue', JSON.stringify(this.offlineQueue));
        if (this.offlineQueue.length === 0) { this.showToast("Tersinkronisasi!"); try { const res = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); this.db = await res.json(); this.refreshData(); } catch (e) {} }
        this.updateNetworkUI();
    },
    updateNetworkUI: function() {
        const ind = document.getElementById('network-indicator'); const dot = document.getElementById('net-dot'); const txt = document.getElementById('net-text'); if (!ind || !dot || !txt) return;
        if (this.isOnline) {
            if (this.offlineQueue.length > 0) { ind.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 cursor-pointer transition'; dot.className = 'w-2 h-2 rounded-full bg-orange-500 animate-pulse'; txt.className = 'text-[10px] font-bold text-orange-600 hidden md:inline'; txt.innerText = `Menyinkron ${this.offlineQueue.length} data...`; } 
            else { ind.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 transition'; dot.className = 'w-2 h-2 rounded-full bg-green-500'; txt.className = 'text-[10px] font-bold text-green-600 hidden md:inline'; txt.innerText = 'Online & Sinkron'; }
        } else { ind.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 transition'; dot.className = 'w-2 h-2 rounded-full bg-red-500'; txt.className = 'text-[10px] font-bold text-red-600 hidden md:inline'; txt.innerText = `Offline (${this.offlineQueue.length} Pending)`; }
    },

    // CFD DUAL MONITOR SMART SYNC + ANTRIAN
    cfdSuccessTimeout: null, // Tambahkan variabel global untuk menyimpan memori waktu

    openCFD: async function(isAutoRestore = false) {
        localStorage.setItem('cfd_wants_open', 'true');
        try { 
            if ('getScreenDetails' in window) { 
                const screens = await window.getScreenDetails(); 
                const extScreen = screens.screens.find(s => s !== screens.currentScreen); 
                if (extScreen) { this.cfdWindow = window.open(window.location.href + '?mode=cfd', 'CFD_WINDOW_AISNACK', `left=${extScreen.availLeft},top=${extScreen.availTop},width=${extScreen.availWidth},height=${extScreen.availHeight},fullscreen=yes`); return; } 
            } 
        } catch (e) {}
        
        if (!this.cfdWindow || this.cfdWindow.closed) { this.cfdWindow = window.open(window.location.href + '?mode=cfd', 'CFD_WINDOW_AISNACK', `left=${window.screen.width},top=0,width=1024,height=768`); }
        if (this.cfdWindow) {
            this.cfdWindow.focus();
            if (!this.cfdFocusHandlerAdded) {
                window.addEventListener('focus', () => { if (this.cfdWindow && !this.cfdWindow.closed && localStorage.getItem('cfd_wants_open') === 'true') { this.syncStorage(); } });
                this.cfdFocusHandlerAdded = true;
            }
        }
    },
   changePromoImage: function(type) {
        let fileInput = document.createElement('input'); 
        fileInput.type = 'file'; 
        fileInput.accept = 'image/*'; 
        
        fileInput.onchange = (event) => {
            const file = event.target.files[0]; 
            if (!file || this.isProcessing) return; 
            
            let loadingText = type === 'standby' ? "Mengunggah Promo Standby..." : "Mengunggah Promo Transaksi...";
            this.setLoading(true, loadingText);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.apiPost({ 
                    action: 'update_promo_dual',
                    promoType: type,
                    base64: e.target.result, 
                    fileName: file.name, 
                    mimeType: file.type 
                }).then(res => { 
                    if (res.status === 'sukses') { 
                        const storageKey = type === 'standby' ? 'cfd_promo_standby' : 'cfd_promo_transaksi';
                        localStorage.setItem(storageKey, res.url); 
                        this.syncStorage(); 
                        this.setLoading(false); 
                        this.showToast(`Promo ${type.toUpperCase()} Berhasil Diperbarui!`); 
                    } else {
                        this.setLoading(false);
                        this.showToast("Gagal upload: " + res.pesan, "error");
                    }
                }).catch(() => {
                    this.setLoading(false); this.showToast("Koneksi bermasalah", "error");
                });
            }; 
            reader.readAsDataURL(file);
        }; 
        fileInput.click();
    },

    // Fungsi untuk merubah gambar logo secara serempak di seluruh sudut aplikasi
    updateAppLogos: function(url) {
        if (!url) return;
        document.querySelectorAll('.app-logo-img').forEach(img => {
            img.src = url;
        });
    },

    // Fungsi pengunggah file logo baru langsung menuju Google Drive
    changeAppLogo: function() {
        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            if (this.isProcessing) return;
            
            this.setLoading(true, "Mengunggah Logo Baru ke Google Drive...");
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Data = e.target.result;
                
                this.apiPost({
                    action: 'update_logo_drive',
                    base64: base64Data,
                    fileName: file.name,
                    mimeType: file.type
                }).then(res => {
                    if (res.status === 'sukses') {
                        localStorage.setItem('app_logo_url', res.url);
                        this.updateAppLogos(res.url); // Ubah visual logo kasir saat itu juga
                        this.syncStorage(); // Sinkronkan ke layar pelanggan (CFD)
                        this.setLoading(false);
                        this.showToast("Logo Aplikasi Berhasil Diperbarui Secara Global!");
                    } else {
                        this.setLoading(false);
                        this.showToast("Gagal menyimpan logo: " + res.pesan, "error");
                    }
                }).catch(() => {
                    this.setLoading(false);
                    this.showToast("Koneksi internet bermasalah saat upload", "error");
                });
            };
            reader.readAsDataURL(file);
        };
        fileInput.click();
    },
    
    syncStorage: function(status = 'ordering', antrian = null) {
        if (new URLSearchParams(window.location.search).get('mode') === 'cfd') return;
        localStorage.setItem('ai_snack_cfd', JSON.stringify({ 
            outlet: this.outlet || 'Ai-Snack', 
            items: this.cart, 
            total: this.payTotal, 
            kembali: this.payChange, 
            status: status, 
            antrian: antrian, 
            timestamp: new Date().getTime(), 
            promoStandbyUrl: localStorage.getItem('cfd_promo_standby'),
            promoScreenUrl: localStorage.getItem('cfd_promo_transaksi')
        }));
    },
    
   initCFD: function() {
        document.getElementById('login-screen').classList.add('hidden'); document.getElementById('sidebar').classList.add('hidden'); document.getElementById('main-app').classList.add('hidden');
        const cfdScreen = document.getElementById('cfd-screen'); if (cfdScreen) cfdScreen.classList.remove('hidden');
        
        window.addEventListener('storage', (e) => { 
            if (e.key === 'ai_snack_cfd' || e.key === 'cfd_promo_standby' || e.key === 'cfd_promo_transaksi' || e.key === 'app_logo_url') { 
                let data = JSON.parse(localStorage.getItem('ai_snack_cfd') || '{}'); if (data.outlet) this.renderCFD(data); 
                let newLogo = localStorage.getItem('app_logo_url'); if (newLogo) this.updateAppLogos(newLogo);
            } 
        });
        
        let initialData = localStorage.getItem('ai_snack_cfd'); if (initialData) this.renderCFD(JSON.parse(initialData));
        
        let bgStandby = localStorage.getItem('cfd_promo_standby'); 
        let bgScreen = localStorage.getItem('cfd_promo_transaksi'); 
        if (bgStandby) { const bg1 = document.getElementById('cfd-bg-standby'); if (bg1) bg1.style.backgroundImage = `url('${bgStandby}')`; }
        if (bgScreen) { const bg2 = document.getElementById('cfd-bg-screen'); if (bg2) bg2.style.backgroundImage = `url('${bgScreen}')`; }
        
        let savedLogo = localStorage.getItem('app_logo_url');
        if (savedLogo) { this.updateAppLogos(savedLogo); }
    },
    
    renderCFD: function(data) {
        const outNameEl = document.getElementById('cfd-outlet-name'); if (outNameEl) outNameEl.innerText = `Cabang ${data.outlet}`;
        if (data.promoStandbyUrl) { const bg1 = document.getElementById('cfd-bg-standby'); if (bg1) bg1.style.backgroundImage = `url('${data.promoStandbyUrl}')`; }
        if (data.promoScreenUrl) { const bg2 = document.getElementById('cfd-bg-screen'); if (bg2) bg2.style.backgroundImage = `url('${data.promoScreenUrl}')`; }
        const cfdStandby = document.getElementById('cfd-standby'); const cfdSuccess = document.getElementById('cfd-success');
        
        if (data.status === 'paid') { 
            cfdSuccess.classList.remove('hidden'); 
            
            // PERBAIKAN 1: Null Safety pada data kembalian (Mencegah blank screen)
            let kembalianAman = Number(data.kembali || 0).toLocaleString('id-ID');
            
            document.getElementById('cfd-kembali').innerHTML = `Rp ${kembalianAman}<br><span class="text-white text-4xl sm:text-5xl mt-6 block drop-shadow-md">NOMOR ANTRIAN ANDA:<br><span class="text-yellow-300 font-black text-6xl sm:text-8xl mt-2 block">${data.antrian || '-'}</span></span>`; 
            
            // PERBAIKAN 2: Mencegah timer bentrok jika transaksi terjadi sangat cepat
            if(this.cfdSuccessTimeout) clearTimeout(this.cfdSuccessTimeout);
            
            this.cfdSuccessTimeout = setTimeout(() => { 
                cfdSuccess.classList.add('hidden'); 
            }, 7000); 
            
        } else { 
            cfdSuccess.classList.add('hidden'); 
        }
        
        if (data.items && data.items.length === 0 && data.status !== 'paid') { 
            cfdStandby.classList.remove('opacity-0', 'pointer-events-none'); 
        } 
        else if (data.items) {
            cfdStandby.classList.add('opacity-0', 'pointer-events-none'); let html = '';
            data.items.forEach(i => { html += `<div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center"><div><h4 class="font-black text-slate-800 text-lg">${i.nama}</h4><p class="text-slate-500 font-bold">${i.qty} x Rp ${Number(i.price || 0).toLocaleString('id-ID')}</p></div><p class="font-black text-brand-500 text-xl">Rp ${(Number(i.price || 0) * Number(i.qty || 0)).toLocaleString('id-ID')}</p></div>`; });
            const listEl = document.getElementById('cfd-cart-list'); if (listEl) listEl.innerHTML = html;
            const totEl = document.getElementById('cfd-total'); if (totEl) totEl.innerText = `Rp ${Number(data.total || 0).toLocaleString('id-ID')}`;
        }
    },
    
   // STARTUP & LOGIN
    init: async function() {
        // --- 🚀 RADAR UPDATE APLIKASI (SERVICE WORKER) ---
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').then(registration => {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        // Jika ada service worker baru yang terinstal dan siap mengambil alih
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            const banner = document.getElementById('update-banner');
                            if (banner) {
                                banner.classList.remove('hidden');
                                setTimeout(() => {
                                    banner.classList.remove('translate-y-20', 'opacity-0');
                                }, 100);
                            }
                            
                            const btn = document.getElementById('btn-update-app');
                            if (btn) {
                                btn.onclick = () => {
                                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                                    newWorker.postMessage({ action: 'skipWaiting' });
                                };
                            }
                        }
                    });
                });
            }).catch(err => console.log('SW Reg Error:', err));

            // Eksekusi muat ulang (reload) saat mesin PWA berhasil diperbarui
            let refreshing;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (refreshing) return;
                refreshing = true;
                window.location.reload();
            });
        }
        // ----------------------------------------------

        if (new URLSearchParams(window.location.search).get('mode') === 'cfd') { this.initCFD(); return; }

        document.addEventListener("visibilitychange", () => { if (document.hidden && this.cfdWindow && !this.cfdWindow.closed) { this.cfdWindow.close(); } });
        document.addEventListener("click", () => { if (this.currentUser && localStorage.getItem('cfd_wants_open') === 'true') { if (!this.cfdWindow || this.cfdWindow.closed) { this.openCFD(true); } } });
        window.addEventListener('beforeunload', () => { if (this.cfdWindow && !this.cfdWindow.closed) this.cfdWindow.close(); });
        window.addEventListener('online', () => { this.isOnline = true; this.syncOfflineQueue(); });
        window.addEventListener('offline', () => { this.isOnline = false; this.updateNetworkUI(); });
        
        try { 
            let queue = localStorage.getItem('aisnack_offline_queue'); 
            this.offlineQueue = queue ? JSON.parse(queue) : []; 
        } catch (e) { 
            this.offlineQueue = []; 
        }

        try {
            const logStat = document.getElementById('login-status');
            let cacheDb = localStorage.getItem('aisnack_db_cache');
            
            if (cacheDb) { 
                this.db = JSON.parse(cacheDb); 
                if (logStat) { 
                    logStat.innerText = 'Data Lokal Siap. Mencari Update Server...'; 
                    logStat.className = 'text-[10px] text-orange-500 font-bold uppercase tracking-widest text-center animate-pulse'; 
                } 
            } else { 
                if (logStat) { 
                    logStat.innerText = 'Mengunduh Database Google Pertama Kali...'; 
                    logStat.className = 'text-[10px] text-brand-500 font-bold uppercase tracking-widest text-center animate-pulse'; 
                } 
            }

            // Fungsi penarik data yang dirapikan
            let performFetch = async () => {
                let data = null;
                for (let i = 0; i < 3; i++) {
                    try { 
                        const res = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); 
                        data = await res.json(); 
                        if (data && data.status === 'sukses') break; 
                    } catch (e) { 
                        if (logStat && !this.db) logStat.innerText = `Mencoba ulang koneksi (${i+1}/3)...`; 
                        await new Promise(r => setTimeout(r, 2000)); 
                    }
                }
                if (!data || data.status === 'error') throw new Error(data ? data.pesan : "Server Timeout");

                // --- PROSES DATA SUKSES ---
                this.db = data; 
                localStorage.setItem('aisnack_db_cache', JSON.stringify(data));
                
                // Set Logo
                let logoData = (this.db.pengaturan || []).find(x => x.Pengaturan === 'Logo_Aplikasi');
                if (logoData) {
                    localStorage.setItem('app_logo_url', logoData.Nilai);
                    this.updateAppLogos(logoData.Nilai); 
                }
                
                // Set DUAL Promo CFD
                let pStandby = (this.db.pengaturan || []).find(x => x.Pengaturan === 'Promo_Standby');
                if (pStandby) localStorage.setItem('cfd_promo_standby', pStandby.Nilai);
                
                let pTransaksi = (this.db.pengaturan || []).find(x => x.Pengaturan === 'Promo_Transaksi');
                if (pTransaksi) localStorage.setItem('cfd_promo_transaksi', pTransaksi.Nilai);

                // Set Tanggal Filter Report
                let today = new Date(); let yyyy = today.getFullYear(); let mm = String(today.getMonth() + 1).padStart(2, '0'); let dd = String(today.getDate()).padStart(2, '0');
                let todayStr = `${yyyy}-${mm}-${dd}`; 
                const fs = document.getElementById('filter-start'); const fe = document.getElementById('filter-end');
                if (fs && !fs.value) fs.value = todayStr; 
                if (fe && !fe.value) fe.value = todayStr;

                if (logStat) { 
                    logStat.innerText = 'Sistem Terkoneksi. Silakan Masukkan PIN.'; 
                    logStat.className = 'text-[10px] text-green-500 font-bold uppercase tracking-widest text-center'; 
                }
            };

            // Jika tidak ada cache lokal, tunggu sampai download selesai. Jika ada cache, biarkan download berjalan di background.
            if (!cacheDb) {
                await performFetch();
            } else {
                performFetch(); 
            }

        } catch (err) {
            const logStat = document.getElementById('login-status');
            if (logStat && this.db) { 
                logStat.innerText = 'Offline Mode Aktif (Gunakan PIN Anda)'; 
                logStat.className = 'text-[10px] text-orange-500 font-bold uppercase tracking-widest text-center'; 
            } else if (logStat) { 
                logStat.innerText = 'Gagal! Buka aplikasi pertama kali butuh Internet.'; 
                logStat.className = 'text-[10px] text-red-500 font-bold uppercase tracking-widest text-center'; 
            }
        }
    },
    addPin: function(num) {
        if (!this.db || !this.db.users) { this.showToast('Sistem sedang memuat data, mohon tunggu sebentar...', 'warning'); return; }
        if (this.pinBuffer.length < 4) { this.pinBuffer += num; const dot = document.getElementById(`dot-${this.pinBuffer.length}`); if (dot) { dot.classList.replace('border-slate-300', 'bg-brand-500'); dot.classList.replace('border-2', 'border-0'); } }
        if (this.pinBuffer.length === 4) setTimeout(() => this.processLogin(), 200);
    },
    delPin: function() {
        if (this.pinBuffer.length > 0) { const dot = document.getElementById(`dot-${this.pinBuffer.length}`); if (dot) { dot.classList.replace('bg-brand-500', 'border-slate-300'); dot.classList.replace('border-0', 'border-2'); } this.pinBuffer = this.pinBuffer.slice(0, -1); }
    },
    clearPin: function() {
        this.pinBuffer = ''; for (let i = 1; i <= 4; i++) { const dot = document.getElementById(`dot-${i}`); if (dot) { dot.classList.replace('bg-brand-500', 'border-slate-300'); dot.classList.replace('border-0', 'border-2'); } }
    },
    processLogin: function() {
        if (this.isProcessing) return; this.isProcessing = true;
        if (!this.db || !this.db.users) { this.showToast('Koneksi ke Database belum siap.', 'error'); this.clearPin(); this.isProcessing = false; return; }

        let user = this.db.users.find(u => String(u.PIN) === String(this.pinBuffer));
        if (user) {
            this.currentUser = user; this.outlet = user.Outlet === 'Pusat' ? ((this.db.outlets || [])[0]?.ID_Outlet || 'Penajam') : user.Outlet;
            const sbRole = document.getElementById('sb-role'); if (sbRole) sbRole.innerText = user.Role;
            const hInit = document.getElementById('header-initial'); if (hInit) hInit.innerText = user.Username.charAt(0).toUpperCase();

            let isAdmin = String(user.Role).toLowerCase().includes('admin');
            const adminMenus = document.getElementById('admin-menus'); const selOut = document.getElementById('select-outlet'); const repOut = document.getElementById('report-outlet-filter');

            if (isAdmin) {
                if (adminMenus) adminMenus.classList.remove('hidden'); if (selOut) selOut.classList.remove('hidden'); if (repOut) repOut.classList.remove('hidden');
                let outOptions = ''; let outFilters = '<option value="Semua">Semua Outlet</option>';
                (this.db.outlets || []).forEach(o => { outOptions += `<option value="${o.ID_Outlet}">📍 ${o.Nama_Outlet}</option>`; outFilters += `<option value="${o.ID_Outlet}">Hanya: ${o.Nama_Outlet}</option>`; });
                if (selOut) { selOut.innerHTML = outOptions; selOut.value = this.outlet; selOut.disabled = false; }
                if (repOut) repOut.innerHTML = outFilters;
                
                // TAMPILKAN 3 TOMBOL KHUSUS ADMIN (Owner)
                const btnStandby = document.getElementById('btn-promo-standby'); if (btnStandby) btnStandby.style.display = 'flex';
                const btnTransaksi = document.getElementById('btn-promo-transaksi'); if (btnTransaksi) btnTransaksi.style.display = 'flex';
                const btnLogo = document.getElementById('btn-ubah-logo'); if (btnLogo) btnLogo.style.display = 'flex';
            } else {
                if (adminMenus) adminMenus.classList.add('hidden');
                if (selOut) { selOut.classList.add('hidden'); selOut.innerHTML = `<option value="${this.outlet}">📍 ${this.outlet}</option>`; selOut.disabled = true; }
                if (repOut) repOut.classList.add('hidden');
                
                // SEMBUNYIKAN 3 TOMBOL DARI KASIR BIASA
                const btnStandby = document.getElementById('btn-promo-standby'); if (btnStandby) btnStandby.style.display = 'none';
                const btnTransaksi = document.getElementById('btn-promo-transaksi'); if (btnTransaksi) btnTransaksi.style.display = 'none';
                const btnLogo = document.getElementById('btn-ubah-logo'); if (btnLogo) btnLogo.style.display = 'none';
            }

            const ls = document.getElementById('login-screen'); if (ls) ls.classList.add('hidden');
            const sbar = document.getElementById('sidebar'); if (sbar) sbar.classList.remove('hidden');
            const mainApp = document.getElementById('main-app'); if (mainApp) mainApp.classList.remove('hidden');

            this.updateNetworkUI(); this.syncOfflineQueue(); this.refreshData(); this.checkShiftStatus(); this.showToast(`Selamat datang, ${user.Username}!`);
            
            // Tulis data ke memori agar CFD tahu cabang yang aktif
            localStorage.setItem('aisnack_active_outlet', this.outlet);
            
            this.updateCFDGreeting(); 
            if (!this.cfdTimer) {
                this.cfdTimer = setInterval(() => { this.updateCFDGreeting(); }, 60000); 
            }

        } else { 
            this.showToast('PIN Tidak Dikenali', 'error'); this.clearPin(); 
        }
        this.isProcessing = false;
    },

    // FUNGSI PENYAPA CFD (Mendukung Multi-Window)
    updateCFDGreeting: function() {
        // 1. Simpan nama cabang ke memori agar jendela CFD tidak lupa saat di-refresh
        if (this.outlet) {
            localStorage.setItem('aisnack_active_outlet', this.outlet);
        }
        let namaOutlet = this.outlet || localStorage.getItem('aisnack_active_outlet') || "Ai-Snack";

        // 2. Logika Pembaca Waktu
        const hour = new Date().getHours();
        let ucapanWaktu = "Selamat Malam!"; 
        if (hour >= 5 && hour < 11) {
            ucapanWaktu = "Selamat Pagi!";
        } else if (hour >= 11 && hour < 15) {
            ucapanWaktu = "Selamat Siang!";
        } else if (hour >= 15 && hour < 18) {
            ucapanWaktu = "Selamat Sore!";
        }

        // 3. UBAH DI LAYAR UTAMA (KASIR)
        const greetTimeEl = document.getElementById('cfd-greeting-time');
        const greetOutletEl = document.getElementById('cfd-greeting-outlet');
        if (greetTimeEl) greetTimeEl.innerText = ucapanWaktu;
        if (greetOutletEl) greetOutletEl.innerText = `Selamat datang di Ai-CHA ${namaOutlet}, silakan pesan di kasir`;

        // 4. UBAH DI LAYAR CFD (MENYEBERANG KE JENDELA KEDUA SEBAGAI CADANGAN)
        if (this.cfdWindow && !this.cfdWindow.closed) {
            try {
                const cfdTimeEl = this.cfdWindow.document.getElementById('cfd-greeting-time');
                const cfdOutletEl = this.cfdWindow.document.getElementById('cfd-greeting-outlet');
                if (cfdTimeEl) cfdTimeEl.innerText = ucapanWaktu;
                if (cfdOutletEl) cfdOutletEl.innerText = `Selamat datang di Ai-CHA ${namaOutlet}, silakan pesan di kasir`;
            } catch (e) {
                console.log("Menunggu layar CFD siap...");
            }
        }
    },
    
    
    // SHIFT & KAS KELUAR
    checkShiftStatus: function() {
        const shiftOutName = document.getElementById('shift-outlet-name'); if (shiftOutName) shiftOutName.innerText = this.outlet;
        let openShift = (this.db.shifts || []).find(s => s.Outlet === this.outlet && s.Waktu_Tutup === '');
        const posView = document.getElementById('view-pos');

        if (openShift) {
            this.activeShiftId = openShift.ID_Shift;
            try { this.activeStaffTeam = JSON.parse(openShift.Tim_Operasional); } catch (e) { this.activeStaffTeam = []; }
            if (posView) posView.classList.remove('blur-lock');
        } else {
            this.activeShiftId = null; this.activeStaffTeam = [];
            if (posView) posView.classList.add('blur-lock');

            const shiftUserName = document.getElementById('shift-user-name'); if (shiftUserName && this.currentUser) shiftUserName.innerText = this.currentUser.Username;

            let staffHtml = '';
            (this.db.users || []).filter(u => u.Outlet === this.outlet || u.Outlet === 'Pusat').forEach(u => {
                let badge = String(u.Role).toLowerCase().includes('senior') || String(u.Role).toLowerCase().includes('admin') ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-slate-100 text-slate-500';
                staffHtml += `<label class="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition"><input type="checkbox" value="${u.Username}" data-role="${u.Role}" class="shift-cb w-5 h-5 text-brand-500 rounded"><div class="flex-1 font-bold text-sm text-slate-800">${u.Username}</div><span class="px-2 py-0.5 border rounded text-[10px] font-black uppercase ${badge}"></span></label>`;
            });

            const staffListEl = document.getElementById('shift-staff-list'); if (staffListEl) staffListEl.innerHTML = staffHtml || '<p class="text-sm text-red-500">Tidak ada staf terdaftar di cabang ini.</p>';
            const mAwal = document.getElementById('shift-modal-awal'); if (mAwal) mAwal.value = '';

            const modalShift = document.getElementById('modal-shift'); const modalShiftContent = document.getElementById('modal-shift-content');
            if (modalShift && modalShiftContent) { modalShift.classList.remove('hidden'); setTimeout(() => modalShiftContent.classList.add('modal-enter-active'), 10); }
        }
    },
    executeBukaShift: async function() {
        if (this.isProcessing) return;
        let cbs = document.querySelectorAll('.shift-cb:checked'); if (cbs.length === 0) return this.showToast("Pilih minimal 1 anggota tim!", "error");
        let mAwalEl = document.getElementById('shift-modal-awal'); let m_awal = mAwalEl ? this.getNumericValue(mAwalEl.value) : 0;
        if (m_awal === 0 && (!mAwalEl || mAwalEl.value === '')) return this.showToast("Uang Laci Awal wajib diisi!", "error");

        let tim = []; let hasSenior = false;
        cbs.forEach(cb => {
            tim.push({ username: cb.value, role: cb.getAttribute('data-role') });
            if (String(cb.getAttribute('data-role')).toLowerCase().includes('senior') || String(cb.getAttribute('data-role')).toLowerCase().includes('admin')) hasSenior = true;
        });
        if (!hasSenior) return this.showToast("Ditolak: Wajib 1 Senior dalam Shift!", "error");

        this.setLoading(true, "Membuka Laci Kasir...");
        let shiftID = 'SHF' + new Date().getTime();
        const payload = { action: 'buka_shift', outlet: this.outlet, tim: tim, modal_awal: m_awal, id_shift: shiftID };
        let res = await this.apiPost(payload);

        if (res.status === 'sukses') {
            this.activeShiftId = shiftID; this.activeStaffTeam = tim;
            if (res.is_offline) {
                let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
                this.db.shifts.push({ ID_Shift: shiftID, Tanggal: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`, Outlet: this.outlet, Waktu_Tutup: '', Tim_Operasional: JSON.stringify(tim), Modal_Awal: m_awal });
            }
            this.closeModal('modal-shift'); const posView = document.getElementById('view-pos'); if (posView) posView.classList.remove('blur-lock');
            this.showToast(res.is_offline ? "Shift Dibuka (Mode Offline)" : "Shift Dibuka! Laci siap digunakan.");
        }
        this.setLoading(false);
    },
    openKasKeluar: function() {
        const nom = document.getElementById('kas-out-nominal'); if (nom) nom.value = '';
        const ket = document.getElementById('kas-out-ket'); if (ket) ket.value = '';
        const mod = document.getElementById('modal-kas-keluar'); const modc = document.getElementById('modal-kas-keluar-content');
        if (mod && modc) { mod.classList.remove('hidden'); setTimeout(() => modc.classList.add('modal-enter-active'), 10); }
    },
    executeKasKeluar: async function() {
        if (this.isProcessing) return;
        let nomEl = document.getElementById('kas-out-nominal'); let ketEl = document.getElementById('kas-out-ket');
        if (!nomEl || !ketEl) return; let nom = this.getNumericValue(nomEl.value); let ket = ketEl.value;
        if (nom === 0 || !ket) return this.showToast("Nominal dan Keterangan wajib diisi!", "error");

        this.setLoading(true, "Mencatat Pengeluaran...");
        let kasId = 'KAS' + new Date().getTime();
        const payload = { action: 'kas_keluar', id_kas: kasId, outlet: this.outlet, kasir: this.currentUser.Username, nominal: nom, keterangan: ket, id_shift: this.activeShiftId };

        let res = await this.apiPost(payload);
        if (res.status === 'sukses') {
            if (res.is_offline) {
                let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
                if (!this.db.kasKeluar) this.db.kasKeluar = [];
                this.db.kasKeluar.push({ ID_Kas: kasId, Tanggal: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`, Waktu: `${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`, Outlet: this.outlet, Kasir: this.currentUser.Username, Nominal: nom, Keterangan: ket, ID_Shift: this.activeShiftId });
            }
            this.closeModal('modal-kas-keluar'); this.showToast("Kas Keluar Tersimpan.");
            if (!res.is_offline) { const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); this.db = await r.json(); this.refreshData(); }
        }
        this.setLoading(false);
    },
   promptTutupShift: function() {
        const setAkhir = document.getElementById('shift-setoran-akhir'); if (setAkhir) setAkhir.value = '';
        
        // 1. Dapatkan Tanggal Hari Ini Sesuai Format Server
        let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
        let todayStrLocal = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

        let modal = 0; let salesTunai = 0; let totalKasKeluar = 0;

        // 2. Jumlahkan semua Modal Awal dalam 1 HARI PENUH (Bisa jadi kasir input modal > 1 kali)
        (this.db.shifts || []).forEach(s => {
            if (s.Outlet === this.outlet && s.Tanggal === todayStrLocal) {
                modal += Number(s.Modal_Awal || 0);
            }
        });

        // 3. Jumlahkan semua Penjualan TUNAI dalam 1 HARI PENUH (Abaikan ID Shift)
        (this.db.transactions || []).forEach(t => {
            let t_date = this.cleanDateOnly(t.Tanggal);
            if (t.Outlet === this.outlet && t_date === todayStrLocal && t.Status === 'Sukses' && String(t.Metode_Bayar || '').toUpperCase() === 'TUNAI') {
                salesTunai += Number(t.Total_Bayar);
            }
        });

        // 4. Jumlahkan semua Kas Keluar dalam 1 HARI PENUH
        (this.db.kasKeluar || []).forEach(k => { 
            let k_date = this.cleanDateOnly(k.Tanggal);
            if (k.Outlet === this.outlet && k_date === todayStrLocal) {
                totalKasKeluar += Number(k.Nominal); 
            }
        });

        // Kalkulasi Uang Fisik yang harusnya ada di Laci hari ini
        let expected = modal + salesTunai - totalKasKeluar;

        const tMod = document.getElementById('ts-modal'); if (tMod) tMod.innerText = `Rp ${modal.toLocaleString('id-ID')}`;
        const tSal = document.getElementById('ts-sales'); if (tSal) tSal.innerText = `Rp ${salesTunai.toLocaleString('id-ID')}`;
        const tKas = document.getElementById('ts-kasout'); if (tKas) tKas.innerText = `Rp ${totalKasKeluar.toLocaleString('id-ID')}`;
        const tExp = document.getElementById('ts-expected'); if (tExp) tExp.innerText = `Rp ${expected.toLocaleString('id-ID')}`;

        const modalTutup = document.getElementById('modal-tutup-shift'); const modalTutupContent = document.getElementById('modal-tutup-shift-content');
        if (modalTutup && modalTutupContent) { modalTutup.classList.remove('hidden'); setTimeout(() => modalTutupContent.classList.add('modal-enter-active'), 10); }
    },
    
    executeTutupShift: async function() {
        if (this.isProcessing) return;
        let setAkhirEl = document.getElementById('shift-setoran-akhir'); let setor = setAkhirEl ? this.getNumericValue(setAkhirEl.value) : 0;
        if (setor === 0 && (!setAkhirEl || setAkhirEl.value === '')) return this.showToast("Hitung uang fisik di laci!", "error");

        let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
        let todayStrLocal = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

        let modal = 0; let salesTunai = 0; let totalKasKeluar = 0;

        // Lakukan kalkulasi ulang saat eksekusi agar data sangat akurat
        (this.db.shifts || []).forEach(s => { if (s.Outlet === this.outlet && s.Tanggal === todayStrLocal) modal += Number(s.Modal_Awal || 0); });
        (this.db.transactions || []).forEach(t => { 
            let t_date = this.cleanDateOnly(t.Tanggal);
            if (t.Outlet === this.outlet && t_date === todayStrLocal && t.Status === 'Sukses' && String(t.Metode_Bayar || '').toUpperCase() === 'TUNAI') salesTunai += Number(t.Total_Bayar); 
        });
        (this.db.kasKeluar || []).forEach(k => { 
            let k_date = this.cleanDateOnly(k.Tanggal);
            if (k.Outlet === this.outlet && k_date === todayStrLocal) totalKasKeluar += Number(k.Nominal); 
        });

        let expected = modal + salesTunai - totalKasKeluar; 
        let selisih = setor - expected;

        this.setLoading(true, "Merekap Penjualan Hari Ini...");
        const payload = { action: 'tutup_shift', id_shift: this.activeShiftId, setoran_akhir: setor, selisih: selisih };
        let res = await this.apiPost(payload);

        if (res.status === 'sukses') {
            alert(`REKAP HARIAN DITUTUP!\n\nUang Sistem (1 Hari): Rp ${expected.toLocaleString('id-ID')}\nUang Fisik (Setoran): Rp ${setor.toLocaleString('id-ID')}\nSelisih: Rp ${selisih.toLocaleString('id-ID')}`);
            location.reload();
        }
        this.setLoading(false);
    },

    // POS CORE
    refreshData: function() {
        const hSub = document.getElementById('header-subtitle'); if (hSub) hSub.innerText = `${this.outlet}`;
        const lOutManage = document.getElementById('label-outlet-manage'); if (lOutManage) lOutManage.innerText = this.outlet;

        this.filteredProducts = [];
        if (this.db && this.db.masterProduk) {
            this.db.masterProduk.forEach(master => {
                if (String(master.Kategori || '').toLowerCase() !== 'bahan' && String(master.Kategori || '').toLowerCase() !== 'pendukung') {
                    let hargaOutlet = (this.db.hargaStokOutlet || []).find(x => x.SKU === master.SKU && x.ID_Outlet === this.outlet);
                    let stokReference = master.SKU_Bahan ? master.SKU_Bahan : master.SKU;
                    let stokBahan = (this.db.hargaStokOutlet || []).find(x => x.SKU === stokReference && x.ID_Outlet === this.outlet);
                    if (hargaOutlet && hargaOutlet.Harga_Jual > 0) {
                        let qtySisa = stokBahan ? stokBahan.Stok_Toko : 0;
                        this.filteredProducts.push({ sku: master.SKU, nama: master.Nama_Produk, img: master.Gambar_URL, harga: hargaOutlet.Harga_Jual, maxStok: qtySisa, sku_bahan: master.SKU_Bahan });
                    }
                }
            });
        }
        this.filteredProducts.sort((a, b) => String(a.nama || '').localeCompare(String(b.nama || '')));

        if (document.getElementById('product-list')) this.renderProducts();
        if (typeof this.renderReport === 'function') this.renderReport();
        if (typeof this.renderGudang === 'function') this.renderGudang();
        if (typeof this.renderStaf === 'function') this.renderStaf();
        if (typeof this.renderOpname === 'function') this.renderOpname();
        if (typeof this.renderAudit === 'function') this.renderAudit();
        if (typeof this.renderTerimaBarang === 'function') this.renderTerimaBarang();
        if (typeof this.generateAIReport === 'function') this.generateAIReport();
    },
    changeOutlet: function(val) { this.outlet = val; this.cart = []; this.renderCart(); this.checkShiftStatus(); this.refreshData(); },
    switchMenu: function(menu) {
        document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.nav-btn').forEach(b => { b.classList.remove('nav-active'); b.classList.add('text-slate-500'); });

        const activeNav = document.getElementById(`nav-${menu}`); if (activeNav) { activeNav.classList.add('nav-active'); activeNav.classList.remove('text-slate-500'); }
        const activeView = document.getElementById(`view-${menu}`); if (activeView) activeView.classList.remove('hidden');

        const titles = { 'pos': 'Point of Sale', 'opname': 'Opname Fisik Stok', 'terima': 'Penerimaan Barang', 'audit': 'Audit Laporan', 'report': 'Laporan Terpadu', 'ai': 'Asisten AI', 'gudang': 'Gudang Pusat', 'master': 'Master Varian POS', 'outlet': 'Cabang & Harga Khusus', 'staf': 'Kinerja Karyawan' };
        const pageTitle = document.getElementById('page-title'); if (pageTitle) pageTitle.innerText = titles[menu] || 'Aplikasi';

        if (window.innerWidth < 1024) this.toggleSidebar();

        if (menu === 'pos' && !this.activeShiftId) this.checkShiftStatus();
        if (menu === 'report' && typeof this.renderReport === 'function') this.renderReport();
        if (menu === 'opname' && typeof this.renderOpname === 'function') this.renderOpname();
        if (menu === 'audit' && typeof this.renderAudit === 'function') this.renderAudit();
        if (menu === 'terima' && typeof this.renderTerimaBarang === 'function') this.renderTerimaBarang();
        if (menu === 'ai' && typeof this.generateAIReport === 'function') this.generateAIReport();
        if (menu === 'staf' && typeof this.renderStaf === 'function') this.renderStaf();
    },
    filterProducts: function(key) {
        let pList = document.getElementById('product-list');
        if (pList) {
            if (this.isLoadingData) return;
            pList.innerHTML = this.filteredProducts.filter(p => String(p.nama || '').toLowerCase().includes(key.toLowerCase())).map(p => this.createProductCard(p)).join('');
        }
    },
    renderProducts: function() {
        const list = document.getElementById('product-list'); if (!list) return;
        if (this.isLoadingData) { list.innerHTML = Array(8).fill(0).map(() => `<div class="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex flex-col h-40"><div class="skeleton h-24 rounded-xl mb-3 w-full"></div><div class="skeleton h-4 w-3/4 rounded mb-2"></div><div class="skeleton h-4 w-1/2 rounded"></div></div>`).join(''); return; }
        list.innerHTML = this.filteredProducts.map(p => this.createProductCard(p)).join('');
    },
    createProductCard: function(p) {
        let img = p.img ? `<img src="${p.img}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/150x150/f8fafc/94a3b8?text=Err';" class="w-full h-full object-cover transition duration-300 group-hover:scale-105">` : `<div class="w-full h-full flex items-center justify-center text-2xl text-slate-300 opacity-50"><img src="https://cdn-icons-png.flaticon.com/512/3081/3081308.png" class="w-12 h-12 grayscale opacity-50"></div>`;
        let isHabis = p.maxStok <= 0 ? 'item-empty' : '';
        return `<div onclick="${p.maxStok > 0 ? `superApp.addToCart('${p.sku}', '${p.nama}', ${p.harga}, ${p.maxStok}, '${p.sku_bahan || ''}', event)` : ''}" class="bg-white border border-slate-100 rounded-[1.5rem] p-3 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col relative group ${isHabis}"><span class="absolute top-3 right-3 ${p.maxStok <= 0 ? 'bg-red-500' : 'bg-slate-900/80 backdrop-blur'} text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10 shadow-sm">${p.maxStok <= 0 ? 'Habis' : `Sisa: ${p.maxStok}`}</span><div class="aspect-square mb-3 overflow-hidden rounded-xl bg-slate-50 relative">${img}</div><h3 class="font-extrabold text-xs text-slate-800 leading-tight mb-1 flex-1">${p.nama}</h3><p class="text-brand-500 font-black text-sm">Rp ${p.harga.toLocaleString('id-ID')}</p></div>`;
    },
    addToCart: function(sku, nama, price, maxStok, skuBahan, event) {
        let currentStokBahanDiKeranjang = 0; let refBahan = skuBahan || sku;
        this.cart.forEach(i => { if ((i.sku_bahan || i.sku) === refBahan) currentStokBahanDiKeranjang += i.qty; });
        if (currentStokBahanDiKeranjang >= maxStok) return this.showToast(`Stok Habis! Sisa di Toko: ${maxStok - currentStokBahanDiKeranjang}`, 'error');

        if (event) {
            const cartIcon = document.getElementById('cart-badge');
            if (cartIcon) {
                const rect = cartIcon.getBoundingClientRect(); const dot = document.createElement('div');
                dot.className = 'fly-dot'; dot.style.left = event.clientX + 'px'; dot.style.top = event.clientY + 'px';
                document.body.appendChild(dot);
                requestAnimationFrame(() => { dot.style.transform = `translate(${rect.left - event.clientX}px, ${rect.top - event.clientY}px) scale(0.5)`; dot.style.opacity = '0'; });
                setTimeout(() => dot.remove(), 500);
            }
        }
        let item = this.cart.find(i => i.sku === sku);
        if (item) item.qty++; else this.cart.push({ sku, nama, price, qty: 1, sku_bahan: skuBahan, maxStok: maxStok });
        this.renderCart();
        setTimeout(() => { const cont = document.getElementById('cart-container'); if (cont) cont.scrollTop = cont.scrollHeight; }, 50);
    },
    changeQty: function(idx, val) { this.cart[idx].qty += val; if (this.cart[idx].qty <= 0) this.cart.splice(idx, 1); this.renderCart(); },
    renderCart: function() {
        const cont = document.getElementById('cart-container'); let total = 0, items = 0, html = ''; if (!cont) return;
        this.cart.forEach((i, idx) => {
            total += (i.price * i.qty); items += i.qty;
            let sisaBahanDiKeranjang = 0; let refBahan = i.sku_bahan || i.sku;
            this.cart.forEach(c => { if ((c.sku_bahan || c.sku) === refBahan) sisaBahanDiKeranjang += c.qty; });
            let stokTersisaVisual = i.maxStok - sisaBahanDiKeranjang;

            html += `<div class="flex bg-white border border-slate-100 p-3 rounded-[1rem] shadow-sm items-center gap-2 text-slate-800 transition transform hover:-translate-x-1"><div class="flex-1 min-w-0"><h4 class="font-bold text-xs truncate text-slate-700">${i.nama}</h4><p class="text-[10px] text-slate-400 mb-1">Sisa Stok: <span class="font-bold ${stokTersisaVisual <= 0 ? 'text-red-500' : 'text-brand-500'}">${stokTersisaVisual}</span></p><p class="text-brand-500 font-black text-sm">Rp ${(i.price * i.qty).toLocaleString('id-ID')}</p></div><div class="flex bg-slate-50 rounded-lg border border-slate-200 shadow-inner"><button onclick="superApp.changeQty(${idx}, -1)" class="w-8 h-8 font-bold hover:text-brand-500 hover:bg-slate-100 rounded-l-lg transition">-</button><span class="w-8 text-center text-xs font-black flex items-center justify-center">${i.qty}</span><button onclick="superApp.changeQty(${idx}, 1)" class="w-8 h-8 font-bold hover:text-brand-500 hover:bg-slate-100 rounded-r-lg transition">+</button></div></div>`;
        });
        cont.innerHTML = this.cart.length ? html : this.getEmptyState('fa-basket-shopping', 'Keranjang Kosong', 'Yuk, tambahkan pesanan!');
        
        const totalEl = document.getElementById('total-price'); if (totalEl) totalEl.innerText = `Rp ${total.toLocaleString('id-ID')}`;
        const badge = document.getElementById('cart-badge'); if (badge) badge.innerText = `${items} Item`;
        this.payTotal = total; this.syncStorage();
    },

    // PAYMENT
    openPaymentModal: function() {
        if (this.cart.length === 0) return this.showToast("Pilih produk dahulu!", "error");
        const pt = document.getElementById('pay-total'); if (pt) pt.innerText = `Rp ${this.payTotal.toLocaleString('id-ID')}`;
        this.setPaymentMethod('Tunai'); this.setCash('');
        const mp = document.getElementById('modal-payment'); const mpc = document.getElementById('modal-payment-content');
        if (mp && mpc) { mp.classList.remove('hidden'); setTimeout(() => { mpc.classList.add('modal-enter-active'); }, 100); }
    },
    setPaymentMethod: function(method) {
        this.payMethod = method;
        const btnTunai = document.getElementById('btn-pay-tunai'); const btnQris = document.getElementById('btn-pay-qris'); const sectTunai = document.getElementById('tunai-section');
        if (method === 'Tunai') {
            if (btnTunai) btnTunai.className = 'py-3.5 border-2 border-brand-500 bg-brand-50 text-brand-600 rounded-xl font-bold transition';
            if (btnQris) btnQris.className = 'py-3.5 border-2 border-slate-200 bg-white text-slate-500 rounded-xl font-bold transition hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50';
            if (sectTunai) sectTunai.classList.remove('hidden');
        } else {
            if (btnQris) btnQris.className = 'py-3.5 border-2 border-blue-500 bg-blue-50 text-blue-600 rounded-xl font-bold transition';
            if (btnTunai) btnTunai.className = 'py-3.5 border-2 border-slate-200 bg-white text-slate-500 rounded-xl font-bold transition hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50';
            if (sectTunai) sectTunai.classList.add('hidden');
            this.setCash('pas');
        }
    },
    addPayNumpad: function(val) {
        let input = document.getElementById('pay-cash-input');
        if (input) { let current = this.getNumericValue(input.value); this.setCash(current + val); }
    },
    setCash: function(val) {
        let input = document.getElementById('pay-cash-input');
        if (input) {
            if (val === 'pas') { input.value = this.payTotal.toLocaleString('id-ID'); this.payCash = this.payTotal; } 
            else if (val === 0 || val === '') { input.value = ''; this.payCash = 0; } 
            else { input.value = val.toLocaleString('id-ID'); this.payCash = val; }
        }
        this.calcChange();
    },
    calcChange: function() {
        let input = document.getElementById('pay-cash-input');
        if (input) this.payCash = this.getNumericValue(input.value);
        this.payChange = this.payCash - this.payTotal;
        let btn = document.getElementById('btn-execute-pay'), changeEl = document.getElementById('pay-change');
        if (changeEl && btn) {
            if (this.payChange < 0) {
                changeEl.innerText = `Kurang Rp ${Math.abs(this.payChange).toLocaleString('id-ID')}`;
                changeEl.classList.replace('text-slate-800', 'text-red-500');
                btn.disabled = true; btn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                changeEl.innerText = `Rp ${this.payChange.toLocaleString('id-ID')}`;
                changeEl.classList.replace('text-red-500', 'text-slate-800');
                btn.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    },
    
    // PENAMBAHAN SISTEM NOMOR ANTRIAN
    executeCheckout: async function() {
        // Kunci tombol agar tidak terklik ganda, tapi jangan pakai layar loading penuh
        if (this.isProcessing) return; 
        this.isProcessing = true;
        
        let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
        let todayStrLocal = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        
        // Hitung Antrian Hari Ini
        let countToday = 0;
        (this.db.transactions || []).forEach(t => {
            if (t.Outlet === this.outlet && this.cleanDateOnly(t.Tanggal) === todayStrLocal) { countToday++; }
        });
        let noAntrian = countToday + 1;

        let trxID = 'TRX' + d.getTime();
        const payload = { action: 'checkout', trx_id: trxID, outlet: this.outlet, kasir: this.currentUser.Username, metode_bayar: this.payMethod, total: this.payTotal, tunai: this.payCash, kembali: this.payChange, items: this.cart, id_shift: this.activeShiftId, tim_operasional: this.activeStaffTeam, antrian: noAntrian };

        // 1. CETAK STRUK & UPDATE LAYAR CFD (INSTAN)
        try { 
            await this.printReceipt(trxID, this.outlet, this.payTotal, this.payCash, this.payChange, this.cart, 'Sukses', null, noAntrian); 
        } catch (e) {
            console.log("Printer belum siap atau dibatalkan");
        }
        this.syncStorage('paid', noAntrian);

        // 2. CATAT KE MEMORI LOKAL SECARA PAKSA (OPTIMISTIC UI)
        if (!this.db.transactions) this.db.transactions = [];
        this.db.transactions.push({ 
            ID_TRX: trxID, Tanggal: todayStrLocal, 
            Waktu: `${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`, 
            Outlet: this.outlet, Kasir: this.currentUser.Username, Metode_Bayar: this.payMethod, 
            Total_Bayar: this.payTotal, Tunai: this.payCash, Kembalian: this.payChange, 
            Items_JSON: JSON.stringify(this.cart), ID_Shift: this.activeShiftId, 
            Status: 'Sukses', Antrian: noAntrian 
        });
        
        // Amankan memori lokal agar tidak hilang jika di-refresh
        localStorage.setItem('aisnack_db_cache', JSON.stringify(this.db));
        
        // Perbarui layar rekap & histori saat itu juga
        this.refreshData(); 
        
        this.showToast(`Transaksi Sukses! No Antrian: ${noAntrian}`);

        // 3. BERSIHKAN LAYAR KASIR (0 DETIK - SIAP LAYANI PELANGGAN BERIKUTNYA)
        this.cart = []; 
        this.renderCart(); 
        this.closeModal('modal-payment'); 
        this.isProcessing = false; // Buka kunci tombol untuk pelanggan selanjutnya

        // ========================================================
        // 4. SILENT BACKGROUND SYNC (Proses Gaib Tanpa Ditunggu Kasir)
        // ========================================================
        this.apiPost(payload).then(res => {
            // Jika sukses, Google Sheets sudah menerima data.
            // Jika gagal secara aneh dari server (tapi internet nyala), lempar ke antrean offline.
            if (res && res.status !== 'sukses' && !res.is_offline) {
               this.offlineQueue.push(payload);
               localStorage.setItem('aisnack_offline_queue', JSON.stringify(this.offlineQueue));
               this.updateNetworkUI();
            }
        }).catch(err => {
            // Jika error koneksi, apiPost sudah otomatis memasukkannya ke offlineQueue.
            console.log("Silent Sync tertunda, masuk ke antrean offline.");
        });
    },

    // TERIMA BARANG, OPNAME & WA MODAL
    showWaModal: function(waText) {
        try { navigator.clipboard.writeText(waText); } catch (err) { 
            let txtArea = document.createElement("textarea"); txtArea.value = waText; document.body.appendChild(txtArea); 
            txtArea.select(); try { document.execCommand("copy"); } catch(e){} document.body.removeChild(txtArea); 
        }
        let waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`; 
        const btnGoWa = document.getElementById('btn-go-wa');
        const btnCopyWa = document.getElementById('btn-copy-wa');

        if (btnGoWa) {
            btnGoWa.onclick = () => {
                let popWin = window.open(waUrl, '_blank'); 
                if(!popWin || popWin.closed || typeof popWin.closed === 'undefined') {
                    window.location.href = waUrl; 
                }
                this.closeModal('modal-wa-confirm');
            };
        }
        if (btnCopyWa) {
            btnCopyWa.onclick = () => {
                try { navigator.clipboard.writeText(waText); } catch (err) { 
                    let txtArea = document.createElement("textarea"); txtArea.value = waText; document.body.appendChild(txtArea); 
                    txtArea.select(); try { document.execCommand("copy"); } catch(e){} document.body.removeChild(txtArea); 
                }
                this.showToast("Teks Berhasil Disalin!", "success");
                btnCopyWa.innerHTML = `<i class="fas fa-check"></i> Sudah Tersalin!`;
                setTimeout(() => { btnCopyWa.innerHTML = `<i class="fas fa-copy"></i> Salin Teks Laporan`; }, 2000);
            };
        }
        const mWa = document.getElementById('modal-wa-confirm'); 
        const mWac = document.getElementById('modal-wa-confirm-content');
        if(mWa && mWac) { mWa.classList.remove('hidden'); setTimeout(() => mWac.classList.add('modal-enter-active'), 10); }
    },
    openWaHistory: function(type) {
        const tbody = document.getElementById('wa-history-tbody');
        if(!tbody) return;
        let grouped = {};
        
        if (type === 'terima') {
            document.getElementById('wa-history-title').innerText = 'Riwayat Terima Barang';
            (this.db.mutasi || []).forEach(m => {
                if (m.Outlet_Tujuan === this.outlet) {
                    let w = String(m.Waktu);
                    if(!grouped[w]) grouped[w] = { kasir: m.Kasir, items: [], waktu: w };
                    let nama = this.db.masterProduk.find(x => x.SKU === m.SKU)?.Nama_Produk || m.SKU;
                    grouped[w].items.push({ nama: nama, qty: m.Qty, note: m.Keterangan });
                }
            });
        } else {
            document.getElementById('wa-history-title').innerText = 'Riwayat Opname Fisik';
            (this.db.opname || []).forEach(o => {
                if (o.Outlet === this.outlet) {
                    let w = String(o.Waktu);
                    if(!grouped[w]) grouped[w] = { kasir: o.Kasir, items: [], waktu: w };
                    let nama = this.db.masterProduk.find(x => x.SKU === o.SKU)?.Nama_Produk || o.SKU;
                    grouped[w].items.push({ nama: nama, sys: o.Stok_Sistem, fisik: o.Stok_Fisik, selisih: o.Selisih, note: o.Keterangan_Fisik });
                }
            });
        }

        let arr = Object.values(grouped).sort((a,b) => new Date(this.parseDateId(b.waktu)) - new Date(this.parseDateId(a.waktu)));
        let html = '';
        arr.slice(0, 50).forEach(g => { 
            let safeWaktu = g.waktu.includes('T') ? this.cleanDateOnly(g.waktu) + ' ' + this.cleanTimeOnly(g.waktu) : g.waktu;
            let btnAction = `<button onclick="superApp.resendWa('${type}', '${encodeURIComponent(g.waktu)}')" class="bg-[#25D366] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#20bd5a] transition"><i class="fab fa-whatsapp mr-1"></i> Kirim</button>`;
            html += `<tr class="border-b border-slate-50 hover:bg-slate-100 transition"><td class="py-3 px-4 text-xs">${safeWaktu}</td><td class="py-3 px-4 text-xs font-bold">${g.kasir}</td><td class="py-3 px-4 text-center text-xs">${g.items.length} Item</td><td class="py-3 px-4 text-center">${btnAction}</td></tr>`;
        });
        
        tbody.innerHTML = html || `<tr><td colspan="4" class="text-center py-6 text-slate-400 text-xs italic">Belum ada riwayat laporan</td></tr>`;
        
        const mod = document.getElementById('modal-wa-history');
        const modc = document.getElementById('modal-wa-history-content');
        if(mod && modc) { mod.classList.remove('hidden'); setTimeout(() => modc.classList.add('modal-enter-active'), 10); }
    },
    resendWa: function(type, encodedWaktu) {
        let waktu = decodeURIComponent(encodedWaktu);
        let waText = '';
        if (type === 'terima') {
            waText = `*LAPORAN BARANG DATANG PUSAT*\n📍 Cabang: ${this.outlet}\n📅 Waktu: ${waktu}\n\n*_Mohon cek aplikasi menu Audit untuk memverifikasi agar stok masuk ke sistem_*\n\n`;
            (this.db.mutasi || []).forEach(m => {
                if (m.Outlet_Tujuan === this.outlet && String(m.Waktu) === waktu) {
                    let nama = this.db.masterProduk.find(x => x.SKU === m.SKU)?.Nama_Produk || m.SKU;
                    waText += `📦 *${nama}*\nQty Diterima: *${m.Qty} Pcs*\nCatatan: ${m.Keterangan || '-'}\n\n`;
                }
            });
        } else {
            // Logika Opname diarahkan menggunakan Helper Pembuat Laporan AI
            let itemsForWa = [];
            let kasirName = '';
            
            (this.db.opname || []).forEach(o => {
                if (o.Outlet === this.outlet && String(o.Waktu) === waktu) {
                    kasirName = o.Kasir;
                    let m = this.db.masterProduk.find(x => x.SKU === o.SKU) || {};
                    itemsForWa.push({ 
                        sku: o.SKU, 
                        nama: m.Nama_Produk || o.SKU, 
                        kategori: m.Kategori || 'Bahan', 
                        sys: o.Stok_Sistem, 
                        fisik: o.Stok_Fisik, 
                        selisih: o.Selisih, 
                        note: o.Keterangan_Fisik 
                    });
                }
            });
            
            // Panggil Fungsi Pabrik Teks (Helper)
            waText = this.buildOpnameWaText(this.outlet, kasirName, waktu, itemsForWa);
        }
        
        this.closeModal('modal-wa-history');
        this.showWaModal(waText);
    },
    renderTerimaBarang: function() {
        const lbl = document.getElementById('lbl-terima-outlet'); if (lbl) lbl.innerText = this.outlet;
        let hu = ''; let hp = ''; let hum = ''; let hpm = '';
        [...(this.db.masterProduk || [])].sort((a, b) => String(a.Nama_Produk || '').localeCompare(String(b.Nama_Produk || ''))).forEach(m => {
            if (String(m.Kategori || '').toLowerCase() === 'bahan' || String(m.Kategori || '').toLowerCase() === 'pendukung') {
                let strHtml = `<tr class="border-b border-slate-50"><td class="py-3 px-4 min-w-[150px] whitespace-normal text-slate-800">${m.Nama_Produk}<br><span class="text-[10px] text-slate-400 font-normal">${m.SKU}</span></td><td class="py-3 px-4 text-center"><input type="text" id="trm-qty-${m.SKU}" class="w-24 border-2 border-slate-200 rounded-lg px-2 py-1 text-center outline-none focus:border-brand-500 bg-white text-slate-800 font-bold cursor-pointer" readonly onclick="osKeyboard.open('trm-qty-${m.SKU}', 'numeric')" placeholder="0"></td><td class="py-3 px-4"><input type="text" id="trm-note-${m.SKU}" class="w-full border border-slate-200 rounded-lg px-3 py-1 outline-none text-xs text-slate-800 cursor-pointer" readonly onclick="osKeyboard.open('trm-note-${m.SKU}', 'text')" placeholder="Keterangan kurir/kondisi..."></td></tr>`;
                let strMobile = `<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3"><h4 class="font-extrabold text-sm text-slate-800">${m.Nama_Produk}</h4><div class="flex gap-2"><input type="text" id="trm-qty-mob-${m.SKU}" class="w-1/3 border-2 border-slate-200 rounded-xl px-3 py-2 text-center outline-none focus:border-brand-500 bg-white text-slate-800 font-bold text-sm cursor-pointer" readonly onclick="osKeyboard.open('trm-qty-mob-${m.SKU}', 'numeric')" placeholder="Qty"><input type="text" id="trm-note-mob-${m.SKU}" class="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 outline-none text-xs text-slate-800 cursor-pointer" readonly onclick="osKeyboard.open('trm-note-mob-${m.SKU}', 'text')" placeholder="Catatan..."></div></div>`;
                if (String(m.Kategori || '').toLowerCase() === 'bahan') { hu += strHtml; hum += strMobile; } else { hp += strHtml; hpm += strMobile; }
            }
        });
        const tU = document.getElementById('terima-tbody-utama'); if (tU) tU.innerHTML = hu || this.getEmptyState('fa-box-open', 'Belum Ada Bahan', 'Tambahkan bahan di menu gudang');
        const tP = document.getElementById('terima-tbody-pendukung'); if (tP) tP.innerHTML = hp || this.getEmptyState('fa-box-open', 'Belum Ada Barang', 'Tambahkan pendukung di gudang');
        const tMob = document.getElementById('terima-mobile-cards'); if (tMob) tMob.innerHTML = `<h4 class="font-extrabold text-brand-600 mt-2 mb-2 bg-brand-50 p-3 rounded-xl border border-brand-100 text-sm">A. Bahan Utama</h4>` + (hum || '<p class="text-xs text-center">Kosong</p>') + `<h4 class="font-extrabold text-slate-600 mt-6 mb-2 bg-slate-100 p-3 rounded-xl border border-slate-200 text-sm">B. Pendukung & Packaging</h4>` + (hpm || '<p class="text-xs text-center">Kosong</p>');
    },
    submitTerimaBarang: async function() {
        if (this.isProcessing) return;
        if (!confirm("Kirim Laporan Barang Datang ke Owner? Stok tidak akan bertambah hingga di-Setujui.")) return;
        this.setLoading(true, "Menyimpan...");
        let items = [];
        let waText = `*LAPORAN BARANG DATANG PUSAT*\n📍 Cabang: ${this.outlet}\n👤 Kasir: ${this.currentUser.Username}\n📅 Waktu: ${new Date().toLocaleString('id-ID')}\n\n*_Mohon cek aplikasi menu Audit untuk memverifikasi agar stok masuk ke sistem_*\n\n`;

        (this.db.masterProduk || []).forEach(m => {
            if (String(m.Kategori || '').toLowerCase() === 'bahan' || String(m.Kategori || '').toLowerCase() === 'pendukung') {
                let inputDesk = document.getElementById(`trm-qty-${m.SKU}`); let inputMob = document.getElementById(`trm-qty-mob-${m.SKU}`);
                let qtyStr = inputDesk && inputDesk.value !== '' ? inputDesk.value : (inputMob && inputMob.value !== '' ? inputMob.value : '');

                if (qtyStr !== '' && parseInt(this.getNumericValue(qtyStr)) > 0) {
                    let noteDesk = document.getElementById(`trm-note-${m.SKU}`); let noteMob = document.getElementById(`trm-note-mob-${m.SKU}`);
                    let note = noteDesk && noteDesk.value !== '' ? noteDesk.value : (noteMob && noteMob.value !== '' ? noteMob.value : '');
                    items.push({ sku: m.SKU, qty: parseInt(this.getNumericValue(qtyStr)), catatan: note });
                    waText += `📦 *${m.Nama_Produk}*\nQty Diterima: *${qtyStr} Pcs*\nCatatan: ${note || '-'}\n\n`;
                }
            }
        });
        if (items.length === 0) { this.setLoading(false); return this.showToast("Tidak ada barang masuk yang diinput!", "error"); }

        const payload = { action: 'terima_barang_kasir', outlet: this.outlet, kasir: this.currentUser.Username, items: items };
        let res = await this.apiPost(payload);
        
        if (res.status === 'sukses') {
            this.showToast("Berhasil Disimpan di Sistem!");
            this.showWaModal(waText);
            if (!res.is_offline) { const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); this.db = await r.json(); this.refreshData(); this.switchMenu('pos'); }
            else { this.switchMenu('pos'); }
        }
        this.setLoading(false);
    },
    renderOpname: function() {
        const lbl = document.getElementById('lbl-opname-outlet'); if (lbl) lbl.innerText = this.outlet;
        let hu = ''; let hp = ''; let hum = ''; let hpm = '';
        [...(this.db.masterProduk || [])].sort((a, b) => String(a.Nama_Produk || '').localeCompare(String(b.Nama_Produk || ''))).forEach(m => {
            if (String(m.Kategori || '').toLowerCase() === 'bahan' || String(m.Kategori || '').toLowerCase() === 'pendukung') {
                let sData = (this.db.hargaStokOutlet || []).find(x => x.SKU === m.SKU && x.ID_Outlet === this.outlet);
                let sys = sData ? Number(sData.Stok_Toko) : 0;

                let desk = `<tr class="border-b border-slate-50"><td class="py-3 px-4 min-w-[150px] whitespace-normal text-slate-800">${m.Nama_Produk}<br><span class="text-[10px] text-slate-400 font-normal">${m.SKU}</span></td><td class="py-3 px-4 text-center text-brand-600" id="opn-sys-${m.SKU}">${sys}</td><td class="py-3 px-4 text-center"><input type="text" id="opn-fisik-${m.SKU}" class="w-20 border-2 border-slate-200 rounded-lg px-2 py-1 text-center outline-none focus:border-brand-500 bg-white text-slate-800 cursor-pointer" readonly onclick="osKeyboard.open('opn-fisik-${m.SKU}', 'numeric')" oninput="superApp.calcOpname('${m.SKU}')" placeholder="0"></td><td class="py-3 px-4 text-right font-black text-slate-300" id="opn-selisih-${m.SKU}">-</td><td class="py-3 px-4"><input type="text" id="opn-note-${m.SKU}" class="w-full border border-slate-200 rounded-lg px-2 py-1 outline-none text-xs text-slate-800 cursor-pointer" readonly onclick="osKeyboard.open('opn-note-${m.SKU}', 'text')" placeholder="Kondisi Fisik..."></td></tr>`;
                let mob = `<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3"><div class="flex justify-between items-start"><div><h4 class="font-extrabold text-sm text-slate-800">${m.Nama_Produk}</h4><p class="text-[10px] text-slate-400">Sys: <span id="opn-sys-mob-${m.SKU}" class="font-bold text-brand-500">${sys}</span></p></div><span class="font-black text-slate-300 text-lg" id="opn-selisih-mob-${m.SKU}">-</span></div><div class="flex gap-2"><input type="text" id="opn-fisik-mob-${m.SKU}" class="w-1/3 border-2 border-slate-200 rounded-xl px-3 py-2 text-center outline-none focus:border-brand-500 bg-white text-slate-800 font-bold text-sm cursor-pointer" readonly onclick="osKeyboard.open('opn-fisik-mob-${m.SKU}', 'numeric')" oninput="superApp.calcOpnameMob('${m.SKU}')" placeholder="Fisik"><input type="text" id="opn-note-mob-${m.SKU}" class="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 outline-none text-xs text-slate-800 cursor-pointer" readonly onclick="osKeyboard.open('opn-note-mob-${m.SKU}', 'text')" placeholder="Catatan Kondisi..."></div></div>`;

                if (String(m.Kategori || '').toLowerCase() === 'bahan') { hu += desk; hum += mob; } else { hp += desk; hpm += mob; }
            }
        });

        const tU = document.getElementById('opname-tbody-utama'); if (tU) tU.innerHTML = hu || this.getEmptyState('fa-box-open', 'Belum Ada Bahan', 'Tambahkan bahan di menu gudang');
        const tP = document.getElementById('opname-tbody-pendukung'); if (tP) tP.innerHTML = hp || this.getEmptyState('fa-box-open', 'Belum Ada Barang', 'Tambahkan pendukung di gudang');
        const mobCards = document.getElementById('opname-mobile-cards'); if (mobCards) mobCards.innerHTML = `<h4 class="font-extrabold text-brand-600 mt-2 mb-2 bg-brand-50 p-3 rounded-xl border border-brand-100 text-sm">A. Bahan Utama</h4>` + (hum || '<p class="text-xs text-center">Kosong</p>') + `<h4 class="font-extrabold text-slate-600 mt-6 mb-2 bg-slate-100 p-3 rounded-xl border border-slate-200 text-sm">B. Pendukung & Packaging</h4>` + (hpm || '<p class="text-xs text-center">Kosong</p>');
    },
    calcOpname: function(sku) {
        const sysEl = document.getElementById(`opn-sys-${sku}`); let sys = parseInt(sysEl ? sysEl.innerText : 0) || 0;
        let fisikEl = document.getElementById(`opn-fisik-${sku}`); let fisik = this.getNumericValue(fisikEl ? fisikEl.value : 0);
        let selEl = document.getElementById(`opn-selisih-${sku}`); if (!selEl) return;
        if (isNaN(fisik) || (fisikEl && fisikEl.value === '')) { selEl.innerText = '-'; selEl.className = 'py-3 px-4 text-right font-black text-slate-300'; return; }
        let selisih = fisik - sys; selEl.innerText = selisih > 0 ? `+${selisih}` : selisih;
        if (selisih < 0) selEl.className = 'py-3 px-4 text-right text-red-500 font-black'; else if (selisih > 0) selEl.className = 'py-3 px-4 text-right text-green-500 font-black'; else selEl.className = 'py-3 px-4 text-right text-slate-400 font-black';
    },
    calcOpnameMob: function(sku) {
        const sysEl = document.getElementById(`opn-sys-mob-${sku}`); let sys = parseInt(sysEl ? sysEl.innerText : 0) || 0;
        let fisikEl = document.getElementById(`opn-fisik-mob-${sku}`); let fisik = this.getNumericValue(fisikEl ? fisikEl.value : 0);
        let selEl = document.getElementById(`opn-selisih-mob-${sku}`); if (!selEl) return;
        if (isNaN(fisik) || (fisikEl && fisikEl.value === '')) { selEl.innerText = '-'; selEl.className = 'font-black text-slate-300 text-lg'; return; }
        let selisih = fisik - sys; selEl.innerText = selisih > 0 ? `+${selisih}` : selisih;
        if (selisih < 0) selEl.className = 'font-black text-red-500 text-lg'; else if (selisih > 0) selEl.className = 'font-black text-green-500 text-lg'; else selEl.className = 'font-black text-slate-400 text-lg';
    },
    buildOpnameWaText: function(outlet, kasir, waktu, items) {
        // 1. Hitung Kecepatan Jualan (Velocity) dari Riwayat Transaksi
        let productSales = {};
        let oldestDate = new Date();
        (this.db.transactions || []).forEach(t => {
            let d = this.parseDateId(t.Tanggal); if(d < oldestDate) oldestDate = d;
            if(t.Status === 'Sukses' && t.Outlet === outlet) {
                let parsedItems = []; try { parsedItems = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
                parsedItems.forEach(item => {
                    let nama = item.nama || 'Unknown';
                    if(!productSales[nama]) productSales[nama] = 0;
                    productSales[nama] += Number(item.qty) || 0;
                });
            }
        });
        let daysActive = Math.ceil((new Date() - oldestDate) / (1000 * 60 * 60 * 24)) || 1;

        // 2. Pisahkan Kategori & Urutkan A-Z
        let bahanUtama = [];
        let bahanPendukung = [];

        items.forEach(item => {
            // Kalkulasi sisa umur stok (Stok Fisik / Rata-rata terjual per hari)
            let vel = (productSales[item.nama] || 0) / daysActive;
            let estHari = vel > 0 ? (item.fisik / vel) : 999; 
            item.estHari = Math.floor(estHari);

            if(String(item.kategori).toLowerCase() === 'bahan') bahanUtama.push(item);
            else bahanPendukung.push(item);
        });

        bahanUtama.sort((a,b) => String(a.nama).localeCompare(String(b.nama)));
        bahanPendukung.sort((a,b) => String(a.nama).localeCompare(String(b.nama)));

        // 3. Susun Teks WhatsApp
        let waText = `*LAPORAN OPNAME FISIK & AUDIT*\n📍 Cabang: ${outlet}\n👤 Kasir: ${kasir}\n📅 Waktu: ${waktu}\n\n*_Mohon cek aplikasi menu Audit Opname untuk menyetujui_*\n\n`;

        const renderItems = (arr, title, icon) => {
            if(arr.length === 0) return '';
            let txt = `${icon} *${title}*\n`;
            arr.forEach(i => {
                let alertStr = i.fisik <= 0 ? 'HABIS 🛑' : (i.estHari < 4 ? `${i.estHari} Hari (Kritis ⚠️)` : `${i.estHari > 99 ? '>99' : i.estHari} Hari (Aman ✅)`);
                txt += `🔹 *${i.nama}*\nSys: ${i.sys} | Fisik: ${i.fisik} | Selisih: *${i.selisih}*\n⏳ Estimasi Habis: ${alertStr}\nCatatan: ${i.note || '-'}\n\n`;
            });
            return txt;
        };

        waText += renderItems(bahanUtama, 'A. BAHAN BAKU UTAMA', '📦');
        waText += renderItems(bahanPendukung, 'B. BARANG PENDUKUNG', '🧴');

        return waText;
    },
   submitOpname: async function() {
        if (this.isProcessing) return;
        if (!confirm("Kirim Opname ke Owner? Stok fisik akan diverifikasi (Audit) terlebih dahulu sebelum dirubah pada sistem.")) return;
        this.setLoading(true, "Menyimpan & Mengirim Audit...");
        
        let itemsToSubmit = [];
        let itemsForWa = [];

        (this.db.masterProduk || []).forEach(m => {
            if (String(m.Kategori || '').toLowerCase() === 'bahan' || String(m.Kategori || '').toLowerCase() === 'pendukung') {
                let inputDesk = document.getElementById(`opn-fisik-${m.SKU}`); let inputMob = document.getElementById(`opn-fisik-mob-${m.SKU}`);
                let fisikStr = inputDesk && inputDesk.value !== '' ? inputDesk.value : (inputMob && inputMob.value !== '' ? inputMob.value : '');

                if (fisikStr !== '') {
                    let sysDesk = document.getElementById(`opn-sys-${m.SKU}`); let sysMob = document.getElementById(`opn-sys-mob-${m.SKU}`);
                    let sys = parseInt(sysDesk ? sysDesk.innerText : (sysMob ? sysMob.innerText : 0)) || 0;
                    let fisik = this.getNumericValue(fisikStr);
                    let noteDesk = document.getElementById(`opn-note-${m.SKU}`); let noteMob = document.getElementById(`opn-note-mob-${m.SKU}`);
                    let note = noteDesk && noteDesk.value !== '' ? noteDesk.value : (noteMob && noteMob.value !== '' ? noteMob.value : '');

                    // Data untuk dikirim ke Google Sheets
                    itemsToSubmit.push({ sku: m.SKU, sistem: sys, fisik: fisik, selisih: fisik - sys, catatan: note });
                    // Data mentah untuk diolah fungsi Helper WA
                    itemsForWa.push({ sku: m.SKU, nama: m.Nama_Produk, kategori: m.Kategori, sys: sys, fisik: fisik, selisih: fisik - sys, note: note });
                }
            }
        });
        
        if (itemsToSubmit.length === 0) { this.setLoading(false); return this.showToast("Tidak ada stok yang dihitung!", "error"); }

        // Memanggil Helper untuk mencetak teks WA yang sudah disortir & dianalisa AI
        let waText = this.buildOpnameWaText(this.outlet, this.currentUser.Username, new Date().toLocaleString('id-ID'), itemsForWa);

        const payload = { action: 'submit_opname', outlet: this.outlet, kasir: this.currentUser.Username, items: itemsToSubmit };
        let res = await this.apiPost(payload);
        
        if (res.status === 'sukses') {
            this.showToast("Opname berhasil Disimpan!");
            this.showWaModal(waText);
            if (!res.is_offline) { const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); this.db = await r.json(); this.refreshData(); this.switchMenu('pos'); }
            else { this.switchMenu('pos'); }
        }
        this.setLoading(false);
    },

    // AUDIT & BULK APPROVAL
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
        if (tbodyOp) {
            let html = '';
            (this.db.opname || []).forEach(op => {
                if (op.Status_Approval === 'Pending') {
                    let itemName = this.db.masterProduk.find(m => m.SKU === op.SKU)?.Nama_Produk || op.SKU || 'Unknown';
                    let selColor = op.Selisih < 0 ? 'text-red-500' : (op.Selisih > 0 ? 'text-green-500' : 'text-slate-500');
                    let wStr = this.cleanDateOnly(op.Waktu) + ' ' + this.cleanTimeOnly(op.Waktu);

                    html += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-3 px-4 text-center w-12"><input type="checkbox" class="cb-audit-opname w-5 h-5 rounded cursor-pointer accent-brand-500" value="${op.Waktu}|${op.SKU}|${op.Outlet}|${op.Stok_Fisik}" onchange="superApp.checkBulkAudit()"></td><td class="py-3 px-4 text-xs whitespace-nowrap">${wStr}</td><td class="py-3 px-4 text-xs whitespace-nowrap">${op.Outlet}<br><span class="text-brand-500">${op.Kasir}</span></td><td class="py-3 px-4 text-xs font-bold whitespace-normal min-w-[150px]">${itemName}</td><td class="py-3 px-4 text-center text-xs whitespace-nowrap">Sys: ${op.Stok_Sistem} <i class="fas fa-arrow-right mx-1 text-slate-300"></i> Fisik: ${op.Stok_Fisik}</td><td class="py-3 px-4 text-right font-black ${selColor}">${op.Selisih > 0 ? '+'+op.Selisih : op.Selisih}</td><td class="py-3 px-4 text-xs italic whitespace-normal min-w-[150px]">${op.Keterangan_Fisik || '-'}</td></tr>`;
                }
            });
            tbodyOp.innerHTML = html || `<tr><td colspan="7" class="text-center py-6 h-32">${this.getEmptyState('fa-clipboard-check', 'Audit Bersih', 'Tidak ada laporan opname yang pending')}</td></tr>`;
        }

        const tbodyTr = document.getElementById('audit-terima-tbody');
        if (tbodyTr) {
            let html = '';
            (this.db.mutasi || []).forEach(mt => {
                if (mt.Status_Approval === 'Pending') {
                    let itemName = this.db.masterProduk.find(m => m.SKU === mt.SKU)?.Nama_Produk || mt.SKU || 'Unknown';
                    let safeWaktu = String(mt.Waktu || ''); let wStr = safeWaktu.includes('T') ? this.cleanDateOnly(safeWaktu) + ' ' + this.cleanTimeOnly(safeWaktu) : safeWaktu;

                    html += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-3 px-4 text-center w-12"><input type="checkbox" class="cb-audit-terima w-5 h-5 rounded cursor-pointer accent-brand-500" value="${mt.ID_Mutasi}" onchange="superApp.checkBulkAudit()"></td><td class="py-3 px-4 text-xs whitespace-nowrap">${wStr}</td><td class="py-3 px-4 text-xs whitespace-nowrap">${mt.Outlet_Tujuan}<br><span class="text-brand-500">${mt.Kasir || '-'}</span></td><td class="py-3 px-4 text-xs font-bold whitespace-normal min-w-[150px]">${itemName}</td><td class="py-3 px-4 text-center text-sm font-black text-brand-500 whitespace-nowrap">${mt.Qty} Pcs</td><td class="py-3 px-4 text-xs italic whitespace-normal min-w-[150px]">${mt.Keterangan || '-'}</td></tr>`;
                }
            });
            tbodyTr.innerHTML = html || `<tr><td colspan="6" class="text-center py-6 h-32">${this.getEmptyState('fa-box-open', 'Audit Bersih', 'Tidak ada penerimaan barang yang pending')}</td></tr>`;
        }
        this.checkBulkAudit();
    },
    toggleAllAuditCb: function(type, isChecked) {
        let cbs = document.querySelectorAll(`.cb-audit-${type}`); cbs.forEach(cb => cb.checked = isChecked); this.checkBulkAudit();
    },
    checkBulkAudit: function() {
        let opChecked = document.querySelectorAll('.cb-audit-opname:checked').length;
        let trChecked = document.querySelectorAll('.cb-audit-terima:checked').length;
        let bar = document.getElementById('bulk-action-bar');
        if (bar) { if (opChecked > 0 || trChecked > 0) bar.classList.remove('hidden'); else bar.classList.add('hidden'); }
    },
    processBulkApproval: async function(status) {
        if (this.isProcessing) return;
        let opCbs = document.querySelectorAll('.cb-audit-opname:checked'); let trCbs = document.querySelectorAll('.cb-audit-terima:checked');
        if (opCbs.length === 0 && trCbs.length === 0) return this.showToast("Tidak ada data dipilih", "warning");

        if (!confirm(`Yakin ingin memproses (${status}) ${opCbs.length + trCbs.length} laporan sekaligus?`)) return;
        this.setLoading(true, `Memproses Masal (${status})...`);

        try {
            if (opCbs.length > 0) {
                let items = Array.from(opCbs).map(cb => { let p = cb.value.split('|'); return { waktu: p[0], sku: p[1], outlet: p[2], fisik: parseInt(p[3]) }; });
                await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'bulk_approve_opname', items: items, status_app: status }) });
            }
            if (trCbs.length > 0) {
                let items = Array.from(trCbs).map(cb => cb.value);
                await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'bulk_approve_mutasi', items: items, status_app: status }) });
            }
            this.showToast(`Proses Masal Selesai!`);
            const res = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); this.db = await res.json(); this.refreshData();
        } catch (e) { this.showToast("Gagal memproses", "error"); }
        this.setLoading(false);
    },

    // TRANSFER OWNER
    openTransferModalOwner: function() {
        let outletOpts = ''; (this.db.outlets || []).forEach(o => { outletOpts += `<option value="${o.ID_Outlet}">${o.Nama_Outlet}</option>`; });
        let opt = ''; [...(this.db.masterProduk || [])].sort((a, b) => String(a.Nama_Produk || '').localeCompare(String(b.Nama_Produk || ''))).forEach(m => {
            if (String(m.Kategori || '').toLowerCase() === 'bahan' || String(m.Kategori || '').toLowerCase() === 'pendukung') { opt += `<option value="${m.SKU}">${m.Nama_Produk}</option>`; }
        });

        let inputs = `
            <div><label class="text-xs font-bold text-slate-500 block mb-1">Toko Asal (Sumber)</label><select id="frm-trf-out-asal" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold outline-none text-sm bg-white text-slate-800 transition focus:border-brand-500" onchange="superApp.updateTransferStokInfo()">${outletOpts}</select></div>
            <div><label class="text-xs font-bold text-slate-500 block mb-1">Barang yang Ditransfer</label><select id="frm-trf-sku" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold outline-none text-sm bg-white text-slate-800 transition focus:border-brand-500" onchange="superApp.updateTransferStokInfo()">${opt}</select></div>
            <div class="bg-blue-50 text-blue-600 p-4 rounded-2xl text-sm font-bold mb-2 hidden shadow-inner border border-blue-100 flex items-center justify-between" id="trf-stok-info-box"><span><i class="fas fa-box-open mr-2"></i> Stok Tersedia</span> <span id="trf-stok-info" class="text-xl font-black">0</span></div>
            <div><label class="text-xs font-bold text-slate-500 block mb-1">Toko Tujuan</label><select id="frm-trf-out-tujuan" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold outline-none text-sm bg-white text-slate-800 transition focus:border-brand-500">${outletOpts}</select></div>
            ${this.makeInput('Jumlah Kirim (Pcs)', 'trf-qty', '', 'text', '', false, 'superApp.formatRupiahInput(this)')}
        `;
        this.buildForm("Transfer Stok Antar Toko", inputs, "superApp.executeTransferOwner()");
        setTimeout(() => {
            let trfInput = document.getElementById('frm-trf-qty');
            if (trfInput) { trfInput.setAttribute('readonly', 'readonly'); trfInput.classList.add('cursor-pointer'); trfInput.onclick = () => osKeyboard.open('frm-trf-qty', 'numeric'); }
            this.updateTransferStokInfo();
        }, 100);
    },
    updateTransferStokInfo: function() {
        const asal = document.getElementById('frm-trf-out-asal'); const sku = document.getElementById('frm-trf-sku'); const info = document.getElementById('trf-stok-info'); const box = document.getElementById('trf-stok-info-box');
        if (asal && sku && info && box) {
            let sData = (this.db.hargaStokOutlet || []).find(x => x.SKU === sku.value && x.ID_Outlet === asal.value);
            let sisa = sData ? Number(sData.Stok_Toko) : 0; info.innerText = sisa; box.classList.remove('hidden');
        }
    },
    executeTransferOwner: async function() {
        if (this.isProcessing) return;
        const elAsal = document.getElementById('frm-trf-out-asal'); const elSku = document.getElementById('frm-trf-sku'); const elQty = document.getElementById('frm-trf-qty'); const elTujuan = document.getElementById('frm-trf-out-tujuan');

        if (!elSku || !elQty || !elTujuan) return;
        let sku = elSku.value; let qty = parseInt(this.getNumericValue(elQty.value), 10); let targetOutlet = elTujuan.value; let asalOutlet = elAsal ? elAsal.value : this.outlet;

        if (asalOutlet === targetOutlet) return this.showToast("Toko asal dan tujuan tidak boleh sama", "error");
        if (!qty || parseInt(qty) <= 0) return this.showToast("Qty tidak valid", "error");

        let sData = (this.db.hargaStokOutlet || []).find(x => x.SKU === sku && x.ID_Outlet === asalOutlet); let sisa = sData ? Number(sData.Stok_Toko) : 0;
        if (parseInt(qty) > sisa) return this.showToast(`Qty melebihi sisa fisik di ${asalOutlet}!`, "error");

        if (!confirm(`Kirim barang ini dari ${asalOutlet} ke ${targetOutlet}? Stok ${asalOutlet} akan langsung terpotong.`)) return;

        this.setLoading(true, "Memproses Transfer...");
        const payload = { action: 'transfer_stok', sku: sku, outlet_asal: asalOutlet, outlet_tujuan: targetOutlet, qty: parseInt(qty), kasir: this.currentUser.Username };
        let res = await this.apiPost(payload);

        if (res.status === 'sukses') {
            this.closeModal('modal-form'); this.showToast("Transfer dikirim! Menunggu Penerimaan di toko tujuan.");
            if (!res.is_offline) { const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); this.db = await r.json(); }
            this.refreshData();
        } else { this.setLoading(false); }
    },

    // LAPORAN & PDF
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
        let filterVal = rof ? rof.value : this.outlet;
        if(this.currentUser && String(this.currentUser.Role).toLowerCase().includes('admin') && rof) { filterVal = rof.value; } else { filterVal = this.outlet; }
        
        let dStartEl = document.getElementById('filter-start'); let dEndEl = document.getElementById('filter-end');
        let dStart = dStartEl ? dStartEl.value : ''; let dEnd = dEndEl ? dEndEl.value : '';
        let dateStart = dStart ? new Date(dStart + "T00:00:00") : new Date(0);
        let dateEnd = dEnd ? new Date(dEnd + "T23:59:59") : new Date(8640000000000000);
        
        let searchTrxEl = document.getElementById('filter-search-trx');
        let searchTrx = searchTrxEl ? String(searchTrxEl.value||'').toLowerCase() : '';

        const rdl = document.getElementById('report-date-label'); if(rdl) rdl.innerText = new Date().toLocaleString('id-ID');
        const rtl = document.getElementById('report-title-label'); if(rtl) rtl.innerText = `Filter Outlet: ${filterVal} ${dStart ? `| Tgl: ${dStart} s/d ${dEnd}` : ''}`;

        let totalRev = 0, totalTunai = 0, totalQris = 0, countTrx = 0, totalKas = 0, trxHtml = ''; let productSales = {};
        
        [...(this.db.transactions || [])].reverse().forEach((t, i) => {
            let trxDate = this.parseDateId(t.Tanggal);
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
                
                let cleanDate = this.cleanDateOnly(t.Tanggal);
                let cleanTime = this.cleanTimeOnly(t.Waktu);

                // TAMBAHAN ANTRIAN PADA HISTORI
                let antrianTeks = t.Antrian ? `<span class="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded ml-2">Antrian: ${t.Antrian}</span>` : '';

                if(i < 500) {
                    trxHtml += `<tr class="${rowBg} transition"><td class="py-4 px-5 whitespace-nowrap text-xs"><div class="font-black text-slate-700">${safeID || 'N/A'} ${antrianTeks}</div><div class="text-[10px] text-slate-400 mt-0.5">${cleanDate} ${cleanTime}</div></td><td class="py-4 px-5 whitespace-nowrap text-xs text-slate-700 font-bold">${t.Kasir || t.Outlet}</td><td class="py-4 px-5 whitespace-nowrap text-xs font-black uppercase text-blue-500">${t.Metode_Bayar||'Tunai'}</td><td class="py-4 px-5 whitespace-nowrap">${statBadge}</td><td class="py-4 px-5 whitespace-nowrap text-right font-black ${isCoret}">Rp ${(Number(t.Total_Bayar)||0).toLocaleString('id-ID')}</td><td class="py-4 px-5 whitespace-nowrap text-center" data-html2canvas-ignore="true"><button onclick="superApp.openDetailTrx('${safeID}')" class="bg-white border border-slate-200 hover:border-slate-400 text-slate-600 text-[10px] font-bold px-4 py-2 rounded-lg shadow-sm transition"><i class="fas fa-eye mr-1"></i> Detail</button></td></tr>`;
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
        const rtb = document.getElementById('report-trx-tbody'); if(rtb) rtb.innerHTML = trxHtml || `<tr><td colspan="6" class="text-center py-12 h-32">${this.getEmptyState('fa-file-invoice', 'Tidak Ada Transaksi', 'Belum ada transaksi di rentang tanggal/resi ini')}</td></tr>`;

        let rekapHtml = '';
        for (const [nama, data] of Object.entries(productSales)) { rekapHtml += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-4 px-5 whitespace-normal min-w-[150px] text-slate-700 font-bold">${nama}</td><td class="py-4 px-5 whitespace-nowrap text-center font-black text-slate-700 bg-slate-50/50">${data.qty} Pcs</td><td class="py-4 px-5 whitespace-nowrap text-right font-black text-green-600">Rp ${data.rev.toLocaleString('id-ID')}</td></tr>`; }
        const rreb = document.getElementById('report-rekap-tbody'); if(rreb) rreb.innerHTML = rekapHtml || `<tr><td colspan="3" class="text-center py-12 h-32">${this.getEmptyState('fa-box-open', 'Belum Ada Penjualan', 'Data rekapitulasi kosong')}</td></tr>`;
        
        let mutasiHtml = '';
        [...(this.db.mutasi || [])].reverse().forEach((m, i) => {
            let safeWaktu = String(m.Waktu || '');
            let mDate = this.parseDateId(safeWaktu.split(' ')[0]);
            if((filterVal === 'Semua' || m.Outlet_Tujuan === filterVal) && mDate >= dateStart && mDate <= dateEnd) {
                let mWaktuStr = safeWaktu.includes('T') ? this.cleanDateOnly(safeWaktu) + ' ' + this.cleanTimeOnly(safeWaktu) : safeWaktu;
                if(i < 100) mutasiHtml += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-4 px-5 whitespace-nowrap text-xs text-slate-500">${mWaktuStr}</td><td class="py-4 px-5 whitespace-nowrap text-slate-700 font-bold">${m.SKU || '-'}</td><td class="py-4 px-5 whitespace-nowrap font-bold text-brand-600"><i class="fas fa-location-dot mr-1"></i>${m.Outlet_Tujuan || '-'}</td><td class="py-4 px-5 whitespace-nowrap text-right font-black bg-blue-50/30 text-blue-700">${m.Qty || 0} Pcs</td><td class="py-4 px-5 whitespace-normal min-w-[150px] text-xs italic text-slate-500">${m.Keterangan || '-'}</td></tr>`;
            }
        });
        const rmb = document.getElementById('report-mutasi-tbody'); if(rmb) rmb.innerHTML = mutasiHtml || `<tr><td colspan="5" class="text-center py-12 h-32">${this.getEmptyState('fa-truck', 'Belum Ada Mutasi', 'Tidak ada data distribusi di rentang ini')}</td></tr>`;

        let kasHtml = '';
        [...(this.db.kasKeluar || [])].reverse().forEach((k, i) => {
            let kDate = this.parseDateId(k.Tanggal);
            if((filterVal === 'Semua' || k.Outlet === filterVal) && kDate >= dateStart && kDate <= dateEnd) {
                totalKas += Number(k.Nominal) || 0;
                let kDateStr = this.cleanDateOnly(k.Tanggal);
                let kTimeStr = this.cleanTimeOnly(k.Waktu);
                if(i < 100) kasHtml += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-4 px-5 whitespace-nowrap text-xs text-slate-500">${kDateStr} ${kTimeStr}</td><td class="py-4 px-5 whitespace-nowrap font-bold text-slate-700">${k.Outlet} <span class="text-xs text-slate-400">(${k.Kasir})</span></td><td class="py-4 px-5 whitespace-normal min-w-[150px] font-medium text-slate-600">${k.Keterangan}</td><td class="py-4 px-5 whitespace-nowrap text-right font-black text-red-500 bg-red-50/30">- Rp ${(Number(k.Nominal)||0).toLocaleString('id-ID')}</td></tr>`;
            }
        });
        const repKas = document.getElementById('rep-total-kas'); if(repKas) repKas.innerText = `Rp ${totalKas.toLocaleString('id-ID')}`;
        const kBody = document.getElementById('report-kas-tbody'); if(kBody) kBody.innerHTML = kasHtml || `<tr><td colspan="4" class="text-center py-12 h-32">${this.getEmptyState('fa-wallet', 'Tidak Ada Kas Keluar', 'Belum ada pengeluaran dicatat')}</td></tr>`;
        
        let selisihHtml = '';
        [...(this.db.opname || [])].reverse().forEach((op, i) => {
            let safeWaktu = String(op.Waktu || '');
            let opDate = this.parseDateId(safeWaktu.split(' ')[0]);
            if((filterVal === 'Semua' || op.Outlet === filterVal) && opDate >= dateStart && opDate <= dateEnd) {
                let itemName = this.db.masterProduk.find(m => m.SKU === op.SKU)?.Nama_Produk || op.SKU || 'Unknown';
                let selColor = op.Selisih < 0 ? 'text-red-500' : (op.Selisih > 0 ? 'text-green-500' : 'text-slate-500');
                let badge = '';
                if(op.Status_Approval === 'Pending') badge = '<span class="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-[10px] font-bold"><i class="fas fa-clock mr-1"></i>Pending</span>';
                else if(op.Status_Approval === 'Disetujui') badge = '<span class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold"><i class="fas fa-check mr-1"></i>Disetujui</span>';
                else badge = '<span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold"><i class="fas fa-times mr-1"></i>Ditolak</span>';
                
                let opWaktuStr = safeWaktu.includes('T') ? this.cleanDateOnly(safeWaktu) + ' ' + this.cleanTimeOnly(safeWaktu) : safeWaktu;

                if(i < 500) {
                    selisihHtml += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-4 px-5 whitespace-nowrap text-xs text-slate-500">${opWaktuStr}</td><td class="py-4 px-5 whitespace-normal min-w-[150px] font-bold text-slate-700">${itemName}</td><td class="py-4 px-5 whitespace-nowrap text-xs font-bold">${op.Outlet} <span class="text-slate-400">(${op.Kasir})</span></td><td class="py-4 px-5 whitespace-nowrap text-center text-xs font-medium text-slate-500 bg-slate-50/50 rounded-lg">Sys: ${op.Stok_Sistem} <i class="fas fa-arrow-right mx-2 text-slate-300"></i> Fis: ${op.Stok_Fisik}</td><td class="py-4 px-5 whitespace-nowrap text-right font-black ${selColor} text-lg">${op.Selisih > 0 ? '+'+op.Selisih : op.Selisih}</td><td class="py-4 px-5 whitespace-nowrap text-center">${badge}</td></tr>`;
                }
            }
        });
        const rsTbody = document.getElementById('report-selisih-tbody'); if(rsTbody) rsTbody.innerHTML = selisihHtml || `<tr><td colspan="6" class="text-center py-12 h-32">${this.getEmptyState('fa-clipboard-check', 'Audit Selisih Kosong', 'Tidak ada histori opname disini')}</td></tr>`;
    },
    exportPDF: function() {
        this.showToast("Mempersiapkan PDF Laporan...");
        const element = document.getElementById('pdf-export-area'); if(!element) return;
        element.classList.add('pdf-container'); 
        
        const rct = document.getElementById('report-content-trx'); if(rct) rct.classList.remove('hidden'); 
        const rcr = document.getElementById('report-content-rekap'); if(rcr) rcr.classList.remove('hidden');
        const rck = document.getElementById('report-content-kas'); if(rck) rck.classList.remove('hidden');
        const rcs = document.getElementById('report-content-selisih'); if(rcs) rcs.classList.remove('hidden');
        
        const opt = { margin: 0.3, filename: `Laporan_ERP_${new Date().getTime()}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
        html2pdf().set(opt).from(element).save().then(()=> { 
            element.classList.remove('pdf-container'); this.toggleReportTab('trx'); this.showToast("PDF Diunduh!"); 
        });
    },
    
    sendReportToWA: function() {
        // 1. Ambil data rentang tanggal dari filter
        let startDate = document.getElementById('filter-start').value;
        let endDate = document.getElementById('filter-end').value;
        
        // 2. Ambil data cabang
        let outletFilterEl = document.getElementById('report-outlet-filter');
        let outletName = (!outletFilterEl || outletFilterEl.classList.contains('hidden') || outletFilterEl.value === 'Semua') 
                         ? (this.currentUser && String(this.currentUser.Role).toLowerCase().includes('admin') ? "Semua Cabang" : this.outlet) 
                         : outletFilterEl.options[outletFilterEl.selectedIndex].text.replace('Hanya: ', '').replace('📍 ', '');

        // 3. Ambil Ringkasan Angka Utama
        let totTrx = document.getElementById('rep-total-trx').innerText; // Ini angka jumlah struk
        let totTunai = document.getElementById('rep-total-tunai').innerText;
        let totQris = document.getElementById('rep-total-qris').innerText;
        let totKas = document.getElementById('rep-total-kas').innerText;

        // KALKULASI TOTAL PENDAPATAN (TUNAI + QRIS)
        // Bersihkan teks "Rp" dan titik, lalu ubah ke angka murni untuk dijumlahkan
        let numTunai = Number(totTunai.replace(/[^0-9]/g, '')) || 0;
        let numQris = Number(totQris.replace(/[^0-9]/g, '')) || 0;
        let totalOmset = numTunai + numQris;
        let totOmsetStr = `Rp ${totalOmset.toLocaleString('id-ID')}`;

        // --- 4. EKSTRAKSI DATA DETAIL DARI TABEL LAYAR ---
        
        // A. Ekstrak Rekap Jualan (Item)
        let rekapTbody = document.getElementById('report-rekap-tbody');
        let rekapText = '';
        if (rekapTbody && rekapTbody.rows.length > 0 && rekapTbody.rows[0].cells.length >= 3) {
            for (let row of rekapTbody.rows) {
                // Abaikan teks kosong "Belum Ada Penjualan" jika tabel masih kosong
                if (row.cells[0].innerText.includes('Belum Ada Penjualan')) continue;
                rekapText += `▪️ ${row.cells[0].innerText} = ${row.cells[1].innerText} (${row.cells[2].innerText})\n`;
            }
            if(rekapText === '') rekapText = "▪️ Nihil / Tidak ada penjualan.\n";
        } else { rekapText = "▪️ Nihil / Tidak ada penjualan.\n"; }

        // B. Ekstrak Kas Keluar
        let kasTbody = document.getElementById('report-kas-tbody');
        let kasText = '';
        if (kasTbody && kasTbody.rows.length > 0 && kasTbody.rows[0].cells.length >= 4) {
            for (let row of kasTbody.rows) {
                if (row.cells[0].innerText.includes('Tidak Ada Kas Keluar')) continue;
                kasText += `▪️ ${row.cells[2].innerText} : ${row.cells[3].innerText}\n`; 
            }
            if(kasText === '') kasText = "▪️ Nihil / Tidak ada pengeluaran.\n";
        } else { kasText = "▪️ Nihil / Tidak ada pengeluaran.\n"; }

        // BAGIAN AUDIT FISIK TELAH DIHAPUS

        // --- 5. SUSUN TEKS PESAN WHATSAPP ---
        let text = `*📊 LAPORAN OPERASIONAL AI-SNACK*\n`;
        text += `📍 Cabang: *${outletName}*\n`;
        text += `📅 Periode: *${startDate} s/d ${endDate}*\n`;
        text += `👤 User: ${this.currentUser ? this.currentUser.Username : 'Sistem'}\n`;
        text += `-----------------------------------\n`;
        text += `*RINGKASAN KEUANGAN:*\n`;
        text += `🛒 Jml Transaksi   : *${totTrx} Struk*\n`;
        text += `💵 Omset Tunai     : *${totTunai}*\n`;
        text += `📱 Omset QRIS      : *${totQris}*\n`;
        text += `💰 TOTAL PENDAPATAN: *${totOmsetStr}*\n`;
        text += `💸 Kas Keluar      : *${totKas}*\n`;
        text += `-----------------------------------\n`;
        text += `*🛍️ DETAIL ITEM TERJUAL:*\n${rekapText}\n`;
        text += `*🧾 RINCIAN KAS KELUAR:*\n${kasText}\n`;
        text += `-----------------------------------\n`;
        text += `_Laporan ditarik secara otomatis dari Sistem POS Ai-Snack._`;

        // 6. Siapkan Link URL WhatsApp
        let waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

        const btnGoWa = document.getElementById('btn-go-wa');
        const btnCopyWa = document.getElementById('btn-copy-wa');
        const modalWa = document.getElementById('modal-wa-confirm');

        // Sambungkan perintah ke tombol di dalam popup
        if (btnGoWa) {
            btnGoWa.onclick = () => { 
                window.open(waUrl, '_blank'); 
                this.closeModal('modal-wa-confirm');
            };
        }
        
        if (btnCopyWa) {
            btnCopyWa.onclick = () => {
                navigator.clipboard.writeText(text).then(() => {
                    this.showToast("Teks laporan berhasil disalin ke memori HP/PC!", "success");
                }).catch(() => {
                    this.showToast("Gagal menyalin teks", "error");
                });
            };
        }

        // 7. Tampilkan Popup Animasi WA
        if (modalWa) {
            modalWa.classList.remove('hidden');
            modalWa.classList.add('flex');
    
            const modalContent = document.getElementById('modal-wa-confirm-content');
            if (modalContent) {
                setTimeout(() => modalContent.classList.add('modal-enter-active'), 10);
            }
       
            const title = modalWa.querySelector('h3');
            const desc = modalWa.querySelector('p');
            if(title) title.innerText = "Laporan Siap!";
            // Teks deskripsi di dalam modal juga sudah diubah agar tidak menyebut Audit lagi
            if(desc) desc.innerText = "Seluruh rincian jualan dan kas sudah dirangkum otomatis. Lanjutkan kirim ke Grup WhatsApp?";
        }
    },

    openDetailTrx: function(trxId) {
        let trx = (this.db.transactions || []).find(x => x.ID_TRX === trxId); if(!trx) return;
        this.activeReprintTrx = trx; let items = []; try { items = JSON.parse(trx.Items_JSON || '[]'); } catch(e){}
        let statText = trx.Status === 'Sukses' ? '' : '\n*** DIBATALKAN ***\n';
        
        let cleanDate = this.cleanDateOnly(trx.Tanggal);
        let cleanTime = this.cleanTimeOnly(trx.Waktu);
        let antrianNo = trx.Antrian ? `\nANTRIAN: ${trx.Antrian}` : '';

        let strukHtml = `<div class="text-center font-bold mb-4 text-slate-800 border-b-2 border-slate-800 pb-2">=== Ai-Snack ===\nCabang: ${trx.Outlet}\nNo. Resi: ${trx.ID_TRX}${antrianNo}\n${cleanDate} ${cleanTime}${statText}</div>`;
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
        if(!this.activeReprintTrx) return; let t = this.activeReprintTrx; let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
        let tunaiVal = t.Tunai !== undefined ? t.Tunai : (t.Dibayar || 0);
        let cleanDate = this.cleanDateOnly(t.Tanggal);
        let cleanTime = this.cleanTimeOnly(t.Waktu);
        try { await this.printReceipt(t.ID_TRX, t.Outlet, t.Total_Bayar, tunaiVal, t.Kembalian, items, t.Status, cleanDate + ' ' + cleanTime, t.Antrian); } catch(e) {}
    },
    promptVoidTrx: function() {
        let pin = prompt("Masukkan PIN Super Admin (Owner) untuk Membatalkan & Mengembalikan Stok:");
        let adminUser = (this.db.users || []).find(u => String(u.Role).toLowerCase().includes('admin') && String(u.PIN) === String(pin));
        if(adminUser) { this.executeVoidTrx(this.activeReprintTrx.ID_TRX); } else { this.showToast("PIN Salah atau Anda bukan Admin! Batal ditolak.", "error"); }
    },
    executeVoidTrx: async function(trxId) {
        if(this.isProcessing) return;
        this.setLoading(true, "Membatalkan Transaksi...");
        const payload = { action: 'batal_trx', trx_id: trxId, tim_operasional: this.activeStaffTeam };
        let res = await this.apiPost(payload);
        if(res.status === 'sukses') {
            this.showToast("Transaksi Dibatalkan!"); 
            let t = this.activeReprintTrx; let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
            let tunaiVal = t.Tunai !== undefined ? t.Tunai : (t.Dibayar || 0);
            let cleanDate = this.cleanDateOnly(t.Tanggal);
            let cleanTime = this.cleanTimeOnly(t.Waktu);
            try { await this.printReceipt(t.ID_TRX, t.Outlet, t.Total_Bayar, tunaiVal, t.Kembalian, items, 'Batal', cleanDate + ' ' + cleanTime, t.Antrian); } catch(e){}

            if(!res.is_offline) { const refreshRes = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); this.db = await refreshRes.json(); }
            this.refreshData(); this.closeModal('modal-detail');
        }
        this.setLoading(false);
    },

    // AI ASSISTANT
    generateAIReport: function() {
        const aiCards = document.getElementById('ai-insight-cards'); const aiRekBody = document.getElementById('ai-rekomendasi-tbody');
        if(!aiCards || !aiRekBody || !this.db) return;

        const filterEl = document.getElementById('ai-filter-outlet');
        if(filterEl && filterEl.options.length <= 1) {
            let opts = '<option value="Semua">Semua Cabang Terpantau</option>';
            (this.db.outlets || []).forEach(o => opts += `<option value="${o.ID_Outlet}">${o.Nama_Outlet}</option>`);
            filterEl.innerHTML = opts; filterEl.value = this.outlet;
        }
        let aiOutlet = filterEl ? filterEl.value : this.outlet;

        let oldestDate = new Date();
        (this.db.transactions || []).forEach(t => { let d = this.parseDateId(t.Tanggal); if(d < oldestDate) oldestDate = d; });
        let daysActive = Math.ceil((new Date() - oldestDate) / (1000 * 60 * 60 * 24)); if(daysActive < 1) daysActive = 1;

        // --- REKOMENDASI PERBAIKAN LOGIKA VELOCITY ---
        // 1. Kumpulkan dulu total barang terjual dari transaksi Sukses
        let productSales = {};
        (this.db.transactions || []).forEach(t => {
            if(t.Status === 'Sukses' && (aiOutlet === 'Semua' || t.Outlet === aiOutlet)) {
                let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
                items.forEach(item => { 
                    let safeNama = item.nama || 'Unknown'; 
                    if(!productSales[safeNama]) productSales[safeNama] = 0; 
                    productSales[safeNama] += Number(item.qty)||0; 
                });
            }
        });

        let warnings = [];
        (this.db.masterProduk || []).forEach(mp => {
            if(String(mp.Kategori||'').toLowerCase() === 'pendukung' || String(mp.Kategori||'').toLowerCase() === 'bahan') {
                
                // Cek sisa stok saat ini
                let sisa = 0;
                if(aiOutlet === 'Semua') { 
                    (this.db.hargaStokOutlet || []).forEach(x => { if(x.SKU === mp.SKU) sisa += Number(x.Stok_Toko)||0; }); 
                } else { 
                    let sData = (this.db.hargaStokOutlet || []).find(x => x.SKU === mp.SKU && x.ID_Outlet === aiOutlet); 
                    sisa = sData ? Number(sData.Stok_Toko)||0 : 0; 
                }

                // 2. Gunakan jumlah barang terjual untuk menghitung Velocity (Bukan Total Masuk - Sisa)
                // Jika produk adalah bahan mentah, asumsinya 1 Pcs Terjual memotong 1 Pcs Bahan (BOM sederhana)
                // Jika Anda punya tabel Resep/BOM, logikanya harus disesuaikan di sini.
                let pemakaianReal = productSales[mp.Nama_Produk] || 0; 

                let velocity = pemakaianReal / daysActive; 
                velocity = Number(velocity) || 0; 
                
                // Jika velocity 0 (belum pernah terjual), asumsi aman (999 hari)
                let daysRem = velocity > 0 ? (sisa / velocity) : 999;
                
                if(daysRem < 4 && sisa > 0) { 
                    warnings.push({ sku: mp.SKU, name: mp.Nama_Produk, type: mp.Kategori, vel: velocity, stock: sisa, days: Math.floor(daysRem) }); 
                } else if (sisa <= 0) { 
                    warnings.push({ sku: mp.SKU, name: mp.Nama_Produk, type: mp.Kategori, vel: velocity, stock: 0, days: 0 }); 
                }
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
        let trendHtml = top1.vel > 5 ? `<span class="text-green-300 text-sm ml-2 bg-green-900/30 px-2 py-1 rounded-lg"><i class="fas fa-arrow-trend-up"></i> Naik</span>` : `<span class="text-orange-200 text-sm ml-2 bg-orange-900/30 px-2 py-1 rounded-lg"><i class="fas fa-minus"></i> Stabil</span>`;

        aiCards.innerHTML = `
            <div class="bg-gradient-to-br from-orange-400 to-brand-600 p-8 rounded-3xl shadow-[0_10px_30px_rgba(249,115,22,0.3)] text-white transform hover:-translate-y-2 transition duration-300 relative overflow-hidden"><div class="absolute top-0 right-0 opacity-10 text-9xl transform translate-x-4 -translate-y-4"><i class="fas fa-fire"></i></div><div class="flex justify-between items-start mb-2 relative z-10"><div class="bg-white/20 p-3 rounded-xl"><i class="fas fa-fire text-2xl"></i></div><span class="text-xs font-black bg-white/20 px-3 py-1 rounded-full shadow-sm">Terlaris</span></div><p class="text-[10px] font-black text-brand-100 uppercase tracking-widest mt-6 relative z-10">Paling Laku di ${lblCabang}</p><h4 class="text-3xl font-black truncate relative z-10">${top1.name}</h4><p class="text-sm font-bold text-brand-100 flex items-center relative z-10 mt-1">${top1.vel.toFixed(1)} Pcs/hari ${trendHtml}</p></div>
            <div class="bg-gradient-to-br from-red-500 to-rose-700 p-8 rounded-3xl shadow-[0_10px_30px_rgba(225,29,72,0.3)] text-white transform hover:-translate-y-2 transition duration-300 relative overflow-hidden"><div class="absolute top-0 right-0 opacity-10 text-9xl transform translate-x-4 -translate-y-4"><i class="fas fa-triangle-exclamation"></i></div><div class="flex justify-between items-start mb-2 relative z-10"><div class="bg-white/20 p-3 rounded-xl"><i class="fas fa-triangle-exclamation text-2xl"></i></div><span class="text-xs font-black bg-white/20 px-3 py-1 rounded-full shadow-sm">Kritis</span></div><p class="text-[10px] font-black text-rose-100 uppercase tracking-widest mt-6 relative z-10">Perhatian Stok Menipis</p><h4 class="text-3xl font-black relative z-10">${warnings.length} Item</h4><p class="text-sm font-bold text-rose-100 relative z-10 mt-1">Prediksi habis < 4 hari</p></div>
            <div class="bg-gradient-to-br from-blue-500 to-indigo-700 p-8 rounded-3xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] text-white transform hover:-translate-y-2 transition duration-300 relative overflow-hidden"><div class="absolute top-0 right-0 opacity-10 text-9xl transform translate-x-4 -translate-y-4"><i class="fas fa-brain"></i></div><div class="flex justify-between items-start mb-2 relative z-10"><div class="bg-white/20 p-3 rounded-xl"><i class="fas fa-brain text-2xl"></i></div><span class="text-xs font-black bg-white/20 px-3 py-1 rounded-full shadow-sm">AI Engine</span></div><p class="text-[10px] font-black text-indigo-100 uppercase tracking-widest mt-6 relative z-10">Data Dipelajari</p><h4 class="text-3xl font-black relative z-10">${daysActive} Hari</h4><p class="text-sm font-bold text-indigo-100 relative z-10 mt-1">Tingkat Akurasi Tinggi</p></div>
        `;

        if(warnings.length > 0) {
            warnings.sort((a,b) => a.days - b.days);
            aiRekBody.innerHTML = warnings.map(w => `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-4 px-5 whitespace-nowrap font-bold text-slate-700">${aiOutlet}</td><td class="py-4 px-5 whitespace-normal min-w-[150px] text-red-500 font-bold">${w.name}<br><span class="text-[10px] text-slate-400 font-medium">Sisa Fisik: ${w.stock} ${w.type==='Pendukung'?'Pcs':'Bahan'}</span></td><td class="py-4 px-5 whitespace-nowrap text-center text-slate-600 font-black bg-slate-50/50">${w.vel.toFixed(1)}</td><td class="py-4 px-5 whitespace-nowrap text-center font-black ${w.days===0?'text-red-600':'text-orange-500'}">${w.days===0?'HABIS':`${w.days} Hari`}</td><td class="py-4 px-5 whitespace-nowrap text-center"><button onclick="superApp.openDistribusiModal('${w.sku}', '${aiOutlet === 'Semua' ? '' : aiOutlet}')" class="bg-brand-100 text-brand-600 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-brand-200 transition"><i class="fas fa-truck-fast mr-1"></i> Kirim Stok</button></td></tr>`).join('');
        } else { aiRekBody.innerHTML = `<tr><td colspan="5" class="text-center py-12 h-32">${this.getEmptyState('fa-shield-halved', 'Stok Aman', 'Semua stok terpantau aman (Tidak ada prediksi krisis).')}</td></tr>`; }
    },

    // GUDANG & MASTER DATA
    handleImageUpload: function(event, inputId, maxWidth = 150) {
        const file = event.target.files[0]; if (!file) return;
        this.showToast("Memproses Gambar...", "warning");
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width; let height = img.height;
                if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                const base64 = canvas.toDataURL('image/jpeg', 0.5); 
                if(base64.length > 45000) { this.showToast("Ukuran foto terlalu besar. Silakan crop atau gunakan foto lain.", "error"); return; }
                document.getElementById(inputId).value = base64;
                const preview = document.getElementById(inputId + '-preview');
                if (preview) { preview.src = base64; preview.classList.remove('hidden'); }
                this.showToast("Gambar Siap Disimpan!");
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },
    renderGudang: function() {
        const gBodyUtama = document.getElementById('gudang-tbody-utama');
        const gBodyPendukung = document.getElementById('gudang-tbody-pendukung');
        let htmlUtama = ''; let htmlPendukung = '';

        let sortedMaster = [...(this.db.masterProduk || [])].sort((a,b) => String(a.Nama_Produk||'').localeCompare(String(b.Nama_Produk||'')));
        
        sortedMaster.forEach(g => {
            if(String(g.Kategori||'').toLowerCase() === 'bahan' || String(g.Kategori||'').toLowerCase() === 'pendukung') {
                let stok = (this.db.stokGudang || []).find(x => x.SKU === g.SKU)?.Stok_Pusat || 0;
                let row = `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-3 px-5 whitespace-normal min-w-[150px] font-bold text-slate-700">${g.Nama_Produk}<br><span class="text-[10px] text-slate-400 font-medium">SKU: ${g.SKU}</span></td><td class="py-3 px-5 whitespace-nowrap text-right font-black text-brand-500 bg-brand-50/30 text-lg">${stok}</td><td class="py-3 px-5 whitespace-nowrap text-center"><button onclick="superApp.openCrudBahan('edit', '${g.SKU}')" class="text-blue-500 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition"><i class="fas fa-edit"></i></button> <button onclick="superApp.deleteCrud('Master_Produk', '${g.SKU}')" class="text-red-500 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold ml-1 hover:bg-red-100 transition"><i class="fas fa-trash"></i></button></td></tr>`;
                if(String(g.Kategori||'').toLowerCase() === 'bahan') htmlUtama += row; else htmlPendukung += row;
            }
        });
        if(gBodyUtama) gBodyUtama.innerHTML = htmlUtama || `<tr><td colspan="3" class="text-center py-8 h-32">${this.getEmptyState('fa-box', 'Bahan Kosong', 'Belum ada bahan baku')}</td></tr>`;
        if(gBodyPendukung) gBodyPendukung.innerHTML = htmlPendukung || `<tr><td colspan="3" class="text-center py-8 h-32">${this.getEmptyState('fa-box', 'Barang Kosong', 'Belum ada barang pendukung')}</td></tr>`;
        
        const masterBody = document.getElementById('master-tbody');
        if(masterBody) {
            let html = '';
            sortedMaster.forEach(m => {
                if(String(m.Kategori||'').toLowerCase() !== 'bahan' && String(m.Kategori||'').toLowerCase() !== 'pendukung') {
                    let bahanName = '-';
                    if(m.SKU_Bahan) { let b = (this.db.masterProduk || []).find(x=>x.SKU===m.SKU_Bahan); if(b) bahanName = b.Nama_Produk; }
                    let imgT = m.Gambar_URL ? `<img src="${m.Gambar_URL}" class="w-10 h-10 rounded-xl object-cover inline-block mr-3 shadow-sm" onerror="this.onerror=null;this.src='https://placehold.co/150x150/f8fafc/94a3b8?text=Err';">` : `<div class="w-10 h-10 rounded-xl bg-slate-100 inline-flex items-center justify-center mr-3 text-slate-300 shadow-inner"><i class="fas fa-image"></i></div>`;
                    html += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-3 px-5 whitespace-normal min-w-[150px] font-bold text-sm flex items-center text-slate-700">${imgT} ${m.Nama_Produk}</td><td class="py-3 px-5 whitespace-normal min-w-[120px] text-xs font-bold text-orange-600 bg-orange-50/30">${bahanName}</td><td class="py-3 px-5 whitespace-nowrap text-center"><button onclick="superApp.openCrudMasterMenu('edit', '${m.SKU}')" class="text-blue-500 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition"><i class="fas fa-edit"></i></button> <button onclick="superApp.deleteCrud('Master_Produk', '${m.SKU}')" class="text-red-500 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold ml-1 hover:bg-red-100 transition"><i class="fas fa-trash"></i></button></td></tr>`;
                }
            });
            masterBody.innerHTML = html || `<tr><td colspan="3" class="text-center py-8 h-32">${this.getEmptyState('fa-utensils', 'Belum Ada Master', 'Tambahkan menu jualan di sini')}</td></tr>`;
        }
        
        const outBody = document.getElementById('crud-outlet-tbody');
        if(outBody) {
            outBody.innerHTML = (this.db.outlets || []).map(o => `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-4 px-5 font-bold text-sm text-slate-700">${o.ID_Outlet}</td><td class="py-4 px-5 font-medium text-slate-600">${o.Nama_Outlet}</td><td class="py-4 px-5 text-center"><button onclick="superApp.openCrudOutlet('edit', '${o.ID_Outlet}')" class="text-blue-500 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"><i class="fas fa-edit"></i></button></td></tr>`).join('');
        }

        const mOutBody = document.getElementById('outlet-manage-tbody');
        if(mOutBody) {
            let html = '';
            sortedMaster.forEach(master => {
                if(String(master.Kategori||'').toLowerCase() !== 'bahan' && String(master.Kategori||'').toLowerCase() !== 'pendukung') {
                    let oData = (this.db.hargaStokOutlet || []).find(x => x.SKU === master.SKU && x.ID_Outlet === this.outlet);
                    if(oData) {
                        let hrg = oData.Harga_Jual; 
                        let refBahan = master.SKU_Bahan ? master.SKU_Bahan : master.SKU;
                        let sData = (this.db.hargaStokOutlet || []).find(x => x.SKU === refBahan && x.ID_Outlet === this.outlet);
                        let stk = sData ? sData.Stok_Toko : 0;
                        html += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-4 px-5 whitespace-normal min-w-[150px] font-bold text-sm text-slate-700">${master.Nama_Produk}</td><td class="py-4 px-5 whitespace-nowrap text-right text-brand-600 font-bold bg-brand-50/30 text-lg">Rp ${Number(hrg).toLocaleString('id-ID')}</td><td class="py-4 px-5 whitespace-nowrap text-right font-black text-slate-700 text-lg">${stk}</td><td class="py-4 px-5 whitespace-nowrap text-center"><button onclick="superApp.openEditHargaOutlet('${master.SKU}', '${master.Nama_Produk}', ${hrg})" class="text-blue-500 bg-blue-50 px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition shadow-sm"><i class="fas fa-tag mr-1"></i> Set Harga</button> <button onclick="superApp.deleteOutletProduct('${master.SKU}')" class="text-red-500 bg-red-50 px-3 py-2 rounded-xl text-xs font-bold ml-1 hover:bg-red-100 transition shadow-sm"><i class="fas fa-trash"></i></button></td></tr>`;
                    }
                }
            });
            mOutBody.innerHTML = html || `<tr><td colspan="4" class="text-center py-10 h-32">${this.getEmptyState('fa-store-slash', 'Cabang Kosong', 'Belum ada menu yang dikirim/dijual di cabang ini')}</td></tr>`;
        }
    },
    openCrudBahan: function(action = 'add', sku = '') {
        let m = action === 'edit' ? (this.db.masterProduk || []).find(x => x.SKU === sku) : {};
        let nextId = action === 'edit' ? sku : 'SUP-' + Math.floor(Math.random()*9000+1000);
        let isBahanSel = String(m.Kategori||'').toLowerCase() === 'bahan' ? 'selected' : '';
        let isPendukungSel = String(m.Kategori||'').toLowerCase() === 'pendukung' ? 'selected' : '';

        let inputs = `<input type="hidden" id="frm-mst-sku" value="${nextId}">` + 
                     this.makeInput('Nama Bahan / Barang Pendukung', 'mst-nama', m.Nama_Produk||'') + 
                     `<div><label class="text-xs font-bold text-slate-500 block mb-1">Kategori</label><select id="frm-mst-kat" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold outline-none text-sm bg-white text-slate-800 focus:border-brand-500 transition"><option value="Bahan" ${isBahanSel}>Bahan Baku Utama (BOM POS)</option><option value="Pendukung" ${isPendukungSel}>Barang Pendukung (Saus, dll)</option></select></div>` +
                     `<input type="hidden" id="frm-mst-bahan" value=""><input type="hidden" id="frm-mst-img" value="">`;
        this.buildForm(action==='edit'?"Edit Bahan/Barang":"Tambah Bahan/Barang", inputs, `superApp.executeCrud('Master_Produk', '${action==='edit'?sku:''}')`);
    },
    openCrudMasterMenu: function(action = 'add', sku = '') {
        let m = action === 'edit' ? (this.db.masterProduk || []).find(x => x.SKU === sku) : {};
        let nextId = action === 'edit' ? sku : 'MNU-' + Math.floor(Math.random()*9000+1000);
        let opt = '<option value="">-- Menu Mandiri (Tidak potong stok bahan) --</option>'; 
        
        [...(this.db.masterProduk || [])].sort((a,b) => String(a.Nama_Produk||'').localeCompare(String(b.Nama_Produk||''))).forEach(p => { 
            if(String(p.Kategori||'').toLowerCase()==='bahan') {
                let sel = (m.SKU_Bahan === p.SKU) ? 'selected' : '';
                opt += `<option value="${p.SKU}" ${sel}>${p.Nama_Produk}</option>`; 
            }
        });
        
        let imgInput = `<div><label class="text-xs font-bold text-slate-500 block mb-1">Foto Menu (Opsional)</label><input type="file" accept="image/*" onchange="superApp.handleImageUpload(event, 'frm-mst-img', 150)" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-white text-slate-500 focus:border-brand-500 transition"><input type="hidden" id="frm-mst-img" value="${m.Gambar_URL||''}"><img id="frm-mst-img-preview" src="${m.Gambar_URL||''}" onerror="this.onerror=null;this.src='https://placehold.co/150x150/f8fafc/94a3b8?text=Err';" class="mt-3 w-24 h-24 object-cover rounded-2xl shadow-md border border-slate-100 ${m.Gambar_URL?'':'hidden'}"></div>`;

        let inputs = `<input type="hidden" id="frm-mst-sku" value="${nextId}">` + 
                     this.makeInput('Nama Menu Kasir', 'mst-nama', m.Nama_Produk||'') + 
                     `<input type="hidden" id="frm-mst-kat" value="${m.Kategori||'AISNACK'}">` +
                     `<div><label class="text-xs font-bold text-slate-500 block mb-1">Bahan yang Terpotong (BOM)</label><select id="frm-mst-bahan" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm bg-white outline-none text-slate-800 focus:border-brand-500 transition">${opt}</select></div>` + imgInput;
        this.buildForm(action==='edit'?"Edit Menu Kasir":"Tambah Menu Kasir", inputs, `superApp.executeCrud('Master_Produk', '${action==='edit'?sku:''}')`);
    },
    openAddOutletProduct: function() {
        let opt = '';
        [...(this.db.masterProduk || [])].sort((a,b) => String(a.Nama_Produk||'').localeCompare(String(b.Nama_Produk||''))).forEach(p => { 
            if(String(p.Kategori||'').toLowerCase() !== 'bahan' && String(p.Kategori||'').toLowerCase() !== 'pendukung') {
                let isExist = (this.db.hargaStokOutlet || []).find(x => x.SKU === p.SKU && x.ID_Outlet === this.outlet);
                if(!isExist) opt += `<option value="${p.SKU}">${p.Nama_Produk}</option>`; 
            }
        });
        if(opt === '') return this.showToast("Semua produk master sudah ada di cabang ini!", "warning");
        let inputs = `<div><label class="text-xs font-bold text-slate-500 block mb-1">Pilih Master Produk</label><select id="frm-add-out-sku" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-sm bg-white outline-none text-slate-800 focus:border-brand-500 transition">${opt}</select></div>` + this.makeInput(`Set Harga Jual di Cabang ${this.outlet} (Rp)`, 'edit-hrg', '', 'number', '', false, '');
        this.buildForm("Tambah Menu ke Cabang", inputs, `superApp.executeEditHarga(document.getElementById('frm-add-out-sku').value)`);
    },
    openEditHargaOutlet: function(sku, nama, currHarga) {
        let inputs = `<div><label class="text-xs font-bold text-slate-500 block mb-1">Produk</label><input type="text" disabled value="${nama}" class="w-full border-2 border-slate-200 bg-slate-100 rounded-xl px-4 py-3 font-bold text-sm outline-none text-slate-600"></div>` + this.makeInput(`Set Harga Jual di Cabang ${this.outlet} (Rp)`, 'edit-hrg', currHarga, 'number', '', false, '');
        this.buildForm("Pengaturan Harga Cabang", inputs, `superApp.executeEditHarga('${sku}')`);
    },
    executeEditHarga: async function(sku) {
        if(this.isProcessing) return;
        let editHrg = document.getElementById('frm-edit-hrg'); if(!editHrg) return;
        let hrg = this.getNumericValue(editHrg.value); this.setLoading(true, "Update Harga...");
        const payload = { action: 'edit_harga_outlet', sku: sku, outlet: this.outlet, harga: hrg };
        let res = await this.apiPost(payload);
        if(res.status === 'sukses') {
            this.closeModal('modal-form'); 
            if(!res.is_offline) { const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); this.db = await r.json(); }
            this.refreshData(); 
        }
        this.setLoading(false);
    },
    deleteOutletProduct: async function(sku) {
        if(this.isProcessing) return;
        if(!confirm(`Yakin hapus produk ini dari menu POS cabang ${this.outlet}?`)) return;
        this.setLoading(true, "Menghapus dari Cabang...");
        const payload = { action: 'delete_outlet_product', sku: sku, outlet: this.outlet };
        let res = await this.apiPost(payload);
        if(res.status === 'sukses') { this.showToast("Dihapus dari cabang."); if(!res.is_offline) { const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); this.db = await r.json(); this.refreshData(); } }
        this.setLoading(false);
    },
    openRestokModal: function() {
        let opt = ''; 
        [...(this.db.masterProduk || [])].sort((a,b) => String(a.Nama_Produk||'').localeCompare(String(b.Nama_Produk||''))).forEach(p => { if(String(p.Kategori||'').toLowerCase()==='bahan' || String(p.Kategori||'').toLowerCase()==='pendukung') opt += `<option value="${p.SKU}">${p.Nama_Produk}</option>`; });
        let inputs = `<div><label class="text-xs font-bold text-slate-500 block mb-1">Pilih Bahan Baku Induk</label><select id="frm-rstk-sku" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold outline-none text-sm bg-white text-slate-800 focus:border-brand-500 transition">${opt}</select></div>` + this.makeInput('Jumlah Masuk dari Supplier (Pcs)', 'rstk-qty', '', 'number', '', false, '');
        this.buildForm("Pembelian / Restok Gudang", inputs, "superApp.executeRestok()");
    },
    executeRestok: async function() {
        if(this.isProcessing) return;
        const elSku = document.getElementById('frm-rstk-sku'); const elQty = document.getElementById('frm-rstk-qty');
        if(!elSku || !elQty) return; let sku = elSku.value; let qty = this.getNumericValue(elQty.value); let n = elSku.options[elSku.selectedIndex].text;
        if(qty === 0) return this.showToast("Qty wajib diisi", "error"); this.setLoading(true, "Menyimpan Restok...");
        const payload = { action: 'restok_gudang', sku: sku, nama: n, qty: qty };
        let res = await this.apiPost(payload);
        
        if(res.status === 'sukses') {
            this.closeModal('modal-form'); 
            if(!res.is_offline) { const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); this.db = await r.json(); }
            this.refreshData(); 
        }
        this.setLoading(false);
    },
    openDistribusiModal: function(prefillSku = '', prefillOutlet = '') {
        let opt = ''; 
        [...(this.db.stokGudang || [])].sort((a,b) => {
            let nameA = this.db.masterProduk.find(x => x.SKU === a.SKU)?.Nama_Produk || a.SKU;
            let nameB = this.db.masterProduk.find(x => x.SKU === b.SKU)?.Nama_Produk || b.SKU;
            return String(nameA||'').localeCompare(String(nameB||''));
        }).forEach(g => {
            let m = (this.db.masterProduk || []).find(x => x.SKU === g.SKU);
            if(m && (String(m.Kategori||'').toLowerCase()==='bahan' || String(m.Kategori||'').toLowerCase()==='pendukung')) {
                let sel = (prefillSku === g.SKU) ? 'selected' : '';
                opt += `<option value="${g.SKU}" ${sel}>${m.Nama_Produk} (Sisa Pusat: ${g.Stok_Pusat})</option>`; 
            }
        });
        
        let outletOpts = '';
        (this.db.outlets || []).forEach(o => {
            let selOut = (prefillOutlet === o.ID_Outlet || this.outlet === o.ID_Outlet) ? 'selected' : '';
            outletOpts += `<option value="${o.ID_Outlet}" ${selOut}>${o.Nama_Outlet}</option>`;
        });

        let inputs = `<div><label class="text-xs font-bold text-slate-500 block mb-1">Kirim Barang / Bahan Baku</label><select id="frm-dist-sku" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold outline-none text-sm bg-white text-slate-800 focus:border-brand-500 transition">${opt}</select></div>` + 
                     `<div><label class="text-xs font-bold text-slate-500 block mb-1">Tujuan Cabang</label><select id="frm-dist-out" class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold outline-none text-sm bg-white text-slate-800 focus:border-brand-500 transition">${outletOpts}</select></div>` +
                     this.makeInput('Jumlah Kirim (Pcs)', 'dist-qty', '', 'number', '', false, '');
        this.buildForm("Kirim Stok Gudang -> Cabang", inputs, "superApp.executeDistribusi()");
    },
    executeDistribusi: async function() {
        if(this.isProcessing) return;
        const elSku = document.getElementById('frm-dist-sku'); const elQty = document.getElementById('frm-dist-qty'); const elOut = document.getElementById('frm-dist-out');
        if(!elSku || !elQty || !elOut) return;
        let sku = elSku.value; let qty = this.getNumericValue(elQty.value); let targetOutlet = elOut.value;
        if(qty === 0) return this.showToast("Qty wajib diisi", "error"); this.setLoading(true, "Distribusi Stok...");
        const payload = { action: 'distribusi', sku: sku, outlet: targetOutlet, qty: qty };
        let res = await this.apiPost(payload);
        
        if(res.status === 'sukses') {
            this.closeModal('modal-form'); 
            if(!res.is_offline) { const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); this.db = await r.json(); }
            this.refreshData(); 
        }
        this.setLoading(false);
    },

    openCrudOutlet: function(action, id='') {
        let o = action==='edit' ? (this.db.outlets || []).find(x=>x.ID_Outlet===id) : {};
        let inputs = this.makeInput('ID Outlet Unik', 'out-id', o.ID_Outlet||'', 'text', '', action==='edit') + this.makeInput('Nama Outlet', 'out-nama', o.Nama_Outlet||'') + this.makeInput('Alamat / Detail', 'out-alamat', o.Alamat||'');
        this.buildForm(action==='edit'?"Edit Outlet":"Tambah Outlet Baru", inputs, `superApp.executeCrud('Daftar_Outlet', '${action==='edit'?o.ID_Outlet:''}')`);
    },
    executeCrud: async function(sheet, oldId) {
        if(this.isProcessing) return;
        let row = [], idVal = '';
        if(sheet === 'Master_Produk') { 
            const fSku = document.getElementById('frm-mst-sku'); const fNama = document.getElementById('frm-mst-nama'); const fKat = document.getElementById('frm-mst-kat'); const fBahan = document.getElementById('frm-mst-bahan'); const fImg = document.getElementById('frm-mst-img');
            if(!fSku || !fNama) return; idVal = fSku.value; row = [idVal, fNama.value, fKat.value, fBahan.value, fImg.value]; 
        } else if(sheet === 'Daftar_Outlet') { 
            const fId = document.getElementById('frm-out-id'); const fNama = document.getElementById('frm-out-nama'); const fAlamat = document.getElementById('frm-out-alamat');
            if(!fId || !fNama) return; idVal = fId.value; row = [idVal, fNama.value, fAlamat.value, 'Aktif']; 
        }
        if(!idVal) return this.showToast("Gagal menyimpan form", "error"); this.setLoading(true, "Menyimpan...");
        const payload = { action: 'save', sheetName: sheet, id: oldId || idVal, rowData: row };
        let res = await this.apiPost(payload);
        if(res.status === 'sukses') {
            this.closeModal('modal-form'); 
            if(!res.is_offline) { const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); this.db = await r.json(); }
            this.refreshData(); 
        }
        this.setLoading(false);
    },
    deleteCrud: async function(sheet, id) {
        if(this.isProcessing) return;
        if(!confirm(`Yakin hapus data ini?`)) return; this.setLoading(true, "Menghapus...");
        const payload = { action: 'delete', sheetName: sheet, id: id };
        let res = await this.apiPost(payload);
        if(!res.is_offline) { const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); this.db = await r.json(); this.refreshData(); }
        this.setLoading(false);
    },

    // STAF & KINERJA
    renderStaf: function() {
        const filterEl = document.getElementById('staf-filter-outlet');
        if(filterEl && filterEl.options.length <= 1) {
            let opts = '<option value="Semua">Semua Cabang</option>';
            (this.db.outlets || []).forEach(o => opts += `<option value="${o.ID_Outlet}">${o.Nama_Outlet}</option>`);
            filterEl.innerHTML = opts;
        }
        let selOut = filterEl ? filterEl.value : 'Semua';

        let outletSales = {}; let staffSales = {}; let maxOutletSales = 0; let maxStaffSales = 0;

        (this.db.transactions || []).forEach(t => {
            if (t.Status === 'Sukses') {
                let out = t.Outlet; let kasir = t.Kasir; let bayar = Number(t.Total_Bayar) || 0;
                if(!outletSales[out]) outletSales[out] = 0; outletSales[out] += bayar;
                if(!staffSales[kasir]) staffSales[kasir] = { outlet: out, sales: 0 }; staffSales[kasir].sales += bayar;
            }
        });

        Object.values(outletSales).forEach(v => { if(v > maxOutletSales) maxOutletSales = v; });
        Object.values(staffSales).forEach(v => { if(v.sales > maxStaffSales) maxStaffSales = v.sales; });

        let outHtml = '';
        let outArr = Object.keys(outletSales).map(k => ({name: k, sales: outletSales[k]})).sort((a,b) => b.sales - a.sales);
        outArr.forEach((o, i) => {
            let pct = maxOutletSales > 0 ? (o.sales / maxOutletSales) * 100 : 0;
            let medal = i===0 ? 'text-yellow-500' : (i===1 ? 'text-gray-400' : 'text-amber-700');
            outHtml += `<div class="flex flex-col gap-1.5 mb-5"><div class="flex justify-between text-sm font-bold text-slate-700"><span><i class="fas fa-medal ${medal} mr-2 text-lg"></i> ${o.name}</span><span>Rp ${o.sales.toLocaleString('id-ID')}</span></div><div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner"><div class="bg-gradient-to-r from-brand-500 to-orange-400 h-3 rounded-full transition-all duration-1000" style="width: ${pct}%"></div></div></div>`;
        });
        const outListEl = document.getElementById('staf-outlet-leaderboard');
        if(outListEl) outListEl.innerHTML = outHtml || this.getEmptyState('fa-store', 'Belum Ada Data', 'Belum ada transaksi terekam.');

        let stafHtml = '';
        let stafArr = Object.keys(staffSales).map(k => ({name: k, ...staffSales[k]})).filter(s => selOut === 'Semua' || s.outlet === selOut).sort((a,b) => b.sales - a.sales);
        stafArr.forEach((s, i) => {
            let pct = maxStaffSales > 0 ? (s.sales / maxStaffSales) * 100 : 0;
            stafHtml += `<div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 hover:-translate-y-1 transition duration-300"><div class="flex justify-between items-center"><div class="flex items-center gap-4"><div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm border border-blue-100">${i+1}</div><div><h4 class="font-bold text-sm text-slate-800">${s.name}</h4><p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5"><i class="fas fa-location-dot text-brand-500 mr-1"></i>${s.outlet}</p></div></div><div class="text-right"><h4 class="font-black text-brand-600 text-lg">Rp ${s.sales.toLocaleString('id-ID')}</h4></div></div><div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner"><div class="bg-blue-500 h-2 rounded-full transition-all duration-1000" style="width: ${pct}%"></div></div></div>`;
        });
        const stafListEl = document.getElementById('staf-employee-list');
        if(stafListEl) stafListEl.innerHTML = stafHtml || this.getEmptyState('fa-users', 'Belum Ada Data', 'Kasir belum mencatat penjualan.');
    },

    // UI & BLUETOOTH
    makeInput: function(label, id, val='', type='text', hint='', dis=false, customEvent='') { 
        let im = (type === 'number' || customEvent.includes('formatRupiah')) ? 'inputmode="numeric"' : '';
        return `<div><label class="text-xs font-bold text-slate-500 block mb-1 uppercase tracking-widest">${label}</label><input type="${type}" ${im} id="frm-${id}" value="${val}" ${dis?'disabled':''} ${customEvent?'oninput="'+customEvent+'"':''} class="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold focus:border-brand-500 text-sm outline-none bg-white text-slate-800 transition ${dis?'opacity-50':''}">${hint?`<p class="text-[10px] text-slate-400 mt-1">${hint}</p>`:''}</div>`; 
    },
    buildForm: function(title, inputsHtml, actionFunctionStr) {
        const titleEl = document.getElementById('modal-form-title'); if(titleEl) titleEl.innerText = title; 
        const bodyEl = document.getElementById('modal-form-body'); if(bodyEl) bodyEl.innerHTML = inputsHtml;
        const btnEl = document.getElementById('modal-form-btn'); if(btnEl) btnEl.setAttribute('onclick', actionFunctionStr);
        const modal = document.getElementById('modal-form'); const modalContent = document.getElementById('modal-form-content');
        if(modal && modalContent) { modal.classList.remove('hidden'); setTimeout(() => modalContent.classList.add('modal-enter-active'), 10); }
    },
    connectBluetooth: async function() {
        // 1. Kunci pengaman dari kasir yang menekan tombol berkali-kali
        if (this.isBluetoothSearching) return;
        this.isBluetoothSearching = true; 
        
        const btnPrinter = document.getElementById('btn-printer');
        const statusPrinter = document.getElementById('printer-status');
        this.setLoading(true, "Mengecek Printer...");

        try {
            // 2. HARD RESET: Bersihkan memori hantu dari sisa koneksi sebelumnya
            if (this.printerDevice && this.printerDevice.gatt.connected) {
                try { this.printerDevice.gatt.disconnect(); } catch(e) {}
            }
            this.printerDevice = null;
            this.printerCharacteristic = null;

            let device = null;
            let server = null;

            // 3. SMART RECONNECT: Coba masuk diam-diam tanpa pop-up browser
            if (navigator.bluetooth && navigator.bluetooth.getDevices) {
                const devices = await navigator.bluetooth.getDevices();
                if (devices.length > 0) {
                    try {
                        device = devices[0];
                        server = await device.gatt.connect(); // Bangunkan printer!
                    } catch (e) {
                        console.log("Printer lama mati/error, melupakan device...", e);
                        // Hapus memori printer jika ternyata printernya sudah mati/rusak
                        if (device.forget) await device.forget(); 
                        device = null; 
                        server = null;
                    }
                }
            }

            // 4. JIKA INGATAN KOSONG/GAGAL: Baru munculkan pop-up pencarian Chrome
            if (!server) {
                this.setLoading(true, "Mencari Perangkat Baru...");
                device = await navigator.bluetooth.requestDevice({
                    acceptAllDevices: true, 
                    optionalServices: [
                        '000018f0-0000-1000-8000-00805f9b34fb', // Standar
                        '0000ff00-0000-1000-8000-00805f9b34fb', // Zjiang / Panda / VSC
                        '0000e700-0000-1000-8000-00805f9b34fb', // Eppos
                        '0000fee7-0000-1000-8000-00805f9b34fb', // Beberapa Iware / Xprinter
                        'e7810a71-73ae-499d-8c15-faa9aef0c3f2'  // BLE Serial khusus
                    ]
                });
                this.setLoading(true, "Mengawinkan Perangkat...");
                server = await device.gatt.connect();
            }

            // 5. DETEKSI OTOMATIS (ULTIMATE): Cari pintu data yang cocok dengan merk printer
            let service;
            const serviceUUIDs = [
                '000018f0-0000-1000-8000-00805f9b34fb',
                '0000ff00-0000-1000-8000-00805f9b34fb',
                '0000e700-0000-1000-8000-00805f9b34fb',
                '0000fee7-0000-1000-8000-00805f9b34fb',
                'e7810a71-73ae-499d-8c15-faa9aef0c3f2'
            ];

            for (let uuid of serviceUUIDs) {
                try { service = await server.getPrimaryService(uuid); if(service) break; } catch(e) {}
            }
            if(!service) throw new Error("Service Printer tidak ditemukan");

            // 6. DETEKSI CHARACTERISTIC OTOMATIS (ULTIMATE)
            const charUUIDs = [
                '00002af1-0000-1000-8000-00805f9b34fb',
                '0000ff02-0000-1000-8000-00805f9b34fb',
                '0000e701-0000-1000-8000-00805f9b34fb',
                '0000fec8-0000-1000-8000-00805f9b34fb', // Pasangan fee7
                'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f'  // Pasangan e781
            ];

            for (let uuid of charUUIDs) {
                try { this.printerCharacteristic = await service.getCharacteristic(uuid); if(this.printerCharacteristic) break; } catch(e) {}
            }
            if(!this.printerCharacteristic) throw new Error("Characteristic gagal diakses");

            // --- SUKSES MENYAMBUNG ---
            this.printerDevice = device;
            if (btnPrinter) {
                btnPrinter.classList.replace('text-slate-600', 'text-green-600');
                btnPrinter.classList.add('bg-green-50', 'border-green-200');
            }
            if (statusPrinter) statusPrinter.innerText = "Printer Ready";

            this.showToast("Printer Terhubung & Siap Cetak!", "success");
            this.setLoading(false);

            // Mencegah double-listener error
            device.ongattserverdisconnected = null; 
            device.addEventListener('gattserverdisconnected', () => {
                this.printerCharacteristic = null;
                if (statusPrinter) statusPrinter.innerText = "Printer Off";
                if (btnPrinter) {
                    btnPrinter.classList.remove('bg-green-50', 'border-green-200');
                    btnPrinter.classList.replace('text-green-600', 'text-slate-600');
                }
                this.showToast("Koneksi printer terputus", "warning");
            });
            
        } catch (error) {
            this.setLoading(false);
            
            // PENYELAMATAN ERROR: Bersihkan memori agar tombol bisa ditekan ulang!
            this.printerDevice = null;
            this.printerCharacteristic = null;
            
            if (error.name === 'NotFoundError' || error.message.includes('cancelled')) {
                this.showToast("Pencarian dibatalkan.", "warning");
            } else {
                this.showToast("Gagal menyambung ke Printer.", "error");
            }
        } finally {
            // Beri jeda sistem 2 detik sebelum tombol boleh ditekan ulang
            setTimeout(() => { this.isBluetoothSearching = false; }, 2000);
        }
    },
    
    printReceipt: async function(id, outlet, total, tunai, kembali, items, status, explicitDate, antrian) {
        // PERBAIKAN 1: Sesuaikan dengan nama variabel di connectBluetooth
        if (!this.printerCharacteristic) {
            this.showToast("Printer belum terhubung!", "error");
            return;
        } 
        
        try {
            let statStr = status === 'Sukses' ? '' : '\n*** DIBATALKAN ***\n';
            let printTime = explicitDate ? explicitDate : new Date().toLocaleString('id-ID');
            let antrianStr = antrian ? `\nANTRIAN : ${antrian}` : '';
            
            // ESC/POS Commands:
            // \x1B\x61\x01 = Align Center
            // \x1B\x45\x01 = Bold ON
            // \x1B\x45\x00 = Bold OFF
            let str = "\x1B\x61\x01\x1B\x45\x01=== Ai-Snack ===\n\x1B\x45\x00";
            str += `Cabang: ${outlet}\nNo. Resi: ${id}${antrianStr}${statStr}\nKasir: ${this.currentUser.Username}\nMetode: ${this.payMethod || 'Tunai'}\nWaktu: ${printTime}\n--------------------------------\n\x1B\x61\x00\n`;
            
            items.forEach(i => {
                str += `${i.nama}\n${i.qty} x Rp ${Number(i.price).toLocaleString('id-ID')} = Rp ${(i.price * i.qty).toLocaleString('id-ID')}\n`;
            });
            
            str += `--------------------------------\n\x1B\x61\x02\x1B\x45\x01TOTAL  : Rp ${Number(total).toLocaleString('id-ID')}\nTUNAI  : Rp ${Number(tunai).toLocaleString('id-ID')}\nKEMBALI: Rp ${Number(kembali).toLocaleString('id-ID')}\n\x1B\x45\x00\x1B\x61\x01\nTerima Kasih!\n\n\n\n`; // Tambah extra \n untuk feed kertas
            
            const data = new TextEncoder().encode(str);
            
            // PERBAIKAN 2: Gunakan chunkSize 20 jika 100 masih gagal (beberapa printer lawas hanya kuat 20)
            const chunkSize = 20; 
            for (let i = 0; i < data.length; i += chunkSize) {
                // PERBAIKAN 3: Kirim ke printerCharacteristic
                await this.printerCharacteristic.writeValue(data.slice(i, i + chunkSize));
            }
        } catch(e) { 
            console.error("Gagal Cetak:", e);
            this.showToast("Gagal mencetak struk", "error");
            throw e; 
        }
    }
};

window.onload = () => superApp.init();

// Tambahkan ini di bawah window.onload = () => superApp.init();
setInterval(() => {
    if (superApp.isOnline) {
        superApp.pullFreshData(); // Memaksa tarik data setiap 5 menit (300.000 ms)
    }
}, 300000);
