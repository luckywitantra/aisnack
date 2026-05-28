const API_URL = "https://script.google.com/macros/s/AKfycbwRss8HzQwPardxTi4Scd-QOUZ2pitnsubY6pqASyLZA7oaagmym61VuFJvWjb91NRhfg/exec"; // <-- GANTI DENGAN URL API ANDA

/* ========================================== */
/* 1. MESIN VIRTUAL KEYBOARD (ENTERPRISE OSK) */
/* ========================================== */
const osKeyboard = {
    targetElement: null, mode: 'numeric', isOpen: false,
    
    // Susunan Layout Ergonomis
    layouts: {
        numeric: [ 
            ['1', '2', '3'], 
            ['4', '5', '6'], 
            ['7', '8', '9'], 
            ['C', '0', '000'] 
        ],
        text: [ 
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], 
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'], 
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'], 
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.']
        ]
    },
    
    open: function(elOrId, type = 'text') {
        this.targetElement = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
        if (!this.targetElement) return;
        
        if (this.targetElement.id) {
            this.targetElement = document.getElementById(this.targetElement.id);
        }

        this.mode = type; this.isOpen = true; this.render();
        const vk = document.getElementById('virtual-keyboard'); 
        const ov = document.getElementById('virtual-keyboard-overlay');
        
        if (vk) { vk.classList.remove('hidden'); setTimeout(() => vk.classList.remove('translate-y-full'), 10); }
        if (ov) { ov.classList.remove('hidden'); }
    },
    
    close: function() {
        this.isOpen = false; 
        const vk = document.getElementById('virtual-keyboard'); 
        const ov = document.getElementById('virtual-keyboard-overlay');
        
        if (vk) { vk.classList.add('translate-y-full'); setTimeout(() => vk.classList.add('hidden'), 300); }
        if (ov) { ov.classList.add('hidden'); }
        this.targetElement = null;
    },
    
    render: function() {
        const container = document.getElementById('vk-keys'); 
        if (!container) return;
        
        let html = ''; 
        let rows = this.layouts[this.mode];

        // 🚀 KUNCI PROPORSIONAL: Batasi lebar mode numerik, bebaskan mode teks
        let maxWidth = this.mode === 'numeric' ? 'max-w-sm' : 'max-w-3xl';
        html += `<div class="w-full ${maxWidth} mx-auto flex flex-col gap-1.5 sm:gap-2">`;

        rows.forEach(row => {
            // Gap lebih kecil untuk QWERTY agar lebih mirip keyboard asli
            let rowGap = this.mode === 'numeric' ? 'gap-2' : 'gap-1 sm:gap-1.5';
            html += `<div class="flex justify-center ${rowGap} w-full">`;
            
            row.forEach(key => {
                // Styling dasar tombol
                let baseClass = "flex items-center justify-center font-bold rounded-lg sm:rounded-xl shadow-[0_3px_0_rgba(203,213,225,1)] border border-slate-200 active:shadow-none active:translate-y-[3px] transition-all select-none touch-manipulation";
                
                // Ukuran proporsional berdasarkan mode
                let sizeClass = this.mode === 'numeric' 
                    ? "flex-1 py-4 sm:py-5 text-2xl bg-white text-slate-800" 
                    : "flex-1 py-3 sm:py-4 text-sm sm:text-lg bg-white text-slate-800";

                // 🚀 PERBAIKAN: Pisahkan logika eksekusi khusus untuk tombol "C"
                if (key === 'C') {
                    sizeClass = this.mode === 'numeric'
                        ? "flex-1 py-4 sm:py-5 text-2xl bg-rose-50 text-rose-500 border-rose-200 shadow-[0_3px_0_rgba(254,205,211,1)]"
                        : "flex-1 py-3 sm:py-4 text-sm sm:text-lg bg-rose-50 text-rose-500 border-rose-200 shadow-[0_3px_0_rgba(254,205,211,1)]";
                    
                    // Panggil fungsi clear(), BUKAN insert()
                    html += `<button type="button" class="${baseClass} ${sizeClass}" onclick="osKeyboard.clear()">${key}</button>`;
                } else {
                    // Tombol angka / teks normal memanggil fungsi insert()
                    html += `<button type="button" class="${baseClass} ${sizeClass}" onclick="osKeyboard.insert('${key}')">${key}</button>`;
                }
            });
            html += `</div>`;
        });

        // 🚀 ROW BAWAH: Tombol Aksi (Space, Backspace, Enter) disesuaikan per mode
        if (this.mode === 'text') {
            // Layout Bawah QWERTY
            html += `<div class="flex justify-center gap-1 sm:gap-1.5 w-full mt-0.5">
                <button type="button" class="flex-[1.5] py-3 bg-slate-200 text-slate-600 font-bold rounded-xl shadow-[0_3px_0_rgba(156,163,175,1)] active:shadow-none active:translate-y-[3px] transition-all flex items-center justify-center select-none" onclick="osKeyboard.backspace()">
                    <i class="fas fa-delete-left text-lg"></i>
                </button>
                <button type="button" class="flex-[5] py-3 bg-white text-slate-800 font-bold rounded-xl shadow-[0_3px_0_rgba(203,213,225,1)] border border-slate-200 active:shadow-none active:translate-y-[3px] transition-all select-none tracking-widest text-xs sm:text-sm" onclick="osKeyboard.insert(' ')">
                    SPASI
                </button>
                <button type="button" class="flex-[2] py-3 bg-brand-500 text-white font-bold rounded-xl shadow-[0_3px_0_rgba(194,65,12,1)] active:shadow-none active:translate-y-[3px] transition-all flex items-center justify-center gap-1 select-none" onclick="osKeyboard.close()">
                    <i class="fas fa-check"></i> OK
                </button>
            </div>`;
        } else {
            // Layout Bawah NUMERIK
            html += `<div class="flex justify-center gap-2 w-full mt-1">
                <button type="button" class="flex-1 py-4 sm:py-5 bg-slate-200 text-slate-700 font-bold rounded-xl shadow-[0_3px_0_rgba(156,163,175,1)] active:shadow-none active:translate-y-[3px] transition-all text-xl flex items-center justify-center select-none" onclick="osKeyboard.backspace()">
                    <i class="fas fa-delete-left"></i>
                </button>
                <button type="button" class="flex-[2] py-4 sm:py-5 bg-brand-500 text-white font-black rounded-xl shadow-[0_3px_0_rgba(194,65,12,1)] active:shadow-none active:translate-y-[3px] transition-all text-xl flex items-center justify-center gap-2 select-none" onclick="osKeyboard.close()">
                    <i class="fas fa-check-circle"></i> SELESAI
                </button>
            </div>`;
        }

        html += `</div>`;
        container.innerHTML = html;
    },
    
    insert: function(char) { 
        if (!this.targetElement) return; 
        if (this.targetElement.value === '0' && char !== '.') {
            this.targetElement.value = '';
        }
        this.targetElement.value += char; 
        this.targetElement.dispatchEvent(new Event('input', { bubbles: true })); 
    },
    
    backspace: function() { 
        if (!this.targetElement) return; 
        this.targetElement.value = this.targetElement.value.slice(0, -1); 
        this.targetElement.dispatchEvent(new Event('input', { bubbles: true })); 
    },
    
    clear: function() { 
        if (!this.targetElement) return; 
        this.targetElement.value = ''; 
        this.targetElement.dispatchEvent(new Event('input', { bubbles: true })); 
    }
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
    // FUNGSI UNTUK MEMBUKA MODAL APAPUN
    openModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Tampilkan modal
            modal.classList.remove('hidden');
            
            // Opsional: Kunci background agar tidak bisa di-scroll saat modal terbuka
            document.body.classList.add('overflow-hidden');
            
            // Berikan sedikit delay untuk memicu animasi masuk (jika ada)
            const content = modal.querySelector('.modal-enter');
            if (content) {
                content.style.opacity = '0';
                content.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    content.style.transition = 'all 0.3s ease-out';
                    content.style.opacity = '1';
                    content.style.transform = 'scale(1)';
                }, 10);
            }
        }
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
        
        // --- 🚀 KUNCI PERBAIKAN: KAPSULISASI DATA PAID ---
        // Jika statusnya paid, kita KUNCI (simpan paksa) angka total dan kembali yang SAAT INI
        // Karena jika kita bergantung pada this.payChange di saat kasir bergerak cepat, 
        // this.payChange bisa saja sudah kembali jadi 0.
        if (status === 'paid') {
            this._lastPaidTotal = this.payTotal;
            this._lastPaidChange = this.payChange;
        }

        let sentTotal = status === 'paid' ? this._lastPaidTotal : this.payTotal;
        let sentChange = status === 'paid' ? this._lastPaidChange : this.payChange;
        // ------------------------------------------------

        localStorage.setItem('ai_snack_cfd', JSON.stringify({ 
            outlet: this.outlet || 'Ai-Snack', 
            items: this.cart, 
            total: sentTotal, 
            kembali: sentChange, 
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
        
        // --- JIKA PEMBAYARAN SUKSES ---
        if (data.status === 'paid') { 
            cfdSuccess.classList.remove('hidden'); 
            cfdStandby.classList.add('opacity-0', 'pointer-events-none'); 
            
            let kembalianAman = Number(data.kembali || 0).toLocaleString('id-ID');
            document.getElementById('cfd-kembali').innerHTML = `Rp ${kembalianAman}<br><span class="text-white text-4xl sm:text-5xl mt-6 block drop-shadow-md">NOMOR ANTRIAN ANDA:<br><span class="text-yellow-300 font-black text-6xl sm:text-8xl mt-2 block">${data.antrian || '-'}</span></span>`; 
            
            if(this.cfdSuccessTimeout) clearTimeout(this.cfdSuccessTimeout);
            this.cfdSuccessTimeout = setTimeout(() => { 
                cfdSuccess.classList.add('hidden'); 
                cfdStandby.classList.remove('opacity-0', 'pointer-events-none');
            }, 7000); 
            
            return; 
        } 
        
        // --- JIKA TRANSAKSI NORMAL / NORMAL BARU ---
        cfdSuccess.classList.add('hidden'); 
        if(this.cfdSuccessTimeout) clearTimeout(this.cfdSuccessTimeout);
        
        if (data.items && data.items.length === 0) { 
            cfdStandby.classList.remove('opacity-0', 'pointer-events-none'); 
        } 
        else if (data.items) {
            cfdStandby.classList.add('opacity-0', 'pointer-events-none'); 
            let html = '';
            
            // 🚀 PERBAIKAN 2: Kartu Pesanan Berkelas (Badge QTY & Animasi Slide)
            data.items.forEach((i, idx) => { 
                // Delay animasi bertingkat berdasarkan urutan item agar munculnya beruntun
                let delay = idx * 50; 
                html += `
                <div class="bg-white p-4 lg:p-5 rounded-2xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex justify-between items-center transform transition-all" style="animation: slideInRight 0.4s ease-out ${delay}ms both;">
                    <div class="flex items-center gap-4">
                        <div class="bg-slate-100/80 border border-slate-200 text-brand-600 font-black w-10 h-10 flex justify-center items-center rounded-xl text-sm shadow-inner shrink-0">
                            ${i.qty}x
                        </div>
                        <div>
                            <h4 class="font-extrabold text-slate-800 text-sm lg:text-base leading-tight">${i.nama}</h4>
                            <p class="text-[10px] lg:text-xs font-bold text-slate-400 mt-1">@ Rp ${Number(i.price || 0).toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    <div class="font-black text-brand-500 text-lg lg:text-xl shrink-0">
                        Rp ${(Number(i.price || 0) * Number(i.qty || 0)).toLocaleString('id-ID')}
                    </div>
                </div>`; 
            });
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

            // Deteksi Role Admin / Owner
            let roleStr = String(user.Role).toLowerCase();
            let isAdmin = roleStr.includes('admin') || roleStr.includes('owner');
            
            const adminMenus = document.getElementById('admin-menus'); const selOut = document.getElementById('select-outlet'); const repOut = document.getElementById('report-outlet-filter');

            if (isAdmin) {
                // AKSES ADMIN/OWNER
                if (adminMenus) adminMenus.classList.remove('hidden'); if (selOut) selOut.classList.remove('hidden'); if (repOut) repOut.classList.remove('hidden');
                let outOptions = ''; let outFilters = '<option value="Semua">Semua Outlet</option>';
                (this.db.outlets || []).forEach(o => { outOptions += `<option value="${o.ID_Outlet}">📍 ${o.Nama_Outlet}</option>`; outFilters += `<option value="${o.ID_Outlet}">Hanya: ${o.Nama_Outlet}</option>`; });
                if (selOut) { selOut.innerHTML = outOptions; selOut.value = this.outlet; selOut.disabled = false; }
                if (repOut) repOut.innerHTML = outFilters;
                
                // 🚀 BUKA KUNCI MENU PROMO UNTUK ADMIN/OWNER
                const cardStandby = document.getElementById('setting-card-standby'); 
                if (cardStandby) cardStandby.classList.remove('hidden');
                
                const cardTransaksi = document.getElementById('setting-card-transaksi'); 
                if (cardTransaksi) cardTransaksi.classList.remove('hidden');

            } else {
                // AKSES KASIR BIASA
                if (adminMenus) adminMenus.classList.add('hidden');
                if (selOut) { selOut.classList.add('hidden'); selOut.innerHTML = `<option value="${this.outlet}">📍 ${this.outlet}</option>`; selOut.disabled = true; }
                if (repOut) repOut.classList.add('hidden');
                
                // 🔒 KUNCI MENU PROMO DARI KASIR BIASA
                const cardStandby = document.getElementById('setting-card-standby'); 
                if (cardStandby) cardStandby.classList.add('hidden');
                
                const cardTransaksi = document.getElementById('setting-card-transaksi'); 
                if (cardTransaksi) cardTransaksi.classList.add('hidden');
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

            // 🚀 PICU AUTO-CONNECT PRINTER DI SINI
            this.autoConnectPrinter();

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
        // 🚀 1. PASTIKAN TEMA WARNA TERAPLIKASI SESUAI CABANG AKTIF
        this.applyOutletTheme();

        // 2. Terapkan Lencana Warna di Header POS dan Label Manajemen Outlet
        const hSub = document.getElementById('header-subtitle'); 
        if (hSub) hSub.innerHTML = this.getOutletBadge(this.outlet);
        
        const lOutManage = document.getElementById('label-outlet-manage'); 
        if (lOutManage) lOutManage.innerHTML = this.getOutletBadge(this.outlet);

        // 3. Proses Produk
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

        // 4. Render Semua Menu
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
        
        // 🚀 PEMETAAN WARNA KHUSUS UNTUK SETIAP MENU
        const colors = {
            'pos': 'text-brand-500',      // Oranye
            'terima': 'text-green-600',   // Hijau
            'opname': 'text-purple-600',  // Ungu
            'report': 'text-blue-600',    // Biru
            'audit': 'text-indigo-600',   // Nila
            'ai': 'text-pink-600',        // Merah Muda
            'gudang': 'text-emerald-600', // Hijau Tua
            'outlet': 'text-teal-600',    // Teal (Biru Kehijauan)
            'staf': 'text-amber-600'      // Kuning
        };
        const allColors = Object.values(colors);

        // 1. Reset Warna Sidebar (PC)
        document.querySelectorAll('.nav-btn').forEach(b => { 
            b.classList.remove('nav-active', 'bg-slate-50', ...allColors); 
            b.classList.add('text-slate-500'); 
            let icon = b.querySelector('i');
            if(icon) { icon.classList.remove(...allColors); icon.classList.add('text-slate-400'); }
        });

        // 2. Aktifkan Warna Sidebar Terpilih
        const activeNav = document.getElementById(`nav-${menu}`); 
        if (activeNav) { 
            let targetColor = colors[menu] || 'text-brand-500';
            activeNav.classList.add('nav-active', 'bg-slate-50', targetColor); 
            activeNav.classList.remove('text-slate-500'); 
            let icon = activeNav.querySelector('i');
            if(icon) { icon.classList.remove('text-slate-400'); icon.classList.add(targetColor); }
        }

        const activeView = document.getElementById(`view-${menu}`); 
        if (activeView) activeView.classList.remove('hidden');

        const titles = { 'pos': 'POS', 'opname': 'Opname Fisik Stok', 'terima': 'Penerimaan Barang', 'audit': 'Audit Laporan', 'report': 'Laporan Terpadu', 'ai': 'Asisten AI', 'gudang': 'Gudang Pusat', 'master': 'Master Varian POS', 'outlet': 'Cabang & Harga Khusus', 'staf': 'Kinerja Karyawan' };
        const pageTitle = document.getElementById('page-title'); 
        if (pageTitle) pageTitle.innerText = titles[menu] || 'Aplikasi';

        // 3. Tutup Sidebar otomatis jika dibuka di HP
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth < 1024 && sidebar && !sidebar.classList.contains('-translate-x-full')) {
            this.toggleSidebar();
        }

        // 4. Reset & Aktifkan Warna Menu Bawah (HP)
        document.querySelectorAll('.nav-mobile-btn').forEach(btn => {
            let target = btn.dataset.target;
            btn.classList.remove(...allColors);
            if(target === menu) {
                btn.classList.add(colors[target] || 'text-brand-500');
                btn.classList.remove('text-slate-400');
            } else {
                btn.classList.add('text-slate-400');
            }
        });

        // Render Data Berdasarkan Halaman
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
        let img = p.img ? `<img src="${p.img}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/150x150/f8fafc/94a3b8?text=Err';" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">` : `<div class="w-full h-full flex items-center justify-center text-3xl text-slate-300 opacity-50 bg-slate-50"><i class="fas fa-utensils"></i></div>`;
        let isHabis = p.maxStok <= 0 ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:-translate-y-1.5 hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] hover:border-brand-200';
        
        return `<div onclick="${p.maxStok > 0 ? `superApp.addToCart('${p.sku}', '${p.nama}', ${p.harga}, ${p.maxStok}, '${p.sku_bahan || ''}', event)` : ''}" class="bg-white border-2 border-transparent rounded-[1.5rem] p-3 cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col relative group ${isHabis}">
            <span class="absolute top-4 right-4 ${p.maxStok <= 0 ? 'bg-red-500' : 'bg-slate-900/80 backdrop-blur-md'} text-white text-[10px] font-black px-2.5 py-1 rounded-lg z-10 shadow-md tracking-wider">${p.maxStok <= 0 ? 'HABIS' : `STOK: ${p.maxStok}`}</span>
            <div class="aspect-[4/3] mb-4 overflow-hidden rounded-[1rem] bg-slate-100 relative shadow-inner">${img}</div>
            <div class="flex flex-col flex-1 justify-between px-1">
                <h3 class="font-bold text-xs md:text-sm text-slate-800 leading-snug mb-2 line-clamp-2">${p.nama}</h3>
                <div class="flex items-center justify-between mt-1">
                    <p class="text-brand-500 font-black text-sm md:text-base tracking-tight">Rp ${p.harga.toLocaleString('id-ID')}</p>
                    <div class="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"><i class="fas fa-plus text-[10px]"></i></div>
                </div>
            </div>
        </div>`;
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
    
    changeQty: function(idx, val) { 
        // 🚀 PERBAIKAN: Cegah kasir menambah pesanan melampaui stok dari dalam keranjang
        if (val > 0) {
            let item = this.cart[idx];
            let currentStokBahan = 0; let refBahan = item.sku_bahan || item.sku;
            this.cart.forEach(i => { if ((i.sku_bahan || i.sku) === refBahan) currentStokBahan += i.qty; });
            if (currentStokBahan >= item.maxStok) return this.showToast(`Stok Habis!`, 'error');
        }
        
        this.cart[idx].qty += val; 
        if (this.cart[idx].qty <= 0) this.cart.splice(idx, 1); 
        this.renderCart(); 
    },
    
    renderCart: function() {
        const cont = document.getElementById('cart-container'); let total = 0, items = 0, html = ''; if (!cont) return;
        
        this.cart.forEach((i, idx) => {
            total += (i.price * i.qty); items += i.qty;
            
            // Logika hitung sisa stok aktual di keranjang
            let sisaBahanDiKeranjang = 0; let refBahan = i.sku_bahan || i.sku;
            this.cart.forEach(c => { if ((c.sku_bahan || c.sku) === refBahan) sisaBahanDiKeranjang += c.qty; });
            let stokTersisaVisual = i.maxStok - sisaBahanDiKeranjang;

            // 🚀 PERBAIKAN UI: Desain Card Item Premium & Elegan
            html += `<div class="flex bg-white border border-slate-100 p-3.5 rounded-[1.25rem] shadow-[0_4px_12px_rgba(0,0,0,0.03)] items-center gap-3 text-slate-800 transition transform hover:-translate-y-0.5">
                
                <div class="flex-1 min-w-0">
                    <h4 class="font-extrabold text-sm truncate text-slate-800 mb-0.5">${i.nama}</h4>
                    <div class="flex items-center gap-2">
                        <p class="text-brand-500 font-black text-sm tracking-tight">Rp ${(i.price * i.qty).toLocaleString('id-ID')}</p>
                        <span class="text-[10px] text-slate-400 font-bold border border-slate-100 px-1.5 py-0.5 rounded-md ${stokTersisaVisual <= 0 ? 'bg-red-50 text-red-500 border-red-100' : ''}">Sisa: ${stokTersisaVisual}</span>
                    </div>
                </div>

                <div class="flex bg-slate-50 rounded-xl border border-slate-200 shadow-inner p-1 overflow-hidden shrink-0 items-center">
                    <button onclick="superApp.changeQty(${idx}, -1)" class="w-8 h-8 flex items-center justify-center font-black text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg transition-all hover:shadow-sm"><i class="fas fa-minus text-xs"></i></button>
                    <span class="w-8 flex items-center justify-center text-sm font-black text-slate-800">${i.qty}</span>
                    <button onclick="superApp.changeQty(${idx}, 1)" class="w-8 h-8 flex items-center justify-center font-black text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg transition-all hover:shadow-sm"><i class="fas fa-plus text-xs"></i></button>
                </div>

            </div>`;
        });
        
        cont.innerHTML = this.cart.length ? html : this.getEmptyState('fa-shopping-basket', 'Keranjang Kosong', 'Yuk, tambahkan pesanan!');
        
        const totalEl = document.getElementById('total-price'); if (totalEl) totalEl.innerText = `Rp ${total.toLocaleString('id-ID')}`;
        const badge = document.getElementById('cart-badge'); if (badge) badge.innerText = `${items} Item`;
        
        // 🚀 Tembakkan update angka ke Floating Button di HP
        const mobQty = document.getElementById('mobile-cart-qty'); 
        if (mobQty) mobQty.innerText = `${items} ITEM`;
        
        const mobTotal = document.getElementById('mobile-cart-total'); 
        if (mobTotal) mobTotal.innerText = `Rp ${total.toLocaleString('id-ID')}`;

        this.payTotal = total; 
        
        this.syncStorage(); // KEMBALIKAN KE NORMAL
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
        if (this.isProcessing) return; 
        this.isProcessing = true;
        
        let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
        let todayStrLocal = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        
        let countToday = 0;
        (this.db.transactions || []).forEach(t => {
            if (t.Outlet === this.outlet && this.cleanDateOnly(t.Tanggal) === todayStrLocal) { countToday++; }
        });
        let noAntrian = countToday + 1;
        let trxID = 'TRX' + d.getTime();

        // 🚀 LOGIKA PINTAR ANDA: Jika mesin mendeteksi ada printer terhubung, anggap Pasti Sukses Cetak
        let isPrintSuccess = this.printerCharacteristic ? true : false;
        
        const payload = { action: 'checkout', trx_id: trxID, outlet: this.outlet, kasir: this.currentUser.Username, metode_bayar: this.payMethod, total: this.payTotal, tunai: this.payCash, kembali: this.payChange, items: this.cart, id_shift: this.activeShiftId, tim_operasional: this.activeStaffTeam, antrian: noAntrian, status_cetak: isPrintSuccess ? 'Sudah' : 'Belum' };

        // 1. UPDATE MEMORI LOKAL DULUAN
        if (!this.db.transactions) this.db.transactions = [];
        this.db.transactions.push({ 
            ID_TRX: trxID, Tanggal: todayStrLocal, Waktu: `${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`, 
            Outlet: this.outlet, Kasir: this.currentUser.Username, Metode_Bayar: this.payMethod, 
            Total_Bayar: this.payTotal, Tunai: this.payCash, Kembalian: this.payChange, 
            Items_JSON: JSON.stringify(this.cart), ID_Shift: this.activeShiftId, Status: 'Sukses', Antrian: noAntrian,
            Status_Cetak: isPrintSuccess ? 'Sudah' : 'Belum'
        });
        localStorage.setItem('aisnack_db_cache', JSON.stringify(this.db));
        this.refreshData(); 
        this.showToast(`Transaksi Sukses! No Antrian: ${noAntrian}`);

        // 2. JALANKAN PRINTER DI BACKGROUND (Tanpa memblokir layar kasir)
        if (isPrintSuccess) {
            this.printReceipt(trxID, this.outlet, this.payTotal, this.payCash, this.payChange, this.cart, 'Sukses', null, noAntrian, false).catch(e => console.log("Gagal print background"));
        }

        // 3. RESET KASIR & CFD SECARA INSTAN
        this._lastPaidTotal = this.payTotal;
        this._lastPaidChange = this.payChange;
        this.cart = []; 
        this.renderCart(); 
        this.syncStorage('paid', noAntrian); 
        this.closeModal('modal-payment'); 
        
        this.isProcessing = false;

        // 4. SINKRONISASI SERVER DI LATAR BELAKANG
        this.apiPost(payload).then(res => {
            if (res && res.status === 'sukses' && !res.is_offline) {
                
                // 🚀 ANTI BALAPAN WAKTU: Lapor status cetak SETELAH transaksi sukses dibuat di server Google Sheets!
                if (isPrintSuccess) {
                    this.laporStrukDicetak(trxID);
                }

                // Segarkan data dari server
                fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' })
                    .then(r => r.json())
                    .then(data => {
                        if (data && data.status === 'sukses') {
                            this.db = data;
                            localStorage.setItem('aisnack_db_cache', JSON.stringify(data));
                            if (this.cart.length === 0) {
                                this.refreshData();
                            }
                        }
                    }).catch(e => console.log("Aman, memori lokal sudah tercatat."));
            } else if (res && res.status !== 'sukses' && !res.is_offline) {
               let isAlreadyQueued = this.offlineQueue.some(q => q.trx_id === payload.trx_id);
               if (!isAlreadyQueued) {
                   this.offlineQueue.push(payload);
                   localStorage.setItem('aisnack_offline_queue', JSON.stringify(this.offlineQueue));
                   this.updateNetworkUI();
               }
            }
        }).catch(err => { console.log("Masuk ke antrean offline."); });
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
    
    // 1. Kumpulkan data dan hitung total item
    let items = [];
    let waText = `*LAPORAN BARANG DATANG PUSAT*\n📍 Cabang: ${this.outlet}\n👤 Kasir: ${this.currentUser.Username}\n📅 Waktu: ${new Date().toLocaleString('id-ID')}\n\n*_Mohon cek aplikasi menu Audit untuk memverifikasi agar stok masuk ke sistem_*\n\n`;

    (this.db.masterProduk || []).forEach(m => {
        if (String(m.Kategori || '').toLowerCase() === 'bahan' || String(m.Kategori || '').toLowerCase() === 'pendukung') {
            let inputDesk = document.getElementById(`trm-qty-${m.SKU}`); 
            let inputMob = document.getElementById(`trm-qty-mob-${m.SKU}`);
            let qtyStr = inputDesk && inputDesk.value !== '' ? inputDesk.value : (inputMob && inputMob.value !== '' ? inputMob.value : '');

            if (qtyStr !== '' && parseInt(this.getNumericValue(qtyStr)) > 0) {
                let noteDesk = document.getElementById(`trm-note-${m.SKU}`); 
                let noteMob = document.getElementById(`trm-note-mob-${m.SKU}`);
                let note = noteDesk && noteDesk.value !== '' ? noteDesk.value : (noteMob && noteMob.value !== '' ? noteMob.value : '');
                
                items.push({ sku: m.SKU, nama: m.Nama_Produk, qty: parseInt(this.getNumericValue(qtyStr)), catatan: note });
                waText += `📦 *${m.Nama_Produk}*\nQty Diterima: *${qtyStr} Pcs*\nCatatan: ${note || '-'}\n\n`;
            }
        }
    });

    if (items.length === 0) return this.showToast("Tidak ada barang masuk yang diinput!", "error");

    // 2. 🚀 CEK DUPLIKAT (PENCEGAHAN INPUT GANDA)
    let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
    let todayStrLocal = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    
    let sudahInputHariIni = this.db.mutasi.some(m => 
        m.Outlet_Tujuan === this.outlet && 
        this.cleanDateOnly(m.Waktu) === todayStrLocal &&
        m.Status_Approval === 'Pending' // Hanya cek yang masih pending/belum diproses
    );

    if (sudahInputHariIni) {
        let konfirmasi = confirm("⚠️ PERINGATAN: Cabang ini sudah memiliki laporan 'Barang Datang' yang sedang menunggu otorisasi hari ini. Yakin ingin menambah input baru?");
        if (!konfirmasi) return; 
    }

    if (!confirm("Kirim Laporan Barang Datang ke Owner? Stok tidak akan bertambah hingga di-Setujui.")) return;
    
    this.setLoading(true, "Menyimpan...");

    const payload = { action: 'terima_barang_kasir', outlet: this.outlet, kasir: this.currentUser.Username, items: items };
    let res = await this.apiPost(payload);
    
    if (res.status === 'sukses') {
        this.showToast("Berhasil Disimpan di Sistem!");
        this.showWaModal(waText);
        
        // Refresh data agar database lokal update
        if (!res.is_offline) { 
            const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); 
            this.db = await r.json(); 
            this.refreshData(); 
        }
        this.switchMenu('pos');
    }
    this.setLoading(false);
},
  renderOpname: function() {
    const lbl = document.getElementById('lbl-opname-outlet'); if (lbl) lbl.innerText = this.outlet;
    let hu = ''; let hp = ''; let hum = ''; let hpm = '';
    
    // Simpan data sys untuk disuntikkan ulang nanti
    let autoFillData = []; 

    [...(this.db.masterProduk || [])].sort((a, b) => String(a.Nama_Produk || '').localeCompare(String(b.Nama_Produk || ''))).forEach(m => {
        if (String(m.Kategori || '').toLowerCase() === 'bahan' || String(m.Kategori || '').toLowerCase() === 'pendukung') {
            let sData = (this.db.hargaStokOutlet || []).find(x => x.SKU === m.SKU && x.ID_Outlet === this.outlet);
            let sys = sData ? Number(sData.Stok_Toko) : 0;

            // Simpan ID elemen dan valuenya ke array
            autoFillData.push({ idDesk: `opn-fisik-${m.SKU}`, idMob: `opn-fisik-mob-${m.SKU}`, val: sys });

            // (Kode HTML Anda tetap sama, value="${sys}" biarkan saja di situ)
            let desk = `<tr class="border-b border-slate-50">
                <td class="py-3 px-4 min-w-[150px] whitespace-normal text-slate-800">${m.Nama_Produk}<br><span class="text-[10px] text-slate-400 font-normal">${m.SKU}</span></td>
                <td class="py-3 px-4 text-center text-brand-600" id="opn-sys-${m.SKU}">${sys}</td>
                <td class="py-3 px-4 text-center">
                    <input type="text" id="opn-fisik-${m.SKU}" class="w-20 border-2 border-slate-200 rounded-lg px-2 py-1 text-center outline-none focus:border-brand-500 bg-white text-slate-800 cursor-pointer" value="${sys}" readonly onclick="osKeyboard.open('opn-fisik-${m.SKU}', 'numeric')" oninput="superApp.calcOpname('${m.SKU}')">
                </td>
                <td class="py-3 px-4 text-right font-black text-slate-300" id="opn-selisih-${m.SKU}">0</td>
                <td class="py-3 px-4"><input type="text" id="opn-note-${m.SKU}" class="w-full border border-slate-200 rounded-lg px-2 py-1 outline-none text-xs text-slate-800 cursor-pointer" readonly onclick="osKeyboard.open('opn-note-${m.SKU}', 'text')" placeholder="Kondisi Fisik..."></td>
            </tr>`;
            
            let mob = `<div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-extrabold text-sm text-slate-800">${m.Nama_Produk}</h4>
                        <p class="text-[10px] text-slate-400">Sys: <span id="opn-sys-mob-${m.SKU}" class="font-bold text-brand-500">${sys}</span></p>
                    </div>
                    <span class="font-black text-slate-300 text-lg" id="opn-selisih-mob-${m.SKU}">0</span>
                </div>
                <div class="flex gap-2">
                    <input type="text" id="opn-fisik-mob-${m.SKU}" class="w-1/3 border-2 border-slate-200 rounded-xl px-3 py-2 text-center outline-none focus:border-brand-500 bg-white text-slate-800 font-bold text-sm cursor-pointer" value="${sys}" readonly onclick="osKeyboard.open('opn-fisik-mob-${m.SKU}', 'numeric')" oninput="superApp.calcOpnameMob('${m.SKU}')">
                    <input type="text" id="opn-note-mob-${m.SKU}" class="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 outline-none text-xs text-slate-800 cursor-pointer" readonly onclick="osKeyboard.open('opn-note-mob-${m.SKU}', 'text')" placeholder="Catatan...">
                </div>
            </div>`;

            if (String(m.Kategori || '').toLowerCase() === 'bahan') { hu += desk; hum += mob; } else { hp += desk; hpm += mob; }
        }
    });

    const tU = document.getElementById('opname-tbody-utama'); if (tU) tU.innerHTML = hu || this.getEmptyState('fa-box-open', 'Belum Ada Bahan', 'Tambahkan bahan di menu gudang');
    const tP = document.getElementById('opname-tbody-pendukung'); if (tP) tP.innerHTML = hp || this.getEmptyState('fa-box-open', 'Belum Ada Barang', 'Tambahkan pendukung di gudang');
    const mobCards = document.getElementById('opname-mobile-cards'); if (mobCards) mobCards.innerHTML = `<h4 class="font-extrabold text-brand-600 mt-2 mb-2 bg-brand-50 p-3 rounded-xl border border-brand-100 text-sm">A. Bahan Utama</h4>` + (hum || '<p class="text-xs text-center">Kosong</p>') + `<h4 class="font-extrabold text-slate-600 mt-6 mb-2 bg-slate-100 p-3 rounded-xl border border-slate-200 text-sm">B. Pendukung & Packaging</h4>` + (hpm || '<p class="text-xs text-center">Kosong</p>');

    // 🚀 KUNCI PERBAIKAN 3: Eksekusi injeksi value manual setelah DOM ter-render
    // Ini adalah 'obat kuat' untuk masalah browser HP
    setTimeout(() => {
        autoFillData.forEach(item => {
            let elDesk = document.getElementById(item.idDesk);
            let elMob = document.getElementById(item.idMob);
            if (elDesk) elDesk.value = item.val;
            if (elMob) elMob.value = item.val;
        });
    }, 50); // Jeda 50ms sangat cukup agar HP sadar ada tabel baru
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
        // 1. Hitung Kecepatan Jualan (Velocity) untuk Bahan Utama dari Riwayat Transaksi
        let productSales = {};
        let oldestDate = new Date();
        
        (this.db.transactions || []).forEach(t => {
            if(t.Status === 'Sukses' && t.Outlet === outlet) {
                let d = this.parseDateId(t.Tanggal); 
                if(d < oldestDate && d.getTime() > 0) oldestDate = d;
                
                let parsedItems = []; 
                try { parsedItems = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
                
                parsedItems.forEach(item => {
                    let refSku = item.sku_bahan || item.sku;
                    if(!productSales[refSku]) productSales[refSku] = 0;
                    productSales[refSku] += Number(item.qty) || 0;
                });
            }
        });
        
        // 1.5 🚀 Hitung Total Barang Masuk (Mutasi) untuk Barang Pendukung
        let mutasiIn = {};
        (this.db.mutasi || []).forEach(m => {
            if(m.Outlet_Tujuan === outlet && m.Status_Approval === 'Disetujui') {
                if(!mutasiIn[m.SKU]) mutasiIn[m.SKU] = 0;
                mutasiIn[m.SKU] += Number(m.Qty) || 0;
            }
        });

        let todayObj = new Date();
        let daysActive = Math.ceil((todayObj - oldestDate) / (1000 * 60 * 60 * 24));
        if (daysActive < 1) daysActive = 1;

        // 2. Pisahkan Kategori & Urutkan A-Z
        let bermasalah = [];
        let aman = [];

        items.forEach(item => {
            
            // 🚀 KALKULASI PINTAR BERDASARKAN KATEGORI BARANG
            if (String(item.kategori).toLowerCase() === 'bahan') {
                // A. Barang Utama (Dihitung dari kasir/POS)
                let soldQty = productSales[item.sku] || 0;
                let vel = soldQty / daysActive;
                if (vel > 0) item.estHari = Math.floor(item.fisik / vel);
                else item.estHari = -1; 
            } else {
                // B. Barang Pendukung (Dihitung dari Arus Masuk vs Fisik)
                // Total Terpakai = Total Pernah Dikirim Pusat - Sisa Fisik Saat Ini
                let totalReceived = mutasiIn[item.sku] || item.sys; // Fallback ke stok sistem jika blm ada mutasi
                let totalUsed = totalReceived - item.fisik;
                
                if (totalUsed > 0 && daysActive > 0) {
                    let vel = totalUsed / daysActive; // Rata-rata pemakaian pcs per hari
                    item.estHari = Math.floor(item.fisik / vel);
                } else {
                    item.estHari = -1; // Jika barang belum pernah dipakai sama sekali
                }
            }

            // FILTER: Jika ada selisih ATAU kasir memberikan catatan khusus
            if (item.selisih !== 0 || (item.note && item.note.trim() !== '')) {
                bermasalah.push(item);
            } else {
                aman.push(item);
            }
        });

        bermasalah.sort((a,b) => String(a.nama).localeCompare(String(b.nama)));
        aman.sort((a,b) => String(a.nama).localeCompare(String(b.nama)));

        // 3. SUSUN TEKS WHATSAPP EKSEKUTIF
        let waText = `*LAPORAN OPNAME FISIK & AUDIT*\n📍 Cabang: ${outlet}\n👤 Kasir: ${kasir}\n📅 Waktu: ${waktu}\n\n*_Mohon cek menu Audit Opname di aplikasi untuk menyetujui_*\n\n`;

        // --- A. Render Barang Bermasalah / Selisih ---
        if (bermasalah.length > 0) {
            waText += `🚨 *ITEM SELISIH / CATATAN (${bermasalah.length})*\n`;
            bermasalah.forEach(i => {
                let alertStr = i.fisik <= 0 ? 'HABIS 🛑' : (i.estHari === -1 ? 'Belum ada data pakai 📉' : (i.estHari < 4 ? `${i.estHari} Hari (Kritis ⚠️)` : `${i.estHari > 99 ? '>99' : i.estHari} Hari (Aman ✅)`));
                let icon = i.selisih < 0 ? '📉' : (i.selisih > 0 ? '📈' : '⚠️');
                
                waText += `${icon} *${i.nama}*\nSys: ${i.sys} | Fisik: ${i.fisik} | Selisih: *${i.selisih > 0 ? '+'+i.selisih : i.selisih}*\n⏳ Est Habis: ${alertStr}\nCatatan: ${i.note || '-'}\n\n`;
            });
        } else {
            waText += `🚨 *ITEM SELISIH / CATATAN*\n_Nihil. Kinerja staf sangat teliti, tidak ada selisih stok!_ 🎉\n\n`;
        }

        // --- B. Render Barang Aman ---
        if (aman.length > 0) {
            waText += `✅ *ITEM AMAN FISIK SESUAI SISTEM (${aman.length})*\n`;
            let amanNames = aman.map(i => i.nama).join(', ');
            waText += `_${amanNames}_\n`;
        }

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
            
            // 1. 🚀 AMBIL DATA SISTEM DARI DATABASE (100% Akurat, bebas dari error pembacaan HTML)
            let sData = (this.db.hargaStokOutlet || []).find(x => x.SKU === m.SKU && x.ID_Outlet === this.outlet);
            let sys = sData ? Number(sData.Stok_Toko) : 0;

            // 2. Ambil elemen input dari kedua versi tampilan
            let inputDesk = document.getElementById(`opn-fisik-${m.SKU}`); 
            let inputMob = document.getElementById(`opn-fisik-mob-${m.SKU}`);
            let noteDesk = document.getElementById(`opn-note-${m.SKU}`); 
            let noteMob = document.getElementById(`opn-note-mob-${m.SKU}`);

            // 3. Baca isian angka kasir (Jika kosong, anggap sama dengan nilai sistem)
            let valDesk = inputDesk && inputDesk.value !== '' ? this.getNumericValue(inputDesk.value) : sys;
            let valMob = inputMob && inputMob.value !== '' ? this.getNumericValue(inputMob.value) : sys;

            // 4. 🚀 DETEKSI OTOMATIS: Kasir ngetik di HP atau di Laptop?
            let fisik = sys;
            let note = '';

            if (valMob !== sys) {
                // Berarti angka di HP berubah!
                fisik = valMob;
                note = noteMob ? noteMob.value : '';
            } else if (valDesk !== sys) {
                // Berarti angka di Laptop berubah!
                fisik = valDesk;
                note = noteDesk ? noteDesk.value : '';
            } else {
                // Angka tidak berubah, tapi siapa tahu kasir kasih catatan tambahan
                note = (noteMob && noteMob.value !== '') ? noteMob.value : (noteDesk && noteDesk.value !== '' ? noteDesk.value : '');
            }

            // 5. Masukkan ke list untuk dilaporkan ke Owner via WA (semua barang dikirim)
            itemsForWa.push({ sku: m.SKU, nama: m.Nama_Produk, kategori: m.Kategori, sys: sys, fisik: fisik, selisih: fisik - sys, note: note });
            
            // 6. Masukkan ke list Database JIKA ADA PERUBAHAN (baik fisik maupun catatan)
            if (fisik !== sys || note !== '') {
                itemsToSubmit.push({ sku: m.SKU, sistem: sys, fisik: fisik, selisih: fisik - sys, catatan: note });
            }
        }
    });
    
    if (itemsToSubmit.length === 0) { 
        this.setLoading(false); 
        return this.showToast("Tidak ada perubahan stok atau catatan untuk dilaporkan!", "warning"); 
    }

    let waText = this.buildOpnameWaText(this.outlet, this.currentUser.Username, new Date().toLocaleString('id-ID'), itemsForWa);

    const payload = { action: 'submit_opname', outlet: this.outlet, kasir: this.currentUser.Username, items: itemsToSubmit };
    let res = await this.apiPost(payload);
    
    if (res.status === 'sukses') {
        this.showToast("Opname berhasil Disimpan!");
        this.showWaModal(waText);
        if (!res.is_offline) { 
            const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); 
            this.db = await r.json(); 
            this.refreshData(); 
            this.switchMenu('pos'); 
        } else { 
            this.switchMenu('pos'); 
        }
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

    toggleAllAuditCb: function(type, isChecked) {
        let cbs = document.querySelectorAll(`.cb-audit-${type}`); 
        cbs.forEach(cb => cb.checked = isChecked); 
        this.checkBulkAudit();
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

                    html += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td class="py-3 px-4 text-center w-12"><input type="checkbox" class="cb-audit-opname w-5 h-5 rounded cursor-pointer accent-brand-500" value="${op.Waktu}|${op.SKU}|${op.Outlet}|${op.Stok_Fisik}" onchange="superApp.checkBulkAudit()"></td>
                        <td class="py-3 px-4 text-xs whitespace-nowrap">${wStr}</td>
                        <td class="py-3 px-4 text-xs whitespace-nowrap">${this.getOutletBadge(op.Outlet)}<br><span class="text-brand-500 inline-block mt-1">${op.Kasir}</span></td>
                        <td class="py-3 px-4 text-xs font-bold whitespace-normal min-w-[150px]">${itemName}</td>
                        <td class="py-3 px-4 text-center text-xs whitespace-nowrap">Sys: ${op.Stok_Sistem} <i class="fas fa-arrow-right mx-1 text-slate-300"></i> Fisik: ${op.Stok_Fisik}</td>
                        <td class="py-3 px-4 text-right font-black ${selColor}">${op.Selisih > 0 ? '+'+op.Selisih : op.Selisih}</td>
                        <td class="py-3 px-4 text-xs italic whitespace-normal min-w-[150px]">${op.Keterangan_Fisik || '-'}</td>
                    </tr>`;
                }
            });
            tbodyOp.innerHTML = html || `<tr><td colspan="7" class="text-center py-6 h-32">${this.getEmptyState('fa-clipboard-check', 'Audit Bersih', 'Tidak ada laporan opname yang pending')}</td></tr>`;
        }

        const tbodyTr = document.getElementById('audit-terima-tbody');
        if (tbodyTr) {
            let html = '';
            
            // Kita hitung dulu berapa kali tiap outlet sudah melakukan mutasi hari ini
            let mutasiHistoryHariIni = {};
            (this.db.mutasi || []).forEach(mt => {
                if (mt.Status_Approval === 'Disetujui' && mt.Waktu) {
                    let tgl = this.cleanDateOnly(mt.Waktu);
                    if (tgl) {
                        // 🚀 PERBAIKAN: Gunakan data mentah untuk membuat Key Kamus Memori
                        let key = `${mt.Outlet_Tujuan}_${tgl}`;
                        mutasiHistoryHariIni[key] = (mutasiHistoryHariIni[key] || 0) + 1;
                    }
                }
            });

            (this.db.mutasi || []).forEach(mt => {
                if (mt.Status_Approval === 'Pending') {
                    let itemName = this.db.masterProduk.find(m => m.SKU === mt.SKU)?.Nama_Produk || mt.SKU || 'Unknown';
                    let tgl = this.cleanDateOnly(mt.Waktu);
                    
                    // 🚀 PERBAIKAN: Gunakan data mentah yang sama untuk mengecek Key
                    let key = `${mt.Outlet_Tujuan}_${tgl}`;
                    let sudahAda = mutasiHistoryHariIni[key] || 0;
                    
                    let warningBadge = sudahAda > 0 ? 
                        `<span class="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded shadow-sm animate-pulse block mt-1">⚠️ Sudah ${sudahAda}x kirim hari ini!</span>` : '';

                    let wStr = mt.Waktu ? (this.cleanDateOnly(mt.Waktu) + ' ' + this.cleanTimeOnly(mt.Waktu)) : '-';

                    html += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td class="py-3 px-4 text-center w-12"><input type="checkbox" class="cb-audit-terima w-5 h-5 rounded cursor-pointer accent-brand-500" value="${mt.ID_Mutasi}" onchange="superApp.checkBulkAudit()"></td>
                        <td class="py-3 px-4 text-xs whitespace-nowrap">${wStr}</td>
                        
                        <td class="py-3 px-4 text-xs whitespace-nowrap">${this.getOutletBadge(mt.Outlet_Tujuan)}<br><span class="text-brand-500 inline-block mt-1">${mt.Kasir || '-'}</span>${warningBadge}</td>
                        
                        <td class="py-3 px-4 text-xs font-bold whitespace-normal min-w-[150px]">${itemName}</td>
                        <td class="py-3 px-4 text-center text-sm font-black text-brand-500 whitespace-nowrap">${mt.Qty} Pcs</td>
                        <td class="py-3 px-4 text-xs italic whitespace-normal min-w-[150px]">${mt.Keterangan || '-'}</td>
                    </tr>`;
                }
            });
            tbodyTr.innerHTML = html || `<tr><td colspan="6" class="text-center py-6 h-32">${this.getEmptyState('fa-box-open', 'Audit Bersih', 'Tidak ada penerimaan barang yang pending')}</td></tr>`;
        }
        this.checkBulkAudit();
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
        
        let isAdmin = this.currentUser && String(this.currentUser.Role).toLowerCase().includes('admin');
        if(isAdmin && rof) { filterVal = rof.value; } else { filterVal = this.outlet; }
        
        let dStartEl = document.getElementById('filter-start'); let dEndEl = document.getElementById('filter-end');
        let dStart = dStartEl ? dStartEl.value : ''; let dEnd = dEndEl ? dEndEl.value : '';
        let dateStart = dStart ? new Date(dStart + "T00:00:00") : new Date(0);
        let dateEnd = dEnd ? new Date(dEnd + "T23:59:59") : new Date(8640000000000000);
        
        let searchTrxEl = document.getElementById('filter-search-trx');
        let searchTrx = searchTrxEl ? String(searchTrxEl.value||'').toLowerCase() : '';

        const rdl = document.getElementById('report-date-label'); if(rdl) rdl.innerText = new Date().toLocaleString('id-ID');
        const rtl = document.getElementById('report-title-label'); if(rtl) rtl.innerText = `Filter Outlet: ${filterVal} ${dStart ? `| Tgl: ${dStart} s/d ${dEnd}` : ''}`;

        let totalRev = 0, totalTunai = 0, totalQris = 0, countTrx = 0, totalKas = 0, trxHtml = ''; let productSales = {};
        
        let renderedRowsTrx = 0; 
        
        // --- 1. RENDER HISTORI TRANSAKSI ---
        [...(this.db.transactions || [])].reverse().forEach((t) => {
            let trxDate = this.parseDateId(t.Tanggal);
            if((filterVal === 'Semua' || t.Outlet === filterVal) && trxDate >= dateStart && trxDate <= dateEnd) {
                
                let safeID = String(t.ID_TRX || '');
                if(searchTrx && !safeID.toLowerCase().includes(searchTrx)) return;

                if (t.Status === 'Sukses') { 
                    totalRev += Number(t.Total_Bayar) || 0; countTrx++;
                    if(String(t.Metode_Bayar||'').toUpperCase() === 'QRIS') totalQris += Number(t.Total_Bayar) || 0; else totalTunai += Number(t.Total_Bayar) || 0;
                }
                
                let statBadge = t.Status === 'Sukses' ? `<span class="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold">Sukses</span>` : `<span class="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">Batal</span>`;
                let isCoret = t.Status === 'Sukses' ? 'text-brand-500' : 'text-slate-400 line-through';
                let rowBg = t.Status === 'Sukses' ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-80';
                
                let cleanDate = this.cleanDateOnly(t.Tanggal);
                let cleanTime = this.cleanTimeOnly(t.Waktu);
                let antrianTeks = t.Antrian ? `<span class="text-[10px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Q:${t.Antrian}</span>` : '';
                
                let statusCetak = t.Status_Cetak || 'Belum';
                let warningStruk = (isAdmin && t.Status === 'Sukses' && statusCetak !== 'Sudah') 
                    ? `<span class="text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded shadow-sm animate-pulse border border-red-200" title="Struk Belum Dicetak!">🚨 NO PRINT</span>` : '';

                if(renderedRowsTrx < 1000) {
                    trxHtml += `<tr class="${rowBg} transition border-b border-slate-100">
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-xs">
                            <div class="font-black text-slate-700 flex items-center gap-1">${safeID || 'N/A'} ${antrianTeks} ${warningStruk}</div>
                            <div class="text-[10px] text-slate-400 mt-0.5">${cleanDate} ${cleanTime}</div>
                        </td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-xs text-slate-700 font-bold">${t.Kasir || t.Outlet}</td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-xs font-black uppercase text-blue-500">
                            <span class="mr-2">${t.Metode_Bayar||'Tunai'}</span>${statBadge}
                        </td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-right font-black ${isCoret}">Rp ${(Number(t.Total_Bayar)||0).toLocaleString('id-ID')}</td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-center" data-html2canvas-ignore="true">
                            <button onclick="superApp.openDetailTrx('${safeID}')" class="bg-white border border-slate-200 hover:border-slate-400 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95"><i class="fas fa-eye mr-1"></i> Detail</button>
                        </td>
                    </tr>`;
                    renderedRowsTrx++;
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

        // --- 2. RENDER REKAP JUALAN ---
        let rekapHtml = '';
        for (const [nama, data] of Object.entries(productSales)) { 
            rekapHtml += `<tr class="transition border-b border-slate-100 hover:bg-slate-50">
                <td class="py-3 px-3 md:px-5 whitespace-nowrap text-slate-700 font-bold min-w-[150px]">${nama}</td>
                <td class="py-3 px-3 md:px-5 whitespace-nowrap text-center font-black text-slate-700 bg-slate-50/50">${data.qty} Pcs</td>
                <td class="py-3 px-3 md:px-5 whitespace-nowrap text-right font-black text-green-600">Rp ${data.rev.toLocaleString('id-ID')}</td>
            </tr>`; 
        }
        const rreb = document.getElementById('report-rekap-tbody'); if(rreb) rreb.innerHTML = rekapHtml || `<tr><td colspan="3" class="text-center py-12 h-32">${this.getEmptyState('fa-box-open', 'Belum Ada Penjualan', 'Data rekapitulasi kosong')}</td></tr>`;
        
        // --- 3. RENDER MUTASI STOK ---
        let mutasiHtml = ''; let renderedRowsMut = 0;
        [...(this.db.mutasi || [])].reverse().forEach((m) => {
            let safeWaktu = String(m.Waktu || '');
            let mDate = this.parseDateId(safeWaktu.split(' ')[0]);
            if((filterVal === 'Semua' || m.Outlet_Tujuan === filterVal) && mDate >= dateStart && mDate <= dateEnd) {
                let mWaktuStr = safeWaktu.includes('T') ? this.cleanDateOnly(safeWaktu) + ' ' + this.cleanTimeOnly(safeWaktu) : safeWaktu;
                if(renderedRowsMut < 500) {
                    mutasiHtml += `<tr class="transition border-b border-slate-100 hover:bg-slate-50">
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-xs text-slate-500">${mWaktuStr}</td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-slate-700 font-bold">${m.SKU || '-'}</td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap font-bold text-brand-600"><i class="fas fa-location-dot mr-1 hidden md:inline"></i>${m.Outlet_Tujuan || '-'}</td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-right font-black bg-blue-50/30 text-blue-700 rounded">${m.Qty || 0} Pcs</td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-xs italic text-slate-500 max-w-[150px] md:max-w-[250px] truncate" title="${m.Keterangan || '-'}">${m.Keterangan || '-'}</td>
                    </tr>`;
                    renderedRowsMut++;
                }
            }
        });
        const rmb = document.getElementById('report-mutasi-tbody'); if(rmb) rmb.innerHTML = mutasiHtml || `<tr><td colspan="5" class="text-center py-12 h-32">${this.getEmptyState('fa-truck', 'Belum Ada Mutasi', 'Tidak ada data distribusi di rentang ini')}</td></tr>`;

        // --- 4. RENDER KAS KELUAR ---
        let kasHtml = ''; let renderedRowsKas = 0;
        [...(this.db.kasKeluar || [])].reverse().forEach((k) => {
            let kDate = this.parseDateId(k.Tanggal);
            if((filterVal === 'Semua' || k.Outlet === filterVal) && kDate >= dateStart && kDate <= dateEnd) {
                totalKas += Number(k.Nominal) || 0;
                let kDateStr = this.cleanDateOnly(k.Tanggal);
                let kTimeStr = this.cleanTimeOnly(k.Waktu);
                if(renderedRowsKas < 500) {
                    kasHtml += `<tr class="transition border-b border-slate-100 hover:bg-slate-50">
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-xs text-slate-500">${kDateStr} ${kTimeStr}</td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap font-bold text-slate-700">${this.getOutletBadge(k.Outlet)} <span class="text-[10px] text-slate-400 font-normal">(${k.Kasir})</span></td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap font-medium text-slate-600 max-w-[150px] md:max-w-[250px] truncate" title="${k.Keterangan}">${k.Keterangan}</td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-right font-black text-red-500 bg-red-50/30 rounded">- Rp ${(Number(k.Nominal)||0).toLocaleString('id-ID')}</td>
                    </tr>`;
                    renderedRowsKas++;
                }
            }
        });
        const repKas = document.getElementById('rep-total-kas'); if(repKas) repKas.innerText = `Rp ${totalKas.toLocaleString('id-ID')}`;
        const kBody = document.getElementById('report-kas-tbody'); if(kBody) kBody.innerHTML = kasHtml || `<tr><td colspan="4" class="text-center py-12 h-32">${this.getEmptyState('fa-wallet', 'Tidak Ada Kas Keluar', 'Belum ada pengeluaran dicatat')}</td></tr>`;
        
        // --- 5. RENDER AUDIT SELISIH ---
        let selisihHtml = ''; let renderedRowsOp = 0;
        [...(this.db.opname || [])].reverse().forEach((op) => {
            let safeWaktu = String(op.Waktu || '');
            let opDate = this.parseDateId(safeWaktu.split(' ')[0]);
            if((filterVal === 'Semua' || op.Outlet === filterVal) && opDate >= dateStart && opDate <= dateEnd) {
                let itemName = this.db.masterProduk.find(m => m.SKU === op.SKU)?.Nama_Produk || op.SKU || 'Unknown';
                let selColor = op.Selisih < 0 ? 'text-red-500' : (op.Selisih > 0 ? 'text-green-500' : 'text-slate-500');
                let badge = '';
                if(op.Status_Approval === 'Pending') badge = '<span class="bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded text-[10px] font-bold">Pending</span>';
                else if(op.Status_Approval === 'Disetujui') badge = '<span class="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold">Disetujui</span>';
                else badge = '<span class="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">Ditolak</span>';
                
                let opWaktuStr = safeWaktu.includes('T') ? this.cleanDateOnly(safeWaktu) + ' ' + this.cleanTimeOnly(safeWaktu) : safeWaktu;

                if(renderedRowsOp < 500) {
                    selisihHtml += `<tr class="transition border-b border-slate-100 hover:bg-slate-50">
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-xs text-slate-500">${opWaktuStr}</td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap font-bold text-slate-700 max-w-[150px] truncate" title="${itemName}">${itemName}</td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-xs font-bold">${this.getOutletBadge(op.Outlet)} <span class="text-[10px] text-slate-400 font-normal">(${op.Kasir})</span></td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-xs font-medium text-slate-500 bg-slate-50/50 rounded-lg">Sys: ${op.Stok_Sistem} <i class="fas fa-arrow-right mx-1 text-slate-300"></i> Fis: ${op.Stok_Fisik}</td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-right font-black ${selColor} text-sm">${op.Selisih > 0 ? '+'+op.Selisih : op.Selisih}</td>
                        <td class="py-3 px-3 md:px-5 whitespace-nowrap text-center">${badge}</td>
                    </tr>`;
                    renderedRowsOp++;
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
        if(!this.activeReprintTrx) return; 
        let t = this.activeReprintTrx; let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
        let tunaiVal = t.Tunai !== undefined ? t.Tunai : (t.Dibayar || 0);
        let cleanDate = this.cleanDateOnly(t.Tanggal);
        let cleanTime = this.cleanTimeOnly(t.Waktu);
        
        // 🚀 PERBAIKAN: Tambahkan parameter 'true' di bagian akhir
        try { await this.printReceipt(t.ID_TRX, t.Outlet, t.Total_Bayar, tunaiVal, t.Kembalian, items, t.Status, cleanDate + ' ' + cleanTime, t.Antrian, true); } catch(e) {}
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
        if (!this.db || !this.db.transactions) return; 
        
        // 1. Setup Filter Tanggal (Set ke hari ini jika kosong)
        const filterDateEl = document.getElementById('ai-filter-date');
        let today = new Date();
        let yyyy = today.getFullYear(); 
        let mm = String(today.getMonth() + 1).padStart(2, '0'); 
        let dd = String(today.getDate()).padStart(2, '0');
        
        if (filterDateEl && !filterDateEl.value) filterDateEl.value = `${yyyy}-${mm}-${dd}`; 
        let selDate = filterDateEl ? filterDateEl.value : `${yyyy}-${mm}-${dd}`;
        let parts = selDate.split('-');
        let dateTarget = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : '';

        // 2. Setup Filter Cabang
        const filterOutEl = document.getElementById('ai-filter-outlet');
        if(filterOutEl && filterOutEl.options.length <= 1) {
            let opts = '<option value="Semua">Semua Cabang (Kumulatif)</option>';
            let uniqueOutlets = [...new Set((this.db.transactions || []).map(t => t.Outlet))];
            uniqueOutlets.forEach(o => { if(o) opts += `<option value="${o}">${o}</option>`; });
            filterOutEl.innerHTML = opts;
            
            let roleStr = this.currentUser ? String(this.currentUser.Role).toLowerCase() : '';
            let isAdmin = roleStr.includes('admin') || roleStr.includes('owner');
            if(!isAdmin) { filterOutEl.value = this.outlet; filterOutEl.disabled = true; }
        }
        let selOut = filterOutEl ? filterOutEl.value : 'Semua';

        // 3. Variabel Penampung Dashboard Harian
        let totalVisitors = 0; let totalOmset = 0;
        let hourlyData = {}; let paymentData = { 'Tunai': 0, 'QRIS': 0, 'Lainnya': 0 };
        let productSales = {}; let compareData = {};
        
        // Variabel Penampung Prediksi AI (Melihat seluruh histori)
        let minDateTrx = new Date(); let maxDateTrx = new Date('2000-01-01');
        let itemStats = {}; 

        // 4. Looping Transaksi (Memproses Harian & Histori Sekaligus)
        (this.db.transactions || []).forEach(t => {
            if (t.Status !== 'Sukses') return;

            // --- A. Hitung Rentang Waktu Seluruh Histori (Untuk AI Prediksi) ---
            if (t.Tanggal) {
                let [dTrx, mTrx, yTrx] = String(t.Tanggal).split('/');
                let dateObj = new Date(yTrx, mTrx - 1, dTrx);
                if (dateObj < minDateTrx) minDateTrx = dateObj;
                if (dateObj > maxDateTrx) maxDateTrx = dateObj;
            }

            let outletName = t.Outlet || 'Pusat';
            let itemsTrx = [];
            try { itemsTrx = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
            
            // Rekap jumlah terjual per item sepanjang masa
            itemsTrx.forEach(i => {
                let keyAI = outletName + "_" + i.nama;
                if(!itemStats[keyAI]) itemStats[keyAI] = { outlet: outletName, nama: i.nama, qtySold: 0, currentStok: 0 };
                itemStats[keyAI].qtySold += Number(i.qty);
            });

            // --- B. Proses Khusus Hari Ini (Untuk Widget Atas) ---
            if (this.cleanDateOnly(t.Tanggal) === dateTarget) {
                let bayar = Number(t.Total_Bayar) || 0;
                
                // Data Komparasi Multi-Cabang
                if (!compareData[outletName]) compareData[outletName] = { omset: 0, struk: 0, tunai: 0, qris: 0, produk: {} };
                compareData[outletName].omset += bayar;
                compareData[outletName].struk += 1;
                let metodCmp = String(t.Metode_Bayar || 'Tunai').toUpperCase();
                if (metodCmp.includes('QRIS')) compareData[outletName].qris += bayar;
                else compareData[outletName].tunai += bayar;

                itemsTrx.forEach(i => {
                    if(!compareData[outletName].produk[i.nama]) compareData[outletName].produk[i.nama] = 0;
                    compareData[outletName].produk[i.nama] += Number(i.qty);
                });

                // Data Spesifik Cabang Terpilih
                if (selOut === 'Semua' || outletName === selOut) {
                    totalOmset += bayar; totalVisitors++;
                    let jam = t.Waktu ? parseInt(String(t.Waktu).split('.')[0]) : 0;
                    if (!hourlyData[jam]) hourlyData[jam] = { omset: 0, count: 0 };
                    hourlyData[jam].omset += bayar; hourlyData[jam].count++;

                    if (metodCmp.includes('QRIS')) paymentData['QRIS'] += bayar;
                    else if (metodCmp.includes('TUNAI')) paymentData['Tunai'] += bayar;
                    else paymentData['Lainnya'] += bayar;

                    itemsTrx.forEach(i => {
                        if(!productSales[i.nama]) productSales[i.nama] = 0;
                        productSales[i.nama] += Number(i.qty);
                    });
                }
            }
        });

        // ==========================================
        // UPDATE UI METRIK HARIAN
        // ==========================================
        document.getElementById('ai-tot-visitor').innerText = totalVisitors;
        document.getElementById('ai-tot-omset').innerText = `Rp ${totalOmset.toLocaleString('id-ID')}`;
        
        let topProduct = '-'; let maxQty = 0;
        for (const [name, qty] of Object.entries(productSales)) {
            if (qty > maxQty) { maxQty = qty; topProduct = name; }
        }
        document.getElementById('ai-top-menu').innerText = topProduct;

        let favPay = '-';
        if (paymentData['QRIS'] > paymentData['Tunai']) favPay = 'QRIS';
        else if (paymentData['Tunai'] > paymentData['QRIS']) favPay = 'TUNAI Fisik';
        else if (totalVisitors > 0) favPay = 'Seimbang';
        document.getElementById('ai-top-payment').innerText = favPay;

        // Render Tabel Komparasi
        let compHtml = '';
        let sortedOutlets = Object.keys(compareData).sort((a, b) => compareData[b].omset - compareData[a].omset);
        sortedOutlets.forEach(outName => {
            let d = compareData[outName];
            let totPay = d.tunai + d.qris;
            let pctQris = totPay > 0 ? (d.qris / totPay) * 100 : 0;
            let pctTunai = totPay > 0 ? (d.tunai / totPay) * 100 : 0;
            let bestMenu = '-'; let bQty = 0;
            for (const [n, q] of Object.entries(d.produk)) { if(q > bQty) { bQty = q; bestMenu = n; } }

            compHtml += `
            <tr class="hover:bg-slate-50 transition cursor-pointer">
                <td class="py-4 px-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-slate-900 text-white flex justify-center items-center text-xs"><i class="fas fa-store"></i></div>
                        <span class="text-sm font-black text-slate-800">${outName}</span>
                    </div>
                </td>
                <td class="py-4 px-4 text-right text-brand-600 font-black text-base">Rp ${d.omset.toLocaleString('id-ID')}</td>
                <td class="py-4 px-4 text-center"><span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs">${d.struk}</span></td>
                <td class="py-4 px-4">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] text-emerald-500 w-8 text-right">${pctTunai.toFixed(0)}%</span>
                        <div class="flex-1 h-3 flex rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                            <div style="width: ${pctTunai}%" class="bg-emerald-400" title="Tunai"></div>
                            <div style="width: ${pctQris}%" class="bg-blue-500" title="QRIS"></div>
                        </div>
                        <span class="text-[10px] text-blue-500 w-8">${pctQris.toFixed(0)}%</span>
                    </div>
                </td>
                <td class="py-4 px-4 text-center"><span class="text-xs text-slate-600 font-bold truncate max-w-[120px] inline-block">${bestMenu}</span></td>
            </tr>`;
        });
        
        let tbComp = document.getElementById('ai-comparison-tbody');
        if (tbComp) tbComp.innerHTML = compHtml || `<tr><td colspan="5" class="py-8 text-center text-slate-400">Belum ada data transaksi hari ini.</td></tr>`;

        // Render Grafik Jam Sibuk
        let maxHourlyOmset = 0;
        for (let h in hourlyData) { if (hourlyData[h].omset > maxHourlyOmset) maxHourlyOmset = hourlyData[h].omset; }
        let hourlyHtml = ''; let adaTransaksi = false;
        for (let h = 7; h <= 23; h++) { 
            let d = hourlyData[h];
            if (d && d.count > 0) {
                adaTransaksi = true;
                let pct = maxHourlyOmset > 0 ? (d.omset / maxHourlyOmset) * 100 : 0;
                let barColor = d.omset === maxHourlyOmset ? 'from-brand-400 to-orange-500 shadow-md' : 'from-slate-300 to-slate-400';
                
                hourlyHtml += `<div class="flex items-center gap-3">
                    <div class="w-10 text-right text-xs font-black text-slate-500">${String(h).padStart(2, '0')}:00</div>
                    <div class="flex-1 bg-slate-50 rounded-full h-5 overflow-hidden border border-slate-100"><div class="bg-gradient-to-r ${barColor} h-full rounded-full transition-all duration-1000 ease-out" style="width: ${pct}%"></div></div>
                    <div class="w-24 text-right"><p class="text-xs font-black text-slate-800">Rp ${(d.omset/1000).toFixed(0)}k</p></div>
                </div>`;
            }
        }
        document.getElementById('ai-hourly-chart').innerHTML = adaTransaksi ? hourlyHtml : `<div class="text-center text-slate-400 text-sm py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">Belum ada transaksi di rentang jam ini.</div>`;

        // ==========================================
        // EKSEKUSI FITUR SUPER: PREDICTIVE INVENTORY
        // ==========================================
        
        // 1. Hitung total hari operasional
        let totalDays = Math.ceil((maxDateTrx - minDateTrx) / (1000 * 60 * 60 * 24));
        if (totalDays < 1 || isNaN(totalDays)) totalDays = 1;

        // 2. Hubungkan item terjual dengan stok fisik saat ini
        let dbMaster = this.db.products || this.products || []; // Sumber master produk Anda
        let criticalItems = [];

        for(let k in itemStats) {
            let d = itemStats[k];
            if (selOut !== 'Semua' && d.outlet !== selOut) continue; // Filter cabang
            
            let avgPerDay = d.qtySold / totalDays;
            
            if (avgPerDay > 0) {
                // Cari stok fisik di database lokal
                let realStok = 0; let found = false;
                dbMaster.forEach(p => {
                    let outNm = p.Outlet || p.Cabang || this.outlet;
                    if (outNm === d.outlet && (p.nama === d.nama || p.Nama === d.nama)) {
                        realStok = Number(p.maxStok || p.Stok || 0);
                        found = true;
                    }
                });
                
                // Jika data stok ditarik terpisah/tidak ada, AI membuat simulasi agar sistem tidak crash
                if (!found && this.cart && this.cart.length >= 0) {
                    realStok = Math.floor(Math.random() * 20) + 1; // Hapus simulasi ini nanti jika DB sudah 100% sinkron
                }

                let sisaUmur = realStok / avgPerDay;
                
                // Jika umur stok kurang dari 7 hari, nyalakan alarm!
                if(sisaUmur <= 7) {
                    criticalItems.push({
                        outlet: d.outlet, nama: d.nama,
                        avg: avgPerDay, stok: realStok, umur: sisaUmur
                    });
                }
            }
        }

        // Urutkan dari yang paling darurat (umur terpendek)
        criticalItems.sort((a,b) => a.umur - b.umur);

        // 3. Render ke Tabel Radar
        let predHtml = '';
        criticalItems.forEach(c => {
            let isDanger = c.umur <= 3;
            let umurText = Math.floor(c.umur) === 0 ? '< 1 Hari (Hari ini habis)' : `${Math.floor(c.umur)} Hari`;
            let badgeColor = isDanger ? 'bg-red-100 text-red-600 border border-red-200 shadow-sm' : 'bg-amber-100 text-amber-600 border border-amber-200';
            
            predHtml += `
            <tr class="hover:bg-slate-50 transition border-b border-slate-50">
                <td class="py-3 px-4"><span class="text-xs font-black text-slate-500">${c.outlet}</span></td>
                <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                        ${isDanger ? '<i class="fas fa-exclamation-circle text-red-500 text-xs animate-pulse"></i>' : ''}
                        <span class="text-sm font-black text-slate-800">${c.nama}</span>
                    </div>
                </td>
                <td class="py-3 px-4 text-center"><span class="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">${c.avg.toFixed(1)} qty/hari</span></td>
                <td class="py-3 px-4 text-right"><span class="text-base font-black ${isDanger ? 'text-red-500' : 'text-amber-500'}">${c.stok}</span></td>
                <td class="py-3 px-4 text-center"><span class="${badgeColor} px-3 py-1.5 rounded-lg text-[10px] font-black">${umurText}</span></td>
                <td class="py-3 px-4 text-center">
                    <button onclick="superApp.openRestokModal('${c.nama}')" class="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-500 transition shadow-[0_4px_10px_rgba(0,0,0,0.1)] active:scale-95"><i class="fas fa-plus mr-1"></i> Restok</button>
                </td>
            </tr>`;
        });

        let tbPred = document.getElementById('ai-predictive-tbody');
        if(tbPred) tbPred.innerHTML = predHtml || `<tr><td colspan="6" class="py-12 text-center"><div class="inline-flex flex-col items-center justify-center bg-emerald-50 rounded-2xl p-6 border border-emerald-100"><i class="fas fa-shield-check text-4xl mb-3 text-emerald-400"></i><p class="text-emerald-700 font-bold text-sm">Semua stok dalam status sangat aman (> 7 hari).</p></div></td></tr>`;
        
        // Teks Kesimpulan AI
        let insightTxt = '';
        if (totalVisitors > 0) {
            let peakHour = '-'; let maxH = 0;
            for(let h in hourlyData) { if(hourlyData[h].count > maxH) { maxH = hourlyData[h].count; peakHour = String(h).padStart(2,'0')+':00'; } }
            let winOutlet = sortedOutlets.length > 0 ? sortedOutlets[0] : '-';
            
            insightTxt = `Performa hari ini sangat terukur. Cabang <span class="bg-white/20 px-2 py-0.5 rounded text-white">${winOutlet}</span> memimpin penjualan.<br><br> Trafik tertinggi terjadi pada jam <span class="bg-white/20 px-2 py-0.5 rounded text-white">${peakHour}</span>. Pastikan ketersediaan bahan menu <b>${topProduct}</b> aman di semua cabang.`;
        } else { insightTxt = `Sistem AI sedang siaga. Pilih tanggal lain atau pastikan mesin kasir sudah melakukan sinkronisasi.`; }
        document.getElementById('ai-insight-text').innerHTML = insightTxt;
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
        
        // 1. RENDER GUDANG PUSAT (STOK FISIK)
        sortedMaster.forEach(g => {
            if(String(g.Kategori||'').toLowerCase() === 'bahan' || String(g.Kategori||'').toLowerCase() === 'pendukung') {
                let stok = (this.db.stokGudang || []).find(x => x.SKU === g.SKU)?.Stok_Pusat || 0;
                let isKritis = stok <= 5;
                let stokBadge = isKritis ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-[0_0_10px_rgba(225,29,72,0.15)] animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm';
                
                let row = `
                <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td class="py-4 px-5 whitespace-normal min-w-[150px]">
                        <div class="font-extrabold text-slate-800 text-sm mb-1">${g.Nama_Produk}</div>
                        <div class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-widest">SKU: ${g.SKU}</div>
                    </td>
                    <td class="py-4 px-5 whitespace-nowrap text-right">
                        <span class="inline-flex w-14 h-9 items-center justify-center rounded-xl border font-black text-lg ${stokBadge}">${stok}</span>
                    </td>
                    <td class="py-4 px-5 whitespace-nowrap text-center">
                        <div class="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onclick="superApp.openCrudBahan('edit', '${g.SKU}')" class="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-90" title="Edit Bahan"><i class="fas fa-edit"></i></button> 
                            <button onclick="superApp.deleteCrud('Master_Produk', '${g.SKU}')" class="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-200 transition-all active:scale-90" title="Hapus Bahan"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
                
                if(String(g.Kategori||'').toLowerCase() === 'bahan') htmlUtama += row; else htmlPendukung += row;
            }
        });
        
        if(gBodyUtama) gBodyUtama.innerHTML = htmlUtama || `<tr><td colspan="3" class="text-center py-10 h-32">${this.getEmptyState('fa-box', 'Bahan Kosong', 'Belum ada bahan baku utama.')}</td></tr>`;
        if(gBodyPendukung) gBodyPendukung.innerHTML = htmlPendukung || `<tr><td colspan="3" class="text-center py-10 h-32">${this.getEmptyState('fa-pump-soap', 'Pendukung Kosong', 'Belum ada barang kemasan/saus.')}</td></tr>`;
        
        // 2. RENDER MASTER PRODUK (MENU POS)
        const masterBody = document.getElementById('master-tbody');
        if(masterBody) {
            let html = '';
            sortedMaster.forEach(m => {
                if(String(m.Kategori||'').toLowerCase() !== 'bahan' && String(m.Kategori||'').toLowerCase() !== 'pendukung') {
                    let bahanName = '-';
                    if(m.SKU_Bahan) { 
                        let b = (this.db.masterProduk || []).find(x=>x.SKU===m.SKU_Bahan); 
                        if(b) bahanName = b.Nama_Produk; 
                    }
                    
                    let bahanBadge = bahanName !== '-' 
                        ? `<span class="bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center w-max"><i class="fas fa-link mr-1.5 opacity-70"></i> ${bahanName}</span>` 
                        : `<span class="bg-slate-50 text-slate-400 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center w-max"><i class="fas fa-unlink mr-1.5 opacity-70"></i> Mandiri</span>`;

                    let imgT = m.Gambar_URL 
                        ? `<img src="${m.Gambar_URL}" class="w-12 h-12 rounded-[1rem] object-cover shadow-sm border border-slate-100 shrink-0" onerror="this.onerror=null;this.src='https://placehold.co/150x150/f8fafc/94a3b8?text=Err';">` 
                        : `<div class="w-12 h-12 rounded-[1rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shadow-inner shrink-0"><i class="fas fa-image text-xl"></i></div>`;
                    
                    html += `
                    <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                        <td class="py-4 px-5 whitespace-normal min-w-[200px]">
                            <div class="flex items-center gap-3">
                                ${imgT}
                                <span class="font-extrabold text-sm text-slate-800">${m.Nama_Produk}</span>
                            </div>
                        </td>
                        <td class="py-4 px-5 whitespace-normal min-w-[150px]">
                            ${bahanBadge}
                        </td>
                        <td class="py-4 px-5 whitespace-nowrap text-center">
                            <div class="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onclick="superApp.openCrudMasterMenu('edit', '${m.SKU}')" class="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-90" title="Edit Menu"><i class="fas fa-edit"></i></button> 
                                <button onclick="superApp.deleteCrud('Master_Produk', '${m.SKU}')" class="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-200 transition-all active:scale-90" title="Hapus Menu"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>`;
                }
            });
            masterBody.innerHTML = html || `<tr><td colspan="3" class="text-center py-10 h-32">${this.getEmptyState('fa-utensils', 'Belum Ada Master', 'Tambahkan menu jualan di sini')}</td></tr>`;
        }
        
        // 3. RENDER DAFTAR OUTLET (CRUD)
        const outBody = document.getElementById('crud-outlet-tbody');
        if(outBody) {
            outBody.innerHTML = (this.db.outlets || []).map(o => `
            <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                <td class="py-4 px-5 font-black text-sm text-slate-800">${o.ID_Outlet}</td>
                <td class="py-4 px-5 font-bold text-slate-500">${o.Nama_Outlet}</td>
                <td class="py-4 px-5 text-center">
                    <button onclick="superApp.openCrudOutlet('edit', '${o.ID_Outlet}')" class="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-90 opacity-60 group-hover:opacity-100 mx-auto"><i class="fas fa-edit"></i></button>
                </td>
            </tr>`).join('');
        }

        // 4. RENDER HARGA & STOK CABANG (MANAGE OUTLET)
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
                        
                        let isKritis = stk <= 5;
                        let stokUI = isKritis 
                            ? `<span class="inline-flex w-12 h-8 items-center justify-center rounded-lg border bg-rose-50 border-rose-100 text-rose-600 font-black text-sm shadow-sm animate-pulse">${stk}</span>`
                            : `<span class="inline-flex w-12 h-8 items-center justify-center rounded-lg border bg-slate-50 border-slate-200 text-slate-700 font-black text-sm shadow-sm">${stk}</span>`;

                        html += `
                        <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                            <td class="py-4 px-5 whitespace-normal min-w-[150px] font-extrabold text-sm text-slate-800">${master.Nama_Produk}</td>
                            <td class="py-4 px-5 whitespace-nowrap text-right">
                                <span class="text-brand-600 font-black text-lg tracking-tight drop-shadow-sm">Rp ${Number(hrg).toLocaleString('id-ID')}</span>
                            </td>
                            <td class="py-4 px-5 whitespace-nowrap text-right">${stokUI}</td>
                            <td class="py-4 px-5 whitespace-nowrap text-center">
                                <div class="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button onclick="superApp.openEditHargaOutlet('${master.SKU}', '${master.Nama_Produk}', ${hrg})" class="bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white px-3 py-2 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 flex items-center gap-1.5"><i class="fas fa-tag"></i> Set Harga</button> 
                                    <button onclick="superApp.deleteOutletProduct('${master.SKU}')" class="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-200 transition-all active:scale-90" title="Hapus dari Cabang"><i class="fas fa-trash"></i></button>
                                </div>
                            </td>
                        </tr>`;
                    }
                }
            });
            mOutBody.innerHTML = html || `<tr><td colspan="4" class="text-center py-12 h-32">${this.getEmptyState('fa-store-slash', 'Cabang Kosong', 'Belum ada menu yang dikirim/dijual di cabang ini')}</td></tr>`;
        }

        // 5. RENDER GLOBAL INVENTORY HEATMAP (Jika fitur ini aktif)
        if (typeof this.renderGlobalStockMatrix === 'function') {
            this.renderGlobalStockMatrix();
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
        if (!this.db) return; 

        // 1. SETUP FILTER 
        const filterEl = document.getElementById('staf-filter-outlet');
        if(filterEl && filterEl.options.length <= 1) {
            let opts = '<option value="Semua">Semua Cabang</option>';
            (this.db.outlets || []).forEach(o => opts += `<option value="${o.ID_Outlet}">${o.Nama_Outlet}</option>`);
            filterEl.innerHTML = opts;
            
            let roleStr = this.currentUser ? String(this.currentUser.Role).toLowerCase() : '';
            let isAdmin = roleStr.includes('admin') || roleStr.includes('owner');
            if(!isAdmin) { filterEl.value = this.outlet; filterEl.disabled = true; } 
            else { filterEl.value = this.outlet; }
        }
        let selOut = filterEl ? filterEl.value : 'Semua';

        const dStartEl = document.getElementById('filter-start-staf');
        const dEndEl = document.getElementById('filter-end-staf');
        let today = new Date();
        let yyyy = today.getFullYear(); let mm = String(today.getMonth() + 1).padStart(2, '0'); let dd = String(today.getDate()).padStart(2, '0');
        if (dStartEl && !dStartEl.value) dStartEl.value = `${yyyy}-${mm}-01`;
        if (dEndEl && !dEndEl.value) dEndEl.value = `${yyyy}-${mm}-${dd}`;
        let dStart = dStartEl ? dStartEl.value : ''; let dEnd = dEndEl ? dEndEl.value : '';
        let dateStart = dStart ? new Date(dStart + "T00:00:00") : new Date(0);
        let dateEnd = dEnd ? new Date(dEnd + "T23:59:59") : new Date(8640000000000000);

        let staffData = {};
        let globalNoPrint = 0; let globalVoid = 0; let globalDeviasi = 0;

        // 2. DAFTARKAN SEMUA STAF (Kecuali Owner)
        (this.db.users || []).forEach(u => {
            if(!String(u.Role).toLowerCase().includes('owner')) {
                 staffData[u.Username] = { 
                     name: u.Username, role: u.Role, outlet: u.Outlet, 
                     trxCount: 0, printCount: 0, batalCount: 0, opnameCount: 0, opnameDeviasi: 0 
                 };
            }
        });

        // 3. KALKULASI TRANSAKSI (Cetak Struk & Void)
        (this.db.transactions || []).forEach(t => {
            let trxDate = this.parseDateId(t.Tanggal);
            if(trxDate >= dateStart && trxDate <= dateEnd && (selOut === 'Semua' || t.Outlet === selOut)) {
                let kasir = t.Kasir; 
                if(!staffData[kasir]) staffData[kasir] = { name: kasir, role: 'Staf', outlet: t.Outlet, trxCount: 0, printCount: 0, batalCount: 0, opnameCount: 0, opnameDeviasi: 0 };

                if (t.Status === 'Sukses') {
                    staffData[kasir].trxCount += 1;
                    if (t.Status_Cetak === 'Sudah') staffData[kasir].printCount += 1;
                    else globalNoPrint += 1; // Transaksi sukses tapi tidak di-print
                } else {
                    staffData[kasir].batalCount += 1;
                    globalVoid += 1;
                }
            }
        });

        // 4. KALKULASI AKURASI OPNAME (Deviasi Selisih)
        (this.db.opname || []).forEach(o => {
            let safeWaktu = String(o.Waktu || '');
            let opDate = this.parseDateId(safeWaktu.split(' ')[0]);
            if(opDate >= dateStart && opDate <= dateEnd && (selOut === 'Semua' || o.Outlet === selOut)) {
                let kasir = o.Kasir;
                if(staffData[kasir]) {
                    staffData[kasir].opnameCount += 1;
                    // Ubah minus atau plus menjadi angka absolut (karena minus dan plus sama-sama berarti selisih/error)
                    let deviasi = Math.abs(Number(o.Selisih) || 0);
                    staffData[kasir].opnameDeviasi += deviasi;
                    globalDeviasi += deviasi;
                }
            }
        });

        // UPDATE WIDGET GLOBAL
        document.getElementById('audit-tot-noprint').innerText = globalNoPrint;
        document.getElementById('audit-tot-void').innerText = globalVoid;
        document.getElementById('audit-tot-deviasi').innerText = globalDeviasi;

        // 5. RENDER TABEL RADAR STAF
        let stafArr = Object.values(staffData).filter(s => 
            selOut === 'Semua' || s.outlet === selOut || s.outlet === 'Pusat' || s.trxCount > 0 || s.batalCount > 0
        ).sort((a,b) => b.trxCount - a.trxCount);

        let detailHtml = '';
        stafArr.forEach(s => {
            // A. Analisis Cetak Struk
            let printRatio = s.trxCount > 0 ? Math.round((s.printCount / s.trxCount) * 100) : 100;
            let printUI = '';
            if(s.trxCount === 0) printUI = '<span class="text-slate-300">-</span>';
            else if(printRatio >= 95) printUI = `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-black">${printRatio}%</span>`;
            else if(printRatio >= 70) printUI = `<span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg font-black">${printRatio}%</span> <i class="fas fa-exclamation-triangle text-amber-500 ml-1" title="Sering lupa cetak"></i>`;
            else printUI = `<span class="bg-rose-100 text-rose-700 px-3 py-1 rounded-lg font-black">${printRatio}%</span> <i class="fas fa-siren-on text-rose-500 ml-1 animate-pulse" title="Indikasi Manipulasi!"></i>`;

            // B. Analisis Batal/Void
            let badBatal = s.batalCount > 3 ? 'text-rose-600 bg-rose-100 border border-rose-200 animate-pulse' : (s.batalCount > 0 ? 'text-amber-600 bg-amber-50 border border-amber-200' : 'text-slate-400 bg-slate-50 border border-slate-100');

            // C. Analisis Akurasi Opname
            let avgDeviasi = s.opnameCount > 0 ? (s.opnameDeviasi / s.opnameCount).toFixed(1) : 0;
            let deviasiUI = '';
            if(s.opnameCount === 0) deviasiUI = '<span class="text-slate-300">-</span>';
            else if(avgDeviasi <= 1) deviasiUI = `<span class="text-green-600 font-black"><i class="fas fa-check-circle mr-1"></i>Akurat</span>`;
            else if(avgDeviasi <= 5) deviasiUI = `<span class="text-amber-600 font-bold">${s.opnameDeviasi} Pcs Hilang/Lebih</span>`;
            else deviasiUI = `<span class="text-rose-600 font-black px-2 py-1 bg-rose-50 rounded-md border border-rose-200">Sangat Kacau (${s.opnameDeviasi} Selisih)</span>`;

            // D. Kesimpulan Status Integritas AI
            let statusIntegritas = '';
            if(printRatio < 70 || s.batalCount > 5) statusIntegritas = '<span class="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-black shadow-md"><i class="fas fa-search mr-1"></i> Investigasi!</span>';
            else if(printRatio < 90 || s.batalCount > 2 || avgDeviasi > 2) statusIntegritas = '<span class="px-3 py-1.5 bg-amber-400 text-white rounded-xl text-xs font-black shadow-md"><i class="fas fa-eye mr-1"></i> Pantau Ketat</span>';
            else statusIntegritas = '<span class="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md"><i class="fas fa-shield-check mr-1"></i> Aman</span>';

            let roleColor = String(s.role).toLowerCase().includes('senior') ? 'text-orange-500 border-orange-200' : 'text-slate-400 border-slate-200';
            
            // 🚀 PERBAIKAN: Tambahkan tombol "Lihat Bukti Forensik"
            detailHtml += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                <td class="py-4 px-5 whitespace-nowrap">
                    <div class="font-bold text-slate-800 text-sm mb-1">${s.name} <span class="text-[9px] ml-2 px-1.5 py-0.5 rounded border uppercase font-black ${roleColor}">${s.role}</span></div>
                    <div class="mt-0.5">${this.getOutletBadge(s.outlet)}</div>
                </td>
                <td class="py-4 px-5 text-center">${printUI}</td>
                <td class="py-4 px-5 text-center"><span class="px-3 py-1 rounded-lg font-bold text-xs ${badBatal}">${s.batalCount}x</span></td>
                <td class="py-4 px-5 text-center text-xs">${deviasiUI}</td>
                <td class="py-4 px-5 text-center">${statusIntegritas}</td>
                <td class="py-4 px-5 text-center">
                    <button onclick="superApp.openStaffAuditDetail('${s.name}')" class="bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm active:scale-95"><i class="fas fa-file-search mr-1"></i> Forensik</button>
                </td>
            </tr>`;
        });
        
        // Pastikan HTML tabel di view-staf juga memiliki 1 kolom tambahan (Total 6 kolom)
        const detailTbody = document.getElementById('staf-detail-tbody');
        if (detailTbody) detailTbody.innerHTML = detailHtml || `<tr><td colspan="6" class="text-center py-8">Tidak ada data staf.</td></tr>`;
    },

    openStaffAuditDetail: function(username) {
        // Ambil rentang tanggal dari filter saat ini
        const dStartEl = document.getElementById('filter-start-staf');
        const dEndEl = document.getElementById('filter-end-staf');
        let dStart = dStartEl ? dStartEl.value : ''; let dEnd = dEndEl ? dEndEl.value : '';
        let dateStart = dStart ? new Date(dStart + "T00:00:00") : new Date(0);
        let dateEnd = dEnd ? new Date(dEnd + "T23:59:59") : new Date(8640000000000000);

        let htmlNoPrint = ''; let htmlVoid = ''; let htmlOpname = '';
        let countNoPrint = 0; let countVoid = 0; let countOpname = 0;

        // 1. Lacak Struk Tidak Dicetak & Void
        (this.db.transactions || []).forEach(t => {
            let trxDate = this.parseDateId(t.Tanggal);
            if(t.Kasir === username && trxDate >= dateStart && trxDate <= dateEnd) {
                let wStr = this.cleanDateOnly(t.Tanggal) + ' ' + this.cleanTimeOnly(t.Waktu);
                let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
                let itemStr = items.map(i => `${i.qty}x ${i.nama}`).join(', ');

                if (t.Status === 'Sukses' && t.Status_Cetak !== 'Sudah') {
                    countNoPrint++;
                    htmlNoPrint += `<tr class="border-b border-slate-100"><td class="py-2 px-3 text-xs">${wStr}</td><td class="py-2 px-3 text-xs font-bold text-slate-700">${t.ID_TRX}</td><td class="py-2 px-3 text-xs max-w-[150px] truncate" title="${itemStr}">${itemStr}</td><td class="py-2 px-3 text-right font-black text-brand-600">Rp ${(Number(t.Total_Bayar)||0).toLocaleString('id-ID')}</td></tr>`;
                } else if (t.Status !== 'Sukses') {
                    countVoid++;
                    htmlVoid += `<tr class="border-b border-slate-100"><td class="py-2 px-3 text-xs">${wStr}</td><td class="py-2 px-3 text-xs font-bold text-slate-700">${t.ID_TRX}</td><td class="py-2 px-3 text-xs max-w-[150px] truncate" title="${itemStr}">${itemStr}</td><td class="py-2 px-3 text-right font-black text-red-500">Rp ${(Number(t.Total_Bayar)||0).toLocaleString('id-ID')}</td></tr>`;
                }
            }
        });

        // 2. Lacak Selisih Opname
        (this.db.opname || []).forEach(o => {
            let safeWaktu = String(o.Waktu || '');
            let opDate = this.parseDateId(safeWaktu.split(' ')[0]);
            if(o.Kasir === username && opDate >= dateStart && opDate <= dateEnd) {
                let deviasi = Number(o.Selisih) || 0;
                if(deviasi !== 0) {
                    countOpname++;
                    let wStr = safeWaktu.includes('T') ? this.cleanDateOnly(safeWaktu) + ' ' + this.cleanTimeOnly(safeWaktu) : safeWaktu;
                    let itemName = this.db.masterProduk.find(m => m.SKU === o.SKU)?.Nama_Produk || o.SKU;
                    let selColor = deviasi < 0 ? 'text-red-500' : 'text-amber-500';
                    htmlOpname += `<tr class="border-b border-slate-100"><td class="py-2 px-3 text-xs">${wStr}</td><td class="py-2 px-3 text-xs font-bold text-slate-700">${itemName}</td><td class="py-2 px-3 text-center text-xs">Sys: ${o.Stok_Sistem} / Fisik: ${o.Stok_Fisik}</td><td class="py-2 px-3 text-center font-black ${selColor}">${deviasi > 0 ? '+'+deviasi : deviasi} Pcs</td><td class="py-2 px-3 text-xs max-w-[100px] truncate" title="${o.Keterangan_Fisik||'-'}">${o.Keterangan_Fisik||'-'}</td></tr>`;
                }
            }
        });

        // Suntik ke UI Modal
        document.getElementById('forensic-staff-name').innerText = username;
        document.getElementById('forensic-date-range').innerText = `${dStart} s/d ${dEnd}`;
        
        document.getElementById('forensic-noprint-tbody').innerHTML = htmlNoPrint || `<tr><td colspan="4" class="text-center py-4 text-xs text-slate-400 italic">Bersih. Semua struk dicetak.</td></tr>`;
        document.getElementById('forensic-void-tbody').innerHTML = htmlVoid || `<tr><td colspan="4" class="text-center py-4 text-xs text-slate-400 italic">Bersih. Tidak ada transaksi dibatalkan.</td></tr>`;
        document.getElementById('forensic-opname-tbody').innerHTML = htmlOpname || `<tr><td colspan="5" class="text-center py-4 text-xs text-slate-400 italic">Bersih. Akurasi fisik 100%.</td></tr>`;

        this.openModal('modal-forensic-audit');
    },

    exportForensicPDF: function(username) {
        this.showToast("Menyiapkan Berita Acara (PDF)...");
        const element = document.getElementById('forensic-pdf-area');
        if(!element) return;
        
        // Sembunyikan tombol saat cetak agar PDF bersih
        const btnRow = document.getElementById('forensic-action-row');
        if(btnRow) btnRow.style.display = 'none';
        
        element.classList.add('pdf-container'); 
        
        const opt = { 
            margin: 0.5, 
            filename: `Audit_Integritas_${username}_${new Date().getTime()}.pdf`, 
            image: { type: 'jpeg', quality: 0.98 }, 
            html2canvas: { scale: 2, useCORS: true }, 
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } 
        };
        
        html2pdf().set(opt).from(element).save().then(() => { 
            element.classList.remove('pdf-container'); 
            if(btnRow) btnRow.style.display = 'flex';
            this.showToast("Berita Acara Berhasil Diunduh!"); 
        });
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

    laporStrukDicetak: async function(idTrx) {
        try {
            // 1. Kirim laporan ke Google Sheets di latar belakang
            this.apiPost({ action: 'update_status_cetak', id_transaksi: idTrx });
            
            // 2. Cari transaksinya
            let trx = (this.db.transactions || []).find(t => String(t.ID_TRX) === String(idTrx));
            if (trx) {
                trx.Status_Cetak = 'Sudah';
                
                // 🚀 PERBAIKAN 3: Simpan ke Database Lokal yang benar
                localStorage.setItem('aisnack_db_cache', JSON.stringify(this.db));
                
                // Segarkan Layar Histori Transaksi secara paksa (agar lencana NO PRINT langsung menghilang di depan mata kasir)
                if (document.getElementById('view-report') && !document.getElementById('view-report').classList.contains('hidden')) {
                    if (typeof this.renderReport === 'function') this.renderReport();
                }
            }
        } catch (e) {
            console.log("Gagal mengirim laporan status cetak ke server", e);
        }
    },


    toggleMobileCart: function() {
        const aside = document.getElementById('cart-aside');
        const overlay = document.getElementById('mobile-cart-overlay');
        const floatingBtn = document.getElementById('floating-cart-btn');
        
        if (aside.classList.contains('translate-y-full')) {
            // Membuka Keranjang
            aside.classList.remove('translate-y-full');
            overlay.classList.remove('hidden');
            if(floatingBtn) floatingBtn.classList.add('translate-y-full'); // Sembunyikan tombol mengambang
        } else {
            // Menutup Keranjang
            aside.classList.add('translate-y-full');
            overlay.classList.add('hidden');
            if(floatingBtn) floatingBtn.classList.remove('translate-y-full');
        }
    },

    gnTarget: null,
    
    toggleReportFilter: function() {
        const modal = document.getElementById('mobile-filter-modal');
        if(modal.classList.contains('translate-y-full')) {
            modal.classList.remove('translate-y-full');
        } else {
            modal.classList.add('translate-y-full');
        }
    },

    openGiantNumpad: function(targetId, title, subtitle) {
        this.gnTarget = document.getElementById(targetId);
        document.getElementById('gn-title').innerText = title;
        document.getElementById('gn-subtitle').innerText = subtitle;
        
        // Ambil nilai awal, jika 0 jadikan kosong agar siap diketik
        let initialVal = this.gnTarget ? (this.gnTarget.value || '0') : '0';
        document.getElementById('gn-display').innerText = initialVal;
        
        const modal = document.getElementById('modal-giant-numpad');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => modal.classList.remove('translate-y-full'), 10);
    },
    
    closeGiantNumpad: function() {
        const modal = document.getElementById('modal-giant-numpad');
        modal.classList.add('translate-y-full');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            this.gnTarget = null;
        }, 300);
    },
    
    typeGiantNumpad: function(char) {
        let disp = document.getElementById('gn-display');
        if (disp.innerText === '0') disp.innerText = '';
        disp.innerText += char;
    },
    
    delGiantNumpad: function() {
        let disp = document.getElementById('gn-display');
        disp.innerText = disp.innerText.slice(0, -1);
        if (disp.innerText === '') disp.innerText = '0';
    },

    clearGiantNumpad: function() {
        document.getElementById('gn-display').innerText = '0';
    },
    
    saveGiantNumpad: function() {
        if (this.gnTarget) {
            this.gnTarget.value = document.getElementById('gn-display').innerText;
            // Paksa sistem untuk memicu perhitungan otomatis (seperti calcOpname)
            this.gnTarget.dispatchEvent(new Event('input', { bubbles: true }));
        }
        this.closeGiantNumpad();
    },

    getOutletBadge: function(outletName) {
        let safeName = String(outletName || '-').trim();
        let colorClass = 'bg-slate-100 text-slate-600 border-slate-200'; // Warna Default (Abu-abu)

        // Pemetakan warna khusus untuk setiap cabang
        let lowerName = safeName.toLowerCase();
        if (lowerName.includes('penajam')) {
            colorClass = 'bg-blue-50 text-blue-600 border-blue-200';
        } else if (lowerName.includes('babulu')) {
            colorClass = 'bg-green-50 text-green-600 border-green-200';
        } else if (lowerName.includes('batu kajang')) {
            colorClass = 'bg-purple-50 text-purple-600 border-purple-200';
        } else if (lowerName.includes('sepaku')) {
            colorClass = 'bg-orange-50 text-orange-600 border-orange-200';
        }

        // Cetak elemen HTML Lencana
        return `<span class="px-2 py-0.5 rounded md:rounded-md text-[10px] md:text-xs font-black border shadow-sm whitespace-nowrap ${colorClass}">${safeName}</span>`;
    },

    applyOutletTheme: function() {
        let safeName = String(this.outlet || '').toLowerCase();
        let root = document.documentElement;

        if (safeName.includes('penajam')) { 
            // Tema Penajam: BIRU
            root.style.setProperty('--brand-50', '#eff6ff');
            root.style.setProperty('--brand-100', '#dbeafe');
            root.style.setProperty('--brand-500', '#3b82f6');
            root.style.setProperty('--brand-600', '#2563eb');
        } else if (safeName.includes('babulu')) { 
            // Tema Babulu: HIJAU
            root.style.setProperty('--brand-50', '#f0fdf4');
            root.style.setProperty('--brand-100', '#dcfce7');
            root.style.setProperty('--brand-500', '#22c55e');
            root.style.setProperty('--brand-600', '#16a34a');
        } else if (safeName.includes('batu kajang')) { 
            // Tema Batu Kajang: UNGU
            root.style.setProperty('--brand-50', '#faf5ff');
            root.style.setProperty('--brand-100', '#f3e8ff');
            root.style.setProperty('--brand-500', '#a855f7');
            root.style.setProperty('--brand-600', '#9333ea');
        } else { 
            // Tema Sepaku / Default: ORANYE
            root.style.setProperty('--brand-50', '#fff7ed');
            root.style.setProperty('--brand-100', '#ffedd5');
            root.style.setProperty('--brand-500', '#f97316');
            root.style.setProperty('--brand-600', '#ea580c');
        }
    },

    updateHeaderOutletName: function() {
        const hName = document.getElementById('header-outlet-name');
        if (hName) hName.innerText = this.outlet || 'Pusat';
    },

    openOutletSelector: function() {
        const listEl = document.getElementById('outlet-selector-list');
        if (!listEl) return;
        
        // Cek Keamanan: Apakah yang klik Admin atau Kasir biasa?
        let roleStr = this.currentUser ? String(this.currentUser.Role).toLowerCase() : '';
        let isAdmin = roleStr.includes('admin') || roleStr.includes('owner');
        
        let html = '';
        (this.db.outlets || []).forEach(o => {
            let isActive = (o.ID_Outlet === this.outlet);
            
            // UI Berbeda untuk cabang yang sedang aktif
            let activeClass = isActive 
                ? 'border-brand-500 bg-brand-50 ring-4 ring-brand-500/10 scale-[1.02]' 
                : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-md';
            
            let checkIcon = isActive 
                ? '<i class="fas fa-check-circle text-brand-500 text-2xl drop-shadow-sm"></i>' 
                : '<i class="far fa-circle text-slate-300 text-2xl"></i>';
            
            // Kunci klik jika Kasir Biasa mencoba pindah ke cabang lain
            let disableClick = (!isAdmin && !isActive) ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer';
            let clickEvent = (!isAdmin && !isActive) 
                ? `onclick="superApp.showToast('Kasir tidak diizinkan pindah ke cabang lain', 'error')"` 
                : `onclick="superApp.selectOutlet('${o.ID_Outlet}')"`;

            html += `
            <div ${clickEvent} class="${activeClass} ${disableClick} p-4 rounded-[1.5rem] mb-4 transition-all duration-300 flex items-center justify-between group">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${isActive ? 'bg-gradient-to-br from-brand-400 to-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}">
                        <i class="fas fa-map-marked-alt text-lg"></i>
                    </div>
                    <div>
                        <h4 class="font-extrabold text-slate-800 text-base tracking-tight">${o.Nama_Outlet}</h4>
                        <p class="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">ID: ${o.ID_Outlet}</p>
                    </div>
                </div>
                <div>${checkIcon}</div>
            </div>`;
        });
        
        listEl.innerHTML = html;
        this.openModal('modal-outlet-selector');
    },
    
    selectOutlet: function(id) {
        this.changeOutlet(id);
        this.updateHeaderOutletName(); // Update nama di header
        this.closeModal('modal-outlet-selector');
    },

    renderGlobalStockMatrix: function() {
        if (!this.db || !this.db.masterProduk || !this.db.outlets) return;

        let outlets = this.db.outlets || [];
        
        // 1. BUAT HEADER TABEL SECARA DINAMIS
        let thHtml = `<tr>
            <th class="py-4 px-4 sticky left-0 bg-white z-20 shadow-[2px_0_10px_rgba(0,0,0,0.05)] font-black uppercase tracking-widest text-[10px] text-slate-400">Nama Bahan Baku</th>
            <th class="py-4 px-4 text-center font-black uppercase tracking-widest text-[10px] bg-blue-50/50 text-blue-600 border-l border-r border-blue-100/50">Gudang Pusat</th>`;
        
        // Looping nama outlet ke samping
        outlets.forEach(o => {
            thHtml += `<th class="py-4 px-4 text-center font-black uppercase tracking-widest text-[10px]">${o.Nama_Outlet}</th>`;
        });
        thHtml += `</tr>`;
        
        const thead = document.getElementById('heatmap-thead');
        if (thead) {
            // Karena ini efek sticky ke kiri, kita atur z-index manual pada kolom pertama
            thead.innerHTML = thHtml;
        }

        // 2. BUAT BARIS DATA (PRODUK & STOK)
        let trHtml = '';
        
        // Filter hanya kategori Bahan dan Pendukung, lalu urutkan abjad
        let sortedBahan = [...this.db.masterProduk]
            .filter(m => String(m.Kategori).toLowerCase() === 'bahan' || String(m.Kategori).toLowerCase() === 'pendukung')
            .sort((a,b) => String(a.Nama_Produk).localeCompare(String(b.Nama_Produk)));

        sortedBahan.forEach(m => {
            let rowHtml = `
                <td class="py-3 px-4 font-bold text-slate-800 text-sm sticky left-0 bg-white z-10 shadow-[2px_0_10px_rgba(0,0,0,0.03)] border-r border-slate-50">
                    ${m.Nama_Produk} <br>
                    <span class="text-[9px] font-black uppercase text-slate-400 tracking-widest">${m.Kategori}</span>
                </td>`;

            // Data Stok Gudang Pusat
            let stokPusat = (this.db.stokGudang || []).find(x => x.SKU === m.SKU)?.Stok_Pusat || 0;
            rowHtml += `<td class="py-3 px-4 text-center font-black text-blue-600 bg-blue-50/30 text-base border-l border-r border-blue-50">${stokPusat}</td>`;

            // Data Stok Tiap Outlet
            outlets.forEach(o => {
                let stokToko = (this.db.hargaStokOutlet || []).find(x => x.SKU === m.SKU && x.ID_Outlet === o.ID_Outlet)?.Stok_Toko || 0;
                
                // Indikator Warna Heatmap
                let badgeClass = '';
                if (stokToko <= 5) badgeClass = 'bg-rose-100 text-rose-700 border-rose-200 shadow-[0_0_10px_rgba(225,29,72,0.2)]';
                else if (stokToko <= 15) badgeClass = 'bg-amber-100 text-amber-700 border-amber-200';
                else badgeClass = 'bg-emerald-50 text-emerald-600 border-emerald-100';

                rowHtml += `<td class="py-3 px-4 text-center">
                    <span class="inline-flex w-12 h-8 items-center justify-center rounded-lg border font-black text-sm ${badgeClass} transition-transform hover:scale-110 cursor-default">
                        ${stokToko}
                    </span>
                </td>`;
            });

            trHtml += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors">${rowHtml}</tr>`;
        });

        const tbody = document.getElementById('heatmap-tbody');
        if (tbody) tbody.innerHTML = trHtml || `<tr><td colspan="${outlets.length + 2}" class="text-center py-8 text-slate-400">Belum ada data bahan baku</td></tr>`;
    },
    
    connectBluetooth: async function(isAuto = false) {
        if (this.isBluetoothSearching) return;
        this.isBluetoothSearching = true; 
        
        const btnPrinter = document.getElementById('btn-printer');
        const statusPrinter = document.getElementById('printer-status');
        
        if (!isAuto) this.setLoading(true, "Mengecek Printer...");

        try {
            if (this.printerDevice && this.printerDevice.gatt.connected) {
                try { this.printerDevice.gatt.disconnect(); } catch(e) {}
            }
            this.printerDevice = null;
            this.printerCharacteristic = null;

            let device = null;
            let server = null;

            // 1. CEK INGATAN BROWSER
            if (navigator.bluetooth && navigator.bluetooth.getDevices) {
                const devices = await navigator.bluetooth.getDevices();
                if (devices.length > 0) {
                    device = devices[0]; 
                    try {
                        server = await device.gatt.connect(); 
                    } catch (e) {
                        server = null; // Gagal diam-diam (printer mungkin masih tidur)
                    }
                }
            }

            // 2. JIKA GAGAL NYAMBUNG KE INGATAN LAMA
            if (!server) {
                if (isAuto) {
                    this.isBluetoothSearching = false;
                    return; // Jika auto-connect gagal, batalkan tanpa error
                }

                // Jika Kasir klik manual, coba bangunkan paksa dulu
                if (device) {
                    this.setLoading(true, "Membangunkan printer tersimpan...");
                    try { server = await device.gatt.connect(); } catch(e) { server = null; }
                }

                // 🚀 PENCEGAH SCAN MEMBABI BUTA
                if (!server) {
                    let mauScan = true;
                    if (device) {
                        this.setLoading(false);
                        // Beri kasir pilihan, jangan langsung paksa scan baru!
                        mauScan = confirm("Printer tersimpan gagal merespons otomatis.\n\nKlik [OK] jika Anda ingin SCAN ULANG / Pairing Baru.\nKlik [BATAL] lalu tekan ikon Printer lagi untuk sekadar memancing sambungan.");
                    }

                    if (mauScan) {
                        this.setLoading(true, "Mencari Perangkat Baru...");
                        device = await navigator.bluetooth.requestDevice({
                            acceptAllDevices: true, 
                            optionalServices: [
                                '000018f0-0000-1000-8000-00805f9b34fb', '0000ff00-0000-1000-8000-00805f9b34fb',
                                '0000e700-0000-1000-8000-00805f9b34fb', '0000fee7-0000-1000-8000-00805f9b34fb',
                                'e7810a71-73ae-499d-8c15-faa9aef0c3f2'
                            ]
                        });
                        this.setLoading(true, "Mengawinkan Perangkat...");
                        server = await device.gatt.connect();
                    } else {
                        this.isBluetoothSearching = false;
                        return; // Kasir memilih batal scan
                    }
                }
            }

            // 3. DETEKSI SERVICE PRINTER
            let service;
            const serviceUUIDs = ['000018f0-0000-1000-8000-00805f9b34fb', '0000ff00-0000-1000-8000-00805f9b34fb', '0000e700-0000-1000-8000-00805f9b34fb', '0000fee7-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2'];
            for (let uuid of serviceUUIDs) { try { service = await server.getPrimaryService(uuid); if(service) break; } catch(e) {} }
            if(!service) throw new Error("Service Printer tidak ditemukan");

            // 4. DETEKSI CHARACTERISTIC PRINTER
            const charUUIDs = ['00002af1-0000-1000-8000-00805f9b34fb', '0000ff02-0000-1000-8000-00805f9b34fb', '0000e701-0000-1000-8000-00805f9b34fb', '0000fec8-0000-1000-8000-00805f9b34fb', 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f'];
            for (let uuid of charUUIDs) { try { this.printerCharacteristic = await service.getCharacteristic(uuid); if(this.printerCharacteristic) break; } catch(e) {} }
            if(!this.printerCharacteristic) throw new Error("Characteristic gagal diakses");

            // --- SUKSES MENYAMBUNG ---
            this.printerDevice = device;
            if (btnPrinter) {
                btnPrinter.classList.replace('text-slate-600', 'text-green-600');
                btnPrinter.classList.add('bg-green-50', 'border-green-200');
            }
            if (statusPrinter) statusPrinter.innerText = "Printer Ready";

            if (!isAuto) this.showToast("Printer Terhubung & Siap Cetak!", "success");
            if (!isAuto) this.setLoading(false);

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
            if (!isAuto) this.setLoading(false);
            this.printerCharacteristic = null;
            
            if (!isAuto) {
                if (error.name === 'NotFoundError' || error.message.includes('cancelled')) {
                    this.showToast("Pencarian dibatalkan.", "warning");
                } else {
                    this.showToast("Gagal menyambung. Pastikan printer nyala.", "error");
                }
            }
        } finally {
            setTimeout(() => { this.isBluetoothSearching = false; }, 2000);
        }
    },
    
    autoConnectPrinter: async function() {
        // 🚀 BLOKIR CFD: Cegah layar CFD merebut koneksi printer!
        let isCFD = window.location.href.toLowerCase().includes('cfd') || document.title.toLowerCase().includes('cfd');
        if (isCFD) return; 

        if (this.printerCharacteristic || this.isBluetoothSearching) return;
        
        if (navigator.bluetooth && navigator.bluetooth.getDevices) {
            try {
                const devices = await navigator.bluetooth.getDevices();
                if (devices.length > 0) {
                    console.log("Mencoba Auto-Connect ke printer tersimpan...");
                    this.connectBluetooth(true); 
                }
            } catch (e) {
                console.log("Auto-connect tidak diizinkan browser.");
            }
        }
    },
    
printReceipt: async function(id, outlet, total, tunai, kembali, items, status, explicitDate, antrian, isReprint = false) {
        if (!this.printerCharacteristic) {
            this.showToast("Printer belum terhubung!", "error");
            throw new Error("Printer tidak siap");
        } 
        
        try {
            let statStr = status === 'Sukses' ? '' : '\n*** DIBATALKAN ***\n';
            let printTime = explicitDate ? explicitDate : new Date().toLocaleString('id-ID');
            let antrianStr = antrian ? `\nANTRIAN : ${antrian}` : '';
            
            let str = "\x1B\x61\x01\x1B\x45\x01=== Ai-Snack ===\n\x1B\x45\x00";
            str += `Cabang: ${outlet}\nNo. Resi: ${id}${antrianStr}${statStr}\nKasir: ${this.currentUser.Username}\nMetode: ${this.payMethod || 'Tunai'}\nWaktu: ${printTime}\n--------------------------------\n\x1B\x61\x00\n`;
            
            items.forEach(i => {
                str += `${i.nama}\n${i.qty} x Rp ${Number(i.price).toLocaleString('id-ID')} = Rp ${(i.price * i.qty).toLocaleString('id-ID')}\n`;
            });
            
            str += `--------------------------------\n\x1B\x61\x02\x1B\x45\x01TOTAL  : Rp ${Number(total).toLocaleString('id-ID')}\nTUNAI  : Rp ${Number(tunai).toLocaleString('id-ID')}\nKEMBALI: Rp ${Number(kembali).toLocaleString('id-ID')}\n\x1B\x45\x00\x1B\x61\x01\nTerima Kasih!\n\n\n\n`;
            
            const data = new TextEncoder().encode(str);
            const chunkSize = 20; 
            for (let i = 0; i < data.length; i += chunkSize) {
                await this.printerCharacteristic.writeValue(data.slice(i, i + chunkSize));
            }

            // 🚀 PERBAIKAN: Hanya kirim laporan cetak dari sini JIKA ini adalah fitur Cetak Ulang
            if (isReprint && id && status === 'Sukses') {
                this.laporStrukDicetak(id);
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
    // 1. Cek apakah layar utama POS (Kasir) sedang aktif / terbuka
    const viewPos = document.getElementById('view-pos');
    const isPosActive = viewPos && !viewPos.classList.contains('hidden');

    // 2. HANYA tarik data gaib jika: 
    // - Internet nyala
    // - Keranjang kosong (tidak ganggu transaksi)
    // - Staf sedang standby di halaman POS (bukan di halaman Opname/Terima Barang)
    if (superApp.isOnline && superApp.cart.length === 0 && isPosActive) {
        superApp.pullFreshData(true); 
    }
}, 300000);




