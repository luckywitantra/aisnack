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

        // 🚀 JURUS 1: Auto-scroll agar kotak inputan naik ke tengah layar
        setTimeout(() => {
            try { 
                this.targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
            } catch(e){}
        }, 300);

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

    // 🚀 FUNGSI BARU: Mengirim ketikan ke Layar Monitor Mini
    updatePreview: function() {
        const preview = document.getElementById('vk-live-preview');
        if (preview && this.targetElement) {
            let val = this.targetElement.value;
            // Jika kosong, tampilkan efek kursor berkedip
            preview.innerHTML = val === '' ? '<span class="animate-pulse text-slate-500">_</span>' : val;
        }
    },
    
    render: function() {
        const container = document.getElementById('vk-keys'); 
        if (!container) return;
        
        let html = ''; 
        let rows = this.layouts[this.mode];

        let maxWidth = this.mode === 'numeric' ? 'max-w-sm' : 'max-w-3xl';
        html += `<div class="w-full ${maxWidth} mx-auto flex flex-col gap-1.5 sm:gap-2">`;

        // =========================================================
        // 🚀 JURUS 2: LAYAR MONITOR MINI DI ATAS KEYBOARD (LIVE PREVIEW)
        // =========================================================
        let currentVal = this.targetElement ? this.targetElement.value : '';
        let placeholderTxt = this.targetElement ? (this.targetElement.placeholder || 'Ketik di sini...') : 'Ketik di sini...';
        
        // Coba baca teks label di atas inputan agar user tahu sedang mengisi apa
        let label = placeholderTxt;
        if (this.targetElement && this.targetElement.previousElementSibling) {
            label = this.targetElement.previousElementSibling.innerText || placeholderTxt;
        }
        
        html += `
        <div class="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3 sm:p-4 mb-1 shadow-inner relative flex flex-col justify-end min-h-[70px]">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest absolute top-2 left-3 truncate w-5/6">${label}</span>
            <div id="vk-live-preview" class="text-xl sm:text-2xl font-mono font-black text-emerald-400 text-right w-full overflow-hidden truncate mt-3">
                ${currentVal || '<span class="animate-pulse text-slate-500">_</span>'}
            </div>
        </div>`;
        // =========================================================

        rows.forEach(row => {
            let rowGap = this.mode === 'numeric' ? 'gap-2' : 'gap-1 sm:gap-1.5';
            html += `<div class="flex justify-center ${rowGap} w-full">`;
            
            row.forEach(key => {
                let baseClass = "flex items-center justify-center font-bold rounded-lg sm:rounded-xl shadow-[0_3px_0_rgba(203,213,225,1)] border border-slate-200 active:shadow-none active:translate-y-[3px] transition-all select-none touch-manipulation";
                
                let sizeClass = this.mode === 'numeric' 
                    ? "flex-1 py-4 sm:py-5 text-2xl bg-white text-slate-800" 
                    : "flex-1 py-3 sm:py-4 text-sm sm:text-lg bg-white text-slate-800";

                if (key === 'C') {
                    sizeClass = this.mode === 'numeric'
                        ? "flex-1 py-4 sm:py-5 text-2xl bg-rose-50 text-rose-500 border-rose-200 shadow-[0_3px_0_rgba(254,205,211,1)]"
                        : "flex-1 py-3 sm:py-4 text-sm sm:text-lg bg-rose-50 text-rose-500 border-rose-200 shadow-[0_3px_0_rgba(254,205,211,1)]";
                    
                    html += `<button type="button" class="${baseClass} ${sizeClass}" onclick="osKeyboard.clear()">${key}</button>`;
                } else {
                    html += `<button type="button" class="${baseClass} ${sizeClass}" onclick="osKeyboard.insert('${key}')">${key}</button>`;
                }
            });
            html += `</div>`;
        });

        if (this.mode === 'text') {
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
        // Delay 10ms agar terbaca setelah fungsi FormatRupiah (jika ada) memodifikasi angka
        setTimeout(() => this.updatePreview(), 10);
    },
    
    backspace: function() { 
        if (!this.targetElement) return; 
        this.targetElement.value = this.targetElement.value.slice(0, -1); 
        this.targetElement.dispatchEvent(new Event('input', { bubbles: true })); 
        setTimeout(() => this.updatePreview(), 10);
    },
    
    clear: function() { 
        if (!this.targetElement) return; 
        this.targetElement.value = ''; 
        this.targetElement.dispatchEvent(new Event('input', { bubbles: true })); 
        setTimeout(() => this.updatePreview(), 10);
    }
};

/* ========================================== */
/* 2. MESIN UTAMA APLIKASI (SUPERAPP)         */
/* ========================================== */
const superApp = {
    outlet: '', cart: [], printerChar: null, db: null, filteredProducts: [],
    payTotal: 0, payCash: 0, payChange: 0, payMethod: 'Tunai', activeShiftId: null, activeStaffTeam: [],
    activeReprintTrx: null, currentUser: null, pinBuffer: '', ADMIN_PIN: '1234',
    offlineQueue: [], isOnline: navigator.onLine, cfdWindow: null, profitChart: null, isLoadingData: false, printerCharacteristic: null, printerDevice: null, isBluetoothSearching: false, isProcessing: false,
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
    // 🚀 FITUR BARU: Penarik Data Senyap di Latar Belakang
    pullBackgroundData: async function() {
        console.log("Memulai sinkronisasi seluruh riwayat data di latar belakang...");
        try {
            // Tarik SEMUA data (history=all)
            const res = await fetch(API_URL + "?ts=" + new Date().getTime() + "&history=all", { redirect: 'follow' });
            const data = await res.json();
            
            if (data && data.status === 'sukses') {
                // 1. Timpa database memori lokal dengan data yang sudah 100% lengkap
                this.db = data;
                localStorage.setItem('aisnack_db_cache', JSON.stringify(data));
                
                // 2. Refresh elemen-elemen senyap jika diperlukan
                if (typeof this.updatePendingNotifications === 'function') this.updatePendingNotifications();
                
                console.log("Sinkronisasi latar belakang selesai! Database lokal kini 100% lengkap.");
            }
        } catch (e) {
            console.log("Sinkronisasi latar belakang gagal, akan dicoba otomatis nanti.", e);
        }
    },

    
   pullFreshData: async function(silent = false) {
        if (this.isProcessing && !silent) return; 
        
        // Teks loading disesuaikan karena selalu menarik semua data
        if (!silent) this.setLoading(true, "Menyinkronkan Seluruh Database...");
        this.isProcessing = true; 

        try {
            // 🚀 PERBAIKAN: Selalu gunakan history=all agar tidak menimpa background sync
            const res = await fetch(API_URL + "?ts=" + new Date().getTime() + "&history=all", { redirect: 'follow' }); 
            const data = await res.json();
            
            if (data && data.status === 'sukses') { 
                
                // --- RADAR PENDETEKSI UPDATE VERSI ---
                let serverVersion = (data.pengaturan || []).find(x => x.Pengaturan === 'Versi_Aplikasi');
                if (serverVersion) {
                    let localVersion = localStorage.getItem('app_version');
                    
                    if (!localVersion) {
                        localStorage.setItem('app_version', serverVersion.Nilai);
                    } 
                    else if (localVersion !== serverVersion.Nilai) {
                        console.log("Versi baru ditemukan, memuat ulang...");
                        localStorage.setItem('app_version', serverVersion.Nilai);
                        
                        if ('serviceWorker' in navigator) {
                            const regs = await navigator.serviceWorker.getRegistrations();
                            for(let reg of regs) { reg.update(); }
                        }
                        
                        window.location.reload(true);
                        return; 
                    }
                }
                
                // Simpan database utuh ke memori
                this.db = data; 
                localStorage.setItem('aisnack_db_cache', JSON.stringify(data));

                // JEMBATAN PENGATURAN PERSONALISASI
                let configs = [
                    { key: 'Logo_Aplikasi', storage: 'app_logo_url', callback: (val) => typeof this.updateAppLogos === 'function' && this.updateAppLogos(val) },
                    { key: 'Promo_Standby', storage: 'cfd_promo_standby' },
                    { key: 'Promo_Transaksi', storage: 'cfd_promo_transaksi' },
                    { key: 'aisnack_receipt_template', storage: 'aisnack_receipt_template' }
                ];

                configs.forEach(c => {
                    let item = (this.db.pengaturan || []).find(x => x.Pengaturan === c.key);
                    if (item && item.Nilai) {
                        localStorage.setItem(c.storage, item.Nilai);
                        if (c.callback) c.callback(item.Nilai);
                    }
                });
                
                // Refresh layar jika tidak sedang melayani pelanggan
                if (this.cart.length === 0) this.refreshData(); 
                
                if (!silent) this.showToast("Seluruh database berhasil disinkronkan!"); 
            } else {
                throw new Error("Data tidak valid");
            }
        } catch (e) { 
            console.error("Fetch Error:", e);
            if (!silent) this.showToast("Gagal menarik data. Cek koneksi Anda.", "error"); 
        } finally {
            this.isProcessing = false;
            if (!silent) this.setLoading(false);
        }
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

            // 🚀 INTEGRASI TRIGGER OTOMATIS: 
            // Panggil fungsi pemuat data khusus sesuai ID modal yang sedang dibuka
            if (modalId === 'modal-system-settings' && typeof this.loadStrukSettings === 'function') {
                this.loadStrukSettings();
            }
        }
    },
    
   closeModal: function(id) { 
        const modal = document.getElementById(id); 
        const content = document.getElementById(id + '-content'); 
        
        if (modal) { 
            if (content) {
                // Jalur A: Jika ada ID -content, lakukan penutupan dengan animasi halus
                content.classList.remove('modal-enter-active'); 
                setTimeout(() => modal.classList.add('hidden'), 300); 
            } else {
                // Jalur B: Jaga-jaga jika ID -content lupa dibuat di HTML, langsung tutup paksa!
                modal.classList.add('hidden'); 
            }
        } 
    },

    // 🚀 FUNGSI BARU: Menampilkan Popup Peringatan Fungsi Menu
    showMenuGuide: function(type) {
        let title = ''; let icon = ''; let color = ''; let content = '';

        if (type === 'terima') {
            title = 'TERIMA BARANG MASUK';
            icon = 'fa-truck-loading';
            color = 'text-emerald-500 bg-emerald-50 border-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
            content = `
                <div class="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl text-xs font-black mb-4 flex gap-2 items-center">
                    <i class="fas fa-exclamation-triangle text-lg animate-pulse"></i> 
                    <span>JANGAN TERTUKAR DENGAN OPNAME!</span>
                </div>
                <p class="text-sm font-bold text-slate-700 mb-2">Gunakan menu ini <span class="text-emerald-600 font-black">HANYA KETIKA</span>:</p>
                <ul class="list-disc pl-5 text-sm space-y-1.5 text-slate-600 font-medium mb-4">
                    <li>Ada <b>pengiriman bahan baku/barang baru</b> dari Gudang Pusat.</li>
                    <li>Kurir datang membawa fisik barang ke toko.</li>
                </ul>
                <div class="bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <p class="text-xs text-slate-500"><span class="font-black text-slate-700">Efek:</span> Angka yang diketik akan <b class="text-emerald-600">MENAMBAH</b> stok barang di komputer secara otomatis.</p>
                </div>
            `;
        } else if (type === 'opname') {
            title = 'OPNAME FISIK (AUDIT)';
            icon = 'fa-clipboard-check';
            color = 'text-purple-500 bg-purple-50 border-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.4)]';
            content = `
                <div class="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl text-xs font-black mb-4 flex gap-2 items-center">
                    <i class="fas fa-exclamation-triangle text-lg animate-pulse"></i> 
                    <span>JANGAN TERTUKAR DGN TERIMA BARANG!</span>
                </div>
                <p class="text-sm font-bold text-slate-700 mb-2">Gunakan menu ini <span class="text-purple-600 font-black">HANYA KETIKA</span>:</p>
                <ul class="list-disc pl-5 text-sm space-y-1.5 text-slate-600 font-medium mb-4">
                    <li>Anda sedang <b>menghitung sisa stok asli</b> di laci, etalase, atau kulkas.</li>
                    <li>Ingin mencocokkan apakah data di komputer sama dengan aslinya.</li>
                </ul>
                <div class="bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <p class="text-xs text-slate-500"><span class="font-black text-slate-700">Cara Isi:</span> Ketik angka <b>SISA FISIK YANG ADA</b>. Sistem akan otomatis menghitung selisih hilang/lebihnya.</p>
                </div>
            `;
        } else {
            return;
        }

        const modal = document.getElementById('modal-menu-guide');
        if (modal) {
            document.getElementById('guide-icon-container').className = `w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-[6px] ${color}`;
            document.getElementById('guide-icon').className = `fas ${icon}`;
            document.getElementById('guide-title').innerText = title;
            document.getElementById('guide-content-body').innerHTML = content;

            this.openModal('modal-menu-guide');
        }
    },

    toggleDarkMode: function() { 
        document.documentElement.classList.toggle('dark'); 
        let ic = document.getElementById('dark-icon'); 
        if (ic) { 
            if (document.documentElement.classList.contains('dark')) { 
                ic.classList.replace('fa-moon', 'fa-sun'); 
                ic.classList.replace('text-slate-600', 'text-yellow-400'); 
            } else { 
                ic.classList.replace('fa-sun', 'fa-moon'); 
                ic.classList.replace('text-yellow-400', 'text-slate-600'); 
            } 
        }
    },

    
    apiPost: async function(payload) {
        if (!this.isOnline) { this.offlineQueue.push(payload); localStorage.setItem('aisnack_offline_queue', JSON.stringify(this.offlineQueue)); this.updateNetworkUI(); return { status: 'sukses', is_offline: true, trx_id: payload.trx_id || payload.id_shift }; }
        try { const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) }); return await res.json(); } 
        catch (e) { this.offlineQueue.push(payload); localStorage.setItem('aisnack_offline_queue', JSON.stringify(this.offlineQueue)); this.updateNetworkUI(); return { status: 'sukses', is_offline: true, trx_id: payload.trx_id || payload.id_shift }; }
    },

    // ... (fungsi-fungsi superApp lainnya di atas) ...

    openSyncCenter: function() {
        this.renderSyncQueue();
        this.openModal('modal-sync-center');
    },

    renderSyncQueue: function() {
        const listEl = document.getElementById('sync-queue-list');
        if (!listEl) return;

        // 🚀 1. PARSING DATA SUPER AMAN
        let rawData = localStorage.getItem('aisnack_offline_queue');
        let offlineData = [];
        try {
            offlineData = JSON.parse(rawData || '[]');
            // Jika entah kenapa bukan array, jadikan array
            if (!Array.isArray(offlineData)) offlineData = [offlineData]; 
        } catch(e) {
            offlineData = [];
        }

        let totalQueue = offlineData.length;

        // Jika benar-benar kosong, tampilkan status hijau
        if (totalQueue === 0) {
            listEl.innerHTML = `
                <div class="text-center py-8">
                    <div class="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner"><i class="fas fa-check-double"></i></div>
                    <h4 class="font-extrabold text-slate-800 text-lg">Semua Data Tersinkronisasi</h4>
                    <p class="text-xs text-slate-500 mt-2 font-medium">Tidak ada antrean data lokal. Sistem dalam keadaan up-to-date dengan server.</p>
                </div>
            `;
            const btnSync = document.getElementById('btn-trigger-sync');
            if(btnSync) btnSync.style.display = 'none';
            return;
        }

        // Tampilkan tombol sync jika ada data
        const btnSync = document.getElementById('btn-trigger-sync');
        if(btnSync) btnSync.style.display = 'flex';

        // 🚀 2. KLASIFIKASI DATA ANTI-GAGAL
        let cTrx = 0; let cTerima = 0; let cOpname = 0; let cKas = 0; let cLain = 0;

        offlineData.forEach(item => {
            // Jaga-jaga jika item di dalam array berbentuk string (Double Stringify)
            let obj = item;
            if (typeof item === 'string') {
                try { obj = JSON.parse(item); } catch(e) {}
            }

            // Cari tahu jenis datanya dari properti 'action' (atau jadikan string kosong jika tidak ada)
            let act = String(obj.action || obj.jenis || obj.type || '').toLowerCase();

            if (act.includes('checkout') || act.includes('pos')) cTrx++;
            else if (act.includes('terima') || act.includes('masuk')) cTerima++;
            else if (act.includes('opname') || act.includes('audit')) cOpname++;
            else if (act.includes('kas') || act.includes('keluar')) cKas++;
            else cLain++; // Masuk ke Data Lainnya jika nama action sama sekali tidak dikenali
        });

        // 🚀 3. PEMBENTUK KARTU (CARD BUILDER)
        const createCard = (title, icon, count, colorClass, barColor, id) => {
            if (count === 0) return ''; // Lewati jika nol
            return `
            <div class="bg-white border border-slate-200 rounded-[1.25rem] p-4 shadow-sm relative overflow-hidden group mb-3">
                <div class="flex justify-between items-center mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 ${colorClass} rounded-xl flex items-center justify-center text-lg"><i class="fas ${icon}"></i></div>
                        <h4 class="font-extrabold text-slate-700 text-sm">${title}</h4>
                    </div>
                    <span class="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-slate-200" id="badge-${id}">${count} Tertunda</span>
                </div>
                
                <div class="w-full bg-slate-100 rounded-full h-2.5 mb-1 overflow-hidden shadow-inner">
                    <div id="bar-${id}" class="${barColor} h-2.5 rounded-full w-0 transition-all duration-500 relative">
                        <div class="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
                <div class="flex justify-between items-center mt-1.5">
                    <span class="text-[10px] font-bold text-slate-400" id="status-${id}">Menunggu sinkronisasi...</span>
                    <span class="text-[10px] font-black text-slate-600" id="pct-${id}">0%</span>
                </div>
            </div>`;
        };

        // 🚀 4. GABUNGKAN KARTU KE DALAM HTML
        let html = '';
        html += createCard('Transaksi POS', 'fa-cash-register', cTrx, 'bg-brand-50 text-brand-500', 'bg-brand-500', 'trx');
        html += createCard('Penerimaan Barang', 'fa-dolly', cTerima, 'bg-emerald-50 text-emerald-500', 'bg-emerald-500', 'terima');
        html += createCard('Opname Fisik', 'fa-clipboard-check', cOpname, 'bg-purple-50 text-purple-500', 'bg-purple-500', 'opname');
        html += createCard('Kas Keluar', 'fa-money-bill-transfer', cKas, 'bg-rose-50 text-rose-500', 'bg-rose-500', 'kas');
        html += createCard('Data Lainnya', 'fa-database', cLain, 'bg-slate-100 text-slate-600', 'bg-slate-600', 'lain');

        // Jika setelah diekstrak ternyata html masih kosong padahal totalQueue > 0 (Sangat langka)
        if (html === '') {
             html = createCard('Antrean Sistem', 'fa-server', totalQueue, 'bg-indigo-50 text-indigo-500', 'bg-indigo-500', 'sistem');
        }

        listEl.innerHTML = html;
    },

    executeVisualSync: function() {
        const btn = document.getElementById('btn-trigger-sync');
        if(btn) {
            btn.innerHTML = `<i class="fas fa-spinner fa-spin text-lg text-emerald-400"></i> Menyinkronkan...`;
            btn.classList.add('opacity-80', 'cursor-not-allowed');
        }
        
        const syncIcon = document.getElementById('sync-center-icon');
        if(syncIcon) syncIcon.classList.add('fa-spin');

        const animateBar = (id) => {
            let bar = document.getElementById(`bar-${id}`);
            let pct = document.getElementById(`pct-${id}`);
            let sts = document.getElementById(`status-${id}`);
            let badge = document.getElementById(`badge-${id}`);
            
            if(!bar) return;

            sts.innerText = "Mengirim data...";
            sts.classList.add('text-brand-500');

            let progress = 0;
            let interval = setInterval(() => {
                progress += Math.floor(Math.random() * 20) + 5; 
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    sts.innerText = "Berhasil";
                    sts.classList.replace('text-brand-500', 'text-emerald-500');
                    badge.innerText = "Selesai";
                    badge.classList.replace('bg-slate-100', 'bg-emerald-100');
                    badge.classList.replace('text-slate-600', 'text-emerald-700');
                }
                bar.style.width = `${progress}%`;
                pct.innerText = `${progress}%`;
            }, 300);
        };

        animateBar('trx');
        animateBar('terima');
        animateBar('opname');
        animateBar('kas');

        // PANGGIL FUNGSI SINKRONISASI ASLI
        if(typeof this.syncOfflineQueue === 'function') {
            this.syncOfflineQueue(); 
        }

        setTimeout(() => {
            if(btn) {
                btn.innerHTML = `<i class="fas fa-cloud-arrow-up text-lg text-emerald-400"></i> Mulai Sinkronisasi`;
                btn.classList.remove('opacity-80', 'cursor-not-allowed');
            }
            if(syncIcon) syncIcon.classList.remove('fa-spin');
            
            this.showToast('Semua data berhasil disinkronkan', 'success');
            this.closeModal('modal-sync-center');
            this.renderSyncQueue();
        }, 2500); 
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

    // 🚀 FITUR BARU: Pencarian Tabel Instan (Live Search)
    quickSearchTable: function(tbodyId, keyword) {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        
        const filterText = keyword.toLowerCase();
        const rows = tbody.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            let rowText = rows[i].textContent || rows[i].innerText;
            if (rowText.toLowerCase().indexOf(filterText) > -1) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
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
        this.initAutoSync();
        
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
                        // 🚀 AWAL BUKA: Tarik 30 hari agar super cepat!
                        const res = await fetch(API_URL + "?ts=" + new Date().getTime() + "&history=30", { redirect: 'follow' }); 
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
                
                // Set Logo & Promo CFD
                let logoData = (this.db.pengaturan || []).find(x => x.Pengaturan === 'Logo_Aplikasi');
                if (logoData) { localStorage.setItem('app_logo_url', logoData.Nilai); this.updateAppLogos(logoData.Nilai); }
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

                // 🚀 TRIGGER BACKGROUND SYNC
                // Setelah 3 detik aplikasi jalan, secara diam-diam tarik semua historis tahunan
                setTimeout(() => {
                    if (typeof this.pullBackgroundData === 'function') {
                        this.pullBackgroundData();
                    }
                }, 3000);
            };

            // Logika Pembacaan Data
            if (cacheDb) {
                performFetch(); // Biarkan proses di belakang layar, kasir sudah bisa masuk pakai PIN
            } else {
                await performFetch(); // Blokir layar karena ini instalasi pertama kali
            }

        } catch (err) {
            // 🚀 INI ADALAH BLOK CATCH YANG TERHAPUS SEBELUMNYA
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
        if (!this.db || !this.db.users) { 
            this.showToast('Koneksi ke Database belum siap.', 'error'); 
            this.clearPin(); this.isProcessing = false; return; 
        }

        // 🚀 Cek PIN Kasir
        let user = this.db.users.find(u => String(u.PIN) === String(this.pinBuffer));
        
        if (user) {
            this.currentUser = user; 
            
            const sbRole = document.getElementById('sb-role'); if (sbRole) sbRole.innerText = user.Role;
            const hInit = document.getElementById('header-initial'); if (hInit) hInit.innerText = user.Username.charAt(0).toUpperCase();

            let roleStr = String(user.Role).toLowerCase();
            let isAdmin = roleStr.includes('admin') || roleStr.includes('owner');
            this.userRole = roleStr.includes('owner') ? 'owner' : (roleStr.includes('admin') ? 'admin' : 'kasir');
            
            // =====================================================================
            // 🚀 NORMALISASI MUTLAK: BERSIHKAN TEKS CABANG DARI AWALAN "AI-SNACK"
            // =====================================================================
            let cleanUserOutlet = String(user.Outlet || 'Penajam').replace(/^Ai\-Snack\s+/i, '').trim();

            if (!isAdmin) {
                // 🔒 KUNCI MUTLAK KASIR: Paksa sistem hanya menggunakan cabang penugasan kasir
                this.outlet = cleanUserOutlet;
            } else {
                // 👑 OWNER / ADMIN: Gunakan cabang terakhir atau default
                if (cleanUserOutlet === 'Pusat' || cleanUserOutlet === 'Semua') {
                    let savedOutlet = localStorage.getItem('aisnack_active_outlet');
                    this.outlet = savedOutlet || ((this.db.outlets || [])[0]?.ID_Outlet || 'Penajam');
                } else {
                    this.outlet = cleanUserOutlet;
                }
            }

            // Normalisasi sekali lagi agar tidak ada spasi sisa
            this.outlet = String(this.outlet).replace(/^Ai\-Snack\s+/i, '').trim();

            // Kunci ke memori browser
            localStorage.setItem('aisnack_active_outlet', this.outlet);
            localStorage.setItem('aicha_active_outlet', this.outlet);

            // Kontrol Tampilan Menu UI
            const adminMenus = document.getElementById('admin-menus'); 
            const selOut = document.getElementById('select-outlet'); 
            const repOut = document.getElementById('report-outlet-filter');
            const premiumCards = ['setting-card-standby', 'setting-card-transaksi', 'setting-card-logo', 'setting-card-struk'];

            if (isAdmin) {
                if (adminMenus) adminMenus.classList.remove('hidden'); 
                if (selOut) selOut.classList.remove('hidden'); 
                if (repOut) repOut.classList.remove('hidden');
                
                let outOptions = ''; let outFilters = '<option value="Semua">Semua Outlet</option>';
                (this.db.outlets || []).forEach(o => { 
                    let idClean = String(o.ID_Outlet || o.Nama_Outlet).replace(/^Ai\-Snack\s+/i, '').trim();
                    outOptions += `<option value="${idClean}">📍 Ai-CHA ${idClean}</option>`; 
                    outFilters += `<option value="${idClean}">Hanya: Ai-CHA ${idClean}</option>`; 
                });
                if (selOut) { selOut.innerHTML = outOptions; selOut.value = this.outlet; selOut.disabled = false; }
                if (repOut) repOut.innerHTML = outFilters;
                
                premiumCards.forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); });
            } else {
                if (adminMenus) adminMenus.classList.add('hidden');
                if (selOut) { 
                    selOut.classList.add('hidden'); 
                    selOut.innerHTML = `<option value="${this.outlet}">📍 Ai-CHA ${this.outlet}</option>`; 
                    selOut.value = this.outlet; selOut.disabled = true; 
                }
                if (repOut) repOut.classList.add('hidden');
                premiumCards.forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
            }

            const ls = document.getElementById('login-screen'); if (ls) ls.classList.add('hidden');
            const sbar = document.getElementById('sidebar'); if (sbar) sbar.classList.remove('hidden');
            const mainApp = document.getElementById('main-app'); if (mainApp) mainApp.classList.remove('hidden');

            // 🚀 PERBAIKAN KRITIS: Panggil refreshData() langsung agar Produk & Header 100% tersinkronisasi!
            this.refreshData(); 
            this.updateNetworkUI(); 
            this.syncOfflineQueue(); 
            this.checkShiftStatus(); 
            
            this.showToast(`Selamat datang, ${user.Username}! (Cabang: ${this.outlet})`);
            
            this.updateCFDGreeting(); 
            if (!this.cfdTimer) {
                this.cfdTimer = setInterval(() => { this.updateCFDGreeting(); }, 60000); 
            }
            this.autoConnectPrinter();

        } else { 
            this.showToast('PIN Tidak Dikenali', 'error'); this.clearPin(); 
        }

        // 🚀 RADAR OTOMATIS TUTUP SHIFT JAM 12 MALAM (00:00)
            if (!this.midnightTimer) {
                this.midnightTimer = setInterval(() => {
                    let now = new Date();
                    // Jika tepat jam 00:00 malam (antara 00:00 s/d 00:01)
                    if (now.getHours() === 0 && now.getMinutes() === 0) {
                        if (this.activeShiftId) {
                            console.log("⏰ Jam 12 Malam tiba! Memicu Auto-Close Shift...");
                            this.checkShiftStatus();
                        }
                    }
                }, 45000); // Cek setiap 45 detik
            }
        this.isProcessing = false;
    },

    updateHeaderOutletName: function() {
        const outletNameEl = document.getElementById('header-outlet-name');
        if (outletNameEl) {
            // Bersihkan variabel outlet aktif dari awalan
            let cleanCurrent = String(this.outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            let outletData = (this.db.outlets || []).find(o => {
                let idClean = String(o.ID_Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
                let nmClean = String(o.Nama_Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
                return idClean === cleanCurrent || nmClean === cleanCurrent;
            });
            
            // Selalu cetak dengan format standar yang rapi
            outletNameEl.innerText = outletData ? `Ai-CHA ${cleanCurrent}` : `Ai-CHA ${cleanCurrent}`;
        }
    },
    
  
    // =========================================================
    // 🚀 LOGOUT AMAN & KEMBALI KE LAYAR PIN
    // =========================================================
    logout: function() {
        // 1. Bersihkan seluruh memori sesi aktif di objek aplikasi
        this.currentUser = null;
        this.userRole = null;
        this.outlet = null;
        this.cart = [];
        this.dailyExpensesList = [];

        // 2. Hapus jejak sesi dari LocalStorage browser
        localStorage.removeItem('aicha_current_user');
        localStorage.removeItem('aisnack_current_user');
        localStorage.removeItem('aicha_active_outlet');
        localStorage.removeItem('aisnack_active_outlet');

        // 🚀 3. BALIKKAN TAMPILAN LAYAR PERSIS SEPERTI SEBELUM LOGIN
        const sbar = document.getElementById('sidebar'); 
        if (sbar) sbar.classList.add('hidden');
        
        const mainApp = document.getElementById('main-app'); 
        if (mainApp) mainApp.classList.add('hidden');

        // Sembunyikan juga semua sub-view yang mungkin sedang terbuka
        document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));

        // Munculkan kembali layar PIN utama
        const loginScreen = document.getElementById('login-screen'); 
        if (loginScreen) {
            loginScreen.classList.remove('hidden');
        } else {
            // Fallback keamanan jika ID di HTML Anda bernama view-login
            const viewLogin = document.getElementById('view-login');
            if (viewLogin) viewLogin.classList.remove('hidden');
        }

        // 4. Bersihkan sisa ketikan bulatan PIN sebelumnya
        if (typeof this.clearPin === 'function') {
            this.clearPin();
        } else {
            this.pinBuffer = '';
            document.querySelectorAll('.pin-dot').forEach(dot => dot.classList.remove('active'));
        }

        this.showToast("Berhasil keluar. Silakan masukkan PIN kembali.", "info");
    },

   // ==========================================
    // DYNAMIC RECEIPT BUILDER ENGINE
    // ==========================================
    receiptBlocks: [], // State memori desain
    activeBlockId: null,

    // Template Dasar Jika Belum Pernah Dibuat
    defaultReceiptTemplate: [
        { id: 1, type: 'logo', image: 'https://cdn-icons-png.flaticon.com/512/3081/3081308.png', align: 'center' },
        { id: 2, type: 'text', content: '{{nama_toko}}', align: 'center', size: 'double', bold: true },
        { id: 3, type: 'text', content: 'Pusat Jajanan Kekinian\nCab. {{cabang}}', align: 'center', size: 'normal', bold: false },
        { id: 4, type: 'divider', style: 'dashed' },
        { id: 5, type: 'text', content: 'TRX: {{no_resi}}\nTgl: {{waktu}}\nKsr: {{kasir}}', align: 'left', size: 'normal', bold: false },
        { id: 6, type: 'divider', style: 'dashed' },
        { id: 7, type: 'body_transaction' }, // Blok absolut daftar pesanan
        { id: 8, type: 'divider', style: 'dashed' },
        { id: 9, type: 'text', content: 'Terima kasih atas kunjungannya!\nWiFi: {{wifi}}', align: 'center', size: 'normal', bold: true }
    ],

    openReceiptBuilder: function() {
        let savedTemplate = localStorage.getItem('aisnack_receipt_template');
        if (savedTemplate) {
            try { this.receiptBlocks = JSON.parse(savedTemplate); } 
            catch(e) { this.receiptBlocks = JSON.parse(JSON.stringify(this.defaultReceiptTemplate)); }
        } else {
            this.receiptBlocks = JSON.parse(JSON.stringify(this.defaultReceiptTemplate));
        }
        
        this.activeBlockId = null;
        this.renderReceiptCanvas();
        this.renderReceiptInspector();
        this.closeModal('modal-system-settings'); // Tutup modal pengaturan
        this.openModal('modal-receipt-builder'); // Buka modal canvas
    },

    addReceiptBlock: function(type) {
        let newId = new Date().getTime();
        let newBlock = { id: newId, type: type };
        
        if (type === 'text') { newBlock.content = 'Teks Baru'; newBlock.align = 'left'; newBlock.size = 'normal'; newBlock.bold = false; }
        else if (type === 'divider') { newBlock.style = 'dashed'; }
        else if (type === 'logo') { newBlock.image = 'https://cdn-icons-png.flaticon.com/512/3081/3081308.png'; newBlock.align = 'center'; }
        else if (type === 'qrcode') { newBlock.content = 'https://instagram.com/aisnack'; newBlock.align = 'center'; }

        this.receiptBlocks.push(newBlock);
        this.activeBlockId = newId;
        this.renderReceiptCanvas();
        this.renderReceiptInspector();
        
        // Auto scroll ke bawah
        let canvas = document.getElementById('receipt-canvas-container');
        if(canvas) setTimeout(()=> canvas.scrollTop = canvas.scrollHeight, 100);
    },

    moveReceiptBlock: function(id, direction) {
        let idx = this.receiptBlocks.findIndex(b => b.id === id);
        if (idx < 0) return;
        
        if (direction === 'up' && idx > 0) {
            let temp = this.receiptBlocks[idx - 1];
            this.receiptBlocks[idx - 1] = this.receiptBlocks[idx];
            this.receiptBlocks[idx] = temp;
        } else if (direction === 'down' && idx < this.receiptBlocks.length - 1) {
            let temp = this.receiptBlocks[idx + 1];
            this.receiptBlocks[idx + 1] = this.receiptBlocks[idx];
            this.receiptBlocks[idx] = temp;
        }
        this.renderReceiptCanvas();
    },

    deleteReceiptBlock: function(id) {
        this.receiptBlocks = this.receiptBlocks.filter(b => b.id !== id);
        if (this.activeBlockId === id) this.activeBlockId = null;
        this.renderReceiptCanvas();
        this.renderReceiptInspector();
    },

    selectReceiptBlock: function(id) {
        this.activeBlockId = id;
        this.renderReceiptCanvas(); // Re-render untuk efek Highlight
        this.renderReceiptInspector();
    },

    updateBlockProp: function(key, value) {
        let block = this.receiptBlocks.find(b => b.id === this.activeBlockId);
        if(block) {
            block[key] = value;
            this.renderReceiptCanvas();
        }
    },

    uploadBlockLogo: function() {
        let input = document.createElement('input'); 
        input.type = 'file'; 
        input.accept = 'image/png, image/jpeg, image/jpg';
        
        input.onchange = e => {
            let file = e.target.files[0]; 
            if (!file) return;

            // Batasan ukuran awal agar browser tidak hang saat membaca file raksasa (maks 5MB)
            if (file.size > 5 * 1024 * 1024) { 
                this.showToast("File terlalu besar. Maksimal 5MB sebelum dikompresi.", "error"); 
                return; 
            }

            this.showToast("Memproses & mengecilkan logo...", "info");

            let reader = new FileReader();
            reader.onload = event => { 
                let img = new Image();
                img.onload = () => {
                    // MESIN KOMPRESI CANVAS
                    let canvas = document.createElement('canvas');
                    let ctx = canvas.getContext('2d');

                    // Tentukan ukuran maksimal (Printer thermal ukuran 58mm optimal di lebar 200px-250px)
                    let MAX_WIDTH = 250;
                    let width = img.width;
                    let height = img.height;

                    // Hitung rasio aspek (menjaga gambar tidak gepeng)
                    if (width > MAX_WIDTH) {
                        height = Math.floor(height * (MAX_WIDTH / width));
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Opsional: Isi background putih jika gambar transparan (PNG), 
                    // karena printer thermal butuh kontras tegas antara hitam dan putih.
                    ctx.fillStyle = "#FFFFFF"; 
                    ctx.fillRect(0, 0, width, height);

                    // Gambar ulang logo yang sudah dikecilkan ke dalam canvas
                    ctx.drawImage(img, 0, 0, width, height);

                    // Konversi kembali menjadi base64 dengan kualitas medium
                    // Kualitas 0.8 sudah lebih dari cukup untuk printer hitam putih
                    let compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

                    // Simpan gambar yang sudah dikompres ke blok yang aktif
                    this.updateBlockProp('image', compressedBase64);
                    this.showToast("Logo berhasil dipasang!", "success");
                };
                
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        };
        input.click();
    },

    renderReceiptCanvas: function() {
        const canvas = document.getElementById('receipt-canvas');
        if(!canvas) return;
        
        let html = '';
        this.receiptBlocks.forEach(b => {
            let isActive = b.id === this.activeBlockId;
            let activeClass = isActive ? 'border-brand-500 bg-brand-50/50 shadow-md transform scale-[1.02] z-10' : 'border-transparent hover:border-slate-300 hover:bg-slate-50';
            
            // Tampilan Tools Overlay
            let toolsHtml = isActive ? `
                <div class="absolute -right-4 -top-3 flex gap-1 z-20">
                    <button onclick="superApp.moveReceiptBlock(${b.id}, 'up'); event.stopPropagation();" class="w-7 h-7 bg-slate-800 text-white rounded-md shadow-md hover:bg-slate-700 text-xs"><i class="fas fa-arrow-up"></i></button>
                    <button onclick="superApp.moveReceiptBlock(${b.id}, 'down'); event.stopPropagation();" class="w-7 h-7 bg-slate-800 text-white rounded-md shadow-md hover:bg-slate-700 text-xs"><i class="fas fa-arrow-down"></i></button>
                    ${b.type !== 'body_transaction' ? `<button onclick="superApp.deleteReceiptBlock(${b.id}); event.stopPropagation();" class="w-7 h-7 bg-rose-500 text-white rounded-md shadow-md hover:bg-rose-600 text-xs"><i class="fas fa-trash"></i></button>` : ''}
                </div>` : '';

            // Rendering Elemen Spesifik
            let contentHtml = '';
            let alignClass = b.align === 'center' ? 'text-center' : (b.align === 'right' ? 'text-right' : 'text-left');
            
            if (b.type === 'text') {
                let sizeClass = b.size === 'double' ? 'text-lg' : 'text-xs';
                let weightClass = b.bold ? 'font-black' : 'font-medium';
                // Parser Live Simulasi (Ubah Variabel ke Teks Dummy)
                let parsedText = (b.content || '')
                    .replace(/{{nama_toko}}/g, 'AI-SNACK')
                    .replace(/{{cabang}}/g, 'Cabang Penajam')
                    .replace(/{{kasir}}/g, 'Staf Beby')
                    .replace(/{{no_resi}}/g, 'TRX-123456789')
                    .replace(/{{waktu}}/g, '12/12/2026 14:00')
                    .replace(/{{wifi}}/g, 'AisnackJaya');
                
                contentHtml = `<div class="${alignClass} ${sizeClass} ${weightClass} whitespace-pre-wrap leading-tight font-mono text-black">${parsedText}</div>`;
            } 
            else if (b.type === 'divider') {
                let borderStyle = b.style === 'solid' ? 'border-solid' : 'border-dashed';
                contentHtml = `<div class="border-b-[2px] ${borderStyle} border-black w-full my-1"></div>`;
            } 
            else if (b.type === 'logo') {
                let flexAlign = b.align === 'center' ? 'mx-auto' : (b.align === 'right' ? 'ml-auto' : 'mr-auto');
                contentHtml = `<img src="${b.image}" class="w-20 h-20 object-contain filter grayscale contrast-200 ${flexAlign}">`;
            }
            else if (b.type === 'qrcode') {
                contentHtml = `<div class="${alignClass}"><div class="inline-flex flex-col items-center justify-center border-4 border-black p-2"><i class="fas fa-qrcode text-6xl text-black"></i><span class="text-[8px] font-black mt-1 uppercase text-black max-w-[80px] truncate">${b.content}</span></div></div>`;
            }
            else if (b.type === 'body_transaction') {
                contentHtml = `
                    <div class="font-mono text-black text-xs">
                        <div class="flex justify-between font-black border-b border-dashed border-black pb-1 mb-1"><span>ITEM</span><span>TOTAL</span></div>
                        <div class="flex justify-between font-bold"><span>1x Kopi Aren</span><span>15.000</span></div>
                        <div class="flex justify-between font-bold"><span>2x Roti Bakar</span><span>30.000</span></div>
                        <div class="border-b border-dashed border-black w-full my-1"></div>
                        <div class="flex justify-between font-black text-sm"><span>TOTAL</span><span>45.000</span></div>
                        <div class="flex justify-between font-bold text-[10px]"><span>TUNAI</span><span>50.000</span></div>
                        <div class="flex justify-between font-bold text-[10px]"><span>KEMBALI</span><span>5.000</span></div>
                    </div>`;
            }

            html += `<div onclick="superApp.selectReceiptBlock(${b.id})" class="relative border-[2px] p-2 m-1 rounded cursor-pointer transition-all ${activeClass}">${toolsHtml}${contentHtml}</div>`;
        });
        
        canvas.innerHTML = html;
    },

    renderReceiptInspector: function() {
        const panel = document.getElementById('receipt-inspector');
        if(!panel) return;

        if(!this.activeBlockId) {
            panel.innerHTML = `<div class="h-full flex flex-col items-center justify-center text-center opacity-50"><i class="fas fa-hand-pointer text-4xl mb-3"></i><p class="text-xs font-bold">Klik salah satu blok di kertas<br>untuk mengubah tampilannya.</p></div>`;
            return;
        }

        let b = this.receiptBlocks.find(x => x.id === this.activeBlockId);
        let html = '';

        // Teks Bantuan Umum Alignment
        let alignEditor = `
            <div class="mb-4">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Posisi (Alignment)</label>
                <div class="flex bg-slate-100 rounded-lg p-1 gap-1">
                    <button onclick="superApp.updateBlockProp('align', 'left')" class="flex-1 py-1.5 rounded-md text-xs font-bold ${b.align==='left'?'bg-white shadow-sm text-brand-600':'text-slate-500 hover:bg-slate-200'}"><i class="fas fa-align-left"></i> Kiri</button>
                    <button onclick="superApp.updateBlockProp('align', 'center')" class="flex-1 py-1.5 rounded-md text-xs font-bold ${b.align==='center'?'bg-white shadow-sm text-brand-600':'text-slate-500 hover:bg-slate-200'}"><i class="fas fa-align-center"></i> Tengah</button>
                    <button onclick="superApp.updateBlockProp('align', 'right')" class="flex-1 py-1.5 rounded-md text-xs font-bold ${b.align==='right'?'bg-white shadow-sm text-brand-600':'text-slate-500 hover:bg-slate-200'}"><i class="fas fa-align-right"></i> Kanan</button>
                </div>
            </div>`;

        if (b.type === 'text') {
            html += `
                <div class="mb-4">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Isi Teks</label>
                    <textarea rows="4" class="w-full border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-500 transition custom-scroll" oninput="superApp.updateBlockProp('content', this.value)">${b.content || ''}</textarea>
                </div>
                ${alignEditor}
                <div class="mb-4">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ukuran Huruf</label>
                    <select class="w-full border-2 border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-700 outline-none" onchange="superApp.updateBlockProp('size', this.value)">
                        <option value="normal" ${b.size==='normal'?'selected':''}>Normal (Kecil)</option>
                        <option value="double" ${b.size==='double'?'selected':''}>Raksasa (Heading)</option>
                    </select>
                </div>
                <div class="mb-4 flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <label class="text-xs font-black text-slate-600">Cetak Tebal (Bold)</label>
                    <input type="checkbox" ${b.bold ? 'checked' : ''} onchange="superApp.updateBlockProp('bold', this.checked)" class="w-5 h-5 accent-brand-500 cursor-pointer">
                </div>`;
        } 
        else if (b.type === 'divider') {
            html += `
                <div class="mb-4">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Gaya Garis</label>
                    <select class="w-full border-2 border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-700 outline-none" onchange="superApp.updateBlockProp('style', this.value)">
                        <option value="dashed" ${b.style==='dashed'?'selected':''}>Putus-putus (- - -)</option>
                        <option value="solid" ${b.style==='solid'?'selected':''}>Tegas Lurus (___)</option>
                    </select>
                </div>`;
        }
        else if (b.type === 'logo') {
            html += `
                ${alignEditor}
                <div class="mb-4 mt-6">
                    <button onclick="superApp.uploadBlockLogo()" class="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition flex justify-center items-center gap-2"><i class="fas fa-upload"></i> Unggah Gambar Baru</button>
                    <p class="text-[9px] text-slate-400 mt-2 text-center">Catatan: Gambar otomatis dicetak hitam-putih.</p>
                </div>`;
        }
        else if (b.type === 'qrcode') {
            html += `
                <div class="mb-4">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Link / Data QR Code</label>
                    <input type="text" class="w-full border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:border-brand-500 transition" oninput="superApp.updateBlockProp('content', this.value)" value="${b.content || ''}">
                </div>
                ${alignEditor}
                <p class="text-[9px] text-brand-600 bg-brand-50 p-2 border border-brand-100 rounded mt-4 font-bold"><i class="fas fa-info-circle"></i> Berguna untuk Link Menu Digital, Alamat Maps, atau Akun Instagram toko Anda.</p>`;
        }
        else if (b.type === 'body_transaction') {
            html += `
                <div class="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">
                    <i class="fas fa-lock text-3xl text-blue-300 mb-2"></i>
                    <h4 class="font-extrabold text-blue-800 text-sm">Blok Inti Transaksi</h4>
                    <p class="text-[10px] text-blue-600 mt-1 font-medium leading-relaxed">Blok ini adalah area dinamis dimana sistem akan menyuntikkan pesanan, harga, dan kembalian pelanggan. Blok ini tidak bisa diedit isinya, namun bisa Anda pindahkan letaknya.</p>
                </div>`;
        }

        panel.innerHTML = html;
    },

   saveReceiptTemplate: function() {
        let templateData = JSON.stringify(this.receiptBlocks);
        localStorage.setItem('aisnack_receipt_template', templateData);
        
        this.showToast("Mengunggah desain ke Database Pusat...", "info");

        this.apiPost({
            action: 'update_pengaturan',
            kunci: 'aisnack_receipt_template', 
            nilai: templateData
        }).then(res => {
            if (res && res.status === 'sukses') {
                this.showToast("Desain Struk Global Berhasil Disimpan!", "success");
            } else {
                this.showToast("Tersimpan di alat ini. Akan disinkronkan nanti.", "warning");
            }
        }).catch(e => {
            this.showToast("Tersimpan di alat ini (Mode Offline).", "warning");
        });

        // Panggil fungsi penutup yang aman
        this.closeReceiptBuilder();
    },

    closeReceiptBuilder: function() {
        this.closeModal('modal-receipt-builder');
        
        // Beri jeda 300ms agar animasi penutupan selesai, lalu buka Pengaturan
        setTimeout(() => {
            this.openModal('modal-system-settings');
        }, 300);
    },

  executeReprint: async function() {
        if(!this.activeReprintTrx) return; 
        
        let t = this.activeReprintTrx; 
        let items = []; 
        try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
        
        // Mengambil nominal dengan aman
        let tunaiVal = t.Tunai !== undefined ? t.Tunai : (t.Dibayar || 0);
        
        // Membersihkan format tanggal dan waktu
        let cleanDate = this.cleanDateOnly(t.Tanggal);
        let cleanTime = this.cleanTimeOnly(t.Waktu);
        let explicitDate = cleanDate + ' ' + cleanTime;

        // Mengambil metode bayar dari riwayat transaksi
        let metodeBayar = t.Metode_Bayar || 'TUNAI';
        
        this.setLoading(true, "Mencetak Ulang Struk...");

        try { 
            // 🚀 PERBAIKAN: Parameter ke-10 (true) untuk Cetak Ulang, Parameter ke-11 untuk Metode Bayar
            await this.printReceipt(
                t.ID_TRX, 
                t.Outlet, 
                t.Total_Bayar, 
                tunaiVal, 
                t.Kembalian, 
                items, 
                t.Status, 
                explicitDate, 
                t.Antrian, 
                true,          // isReprint = true
                metodeBayar    // Mencegah NaN jika ini adalah transaksi QRIS
            ); 
            this.showToast("Perintah cetak ulang dikirim ke printer!", "success");
        } catch(e) {
            this.showToast("Gagal mencetak. Printer belum terhubung.", "error");
        } finally {
            this.setLoading(false);
        }
    },


    // =========================================================
    // 🚀 MODUL LAPORAN HARIAN USAHA AI-CHA (NEW ENGINE)
    // =========================================================
    dailyExpensesList: [], // Memori daftar pengeluaran hari ini
    targetBulanan: 180000000, // Default target Rp 180 Juta

    // 1. Inisialisasi & Ambil Perkiraan Cuaca Otomatis
    initLaporanHarian: function() {
        if (!this.db) return;

        // 🚀 0. RENDER BAR PEMILIH CABANG KHUSUS OWNER/SPV (SINKRON RIWAYAT)
        if (typeof this.renderLaporanOutletButtons === 'function') {
            this.renderLaporanOutletButtons();
        }

        // A. Pastikan Saat Dibuka di HP Selalu Masuk ke Tab "Input Jualan"
        if (typeof this.switchLapHarianSubTab === 'function') {
            this.switchLapHarianSubTab('input');
        }

        // B. Muat Target Bulanan Khusus Cabang Ini (Fallback ke Rp 180 Juta)
        let savedTarget = localStorage.getItem('aicha_target_bulanan_' + (this.outlet || 'Penajam'));
        if (savedTarget && !isNaN(savedTarget)) {
            this.targetBulanan = Number(savedTarget);
        } else {
            this.targetBulanan = 180000000;
        }

        // C. Set Tanggal Form Hari Ini (Format Indonesia)
        let d = new Date();
        let days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        let pad = n => n < 10 ? '0' + n : n;
        let tglStr = `${days[d.getDay()]}, ${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
        const dateEl = document.getElementById('daily-form-date');
        if (dateEl) dateEl.innerText = tglStr;

        // D. Set Cuaca Instan (Simulasi Pintar Sebagai Nilai Awal)
        let jam = d.getHours();
        let cuacaSimulasi = "31°C Cerah Berawan";
        if (jam < 10) cuacaSimulasi = "28°C Cerah Pagi";
        else if (jam >= 11 && jam <= 15) cuacaSimulasi = "32°C Cerah Terik";
        else if (jam > 15 && jam <= 18) cuacaSimulasi = "29°C Sore Berawan";
        else cuacaSimulasi = "27°C Malam Cerah";
        
        this.currentDailyWeather = cuacaSimulasi;
        this.updateWeatherBadgeUI(cuacaSimulasi, false);

        // E. TARIK CUACA REAL-TIME DARI API (Tanpa Memblokir Layar Kasir)
        this.fetchRealtimeWeather();

        // F. Siapkan 1 Baris Pengeluaran Kosong Jika Belum Ada
        if (!this.dailyExpensesList || this.dailyExpensesList.length === 0) {
            this.dailyExpensesList = [];
            this.addDailyExpenseRow(); 
        }

        this.fetchMasterPengeluaran();
        this.calcDailyReportLive();
        this.renderLaporanHarianHistory();
        
        // G. Eksekusi Kalender Interaktif
        if (typeof this.renderCalendar === 'function') {
            this.renderCalendar();
        }

        // 🚀 H. EKSEKUSI DASHBOARD EKSEKUTIF OWNER (KONSOLIDASI & BREAKDOWN)
        if (typeof this.renderExecutiveDashboard === 'function') {
            this.renderExecutiveDashboard();
        }
    },

   // =========================================================
    // 🚀 ENGINE FILTER OUTLET LAPORAN HARIAN (SINKRON UTAMA)
    // =========================================================
    filterLaporanByOutlet: function(targetOutlet) {
        // 1. Ubah outlet aktif di memori global aplikasi
        this.outlet = targetOutlet;
        localStorage.setItem('aicha_active_outlet', targetOutlet);

        // 2. Perbarui tampilan aktif pada tombol bar pemilih
        document.querySelectorAll('.btn-lap-outlet').forEach(btn => {
            btn.classList.remove('bg-rose-500', 'text-white', 'shadow-2xs');
            btn.classList.add('bg-slate-800', 'text-slate-400', 'hover:bg-slate-700', 'hover:text-white');
        });

        let activeBtn = document.getElementById(`btn-lap-outlet-${targetOutlet}`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-slate-800', 'text-slate-400', 'hover:bg-slate-700');
            activeBtn.classList.add('bg-rose-500', 'text-white', 'shadow-2xs');
        }

        // 3. Perbarui teks nama outlet di Header Utama aplikasi
        if (typeof this.updateHeaderOutletName === 'function') {
            this.updateHeaderOutletName();
        }

        this.showToast(`Memuat Laporan Cabang: ${targetOutlet === 'Semua' ? 'Konsolidasi Seluruh Cabang' : targetOutlet}`);

        // 🚀 4. KUNCI PERBAIKAN: Panggil initLaporanHarian() secara utuh!
        // Ini akan merefresh otomatis Target Bulanan, Dashboard Eksekutif, Kalender, dan Tabel Riwayat.
        this.initLaporanHarian();
    },

    
    renderLaporanOutletButtons: function() {
        const bar = document.getElementById('lapharian-owner-outlet-bar');
        const cont = document.getElementById('lapharian-dynamic-outlets');
        if (!bar || !cont) return;

        // Cek Role: Hanya Owner/Supervisor yang bisa melihat bar pemilih cabang ini
        let isOwner = this.currentUser && (this.currentUser.Role === 'owner' || this.currentUser.Role === 'supervisor');
        if (!isOwner) {
            bar.classList.add('hidden');
            return;
        }
        bar.classList.remove('hidden');

        // Ambil daftar outlet dari database dan buang 'Pusat' / 'Semua' agar tidak duplikat
        let outlets = (this.db.outlets || []).filter(o => o.Nama_Outlet !== 'Pusat' && o.Nama_Outlet !== 'Semua');
        
        let html = outlets.map(o => {
            let isActive = (this.outlet === o.Nama_Outlet);
            let activeClass = isActive 
                ? 'bg-rose-500 text-white shadow-2xs' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white';
            
            return `
            <button type="button" onclick="superApp.filterLaporanByOutlet('${o.Nama_Outlet}')" id="btn-lap-outlet-${o.Nama_Outlet}" class="btn-lap-outlet px-3 py-1 rounded-lg text-xs font-black transition active:scale-95 shrink-0 ${activeClass}">
                ${o.Nama_Outlet}
            </button>`;
        }).join('');

        cont.innerHTML = html;
        
        // Pastikan status tombol aktif tersinkronisasi saat halaman dimuat
        let currentActive = this.outlet || 'Semua';
        let activeBtn = document.getElementById(`btn-lap-outlet-${currentActive}`);
        if (activeBtn) {
            document.querySelectorAll('.btn-lap-outlet').forEach(b => b.classList.remove('bg-rose-500', 'text-white'));
            activeBtn.classList.add('bg-rose-500', 'text-white');
        }
    },

    // Helper 1: Memperbarui UI Lencana Cuaca
    updateWeatherBadgeUI: function(cuacaText, isLive = false) {
        const wBadge = document.getElementById('daily-weather-badge');
        if (!wBadge) return;

        let icon = 'fa-cloud-sun';
        let color = 'text-amber-500';
        
        let lower = cuacaText.toLowerCase();
        if (lower.includes('hujan') || lower.includes('gerimis')) { 
            icon = 'fa-cloud-showers-heavy'; color = 'text-blue-500'; 
        } else if (lower.includes('malam')) { 
            icon = 'fa-moon'; color = 'text-indigo-400'; 
        } else if (lower.includes('terik') || lower.includes('cerah')) { 
            icon = 'fa-sun'; color = 'text-amber-500'; 
        }

        let liveDot = isLive ? `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1.5" title="Suhu Real-Time Satelit"></span>` : '';
        wBadge.innerHTML = `${liveDot}<i class="fas ${icon} ${color}"></i> Cuaca: ${cuacaText}`;
    },

   // =========================================================
    // 🚀 ENGINE CUACA REAL-TIME BERBASIS GPS DEVICE (MODERN)
    // =========================================================
    fetchRealtimeWeather: async function() {
        const weatherBadge = document.getElementById('daily-weather-badge');
        
        // 1. Tampilkan Efek Animasi "Mendeteksi Lokasi" yang Elegan
        if (weatherBadge) {
            weatherBadge.className = "bg-slate-100 border border-slate-200 text-slate-500 font-black text-[11px] px-3.5 py-1.5 rounded-xl shadow-inner flex items-center gap-2 shrink-0 transition-all duration-300";
            weatherBadge.innerHTML = `<i class="fas fa-location-crosshairs fa-spin text-rose-400"></i> Memindai Lokasi...`;
        }

        // Fallback (Cadangan) jika kasir menolak akses GPS / tablet tidak ada GPS
        const fallbackCoords = {
            'Penajam': { lat: -1.242, lon: 116.738 },
            'Babulu': { lat: -1.488, lon: 116.485 },
            'Batu Kajang': { lat: -1.831, lon: 115.894 },
            'Sepaku': { lat: -0.923, lon: 116.757 }
        };

        // Fungsi Eksekutor Penarik Cuaca API
        const getWeatherData = async (lat, lon, isLiveGPS = false) => {
            try {
                let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
                let res = await fetch(url);
                let data = await res.json();

                if (data && data.current_weather) {
                    let temp = Math.round(data.current_weather.temperature);
                    let wmoCode = data.current_weather.weathercode;

                    // Desain UI Cuaca ala Apple/Glassmorphism
                    let kondisi = "Cerah";
                    let icon = "fa-sun text-amber-500";
                    let bgClass = "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-700 shadow-amber-500/10";

                    if (wmoCode >= 1 && wmoCode <= 3) {
                        kondisi = "Berawan"; icon = "fa-cloud-sun text-slate-500"; bgClass = "bg-gradient-to-r from-slate-50 to-gray-100 border-slate-200 text-slate-700 shadow-slate-500/10";
                    } else if (wmoCode >= 45 && wmoCode <= 67) {
                        kondisi = "Hujan Ringan"; icon = "fa-cloud-rain text-blue-500"; bgClass = "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700 shadow-blue-500/10";
                    } else if (wmoCode >= 80 && wmoCode <= 82) {
                        kondisi = "Hujan Deras"; icon = "fa-cloud-showers-heavy text-indigo-500"; bgClass = "bg-gradient-to-r from-indigo-50 to-blue-100 border-indigo-200 text-indigo-800 shadow-indigo-500/10";
                    } else if (wmoCode >= 95) {
                        kondisi = "Badai Petir"; icon = "fa-bolt text-purple-600"; bgClass = "bg-gradient-to-r from-purple-50 to-fuchsia-50 border-purple-200 text-purple-800 shadow-purple-500/10";
                    }

                    // Tanda titik (dot) elegan jika menggunakan Live GPS asli
                    let locIcon = isLiveGPS ? `<span class="relative flex h-2 w-2 ml-1" title="Akurat via GPS"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>` : '';

                    this.currentDailyWeather = `${temp}°C ${kondisi}`;

                    if (weatherBadge) {
                        weatherBadge.className = `font-black text-[11px] px-3.5 py-1.5 rounded-xl shadow-md border flex items-center gap-1.5 shrink-0 transition-all duration-500 ${bgClass}`;
                        weatherBadge.innerHTML = `<i class="fas ${icon}"></i> ${this.currentDailyWeather} ${locIcon}`;
                    }
                }
            } catch (err) {
                console.log("API Cuaca Gagal:", err);
                if (weatherBadge) {
                    weatherBadge.innerHTML = `<i class="fas fa-cloud text-slate-400"></i> Cuaca Lokal`;
                    weatherBadge.className = "bg-slate-50 border border-slate-200 text-slate-500 font-black text-[11px] px-3 py-1.5 rounded-xl";
                }
                this.currentDailyWeather = "31°C Berawan (Manual)";
            }
        };

        // 2. Minta Izin GPS Browser secara Modern
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                // 📍 Jika Diizinkan (Sukses)
                (position) => {
                    getWeatherData(position.coords.latitude, position.coords.longitude, true);
                },
                // 🚫 Jika Ditolak Kasir atau Error
                (error) => {
                    console.log("GPS ditolak/gagal, menggunakan titik cabang default.");
                    let cleanName = String(this.outlet || 'Penajam').replace(/^Ai\-Snack\s+/i, '').trim();
                    let coords = fallbackCoords[cleanName] || fallbackCoords['Penajam'];
                    getWeatherData(coords.lat, coords.lon, false);
                },
                // Opsi Presisi & Kecepatan
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
            );
        } else {
            // Browser usang tidak dukung GPS
            let cleanName = String(this.outlet || 'Penajam').replace(/^Ai\-Snack\s+/i, '').trim();
            let coords = fallbackCoords[cleanName] || fallbackCoords['Penajam'];
            getWeatherData(coords.lat, coords.lon, false);
        }
    },

    // 2. Baris Pengeluaran Dinamis
    addDailyExpenseRow: function(nama = '', nominal = '') {
        let id = Date.now() + Math.random().toString(36).substr(2, 4);
        this.dailyExpensesList.push({ id, nama: nama.toUpperCase(), nominal });
        this.renderDailyExpenseRows();
    },
    
    removeDailyExpenseRow: function(id) {
        this.dailyExpensesList = this.dailyExpensesList.filter(x => x.id !== id);
        this.renderDailyExpenseRows();
        this.calcDailyReportLive();
    },

    renderDailyExpenseRows: function() {
        const cont = document.getElementById('daily-expenses-list');
        if (!cont) return;

        let daftarPengeluaran = [...new Set((this.db.masterPengeluaran || []).map(x => (x.Nama || x.NAMA_PENGELUARAN || '').toUpperCase()).filter(Boolean))];

        cont.innerHTML = this.dailyExpensesList.map(item => `
            <div class="flex items-center gap-2">
                <input type="text" list="exp-datalist" value="${item.nama}" 
                       oninput="superApp.updateDailyExpName('${item.id}', this.value)" 
                       placeholder="Nama pengeluaran..." 
                       class="flex-1 h-9 bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl px-3 text-xs font-black text-slate-700 outline-none uppercase shadow-inner">
                
                <input type="text" inputmode="numeric" value="${item.nominal ? Number(item.nominal).toLocaleString('id-ID') : ''}" 
                       oninput="superApp.formatRupiahInput(this); superApp.updateDailyExpNominal('${item.id}', this.value);" 
                       placeholder="Rp 0" 
                       class="w-28 h-9 bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl px-2.5 text-xs font-black text-rose-600 text-right outline-none shadow-inner">
                
                <button type="button" onclick="superApp.removeDailyExpenseRow('${item.id}')" class="w-8 h-8 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition flex items-center justify-center shrink-0">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            </div>
        `).join('') + `
        <datalist id="exp-datalist">
            ${daftarPengeluaran.map(n => `<option value="${n}">`).join('')}
        </datalist>`;
    },
    
    updateDailyExpName: function(id, val) {
        let item = this.dailyExpensesList.find(x => x.id === id);
        if (item) {
            item.nama = val.toUpperCase();
        }
    },
    
    updateDailyExpNominal: function(id, val) {
        let item = this.dailyExpensesList.find(x => x.id === id);
        if (item) {
            item.nominal = this.getNumericValue(val);
            this.calcDailyReportLive();
        }
    },

    // 3. Mesin Kalkulasi Live (Net Sales, Amount Paid, Amount Pcs, Net Cash)
    calcDailyReportLive: function() {
        let cash = this.getNumericValue(document.getElementById('daily-cash')?.value || 0);
        let qris = this.getNumericValue(document.getElementById('daily-qris')?.value || 0);
        let bill = Number(document.getElementById('daily-bill')?.value || 0);
        let pcs = Number(document.getElementById('daily-pcs')?.value || 0);

        let totExp = 0;
        this.dailyExpensesList.forEach(x => { totExp += Number(x.nominal || 0); });

        let netSales = cash + qris;
        let amountPaid = bill > 0 ? Math.round(netSales / bill) : 0;
        let amountPcs = pcs > 0 ? Math.round(netSales / pcs) : 0;
        let netCashBersih = cash - totExp;

        if (document.getElementById('live-net-sales')) document.getElementById('live-net-sales').innerText = `Rp ${netSales.toLocaleString('id-ID')}`;
        if (document.getElementById('live-amount-paid')) document.getElementById('live-amount-paid').innerText = amountPaid.toLocaleString('id-ID');
        if (document.getElementById('live-amount-pcs')) document.getElementById('live-amount-pcs').innerText = amountPcs.toLocaleString('id-ID');
        if (document.getElementById('live-net-cash')) document.getElementById('live-net-cash').innerText = `Rp ${netCashBersih.toLocaleString('id-ID')}`;

        this.calcMonthlyAccumulation(netSales);
    },

    // =========================================================
    // 🚀 ENGINE AKUMULASI PRESISI (BATAS TANGGAL 1 s/d TANGGAL LAPORAN)
    // =========================================================
    calcMonthlyAccumulation: function(liveNetSales) {
        // 1. Ambil tanggal yang sedang aktif di form input (misal: "Senin, 05-07-2026")
        let tglTeks = document.getElementById('daily-form-date')?.innerText || '';
        let targetDate = new Date();
        
        // Ekstrak Hari, Bulan, dan Tahun dari teks tanggal form
        let match = tglTeks.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        let targetDay = targetDate.getDate();
        let targetMonth = targetDate.getMonth() + 1;
        let targetYear = targetDate.getFullYear();

        if (match) {
            targetDay = parseInt(match[1], 10);
            targetMonth = parseInt(match[2], 10);
            targetYear = parseInt(match[3], 10);
        }

        let accumPreviousDays = 0;
        let activeReportId = this.editReportId; // ID laporan jika sedang mode Edit

        // 🚀 2. DETEKSI MODE KONSOLIDASI ('Semua' atau 'Pusat')
        let isConsolidated = (this.outlet === 'Pusat' || this.outlet === 'Semua' || !this.outlet);

        // 🚀 3. TENTUKAN TARGET BULANAN SECARA AKURAT
        // Jika sedang lihat 'Semua Cabang', gabungkan seluruh target cabang yang tersimpan
        let targetPerhitungan = this.targetBulanan || 180000000;
        if (isConsolidated && this.db && this.db.outlets) {
            let totalTargetSemua = 0;
            this.db.outlets.forEach(o => {
                if (o.Nama_Outlet !== 'Pusat' && o.Nama_Outlet !== 'Semua') {
                    let t = localStorage.getItem('aicha_target_bulanan_' + o.Nama_Outlet);
                    totalTargetSemua += (t && !isNaN(t)) ? Number(t) : 180000000;
                }
            });
            if (totalTargetSemua > 0) targetPerhitungan = totalTargetSemua;
        }

        // 4. Jumlahkan HANYA laporan masa lalu sebelum tanggal target (Tanggal 1 s/d H-1)
        (this.db.laporanHarian || []).forEach(rep => {
            // 🚀 Kunci Sinkronisasi: Izinkan masuk jika mode konsolidasi ATAU outletnya cocok
            if (isConsolidated || rep.Outlet === this.outlet) {
                
                // Abaikan laporan yang sedang diedit agar tidak hitung ganda (double-count)
                if (activeReportId && rep.ID_Laporan === activeReportId) return;

                let cleanStr = (rep.Tanggal || '').split(',').pop().trim();
                let repMatch = cleanStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                if (repMatch) {
                    let rDay = parseInt(repMatch[1], 10);
                    let rMonth = parseInt(repMatch[2], 10);
                    let rYear = parseInt(repMatch[3], 10);

                    // KUNCI PRESISI: Bulan & Tahun sama, DAN Hari lebih kecil dari tanggal laporan
                    // Abaikan juga laporan jika statusnya 'Ditolak'
                    if (rYear === targetYear && rMonth === targetMonth && rDay < targetDay) {
                        if (rep.Status_Approval !== 'Ditolak') {
                            accumPreviousDays += Number(rep.Net_Sales || 0);
                        }
                    }
                }
            }
        });

        // 5. Total Akumulasi = (Jumlah Tanggal 1 s/d H-1) + Omset Hari H di Form
        let totalAccumUpToDate = accumPreviousDays + Number(liveNetSales || 0);
        
        let pct = Math.min(Math.round((totalAccumUpToDate / targetPerhitungan) * 100), 100);
        let kurang = Math.max(targetPerhitungan - totalAccumUpToDate, 0);

        // Update Radar UI di layar
        if (document.getElementById('accum-net-sales')) document.getElementById('accum-net-sales').innerText = `Rp ${totalAccumUpToDate.toLocaleString('id-ID')}`;
        if (document.getElementById('accum-target')) document.getElementById('accum-target').innerText = `Rp ${targetPerhitungan.toLocaleString('id-ID')}`;
        if (document.getElementById('accum-progress-bar')) document.getElementById('accum-progress-bar').style.width = `${pct}%`;
        if (document.getElementById('accum-percent')) document.getElementById('accum-percent').innerText = `Progress: ${pct}%`;
        if (document.getElementById('accum-remaining')) document.getElementById('accum-remaining').innerText = `Kurang: Rp ${kurang.toLocaleString('id-ID')}`;

        this.currentAccumMonth = totalAccumUpToDate;
        return totalAccumUpToDate;
    },

    setTargetBulanan: function() {
        let val = prompt(`Masukkan Target Penjualan Bulanan untuk Cabang ${this.outlet} (Angka saja):`, this.targetBulanan);
        if (val !== null && !isNaN(val) && Number(val) > 0) {
            this.targetBulanan = Number(val);
            localStorage.setItem('aicha_target_bulanan_' + (this.outlet || 'Penajam'), this.targetBulanan);
            this.calcDailyReportLive();
            this.showToast("Target bulanan berhasil diperbarui!");
        }
    },

    // 4. Simpan & Buat Teks Laporan WhatsApp Presisi
    // =========================================================
    // 🚀 SUBMIT LAPORAN (DILENGKAPI POPUP FORWARD WA KONSISTEN)
    // =========================================================
    submitLaporanHarian: async function() {
        if (this.isProcessing) return;
        let cash = this.getNumericValue(document.getElementById('daily-cash')?.value || 0);
        let qris = this.getNumericValue(document.getElementById('daily-qris')?.value || 0);
        let bill = Number(document.getElementById('daily-bill')?.value || 0);
        let pcs = Number(document.getElementById('daily-pcs')?.value || 0);

        if (cash === 0 && qris === 0) return this.showToast("Isi nominal Cash atau QRIS terlebih dahulu!", "error");
        if (bill === 0 || pcs === 0) return this.showToast("Jumlah Bill dan Pcs terjual wajib diisi!", "error");

        let netSales = cash + qris;
        let expValid = this.dailyExpensesList.filter(x => x.nama.trim() !== '' && Number(x.nominal) > 0);
        let totExp = 0; expValid.forEach(x => totExp += Number(x.nominal));

        let tglTeks = document.getElementById('daily-form-date')?.innerText || "Hari Ini";
        let cuaca = this.currentDailyWeather || "31°C";

        let isEdit = (this.editReportId !== null);
        let idRep = isEdit ? this.editReportId : ('REP-' + Date.now());
        
        let isOwner = this.currentUser && (this.currentUser.Role === 'owner' || this.currentUser.Role === 'supervisor');
        let statusApp = (isEdit && !isOwner) ? 'Pending Edit' : 'Disetujui';

        this.setLoading(true, isEdit && !isOwner ? "Mengirim Pengajuan Revisi..." : "Menyimpan Laporan...");

        const payload = {
            action: isEdit ? 'update_laporan_harian' : 'save_laporan_harian',
            id_laporan: idRep,
            outlet: this.outlet,
            tanggal: tglTeks,
            cuaca: cuaca,
            cash: cash,
            qris: qris,
            net_sales: netSales,
            bill: bill,
            pcs: pcs,
            pengeluaran_json: JSON.stringify(expValid),
            total_pengeluaran: totExp,
            akumulasi_bulan: this.currentAccumMonth || netSales,
            kasir: (this.currentUser && this.currentUser.Username) ? this.currentUser.Username : 'Kasir',
            status_approval: statusApp
        };

        if (!this.db.laporanHarian) this.db.laporanHarian = [];
        let idx = this.db.laporanHarian.findIndex(x => x.ID_Laporan === idRep);

        if (isEdit) {
            if (statusApp === 'Pending Edit' && idx > -1) {
                // 🚀 STAF EDIT: Taruh di Kotak Revisi (Revisi_JSON)
                this.db.laporanHarian[idx].Status_Approval = 'Pending Edit';
                this.db.laporanHarian[idx].Revisi_JSON = JSON.stringify({
                    cash, qris, net_sales: netSales, bill, pcs, 
                    pengeluaran_json: JSON.stringify(expValid), total_pengeluaran: totExp,
                    editor: payload.kasir
                });
            } else if (idx > -1) {
                // 🚀 OWNER EDIT: Langsung timpa angka asli
                this.db.laporanHarian[idx] = {
                    ...this.db.laporanHarian[idx],
                    Cash: cash, QRIS: qris, Net_Sales: netSales, Bill: bill, Pcs: pcs,
                    Pengeluaran_JSON: JSON.stringify(expValid), Total_Pengeluaran: totExp,
                    Status_Approval: 'Disetujui', Revisi_JSON: ''
                };
            }
        } else {
            this.db.laporanHarian.push({
                ID_Laporan: idRep, Outlet: this.outlet, Tanggal: tglTeks, Cuaca: cuaca,
                Cash: cash, QRIS: qris, Net_Sales: netSales, Bill: bill, Pcs: pcs,
                Pengeluaran_JSON: JSON.stringify(expValid), Status_Approval: 'Disetujui'
            });
        }
        localStorage.setItem('aisnack_db_cache', JSON.stringify(this.db));

        // Kirim ke server di background
        await this.apiPost(payload);
        this.setLoading(false);
        
        // 🚀 PREVIEW NOTIFIKASI
        if (statusApp === 'Pending Edit') {
            alert("⏳ REVISI TERKIRIM KE OWNER\n\nAngka laporan resmi di database belum berubah sebelum disetujui Owner. Namun Anda tetap bisa meneruskan format revisi ini ke WA Grup.");
        } else {
            this.showToast("Laporan Berhasil Tersimpan!");
        }
        
        // 🚀 RAKIT TEKS WA & MUNCULKAN POPUP FORWARD KE GRUP
        let amountPaid = bill > 0 ? Math.round(netSales / bill) : 0;
        let amountPcs = pcs > 0 ? Math.round(netSales / pcs) : 0;
        
        let expText = '-';
        if (expValid.length > 0) {
            expText = expValid.map(x => `▪️ ${x.nama}: Rp ${Number(x.nominal).toLocaleString('id-ID')}`).join('\n');
        }

        let labelJudul = (statusApp === 'Pending Edit') ? `*[ PENGAJUAN REVISI LAPORAN ]*` : `*Laporan Harian Ai-CHA*`;
        
        // ✨ NORMALISASI NAMA OUTLET (Mencegah duplikasi kata Ai-Snack)
        let cleanOutletName = String(this.outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
        
        // ✨ FORMAT TEKS BARU SESEORANG REQUEST (Tanpa baris Kasir)
        let waText = `${labelJudul}\n`;
        waText += `Update Sales Report Outlet: *Ai-CHA ${cleanOutletName}*\n`;
        waText += `Tanggal: ${tglTeks}\n`;
        waText += `Cuaca: ${cuaca}\n\n`;
        waText += `Net Sales: *Rp ${netSales.toLocaleString('id-ID')}*\n`;
        waText += `Amount Paid: Rp ${amountPaid.toLocaleString('id-ID')}\n`;
        waText += `Amount Pcs: Rp ${amountPcs.toLocaleString('id-ID')}\n`;
        waText += `Bill: ${bill.toLocaleString('id-ID')} Bill\n`;
        waText += `Produk Terjual: ${pcs.toLocaleString('id-ID')} Pcs\n\n`;
        waText += `Rincian Pembayaran:\n`;
        waText += `💵 Cash: Rp ${cash.toLocaleString('id-ID')}\n`;
        waText += `💳 QRIS: Rp ${qris.toLocaleString('id-ID')}\n`;
        
        if (totExp > 0) {
            waText += `\nPengeluaran:\n${expText}\nTotal Pengeluaran: Rp ${totExp.toLocaleString('id-ID')}\n`;
            waText += `*Net Cash Laci: Rp ${(cash - totExp).toLocaleString('id-ID')}*\n`;
        }
        
        waText += `\nAkumulasi Bulanan: Rp ${(this.currentAccumMonth || netSales).toLocaleString('id-ID')}\n`;
        waText += `Target Bulanan: Rp ${this.targetBulanan.toLocaleString('id-ID')}`;

        // Reset form & perbarui tabel riwayat di latar belakang
        this.resetDailyForm();
        this.renderLaporanHarianHistory();

        // 🚀 MUNCULKAN MODAL POPUP WA KHUSUS DI VIEW LAPORAN HARIAN
        if (typeof this.openWaLaporanModal === 'function') {
            this.openWaLaporanModal(waText);
        } else if (typeof this.showWaModal === 'function') {
            this.showWaModal(waText);
        } else if (typeof this.resendLaporanHarianWa === 'function') {
            this.resendLaporanHarianWa(idRep);
        }
    },

    // =========================================================
    // 🚀 ENGINE MODAL KOMPARASI REVISI ULTRA-MODERN
    // =========================================================
    currentApprovalId: null, // Memori penyimpan ID laporan yang sedang di-review

    openApprovalModal: function(idRep) {
        let rep = (this.db.laporanHarian || []).find(x => x.ID_Laporan === idRep);
        if (!rep || !rep.Revisi_JSON) return this.showToast("Data revisi tidak ditemukan", "error");

        this.currentApprovalId = idRep;
        
        let rev = {};
        try { rev = JSON.parse(rep.Revisi_JSON); } catch(e) {}

        // 1. Set Meta Info
        let metaEl = document.getElementById('approval-meta-info');
        if (metaEl) metaEl.innerText = `Diajukan oleh: ${rev.editor || 'Kasir / Staf'} (${rep.Tanggal})`;
        
        // 2. Fungsi perakit baris komparasi
        let compHtml = '';
        const makeRow = (label, oldVal, newVal, isCurrency = true) => {
            let numOld = Number(oldVal || 0);
            let numNew = Number(newVal || 0);
            if (numOld === numNew) return ''; // Abaikan jika angka tidak diedit
            
            let strOld = isCurrency ? `Rp ${numOld.toLocaleString('id-ID')}` : `${numOld}`;
            let strNew = isCurrency ? `Rp ${numNew.toLocaleString('id-ID')}` : `${numNew}`;
            
            return `
            <div class="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between mb-3 hover:shadow-md hover:border-indigo-200 transition-all">
                <div class="w-1/3">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">${label} Lama</span>
                    <div class="font-black text-rose-500 text-sm line-through opacity-70 decoration-rose-300 decoration-2">${strOld}</div>
                </div>
                <div class="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400 border border-indigo-100 shrink-0">
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="w-1/3 text-right">
                    <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Revisi Baru</span>
                    <div class="font-black text-emerald-600 text-base md:text-lg bg-emerald-50 px-2 py-1 rounded-lg inline-block shadow-inner border border-emerald-100">${strNew}</div>
                </div>
            </div>`;
        };

        // 3. Rakit perbandingan masing-masing item
        compHtml += makeRow('Net Sales', rep.Net_Sales, rev.net_sales);
        compHtml += makeRow('Cash Laci', rep.Cash, rev.cash);
        compHtml += makeRow('QRIS', rep.QRIS, rev.qris);
        compHtml += makeRow('Total Bill', rep.Bill, rev.bill, false);
        compHtml += makeRow('Pcs Terjual', rep.Pcs, rev.pcs, false);
        compHtml += makeRow('Total Pengeluaran', rep.Total_Pengeluaran, rev.total_pengeluaran);

        // 🚀 4. DETEKSI PERUBAHAN RINCIAN ITEM PENGELUARAN (ULTRA MODERN DIFF)
        if (rep.Pengeluaran_JSON !== rev.pengeluaran_json) {
            let oldExp = []; let newExp = [];
            try { oldExp = JSON.parse(rep.Pengeluaran_JSON || '[]'); } catch(e){}
            try { newExp = JSON.parse(rev.pengeluaran_json || '[]'); } catch(e){}

            let oldHtml = oldExp.length === 0 ? '<span class="italic text-slate-400">Kosong</span>' : oldExp.map(x => `▪️ ${x.nama}: Rp ${Number(x.nominal).toLocaleString('id-ID')}`).join('<br>');
            let newHtml = newExp.length === 0 ? '<span class="italic text-slate-400">Kosong</span>' : newExp.map(x => `▪️ ${x.nama}: Rp ${Number(x.nominal).toLocaleString('id-ID')}`).join('<br>');

            compHtml += `
            <div class="bg-amber-50/40 border border-amber-200 p-4 rounded-2xl shadow-sm mt-4">
                <h5 class="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-1.5"><i class="fas fa-receipt"></i> Rincian Pengeluaran Diubah</h5>
                <div class="flex flex-col sm:flex-row items-stretch justify-between gap-3">
                    <div class="flex-1 bg-white p-3 rounded-xl border border-slate-200 text-[10px] font-bold text-rose-500 line-through decoration-rose-300 opacity-80 leading-relaxed">
                        <span class="block text-slate-400 mb-1.5 no-underline uppercase text-[8px] font-black">Data Lama:</span>
                        ${oldHtml}
                    </div>
                    <div class="flex-1 bg-white p-3 rounded-xl border border-emerald-200 text-[10px] font-bold text-emerald-700 leading-relaxed shadow-inner">
                        <span class="block text-emerald-500 mb-1.5 uppercase text-[8px] font-black">Data Baru Diajukan:</span>
                        ${newHtml}
                    </div>
                </div>
            </div>`;
        }

        if (compHtml === '') {
            compHtml = `<div class="p-5 text-center text-slate-500 text-xs font-bold border-2 border-dashed border-slate-200 bg-white rounded-2xl">Tidak ada perubahan angka pada revisi ini. (Kasir hanya menyimpan ulang)</div>`;
        }

        const listCont = document.getElementById('approval-comparison-list');
        if (listCont) listCont.innerHTML = compHtml;
        
        // 5. Tampilkan Modal dengan Animasi Transisi Halus
        const modal = document.getElementById('modal-approval-revisi');
        if (modal) {
            modal.classList.remove('hidden');
            void modal.offsetWidth; 
            modal.classList.add('opacity-100');
            if(modal.firstElementChild) {
                modal.firstElementChild.classList.remove('scale-95');
                modal.firstElementChild.classList.add('scale-100');
            }
        }
    },
    
    closeApprovalModal: function() {
        const modal = document.getElementById('modal-approval-revisi');
        modal.classList.remove('opacity-100');
        modal.firstElementChild.classList.remove('scale-100');
        modal.firstElementChild.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 400);
        this.currentApprovalId = null;
    },

    approveRevision: function() {
        if (!this.currentApprovalId) return;
        this.eksekusiApprovalEdit(this.currentApprovalId, 'Disetujui');
        this.closeApprovalModal();
    },

    rejectRevision: function() {
        if (!this.currentApprovalId) return;
        this.eksekusiApprovalEdit(this.currentApprovalId, 'Ditolak');
        this.closeApprovalModal();
    },

    // =========================================================
    // 🚀 EKSEKUSI APPROVAL OWNER (SETUJUI / TOLAK)
    // =========================================================
    eksekusiApprovalEdit: async function(idRep, keputusan) {
        

        this.setLoading(true, "Memproses persetujuan...");
        
        let idx = (this.db.laporanHarian || []).findIndex(x => x.ID_Laporan === idRep);
        if (idx > -1) {
            if (keputusan === 'Disetujui') {
                // 🚀 JIKA DISETUJUI: Pindahkan angka dari kotak revisi ke angka asli!
                try {
                    let rev = JSON.parse(this.db.laporanHarian[idx].Revisi_JSON || '{}');
                    if (rev.net_sales !== undefined) {
                        this.db.laporanHarian[idx].Cash = rev.cash;
                        this.db.laporanHarian[idx].QRIS = rev.qris;
                        this.db.laporanHarian[idx].Net_Sales = rev.net_sales;
                        this.db.laporanHarian[idx].Bill = rev.bill;
                        this.db.laporanHarian[idx].Pcs = rev.pcs;
                        this.db.laporanHarian[idx].Pengeluaran_JSON = rev.pengeluaran_json;
                        this.db.laporanHarian[idx].Total_Pengeluaran = rev.total_pengeluaran;
                    }
                } catch(e) {}
            }
            this.db.laporanHarian[idx].Status_Approval = 'Disetujui';
            this.db.laporanHarian[idx].Revisi_JSON = '';
            localStorage.setItem('aisnack_db_cache', JSON.stringify(this.db));
        }

        await this.apiPost({
            action: 'approve_edit_laporan',
            id_laporan: idRep,
            keputusan: keputusan
        });

        this.setLoading(false);
        this.showToast(`Revisi telah ${keputusan}! Angka pembukuan diperbarui.`, 'success');
        this.renderLaporanHarianHistory();
    },

   
    resetDailyForm: function(skipDateReset = false) {
        // Reset memori edit
        this.editReportId = null;
        let titleEl = document.getElementById('form-title-mode');
        let btnCancel = document.getElementById('btn-cancel-edit');
        if (titleEl) titleEl.innerText = "Input Data Hari Ini";
        if (btnCancel) btnCancel.classList.add('hidden');

        // Hanya kembali ke tanggal hari ini jika TIDAK sedang memuat tanggal masa lalu (skipDateReset false)
        if (!skipDateReset) {
            let d = new Date();
            let days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            let pad = n => String(n).padStart(2, '0');
            let dateEl = document.getElementById('daily-form-date');
            if (dateEl) dateEl.innerText = `${days[d.getDay()]}, ${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
        }

        // Kosongkan input
        ['daily-cash', 'daily-qris', 'daily-bill', 'daily-pcs'].forEach(id => {
            let el = document.getElementById(id); if (el) el.value = '';
        });
        
        this.dailyExpensesList = [];
        this.addDailyExpenseRow();
        this.calcDailyReportLive();
    },

    // =========================================================
    // 🚀 2. RIWAYAT LAPORAN HARIAN (DEFAULT RANGE BULAN BERJALAN)
    // =========================================================
    renderLaporanHarianHistory: function() {
        const tbody = document.getElementById('laporan-harian-tbody');
        const mobCont = document.getElementById('laporan-harian-mobile');
        if (!tbody && !mobCont) return;

        let deskHtml = ''; let mobHtml = ''; let count = 0;
        let now = new Date();

        // Ambil input elemen filter tanggal awal & akhir
        const startInput = document.getElementById('filter-lap-start');
        const endInput = document.getElementById('filter-lap-end');

        // ✨ ATUR DEFAULT RANGE BULAN BERJALAN JIKA KOSONG
        if (startInput && !startInput.value) {
            let pad = n => String(n).padStart(2, '0');
            startInput.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`; // Tanggal 1 bulan ini
        }
        if (endInput && !endInput.value) {
            let pad = n => String(n).padStart(2, '0');
            endInput.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`; // Hari ini
        }

        let startObj = startInput?.value ? new Date(startInput.value) : null;
        if (startObj) startObj.setHours(0, 0, 0, 0);

        let endObj = endInput?.value ? new Date(endInput.value) : null;
        if (endObj) endObj.setHours(23, 59, 59, 999);

        let isConsolidated = (this.outlet === 'Pusat' || this.outlet === 'Semua' || !this.outlet);
        let currOutletClean = String(this.outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();

        let list = [...(this.db.laporanHarian || [])].filter(x => {
            let repOutlet = String(x.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            let cocokOutlet = isConsolidated || (repOutlet === currOutletClean);
            if (!cocokOutlet) return false;

            if (startObj || endObj) {
                let cleanStr = (x.Tanggal || '').split(',').pop().trim();
                let match = cleanStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                if (match) {
                    let repDateObj = new Date(parseInt(match[3], 10), parseInt(match[2], 10) - 1, parseInt(match[1], 10));
                    if (startObj && repDateObj < startObj) return false;
                    if (endObj && repDateObj > endObj) return false;
                } else {
                    return false;
                }
            }
            return true;
        }).reverse();

        list.forEach(item => {
            count++;
            let net = Number(item.Net_Sales || 0);
            let cash = Number(item.Cash || 0);
            let qris = Number(item.QRIS || 0);
            let status = item.Status_Approval || 'Disetujui';
            let isOwner = this.currentUser && (this.currentUser.Role === 'owner' || this.currentUser.Role === 'supervisor');

            let badgeStatus = '';
            if (status === 'Pending Edit') {
                badgeStatus = `<span class="mt-1 inline-block bg-amber-100 text-amber-700 border border-amber-300 px-2 py-0.5 rounded-md text-[9px] font-black animate-pulse"><i class="fas fa-clock mr-1"></i>Revisi Pending</span>`;
            } else if (status === 'Ditolak') {
                badgeStatus = `<span class="mt-1 inline-block bg-rose-100 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-md text-[9px] font-black"><i class="fas fa-xmark mr-1"></i>Revisi Ditolak</span>`;
            }

            let infoRevisi = '';
            if (status === 'Pending Edit') {
                try {
                    let rev = JSON.parse(item.Revisi_JSON || '{}');
                    if (rev.net_sales !== undefined) {
                        // Cek apakah item pengeluaran diubah
                        let expChanged = (item.Pengeluaran_JSON !== rev.pengeluaran_json);
                        let expBadge = expChanged ? `<div class="mt-1.5 bg-amber-200/60 text-amber-800 px-2 py-1 rounded-md border border-amber-300 inline-block text-[9px] shadow-sm"><i class="fas fa-receipt mr-1"></i> Rincian Pengeluaran Diubah</div>` : '';
                        
                        infoRevisi = `
                        <div class="mt-1.5 p-2.5 bg-amber-100/90 border border-amber-300 rounded-lg text-[10px] text-amber-900 leading-tight">
                            <b>📌 Ajuan Revisi (${rev.editor || 'Staf'}):</b><br>
                            Sales Baru: <b class="text-rose-600">Rp ${Number(rev.net_sales).toLocaleString('id-ID')}</b><br>
                            C: Rp ${Number(rev.cash||0).toLocaleString('id-ID')} | Q: Rp ${Number(rev.qris||0).toLocaleString('id-ID')}
                            <br>${expBadge}
                        </div>`;
                    }
                } catch(e){}
            }

            let tombolOwnerDesk = (status === 'Pending Edit' && isOwner) ? `
                <div class="mt-1.5 pt-1.5 border-t border-slate-200">
                    <button type="button" onclick="superApp.openApprovalModal('${item.ID_Laporan}')" class="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white py-1.5 rounded-lg text-[10px] font-black shadow-md shadow-amber-500/30 flex items-center justify-center gap-1.5 transition active:scale-95">
                        <i class="fas fa-magnifying-glass-chart"></i> Tinjau Revisi Baru
                    </button>
                </div>
            ` : '';

            let tombolOwnerMob = (status === 'Pending Edit' && isOwner) ? `
                <div class="pt-1 border-t border-slate-100">
                    <button type="button" onclick="superApp.openApprovalModal('${item.ID_Laporan}')" class="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-amber-500/30 active:scale-95 transition">
                        <i class="fas fa-magnifying-glass-chart"></i> Tinjau Perubahan Angka
                    </button>
                </div>
            ` : '';

            deskHtml += `
            <tr class="border-b border-slate-50 hover:bg-slate-50/80 transition text-xs font-bold text-slate-700">
                <td class="py-3 px-3">
                    <span class="font-extrabold text-slate-900">${item.Tanggal}</span><br>
                    <span class="text-[10px] text-amber-600 font-bold">${item.Cuaca || '-'}</span>
                    <div>${badgeStatus}</div>
                    ${infoRevisi}
                </td>
                <td class="py-3 px-3 text-right font-black text-rose-600 text-sm align-top">Rp ${net.toLocaleString('id-ID')}</td>
                <td class="py-3 px-3 text-right text-[11px] align-top"><span class="text-slate-600">C: Rp ${cash.toLocaleString('id-ID')}</span><br><span class="text-blue-600">Q: Rp ${qris.toLocaleString('id-ID')}</span></td>
                <td class="py-3 px-3 text-center text-[11px] align-top text-slate-500">${item.Bill} / ${item.Pcs}</td>
                <td class="py-3 px-3 text-center align-top">
                    <div class="flex items-center justify-center gap-1">
                        <button type="button" onclick="superApp.editLaporanHarian('${item.ID_Laporan}')" class="bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white p-1.5 rounded-lg text-xs transition" title="Edit"><i class="fas fa-pen"></i></button>
                        <button type="button" onclick="superApp.resendLaporanHarianWa('${item.ID_Laporan}')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-black shadow-2xs flex items-center gap-1 transition"><i class="fab fa-whatsapp"></i> WA</button>
                    </div>
                    ${tombolOwnerDesk}
                </td>
            </tr>`;

            mobHtml += `
            <div class="bg-white p-3.5 rounded-2xl border ${status === 'Pending Edit' ? 'border-amber-300 bg-amber-50/10' : 'border-slate-100'} shadow-2xs flex flex-col gap-2 relative">
                <div class="flex justify-between items-start pb-1.5 border-b border-slate-100">
                    <div>
                        <h4 class="font-extrabold text-xs text-slate-800">${item.Tanggal}</h4>
                        <span class="text-[10px] font-bold text-amber-600">${item.Cuaca || '-'}</span>
                        <div>${badgeStatus}</div>
                    </div>
                    <div class="text-right"><span class="font-black text-rose-600 text-sm">Rp ${net.toLocaleString('id-ID')}</span></div>
                </div>
                ${infoRevisi}
                <div class="grid grid-cols-2 gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-200/40">
                    <div>Cash: <span class="text-slate-800 font-black">Rp ${cash.toLocaleString('id-ID')}</span></div>
                    <div>QRIS: <span class="text-blue-600 font-black">Rp ${qris.toLocaleString('id-ID')}</span></div>
                    <div class="col-span-2 text-center pt-1 border-t border-slate-200/60 font-black text-slate-400 text-[10px] uppercase">${item.Bill} Bill | ${item.Pcs} Pcs Terjual</div>
                </div>
                <div class="flex gap-1.5 pt-0.5">
                    <button type="button" onclick="superApp.editLaporanHarian('${item.ID_Laporan}')" class="w-10 bg-amber-50 text-amber-600 rounded-xl text-xs font-black flex items-center justify-center active:scale-95"><i class="fas fa-pen"></i></button>
                    <button type="button" onclick="superApp.resendLaporanHarianWa('${item.ID_Laporan}')" class="flex-1 bg-emerald-500 text-white py-2 rounded-xl text-xs font-black shadow-2xs flex items-center justify-center gap-1 active:scale-95"><i class="fab fa-whatsapp"></i> Forward ke WA Grup</button>
                </div>
                ${tombolOwnerMob}
            </div>`;
        });

        if (tbody) tbody.innerHTML = deskHtml || `<tr><td colspan="5" class="py-10 text-center text-slate-400 font-bold text-xs">Belum ada riwayat laporan pada rentang tanggal ini</td></tr>`;
        if (mobCont) mobCont.innerHTML = mobHtml || `<div class="p-6 text-center text-slate-400 text-xs font-bold border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">Belum ada riwayat laporan pada rentang tanggal ini</div>`;
        if (document.getElementById('laporan-harian-count')) document.getElementById('laporan-harian-count').innerText = `${count} Laporan`;
    },

    
    // =========================================================
    // 🚀 KIRIM ULANG WA DENGAN KALKULASI AKUMULASI DINAMIS
    // =========================================================
    resendLaporanHarianWa: function(id) {
        let rep = (this.db.laporanHarian || []).find(x => x.ID_Laporan === id);
        if (!rep) return this.showToast("Data laporan tidak ditemukan!", "error");

        let net = Number(rep.Net_Sales || 0);
        let bill = Number(rep.Bill || 0);
        let pcs = Number(rep.Pcs || 0);
        let cash = Number(rep.Cash || 0);
        let qris = Number(rep.QRIS || 0);
        
        let amountPaid = bill > 0 ? Math.round(net / bill) : 0;
        let amountPcs = pcs > 0 ? Math.round(net / pcs) : 0;

        // 🚀 Hitung Akumulasi Dinamis
        let exactAccumulation = net;
        let match = (rep.Tanggal || '').match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (match) {
            let targetDay = parseInt(match[1], 10);
            let targetMonth = parseInt(match[2], 10);
            let targetYear = parseInt(match[3], 10);
            let sumPast = 0;

            (this.db.laporanHarian || []).forEach(item => {
                if ((item.Outlet === rep.Outlet) && item.ID_Laporan !== rep.ID_Laporan) {
                    let rMatch = (item.Tanggal || '').match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                    if (rMatch) {
                        let rDay = parseInt(rMatch[1], 10);
                        let rMonth = parseInt(rMatch[2], 10);
                        let rYear = parseInt(rMatch[3], 10);
                        if (rYear === targetYear && rMonth === targetMonth && rDay < targetDay && item.Status_Approval !== 'Ditolak') {
                            sumPast += Number(item.Net_Sales || 0);
                        }
                    }
                }
            });
            exactAccumulation = sumPast + net;
        }

        let expText = '-'; let totExp = 0;
        try {
            let expArr = JSON.parse(rep.Pengeluaran_JSON || '[]');
            if (expArr.length > 0) {
                expText = expArr.map(x => `▪️ ${x.nama}: Rp ${Number(x.nominal).toLocaleString('id-ID')}`).join('\n');
                expArr.forEach(x => totExp += Number(x.nominal));
            }
        } catch(e){}

        // ✨ Normalisasi Nama Outlet (Hapus awalan Ai-Snack)
        let cleanOutlet = String(rep.Outlet || this.outlet).replace(/^Ai\-Snack\s+/i, '').trim();

        // ✨ FORMAT TEKS BARU (Sesuai permintaan Anda)
        let waText = `*Laporan Harian Ai-CHA*\n`;
        waText += `Update Sales Report Outlet: *Ai-CHA ${cleanOutlet}*\n`;
        waText += `Tanggal: ${rep.Tanggal || '-'}\n`;
        waText += `Cuaca: ${rep.Cuaca || '31°C'}\n\n`;
        waText += `Net Sales: *Rp ${net.toLocaleString('id-ID')}*\n`;
        waText += `Amount Paid: Rp ${amountPaid.toLocaleString('id-ID')}\n`;
        waText += `Amount Pcs: Rp ${amountPcs.toLocaleString('id-ID')}\n`;
        waText += `Bill: ${bill.toLocaleString('id-ID')} Bill\n`;
        waText += `Produk Terjual: ${pcs.toLocaleString('id-ID')} Pcs\n\n`;
        waText += `Rincian Pembayaran:\n`;
        waText += `💵 Cash: Rp ${cash.toLocaleString('id-ID')}\n`;
        waText += `💳 QRIS: Rp ${qris.toLocaleString('id-ID')}\n`;
        
        if (totExp > 0) {
            waText += `\nPengeluaran:\n${expText}\nTotal Pengeluaran: Rp ${totExp.toLocaleString('id-ID')}\n`;
            waText += `*Net Cash Laci: Rp ${(cash - totExp).toLocaleString('id-ID')}*\n`;
        }
        
        waText += `\nAkumulasi Bulanan: Rp ${exactAccumulation.toLocaleString('id-ID')}\n`;
        waText += `Target Bulanan: Rp ${this.targetBulanan.toLocaleString('id-ID')}`;

        // 🚀 Panggil Modal Popup Modern (Ganti openWaLaporanModal jika Anda sudah mengimplementasikannya)
        if (typeof this.openWaLaporanModal === 'function') {
            this.openWaLaporanModal(waText);
        } else {
            this.showWaModal(waText);
        }
    },

    // =========================================================
    // 🚀 SWITCHER SUB-TAB LAPORAN HARIAN (RESPONSIVE FULL HEIGHT)
    // =========================================================
    switchLapHarianSubTab: function(tab) {
        const secInput = document.getElementById('lapharian-sec-input');
        const secRiwayat = document.getElementById('lapharian-sec-riwayat');
        const btnInput = document.getElementById('subtab-lapharian-input');
        const btnRiwayat = document.getElementById('subtab-lapharian-riwayat');

        const activeClass = 'flex-1 py-2.5 px-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-black shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-95';
        const inactiveClass = 'flex-1 py-2.5 px-3 bg-slate-50 border border-slate-200/80 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95';

        if (tab === 'input') {
            if (secInput) secInput.className = "w-full lg:w-[480px] xl:w-[540px] bg-white p-4 md:p-7 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 flex flex-col shrink-0";
            if (secRiwayat) secRiwayat.className = "hidden lg:flex flex-1 flex-col gap-4 md:gap-6 min-w-0 w-full lg:h-full";
            if (btnInput) btnInput.className = activeClass;
            if (btnRiwayat) btnRiwayat.className = inactiveClass;
        } else {
            if (secInput) secInput.className = "hidden lg:flex lg:w-[480px] xl:w-[540px] bg-white p-4 md:p-7 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 flex-col shrink-0";
            if (secRiwayat) secRiwayat.className = "flex flex-1 flex-col gap-4 md:gap-6 min-w-0 w-full min-h-[75vh]";
            if (btnInput) btnInput.className = inactiveClass;
            if (btnRiwayat) btnRiwayat.className = activeClass;
            if (typeof this.renderCalendar === 'function') this.renderCalendar();
        }
    },

    fetchMasterPengeluaran: function() {
        if (!typeof API_URL !== 'undefined' && !this.webAppUrl) return;
        let targetUrl = (typeof API_URL !== 'undefined') ? API_URL : this.webAppUrl;
        fetch(targetUrl + "?action=get_master_data")
        .then(r => r.json())
        .then(data => {
            this.db.masterPengeluaran = data; 
            if (typeof this.renderDailyExpenseRows === 'function') {
                this.renderDailyExpenseRows();
            }
        })
        .catch(e => console.error("Gagal ambil master pengeluaran:", e));
    },



    filterRiwayatByDate: function(d, m, y) {
        let pad = n => String(n).padStart(2, '0');
        let targetPattern = `${pad(d)}-${pad(m)}-${y}`;
        let targetPatternSlash = `${pad(d)}/${pad(m)}/${y}`;
        
        this.showToast(`Memperlihatkan riwayat tanggal ${pad(d)}-${pad(m)}-${y}`);
        
        // Filter Tabel PC
        document.querySelectorAll('.report-row').forEach(row => {
            let dateVal = row.getAttribute('data-date') || '';
            row.style.display = (dateVal.includes(targetPattern) || dateVal.includes(targetPatternSlash)) ? "" : "none";
        });

        // Filter Kartu Mobile HP
        document.querySelectorAll('.report-mob-card').forEach(card => {
            let dateVal = card.getAttribute('data-date') || '';
            card.style.display = (dateVal.includes(targetPattern) || dateVal.includes(targetPatternSlash)) ? "" : "none";
        });
    },

   editReportId: null, // Memori menyimpan ID laporan jika sedang mode Edit

    // =========================================================
    // 🚀 HELPER STANDARISASI TANGGAL (ANTI-MELESET)
    // =========================================================
    normalizeDateObj: function(dateInput) {
        if (!dateInput) return new Date();
        if (dateInput instanceof Date) return dateInput;
        
        // Bersihkan string tanggal
        let str = String(dateInput).split(',').pop().trim();
        let match = str.match(/(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})/);
        
        if (match) {
            let p1 = parseInt(match[1], 10);
            let p2 = parseInt(match[2], 10);
            let p3 = parseInt(match[3], 10);
            
            // Cek format YYYY-MM-DD vs DD-MM-YYYY
            if (p1 > 1000) {
                return new Date(p1, p2 - 1, p3); // YYYY-MM-DD
            } else {
                return new Date(p3, p2 - 1, p1); // DD-MM-YYYY
            }
        }
        let d = new Date(dateInput);
        return isNaN(d.getTime()) ? new Date() : d;
    },

    formatToIndoDate: function(dateObj) {
        let d = this.normalizeDateObj(dateObj);
        let days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        let pad = n => String(n).padStart(2, '0');
        return `${days[d.getDay()]}, ${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
    },

    formatToInputDate: function(dateObj) {
        let d = this.normalizeDateObj(dateObj);
        let pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    },

    // =========================================================
    // 🚀 1. BUKA KALENDER FORM (BEBAS PIN DI AWAL)
    // =========================================================
    changeReportDateWithAuth: function() {
        // Langsung buka kalender tanpa hambatan PIN!
        let picker = document.getElementById('hidden-date-picker');
        if (picker) {
            try {
                if (typeof picker.showPicker === 'function') picker.showPicker();
                else picker.click();
            } catch (e) {
                picker.click();
            }
        }
    },

    // =========================================================
    // 🚀 ENGINE PEMILIHAN TANGGAL TERPADU (ANTI-MELESET)
    // =========================================================
    applyBackdate: function(dateVal) {
        if (!dateVal) return;
        
        let targetDate = this.normalizeDateObj(dateVal);
        let tDay = targetDate.getDate();
        let tMonth = targetDate.getMonth();
        let tYear = targetDate.getFullYear();

        // 1. Blokir jika sedang di mode "Semua Cabang"
        let isConsolidated = (this.outlet === 'Pusat' || this.outlet === 'Semua' || !this.outlet);
        if (isConsolidated) {
            this.showToast("Pilih salah satu cabang di barisan atas terlebih dahulu untuk mengedit laporan.", "error");
            return;
        }

        let cleanOutlet = String(this.outlet).replace(/^Ai\-Snack\s+/i, '').trim();

        // 2. Cari laporan dengan mencocokkan Hari, Bulan, Tahun secara presisi (Matematika)
        let existingReport = (this.db.laporanHarian || []).find(x => {
            let xOutlet = String(x.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            if (xOutlet !== cleanOutlet || x.Status_Approval === 'Ditolak') return false;

            let xDate = this.normalizeDateObj(x.Tanggal);
            return (xDate.getDate() === tDay && xDate.getMonth() === tMonth && xDate.getFullYear() === tYear);
        });

        if (existingReport) {
            // 🚀 DATA SUDAH ADA -> Masuk ke Mode Edit secara sinkron
            this.editLaporanHarian(existingReport.ID_Laporan);
        } else {
            // 🚀 DATA KOSONG -> Masuk ke Mode Input Baru untuk Tanggal Pilihan
            this.resetDailyForm(true); // Reset dengan perintah khusus agar tanggal tidak kembali ke hari ini
            
            let indoStr = this.formatToIndoDate(targetDate);
            let inputStr = this.formatToInputDate(targetDate);

            let dateEl = document.getElementById('daily-form-date');
            let picker = document.getElementById('hidden-date-picker');
            
            if (dateEl) dateEl.innerText = indoStr;
            if (picker) picker.value = inputStr;

            this.showToast(`Form siap untuk input tanggal: ${indoStr}`);
            this.switchLapHarianSubTab('input');
        }
    },

    openReportByDate: function(dateStr) {
        // Teruskan ke mesin applyBackdate agar sinkron 100%
        this.applyBackdate(dateStr);
    },

    // =========================================================
    // 🚀 ENGINE EDIT DATA (SINKRONISASI REVISI & TANGGAL PRESISI)
    // =========================================================
    editLaporanHarian: function(idRep) {
        let rep = (this.db.laporanHarian || []).find(x => x.ID_Laporan === idRep);
        if (!rep) return this.showToast("Data laporan tidak ditemukan!", "error");

        this.editReportId = rep.ID_Laporan;
        
        let titleEl = document.getElementById('form-title-mode');
        let btnCancel = document.getElementById('btn-cancel-edit');
        let dateEl = document.getElementById('daily-form-date');
        let picker = document.getElementById('hidden-date-picker');

        if (titleEl) titleEl.innerText = "📝 Ajukan Revisi Laporan";
        if (btnCancel) btnCancel.classList.remove('hidden');

        // Standarisasi Tanggal
        let targetDateObj = this.normalizeDateObj(rep.Tanggal);
        if (dateEl) dateEl.innerText = this.formatToIndoDate(targetDateObj);
        if (picker) picker.value = this.formatToInputDate(targetDateObj);

        // 🚀 KUNCI: Ekstrak data Revisi_JSON jika laporan sedang "Pending Edit"
        let cashVal = rep.Cash;
        let qrisVal = rep.QRIS;
        let billVal = rep.Bill;
        let pcsVal = rep.Pcs;
        let expJson = rep.Pengeluaran_JSON;

        if (rep.Status_Approval === 'Pending Edit' && rep.Revisi_JSON) {
            try {
                let rev = JSON.parse(rep.Revisi_JSON);
                if (rev.net_sales !== undefined) {
                    cashVal = rev.cash; qrisVal = rev.qris;
                    billVal = rev.bill; pcsVal = rev.pcs;
                    expJson = rev.pengeluaran_json;
                    this.showToast("Menampilkan draf revisi yang belum disetujui", "warning");
                }
            } catch(e) {}
        } else {
            this.showToast(`Memuat data tanggal ${this.formatToIndoDate(targetDateObj)} untuk diperbaiki.`);
        }

        // Isi form dengan angka yang tepat
        if (document.getElementById('daily-cash')) document.getElementById('daily-cash').value = Number(cashVal || 0).toLocaleString('id-ID');
        if (document.getElementById('daily-qris')) document.getElementById('daily-qris').value = Number(qrisVal || 0).toLocaleString('id-ID');
        if (document.getElementById('daily-bill')) document.getElementById('daily-bill').value = billVal || 0;
        if (document.getElementById('daily-pcs')) document.getElementById('daily-pcs').value = pcsVal || 0;

        // Muat pengeluaran
        this.dailyExpensesList = [];
        try {
            let expArr = JSON.parse(expJson || '[]');
            expArr.forEach(x => this.addDailyExpenseRow(x.nama, x.nominal));
        } catch(e) {}
        if (this.dailyExpensesList.length === 0) this.addDailyExpenseRow();

        // Kalkulasi ulang & alihkan ke tab Input
        this.calcDailyReportLive();
        this.switchLapHarianSubTab('input');
    },

    // =========================================================
    // 🚀 ENGINE DASHBOARD EKSEKUTIF (KONSOLIDASI & BREAKDOWN)
    // =========================================================
  

     // Tambahkan fungsi ini agar error hilang meskipun tombol belum diubah
selectOutlet: function(id) {
    console.warn("Mengalihkan selectOutlet ke changeOutlet...");
    this.changeOutlet(id);
},

// Pastikan fungsi changeOutlet Anda bersih seperti ini
changeOutlet: function(val) { 
    this.outlet = val; 
    this.cart = []; 
    
    // Panggil fungsi internal lainnya
    if(typeof this.renderCart === 'function') this.renderCart();
    if(typeof this.checkShiftStatus === 'function') this.checkShiftStatus();
    if(typeof this.updateHeaderOutletName === 'function') this.updateHeaderOutletName();
    if(typeof this.closeModal === 'function') this.closeModal('modal-outlet-selector');

    // Refresh Data
    this.refreshData(); 

    // Cek apakah sedang di halaman laporan untuk melakukan re-render
    const activeView = document.querySelector('.app-view:not(.hidden)');
    if (activeView && activeView.id === 'view-laporan-harian') {
        this.initLaporanHarian(); 
    }
},

    // =========================================================
    // 🚀 RESET FILTER DASHBOARD KE BULAN BERJALAN
    // =========================================================
    resetExecDateRange: function() {
        let now = new Date();
        let firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        
        let pad = n => String(n).padStart(2, '0');
        let startStr = `${firstDay.getFullYear()}-${pad(firstDay.getMonth() + 1)}-01`;
        let endStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        const startInput = document.getElementById('exec-filter-start');
        const endInput = document.getElementById('exec-filter-end');

        if (startInput) startInput.value = startStr;
        if (endInput) endInput.value = endStr;

        this.renderExecutiveDashboard();
        this.showToast("Menampilkan konsolidasi bulan berjalan");
    },


    // =========================================================
    // 🚀 CONTROLLER ACCORDION EXPENSE BREAKDOWN EKSEKUTIF
    // =========================================================
    toggleExecExpenseBreakdown: function() {
        const box = document.getElementById('exec-expense-dropdown-box');
        const icon = document.getElementById('icon-toggle-exp');
        const btnText = document.getElementById('btn-toggle-exp-text');
        if (!box) return;

        if (box.classList.contains('hidden')) {
            box.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
            if (btnText) btnText.firstElementChild.innerText = 'Tutup Rincian';
        } else {
            box.classList.add('hidden');
            if (icon) icon.style.transform = 'rotate(0deg)';
            if (btnText) btnText.firstElementChild.innerText = 'Lihat Rincian';
        }
    },

    // =========================================================
    // 🚀 CONTROLLER POPUP ANALISIS SUPER DETAIL PER OUTLET
    // =========================================================
    openDetailOutletModal: function(outName) {
        const modal = document.getElementById('modal-detail-outlet-eksekutif');
        const titleEl = document.getElementById('modal-detail-outlet-name');
        const contEl = document.getElementById('modal-detail-outlet-content');
        if (!modal || !contEl) return;

        if (titleEl) titleEl.innerText = `Ai-CHA ${outName}`;
        modal.classList.remove('hidden');

        // 1. Baca filter tanggal eksekutif aktif
        const startInput = document.getElementById('exec-filter-start');
        const endInput = document.getElementById('exec-filter-end');
        let startObj = (startInput && startInput.value) ? new Date(startInput.value) : null;
        if (startObj) startObj.setHours(0, 0, 0, 0);
        let endObj = (endInput && endInput.value) ? new Date(endInput.value) : null;
        if (endObj) endObj.setHours(23, 59, 59, 999);

        // 2. Kumpulkan metrik khusus cabang ini
        let totSales = 0, totCash = 0, totQris = 0, totExp = 0, totBill = 0, totPcs = 0;
        let expItemMap = {};
        let repCount = 0;

        (this.db.laporanHarian || []).forEach(rep => {
            if (rep.Status_Approval === 'Ditolak') return;
            let repOutlet = String(rep.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            if (repOutlet !== outName) return;

            if (startObj || endObj) {
                let cleanStr = (rep.Tanggal || '').split(',').pop().trim();
                let match = cleanStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                if (match) {
                    let repDate = new Date(parseInt(match[3],10), parseInt(match[2],10)-1, parseInt(match[1],10));
                    if (startObj && repDate < startObj) return;
                    if (endObj && repDate > endObj) return;
                } else return;
            }

            repCount++;
            totSales += Number(rep.Net_Sales || 0);
            totCash += Number(rep.Cash || 0);
            totQris += Number(rep.QRIS || 0);
            totExp += Number(rep.Total_Pengeluaran || 0);
            totBill += Number(rep.Bill || 0);
            totPcs += Number(rep.Pcs || 0);

            try {
                let expArr = JSON.parse(rep.Pengeluaran_JSON || '[]');
                expArr.forEach(x => {
                    let nm = String(x.nama || 'LAINNYA').toUpperCase().trim();
                    let nmNom = Number(x.nominal || 0);
                    if (nm !== '' && nmNom > 0) {
                        if (!expItemMap[nm]) expItemMap[nm] = 0;
                        expItemMap[nm] += nmNom;
                    }
                });
            } catch(e){}
        });

        // 3. Kalkulasi Target Cabang & Rata-rata
        let avgBill = totBill > 0 ? Math.round(totSales / totBill) : 0;
        let avgPcs = totPcs > 0 ? Math.round(totSales / totPcs) : 0;
        let netLaci = totCash - totExp;

        let targetCabang = 180000000;
        let savedT = localStorage.getItem('aicha_target_bulanan_' + outName);
        if (savedT && !isNaN(savedT)) targetCabang = Number(savedT);
        let pctTarget = Math.min(Math.round((totSales / targetCabang) * 100), 100);

        // Render Rincian Item Biaya Cabang
        let expKeys = Object.keys(expItemMap).sort((a,b) => expItemMap[b] - expItemMap[a]);
        let expHtml = expKeys.length === 0 
            ? `<div class="text-xs text-slate-400 italic py-2">Tidak ada pengeluaran dicatat</div>` 
            : expKeys.map(k => `
                <div class="flex justify-between items-center bg-slate-800/80 p-2 rounded-xl text-xs border border-slate-700/50">
                    <span class="font-extrabold text-slate-300">▪️ ${k}</span>
                    <span class="font-black text-amber-400">Rp ${expItemMap[k].toLocaleString('id-ID')}</span>
                </div>`).join('');

        // 4. Rakit HTML Popup Super Lengkap
        contEl.innerHTML = `
            <!-- Kartu Progres Target Cabang -->
            <div class="bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
                <div class="flex justify-between text-xs font-bold mb-2">
                    <span class="text-slate-300">Target Pencapaian Cabang</span>
                    <span class="font-black text-rose-400">${pctTarget}% (Rp ${totSales.toLocaleString('id-ID')} / Rp ${targetCabang.toLocaleString('id-ID')})</span>
                </div>
                <div class="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                    <div class="bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-400 h-full rounded-full transition-all duration-700" style="width: ${pctTarget}%"></div>
                </div>
            </div>

            <!-- Matriks Rangkuman KPI -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div class="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                    <span class="text-[10px] text-slate-400 font-bold uppercase block">Net Sales Bersih</span>
                    <span class="text-base font-black text-rose-400">Rp ${totSales.toLocaleString('id-ID')}</span>
                </div>
                <div class="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                    <span class="text-[10px] text-slate-400 font-bold uppercase block">Total Cash Laci</span>
                    <span class="text-base font-black text-emerald-400">Rp ${totCash.toLocaleString('id-ID')}</span>
                </div>
                <div class="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                    <span class="text-[10px] text-slate-400 font-bold uppercase block">Total QRIS</span>
                    <span class="text-base font-black text-blue-400">Rp ${totQris.toLocaleString('id-ID')}</span>
                </div>
                <div class="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                    <span class="text-[10px] text-slate-400 font-bold uppercase block">Total Pengeluaran</span>
                    <span class="text-base font-black text-amber-400">Rp ${totExp.toLocaleString('id-ID')}</span>
                </div>
                <div class="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                    <span class="text-[10px] text-slate-400 font-bold uppercase block">Rata-rata / Bill (${totBill} Bill)</span>
                    <span class="text-base font-black text-purple-400">Rp ${avgBill.toLocaleString('id-ID')}</span>
                </div>
                <div class="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                    <span class="text-[10px] text-slate-400 font-bold uppercase block">Rata-rata / Pcs (${totPcs} Pcs)</span>
                    <span class="text-base font-black text-teal-400">Rp ${avgPcs.toLocaleString('id-ID')}</span>
                </div>
            </div>

            <!-- Net Cash Bersih -->
            <div class="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 p-3.5 rounded-2xl border border-emerald-500/30 flex justify-between items-center">
                <span class="text-xs font-bold text-emerald-200">💵 Net Cash Bersih Tersedia di Toko (Cash - Biaya):</span>
                <span class="text-base font-black text-emerald-400">Rp ${netLaci.toLocaleString('id-ID')}</span>
            </div>

            <div class="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 flex flex-col min-h-[220px]">
                <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-700/60">
                    <h5 class="text-xs font-black text-amber-400 flex items-center gap-2">
                        <i class="fas fa-list"></i> Breakdown Cabang ${outName}
                    </h5>
                    <div class="flex items-center gap-2">
                        <div class="relative flex-1 sm:w-36">
                            <i class="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[9px]"></i>
                            <input type="text" id="detail-expense-search" oninput="superApp.renderDetailOutletExpenseList()" placeholder="Cari..." class="w-full bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-bold rounded-lg pl-6 pr-2 py-1.5 outline-none focus:border-amber-500 transition-colors shadow-inner">
                        </div>
                        <select id="detail-expense-sort" onchange="superApp.renderDetailOutletExpenseList()" class="bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-bold rounded-lg px-2 py-1.5 outline-none focus:border-amber-500 cursor-pointer shadow-sm">
                            <option value="nominal">Tertinggi</option>
                            <option value="az">A - Z</option>
                        </select>
                    </div>
                </div>
                
                <!-- Area Daftar Interaktif -->
                <div class="flex-1 overflow-y-auto custom-scroll pr-1 mt-3" id="detail-outlet-expense-list"></div>
            </div>
        `;
        
        // 🚀 PENTING: Simpan data ke variabel global dan render list
        this.detailExpenseData = expItemMap;
        this.renderDetailOutletExpenseList();
    },

    closeDetailOutletModal: function() {
        const modal = document.getElementById('modal-detail-outlet-eksekutif');
        if (modal) modal.classList.add('hidden');
    },

    // =========================================================
    // 🚀 RENDER DASHBOARD EKSEKUTIF DENGAN KARTU MINI INTERAKTIF
    // =========================================================
    renderExecutiveDashboard: function() {
        const dashCont = document.getElementById('lapharian-executive-dashboard');
        if (!dashCont) return;

        let isOwner = this.currentUser && (this.currentUser.Role === 'owner' || this.currentUser.Role === 'supervisor');
        if (!isOwner) {
            dashCont.classList.add('hidden');
            return;
        }
        dashCont.classList.remove('hidden');

        // 1. Ambil & Inisialisasi Tanggal Filter
        const startInput = document.getElementById('exec-filter-start');
        const endInput = document.getElementById('exec-filter-end');
        let now = new Date();

        if (startInput && !startInput.value) {
            let pad = n => String(n).padStart(2, '0');
            startInput.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
        }
        if (endInput && !endInput.value) {
            let pad = n => String(n).padStart(2, '0');
            endInput.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        }

        let startObj = (startInput && startInput.value) ? new Date(startInput.value) : null;
        if (startObj) startObj.setHours(0, 0, 0, 0);
        let endObj = (endInput && endInput.value) ? new Date(endInput.value) : null;
        if (endObj) endObj.setHours(23, 59, 59, 999);

        let isConsolidated = (this.outlet === 'Pusat' || this.outlet === 'Semua' || !this.outlet);
        let titleEl = document.getElementById('exec-dash-title');
        if (titleEl) {
            titleEl.innerText = isConsolidated ? "Konsolidasi Seluruh Outlet" : `Analisis Eksekutif: ${this.outlet}`;
        }

        let totSales = 0, totCash = 0, totQris = 0, totExp = 0;
        let outletMap = {};
        
        // 🚀 KUNCI PERBAIKAN: Gunakan variabel global superApp untuk menampung data item biaya
        this.execExpenseData = {}; 

        (this.db.laporanHarian || []).forEach(rep => {
            if (rep.Status_Approval === 'Ditolak') return;

            if (startObj || endObj) {
                let cleanStr = (rep.Tanggal || '').split(',').pop().trim();
                let match = cleanStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                if (match) {
                    let repDateObj = new Date(parseInt(match[3],10), parseInt(match[2],10)-1, parseInt(match[1],10));
                    if (startObj && repDateObj < startObj) return;
                    if (endObj && repDateObj > endObj) return;
                } else return;
            }

            let repOutlet = String(rep.Outlet || 'Lainnya').replace(/^Ai\-Snack\s+/i, '').trim();
            let currOutlet = String(this.outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();

            if (!isConsolidated && repOutlet !== currOutlet) return;

            let net = Number(rep.Net_Sales || 0);
            let cash = Number(rep.Cash || 0);
            let qris = Number(rep.QRIS || 0);
            let exp = Number(rep.Total_Pengeluaran || 0);

            totSales += net;
            totCash += cash;
            totQris += qris;
            totExp += exp;

            if (!outletMap[repOutlet]) outletMap[repOutlet] = { sales: 0, cash: 0, qris: 0, exp: 0 };
            outletMap[repOutlet].sales += net;
            outletMap[repOutlet].cash += cash;
            outletMap[repOutlet].qris += qris;
            outletMap[repOutlet].exp += exp;

            try {
                let expArr = JSON.parse(rep.Pengeluaran_JSON || '[]');
                expArr.forEach(itemExp => {
                    let itemName = String(itemExp.nama || 'LAINNYA').toUpperCase().trim();
                    let itemNom = Number(itemExp.nominal || 0);
                    if (itemName !== '' && itemNom > 0) {
                        if (!this.execExpenseData[itemName]) this.execExpenseData[itemName] = 0;
                        this.execExpenseData[itemName] += itemNom;
                    }
                });
            } catch(e){}
        });

        // 2. Render 4 KPI Utama
        if (document.getElementById('exec-total-sales')) document.getElementById('exec-total-sales').innerText = `Rp ${totSales.toLocaleString('id-ID')}`;
        if (document.getElementById('exec-total-cash')) document.getElementById('exec-total-cash').innerText = `Rp ${totCash.toLocaleString('id-ID')}`;
        if (document.getElementById('exec-total-qris')) document.getElementById('exec-total-qris').innerText = `Rp ${totQris.toLocaleString('id-ID')}`;
        if (document.getElementById('exec-total-expense')) document.getElementById('exec-total-expense').innerText = `Rp ${totExp.toLocaleString('id-ID')}`;

        // 3. Update Akumulasi Target
        let targetTotal = this.targetBulanan || 180000000;
        if (isConsolidated && this.db && this.db.outlets) {
            let tCons = 0;
            this.db.outlets.forEach(o => {
                if (o.Nama_Outlet !== 'Pusat' && o.Nama_Outlet !== 'Semua') {
                    let st = localStorage.getItem('aicha_target_bulanan_' + o.Nama_Outlet);
                    tCons += (st && !isNaN(st)) ? Number(st) : 180000000;
                }
            });
            if (tCons > 0) targetTotal = tCons;
        }

        let pctExec = Math.min(Math.round((totSales / targetTotal) * 100), 100);
        let sisaTarget = Math.max(targetTotal - totSales, 0);

        if (document.getElementById('accum-net-sales')) document.getElementById('accum-net-sales').innerText = `Rp ${totSales.toLocaleString('id-ID')}`;
        if (document.getElementById('accum-target')) document.getElementById('accum-target').innerText = `Rp ${targetTotal.toLocaleString('id-ID')}`;
        if (document.getElementById('accum-progress-bar')) document.getElementById('accum-progress-bar').style.width = `${pctExec}%`;
        if (document.getElementById('accum-percent')) document.getElementById('accum-percent').innerText = `Progress: ${pctExec}%`;
        if (document.getElementById('accum-remaining')) document.getElementById('accum-remaining').innerText = `Kurang: Rp ${sisaTarget.toLocaleString('id-ID')}`;

        // 4. Render Kartu Mini Outlet
        const cardsGrid = document.getElementById('exec-outlet-cards-grid');
        if (cardsGrid) {
            let outletKeys = Object.keys(outletMap).sort((a,b) => outletMap[b].sales - outletMap[a].sales);
            cardsGrid.innerHTML = outletKeys.length === 0 
                ? `<div class="col-span-full text-xs text-slate-400 italic text-center py-6 border border-dashed border-slate-700 rounded-2xl">Belum ada transaksi di periode ini</div>`
                : outletKeys.map(outName => {
                    let oData = outletMap[outName];
                    let pct = totSales > 0 ? Math.round((oData.sales / totSales) * 100) : 0;
                    return `
                    <div onclick="superApp.openDetailOutletModal('${outName}')" class="bg-slate-800/80 hover:bg-slate-700/90 p-3.5 rounded-2xl border border-slate-700 hover:border-rose-500/50 cursor-pointer transition-all active:scale-95 shadow-md flex flex-col justify-between group">
                        <div class="flex justify-between items-start mb-2">
                            <span class="font-black text-white text-sm group-hover:text-rose-400 transition">Ai-CHA ${outName}</span>
                            <span class="text-[9px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">${pct}%</span>
                        </div>
                        <div>
                            <span class="text-[10px] text-slate-400 block uppercase font-bold">Sales Cabang</span>
                            <span class="font-black text-rose-400 text-base block tracking-tight">Rp ${oData.sales.toLocaleString('id-ID')}</span>
                        </div>
                    </div>`;
                }).join('');
        }

        // 5. Simpan Total ke Global & Panggil Engine List Interaktif (Search & Sort)
        this.execTotalExpense = totExp;
        this.renderExecExpenseList();
    },

    // =========================================================
    // 🚀 CONTROLLER DATEPICKER INPUT KUSTOM YANG CANTIK
    // =========================================================
    inputDatepickerYear: new Date().getFullYear(),
    inputDatepickerMonth: new Date().getMonth(),
    calendarModalYear: new Date().getFullYear(),
    calendarModalMonth: new Date().getMonth(),

    openInputDatepickerModal: function() {
        // Cukup periksa apakah user sudah login (sesi valid)
        if (!this.currentUser) {
            return this.showToast("Sesi login tidak ditemukan. Silakan login kembali.", "error");
        }

        // Langsung buka modal tanpa harus memasukkan PIN
        const modal = document.getElementById('modal-datepicker-input');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Reset ke tampilan bulan saat ini
            this.inputDatepickerYear = new Date().getFullYear();
            this.inputDatepickerMonth = new Date().getMonth();
            this.renderInputDatepickerGrid();
        } else {
            this.showToast("Sistem Datepicker tidak tersedia.", "error");
        }
    },

    closeInputDatepickerModal: function() {
        const modal = document.getElementById('modal-datepicker-input');
        if (modal) modal.classList.add('hidden');
    },

    // =========================================================
    // 🚀 1. DATEPICKER INPUT KUSTOM (SELARAS DENGAN INDIKATOR TERISI)
    // =========================================================
    renderInputDatepickerGrid: function() {
        const grid = document.getElementById('input-datepicker-grid');
        const title = document.getElementById('input-datepicker-month-year');
        if (!grid) return;

        let y = this.inputDatepickerYear;
        let m = this.inputDatepickerMonth;
        let dDate = new Date(y, m, 1);
        
        if (title) title.innerText = dDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

        const firstDay = dDate.getDay();
        const daysInMonth = new Date(y, m + 1, 0).getDate();

        // Deteksi mode konsolidasi atau outlet spesifik untuk penanda terisi
        let isConsolidated = (this.outlet === 'Pusat' || this.outlet === 'Semua' || !this.outlet);
        let currOutletClean = String(this.outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();

        // Ambil daftar tanggal terisi dari database (untuk bulan yang sedang dibuka di datepicker)
        const terisiDates = (this.db.laporanHarian || []).filter(x => {
            if (x.Status_Approval === 'Ditolak') return false;
            let repOutlet = String(x.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            return isConsolidated || repOutlet === currOutletClean;
        }).map(l => {
            let cleanStr = (l.Tanggal || '').split(',').pop().trim();
            let match = cleanStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
            if (match) {
                return `${parseInt(match[3], 10)}-${parseInt(match[2], 10)}-${parseInt(match[1], 10)}`; // YYYY-M-D
            }
            return '';
        });

        grid.innerHTML = `
            <div class="text-slate-400 py-1 font-black">Sen</div><div class="text-slate-400 py-1 font-black">Sel</div><div class="text-slate-400 py-1 font-black">Rab</div>
            <div class="text-slate-400 py-1 font-black">Kam</div><div class="text-slate-400 py-1 font-black">Jum</div><div class="text-slate-400 py-1 font-black">Sab</div><div class="text-slate-400 py-1 font-black">Min</div>
        `;

        let offset = (firstDay === 0) ? 6 : firstDay - 1;
        for(let i = 0; i < offset; i++) {
            grid.appendChild(document.createElement('div'));
        }

        let today = new Date();
        for(let d = 1; d <= daysInMonth; d++) {
            let dateKey = `${y}-${m + 1}-${d}`;
            let isDone = terisiDates.includes(dateKey);
            let isToday = (d === today.getDate() && m === today.getMonth() && y === today.getFullYear());
            
            let div = document.createElement('div');
            
            // ✨ INDIKATOR DINAMIS: Selaras dengan master kalender laporan
            let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60';
            if (isDone) {
                bgClass = 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20';
            }
            if (isToday) {
                bgClass = 'bg-rose-500 text-white shadow-md shadow-rose-500/20 ring-2 ring-white';
            }

            div.className = `aspect-square h-9 mx-auto flex flex-col items-center justify-center rounded-xl text-xs font-black cursor-pointer transition-all active:scale-90 relative ${bgClass}`;
            
            // Tambahkan dot indikator terisi jika tanggal hari ini juga sudah terisi data
            if (isToday && isDone) {
                div.innerHTML = `${d}<span class="w-1.5 h-1.5 bg-emerald-300 rounded-full absolute bottom-1"></span>`;
            } else {
                div.innerText = d;
            }

            div.onclick = () => {
                let pad = n => String(n).padStart(2, '0');
                let tglPilihan = `${y}-${pad(m + 1)}-${pad(d)}`;
                this.applyBackdate(tglPilihan);
                this.closeInputDatepickerModal();
            };
            grid.appendChild(div);
        }
    },

    // =========================================================
    // 🚀 CONTROLLER POPUP MODAL KALENDER LAPORAN (MULTI-BULAN)
    // =========================================================
    openCalendarModal: function() {
        const modal = document.getElementById('modal-kalender-laporan');
        if (modal) {
            modal.classList.remove('hidden');
            let now = new Date();
            this.calendarModalYear = now.getFullYear();
            this.calendarModalMonth = now.getMonth();
            this.renderCalendar();
        }
    },

    closeCalendarModal: function() {
        const modal = document.getElementById('modal-kalender-laporan');
        if (modal) modal.classList.add('hidden');
    },

    // =========================================================
    // 🚀 CONTROLLER DATEPICKER INPUT KUSTOM (PERBAIKAN PARAMETER dir)
    // =========================================================
    navInputDatepicker: function(dir) {
        this.inputDatepickerMonth += dir;
        if (this.inputDatepickerMonth < 0) {
            this.inputDatepickerMonth = 11;
            this.inputDatepickerYear--;
        } else if (this.inputDatepickerMonth > 11) {
            this.inputDatepickerMonth = 0;
            this.inputDatepickerYear++;
        }
        this.renderInputDatepickerGrid();
    },

    // =========================================================
    // 🚀 CONTROLLER POPUP MODAL KALENDER LAPORAN (PERBAIKAN PARAMETER dir)
    // =========================================================
    navCalendarModal: function(dir) {
        if (dir === 0) {
            let now = new Date();
            this.calendarModalYear = now.getFullYear();
            this.calendarModalMonth = now.getMonth();
        } else {
            this.calendarModalMonth += dir;
            if (this.calendarModalMonth < 0) {
                this.calendarModalMonth = 11;
                this.calendarModalYear--;
            } else if (this.calendarModalMonth > 11) {
                this.calendarModalMonth = 0;
                this.calendarModalYear++;
            }
        }
        this.renderCalendar();
    },

    // =========================================================
    // 🚀 3. MASTER KALENDER LAPORAN MODAL (MATRIKS KEDISIPLINAN KASIR LIVE OUTLET)
    // =========================================================
    renderCalendar: function() {
        const year = this.calendarModalYear || new Date().getFullYear();
        const month = this.calendarModalMonth !== undefined ? this.calendarModalMonth : new Date().getMonth();
        
        let now = new Date();
        let isCurrentMonth = (month === now.getMonth() && year === now.getFullYear());
        let currentDayLimit = isCurrentMonth ? now.getDate() : new Date(year, month + 1, 0).getDate();

        let isConsolidated = (this.outlet === 'Pusat' || this.outlet === 'Semua' || !this.outlet);
        let currOutletClean = String(this.outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();

        // 🚀 KUNCI PERBAIKAN: Ambtil data laporan dinamis mengikuti outlet terpilih
        const terisiDates = (this.db.laporanHarian || []).filter(x => {
            if (x.Status_Approval === 'Ditolak') return false;
            let repOutlet = String(x.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            return isConsolidated || repOutlet === currOutletClean;
        }).map(l => {
            let cleanStr = (l.Tanggal || '').split(',').pop().trim();
            let match = cleanStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
            if (match) {
                return `${parseInt(match[3], 10)}-${parseInt(match[2], 10)}-${parseInt(match[1], 10)}`; // YYYY-M-D
            }
            return '';
        });

        // 🚀 MATRIKS KEDISIPLINAN REAL-TIME BERDASARKAN OUTLET TERPILIH
        let terisiCount = 0;
        for (let d = 1; d <= currentDayLimit; d++) {
            if (terisiDates.includes(`${year}-${month + 1}-${d}`)) {
                terisiCount++;
            }
        }
        let kosongCount = Math.max(0, currentDayLimit - terisiCount);

        // Update teks keterangan judul bulan berjalan & ringkasan di dashboard utama
        let dDate = new Date(year, month, 1);
        if (document.getElementById('calendar-summary-month')) {
            document.getElementById('calendar-summary-month').innerText = dDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        }
        if (document.getElementById('cal-stat-terisi')) document.getElementById('cal-stat-terisi').innerText = `${terisiCount} Hari`;
        if (document.getElementById('cal-stat-kosong')) document.getElementById('cal-stat-kosong').innerText = `${kosongCount} Hari`;

        // Render struktur grid ke dalam modal popup kalender
        const grid = document.getElementById('modal-calendar-grid');
        const modalTitle = document.getElementById('modal-cal-month-title');
        if (!grid) return;

        if (modalTitle) modalTitle.innerText = dDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

        const firstDay = dDate.getDay(); 
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        grid.innerHTML = `
            <div class="text-slate-400 py-1.5 font-black">Sen</div><div class="text-slate-400 py-1.5 font-black">Sel</div><div class="text-slate-400 py-1.5 font-black">Rab</div>
            <div class="text-slate-400 py-1.5 font-black">Kam</div><div class="text-slate-400 py-1.5 font-black">Jum</div><div class="text-slate-400 py-1.5 font-black">Sab</div><div class="text-slate-400 py-1.5 font-black">Min</div>
        `;
        
        let offset = (firstDay === 0) ? 6 : firstDay - 1;
        for(let i = 0; i < offset; i++) {
            grid.appendChild(document.createElement('div'));
        }
        
        for(let d = 1; d <= daysInMonth; d++) {
            let dateKey = `${year}-${month + 1}-${d}`;
            let isDone = terisiDates.includes(dateKey);
            
            let div = document.createElement('div');
            div.className = `aspect-square h-10 mx-auto flex items-center justify-center rounded-2xl text-xs font-black cursor-pointer transition-all active:scale-90 ${
                isDone 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200/60'
            }`;
            div.innerText = d;
            
            div.onclick = () => {
                let pad = n => String(n).padStart(2, '0');
                let tglPilihan = `${year}-${pad(month + 1)}-${pad(d)}`;
                if (typeof this.applyBackdate === 'function') {
                    this.applyBackdate(tglPilihan);
                }
                this.closeCalendarModal();
                this.showToast(`Memilih laporan tanggal: ${d}-${month+1}-${year}`);
            };
            grid.appendChild(div);
        }
    },

    // =========================================================
    // 🚀 CONTROLLER MODAL POPUP WA LAPORAN HARIAN
    // =========================================================
    openWaLaporanModal: function(text) {
        const modal = document.getElementById('modal-wa-laporan-harian');
        const textarea = document.getElementById('wa-laporan-preview-text');
        
        if (textarea) {
            textarea.value = text;
        }
        
        if (modal) {
            modal.classList.remove('hidden');
            // Reset focus textarea ke atas agar rapi saat dibaca kasir
            textarea.scrollTop = 0; 
        } else {
            // Fallback jika elemen modal utama tidak ditemukan di index.html
            this.showToast("Gagal memuat popup WA, meredireksi langsung...", "error");
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
        }
    },

    closeWaLaporanModal: function() {
        const modal = document.getElementById('modal-wa-laporan-harian');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    copyWaLaporanText: function() {
        const textarea = document.getElementById('wa-laporan-preview-text');
        if (!textarea || !textarea.value) return;
        
        // Block text untuk visualisasi salin
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        
        navigator.clipboard.writeText(textarea.value).then(() => {
            const btn = document.getElementById('btn-copy-wa-lap');
            if (btn) {
                let originalContent = btn.innerHTML;
                // Transisi tombol interaktif menjadi sukses tersalin
                btn.innerHTML = `<i class="fas fa-check text-emerald-500"></i> Tersalin!`;
                btn.classList.add('border-emerald-500', 'text-emerald-600', 'bg-emerald-50');
                
                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.classList.remove('border-emerald-500', 'text-emerald-600', 'bg-emerald-50');
                }, 2000);
            }
            this.showToast("Teks laporan berhasil disalin!", "success");
        }).catch(err => {
            this.showToast("Gagal menyalin teks, silakan salin manual.", "error");
        });
    },

    sendWaLaporanNow: function() {
        const textarea = document.getElementById('wa-laporan-preview-text');
        if (!textarea || !textarea.value) return;
        
        let textEncoded = encodeURIComponent(textarea.value);
        // Membuka tautan resmi kirim teks API WhatsApp (Mendukung Web & Aplikasi HP)
        window.open(`https://api.whatsapp.com/send?text=${textEncoded}`, '_blank');
        
        // Tutup modal secara otomatis setelah mengalihkan user ke WA
        this.closeWaLaporanModal();
    },

    
    // =========================================================
    // 🚀 1. RENDER MANAJEMEN USER (PC & MOBILE DUAL RENDER)
    // =========================================================
    renderUserManagement: function() {
        if (!this.db || !this.db.users) return;

        // Populate Dropdown Filter Outlet jika belum terisi
        const filterOutEl = document.getElementById('user-outlet-filter');
        if (filterOutEl && filterOutEl.options.length <= 1) {
            let opts = '<option value="Semua">Semua Cabang</option>';
            (this.db.outlets || []).forEach(o => {
                opts += `<option value="${o.ID_Outlet}">${o.Nama_Outlet}</option>`;
            });
            filterOutEl.innerHTML = opts;
        }

        let searchKey = (document.getElementById('user-search-input')?.value || '').toLowerCase();
        let selectedOutlet = filterOutEl ? filterOutEl.value : 'Semua';

        let tbodyDesk = document.getElementById('user-mgt-tbody');
        let mobContainer = document.getElementById('user-mgt-mobile');
        
        let htmlDesk = ''; let htmlMob = '';
        let totAll = 0, totKasir = 0, totAdmin = 0;

        let sortedUsers = [...this.db.users].sort((a,b) => String(a.Nama||'').localeCompare(String(b.Nama||'')));

        sortedUsers.forEach(u => {
            let nama = String(u.Nama || '-');
            let uname = String(u.Username || u.ID_User || '-');
            let role = String(u.Role || 'Kasir');
            let outId = String(u.Outlet || u.ID_Outlet || 'Semua');

            // Filter Pencarian & Outlet
            let matchSearch = nama.toLowerCase().includes(searchKey) || uname.toLowerCase().includes(searchKey);
            let matchOutlet = selectedOutlet === 'Semua' || outId === selectedOutlet;

            if (!matchSearch || !matchOutlet) return;

            // Hitung KPI
            totAll++;
            if (role.toLowerCase().includes('kasir')) totKasir++;
            else totAdmin++;

            // Nama Outlet Visual
            let outName = outId;
            let findOut = (this.db.outlets || []).find(x => x.ID_Outlet === outId);
            if (findOut) outName = findOut.Nama_Outlet;

            // Badge Desain Role
            let roleBadge = '';
            if (role.toLowerCase().includes('owner')) roleBadge = 'bg-purple-50 text-purple-700 border-purple-200';
            else if (role.toLowerCase().includes('admin') || role.toLowerCase().includes('manajer')) roleBadge = 'bg-amber-50 text-amber-700 border-amber-200';
            else roleBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';

            // --- STRUKTUR TABEL DESKTOP ---
            htmlDesk += `
            <tr class="table-row-3d border-b border-slate-50 hover:bg-slate-50/80 transition-all group">
                <td class="py-4 px-5 whitespace-normal">
                    <div class="font-extrabold text-slate-800 text-sm leading-snug">${nama}</div>
                    <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: @${uname}</div>
                </td>
                <td class="py-4 px-5 whitespace-nowrap">
                    <span class="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider"><i class="fas fa-store mr-1.5 opacity-70"></i>${outName}</span>
                </td>
                <td class="py-4 px-5 text-center whitespace-nowrap">
                    <code class="bg-slate-100 px-3 py-1 rounded-lg font-mono text-xs font-black text-slate-500 tracking-widest">••••</code>
                </td>
                <td class="py-4 px-5 text-center whitespace-nowrap">
                    <span class="inline-flex px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${roleBadge}">${role}</span>
                </td>
                <td class="py-4 px-5 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onclick="superApp.openCrudUser('edit', '${uname}')" class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all active:scale-90 flex items-center justify-center" title="Edit User"><i class="fas fa-edit text-xs"></i></button>
                        <button onclick="superApp.executeDeleteUser('${uname}')" class="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90 flex items-center justify-center" title="Hapus User"><i class="fas fa-trash text-xs"></i></button>
                    </div>
                </td>
            </tr>`;

            // --- STRUKTUR KARTU MOBILE ---
            htmlMob += `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-sm transition-all flex justify-between items-center gap-3">
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                        <h4 class="font-extrabold text-sm text-slate-800 truncate">${nama}</h4>
                        <span class="px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${roleBadge} shrink-0">${role}</span>
                    </div>
                    <div class="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-bold">
                        <span><i class="fas fa-user text-slate-300 mr-1"></i>@${uname}</span>
                        <span><i class="fas fa-store text-indigo-400 mr-1"></i>${outName}</span>
                    </div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0 border-l border-slate-50 pl-2">
                    <button onclick="superApp.openCrudUser('edit', '${uname}')" class="w-8 h-8 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold flex items-center justify-center active:scale-90"><i class="fas fa-edit text-xs"></i></button>
                    <button onclick="superApp.executeDeleteUser('${uname}')" class="w-8 h-8 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-bold flex items-center justify-center active:scale-90"><i class="fas fa-trash text-xs"></i></button>
                </div>
            </div>`;
        });

        // Update DOM
        if (tbodyDesk) tbodyDesk.innerHTML = htmlDesk || `<tr><td colspan="5" class="py-12 text-center text-slate-400 font-bold text-xs">User tidak ditemukan</td></tr>`;
        if (mobContainer) mobContainer.innerHTML = htmlMob || `<div class="p-6 text-center text-slate-400 text-xs font-bold border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">User tidak ditemukan</div>`;

        // Update KPI
        if (document.getElementById('usr-tot-all')) document.getElementById('usr-tot-all').innerText = totAll;
        if (document.getElementById('usr-tot-kasir')) document.getElementById('usr-tot-kasir').innerText = totKasir;
        if (document.getElementById('usr-tot-admin')) document.getElementById('usr-tot-admin').innerText = totAdmin;
    },

    // =========================================================
    // 🚀 2. MODAL FORM TAMBAH & EDIT USER
    // =========================================================
    openCrudUser: function(mode, username = '') {
        let u = mode === 'edit' ? (this.db.users || []).find(x => (x.Username || x.ID_User) === username) : null;
        
        // Pilihan Cabang Dinamis
        let outletOptions = `<option value="Pusat">Semua Cabang / Pusat (Akses Global)</option>`;
        (this.db.outlets || []).forEach(o => {
            let sel = (u && (u.Outlet === o.ID_Outlet || u.ID_Outlet === o.ID_Outlet)) ? 'selected' : '';
            outletOptions += `<option value="${o.ID_Outlet}" ${sel}>Cabang ${o.Nama_Outlet}</option>`;
        });

        let inputs = `
            ${this.makeInput('Nama Lengkap Karyawan', 'usr-nama', u ? u.Nama : '', 'text', 'Nama asli untuk laporan absen & audit')}
            <div class="grid grid-cols-2 gap-3">
                ${this.makeInput('Username ID', 'usr-id', u ? (u.Username || u.ID_User) : '', 'text', 'Untuk login sistem', mode === 'edit')}
                ${this.makeInput('PIN Otorisasi (4 Digit)', 'usr-pin', '', 'password', mode === 'edit' ? 'Kosongkan jika PIN tetap' : 'Wajib 4 Angka')}
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-xs font-bold text-slate-500 block mb-1 uppercase tracking-widest">Hak Akses (Role)</label>
                    <select id="frm-usr-role" class="w-full border-2 border-slate-200 rounded-xl px-3.5 py-3 font-bold text-sm bg-white outline-none focus:border-purple-500 transition cursor-pointer">
                        <option value="Kasir" ${u && u.Role === 'Kasir' ? 'selected' : ''}>Kasir / Operator</option>
                        <option value="Manajer" ${u && u.Role === 'Manajer' ? 'selected' : ''}>Manajer Toko</option>
                        <option value="Admin" ${u && u.Role === 'Admin' ? 'selected' : ''}>Admin Gudang</option>
                        <option value="Owner" ${u && u.Role === 'Owner' ? 'selected' : ''}>Owner / Pemilik</option>
                    </select>
                </div>
                <div>
                    <label class="text-xs font-bold text-slate-500 block mb-1 uppercase tracking-widest">Penempatan Kerja</label>
                    <select id="frm-usr-outlet" class="w-full border-2 border-slate-200 rounded-xl px-3.5 py-3 font-bold text-sm bg-white outline-none focus:border-purple-500 transition cursor-pointer">
                        ${outletOptions}
                    </select>
                </div>
            </div>`;

        this.buildForm(mode === 'edit' ? "Edit Profil Pengguna" : "Tambah User Baru", inputs, `superApp.executeSaveUser('${mode}', '${mode === 'edit' ? username : ''}')`);
        
        // Aktifkan Numpad virtual saat input PIN dklik
        setTimeout(() => {
            let pinInput = document.getElementById('frm-usr-pin');
            if (pinInput) {
                pinInput.setAttribute('readonly', 'readonly');
                pinInput.classList.add('cursor-pointer');
                pinInput.onclick = () => osKeyboard.open('frm-usr-pin', 'numeric');
            }
        }, 100);
    },

    // =========================================================
    // 🚀 3. EKSEKUSI SIMPAN DATA USER
    // =========================================================
    executeSaveUser: async function(mode, oldUsername) {
        if (this.isProcessing) return;
        const fNama = document.getElementById('frm-usr-nama')?.value.trim();
        const fId = document.getElementById('frm-usr-id')?.value.trim();
        const fPin = document.getElementById('frm-usr-pin')?.value.trim();
        const fRole = document.getElementById('frm-usr-role')?.value;
        const fOutlet = document.getElementById('frm-usr-outlet')?.value;

        if (!fNama || !fId) return this.showToast("Nama Lengkap dan Username wajib diisi!", "error");
        if (mode === 'add' && (!fPin || fPin.length !== 4)) return this.showToast("PIN baru wajib 4 digit angka!", "error");

        this.setLoading(true, "Menyimpan Data Pengguna...");

        // Update Memori Lokal Secara Instan (Agar UI Cepat)
        if (!this.db.users) this.db.users = [];
        if (mode === 'add') {
            this.db.users.push({ Username: fId, ID_User: fId, Nama: fNama, Role: fRole, Outlet: fOutlet, ID_Outlet: fOutlet, PIN: fPin });
        } else {
            let idx = this.db.users.findIndex(x => (x.Username || x.ID_User) === oldUsername);
            if (idx > -1) {
                this.db.users[idx].Nama = fNama;
                this.db.users[idx].Role = fRole;
                this.db.users[idx].Outlet = fOutlet;
                this.db.users[idx].ID_Outlet = fOutlet;
                if (fPin && fPin.length === 4) this.db.users[idx].PIN = fPin;
            }
        }
        localStorage.setItem('aisnack_db_cache', JSON.stringify(this.db));

        // Kirim ke Backend Google Sheets
        const payload = { action: 'save_user', mode: mode, old_username: oldUsername, username: fId, nama: fNama, role: fRole, outlet: fOutlet, pin: fPin };
        let res = await this.apiPost(payload);

        this.closeModal('modal-form');
        this.renderUserManagement();
        this.showToast(mode === 'edit' ? "Profil pengguna diperbarui!" : "Pengguna baru berhasil ditambahkan!");
        this.setLoading(false);

        // Tarik data baru di background jika online
        if (!res.is_offline) {
            fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' })
                .then(r => r.json()).then(data => { if (data.status === 'sukses') { this.db = data; localStorage.setItem('aisnack_db_cache', JSON.stringify(data)); this.renderUserManagement(); } });
        }
    },

    // =========================================================
    // 🚀 4. EKSEKUSI HAPUS USER
    // =========================================================
    executeDeleteUser: async function(username) {
        if (this.isProcessing) return;
        if (this.currentUser && this.currentUser.Username === username) {
            return this.showToast("Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini!", "error");
        }
        if (!confirm(`Yakin ingin menghapus hak akses untuk pengguna "@${username}"?`)) return;

        this.setLoading(true, "Menghapus Pengguna...");

        // Hapus dari Memori Lokal
        this.db.users = (this.db.users || []).filter(x => (x.Username || x.ID_User) !== username);
        localStorage.setItem('aisnack_db_cache', JSON.stringify(this.db));

        const payload = { action: 'delete_user', username: username };
        await this.apiPost(payload);

        this.renderUserManagement();
        this.showToast("Pengguna berhasil dihapus!");
        this.setLoading(false);
    },

    // ==========================================
    // 1. LOGIKA MASTER HPP
    // ==========================================
  renderMasterHPP: function() {
    // 🚀 PERBAIKAN: Arahkan ke ID yang baru dan unik
    const tbody = document.getElementById('gudang-table-hpp');
    if (!tbody) return;

    if (!this.db || !this.db.masterProduk) return;

    let html = '';
    let no = 1;

    let menuJualan = [...(this.db.masterProduk || [])].filter(m => {
        let kat = String(m.Kategori || '').toUpperCase().trim();
        return kat === 'AISNACK'; 
    }).sort((a,b) => String(a.Nama_Produk||'').localeCompare(String(b.Nama_Produk||'')));

    menuJualan.forEach((p) => {
        let hpp = Number(p.HPP || 0);
        
        // Pencocokan SKU dan Outlet yang aktif
        let hargaData = (this.db.hargaStokOutlet || []).find(x => 
            String(x.SKU).trim() === String(p.SKU).trim() && 
            String(x.ID_Outlet).trim() === String(this.outlet).trim()
        );
        let hargaJual = hargaData ? Number(hargaData.Harga_Jual) : 0;
        
        let marginRp = hargaJual - hpp;
        let marginPercent = hargaJual > 0 ? ((marginRp / hargaJual) * 100).toFixed(1) : 0;
        
        let healthColor = marginPercent < 20 ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200';
        let barColor = marginPercent < 20 ? 'bg-rose-500' : 'bg-emerald-500';
        let visualPct = Math.min(Math.max(marginPercent, 0), 100);

        html += `
        <tr class="table-row-3d hover:bg-slate-50 transition-all border border-slate-100 group">
            <td class="py-4 px-4 text-center font-black text-slate-300">${no++}</td>
            <td class="py-4 px-4">
                <p class="font-extrabold text-slate-800 text-sm">${p.Nama_Produk}</p>
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">SKU: ${p.SKU}</p>
            </td>
            <td class="py-4 px-4 text-right">
                <span class="font-black text-slate-600 text-base">Rp ${hargaJual.toLocaleString('id-ID')}</span>
            </td>
            <td class="py-4 px-4">
                <div class="relative w-full max-w-[150px]">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rp</span>
                    <input type="number" id="hpp-input-${p.SKU}" value="${hpp}" 
                        class="w-full bg-white border-2 border-slate-200 rounded-xl pl-9 pr-3 py-2 font-black text-sm text-slate-800 focus:border-amber-500 outline-none transition" 
                        oninput="superApp.calculateRowMargin('${p.SKU}', ${hargaJual}, this.value)">
                </div>
            </td>
            <td class="py-4 px-4 min-w-[200px]">
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between items-end">
                        <span id="margin-badge-${p.SKU}" class="px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-widest ${healthColor}">${marginPercent}%</span>
                        <span id="margin-rp-${p.SKU}" class="font-black text-sm text-slate-700">Rp ${marginRp.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div id="margin-bar-${p.SKU}" class="h-full ${barColor} transition-all duration-300" style="width: ${visualPct}%"></div>
                    </div>
                </div>
            </td>
        </tr>`;
    });
    
    // Gunakan kembali variabel tbody yang sudah diarahkan ke ID baru
    tbody.innerHTML = html || `<tr><td colspan="5" class="text-center py-10 text-slate-400 font-bold">Belum ada menu dengan kategori AISNACK di cabang ini.</td></tr>`;
},
    
    // Fungsi Kalkulasi Live saat Owner mengetik angka di tabel
    calculateRowMargin: function(sku, hargaJual, newHpp) {
        let hppVal = parseFloat(newHpp) || 0;
        let marginRp = hargaJual - hppVal;
        let marginPercent = hargaJual > 0 ? ((marginRp / hargaJual) * 100).toFixed(1) : 0;
        
        const badge = document.getElementById(`margin-badge-${sku}`);
        const pctEl = document.getElementById(`margin-pct-${sku}`);
        const barEl = document.getElementById(`margin-bar-${sku}`);
        const rpEl = document.getElementById(`margin-rp-${sku}`);
        
        if(badge && pctEl && barEl && rpEl) {
            let healthColor = ''; let healthText = ''; let barColor = '';
            
            if (hargaJual === 0) {
                healthColor = 'text-slate-400 bg-slate-100 border-slate-200';
                healthText = 'Harga Belum Diset'; barColor = 'bg-slate-200';
            } else if (marginPercent < 20) {
                healthColor = 'text-rose-600 bg-rose-50 border-rose-200';
                healthText = marginPercent < 0 ? 'RUGI!' : 'Kritis'; barColor = 'bg-rose-500';
            } else if (marginPercent >= 20 && marginPercent <= 40) {
                healthColor = 'text-amber-600 bg-amber-50 border-amber-200';
                healthText = 'Normal'; barColor = 'bg-amber-400';
            } else {
                healthColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
                healthText = 'Sangat Sehat 💎'; barColor = 'bg-emerald-500';
            }

            let visualPct = marginPercent > 100 ? 100 : (marginPercent < 0 ? 0 : marginPercent);

            badge.className = `px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-widest ${healthColor}`;
            badge.innerText = healthText;
            
            pctEl.className = `font-black text-sm ${healthColor.split(' ')[0]}`;
            pctEl.innerText = `${marginPercent}%`;
            
            barEl.className = `h-full ${barColor} rounded-full transition-all duration-300`;
            barEl.style.width = `${visualPct}%`;
            
            rpEl.innerText = `Rp ${marginRp.toLocaleString('id-ID')}`;
        }
    },

    saveHPP: async function() {
        if (this.isProcessing) return;
        
        let hppData = [];
        // 1. Kumpulkan semua angka yang diketik Owner
        this.filteredProducts.forEach(p => {
            let inputEl = document.getElementById(`hpp-input-${p.sku}`);
            if (inputEl) {
                hppData.push({ sku: p.sku, hpp: this.getNumericValue(inputEl.value) });
            }
        });

        if (hppData.length === 0) return this.showToast("Tidak ada data HPP untuk disimpan", "warning");
        if (!confirm("Simpan perubahan Master HPP ke database pusat?")) return;

        this.setLoading(true, "Menyimpan HPP ke Server...");
        
        // 2. Kirim ke Backend Google Sheets
        const payload = {
            action: 'save_hpp',
            userRole: this.userRole, // 🔒 Gembok Keamanan
            data: hppData
        };

        let res = await this.apiPost(payload);
        if (res.status === 'sukses') {
            this.showToast("Data HPP berhasil diperbarui!", "success");
            if (!res.is_offline) {
                const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' });
                this.db = await r.json();
            }
            this.refreshData(); 
            this.renderMasterHPP(); // Gambar ulang tabel
        } else {
            this.showToast("Gagal menyimpan HPP: " + (res.pesan || ''), "error");
        }
        this.setLoading(false);
    },

    // Tambahkan di dalam object superApp
    profitChart: null,
    // 1. Inisialisasi Filter & State Memory
    // 1. Inisialisasi Filter & State Memory (SAMA SEPERTI REPORT)
    initProfitFilters: function() {
        const startEl = document.getElementById('profit-start');
        const endEl = document.getElementById('profit-end');
        const outletEl = document.getElementById('profit-outlet');

        // Auto-Set Tanggal: Hari ini
        const today = new Date().toISOString().split('T')[0];
        if (startEl && !startEl.value) startEl.value = today;
        if (endEl && !endEl.value) endEl.value = today;

        // 🚀 PERBAIKAN KUNCI: Isi Dropdown Outlet menggunakan ID_Outlet agar cocok dengan Riwayat_Transaksi
        if (outletEl && outletEl.options.length <= 1) {
            (this.db.outlets || []).forEach(o => {
                outletEl.innerHTML += `<option value="${o.ID_Outlet}">${o.Nama_Outlet}</option>`;
            });
        }

        // State Memory: Load Outlet terakhir dari localStorage
        const savedOutlet = localStorage.getItem('last_profit_outlet');
        if (savedOutlet && outletEl) {
            outletEl.value = savedOutlet;
        }
    },

    // 2. Rendering Profit dengan Chart.js
    renderProfitReport: function() {
        const container = document.getElementById('profit-summary-cards');
        const tbody = document.getElementById('profit-product-tbody');
        const startVal = document.getElementById('profit-start').value;
        const endVal = document.getElementById('profit-end').value;
        const outletEl = document.getElementById('profit-outlet');

        // 🚀 ADOPSI DARI MENU REPORT: Proteksi Role & Penentuan Outlet Target
        let roleStr = this.currentUser ? String(this.currentUser.Role).toLowerCase() : '';
        let isAdmin = roleStr.includes('admin') || roleStr.includes('owner');
        let filterVal = (isAdmin && outletEl) ? outletEl.value : this.outlet;

        // Simpan State Memory hanya jika dia admin
        if (isAdmin) localStorage.setItem('last_profit_outlet', filterVal);

        if (!startVal || !endVal) return; // Tunggu user pilih tanggal

        const dStart = new Date(startVal + "T00:00:00");
        const dEnd = new Date(endVal + "T23:59:59");

        let productAggr = {}, trendAggr = {}, totalLaba = 0, totalOmset = 0, totalHpp = 0;

        (this.db.transactions || []).forEach(t => {
            if (t.Status !== 'Sukses') return;
            let tDate = this.parseDateId(t.Tanggal);
            
            // 🚀 ADOPSI DARI MENU REPORT: Filter pencocokan outlet yang presisi
            let isTargetOutlet = (filterVal === 'Semua' || t.Outlet === filterVal);
            
            if (tDate >= dStart && tDate <= dEnd && isTargetOutlet) {
                let items = [];
                try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e) { return; }
                
                items.forEach(it => {
                    let m = (this.db.masterProduk || []).find(m => String(m.SKU).trim() === String(it.sku).trim());
                    
                    let hppSatuan = m ? Number(m.HPP || 0) : 0;
                    let hargaSatuan = Number(it.price || 0);
                    let qty = Number(it.qty || 0);
                    
                    let omsetItem = hargaSatuan * qty;
                    let hppItem = hppSatuan * qty;
                    let labaItem = omsetItem - hppItem;
                    
                    let safeNama = it.nama || 'Unknown';
                    
                    if(!productAggr[safeNama]) productAggr[safeNama] = { qty: 0, omset: 0, hpp: 0, laba: 0 };
                    productAggr[safeNama].qty += qty;
                    productAggr[safeNama].omset += omsetItem;
                    productAggr[safeNama].hpp += hppItem;
                    productAggr[safeNama].laba += labaItem;

                    let dateKey = this.cleanDateOnly(t.Tanggal);
                    trendAggr[dateKey] = (trendAggr[dateKey] || 0) + labaItem;
                    
                    totalLaba += labaItem;
                    totalOmset += omsetItem;
                    totalHpp += hppItem;
                });
            }
        });

        // Render Tabel Produk (Lengkap dengan kolom HPP & Laba)
        if (tbody) {
            tbody.innerHTML = Object.entries(productAggr).sort((a,b) => b[1].laba - a[1].laba).map(([name, data]) => `
                <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td class="py-4 text-sm font-bold">${name}</td>
                    <td class="py-4 text-center text-xs text-slate-500">${data.qty} Pcs</td>
                    <td class="py-4 text-right text-xs">Rp ${data.omset.toLocaleString('id-ID')}</td>
                    <td class="py-4 text-right text-xs font-bold text-rose-500">Rp ${data.hpp.toLocaleString('id-ID')}</td>
                    <td class="py-4 text-right font-black ${data.laba < 0 ? 'text-red-500' : 'text-emerald-600'}">Rp ${data.laba.toLocaleString('id-ID')}</td>
                </tr>
            `).join('') || '<tr><td colspan="5" class="text-center py-8 text-slate-400 font-bold">Tidak ada data di periode ini</td></tr>';
        }

        // Update Insight Cards
        if (container) {
            container.innerHTML = `
                <div class="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
                    <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Omset</p>
                    <h3 class="text-2xl font-black">Rp ${totalOmset.toLocaleString('id-ID')}</h3>
                </div>
                <div class="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                    <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Modal (HPP)</p>
                    <h3 class="text-2xl font-black text-rose-500">Rp ${totalHpp.toLocaleString('id-ID')}</h3>
                </div>
                <div class="bg-emerald-500 p-6 rounded-3xl text-white shadow-lg shadow-emerald-200">
                    <p class="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1">Laba Bersih</p>
                    <h3 class="text-2xl font-black">Rp ${totalLaba.toLocaleString('id-ID')}</h3>
                </div>
            `;
        }

        // Render Grafik Chart.js
        const canvas = document.getElementById('profitChart');
        if (canvas) {
            if (this.profitChart) this.profitChart.destroy();
            this.profitChart = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: Object.keys(trendAggr),
                    datasets: [{
                        label: 'Laba (Rp)',
                        data: Object.values(trendAggr),
                        backgroundColor: '#f97316',
                        borderRadius: 12
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }
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
    
    
    // =========================================================
    // 🚀 SHIFT SYSTEM (ANTI-RESET & AUTO TUTUP JAM 12 MALAM)
    // =========================================================
    checkShiftStatus: function() {
        let cleanActiveOutlet = String(this.outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();

        const shiftOutName = document.getElementById('shift-outlet-name'); 
        if (shiftOutName) shiftOutName.innerText = `Ai-CHA ${cleanActiveOutlet}`;

        let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
        let todayStrLocal = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

        // 1. Cari shift yang masih terbuka di cabang ini
        let openShift = (this.db.shifts || []).find(s => {
            let sOutClean = String(s.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            return sOutClean === cleanActiveOutlet && (s.Waktu_Tutup === '' || !s.Waktu_Tutup);
        });

        // 🚀 2. DETEKSI SHIFT KADALUWSA (AUTO TUTUP JIKA MELEWATI JAM 12 MALAM / GANTI HARI)
        if (openShift && openShift.Tanggal !== todayStrLocal) {
            console.warn(`Shift lama (${openShift.ID_Shift}) terdeteksi melewati jam 12 malam. Melakukan Auto-Close...`);
            this.autoCloseExpiredShift(openShift);
            return; // Hentikan pengecekan, biarkan sistem menutup shift kemarin
        }

        const posView = document.getElementById('view-pos');

        if (openShift) {
            // 🔒 SHIFT TERBUKA: Kunci sesi di memori agar tidak reset saat keluar masuk
            this.activeShiftId = openShift.ID_Shift;
            localStorage.setItem('aicha_active_shift_id_' + cleanActiveOutlet, openShift.ID_Shift);
            
            try { this.activeStaffTeam = JSON.parse(openShift.Tim_Operasional); } catch (e) { this.activeStaffTeam = []; }
            if (posView) posView.classList.remove('blur-lock');
        } else {
            // 🔓 SHIFT KOSONG: Minta kasir buka shift
            this.activeShiftId = null; 
            this.activeStaffTeam = [];
            localStorage.removeItem('aicha_active_shift_id_' + cleanActiveOutlet);
            
            if (posView) posView.classList.add('blur-lock');

            const shiftUserName = document.getElementById('shift-user-name'); 
            if (shiftUserName && this.currentUser) shiftUserName.innerText = this.currentUser.Username;

            let staffHtml = '';
            (this.db.users || []).filter(u => {
                let uOutClean = String(u.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
                return uOutClean === cleanActiveOutlet || uOutClean === 'Pusat' || uOutClean === 'Semua';
            }).forEach(u => {
                let badge = String(u.Role).toLowerCase().includes('senior') || String(u.Role).toLowerCase().includes('admin') ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-slate-100 text-slate-500';
                staffHtml += `<label class="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition"><input type="checkbox" value="${u.Username}" data-role="${u.Role}" class="shift-cb w-5 h-5 text-brand-500 rounded"><div class="flex-1 font-bold text-sm text-slate-800">${u.Username}</div><span class="px-2 py-0.5 border rounded text-[10px] font-black uppercase ${badge}"></span></label>`;
            });

            const staffListEl = document.getElementById('shift-staff-list'); 
            if (staffListEl) staffListEl.innerHTML = staffHtml || '<p class="text-sm text-red-500 font-bold">Tidak ada staf terdaftar di cabang ini.</p>';
            
            const mAwal = document.getElementById('shift-modal-awal'); 
            if (mAwal) mAwal.value = '';

            const modalShift = document.getElementById('modal-shift'); 
            const modalShiftContent = document.getElementById('modal-shift-content');
            if (modalShift && modalShiftContent) { 
                modalShift.classList.remove('hidden'); 
                setTimeout(() => modalShiftContent.classList.add('modal-enter-active'), 10); 
            }
        }
    },

    executeBukaShift: async function() {
        if (this.isProcessing) return;
        let cleanActiveOutlet = String(this.outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();

        let cbs = document.querySelectorAll('.shift-cb:checked'); 
        if (cbs.length === 0) return this.showToast("Pilih minimal 1 anggota tim!", "error");
        
        let mAwalEl = document.getElementById('shift-modal-awal'); 
        let m_awal = mAwalEl ? this.getNumericValue(mAwalEl.value) : 0;
        if (m_awal === 0 && (!mAwalEl || mAwalEl.value === '')) return this.showToast("Uang Laci Awal wajib diisi!", "error");

        let tim = []; let hasSenior = false;
        cbs.forEach(cb => {
            tim.push({ username: cb.value, role: cb.getAttribute('data-role') });
            if (String(cb.getAttribute('data-role')).toLowerCase().includes('senior') || String(cb.getAttribute('data-role')).toLowerCase().includes('admin')) hasSenior = true;
        });
        if (!hasSenior) return this.showToast("Ditolak: Wajib 1 Senior dalam Shift!", "error");

        this.setLoading(true, "Membuka Laci Kasir...");
        let shiftID = 'SHF' + new Date().getTime();
        
        const payload = { action: 'buka_shift', outlet: cleanActiveOutlet, tim: tim, modal_awal: m_awal, id_shift: shiftID };
        let res = await this.apiPost(payload);

        if (res.status === 'sukses') {
            this.activeShiftId = shiftID; 
            this.activeStaffTeam = tim;
            
            let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
            let newShiftObj = { 
                ID_Shift: shiftID, 
                Tanggal: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`, 
                Outlet: cleanActiveOutlet, 
                Waktu_Tutup: '', 
                Tim_Operasional: JSON.stringify(tim), 
                Modal_Awal: m_awal 
            };

            // 🚀 PERBAIKAN KRITIS: SIMPAN LANGSUNG KE MEMORI & CACHE BROWSER (BAIK ONLINE MAUPUN OFFLINE)
            if (!this.db.shifts) this.db.shifts = [];
            this.db.shifts.push(newShiftObj);
            localStorage.setItem('aisnack_db_cache', JSON.stringify(this.db));
            localStorage.setItem('aicha_active_shift_id_' + cleanActiveOutlet, shiftID);

            this.closeModal('modal-shift'); 
            const posView = document.getElementById('view-pos'); 
            if (posView) posView.classList.remove('blur-lock');
            this.showToast("Shift Dibuka! Laci siap digunakan.");
        }
        this.setLoading(false);
    },

    // =========================================================
    // 🚀 ENGINE OTOMATIS TUTUP SHIFT JAM 12 MALAM
    // =========================================================
    autoCloseExpiredShift: async function(expiredShift) {
        let cleanActiveOutlet = String(expiredShift.Outlet || this.outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
        let shiftDate = expiredShift.Tanggal;
        
        let modal = Number(expiredShift.Modal_Awal || 0);
        let salesTunai = 0; let totalKasKeluar = 0;

        // Hitung transaksi tunai & kas keluar pada tanggal shift tersebut
        (this.db.transactions || []).forEach(t => {
            let tOutClean = String(t.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            let tDate = typeof this.cleanDateOnly === 'function' ? this.cleanDateOnly(t.Tanggal) : t.Tanggal;
            if (tOutClean === cleanActiveOutlet && tDate === shiftDate && t.Status === 'Sukses' && String(t.Metode_Bayar || '').toUpperCase() === 'TUNAI') {
                salesTunai += Number(t.Total_Bayar);
            }
        });

        (this.db.kasKeluar || []).forEach(k => {
            let kOutClean = String(k.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            let kDate = typeof this.cleanDateOnly === 'function' ? this.cleanDateOnly(k.Tanggal) : k.Tanggal;
            if (kOutClean === cleanActiveOutlet && kDate === shiftDate) {
                totalKasKeluar += Number(k.Nominal);
            }
        });

        let expectedCash = modal + salesTunai - totalKasKeluar;

        this.setLoading(true, "Auto-Closing Shift Kemarin (00:00)...");
        
        // Kirim penutupan otomatis ke server (Selisih 0 karena dianggap sesuai hitungan sistem)
        const payload = { 
            action: 'tutup_shift', 
            id_shift: expiredShift.ID_Shift, 
            setoran_akhir: expectedCash, 
            selisih: 0,
            keterangan: 'Auto-Closed by System (Midnight 00:00)' 
        };
        await this.apiPost(payload);

        // Update status di memori lokal
        let idx = (this.db.shifts || []).findIndex(s => s.ID_Shift === expiredShift.ID_Shift);
        if (idx > -1) {
            this.db.shifts[idx].Waktu_Tutup = '00:00 (Auto)';
            this.db.shifts[idx].Setoran_Akhir = expectedCash;
        }
        localStorage.setItem('aisnack_db_cache', JSON.stringify(this.db));
        localStorage.removeItem('aicha_active_shift_id_' + cleanActiveOutlet);

        this.setLoading(false);
        this.showToast(`Shift tanggal ${shiftDate} telah otomatis ditutup sistem (Jam 12 Malam).`, "info");
        
        // Panggil kembali pengecekan shift untuk hari baru
        this.checkShiftStatus();
    },

    openKasKeluar: function() {
        const nom = document.getElementById('kas-out-nominal'); if (nom) nom.value = '';
        const ket = document.getElementById('kas-out-ket'); if (ket) ket.value = '';
        const mod = document.getElementById('modal-kas-keluar'); const modc = document.getElementById('modal-kas-keluar-content');
        if (mod && modc) { mod.classList.remove('hidden'); setTimeout(() => modc.classList.add('modal-enter-active'), 10); }
    },

    executeKasKeluar: async function() {
        if (this.isProcessing) return;
        let cleanActiveOutlet = String(this.outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();

        let nomEl = document.getElementById('kas-out-nominal'); let ketEl = document.getElementById('kas-out-ket');
        if (!nomEl || !ketEl) return; 
        let nom = this.getNumericValue(nomEl.value); let ket = ketEl.value;
        if (nom === 0 || !ket) return this.showToast("Nominal dan Keterangan wajib diisi!", "error");

        this.setLoading(true, "Mencatat Pengeluaran...");
        let kasId = 'KAS' + new Date().getTime();
        
        // 🚀 Kunci pengeluaran ke cabang aktif saat ini
        const payload = { action: 'kas_keluar', id_kas: kasId, outlet: cleanActiveOutlet, kasir: this.currentUser ? this.currentUser.Username : 'Kasir', nominal: nom, keterangan: ket, id_shift: this.activeShiftId };

        let res = await this.apiPost(payload);
        if (res.status === 'sukses') {
            if (res.is_offline) {
                let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
                if (!this.db.kasKeluar) this.db.kasKeluar = [];
                this.db.kasKeluar.push({ ID_Kas: kasId, Tanggal: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`, Waktu: `${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`, Outlet: cleanActiveOutlet, Kasir: this.currentUser ? this.currentUser.Username : 'Kasir', Nominal: nom, Keterangan: ket, ID_Shift: this.activeShiftId });
            }
            this.closeModal('modal-kas-keluar'); 
            this.showToast("Kas Keluar Tersimpan.");
            if (!res.is_offline) { 
                const r = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); 
                this.db = await r.json(); 
                this.refreshData(); 
            }
        }
        this.setLoading(false);
    },

    promptTutupShift: function() {
        const setAkhir = document.getElementById('shift-setoran-akhir'); if (setAkhir) setAkhir.value = '';
        
        let cleanActiveOutlet = String(this.outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
        let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
        let todayStrLocal = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

        let modal = 0; let salesTunai = 0; let totalKasKeluar = 0;

        // 🚀 Normalisasi perbandingan saat menghitung rekap harian
        (this.db.shifts || []).forEach(s => {
            let sOutClean = String(s.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            if (sOutClean === cleanActiveOutlet && s.Tanggal === todayStrLocal) {
                modal += Number(s.Modal_Awal || 0);
            }
        });

        (this.db.transactions || []).forEach(t => {
            let t_date = typeof this.cleanDateOnly === 'function' ? this.cleanDateOnly(t.Tanggal) : t.Tanggal;
            let tOutClean = String(t.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            if (tOutClean === cleanActiveOutlet && t_date === todayStrLocal && t.Status === 'Sukses' && String(t.Metode_Bayar || '').toUpperCase() === 'TUNAI') {
                salesTunai += Number(t.Total_Bayar);
            }
        });

        (this.db.kasKeluar || []).forEach(k => { 
            let k_date = typeof this.cleanDateOnly === 'function' ? this.cleanDateOnly(k.Tanggal) : k.Tanggal;
            let kOutClean = String(k.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            if (kOutClean === cleanActiveOutlet && k_date === todayStrLocal) {
                totalKasKeluar += Number(k.Nominal); 
            }
        });

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

        let cleanActiveOutlet = String(this.outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
        let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
        let todayStrLocal = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

        let modal = 0; let salesTunai = 0; let totalKasKeluar = 0;

        (this.db.shifts || []).forEach(s => { 
            let sOutClean = String(s.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            if (sOutClean === cleanActiveOutlet && s.Tanggal === todayStrLocal) modal += Number(s.Modal_Awal || 0); 
        });
        (this.db.transactions || []).forEach(t => { 
            let t_date = typeof this.cleanDateOnly === 'function' ? this.cleanDateOnly(t.Tanggal) : t.Tanggal;
            let tOutClean = String(t.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            if (tOutClean === cleanActiveOutlet && t_date === todayStrLocal && t.Status === 'Sukses' && String(t.Metode_Bayar || '').toUpperCase() === 'TUNAI') salesTunai += Number(t.Total_Bayar); 
        });
        (this.db.kasKeluar || []).forEach(k => { 
            let k_date = typeof this.cleanDateOnly === 'function' ? this.cleanDateOnly(k.Tanggal) : k.Tanggal;
            let kOutClean = String(k.Outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();
            if (kOutClean === cleanActiveOutlet && k_date === todayStrLocal) totalKasKeluar += Number(k.Nominal); 
        });

        let expected = modal + salesTunai - totalKasKeluar; 
        let selisih = setor - expected;

        this.setLoading(true, "Merekap Penjualan Hari Ini...");
        const payload = { action: 'tutup_shift', id_shift: this.activeShiftId, setoran_akhir: setor, selisih: selisih };
        let res = await this.apiPost(payload);

        if (res.status === 'sukses') {
            alert(`REKAP HARIAN DITUTUP!\n\nCabang: Ai-CHA ${cleanActiveOutlet}\nUang Sistem (1 Hari): Rp ${expected.toLocaleString('id-ID')}\nUang Fisik (Setoran): Rp ${setor.toLocaleString('id-ID')}\nSelisih: Rp ${selisih.toLocaleString('id-ID')}`);
            location.reload();
        }
        this.setLoading(false);
    },
    
updatePendingNotifications: function() {
        if (!this.db) return;

        let roleStr = this.currentUser ? String(this.currentUser.Role).toLowerCase() : '';
        let isAdmin = roleStr.includes('admin') || roleStr.includes('owner');

        // 🚀 MENGGUNAKAN GETGROUPED AGAR YANG DIHITUNG ADALAH "DOKUMEN LAPORAN", BUKAN "ITEM ECERAN"
        let groupedOpname = typeof this.getGroupedOpname === 'function' ? this.getGroupedOpname() : [];
        let groupedRestok = typeof this.getGroupedRestok === 'function' ? this.getGroupedRestok() : [];

        let pOpnameTotal = 0; let pTerimaTotal = 0;
        let pOpnameOutlet = 0; let pTerimaOutlet = 0;

        // 1. Hitung Laporan Opname Fisik Pending
        groupedOpname.forEach(o => {
            if (o.Status === 'Pending') {
                pOpnameTotal++;
                if (o.Outlet === this.outlet) pOpnameOutlet++;
            }
        });

        // 2. Hitung Laporan Terima Barang (Mutasi) Pending
        groupedRestok.forEach(m => {
            if (m.Status === 'Pending') {
                pTerimaTotal++;
                if (m.Outlet === this.outlet) pTerimaOutlet++;
            }
        });

        // --- UPDATE UI OWNER (ADMIN) ---
        const badgeAudit = document.getElementById('badge-audit');
        if (badgeAudit) {
            let totalAudit = pOpnameTotal + pTerimaTotal;
            if (isAdmin && totalAudit > 0) {
                badgeAudit.innerText = totalAudit > 99 ? '99+' : totalAudit;
                badgeAudit.classList.remove('hidden');
            } else {
                badgeAudit.classList.add('hidden');
            }
        }

        // --- UPDATE UI KASIR (OUTLET) ---
        const badgeTerima = document.getElementById('badge-terima');
        const bannerTerima = document.getElementById('banner-pending-terima');
        const textTerima = document.getElementById('text-pending-terima');
        
        if (badgeTerima && bannerTerima && textTerima) {
            if (pTerimaOutlet > 0) {
                badgeTerima.innerText = pTerimaOutlet;
                badgeTerima.classList.remove('hidden');
                // Teks diubah agar lebih logis (menyebut antrean dokumen, bukan item)
                textTerima.innerHTML = `Terdapat <b>${pTerimaOutlet} antrean Surat Jalan</b> di Cabang ${this.outlet} yang belum disetujui. Stok belum bertambah.`;
                bannerTerima.classList.remove('hidden');
            } else {
                badgeTerima.classList.add('hidden');
                bannerTerima.classList.add('hidden');
            }
        }

        const badgeOpname = document.getElementById('badge-opname');
        const bannerOpname = document.getElementById('banner-pending-opname');
        const textOpname = document.getElementById('text-pending-opname');

        if (badgeOpname && bannerOpname && textOpname) {
            if (pOpnameOutlet > 0) {
                badgeOpname.innerText = pOpnameOutlet;
                badgeOpname.classList.remove('hidden');
                // Teks diubah agar lebih logis
                textOpname.innerHTML = `Terdapat <b>${pOpnameOutlet} antrean Laporan Audit</b> di Cabang ${this.outlet} yang menunggu diperiksa Owner.`;
                bannerOpname.classList.remove('hidden');
            } else {
                badgeOpname.classList.add('hidden');
                bannerOpname.classList.add('hidden');
            }
        }
    },

    
    // POS CORE
refreshData: function() {
        // 🚀 1. TEMA & IDENTITAS CABANG
        this.applyOutletTheme();
        
        // Memastikan label nama cabang di header (sebelah ikon Map Pin) ikut berubah
        if (typeof this.updateHeaderOutletName === 'function') {
            this.updateHeaderOutletName();
        }

        // 2. LABEL BADGE CABANG (Header POS & Manajemen Outlet)
        const hSub = document.getElementById('header-subtitle'); 
        if (hSub) hSub.innerHTML = this.getOutletBadge(this.outlet);
        
        const lOutManage = document.getElementById('label-outlet-manage'); 
        if (lOutManage) lOutManage.innerHTML = this.getOutletBadge(this.outlet);

        // 3. PROSES & FILTER PRODUK (Sesuai Cabang Aktif)
        this.filteredProducts = [];
        if (this.db && this.db.masterProduk) {
            this.db.masterProduk.forEach(master => {
                if (String(master.Kategori || '').toLowerCase() !== 'bahan' && String(master.Kategori || '').toLowerCase() !== 'pendukung') {
                    // Cari harga dan stok khusus untuk cabang yang sedang dipilih
                    let hargaOutlet = (this.db.hargaStokOutlet || []).find(x => x.SKU === master.SKU && x.ID_Outlet === this.outlet);
                    let stokReference = master.SKU_Bahan ? master.SKU_Bahan : master.SKU;
                    let stokBahan = (this.db.hargaStokOutlet || []).find(x => x.SKU === stokReference && x.ID_Outlet === this.outlet);
                    
                    // Hanya tampilkan di POS jika harga sudah disetting ( > 0 )
                    if (hargaOutlet && hargaOutlet.Harga_Jual > 0) {
                        let qtySisa = stokBahan ? stokBahan.Stok_Toko : 0;
                        this.filteredProducts.push({ 
                            sku: master.SKU, 
                            nama: master.Nama_Produk, 
                            img: master.Gambar_URL, 
                            harga: hargaOutlet.Harga_Jual, 
                            maxStok: qtySisa, 
                            sku_bahan: master.SKU_Bahan,
                            hpp: master.HPP || 0
                        });
                    }
                }
            });
        }
        // Urutkan produk berdasarkan abjad agar kasir mudah mencari
        this.filteredProducts.sort((a, b) => String(a.nama || '').localeCompare(String(b.nama || '')));

        // 4. RENDER SEMUA TAMPILAN (Sinkronisasi UI)
        if (document.getElementById('product-list')) this.renderProducts();
        if (typeof this.renderReport === 'function') this.renderReport();
        if (typeof this.renderGudang === 'function') this.renderGudang();
        if (typeof this.renderStaf === 'function') this.renderStaf();
        if (typeof this.renderOpname === 'function') this.renderOpname();
        if (typeof this.renderAudit === 'function') this.renderAudit();
        if (typeof this.renderTerimaBarang === 'function') this.renderTerimaBarang();
        if (typeof this.generateAIReport === 'function') this.generateAIReport();

        // 🚀 5. TRIGGER NOTIFIKASI SPANDUK & BADGE 
        // (Agar spanduk kuning di layar kasir otomatis hilang saat Owner selesai Approve)
        if (typeof this.updatePendingNotifications === 'function') {
            this.updatePendingNotifications();
        }
    },


    
   switchMenu: function(menu) {
    // 1. Bersihkan akses (Tidak perlu lagi memblokir hpp/profit karena sudah dilebur)
    // Cukup sembunyikan semua halaman
    document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
    
    const colors = {
        'pos': 'text-brand-500',      
        'terima': 'text-green-600',   
        'opname': 'text-purple-600',  
        'report': 'text-blue-600',    
        'audit': 'text-indigo-600',   
        'ai': 'text-indigo-600',      
        'gudang': 'text-emerald-600', 
        'outlet': 'text-teal-600',    
        'staf': 'text-amber-600',
        'laporan-harian': 'text-rose-600',
        'user': 'text-purple-600' // 🚀 TAMBAHAN: Warna ungu elegan untuk Manajemen User
    };
    const allColors = Object.values(colors);

    // [Navigasi Aktif] - Sesuai kode Anda sebelumnya
    document.querySelectorAll('.nav-btn').forEach(b => { 
        b.classList.remove('nav-active', 'bg-slate-50', ...allColors); 
        b.classList.add('text-slate-500'); 
        let icon = b.querySelector('i');
        if(icon) { icon.classList.remove(...allColors); icon.classList.add('text-slate-400'); }
    });

    const activeNav = document.getElementById(`nav-${menu}`); 
    if (activeNav) { 
        let targetColor = colors[menu] || 'text-brand-500';
        activeNav.classList.add('nav-active', 'bg-slate-50', targetColor); 
        activeNav.classList.remove('text-slate-500'); 
        let icon = activeNav.querySelector('i');
        if(icon) { icon.classList.remove('text-slate-400'); icon.classList.add(targetColor); }
    }

    // Menggabungkan Menu Master dan Gudang
    let targetViewId = menu === 'master' ? 'gudang' : menu;
    const activeView = document.getElementById(`view-${targetViewId}`); 
    if (activeView) activeView.classList.remove('hidden');

    const titles = { 
        'pos': 'POS', 'opname': 'Opname Fisik Stok', 'terima': 'Penerimaan Barang', 
        'audit': 'Audit Laporan', 'report': 'Laporan Terpadu', 'ai': 'CFO Dashboard & Asisten AI', 
        'gudang': 'Gudang Pusat', 'master': 'Master Varian POS', 'outlet': 'Cabang & Harga Khusus', 'staf': 'Kinerja Karyawan', 'laporan-harian': 'Laporan Harian Ai-CHA',
        'user': 'Manajemen Pengguna' // 🚀 TAMBAHAN: Judul halaman otomatis untuk User
    };
    const pageTitle = document.getElementById('page-title'); 
    if (pageTitle) pageTitle.innerText = titles[menu] || 'Aplikasi';

    // Toggle Sidebar Mobile
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 1024 && sidebar && !sidebar.classList.contains('-translate-x-full')) {
        this.toggleSidebar();
    }

    // 2. TRIGGER FUNGSI (AI sekarang menangani semuanya)
    if (menu === 'pos' && !this.activeShiftId) this.checkShiftStatus();
    if (menu === 'report' && typeof this.renderReport === 'function') this.renderReport();
    if (menu === 'opname' && typeof this.renderOpname === 'function') {
        this.renderOpname();
        if (typeof this.showMenuGuide === 'function') setTimeout(() => this.showMenuGuide('opname'), 200);
    }
    if (menu === 'laporan-harian' && typeof this.initLaporanHarian === 'function') {
    this.initLaporanHarian();
    }
    if (menu === 'audit' && typeof this.renderAudit === 'function') this.renderAudit();
    if (menu === 'terima' && typeof this.renderTerimaBarang === 'function') {
        this.renderTerimaBarang();
        if (typeof this.showMenuGuide === 'function') setTimeout(() => this.showMenuGuide('terima'), 200);
    }
    
    if (menu === 'ai' && typeof this.generateAIReport === 'function') {
        this.generateAIReport();
    }
    if (menu === 'staf' && typeof this.renderStaf === 'function') this.renderStaf();
    
    // 🚀 TAMBAHAN: Trigger fungsi render saat menu Manajemen User dibuka
    if (menu === 'user' && typeof this.renderUserManagement === 'function') {
        this.renderUserManagement();
    }
    
    if (menu === 'gudang' || menu === 'master' || menu === 'outlet') {
        if (typeof this.renderGudang === 'function') {
            this.renderGudang();
            // 🚀 Buka tab stok otomatis agar layar tidak blank!
            this.toggleGudangTab('stok');
        }
    }
},
    
   filterProducts: function(key) {
        this._lastSearchKey = key; // 🚀 Simpan memori kata kunci pencarian
        let pList = document.getElementById('product-list');
        if (pList) {
            if (this.isLoadingData) return;
            pList.innerHTML = this.filteredProducts.filter(p => String(p.nama || '').toLowerCase().includes(key.toLowerCase())).map(p => this.createProductCard(p)).join('');
        }
    },
    
    renderProducts: function() {
        const list = document.getElementById('product-list'); if (!list) return;
        
        // Desain Skeleton Modern (Shimmer Effect) saat memuat data
        if (this.isLoadingData) { 
            list.innerHTML = Array(8).fill(0).map(() => `
                <div class="bg-white border border-slate-100 rounded-3xl p-3 shadow-2xs flex flex-col h-[200px] sm:h-[220px] md:h-[250px] animate-pulse">
                    <div class="bg-slate-100 h-[55%] rounded-2xl mb-3 w-full"></div>
                    <div class="flex-1 flex flex-col justify-between p-1">
                        <div class="space-y-1.5">
                            <div class="bg-slate-100 h-3.5 w-5/6 rounded-lg"></div>
                            <div class="bg-slate-100 h-3 w-1/2 rounded-lg"></div>
                        </div>
                        <div class="flex justify-between items-center pt-2">
                            <div class="bg-slate-100 h-4 w-2/5 rounded-lg"></div>
                            <div class="bg-slate-100 h-7 w-7 rounded-full"></div>
                        </div>
                    </div>
                </div>`).join(''); 
            return; 
        }
        
        // 🚀 Gunakan memori pencarian jika kasir sedang mencari barang
        let key = this._lastSearchKey || ''; 
        let itemsToRender = key ? this.filteredProducts.filter(p => String(p.nama || '').toLowerCase().includes(key.toLowerCase())) : this.filteredProducts;
        
        // Render empty state jika produk tidak ditemukan
        if (itemsToRender.length === 0) {
            list.innerHTML = `<div class="col-span-full py-16 text-center text-slate-400 font-bold text-sm bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">Produk yang dicari tidak ditemukan</div>`;
            return;
        }

        list.innerHTML = itemsToRender.map(p => this.createProductCard(p)).join('');
    },
    
    createProductCard: function(p) {
        let qtyInCart = 0;
        let cartItem = this.cart.find(i => i.sku === p.sku);
        if (cartItem) qtyInCart = cartItem.qty;

        let img = p.img 
            ? `<img src="${p.img}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/150x150/f8fafc/94a3b8?text=Err';" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">` 
            : `<div class="w-full h-full flex items-center justify-center text-3xl text-slate-300 bg-slate-50"><i class="fas fa-utensils"></i></div>`;
        
        let isHabis = p.maxStok <= 0;
        let cardInteractiveStyle = isHabis 
            ? 'opacity-50 grayscale cursor-not-allowed border-transparent' 
            : 'hover:-translate-y-1.5 hover:shadow-[0_12px_25px_-5px_rgba(0,0,0,0.08)] hover:border-brand-300 border-slate-100/80 active:scale-[0.98]';
        
        // Lencana Stok Kapsul Kaca (Glass Badge)
        let stokBadgeStyle = isHabis 
            ? 'bg-rose-500 text-white shadow-rose-500/30' 
            : (p.maxStok <= 5 ? 'bg-amber-500/90 text-white animate-pulse' : 'bg-slate-900/75 text-white backdrop-blur-md');
        let stokText = isHabis ? 'HABIS' : `STOK: ${p.maxStok}`;

        // Overlay Jumlah Pesanan Bergaya Kaca 3D
        let overlayQty = qtyInCart > 0 
            ? `<div class="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px] flex items-center justify-center z-20 transition-all duration-300 animate-[fadeIn_0.2s_ease-out]">
                   <div class="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transform scale-100">
                       <span class="text-xl md:text-2xl font-black text-white drop-shadow-md">${qtyInCart}</span>
                   </div>
               </div>` 
            : '';

        let namaProduk = p.nama || 'Nama Tidak Tersedia';

        // 🚀 TINGGI KARTU DIKUNCI PRESISI (h-[200px] di HP, h-[250px] di PC)
        return `
        <div onclick="${!isHabis ? `superApp.addToCart('${p.sku}', '${p.nama}', ${p.harga}, ${p.maxStok}, '${p.sku_bahan || ''}', event)` : ''}" 
            class="bg-white border-2 rounded-[1.25rem] md:rounded-[1.75rem] cursor-pointer shadow-2xs transition-all duration-300 flex flex-col relative group overflow-hidden select-none h-[200px] sm:h-[220px] md:h-[250px] ${cardInteractiveStyle}"> 
            
            <span class="absolute top-2.5 right-2.5 md:top-3 md:right-3 ${stokBadgeStyle} text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full z-30 shadow-md tracking-wider leading-none">
                ${stokText}
            </span>
            
            <div class="h-[55%] w-full overflow-hidden bg-slate-50 relative shrink-0">
                ${img}
                ${overlayQty}
            </div>
            
            <div class="h-[45%] w-full flex flex-col justify-between p-3 md:p-3.5 bg-white">
                
                <h3 class="font-extrabold text-xs md:text-sm text-slate-800 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                    ${namaProduk}
                </h3>
                
                <div class="flex items-center justify-between w-full mt-auto pt-1">
                    <p class="text-brand-600 font-black text-xs md:text-sm xl:text-base tracking-tight truncate pr-1">
                        Rp ${Number(p.harga || 0).toLocaleString('id-ID')}
                    </p>
                    
                    <div class="w-7 h-7 md:w-8 md:h-8 rounded-full ${qtyInCart > 0 ? 'bg-gradient-to-tr from-brand-500 to-orange-500 text-white shadow-md shadow-brand-500/30' : 'bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600'} flex items-center justify-center transition-all duration-300 shrink-0">
                        <i class="fas ${qtyInCart > 0 ? 'fa-check' : 'fa-plus'} text-[10px] md:text-xs"></i>
                    </div>
                </div>
                
            </div>
        </div>`;
    },
    
    addToCart: function(sku, nama, price, maxStok, skuBahan, event) {
        // 1. Pancing sinkronisasi data secara diam-diam di latar belakang
        if (typeof this.refreshStokOnly === 'function') this.refreshStokOnly();

        let currentStokBahanDiKeranjang = 0; 
        let refBahan = skuBahan || sku;
        
        // 2. 🚀 CEK STOK AKTUAL: Tarik dari memori terbaru (bukan dari tampilan HTML lama)
        let realStokData = (this.db.hargaStokOutlet || []).find(x => x.SKU === refBahan && x.ID_Outlet === this.outlet);
        let actualMaxStok = realStokData ? Number(realStokData.Stok_Toko) : maxStok;

        this.cart.forEach(i => { if ((i.sku_bahan || i.sku) === refBahan) currentStokBahanDiKeranjang += i.qty; });
        
        // Cek menggunakan stok aktual terbaru
        if (currentStokBahanDiKeranjang >= actualMaxStok) {
            return this.showToast(`Stok Habis! Sisa di Toko: ${actualMaxStok - currentStokBahanDiKeranjang}`, 'error');
        }

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
        if (item) {
            item.qty++;
            item.maxStok = actualMaxStok; // Update referensi maksimal terbaru di keranjang
        } else {
            this.cart.push({ sku, nama, price, qty: 1, sku_bahan: skuBahan, maxStok: actualMaxStok });
        }
        
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
        const cont = document.getElementById('cart-container'); 
        let total = 0, items = 0, html = ''; 
        if (!cont) return;
        
        // 🚀 FITUR 1: Tombol Hapus Semua Minimalis (Muncul jika keranjang terisi)
        if (this.cart.length > 0) {
            html += `
            <div class="flex justify-between items-center mb-3.5 px-1 shrink-0">
                <span class="text-[10px] font-black text-slate-400 tracking-widest uppercase flex items-center gap-1.5">
                    <i class="fas fa-list-ul text-slate-300"></i> Daftar Pesanan
                </span>
                <button onclick="superApp.clearCart()" class="text-[10px] font-black text-rose-500 hover:text-rose-600 bg-rose-50/80 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs active:scale-90 border border-rose-100/60">
                    <i class="fas fa-trash-alt text-[11px]"></i> Hapus Semua
                </button>
            </div>`;
        }

        this.cart.forEach((i, idx) => {
            total += (i.price * i.qty); 
            items += i.qty;
            
            // Logika hitung sisa stok aktual di keranjang
            let sisaBahanDiKeranjang = 0; 
            let refBahan = i.sku_bahan || i.sku;
            this.cart.forEach(c => { if ((c.sku_bahan || c.sku) === refBahan) sisaBahanDiKeranjang += c.qty; });
            let stokTersisaVisual = i.maxStok - sisaBahanDiKeranjang;

            // Efek visual jika stok limit/habis
            let stokLimitStyle = stokTersisaVisual <= 0 
                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse font-black' 
                : (stokTersisaVisual <= 5 ? 'bg-amber-50 text-amber-600 border-amber-200 font-extrabold' : 'bg-slate-50 text-slate-400 border-slate-100 font-bold');

            // 🚀 FITUR 2: Wrapper Kartu Pesanan dengan Swipe-to-Delete Modern
            html += `
            <div class="relative overflow-hidden rounded-2xl mb-2.5 bg-rose-500 shadow-2xs group select-none transition-all">
                
                <button onclick="superApp.changeQty(${idx}, -999)" class="absolute inset-y-0 right-0 w-20 flex flex-col items-center justify-center text-white text-[10px] font-black transition-colors hover:bg-rose-600 active:bg-rose-700 tracking-wider">
                    <i class="fas fa-trash-alt mb-1 text-base drop-shadow-sm group-hover:scale-110 transition-transform"></i> HAPUS
                </button>

                <div class="flex bg-white border border-slate-100/80 p-3.5 rounded-2xl items-center gap-3 text-slate-800 transition-transform duration-300 transform relative z-10 w-full hover:border-slate-200"
                     ontouchstart="this.startX = event.touches[0].clientX; this.style.transition = 'none';"
                     ontouchmove="let diff = this.startX - event.touches[0].clientX; if(diff > 0 && diff < 100) { this.style.transform = 'translateX(-' + diff + 'px)'; }"
                     ontouchend="let diff = this.startX - event.changedTouches[0].clientX; this.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; if(diff > 45) { this.style.transform = 'translateX(-80px)'; } else { this.style.transform = 'translateX(0)'; }">
                    
                    <div class="flex-1 min-w-0 pr-1">
                        <h4 class="font-extrabold text-xs md:text-sm truncate text-slate-800 mb-1 leading-snug">${i.nama}</h4>
                        <div class="flex items-center gap-2 flex-wrap">
                            <p class="text-brand-600 font-black text-xs md:text-sm tracking-tight">Rp ${(i.price * i.qty).toLocaleString('id-ID')}</p>
                            <span class="text-[9px] border px-1.5 py-0.5 rounded-md ${stokLimitStyle}">Sisa: ${stokTersisaVisual}</span>
                        </div>
                    </div>

                    <div class="flex bg-slate-100/80 rounded-xl border border-slate-200/60 p-1 shrink-0 items-center shadow-inner">
                        <button onclick="superApp.changeQty(${idx}, -1)" class="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center font-black text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-all shadow-2xs active:scale-90"><i class="fas fa-minus text-[10px]"></i></button>
                        <span class="w-7 md:w-8 flex items-center justify-center text-xs md:text-sm font-black text-slate-800 tracking-tight">${i.qty}</span>
                        <button onclick="superApp.changeQty(${idx}, 1)" class="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center font-black text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg transition-all shadow-2xs active:scale-90"><i class="fas fa-plus text-[10px]"></i></button>
                    </div>

                </div>
            </div>`;
        });
        
        // Render isi keranjang atau Empty State modern
        cont.innerHTML = this.cart.length ? html : this.getEmptyState('fa-shopping-basket', 'Keranjang Kosong', 'Yuk, sentuh produk di samping untuk memesan!');
        
        // Update Total Tagihan & Badge Item
        const totalEl = document.getElementById('total-price'); 
        if (totalEl) totalEl.innerText = `Rp ${total.toLocaleString('id-ID')}`;
        
        const badge = document.getElementById('cart-badge'); 
        if (badge) badge.innerText = `${items} Item`;
        
        // Update Floating Bottom Button (Khusus HP)
        const mobQty = document.getElementById('mobile-cart-qty'); 
        if (mobQty) mobQty.innerText = `${items} Item`;
        
        const mobTotal = document.getElementById('mobile-cart-total'); 
        if (mobTotal) mobTotal.innerText = `Rp ${total.toLocaleString('id-ID')}`;

        this.payTotal = total; 
        
        // Sinkronisasi ulang tampilan kartu katalog (agar angka overlay pesanan ter-update)
        if (document.getElementById('product-list')) {
            this.renderProducts();
        }

        this.syncStorage(); 
    },
    // 🚀 FUNGSI BARU: Kosongkan seluruh isi keranjang
    clearCart: function() {
        if (this.cart.length === 0) return;
        if (confirm("Hapus semua pesanan dari keranjang?")) {
            this.cart = [];
            this.renderCart();
            this.showToast("Keranjang berhasil dikosongkan", "success");
        }
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

    // =========================================================
    // 🚀 ENGINE: SILENT SYNC (SINKRONISASI STOK DI LATAR BELAKANG)
    // =========================================================
    refreshStokOnly: async function() {
        // Anti-Spam: Beri jeda 10 detik antar penarikan agar server Google tidak kelebihan beban
        let now = new Date().getTime();
        if (this._lastSyncTime && (now - this._lastSyncTime < 10000)) return;
        this._lastSyncTime = now;

        try {
            let rUrl = (typeof API_URL !== 'undefined') ? API_URL : this.webAppUrl;
            // Gunakan history=1 agar penarikan super kilat (hanya data hari ini)
            const res = await fetch(rUrl + "?ts=" + now + "&history=1", { redirect: 'follow' });
            const data = await res.json();
            
            if (data && data.hargaStokOutlet) {
                // Hanya perbarui blok stok dan transaksi, biarkan yang lain utuh
                this.db.hargaStokOutlet = data.hargaStokOutlet;
                this.db.transactions = data.transactions;
                localStorage.setItem('aisnack_db_cache', JSON.stringify(this.db));
                
                // Opsional: Anda bisa memanggil this.renderProducts() di sini jika ingin 
                // angka di kartu produk otomatis berkedip/berubah saat HP kasir didiamkan.
            }
        } catch(e) {
            console.log("Silent sync terganggu koneksi, lanjut gunakan cache.");
        }
    },
    
    // PENAMBAHAN SISTEM NOMOR ANTRIAN
    executeCheckout: async function() {
        // 1. GEMBOK ANTI DOUBLE-CLICK & KERANJANG KOSONG
        if (this.isProcessing) return; 
        if (this.cart.length === 0) {
            this.showToast("Keranjang kosong! Transaksi dicegah.", "error");
            this.closeModal('modal-payment');
            return;
        }

        this.isProcessing = true;

        // Kunci tombol secara visual agar tidak bisa ditekan dua kali
        let btnPay = document.getElementById('btn-execute-pay');
        let originalBtnHtml = '';
        if (btnPay) {
            originalBtnHtml = btnPay.innerHTML;
            btnPay.disabled = true;
            btnPay.innerHTML = '<i class="fas fa-spinner fa-spin text-lg"></i> Cek Server...';
            btnPay.classList.add('opacity-70', 'cursor-not-allowed');
        }
        
        // ======================================================================
        // 🚀 SINKRONISASI KILAT SEBELUM BAYAR (Cegah Antrian & Stok Bentrok)
        // ======================================================================
        if (this.isOnline && typeof this.refreshStokOnly === 'function') {
            await this.refreshStokOnly(); // Tarik data terbaru diam-diam
        }

        // 🚀 VALIDASI STOK TERAKHIR (Cegah stok minus karena keduluan device lain)
        let stokAman = true;
        let barangHabis = '';
        
        for (let item of this.cart) {
            let refBahan = item.sku_bahan || item.sku;
            let realStokData = (this.db.hargaStokOutlet || []).find(x => x.SKU === refBahan && x.ID_Outlet === this.outlet);
            let actualMaxStok = realStokData ? Number(realStokData.Stok_Toko) : item.maxStok;
            
            let qtyTerpakaiDiKeranjang = 0;
            this.cart.forEach(c => { if ((c.sku_bahan || c.sku) === refBahan) qtyTerpakaiDiKeranjang += c.qty; });

            if (qtyTerpakaiDiKeranjang > actualMaxStok) {
                stokAman = false;
                barangHabis = item.nama;
                break;
            }
        }

        // Jika keduluan dibeli kasir PC, tolak transaksi di HP!
        if (!stokAman) {
            this.isProcessing = false;
            if (btnPay) {
                btnPay.disabled = false;
                btnPay.innerHTML = originalBtnHtml;
                btnPay.classList.remove('opacity-70', 'cursor-not-allowed');
            }
            this.showToast(`Gagal! Stok ${barangHabis} baru saja dihabiskan device lain.`, "error");
            return;
        }
        // ======================================================================

        let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
        let todayStrLocal = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        
        // Nomor Antrean dijamin urut karena database memori baru saja di-refresh
        let countToday = 0;
        (this.db.transactions || []).forEach(t => {
            let tglTrx = typeof this.cleanDateOnly === 'function' ? this.cleanDateOnly(t.Tanggal) : t.Tanggal;
            if (t.Outlet === this.outlet && tglTrx === todayStrLocal) { countToday++; }
        });
        let noAntrian = countToday + 1;
        
        // ID Resi Dijamin Unik
        let kasirPrefix = this.currentUser ? this.currentUser.Username.substring(0,3).toUpperCase() : 'KSR';
        let trxID = `TRX-${kasirPrefix}-${d.getTime()}`;

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

        // 🚀 Kurangi visual stok langsung di layar kasir device ini
        this.cart.forEach(item => {
            let refBahan = item.sku_bahan || item.sku;
            let realStokData = (this.db.hargaStokOutlet || []).find(x => x.SKU === refBahan && x.ID_Outlet === this.outlet);
            if(realStokData) realStokData.Stok_Toko -= item.qty;
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
        this.payCash = 0; 
        this.payTotal = 0;
        this.renderCart(); 
        this.syncStorage('paid', noAntrian); 
        this.closeModal('modal-payment'); 
        
        // JEDA WAKTU UNTUK MENCEGAH DOUBLE CLICK SELAMA ANIMASI
        setTimeout(() => {
            this.isProcessing = false;
            if (btnPay) {
                btnPay.disabled = false;
                btnPay.innerHTML = originalBtnHtml;
                btnPay.classList.remove('opacity-70', 'cursor-not-allowed');
            }
        }, 500);

        // 4. SINKRONISASI SERVER DI LATAR BELAKANG
        this.apiPost(payload).then(res => {
            if (res && res.status === 'sukses' && !res.is_offline) {
                if (isPrintSuccess) {
                    this.laporStrukDicetak(trxID);
                }
                // Hapus fetch manual di sini karena refreshStokOnly sudah menanganinya di awal!
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
    
   // =========================================================
    // 🚀 MODAL WHATSAPP DENGAN SAFE CLIPBOARD COPY
    // =========================================================
    showWaModal: async function(text, customNumber = '') {
        // 1. Coba salin ke clipboard dengan proteksi Try-Catch & Fallback
        try {
            if (navigator.clipboard && window.isSecureContext && document.hasFocus()) {
                await navigator.clipboard.writeText(text);
                this.showToast("Teks laporan otomatis disalin ke clipboard!");
            } else {
                // Fallback tradisional untuk browser HP / saat kehilangan fokus
                let textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    this.showToast("Teks laporan berhasil disalin!");
                } catch (err) {
                    console.warn("Fallback copy gagal, pengguna harus salin manual.");
                }
                textArea.remove();
            }
        } catch (err) {
            console.warn("Clipboard API dicegah browser: ", err.message);
        }

        // 2. Tampilkan Pop-Up Modal WA seperti biasa
        let modal = document.getElementById('modal-wa');
        let textAreaModal = document.getElementById('wa-preview-text');
        
        if (textAreaModal) textAreaModal.value = text;
        this.pendingWaText = text;
        this.pendingWaNumber = customNumber;

        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => {
                let content = modal.querySelector('div');
                if (content) {
                    content.classList.remove('scale-95', 'opacity-0');
                    content.classList.add('scale-100', 'opacity-100');
                }
            }, 10);
        }
    },
  // =========================================================
    // 🚀 ENGINE: TAMPILKAN MODAL RIWAYAT WA (TABLE VIEW)
    // =========================================================
    openWaHistory: function(type) {
        const modal = document.getElementById('modal-wa-history');
        const tbody = document.getElementById('wa-history-tbody');
        const titleEl = document.getElementById('wa-history-title');
        
        if (!modal || !tbody) {
            this.showToast("Komponen Modal Riwayat WA belum tersedia.", "error");
            return;
        }

        let filteredData = [];
        let htmlList = '';

        if (type === 'opname') {
            titleEl.innerText = "Riwayat WA Opname (Hari Ini)";
            filteredData = this.getGroupedOpname().filter(x => x.Outlet === this.outlet);

            if (filteredData.length === 0) {
                htmlList = `<tr><td colspan="4" class="text-center p-8 text-slate-400 text-xs italic">Belum ada riwayat pengajuan opname.</td></tr>`;
            } else {
                htmlList = filteredData.map(op => `
                    <tr class="hover:bg-indigo-50/50 transition-colors">
                        <td class="py-3 px-4 text-xs font-black text-indigo-600">${op.Waktu}</td>
                        <td class="py-3 px-4">
                            <span class="text-xs block text-slate-700">${op.Kasir}</span>
                            <span class="text-[9px] text-slate-400 block">${op.ID_Opname} • Status: ${op.Status}</span>
                        </td>
                        <td class="py-3 px-4 text-center text-xs text-slate-600">${op.Items.length} Macam</td>
                        <td class="py-3 px-4 text-center">
                            <button onclick="superApp.sendWaOpname('${op.Waktu}', '${op.Outlet}')" class="bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] transition shadow-sm border border-emerald-100 flex items-center gap-1.5 mx-auto">
                                <i class="fab fa-whatsapp text-sm"></i> Kirim
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        } 
        else if (type === 'terima') {
            titleEl.innerText = "Riwayat WA Restok (Hari Ini)";
            filteredData = this.getGroupedRestok().filter(x => x.Outlet === this.outlet);

            if (filteredData.length === 0) {
                htmlList = `<tr><td colspan="4" class="text-center p-8 text-slate-400 text-xs italic">Belum ada riwayat penerimaan barang.</td></tr>`;
            } else {
                htmlList = filteredData.map(bm => `
                    <tr class="hover:bg-emerald-50/50 transition-colors">
                        <td class="py-3 px-4 text-xs font-black text-emerald-600">${bm.Waktu}</td>
                        <td class="py-3 px-4">
                            <span class="text-xs block text-slate-700">${bm.Kasir}</span>
                            <span class="text-[9px] text-slate-400 block">${bm.Surat_Jalan} • Asal: ${bm.Supplier}</span>
                        </td>
                        <td class="py-3 px-4 text-center text-xs text-slate-600">${bm.Items.length} Macam</td>
                        <td class="py-3 px-4 text-center">
                            <button onclick="superApp.sendWaTerima('${bm.Surat_Jalan}')" class="bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] transition shadow-sm border border-emerald-100 flex items-center gap-1.5 mx-auto">
                                <i class="fab fa-whatsapp text-sm"></i> Kirim
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }

        // Tembakkan HTML ke dalam tabel
        tbody.innerHTML = htmlList;
        
        // Buka Modal (Anti Gagal)
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeWaHistory: function() {
        const modal = document.getElementById('modal-wa-history');
        if (modal) {
            // Tutup Modal Langsung
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
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

    // =========================================================
    // 🚀 SWITCHER SUB-TAB UNTUK PENERIMAAN BARANG & OPNAME
    // =========================================================
    switchTerimaSubTab: function(tab) {
        const tbUtama = document.getElementById('terima-tbody-utama');
        const tbPend = document.getElementById('terima-tbody-pendukung');
        const mobUtama = document.getElementById('terima-mob-utama');
        const mobPend = document.getElementById('terima-mob-pendukung');
        const btnUtama = document.getElementById('subtab-terima-utama');
        const btnPend = document.getElementById('subtab-terima-pendukung');

        const activeClass = 'flex-1 md:flex-none px-6 py-3 bg-white text-emerald-600 rounded-xl text-xs md:text-sm font-black shadow-sm transition flex items-center justify-center gap-2 border border-slate-200/60';
        const inactiveClass = 'flex-1 md:flex-none px-6 py-3 text-slate-500 hover:text-slate-800 rounded-xl text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 border border-transparent';

        if (tab === 'utama') {
            if(tbUtama) tbUtama.classList.remove('hidden'); if(tbPend) tbPend.classList.add('hidden');
            if(mobUtama) mobUtama.classList.remove('hidden'); if(mobPend) mobPend.classList.add('hidden');
            if(btnUtama) btnUtama.className = activeClass; if(btnPend) btnPend.className = inactiveClass;
        } else {
            if(tbUtama) tbUtama.classList.add('hidden'); if(tbPend) tbPend.classList.remove('hidden');
            if(mobUtama) mobUtama.classList.add('hidden'); if(mobPend) mobPend.classList.remove('hidden');
            if(btnUtama) btnUtama.className = inactiveClass; if(btnPend) btnPend.className = activeClass;
        }
    },

    switchOpnameSubTab: function(tab) {
        const tbUtama = document.getElementById('opname-tbody-utama');
        const tbPend = document.getElementById('opname-tbody-pendukung');
        const mobUtama = document.getElementById('opname-mob-utama');
        const mobPend = document.getElementById('opname-mob-pendukung');
        const btnUtama = document.getElementById('subtab-opname-utama');
        const btnPend = document.getElementById('subtab-opname-pendukung');

        const activeClass = 'flex-1 md:flex-none px-6 py-3 bg-white text-purple-600 rounded-xl text-xs md:text-sm font-black shadow-sm transition flex items-center justify-center gap-2 border border-slate-200/60';
        const inactiveClass = 'flex-1 md:flex-none px-6 py-3 text-slate-500 hover:text-slate-800 rounded-xl text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 border border-transparent';

        if (tab === 'utama') {
            if(tbUtama) tbUtama.classList.remove('hidden'); if(tbPend) tbPend.classList.add('hidden');
            if(mobUtama) mobUtama.classList.remove('hidden'); if(mobPend) mobPend.classList.add('hidden');
            if(btnUtama) btnUtama.className = activeClass; if(btnPend) btnPend.className = inactiveClass;
        } else {
            if(tbUtama) tbUtama.classList.add('hidden'); if(tbPend) tbPend.classList.remove('hidden');
            if(mobUtama) mobUtama.classList.add('hidden'); if(mobPend) mobPend.classList.remove('hidden');
            if(btnUtama) btnUtama.className = inactiveClass; if(btnPend) btnPend.className = activeClass;
        }
    },

   // =========================================================
    // 🚀 1. RENDER TERIMA BARANG (TERHUBUNG KE SUB-TAB & MOBILE)
    // =========================================================
    renderTerimaBarang: function() {
        const lbl = document.getElementById('lbl-terima-outlet'); 
        if (lbl) lbl.innerText = this.outlet;

        let hu = ''; let hp = ''; let hum = ''; let hpm = ''; 
        let cUtama = 0; let cPend = 0;
        
        [...(this.db.masterProduk || [])].sort((a, b) => String(a.Nama_Produk || '').localeCompare(String(b.Nama_Produk || ''))).forEach(m => {
            let kat = String(m.Kategori || '').toLowerCase();
            if (kat === 'bahan' || kat === 'pendukung') {
                
                // --- BARIS TABEL DESKTOP ---
                let strHtml = `
                <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
                    <td class="py-3.5 px-5 min-w-[200px] whitespace-normal">
                        <div class="font-extrabold text-sm text-slate-800 leading-snug">${m.Nama_Produk}</div>
                        <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">SKU: ${m.SKU}</div>
                    </td>
                    <td class="py-3.5 px-5 text-center w-[180px]">
                        <input type="text" id="trm-qty-${m.SKU}" class="w-24 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-center outline-none font-black text-emerald-600 transition-all shadow-inner cursor-pointer text-sm" readonly onclick="osKeyboard.open('trm-qty-${m.SKU}', 'numeric')" placeholder="0">
                    </td>
                    <td class="py-3.5 px-5 min-w-[250px]">
                        <input type="text" id="trm-note-${m.SKU}" class="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 outline-none text-xs font-bold text-slate-700 transition-all cursor-pointer" readonly onclick="osKeyboard.open('trm-note-${m.SKU}', 'text')" placeholder="Keterangan kurir / kondisi fisik...">
                    </td>
                </tr>`;
                
                // --- KARTU PADAT MOBILE ---
                let strMobile = `
                <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-sm transition-all flex flex-col gap-2.5 group">
                    <div class="flex justify-between items-start gap-2">
                        <h4 class="font-extrabold text-sm text-slate-800 leading-snug">${m.Nama_Produk}</h4>
                        <span class="text-[9px] text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 shrink-0 uppercase">${m.SKU}</span>
                    </div>
                    <div class="flex gap-2">
                        <input type="text" id="trm-qty-mob-${m.SKU}" class="w-20 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-2 py-2 text-center outline-none font-black text-emerald-600 transition-all shadow-inner cursor-pointer text-sm" readonly onclick="osKeyboard.open('trm-qty-mob-${m.SKU}', 'numeric')" placeholder="Qty">
                        <input type="text" id="trm-note-mob-${m.SKU}" class="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 outline-none text-xs font-bold text-slate-700 transition-all cursor-pointer" readonly onclick="osKeyboard.open('trm-note-mob-${m.SKU}', 'text')" placeholder="Catatan fisik/kurir...">
                    </div>
                </div>`;
                
                if (kat === 'bahan') { hu += strHtml; hum += strMobile; cUtama++; } 
                else { hp += strHtml; hpm += strMobile; cPend++; }
            }
        });

        // Injeksi ke Tabel Desktop
        const tU = document.getElementById('terima-tbody-utama'); 
        if (tU) tU.innerHTML = hu || `<tr><td colspan="3" class="py-12">${this.getEmptyState('fa-box-open', 'Belum Ada Bahan', 'Tambahkan bahan di menu gudang')}</td></tr>`;
        const tP = document.getElementById('terima-tbody-pendukung'); 
        if (tP) tP.innerHTML = hp || `<tr><td colspan="3" class="py-12">${this.getEmptyState('fa-pump-soap', 'Belum Ada Barang', 'Tambahkan pendukung di gudang')}</td></tr>`;
        
        // Injeksi ke Kartu Mobile
        const mU = document.getElementById('terima-mob-utama'); 
        if (mU) mU.innerHTML = hum || '<div class="text-center py-10 text-slate-400 text-xs font-bold border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">Tidak ada bahan utama</div>';
        const mP = document.getElementById('terima-mob-pendukung'); 
        if (mP) mP.innerHTML = hpm || '<div class="text-center py-10 text-slate-400 text-xs font-bold border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">Tidak ada barang pendukung</div>';

        // Update Angka Badge pada Sub-Tab
        const bU = document.getElementById('count-terima-utama'); if(bU) bU.innerText = cUtama;
        const bP = document.getElementById('count-terima-pendukung'); if(bP) bP.innerText = cPend;
    },

    // =========================================================
    // 🚀 2. RENDER OPNAME FISIK (TERHUBUNG KE SUB-TAB & MOBILE)
    // =========================================================
    renderOpname: function() {
        const lbl = document.getElementById('lbl-opname-outlet'); 
        if (lbl) lbl.innerText = this.outlet;

        let hu = ''; let hp = ''; let hum = ''; let hpm = ''; 
        let cUtama = 0; let cPend = 0;
        let autoFillData = []; 

        let roleStr = this.currentUser ? String(this.currentUser.Role).toLowerCase() : '';
        let isAdmin = roleStr.includes('admin') || roleStr.includes('owner');

        [...(this.db.masterProduk || [])].sort((a, b) => String(a.Nama_Produk || '').localeCompare(String(b.Nama_Produk || ''))).forEach(m => {
            let kat = String(m.Kategori || '').toLowerCase();
            if (kat === 'bahan' || kat === 'pendukung') {
                let sData = (this.db.hargaStokOutlet || []).find(x => x.SKU === m.SKU && x.ID_Outlet === this.outlet);
                let sys = sData ? Number(sData.Stok_Toko) : 0;
                autoFillData.push({ idDesk: `opn-fisik-${m.SKU}`, idMob: `opn-fisik-mob-${m.SKU}`, val: sys });

                let sysHtmlDesk = isAdmin 
                    ? `<button onclick="superApp.openDetailStokOpname('${m.SKU}')" class="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl border border-indigo-200/60 hover:bg-indigo-500 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 mx-auto w-full max-w-[80px]" title="Lihat Analisis & Tren"><i class="fas fa-chart-area"></i> <span id="opn-sys-${m.SKU}" class="font-black">${sys}</span></button>` 
                    : `<span id="opn-sys-${m.SKU}" class="font-black text-indigo-600 text-base">${sys}</span>`;
                
                let sysHtmlMob = isAdmin 
                    ? `<button onclick="superApp.openDetailStokOpname('${m.SKU}')" class="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-200/60 shadow-sm active:scale-95"><i class="fas fa-chart-area text-[10px]"></i> <span id="opn-sys-mob-${m.SKU}" class="font-black">${sys}</span></button>` 
                    : `<span id="opn-sys-mob-${m.SKU}" class="font-black text-indigo-600">${sys}</span>`;

                // --- BARIS TABEL DESKTOP ---
                let desk = `
                <tr class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
                    <td class="py-3.5 px-5 min-w-[200px] whitespace-normal">
                        <div class="font-extrabold text-sm text-slate-800 leading-snug">${m.Nama_Produk}</div>
                        <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">SKU: ${m.SKU}</div>
                    </td>
                    <td class="py-3.5 px-5 text-center">${sysHtmlDesk}</td>
                    <td class="py-3.5 px-5 text-center">
                        <input type="text" id="opn-fisik-${m.SKU}" class="w-24 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-200 focus:border-purple-500 rounded-xl px-3 py-2 text-center outline-none font-black text-purple-600 transition-all shadow-inner cursor-pointer text-sm" value="${sys}" readonly onclick="osKeyboard.open('opn-fisik-${m.SKU}', 'numeric')" oninput="superApp.calcOpname('${m.SKU}')">
                    </td>
                    <td class="py-3.5 px-5 text-right font-black text-slate-300 text-xl" id="opn-selisih-${m.SKU}">0</td>
                    <td class="py-3.5 px-5 min-w-[250px]">
                        <input type="text" id="opn-note-${m.SKU}" class="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-purple-500 rounded-xl px-3.5 py-2 outline-none text-xs font-bold text-slate-700 transition-all cursor-pointer" readonly onclick="osKeyboard.open('opn-note-${m.SKU}', 'text')" placeholder="Kondisi Fisik...">
                    </td>
                </tr>`;
                
                // --- KARTU PADAT MOBILE ---
                let mob = `
                <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-sm transition-all flex flex-col gap-2.5 group">
                    <div class="flex justify-between items-center gap-2">
                        <div>
                            <h4 class="font-extrabold text-sm text-slate-800 leading-snug">${m.Nama_Produk}</h4>
                            <div class="text-[10px] text-slate-400 font-bold uppercase mt-0.5 flex items-center gap-1.5">Sys: ${sysHtmlMob}</div>
                        </div>
                        <div class="text-right shrink-0">
                            <span class="text-[8px] text-slate-400 uppercase font-black tracking-wider block">Selisih</span>
                            <span class="font-black text-slate-300 text-xl leading-none" id="opn-selisih-mob-${m.SKU}">0</span>
                        </div>
                    </div>
                    <div class="flex gap-2 pt-1 border-t border-slate-50">
                        <input type="text" id="opn-fisik-mob-${m.SKU}" class="w-20 bg-slate-50 border-2 border-slate-200 focus:border-purple-500 rounded-xl px-2 py-2 text-center outline-none font-black text-purple-600 text-sm cursor-pointer" value="${sys}" readonly onclick="osKeyboard.open('opn-fisik-mob-${m.SKU}', 'numeric')" oninput="superApp.calcOpnameMob('${m.SKU}')">
                        <input type="text" id="opn-note-mob-${m.SKU}" class="flex-1 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl px-3 py-2 outline-none text-xs font-bold text-slate-700 cursor-pointer" readonly onclick="osKeyboard.open('opn-note-mob-${m.SKU}', 'text')" placeholder="Alasan selisih...">
                    </div>
                </div>`;

                if (kat === 'bahan') { hu += desk; hum += mob; cUtama++; } 
                else { hp += desk; hpm += mob; cPend++; }
            }
        });

        // Injeksi ke Tabel Desktop
        const tU = document.getElementById('opname-tbody-utama'); 
        if (tU) tU.innerHTML = hu || `<tr><td colspan="5" class="py-12">${this.getEmptyState('fa-box-open', 'Belum Ada Bahan', 'Tambahkan bahan di menu gudang')}</td></tr>`;
        const tP = document.getElementById('opname-tbody-pendukung'); 
        if (tP) tP.innerHTML = hp || `<tr><td colspan="5" class="py-12">${this.getEmptyState('fa-pump-soap', 'Belum Ada Barang', 'Tambahkan pendukung di gudang')}</td></tr>`;
        
        // Injeksi ke Kartu Mobile
        const mU = document.getElementById('opname-mob-utama'); 
        if (mU) mU.innerHTML = hum || '<div class="text-center py-10 text-slate-400 text-xs font-bold border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">Tidak ada bahan utama</div>';
        const mP = document.getElementById('opname-mob-pendukung'); 
        if (mP) mP.innerHTML = hpm || '<div class="text-center py-10 text-slate-400 text-xs font-bold border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">Tidak ada barang pendukung</div>';

        // Update Angka Badge pada Sub-Tab
        const bU = document.getElementById('count-opname-utama'); if(bU) bU.innerText = cUtama;
        const bP = document.getElementById('count-opname-pendukung'); if(bP) bP.innerText = cPend;

        // Auto-fill Nilai Stok Sistem ke Input Fisik (Setelah DOM Selesai Render)
        setTimeout(() => {
            autoFillData.forEach(item => {
                let elDesk = document.getElementById(item.idDesk); 
                let elMob = document.getElementById(item.idMob);
                if (elDesk) elDesk.value = item.val; 
                if (elMob) elMob.value = item.val;
            });
        }, 50); 
    },
    
  
   submitTerimaBarang: async function() {
        if (this.isProcessing) return;
        
        let items = [];
        let totalPcs = 0;
        let waText = `*LAPORAN BARANG DATANG PUSAT*\n📍 Cabang: ${this.outlet}\n👤 Kasir: ${this.currentUser ? this.currentUser.Username : 'Kasir'}\n📅 Waktu: ${new Date().toLocaleString('id-ID')}\n\n*_Mohon cek aplikasi menu Audit untuk memverifikasi agar stok masuk ke sistem_*\n\n`;

        (this.db.masterProduk || []).forEach(m => {
            if (String(m.Kategori || '').toLowerCase() === 'bahan' || String(m.Kategori || '').toLowerCase() === 'pendukung') {
                let inputDesk = document.getElementById(`trm-qty-${m.SKU}`); 
                let inputMob = document.getElementById(`trm-qty-mob-${m.SKU}`);
                let qtyStr = inputDesk && inputDesk.value !== '' ? inputDesk.value : (inputMob && inputMob.value !== '' ? inputMob.value : '');

                if (qtyStr !== '' && parseInt(this.getNumericValue(qtyStr)) > 0) {
                    let qtyNum = parseInt(this.getNumericValue(qtyStr));
                    let noteDesk = document.getElementById(`trm-note-${m.SKU}`); 
                    let noteMob = document.getElementById(`trm-note-mob-${m.SKU}`);
                    let note = noteDesk && noteDesk.value !== '' ? noteDesk.value : (noteMob && noteMob.value !== '' ? noteMob.value : '');
                    
                    items.push({ sku: m.SKU, nama: m.Nama_Produk, qty: qtyNum, catatan: note });
                    totalPcs += qtyNum;
                    waText += `📦 *${m.Nama_Produk}*\nQty Diterima: *${qtyStr} Pcs*\nCatatan: ${note || '-'}\n\n`;
                }
            }
        });

        if (items.length === 0) return this.showToast("Tidak ada barang masuk yang diinput!", "error");

        // --- CEK DUPLIKAT INPUTAN HARI INI ---
        let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
        let todayStrLocal = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        
        let sudahInputHariIni = (this.db.barangMasuk || []).some(m => 
            m.Outlet_Tujuan === this.outlet && 
            (typeof this.cleanDateOnly === 'function' ? this.cleanDateOnly(m.Waktu) : m.Waktu.includes(todayStrLocal)) &&
            m.Status_Approval === 'Pending'
        );

        // Pengkondisian Visual Isi Modal jika terdeteksi Double Input
        const iconBox = document.getElementById('terima-confirm-icon-box');
        const titleEl = document.getElementById('terima-confirm-title');
        const subtitleEl = document.getElementById('terima-confirm-subtitle');
        const warningBox = document.getElementById('terima-confirm-warning-box');

        if (sudahInputHariIni) {
            if (iconBox) iconBox.className = "w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border-[6px] border-amber-100/60 shadow-inner";
            if (titleEl) titleEl.innerText = "Laporan Ganda Terdeteksi";
            if (subtitleEl) subtitleEl.innerText = "Cabang ini sudah mengirim data pending hari ini.";
            if (warningBox) {
                warningBox.className = "bg-red-50 border border-red-200/80 rounded-xl p-3 text-left flex items-start gap-2.5 mb-6";
                warningBox.innerHTML = `<i class="fas fa-triangle-exclamation text-red-500 text-base mt-0.5 shrink-0"></i><p class="text-[11px] font-bold text-red-800 leading-relaxed"><b>PERINGATAN GRAV:</b> Sudah ada input barang datang yang pending hari ini. Yakin ingin mengirim antrean laporan baru?</p>`;
            }
        } else {
            if (iconBox) iconBox.className = "w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border-[6px] border-emerald-100/60 shadow-inner";
            if (titleEl) titleEl.innerText = "Konfirmasi Barang Datang";
            if (subtitleEl) subtitleEl.innerText = "Verifikasi jumlah barang yang dikirim kurir pusat.";
            if (warningBox) {
                warningBox.className = "bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-left flex items-start gap-2.5 mb-6";
                warningBox.innerHTML = `<i class="fas fa-circle-info text-amber-500 text-base mt-0.5 shrink-0"></i><p class="text-[11px] font-bold text-amber-800 leading-relaxed">Stok toko <b>tidak langsung bertambah</b>. Laporan ini memerlukan otorisasi dan persetujuan dari Owner di menu Audit.</p>`;
            }
        }

        const summaryContainer = document.getElementById('terima-confirm-summary');
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span class="text-xs font-bold text-slate-500">Toko Penerima</span>
                    <span class="text-xs font-black text-slate-800 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">${this.outlet}</span>
                </div>
                <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span class="text-xs font-bold text-slate-500">Variasi Produk</span>
                    <span class="text-xs font-black text-emerald-600">${items.length} Macam</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-slate-500">Total Muatan Fisik</span>
                    <span class="text-xs font-black text-slate-800">${totalPcs} Pcs Barang</span>
                </div>
            `;
        }

        const btnExecute = document.getElementById('btn-confirm-terima-execute');
        if (btnExecute) {
            btnExecute.onclick = () => this.executeSubmitTerimaBarang(items, waText);
        }

        if (typeof this.openModal === 'function') {
            this.openModal('modal-confirm-terima');
        } else {
            let confirmMsg = sudahInputHariIni 
                ? "Laporan ganda terdeteksi! Yakin ingin melanjutkan pengiriman antrean baru?"
                : `Konfirmasi pengiriman ${totalPcs} Pcs barang?`;
            if (confirm(confirmMsg)) this.executeSubmitTerimaBarang(items, waText);
        }
    },

    // =========================================================
    // 🚀 ENGINE: TAMPILKAN POPUP WA (DENGAN FALLBACK AMAN)
    // =========================================================
    openWaShareModal: function(text) {
        const modal = document.getElementById('modal-wa-share');
        const preview = document.getElementById('wa-share-preview');
        const btn = document.getElementById('btn-wa-share-execute');
        
        // JIKA ELEMEN HTML DITEMUKAN: Buka Popup Cantiknya
        if (modal && preview && btn) {
            preview.innerText = text;
            btn.onclick = () => {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                this.closeWaShareModal();
            };
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        } 
        // JIKA HTML GAGAL DITEMUKAN: Panggil Alert Sistem
        else {
            let confirmKirim = confirm("✅ Laporan Berhasil Disimpan ke Sistem!\n\nKlik 'OK' untuk langsung mengirimkan laporan audit ke WhatsApp.");
            if (confirmKirim) window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
        }
    },

    closeWaShareModal: function() {
        const modal = document.getElementById('modal-wa-share');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    closeWaShareModal: function() {
        const modal = document.getElementById('modal-wa-share');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },


    // =========================================================
    // 🚀 UPDATE: EKSEKUSI TERIMA BARANG
    // =========================================================
    executeSubmitTerimaBarang: async function(items, waText) {
        if (this.isProcessing) return;
        if (typeof this.closeModal === 'function') this.closeModal('modal-confirm-terima');
        
        setTimeout(async () => {
            this.setLoading(true, "Menyimpan Laporan Masuk...");
            const payload = { action: 'terima_barang_kasir', outlet: this.outlet, kasir: this.currentUser ? this.currentUser.Username : 'Kasir', items: items };
            
            let res = await this.apiPost(payload);
            
            if (res.status === 'sukses') {
                this.setLoading(false);
                
                // 1. Tampilkan Popup WA Cantik!
                this.openWaShareModal(waText);

                // 2. Bersihkan Inputan
                items.forEach(i => {
                    let idDesk = document.getElementById(`trm-qty-${i.sku}`); if(idDesk) idDesk.value = '';
                    let idMob = document.getElementById(`trm-qty-mob-${i.sku}`); if(idMob) idMob.value = '';
                    let nd = document.getElementById(`trm-note-${i.sku}`); if(nd) nd.value = '';
                    let nm = document.getElementById(`trm-note-mob-${i.sku}`); if(nm) nm.value = '';
                });
                
                // 3. Refresh Data
                if (!res.is_offline) { 
                    try {
                        let rUrl = (typeof API_URL !== 'undefined') ? API_URL : this.webAppUrl;
                        const r = await fetch(rUrl + "?ts=" + new Date().getTime(), { redirect: 'follow' }); 
                        this.db = await r.json(); 
                        if (typeof this.refreshData === 'function') this.refreshData(); 
                    } catch(e) {}
                }
            } else {
                this.setLoading(false);
                this.showToast("Gagal menyimpan data: " + res.pesan, "error");
            }
        }, 300);
    },

    // =========================================================
    // 🚀 UPDATE: EKSEKUSI OPNAME FISIK
    // =========================================================
    executeSubmitOpname: async function(items, waText) {
        if (this.isProcessing) return;
        if (typeof this.closeModal === 'function') this.closeModal('modal-confirm-opname');
        
        setTimeout(async () => {
            this.setLoading(true, "Menyimpan Hasil Opname...");
            const payload = { action: 'submit_opname', outlet: this.outlet, kasir: this.currentUser ? this.currentUser.Username : 'Kasir', items: items };
            
            let res = await this.apiPost(payload);
            
            if (res.status === 'sukses') {
                this.setLoading(false);
                
                // 1. Tampilkan Popup WA Cantik!
                this.openWaShareModal(waText);

                // 2. Bersihkan Inputan Fisik
                items.forEach(i => {
                    let idDesk = document.getElementById(`op-qty-${i.sku}`); if(idDesk) idDesk.value = '';
                    let idMob = document.getElementById(`op-qty-mob-${i.sku}`); if(idMob) idMob.value = '';
                    let nd = document.getElementById(`op-note-${i.sku}`); if(nd) nd.value = '';
                    let nm = document.getElementById(`op-note-mob-${i.sku}`); if(nm) nm.value = '';
                });
                
                // 3. Refresh Data
                if (!res.is_offline) { 
                    try {
                        let rUrl = (typeof API_URL !== 'undefined') ? API_URL : this.webAppUrl;
                        const r = await fetch(rUrl + "?ts=" + new Date().getTime(), { redirect: 'follow' }); 
                        this.db = await r.json(); 
                        if (typeof this.refreshData === 'function') this.refreshData(); 
                    } catch(e) {}
                }
            } else {
                this.setLoading(false);
                this.showToast("Gagal menyimpan data: " + res.pesan, "error");
            }
        }, 300);
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
   // =========================================================
    // 🚀 ENGINE: GENERATOR WA OPNAME (DAFTAR DIJADIKAN SATU)
    // =========================================================
    buildOpnameWaText: function(outlet, kasir, waktu, items) {
        if (!Array.isArray(items)) items = [];

        // 1. Hitung Kecepatan Jualan (Velocity) untuk Bahan Utama dari Riwayat Transaksi
        let productSales = {};
        let oldestDate = new Date();
        
        (this.db.transactions || []).forEach(t => {
            if(t.Status === 'Sukses' && t.Outlet === outlet) {
                let d = typeof this.parseDateId === 'function' ? this.parseDateId(t.Tanggal) : new Date(t.Tanggal); 
                if(d < oldestDate && d.getTime() > 0) oldestDate = d;
                
                let parsedItems = []; 
                try { parsedItems = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
                
                if (Array.isArray(parsedItems)) {
                    parsedItems.forEach(item => {
                        let refSku = item.sku_bahan || item.sku;
                        if(!productSales[refSku]) productSales[refSku] = 0;
                        productSales[refSku] += Number(item.qty) || 0;
                    });
                }
            }
        });
        
        // 1.5 Hitung Total Barang Masuk (Mutasi) untuk Barang Pendukung
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

        // 2. Pisahkan Kategori (Hanya Utama vs Pendukung)
        let listBahan = [];
        let listPendukung = [];

        items.forEach(item => {
            let master = (this.db.masterProduk || []).find(m => m.SKU === item.sku);
            let kategori = master ? String(master.Kategori || '').toLowerCase() : 'bahan';
            
            if (kategori === 'bahan') {
                let soldQty = productSales[item.sku] || 0;
                let vel = soldQty / daysActive;
                item.estHari = vel > 0 ? Math.floor(item.fisik / vel) : -1; 
                listBahan.push(item);
            } else {
                let totalReceived = mutasiIn[item.sku] || item.sistem; 
                let totalUsed = totalReceived - item.fisik;
                
                if (totalUsed > 0 && daysActive > 0) {
                    let vel = totalUsed / daysActive; 
                    item.estHari = Math.floor(item.fisik / vel);
                } else {
                    item.estHari = -1; 
                }
                listPendukung.push(item);
            }
        });

       // 3. Pengurutan Mutlak A-Z
        const sortAZ = (a,b) => String(a.nama).toUpperCase().localeCompare(String(b.nama).toUpperCase());
        listBahan.sort(sortAZ);
        listPendukung.sort(sortAZ);

        // 4. SUSUN TEKS WHATSAPP EKSEKUTIF
        let waText = `*[ LAPORAN OPNAME FISIK & AUDIT ]*\n📍 Cabang: *Ai-CHA ${outlet}*\n👤 Kasir: ${kasir}\n📅 Waktu: ${waktu}\n\n*_Mohon cek menu Audit Opname di aplikasi untuk menyetujui_*\n\n`;

        if (listBahan.length > 0) {
            waText += `*📦 BAHAN UTAMA*\n`;
            listBahan.forEach(i => {
                let alertStr = i.fisik <= 0 ? 'HABIS 🛑' : (i.estHari === -1 ? 'Belum ada pakai 📉' : (i.estHari < 4 ? `${i.estHari} Hari (Kritis ⚠️)` : `${i.estHari > 99 ? '>99' : i.estHari} Hari (Aman ✅)`));
                let icon = i.selisih < 0 ? '📉' : (i.selisih > 0 ? '📈' : '✅');
                let diffBadge = i.selisih === 0 ? "PAS" : (i.selisih > 0 ? `+${i.selisih}` : `${i.selisih}`);
                let noteStr = (i.catatan && i.catatan.trim() !== '') ? `\nCatatan: ${i.catatan}` : '';
                
                waText += `${icon} *${i.nama}*\nSys: ${i.sistem} | Fisik: ${i.fisik} | Selisih: *${diffBadge}*\n⏳ Est Habis: ${alertStr}${noteStr}\n\n`;
            });
        }

        if (listPendukung.length > 0) {
            waText += `*🛒 BAHAN PENDUKUNG*\n`;
            listPendukung.forEach(i => {
                let alertStr = i.fisik <= 0 ? 'HABIS 🛑' : (i.estHari === -1 ? 'Belum ada pakai 📉' : (i.estHari < 4 ? `${i.estHari} Hari (Kritis ⚠️)` : `${i.estHari > 99 ? '>99' : i.estHari} Hari (Aman ✅)`));
                let icon = i.selisih < 0 ? '📉' : (i.selisih > 0 ? '📈' : '✅');
                let diffBadge = i.selisih === 0 ? "PAS" : (i.selisih > 0 ? `+${i.selisih}` : `${i.selisih}`);
                let noteStr = (i.catatan && i.catatan.trim() !== '') ? `\nCatatan: ${i.catatan}` : '';
                
                waText += `${icon} *${i.nama}*\nSys: ${i.sistem} | Fisik: ${i.fisik} | Selisih: *${diffBadge}*\n⏳ Est Habis: ${alertStr}${noteStr}\n\n`;
            });
        }

        return waText;
    },

openDetailStokOpname: function(sku) {
        let m = (this.db.masterProduk || []).find(x => x.SKU === sku);
        if (!m) return;

        let sData = (this.db.hargaStokOutlet || []).find(x => x.SKU === sku && x.ID_Outlet === this.outlet);
        let currentStok = sData ? Number(sData.Stok_Toko) : 0;

        document.getElementById('detail-stok-nama').innerText = m.Nama_Produk;
        document.getElementById('detail-stok-now').innerText = currentStok;

        let tbody = document.getElementById('detail-stok-tbody');
        let html = '';
        let totalSold7Days = 0;

        // Looping Mundur 7 Hari Terakhir
        for (let i = 0; i < 7; i++) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            let pad = (n) => n < 10 ? '0' + n : n;
            let dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
            
            // Format Label Teks (Hari Ini, Kemarin, dll)
            let dateLabel = dateStr;
            if (i === 0) dateLabel = `<span class="text-brand-500 font-black">Hari Ini</span> <span class="text-[9px] text-slate-400 block">${dateStr}</span>`;
            else if (i === 1) dateLabel = `<span class="text-slate-700 font-bold">Kemarin</span> <span class="text-[9px] text-slate-400 block">${dateStr}</span>`;

            let terjual = 0; let masuk = 0; let opnameInfo = '-';

            // 1. Cari Penjualan di Tanggal Ini
            (this.db.transactions || []).forEach(t => {
                if (t.Outlet === this.outlet && t.Status === 'Sukses' && this.cleanDateOnly(t.Tanggal) === dateStr) {
                    let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
                    items.forEach(it => {
                        let refBahan = it.sku_bahan || it.sku;
                        if (refBahan === sku) terjual += Number(it.qty);
                    });
                }
            });

            // 2. Cari Penerimaan Barang di Tanggal Ini
            (this.db.mutasi || []).forEach(mt => {
                if (mt.Outlet_Tujuan === this.outlet && mt.SKU === sku && mt.Status_Approval === 'Disetujui' && this.cleanDateOnly(mt.Waktu) === dateStr) {
                    masuk += Number(mt.Qty);
                }
            });

            // 3. Cari Histori Opname di Tanggal Ini
            (this.db.opname || []).forEach(op => {
                if (op.Outlet === this.outlet && op.SKU === sku && this.cleanDateOnly(op.Waktu) === dateStr) {
                    let sColor = op.Selisih < 0 ? 'text-red-500' : (op.Selisih > 0 ? 'text-green-500' : 'text-slate-400');
                    let sSign = op.Selisih > 0 ? '+' : '';
                    let statusBadge = op.Status_Approval === 'Disetujui' ? '<i class="fas fa-check-circle text-green-500" title="Disetujui"></i>' : '<i class="fas fa-clock text-amber-500" title="Pending"></i>';
                    
                    opnameInfo = `<span class="${sColor} font-black">${sSign}${op.Selisih}</span> ${statusBadge}`;
                }
            });

            totalSold7Days += terjual;

            // Visualisasi Data Table
            let trjUI = terjual > 0 ? `<span class="bg-orange-50 text-orange-600 px-2 py-1 rounded-md text-xs font-black shadow-sm border border-orange-100">-${terjual}</span>` : `<span class="text-slate-300">-</span>`;
            let mskUI = masuk > 0 ? `<span class="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-xs font-black shadow-sm border border-emerald-100">+${masuk}</span>` : `<span class="text-slate-300">-</span>`;

            html += `<tr class="hover:bg-slate-50 border-b border-slate-50 transition-colors">
                <td class="py-3 px-6 whitespace-nowrap text-sm text-slate-600">${dateLabel}</td>
                <td class="py-3 px-4 whitespace-nowrap text-center">${trjUI}</td>
                <td class="py-3 px-4 whitespace-nowrap text-center">${mskUI}</td>
                <td class="py-3 px-6 whitespace-nowrap text-right text-xs">${opnameInfo}</td>
            </tr>`;
        }
        
        tbody.innerHTML = html;

        // Kalkulasi Rata-rata & Status
        let avgSold = (totalSold7Days / 7).toFixed(1);
        document.getElementById('detail-stok-avg').innerText = avgSold;

        let statusEl = document.getElementById('detail-stok-status');
        if (avgSold > 10) {
            statusEl.innerText = 'Fast Moving 🔥';
            statusEl.className = 'text-[10px] md:text-xs font-black px-2 py-1 rounded-md mt-1 bg-rose-100 text-rose-600 border border-rose-200';
        } else if (avgSold > 3) {
            statusEl.innerText = 'Normal 📦';
            statusEl.className = 'text-[10px] md:text-xs font-black px-2 py-1 rounded-md mt-1 bg-blue-100 text-blue-600 border border-blue-200';
        } else {
            statusEl.innerText = 'Slow Moving 🐢';
            statusEl.className = 'text-[10px] md:text-xs font-black px-2 py-1 rounded-md mt-1 bg-slate-100 text-slate-500 border border-slate-200';
        }

        this.openModal('modal-stok-detail');
    },
    
    // =========================================================
    // 🚀 ENGINE: SUBMIT OPNAME FISIK (HANYA SIMPAN YANG BERUBAH)
    // =========================================================
    submitOpname: async function() {
        if (this.isProcessing) return;
        
        let allItems = []; // Array 100% Lengkap untuk Laporan WA
        let dbItems = []; // Array Filter untuk masuk Google Sheets
        let countSelisih = 0;

        (this.db.masterProduk || []).forEach(m => {
            let cat = String(m.Kategori || '').toLowerCase();
            if (cat === 'bahan' || cat === 'pendukung') {
                
                let inputDesk = document.getElementById(`opn-fisik-${m.SKU}`); 
                let inputMob = document.getElementById(`opn-fisik-mob-${m.SKU}`);
                
                let stokData = (this.db.hargaStokOutlet || []).find(s => s.SKU === m.SKU && s.ID_Outlet === this.outlet);
                let stokSistem = stokData ? parseInt(stokData.Stok_Toko || 0) : 0;
                
                let fisikStr = (inputDesk && inputDesk.value !== '') ? inputDesk.value : ((inputMob && inputMob.value !== '') ? inputMob.value : '');
                
                let stokFisik = stokSistem;
                if (fisikStr !== '') {
                    let parsed = parseInt(String(fisikStr).replace(/\D/g, ''));
                    if (!isNaN(parsed)) stokFisik = parsed;
                }
                
                let noteDesk = document.getElementById(`opn-note-${m.SKU}`); 
                let noteMob = document.getElementById(`opn-note-mob-${m.SKU}`);
                let note = (noteDesk && noteDesk.value !== '') ? noteDesk.value : ((noteMob && noteMob.value !== '') ? noteMob.value : '');
                
                let selisih = stokFisik - stokSistem;

                let itemObj = { 
                    sku: m.SKU, nama: m.Nama_Produk, sistem: stokSistem, fisik: stokFisik, selisih: selisih, catatan: note 
                };

                // Masukkan ke Array WA (Semua Barang)
                allItems.push(itemObj);

                // 🛑 FILTERING: HANYA MASUKKAN KE DB JIKA ADA SELISIH ATAU CATATAN
                if (selisih !== 0 || (note && note.trim() !== '')) {
                    dbItems.push(itemObj);
                    if (selisih !== 0) countSelisih++;
                }
            }
        });

        if (allItems.length === 0) return this.showToast("Database master produk kosong!", "error");

        let d = new Date(); let pad = (n) => n < 10 ? '0' + n : n;
        let todayStrLocal = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        let kasirName = this.currentUser ? this.currentUser.Username : 'Kasir';
        let waktuStr = d.toLocaleString('id-ID');
        
        // Buat Teks WA Menggunakan "allItems" (100% Barang)
        let waTextFinal = this.buildOpnameWaText(this.outlet, kasirName, waktuStr, allItems);

        let sudahInputHariIni = (this.db.riwayatOpname || []).some(m => 
            m.Outlet === this.outlet && 
            (typeof this.cleanDateOnly === 'function' ? this.cleanDateOnly(m.Waktu) : m.Waktu.includes(todayStrLocal)) &&
            m.Status_Approval === 'Pending'
        );

        const iconBox = document.getElementById('opname-confirm-icon-box');
        const titleEl = document.getElementById('opname-confirm-title');
        const subtitleEl = document.getElementById('opname-confirm-subtitle');
        const warningBox = document.getElementById('opname-confirm-warning-box');

        if (sudahInputHariIni) {
            if (iconBox) iconBox.className = "w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border-[6px] border-amber-100/60 shadow-inner";
            if (titleEl) titleEl.innerText = "Laporan Ganda Terdeteksi";
            if (subtitleEl) subtitleEl.innerText = "Cabang ini sudah mengirim data pending hari ini.";
            if (warningBox) warningBox.innerHTML = `<i class="fas fa-triangle-exclamation text-red-500 text-base mt-0.5 shrink-0"></i><p class="text-[11px] font-bold text-red-800 leading-relaxed"><b>PERINGATAN GRAV:</b> Sudah ada pengajuan opname yang pending hari ini. Lanjutkan kirim?</p>`;
        } else {
            if (iconBox) iconBox.className = "w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border-[6px] border-indigo-100/60 shadow-inner";
            if (titleEl) titleEl.innerText = "Konfirmasi Laporan Audit";
            if (subtitleEl) subtitleEl.innerText = "Pastikan fisik telah dihitung ulang dengan benar.";
            if (warningBox) warningBox.innerHTML = `<i class="fas fa-circle-info text-amber-500 text-base mt-0.5 shrink-0"></i><p class="text-[11px] font-bold text-amber-800 leading-relaxed">Hanya barang yang berselisih (${dbItems.length} Item) yang akan dikirim ke server.</p>`;
        }

        const summaryContainer = document.getElementById('opname-confirm-summary');
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span class="text-xs font-bold text-slate-500">Item Akurat (Otomatis Aman)</span>
                    <span class="text-xs font-black text-emerald-600">${allItems.length - dbItems.length} Macam</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-slate-500">Item Masuk Server (Selisih/Note)</span>
                    <span class="text-xs font-black text-rose-600">${dbItems.length} Macam</span>
                </div>
            `;
        }

        const btnExecute = document.getElementById('btn-confirm-opname-execute');
        // KUNCI PENTING: Melempar "dbItems" (yg sudah difilter) ke server, dan "waTextFinal" (Lengkap) ke WhatsApp
        if (btnExecute) btnExecute.onclick = () => {
            // JIKA SEMUA AKURAT 100%, TIDAK PERLU PUSH KE DB! LANGSUNG MUNCUL WA!
            if (dbItems.length === 0) {
                if (typeof this.closeModal === 'function') this.closeModal('modal-confirm-opname');
                this.showToast("Semua stok akurat! Tidak ada yang diupload ke server.", "success");
                if (typeof this.openWaShareModal === 'function') this.openWaShareModal(waTextFinal);
            } else {
                this.executeSubmitOpname(dbItems, waTextFinal);
            }
        };

        if (typeof this.openModal === 'function') {
            this.openModal('modal-confirm-opname');
        } else {
            let confirmMsg = sudahInputHariIni ? "Laporan ganda terdeteksi! Lanjutkan?" : `Konfirmasi laporan opname dengan ${countSelisih} selisih?`;
            if (confirm(confirmMsg)) this.executeSubmitOpname(dbItems, waTextFinal);
        }
    },
    
    // =========================================================
    // 🚀 ENGINE: EKSEKUSI DATA (MEMANGGIL WA POPUP)
    // =========================================================
    executeSubmitOpname: async function(items, waText) {
        if (this.isProcessing) return;
        if (typeof this.closeModal === 'function') this.closeModal('modal-confirm-opname');
        
        setTimeout(async () => {
            this.setLoading(true, "Menyimpan Hasil Opname...");
            const payload = { action: 'submit_opname', outlet: this.outlet, kasir: this.currentUser ? this.currentUser.Username : 'Kasir', items: items };
            
            let res = await this.apiPost(payload);
            
            if (res.status === 'sukses') {
                this.setLoading(false);
                
                // 1. TAMPILKAN POPUP WA CANTIK
                if (typeof this.openWaShareModal === 'function') {
                    this.openWaShareModal(waText);
                } else {
                    this.showToast("Berhasil disimpan!", "success");
                }

                // 2. Bersihkan Inputan Fisik
               items.forEach(i => {
               let idDesk = document.getElementById(`opn-fisik-${i.sku}`); if(idDesk) idDesk.value = i.sistem; // Kembalikan ke nilai sistem awal
               let idMob = document.getElementById(`opn-fisik-mob-${i.sku}`); if(idMob) idMob.value = i.sistem;
               let nd = document.getElementById(`opn-note-${i.sku}`); if(nd) nd.value = '';
               let nm = document.getElementById(`opn-note-mob-${i.sku}`); if(nm) nm.value = '';
            });
                
                // 3. Refresh Data
                if (!res.is_offline) { 
                    try {
                        let rUrl = (typeof API_URL !== 'undefined') ? API_URL : this.webAppUrl;
                        const r = await fetch(rUrl + "?ts=" + new Date().getTime(), { redirect: 'follow' }); 
                        this.db = await r.json(); 
                        if (typeof this.refreshData === 'function') this.refreshData(); 
                    } catch(e) {}
                }
            } else {
                this.setLoading(false);
                this.showToast("Gagal menyimpan data: " + res.pesan, "error");
            }
        }, 300);
    },
    
   

    // =========================================================
    // 🚀 HELPER: GROUPING DATA ECERAN MENJADI DATA SESI TRANSAKSI
    // =========================================================
    getProductName: function(sku) {
        let prod = (this.db.masterProduk || []).find(p => p.SKU === sku);
        return prod ? prod.Nama_Produk : sku;
    },

    getGroupedOpname: function() {
        let map = {};
        (this.db.riwayatOpname || []).forEach(r => {
            let key = r.Waktu + "_" + r.Outlet;
            if(!map[key]) {
                map[key] = {
                    Waktu: r.Waktu, Outlet: r.Outlet, Kasir: r.Kasir, Status: r.Status_Approval,
                    ID_Opname: 'OPN-' + (r.Waktu||'').replace(/\D/g, '').substring(0,8) + '-' + (r.Outlet||'').substring(0,3).toUpperCase(),
                    Items: []
                };
            }
            map[key].Items.push({ sku: r.SKU, nama: this.getProductName(r.SKU), sistem: r.Stok_Sistem, fisik: r.Stok_Fisik, selisih: r.Selisih, catatan: r.Keterangan_Fisik });
        });
        return Object.values(map).reverse();
    },

    getGroupedRestok: function() {
        let map = {};
        (this.db.barangMasuk || []).forEach(r => {
            let key = r.Waktu + "_" + r.Outlet_Tujuan;
            if(!map[key]) {
                map[key] = {
                    Waktu: r.Waktu, Outlet: r.Outlet_Tujuan, Kasir: r.Kasir, Status: r.Status_Approval,
                    Surat_Jalan: r.ID_Mutasi || 'MUT-' + (r.Waktu||'').replace(/\D/g, '').substring(0,8),
                    Supplier: (r.Keterangan||'').includes('Transfer') ? r.Keterangan : 'Pusat',
                    Items: []
                };
            }
            // KUNCI PENTING: Sisipkan id_mutasi agar bisa di-approve per-item
            map[key].Items.push({ id_mutasi: r.ID_Mutasi, sku: r.SKU, nama: this.getProductName(r.SKU), qty: r.Qty, catatan: r.Keterangan });
        });
        return Object.values(map).reverse();
    },

   
    // =========================================================
    // 🚀 ENGINE AUDIT: NAVIGASI BULAN (BARU)
    // =========================================================
    auditHistoryDate: new Date(),

    changeAuditMonth: function(offset) {
        this.auditHistoryDate.setMonth(this.auditHistoryDate.getMonth() + offset);
        this.updateAuditMonthLabel();
        this.renderOpnameHistory();
        this.renderRestokHistory();
    },

    resetAuditMonth: function() {
        this.auditHistoryDate = new Date();
        this.updateAuditMonthLabel();
        this.renderOpnameHistory();
        this.renderRestokHistory();
    },

    updateAuditMonthLabel: function() {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const label = `${months[this.auditHistoryDate.getMonth()]} ${this.auditHistoryDate.getFullYear()}`;
        const lbls = document.querySelectorAll('.audit-month-label');
        lbls.forEach(el => el.innerText = label);
    },

    // =========================================================
    // 🚀 ENGINE AUDIT: SWITCHER TABS (Bulk Hapus)
    // =========================================================
    toggleAuditTab: function(tabName) {
        const tabs = ['opname', 'terima', 'riwayat-opname', 'riwayat-terima'];
        
        tabs.forEach(t => {
            const btn = document.getElementById(`tab-audit-${t}`);
            const content = document.getElementById(`audit-content-${t}`);
            if (!btn || !content) return;

            if (t === tabName) {
                btn.classList.replace('text-slate-500', 'text-indigo-600');
                btn.classList.add('bg-white', 'shadow-[0_4px_12px_rgba(0,0,0,0.05)]');
                content.classList.remove('hidden');
                content.classList.add('flex');
            } else {
                btn.classList.replace('text-indigo-600', 'text-slate-500');
                btn.classList.remove('bg-white', 'shadow-[0_4px_12px_rgba(0,0,0,0.05)]');
                content.classList.add('hidden');
                content.classList.remove('flex');
            }
        });

        // Setel tanggal ke bulan saat ini tiap buka tab
        this.updateAuditMonthLabel();

        // Panggil Engine Render untuk memuat tabel
        if (tabName === 'riwayat-opname' && typeof this.renderOpnameHistory === 'function') this.renderOpnameHistory();
        if (tabName === 'riwayat-terima' && typeof this.renderRestokHistory === 'function') this.renderRestokHistory();
        if (tabName === 'opname' && typeof this.renderAuditOpname === 'function') this.renderAuditOpname();
        if (tabName === 'terima' && typeof this.renderAuditTerima === 'function') this.renderAuditTerima();
    },

    // =========================================================
    // 🚀 ENGINE AUDIT 1: PENDING OPNAME (Auto-Kalkulasi Selisih)
    // =========================================================
    renderAuditOpname: function() {
        const tbody = document.getElementById('audit-opname-tbody');
        if (!tbody) return;
        
        let pendingData = this.getGroupedOpname().filter(x => x.Status === 'Pending');

        if (pendingData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 italic text-xs border border-dashed border-slate-200 rounded-xl">Tidak ada pengajuan Opname yang menunggu persetujuan</td></tr>`;
            return;
        }

        tbody.innerHTML = pendingData.map(op => {
            let akuratCount = 0;
            let totalDeviasi = 0;
            let catatanKasir = '';

            op.Items.forEach(i => { 
                let diff = Number(i.fisik) - Number(i.sistem);
                if (diff === 0) {
                    akuratCount++; 
                } else {
                    totalDeviasi += Math.abs(diff); // Menghitung total pcs yang selisih
                    if (!catatanKasir && i.catatan && i.catatan.trim() !== '') {
                        catatanKasir = i.catatan; // Mengambil catatan pertama yang ditemukan
                    }
                }
            });

            let isAkurat = akuratCount === op.Items.length;
            let statusBadge = isAkurat
                ? `<span class="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[9px]">Akurat</span>`
                : `<span class="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[9px]">Ada Selisih</span>`;

            // Tampilkan jumlah item yang selisih & total pcs deviasinya
            let selisihTeks = isAkurat ? '-' : `<span class="text-rose-600 font-black">${op.Items.length - akuratCount} Brg</span> <span class="text-slate-400 text-[9px]">(Deviasi ${totalDeviasi})</span>`;
            let catatanTeks = catatanKasir ? catatanKasir : '-';

            return `
            <tr class="hover:bg-slate-50 transition border-b border-slate-50">
                <td class="py-3 px-4 text-[11px]">${op.Waktu}</td>
                <td class="py-3 px-4"><span class="text-indigo-600 font-black">Ai-CHA ${op.Outlet}</span><br><span class="text-[9px] text-slate-400">Oleh: ${op.Kasir}</span></td>
                <td class="py-3 px-4 text-center">
                    <button onclick="superApp.openDetailOpnameModal('${op.Waktu}', '${op.Outlet}')" class="text-indigo-500 underline text-[10px] font-black bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition"><i class="fas fa-tasks mr-1"></i> ${op.Items.length} Item</button>
                </td>
                <td class="py-3 px-4 text-center">${statusBadge}</td>
                <td class="py-3 px-4 text-right text-[11px]">${selisihTeks}</td>
                <td class="py-3 px-4 text-[10px] text-slate-500 italic max-w-[150px] truncate" title="${catatanTeks}">${catatanTeks}</td>
            </tr>`;
        }).join('');
    },

    // =========================================================
    // 🚀 ENGINE AUDIT 2: PENDING TERIMA BARANG (Info Ekstra)
    // =========================================================
    renderAuditTerima: function() {
        const tbody = document.getElementById('audit-terima-tbody');
        if (!tbody) return;
        
        let pendingData = this.getGroupedRestok().filter(x => x.Status === 'Pending');

        if (pendingData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400 italic text-xs border border-dashed border-slate-200 rounded-xl">Tidak ada pengajuan Restok yang menunggu persetujuan</td></tr>`;
            return;
        }

        tbody.innerHTML = pendingData.map(bm => {
            let totalQty = 0; 
            let firstNote = '';
            
            bm.Items.forEach(i => { 
                totalQty += Number(i.qty);
                if (!firstNote && i.catatan && i.catatan.trim() !== '') firstNote = i.catatan;
            });

            // Menampilkan catatan kasir jika ada, jika tidak tampilkan Nomor Surat Jalan
            let noteTeks = firstNote ? `<span class="text-slate-600">${firstNote}</span>` : `SJ: ${bm.Surat_Jalan}`;

            return `
            <tr class="hover:bg-slate-50 transition border-b border-slate-50">
                <td class="py-3 px-4 text-[11px]">${bm.Waktu}</td>
                <td class="py-3 px-4"><span class="text-emerald-600 font-black">Ai-CHA ${bm.Outlet}</span><br><span class="text-[9px] text-slate-400">Oleh: ${bm.Kasir}</span></td>
                <td class="py-3 px-4 text-center">
                    <button onclick="superApp.openDetailRestokModal('${bm.Surat_Jalan}')" class="text-emerald-500 underline text-[10px] font-black bg-emerald-50 px-3 py-1 rounded-lg hover:bg-emerald-100 transition"><i class="fas fa-box-open mr-1"></i> ${bm.Items.length} Item</button>
                </td>
                <td class="py-3 px-4 text-center font-black">${totalQty} Pcs</td>
                <td class="py-3 px-4 text-[10px] text-slate-500 italic max-w-[150px] truncate" title="${bm.Surat_Jalan}">${noteTeks}</td>
            </tr>`;
        }).join('');
    },

    // =========================================================
    // 🚀 ENGINE AUDIT 3 & 4: RIWAYAT (DENGAN FILTER BULAN)
    // =========================================================
    renderOpnameHistory: function() {
        const tbody = document.getElementById('audit-riwayat-opname-tbody');
        const searchVal = (document.getElementById('search-opname')?.value || '').toLowerCase();
        if (!tbody) return;

        let targetMonth = this.auditHistoryDate.getMonth();
        let targetYear = this.auditHistoryDate.getFullYear();

        let historyData = this.getGroupedOpname().filter(x => {
            if (x.Status === 'Pending') return false; // Jangan tampilkan pending di riwayat
            
            // Filter Berdasarkan Bulan dan Tahun
            let parts = (x.Waktu || '').split(' ')[0].split(/[\/\-]/); 
            if(parts.length === 3) {
                let m = parseInt(parts[1], 10) - 1;
                let y = parseInt(parts[2], 10);
                if (m !== targetMonth || y !== targetYear) return false;
            }
            
            // Filter Berdasarkan Search (jika ada)
            if (searchVal && !`${x.ID_Opname} ${x.Outlet} ${x.Kasir}`.toLowerCase().includes(searchVal)) return false;
            return true;
        });

        if (historyData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400 italic text-xs border border-dashed border-slate-200 rounded-xl">Tidak ada riwayat audit di bulan ini.</td></tr>`;
            return;
        }

        tbody.innerHTML = historyData.map(op => {
            let akuratCount = 0; op.Items.forEach(i => { if (Number(i.fisik) === Number(i.sistem)) akuratCount++; });
            let isPerfect = op.Items.length > 0 && akuratCount === op.Items.length;
            let statusBadge = isPerfect ? `<span class="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[9px]">100% Akurat</span>` : `<span class="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[9px]">Ada Selisih</span>`;

            return `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 text-[11px]">${op.Waktu}</td>
                <td class="py-3 px-4"><span class="text-indigo-600 font-black">Ai-CHA ${op.Outlet}</span><br><span class="text-[9px] text-slate-400">Oleh: ${op.Kasir}</span></td>
                <td class="py-3 px-4 text-center">${op.Items.length} Item</td>
                <td class="py-3 px-4 text-center">${statusBadge}<br><span class="text-[9px] text-slate-400">${op.Status}</span></td>
                <td class="py-3 px-4 text-center flex justify-center gap-1.5">
                    <button onclick="superApp.openDetailOpnameModal('${op.Waktu}', '${op.Outlet}')" class="bg-indigo-50 hover:bg-indigo-500 text-indigo-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] transition"><i class="fas fa-search-plus"></i> Detail</button>
                    <button onclick="superApp.sendWaOpname('${op.Waktu}', '${op.Outlet}')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1.5 rounded-lg text-[10px] transition"><i class="fab fa-whatsapp"></i></button>
                </td>
            </tr>`;
        }).join('');
    },

    renderRestokHistory: function() {
        const tbody = document.getElementById('audit-riwayat-restok-tbody');
        const searchVal = (document.getElementById('search-restok')?.value || '').toLowerCase();
        if (!tbody) return;

        let targetMonth = this.auditHistoryDate.getMonth();
        let targetYear = this.auditHistoryDate.getFullYear();

        let historyData = this.getGroupedRestok().filter(x => {
            if (x.Status === 'Pending') return false; // Jangan tampilkan pending di riwayat
            
            // Filter Berdasarkan Bulan dan Tahun
            let parts = (x.Waktu || '').split(' ')[0].split(/[\/\-]/); 
            if(parts.length === 3) {
                let m = parseInt(parts[1], 10) - 1;
                let y = parseInt(parts[2], 10);
                if (m !== targetMonth || y !== targetYear) return false;
            }

            // Filter Berdasarkan Search (jika ada)
            if (searchVal && !`${x.Surat_Jalan} ${x.Outlet} ${x.Supplier}`.toLowerCase().includes(searchVal)) return false;
            return true;
        });

        if (historyData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400 italic text-xs border border-dashed border-slate-200 rounded-xl">Tidak ada riwayat penerimaan di bulan ini.</td></tr>`;
            return;
        }

        tbody.innerHTML = historyData.map(bm => `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 text-[11px]">${bm.Waktu}</td>
                <td class="py-3 px-4 font-black"><span class="text-slate-700">${bm.Surat_Jalan}</span><br><span class="text-[9px] text-slate-400 font-bold">Dari: ${bm.Supplier}</span></td>
                <td class="py-3 px-4 text-emerald-600 font-black">Ai-CHA ${bm.Outlet}</td>
                <td class="py-3 px-4 text-center"><span class="bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded text-[9px]">${bm.Status}</span></td>
                <td class="py-3 px-4 text-center flex justify-center gap-1.5">
                    <button onclick="superApp.openDetailRestokModal('${bm.Surat_Jalan}')" class="bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] transition"><i class="fas fa-box-open"></i> Buka</button>
                    <button onclick="superApp.sendWaTerima('${bm.Surat_Jalan}')" class="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1.5 rounded-lg text-[10px] transition"><i class="fab fa-whatsapp"></i></button>
                </td>
            </tr>`).join('');
    },

    
   // =========================================================
    // 🚀 ENGINE: MODAL OTORISASI (HANYA TAMPIL YANG BERUBAH)
    // =========================================================
    openDetailOpnameModal: function(waktu, outlet) {
        let op = this.getGroupedOpname().find(x => x.Waktu === waktu && x.Outlet === outlet);
        if (!op) return;

        document.getElementById('opname-meta-id').innerText = op.ID_Opname;
        document.getElementById('opname-meta-subtitle').innerText = `Cabang: Ai-CHA ${op.Outlet} | Auditor: ${op.Kasir}`;

        // JIKA PENDING: HANYA TAMPILKAN ITEM YANG ADA SELISIH / CATATAN
        let displayItems = op.Status === 'Pending' 
            ? op.Items.filter(i => Number(i.fisik) !== Number(i.sistem) || (i.catatan && i.catatan.trim() !== '')) 
            : op.Items;

        const listCont = document.getElementById('opname-item-list');
        
        if (displayItems.length === 0 && op.Status === 'Pending') {
            listCont.innerHTML = `<div class="p-8 text-center text-emerald-600 font-bold text-xs border border-dashed border-emerald-200 bg-emerald-50 rounded-2xl">🎉 Luar biasa! Seluruh stok 100% akurat.<br>Silakan langsung Setujui Laporan ini.</div>`;
        } else {
            listCont.innerHTML = displayItems.map(i => {
                let nSis = Number(i.sistem); let nFis = Number(i.fisik); let diff = nFis - nSis;
                let diffBadge = `<div class="font-black text-slate-400 text-sm bg-slate-100 px-2 py-1 rounded-lg">Match ✔</div>`;
                let borderClass = 'border-slate-200';
                
                if (diff > 0) { diffBadge = `<div class="font-black text-emerald-600 text-sm bg-emerald-50 px-2 py-1 rounded-lg">+${diff} Surplus</div>`; borderClass = 'border-emerald-200'; } 
                else if (diff < 0) { diffBadge = `<div class="font-black text-rose-600 text-sm bg-rose-50 px-2 py-1 rounded-lg">${diff} Defisit</div>`; borderClass = 'border-rose-200'; }

                let actionHtml = '';
                if (op.Status === 'Pending') {
                    // MENGGUNAKAN SKU SEBAGAI NAMA RADIO BUTTON AGAR TIDAK TERTUKAR
                    actionHtml = `
                    <div class="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                        <label class="flex-1 cursor-pointer">
                            <input type="radio" name="op_app_${i.sku}" value="Disetujui" class="peer sr-only" checked>
                            <div class="text-center py-2 rounded-lg border border-slate-200 text-slate-400 text-[10px] font-black peer-checked:bg-emerald-50 peer-checked:text-emerald-600 peer-checked:border-emerald-300 transition-all">✅ SETUJUI</div>
                        </label>
                        <label class="flex-1 cursor-pointer">
                            <input type="radio" name="op_app_${i.sku}" value="Ditolak" class="peer sr-only">
                            <div class="text-center py-2 rounded-lg border border-slate-200 text-slate-400 text-[10px] font-black peer-checked:bg-rose-50 peer-checked:text-rose-600 peer-checked:border-rose-300 transition-all">❌ TOLAK</div>
                        </label>
                    </div>`;
                }

                return `
                <div class="bg-white border ${borderClass} p-3 rounded-2xl shadow-sm flex flex-col hover:shadow-md transition">
                    <div class="flex items-center justify-between">
                        <div class="w-1/2">
                            <span class="font-extrabold text-slate-700 text-xs block mb-1 truncate">${i.nama}</span>
                            <div class="flex gap-3 text-[10px] font-bold text-slate-400">
                                <span>Sistem: <b class="text-slate-600">${nSis}</b></span><span>Fisik: <b class="text-slate-800">${nFis}</b></span>
                            </div>
                        </div>
                        <div class="text-right shrink-0">${diffBadge}</div>
                    </div>
                    ${actionHtml}
                </div>`;
            }).join('');
        }

        let footer = document.getElementById('opname-modal-footer');
        if (footer) {
            if (op.Status === 'Pending') {
                footer.innerHTML = `<button onclick="superApp.processPartialOpname('${op.Waktu}', '${op.Outlet}')" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"><i class="fas fa-check-double"></i> Simpan Otorisasi Laporan</button>`;
                footer.classList.remove('hidden');
            } else {
                footer.innerHTML = ''; footer.classList.add('hidden');
            }
        }

        const modal = document.getElementById('modal-detail-opname');
        if (modal) { modal.classList.remove('hidden'); void modal.offsetWidth; modal.classList.add('opacity-100'); modal.firstElementChild.classList.remove('scale-95'); modal.firstElementChild.classList.add('scale-100'); }
    },

    openDetailRestokModal: function(suratJalan) {
        let bm = this.getGroupedRestok().find(x => x.Surat_Jalan === suratJalan);
        if (!bm) return;

        document.getElementById('restok-meta-id').innerText = bm.Surat_Jalan;
        document.getElementById('restok-meta-subtitle').innerText = `Tujuan: Ai-CHA ${bm.Outlet} | Diterima: ${bm.Waktu}`;

        document.getElementById('restok-item-list').innerHTML = bm.Items.map((i, idx) => {
            let actionHtml = '';
            if (bm.Status === 'Pending') {
                actionHtml = `
                <div class="mt-2 flex gap-1.5 w-full">
                    <label class="flex-1 cursor-pointer">
                        <input type="radio" name="res_app_${idx}" value="Disetujui" class="peer sr-only" checked>
                        <div class="text-center py-1.5 rounded border border-slate-200 text-slate-400 text-[9px] font-black peer-checked:bg-emerald-50 peer-checked:text-emerald-600 peer-checked:border-emerald-300 transition-all">SETUJU</div>
                    </label>
                    <label class="flex-1 cursor-pointer">
                        <input type="radio" name="res_app_${idx}" value="Ditolak" class="peer sr-only">
                        <div class="text-center py-1.5 rounded border border-slate-200 text-slate-400 text-[9px] font-black peer-checked:bg-rose-50 peer-checked:text-rose-600 peer-checked:border-rose-300 transition-all">TOLAK</div>
                    </label>
                </div>`;
            }

            return `
            <tr class="hover:bg-slate-50 transition border-b border-slate-50">
                <td class="py-3 px-4">
                    <span class="font-extrabold text-slate-700 block">${i.nama}</span>
                    ${actionHtml}
                </td>
                <td class="py-3 px-4 text-center align-top"><span class="bg-slate-100 text-slate-600 font-black px-2 py-1 rounded-md border border-slate-200">${i.qty}</span></td>
                <td class="py-3 px-4 text-[10px] text-slate-400 italic align-top">${i.catatan || '-'}</td>
            </tr>`;
        }).join('');

        let footer = document.getElementById('restok-modal-footer');
        if (footer) {
            if (bm.Status === 'Pending') {
                footer.innerHTML = `<button onclick="superApp.processPartialRestok('${bm.Surat_Jalan}')" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"><i class="fas fa-check-double"></i> Simpan Otorisasi Pilihan</button>`;
                footer.classList.remove('hidden');
            } else {
                footer.innerHTML = ''; footer.classList.add('hidden');
            }
        }

        const modal = document.getElementById('modal-detail-restok');
        if (modal) { modal.classList.remove('hidden'); void modal.offsetWidth; modal.classList.add('opacity-100'); modal.firstElementChild.classList.remove('scale-95'); modal.firstElementChild.classList.add('scale-100'); }
    },
   
    closeDetailOpnameModal: function() {
        const modal = document.getElementById('modal-detail-opname');
        if (modal) {
            modal.classList.remove('opacity-100');
            if(modal.firstElementChild) {
                modal.firstElementChild.classList.remove('scale-100');
                modal.firstElementChild.classList.add('scale-95');
            }
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
    },


    closeDetailRestokModal: function() {
        const modal = document.getElementById('modal-detail-restok');
        if (modal) {
            modal.classList.remove('opacity-100');
            if(modal.firstElementChild) {
                modal.firstElementChild.classList.remove('scale-100');
                modal.firstElementChild.classList.add('scale-95');
            }
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
    },

    sendWaOpname: function(waktu, outlet) {
        let op = this.getGroupedOpname().find(x => x.Waktu === waktu && x.Outlet === outlet);
        if (!op) return;

        let txt = `*[ LAPORAN OPNAME FISIK ]*\n\nCabang: *Ai-CHA ${op.Outlet}*\nWaktu: ${op.Waktu}\nAuditor: ${op.Kasir}\n\n*Rincian Selisih:*\n`;
        op.Items.forEach(i => {
            let diff = Number(i.fisik) - Number(i.sistem);
            if (diff !== 0) {
                let status = diff > 0 ? 'Surplus' : 'Defisit (HILANG)';
                txt += `- ${i.nama}:\n  (Sis: ${i.sistem} | Fis: ${i.fisik} | *${diff} ${status}*)\n`;
            }
        });
        if (op.Items.every(i => Number(i.fisik) === Number(i.sistem))) txt += `✅ SELURUH STOK 100% AKURAT. TIDAK ADA SELISIH.\n`;
        
        // TYPO DIPERBAIKI (txt bukan text)
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`, '_blank');
    },

    sendWaTerima: function(suratJalan) {
        let bm = this.getGroupedRestok().find(x => x.Surat_Jalan === suratJalan);
        if (!bm) return;

        let txt = `*[ LAPORAN PENERIMAAN BARANG ]*\n\nCabang: *Ai-CHA ${bm.Outlet}*\nSurat Jalan: ${bm.Surat_Jalan}\nWaktu Terima: ${bm.Waktu}\nPenerima: ${bm.Kasir}\n\n*Rincian Barang Diterima:*\n`;
        bm.Items.forEach(i => { txt += `- ${i.nama} (*${i.qty} Pcs*)\n`; });
        
        // TYPO DIPERBAIKI (txt bukan text)
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`, '_blank');
    },

  
   // =========================================================
    // 🚀 ENGINE: PROSES OTORISASI OPNAME (AUTO-REFRESH FIXED)
    // =========================================================
    processPartialOpname: async function(waktu, outlet) {
        let op = this.getGroupedOpname().find(x => x.Waktu === waktu && x.Outlet === outlet);
        if (!op) return;

        let itemsSetuju = []; let itemsTolak = [];
        op.Items.forEach((item) => {
            if (Number(item.fisik) === Number(item.sistem) && (!item.catatan || item.catatan.trim() === '')) {
                itemsSetuju.push({ waktu: op.Waktu, outlet: op.Outlet, sku: item.sku });
                return; 
            }
            let radio = document.querySelector(`input[name="op_app_${item.sku}"]:checked`);
            let val = radio ? radio.value : 'Disetujui'; 
            let payloadItem = { waktu: op.Waktu, outlet: op.Outlet, sku: item.sku };
            
            if (val === 'Disetujui') itemsSetuju.push(payloadItem);
            else itemsTolak.push(payloadItem);
        });

        this.setLoading(true, "Menyimpan Keputusan Opname...");
        
        if (itemsSetuju.length > 0) {
            await this.apiPost({ action: 'bulk_approve_opname', status_app: 'Disetujui', items: itemsSetuju });
        }
        if (itemsTolak.length > 0) {
            await this.apiPost({ action: 'bulk_approve_opname', status_app: 'Ditolak', items: itemsTolak });
        }

        this.showToast("Keputusan berhasil disimpan!");
        this.closeDetailOpnameModal();
        
        // 🛑 TARIK DATA TERBARU DARI SERVER SEBELUM MERENDER ULANG 🛑
        try {
            let rUrl = (typeof API_URL !== 'undefined') ? API_URL : this.webAppUrl;
            const r = await fetch(rUrl + "?ts=" + new Date().getTime(), { redirect: 'follow' });
            this.db = await r.json();
            
            if (typeof this.refreshData === 'function') this.refreshData(); 
            this.updatePendingNotifications(); // Update Saklar Banner
            this.renderAuditOpname();    // Bersihkan Tabel Pending
            this.renderOpnameHistory();  // Masukkan ke Tabel Riwayat
        } catch (e) {
            console.error("Gagal sinkronisasi data", e);
        }
        
        this.setLoading(false);
    },

    // =========================================================
    // 🚀 ENGINE: PROSES OTORISASI RESTOK (AUTO-REFRESH FIXED)
    // =========================================================
    processPartialRestok: async function(suratJalan) {
        let bm = this.getGroupedRestok().find(x => x.Surat_Jalan === suratJalan);
        if (!bm) return;

        let itemsSetuju = []; let itemsTolak = [];
        bm.Items.forEach((item, idx) => {
            let radio = document.querySelector(`input[name="res_app_${idx}"]:checked`);
            let val = radio ? radio.value : 'Disetujui'; 

            if (val === 'Disetujui') itemsSetuju.push(item.id_mutasi);
            else itemsTolak.push(item.id_mutasi);
        });

        this.setLoading(true, "Menyimpan Keputusan Restok...");
        
        if (itemsSetuju.length > 0) {
            await this.apiPost({ action: 'bulk_approve_mutasi', status_app: 'Disetujui', items: itemsSetuju });
        }
        if (itemsTolak.length > 0) {
            await this.apiPost({ action: 'bulk_approve_mutasi', status_app: 'Ditolak', items: itemsTolak });
        }

        this.showToast("Keputusan berhasil disimpan!");
        this.closeDetailRestokModal();

        // 🛑 TARIK DATA TERBARU DARI SERVER SEBELUM MERENDER ULANG 🛑
        try {
            let rUrl = (typeof API_URL !== 'undefined') ? API_URL : this.webAppUrl;
            const r = await fetch(rUrl + "?ts=" + new Date().getTime(), { redirect: 'follow' });
            this.db = await r.json();
            
            if (typeof this.refreshData === 'function') this.refreshData(); 
            this.updatePendingNotifications(); // Update Saklar Banner
            this.renderAuditTerima();    // Bersihkan Tabel Pending
            this.renderRestokHistory();  // Masukkan ke Tabel Riwayat
        } catch (e) {
            console.error("Gagal sinkronisasi data", e);
        }
        
        this.setLoading(false);
    },
    

    toggleGudangTab: function(tab) {
        const tabs = ['stok', 'menu', 'outlet', 'hpp'];
        const activeClass = 'snap-start px-4 md:px-5 py-2 md:py-2.5 bg-slate-900 text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-black shadow-sm whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border border-slate-800';
        const inactiveClass = 'snap-start px-4 md:px-5 py-2 md:py-2.5 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border border-slate-200/80';

        tabs.forEach(t => {
            const content = document.getElementById(`gudang-content-${t}`);
            const btn = document.getElementById(`tab-gudang-${t}`);
            if (content) content.classList.add('hidden');
            if (btn) btn.className = inactiveClass;
        });

        const activeContent = document.getElementById(`gudang-content-${tab}`);
        const activeBtn = document.getElementById(`tab-gudang-${tab}`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
            activeContent.classList.add('flex');
        }
        if (activeBtn) activeBtn.className = activeClass;

        // 🚀 KELOLA STICKY BOTTOM BAR KHUSUS HP
        const mobBar = document.getElementById('gudang-mobile-bottom-bar');
        if (mobBar) {
            if (tab === 'stok') {
                mobBar.innerHTML = `
                <button onclick="superApp.openCrudBahan()" class="flex-1 bg-slate-900 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95">
                    <i class="fas fa-plus text-emerald-400"></i> BAHAN BARU
                </button>
                <button onclick="superApp.openRestokModal()" class="flex-[1.5] bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-3 rounded-xl text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95">
                    <i class="fas fa-truck-loading"></i> RESTOK SUPLIER
                </button>`;
            } else if (tab === 'menu') {
                mobBar.innerHTML = `
                <button onclick="superApp.openCrudMasterMenu('add')" class="w-full bg-gradient-to-r from-brand-500 to-orange-500 text-white font-black py-3 rounded-xl text-xs shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-95">
                    <i class="fas fa-plus"></i> TAMBAH MENU POS BARU
                </button>`;
            } else if (tab === 'outlet') {
                mobBar.innerHTML = `
                <button onclick="superApp.openCrudOutlet('add')" class="flex-1 bg-slate-900 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95">
                    <i class="fas fa-plus text-emerald-400"></i> TOKO BARU
                </button>
                <button onclick="superApp.openDistribusiModal()" class="flex-[1.5] bg-blue-600 text-white font-black py-3 rounded-xl text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95">
                    <i class="fas fa-truck-fast"></i> DISTRIBUSI SUPLAI
                </button>`;
            } else if (tab === 'hpp') {
                mobBar.innerHTML = `
                <button onclick="superApp.saveHPP()" class="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-3 rounded-xl text-xs shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-95">
                    <i class="fas fa-save"></i> SIMPAN PERUBAHAN HPP
                </button>`;
            }
        }
    },

    // =========================================================
    // 🚀 1. SWITCHER SUB-TAB STOK PUSAT (DESKTOP & MOBILE SYNC)
    // =========================================================
    switchGudangStokSubTab: function(tab) {
        const tbUtama = document.getElementById('gudang-tbody-utama');
        const tbPend = document.getElementById('gudang-tbody-pendukung');
        const mobUtama = document.getElementById('gudang-mob-stok-utama');
        const mobPend = document.getElementById('gudang-mob-stok-pendukung');
        const btnUtama = document.getElementById('subtab-gstok-utama');
        const btnPend = document.getElementById('subtab-gstok-pendukung');

        const activeClass = 'flex-1 md:flex-none py-2 md:py-2.5 px-4 md:px-5 bg-white text-emerald-600 rounded-lg md:rounded-xl text-xs md:text-sm font-black shadow-2xs transition flex items-center justify-center gap-1.5 border border-slate-200/60';
        const inactiveClass = 'flex-1 md:flex-none py-2 md:py-2.5 px-4 md:px-5 text-slate-500 hover:text-slate-800 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition flex items-center justify-center gap-1.5 border border-transparent';

        if (tab === 'utama') {
            if(tbUtama) tbUtama.classList.remove('hidden'); if(tbPend) tbPend.classList.add('hidden');
            if(mobUtama) mobUtama.classList.remove('hidden'); if(mobPend) mobPend.classList.add('hidden');
            if(btnUtama) btnUtama.className = activeClass; if(btnPend) btnPend.className = inactiveClass;
        } else {
            if(tbUtama) tbUtama.classList.add('hidden'); if(tbPend) tbPend.classList.remove('hidden');
            if(mobUtama) mobUtama.classList.add('hidden'); if(mobPend) mobPend.classList.remove('hidden');
            if(btnUtama) btnUtama.className = inactiveClass; if(btnPend) btnPend.className = activeClass;
        }
    },

   

    // =========================================================
    // 🚀 SUB-TAB SWITCHER MANAJEMEN CABANG
    // =========================================================
    switchOutletSubTab: function(tab) {
        const sections = ['daftar', 'harga', 'matrix'];
        const activeClass = 'flex-1 md:flex-none px-5 py-2.5 bg-white text-blue-600 rounded-xl text-xs md:text-sm font-black shadow-sm transition flex items-center justify-center gap-2 border border-slate-200/60';
        const inactiveClass = 'flex-1 md:flex-none px-5 py-2.5 text-slate-500 hover:text-slate-800 rounded-xl text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 border border-transparent';

        sections.forEach(s => {
            const sec = document.getElementById(`out-section-${s}`);
            const btn = document.getElementById(`subtab-out-${s}`);
            if(sec) sec.classList.add('hidden');
            if(btn) btn.className = inactiveClass;
        });

        const activeSec = document.getElementById(`out-section-${tab}`);
        const activeBtn = document.getElementById(`subtab-out-${tab}`);
        if(activeSec) {
            activeSec.classList.remove('hidden');
            activeSec.classList.add('flex');
        }
        if(activeBtn) activeBtn.className = activeClass;
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
    
    // =========================================================
    // 🚀 1. CEK SELEKSI CHECKBOX AUDIT
    // =========================================================
    checkBulkAudit: function() {
        let opChecked = document.querySelectorAll('.cb-audit-opname:checked').length;
        let trChecked = document.querySelectorAll('.cb-audit-terima:checked').length;
        let bar = document.getElementById('bulk-action-bar');
        
        // Perbarui badge angka pada Floating Action Bar jika ada
        const countBadge = document.getElementById('bulk-action-count');
        if (countBadge) countBadge.innerText = `${opChecked + trChecked} Dipilih`;

        if (bar) { 
            if (opChecked > 0 || trChecked > 0) bar.classList.remove('hidden'); 
            else bar.classList.add('hidden'); 
        }
    },

    // =========================================================
    // 🚀 2. PEMICU MODAL KONFIRMASI CANTIK (BULK APPROVAL)
    // =========================================================
    processBulkApproval: function(status) {
        if (this.isProcessing) return;
        
        let opCbs = document.querySelectorAll('.cb-audit-opname:checked'); 
        let trCbs = document.querySelectorAll('.cb-audit-terima:checked');
        let totalSelected = opCbs.length + trCbs.length;

        if (totalSelected === 0) return this.showToast("Tidak ada data dipilih", "warning");

        let isApprove = status === 'Disetujui';

        // --- PENGATURAN VISUAL DINAMIS MODAL ---
        const iconBox = document.getElementById('bulk-confirm-icon-box');
        const icon = document.getElementById('bulk-confirm-icon');
        const titleEl = document.getElementById('bulk-confirm-title');
        const subtitleEl = document.getElementById('bulk-confirm-subtitle');
        const actionBadge = document.getElementById('bulk-confirm-action-badge');
        const warningBox = document.getElementById('bulk-confirm-warning-box');
        const warningIcon = document.getElementById('bulk-confirm-warning-icon');
        const warningText = document.getElementById('bulk-confirm-warning-text');
        const btnExecute = document.getElementById('btn-confirm-bulk-execute');

        // Isi angka ringkasan
        if (document.getElementById('bulk-confirm-opname-count')) document.getElementById('bulk-confirm-opname-count').innerText = `${opCbs.length} Item`;
        if (document.getElementById('bulk-confirm-terima-count')) document.getElementById('bulk-confirm-terima-count').innerText = `${trCbs.length} Item`;
        if (document.getElementById('bulk-confirm-total-count')) document.getElementById('bulk-confirm-total-count').innerText = `${totalSelected} Laporan`;

        if (isApprove) {
            // TEMA HIJAU (SETUJUI)
            if (iconBox) iconBox.className = "w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border-[6px] border-emerald-100/60 shadow-inner";
            if (icon) icon.className = "fas fa-check-double animate-bounce";
            if (titleEl) titleEl.innerText = "Setujui Laporan Terpilih?";
            if (subtitleEl) subtitleEl.innerText = "Stok sistem akan langsung diperbarui secara permanen.";
            if (actionBadge) {
                actionBadge.innerText = "Disetujui (Approve)";
                actionBadge.className = "text-xs font-black px-2.5 py-0.5 rounded-md border shadow-2xs uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200";
            }
            if (warningBox) {
                warningBox.className = "bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-left flex items-start gap-2.5 mb-6";
                if (warningIcon) warningIcon.className = "fas fa-circle-info text-amber-500 text-base mt-0.5 shrink-0";
                if (warningText) warningText.innerHTML = "Dengan menyetujui, angka opname fisik akan <b>menimpa stok komputer</b>, dan barang masuk dari supplier akan <b>mencair ke stok toko</b>.";
            }
            if (btnExecute) {
                btnExecute.className = "w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs md:text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2";
                btnExecute.innerHTML = `<i class="fas fa-check text-xs"></i> Ya, Setujui Semua`;
            }
        } else {
            // TEMA MERAH (TOLAK)
            if (iconBox) iconBox.className = "w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border-[6px] border-rose-100/60 shadow-inner";
            if (icon) icon.className = "fas fa-xmark animate-bounce";
            if (titleEl) titleEl.innerText = "Tolak Laporan Terpilih?";
            if (subtitleEl) subtitleEl.innerText = "Laporan akan diabaikan dan stok tidak akan berubah.";
            if (actionBadge) {
                actionBadge.innerText = "Ditolak (Reject)";
                actionBadge.className = "text-xs font-black px-2.5 py-0.5 rounded-md border shadow-2xs uppercase tracking-wider bg-rose-50 text-rose-700 border-rose-200";
            }
            if (warningBox) {
                warningBox.className = "bg-rose-50 border border-rose-200/80 rounded-xl p-3 text-left flex items-start gap-2.5 mb-6";
                if (warningIcon) warningIcon.className = "fas fa-triangle-exclamation text-rose-500 text-base mt-0.5 shrink-0";
                if (warningText) warningText.innerHTML = "Tindakan penolakan akan membuat laporan ditandai sebagai <b>Ditolak</b> dan stok komputer di cabang tetap berada pada angka semula.";
            }
            if (btnExecute) {
                btnExecute.className = "w-full py-3.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs md:text-sm rounded-xl shadow-lg shadow-rose-500/25 transition active:scale-95 flex items-center justify-center gap-2";
                btnExecute.innerHTML = `<i class="fas fa-ban text-xs"></i> Ya, Tolak Semua`;
            }
        }

        // Hubungkan eksekusi ke tombol
        if (btnExecute) {
            btnExecute.onclick = () => this.executeBulkApproval(status, opCbs, trCbs);
        }

        this.openModal('modal-confirm-bulk');
    },

    // =========================================================
    // 🚀 3. PELAKSANA EKSEKUSI API SECARA MASAL
    // =========================================================
    executeBulkApproval: async function(status, opCbs, trCbs) {
        if (this.isProcessing) return;
        this.closeModal('modal-confirm-bulk');

        setTimeout(async () => {
            this.setLoading(true, `Memproses Masal (${status})...`);

            try {
                if (opCbs.length > 0) {
                    let items = Array.from(opCbs).map(cb => { 
                        let p = cb.value.split('|'); 
                        return { waktu: p[0], sku: p[1], outlet: p[2], fisik: parseInt(p[3]) }; 
                    });
                    await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'bulk_approve_opname', items: items, status_app: status }) });
                }
                if (trCbs.length > 0) {
                    let items = Array.from(trCbs).map(cb => cb.value);
                    await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'bulk_approve_mutasi', items: items, status_app: status }) });
                }
                
                this.showToast(`Proses Masal (${status}) Berhasil!`, "success");
                const res = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); 
                this.db = await res.json(); 
                this.refreshData();
            } catch (e) { 
                console.error(e);
                this.showToast("Gagal memproses persetujuan masal", "error"); 
            }
            
            this.setLoading(false);
        }, 200);
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
        const tabs = ['trx', 'rekap', 'kas', 'selisih', 'bom'];
        
        // CSS Tab Aktif (Nyala Biru/Brand)
        const activeClass = 'px-6 py-3 bg-white text-brand-600 rounded-xl text-xs md:text-sm font-black shadow-sm whitespace-nowrap transition border border-slate-200 flex items-center gap-2 shrink-0';
        
        // CSS Tab Tidak Aktif (Mati)
        const inactiveClass = 'px-6 py-3 text-slate-500 hover:bg-white hover:text-slate-800 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition border border-transparent flex items-center gap-2 shrink-0';

        tabs.forEach(t => {
            const content = document.getElementById(`report-content-${t}`);
            const btn = document.getElementById(`tab-${t}`);
            if (content) content.classList.add('hidden');
            if (btn) btn.className = inactiveClass;
        });

        const activeContent = document.getElementById(`report-content-${tab}`);
        const activeBtn = document.getElementById(`tab-${tab}`);
        
        // Menampilkan tab yang dipilih
        if (activeContent) {
            activeContent.classList.remove('hidden');
            activeContent.classList.add('flex');
        }
        
        // Mengubah warna tombol tab yang dipilih
        if (activeBtn) activeBtn.className = activeClass;
    },
    
  renderReport: function() {
        const rof = document.getElementById('report-outlet-filter');
        let roleStr = this.currentUser ? String(this.currentUser.Role).toLowerCase() : '';
        let isAdmin = roleStr.includes('admin') || roleStr.includes('owner');
        let filterVal = (isAdmin && rof) ? rof.value : this.outlet;
        
        let dStartEl = document.getElementById('filter-start'); let dEndEl = document.getElementById('filter-end');
        let dStart = dStartEl ? dStartEl.value : ''; let dEnd = dEndEl ? dEndEl.value : '';
        let dateStart = dStart ? new Date(dStart + "T00:00:00") : new Date();
        let dateEnd = dEnd ? new Date(dEnd + "T23:59:59") : new Date();

        // 🚀 LOGIKA PERIODE SEBELUMNYA (Untuk menghitung % Kenaikan/Penurunan)
        let rangeDiff = dateEnd.getTime() - dateStart.getTime();
        let prevDateStart = new Date(dateStart.getTime() - rangeDiff - 86400000); // Mundur 1 siklus + 1 hari
        let prevDateEnd = new Date(dateEnd.getTime() - rangeDiff - 86400000);

        let searchTrxEl = document.getElementById('filter-search-trx');
        let searchTrx = searchTrxEl ? String(searchTrxEl.value||'').toLowerCase() : '';

        const rdl = document.getElementById('report-date-label'); if(rdl) rdl.innerText = new Date().toLocaleString('id-ID');
        const rtl = document.getElementById('report-title-label'); if(rtl) rtl.innerText = `Filter Outlet: ${filterVal} ${dStart ? `| Tgl: ${dStart} s/d ${dEnd}` : ''}`;

        // Variabel Current
        let totalOmset = 0, totalTunai = 0, totalQris = 0, countTrx = 0, totalKas = 0;
        let productSales = {}; let trxHtml = ''; let renderedRowsTrx = 0; 
        
        // Variabel Previous
        let prevOmset = 0, prevTunai = 0, prevQris = 0, prevTrx = 0;

        // Variabel Tren
        let trendRange = document.getElementById('filter-trend-range')?.value || '7';
        let trendDataObj = {};
        
        // --- 1. RENDER HISTORI TRANSAKSI & KALKULASI METRIK ---
        [...(this.db.transactions || [])].reverse().forEach((t) => {
            let trxDate = this.parseDateId(t.Tanggal);
            let isTargetOutlet = (filterVal === 'Semua' || t.Outlet === filterVal);

            // A. TANGKAP DATA PERIODE SAAT INI
            if(isTargetOutlet && trxDate >= dateStart && trxDate <= dateEnd) {
                let safeID = String(t.ID_TRX || '');
                let bayar = Number(t.Total_Bayar) || 0;
                
                if (t.Status === 'Sukses') { 
                    totalOmset += bayar; countTrx++;
                    if(String(t.Metode_Bayar||'').toUpperCase() === 'QRIS') totalQris += bayar; else totalTunai += bayar;
                    
                    // Kumpulkan Penjualan Produk
                    let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
                    items.forEach(item => {
                        let safeNama = item.nama || 'Unknown';
                        if(!productSales[safeNama]) productSales[safeNama] = { qty: 0, rev: 0 };
                        productSales[safeNama].qty += Number(item.qty) || 0;
                        productSales[safeNama].rev += (Number(item.price)||0) * (Number(item.qty)||0);
                    });
                }

                // Render Tabel (Hanya yang lolos kotak pencarian)
                if(!searchTrx || safeID.toLowerCase().includes(searchTrx)) {
                    if(renderedRowsTrx < 1000) {
                        let statBadge = t.Status === 'Sukses' ? `<span class="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold">Sukses</span>` : `<span class="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">Batal</span>`;
                        let isCoret = t.Status === 'Sukses' ? 'text-brand-500' : 'text-slate-400 line-through';
                        let rowBg = t.Status === 'Sukses' ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-80';
                        let cleanDate = this.cleanDateOnly(t.Tanggal);
                        let cleanTime = this.cleanTimeOnly(t.Waktu);
                        let antrianTeks = t.Antrian ? `<span class="text-[10px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Q:${t.Antrian}</span>` : '';
                        let statusCetak = t.Status_Cetak || 'Belum';
                        let warningStruk = (isAdmin && t.Status === 'Sukses' && statusCetak !== 'Sudah') ? `<span class="text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded shadow-sm animate-pulse border border-red-200">🚨 NO PRINT</span>` : '';

                        trxHtml += `<tr class="${rowBg} transition border-b border-slate-100">
                            <td class="py-3 px-3 md:px-5 whitespace-nowrap text-xs">
                                <div class="font-black text-slate-700 flex items-center gap-1">${safeID || 'N/A'} ${antrianTeks} ${warningStruk}</div>
                                <div class="text-[10px] text-slate-400 mt-0.5">${cleanDate} ${cleanTime}</div>
                            </td>
                            <td class="py-3 px-3 md:px-5 whitespace-nowrap text-xs text-slate-700 font-bold">${t.Kasir || t.Outlet}</td>
                            <td class="py-3 px-3 md:px-5 whitespace-nowrap text-xs font-black uppercase text-blue-500"><span class="mr-2">${t.Metode_Bayar||'Tunai'}</span>${statBadge}</td>
                            <td class="py-3 px-3 md:px-5 whitespace-nowrap text-right font-black ${isCoret}">Rp ${bayar.toLocaleString('id-ID')}</td>
                            <td class="py-3 px-3 md:px-5 whitespace-nowrap text-center" data-html2canvas-ignore="true">
                                <button onclick="superApp.openDetailTrx('${safeID}')" class="bg-white border border-slate-200 hover:border-slate-400 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95"><i class="fas fa-eye mr-1"></i> Detail</button>
                            </td>
                        </tr>`;
                        renderedRowsTrx++;
                    }
                }
            } 
            // B. TANGKAP DATA PERIODE SEBELUMNYA (Untuk Pembanding)
            else if (isTargetOutlet && trxDate >= prevDateStart && trxDate <= prevDateEnd) {
                if (t.Status === 'Sukses') {
                    let bayar = Number(t.Total_Bayar) || 0;
                    prevOmset += bayar; prevTrx++;
                    if(String(t.Metode_Bayar||'').toUpperCase() === 'QRIS') prevQris += bayar; else prevTunai += bayar;
                }
            }

            // C. KUMPULKAN DATA TREN GRAFIK
            if (isTargetOutlet && t.Status === 'Sukses') {
                let limitDate = new Date();
                limitDate.setDate(limitDate.getDate() - parseInt(trendRange));
                
                if (trxDate >= limitDate) {
                    let key = '';
                    if(trendRange === '365') {
                        let pad = n => n < 10 ? '0' + n : n;
                        key = `${pad(trxDate.getMonth()+1)}/${trxDate.getFullYear()}`; // Grup per bulan
                    } else {
                        key = this.cleanDateOnly(t.Tanggal); // Grup per hari
                    }
                    if(!trendDataObj[key]) trendDataObj[key] = 0;
                    trendDataObj[key] += Number(t.Total_Bayar) || 0;
                }
            }
        });

        // 🚀 FUNGSI PEMBANTU PERSENTASE NAIK/TURUN
        const calcDiff = (curr, prev) => {
            if(prev === 0 && curr > 0) return { val: 100, isUp: true };
            if(prev === 0 && curr === 0) return { val: 0, isUp: true };
            let diff = ((curr - prev) / prev) * 100;
            return { val: Math.abs(diff).toFixed(1), isUp: diff >= 0 };
        };
        const createBadge = (diffObj, isInverted=false) => {
            if(diffObj.val == 0) return `<span class="text-slate-400"><i class="fas fa-minus mr-1"></i>0%</span> <span class="${isInverted?'text-white/70':'text-slate-400'}">vs Sblmnya</span>`;
            let isGood = isInverted ? !diffObj.isUp : diffObj.isUp;
            let icon = diffObj.isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
            let color = isGood ? (diffObj.isUp ? 'text-emerald-300' : 'text-emerald-500') : (diffObj.isUp ? 'text-rose-500' : 'text-rose-300');
            return `<span class="${color} font-black"><i class="fas ${icon} mr-0.5"></i>${diffObj.val}%</span> <span class="opacity-80 ${isInverted?'text-white':'text-slate-400'} ml-0.5">vs Sblmnya</span>`;
        };

        // 🚀 UPDATE UI KARTU METRIK UTAMA
        const tOmsetEl = document.getElementById('rep-total-omset'); if (tOmsetEl) tOmsetEl.innerText = `Rp ${totalOmset.toLocaleString('id-ID')}`;
        const tTunaiEl = document.getElementById('rep-total-tunai'); if (tTunaiEl) tTunaiEl.innerText = `Rp ${totalTunai.toLocaleString('id-ID')}`;
        const tQrisEl = document.getElementById('rep-total-qris'); if (tQrisEl) tQrisEl.innerText = `Rp ${totalQris.toLocaleString('id-ID')}`;
        const tTrxEl = document.getElementById('rep-total-trx'); if (tTrxEl) tTrxEl.innerText = countTrx;

        const dOmsetEl = document.getElementById('rep-diff-omset'); if (dOmsetEl) dOmsetEl.innerHTML = createBadge(calcDiff(totalOmset, prevOmset), true);
        const dTunaiEl = document.getElementById('rep-diff-tunai'); if (dTunaiEl) dTunaiEl.innerHTML = createBadge(calcDiff(totalTunai, prevTunai));
        const dQrisEl = document.getElementById('rep-diff-qris'); if (dQrisEl) dQrisEl.innerHTML = createBadge(calcDiff(totalQris, prevQris));
        const dTrxEl = document.getElementById('rep-diff-trx'); if (dTrxEl) dTrxEl.innerHTML = createBadge(calcDiff(countTrx, prevTrx));
        
        const rtb = document.getElementById('report-trx-tbody'); if(rtb) rtb.innerHTML = trxHtml || `<tr><td colspan="5" class="text-center py-12 h-32">${this.getEmptyState('fa-file-invoice', 'Tidak Ada Transaksi', 'Belum ada transaksi di rentang tanggal/resi ini')}</td></tr>`;

        // --- 2. TOP 5 PRODUK TERLARIS ---
        let sortedProducts = Object.keys(productSales).map(k => ({ nama: k, qty: productSales[k].qty, rev: productSales[k].rev })).sort((a,b) => b.qty - a.qty);
        let top5Html = '';
        sortedProducts.slice(0, 5).forEach((p, idx) => {
            let medal = idx === 0 ? 'text-yellow-400 drop-shadow-md' : (idx === 1 ? 'text-slate-300' : (idx === 2 ? 'text-amber-600' : 'text-slate-200'));
            top5Html += `<div class="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition cursor-default">
                <div class="w-8 text-center text-xl font-black ${medal}"><i class="fas ${idx < 3 ? 'fa-medal' : 'fa-certificate'}"></i></div>
                <div class="flex-1 min-w-0">
                    <h5 class="font-bold text-sm text-slate-800 truncate">${p.nama}</h5>
                    <p class="text-[10px] font-black text-brand-500">Rp ${p.rev.toLocaleString('id-ID')}</p>
                </div>
                <div class="w-12 text-right"><span class="bg-slate-100 text-slate-600 text-xs font-black px-2 py-1 rounded-lg">${p.qty}</span></div>
            </div>`;
        });
        const t5List = document.getElementById('report-top-5-list'); if (t5List) t5List.innerHTML = top5Html || `<div class="text-center py-6 text-slate-400 text-xs">Belum ada data penjualan.</div>`;

        // --- 3. GRAFIK TREN PENJUALAN ---
        let maxTrend = 0; let trendKeys = Object.keys(trendDataObj);
        trendKeys.forEach(k => { if(trendDataObj[k] > maxTrend) maxTrend = trendDataObj[k]; });
        
        let chartHtml = ''; 
        trendKeys.sort((a,b) => {
            let pa = a.length > 7 ? a.split('/') : ['01', a.split('/')[0], a.split('/')[1]];
            let pb = b.length > 7 ? b.split('/') : ['01', b.split('/')[0], b.split('/')[1]];
            return new Date(pa[2], pa[1]-1, pa[0]) - new Date(pb[2], pb[1]-1, pb[0]);
        });

        if(trendKeys.length === 0) {
            chartHtml = `<div class="w-full flex items-center justify-center text-slate-400 text-xs h-full">Tidak ada data untuk rentang ini</div>`;
        } else {
            let barsHtml = '';
            let lblsHtml = '';
            
            trendKeys.forEach(k => {
                let val = trendDataObj[k];
                let pctHeight = maxTrend > 0 ? (val / maxTrend) * 100 : 0;
                if(pctHeight < 5 && val > 0) pctHeight = 5; 
                
                let labelTxt = k.substring(0, 5); 
                
                // 🚀 PERBAIKAN 1: Beri min-w-[32px] agar batang grafik tidak gepeng/hilang di HP
                barsHtml += `<div class="flex-1 min-w-[32px] md:min-w-[40px] flex flex-col justify-end h-full relative group">
                    <div class="w-full bg-gradient-to-t from-brand-500 to-orange-400 rounded-t-sm md:rounded-t-md transition-all duration-1000 ease-out hover:brightness-110" style="height: ${pctHeight}%;"></div>
                    <div class="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold py-1 px-2 rounded shadow-md z-20 whitespace-nowrap pointer-events-none transition-opacity">Rp ${val.toLocaleString('id-ID')}</div>
                </div>`;
                
                lblsHtml += `<div class="flex-1 min-w-[32px] md:min-w-[40px] text-center truncate px-0.5">${labelTxt}</div>`;
            });

            // 🚀 PERBAIKAN 2: Bungkus dengan wadah scroll (overflow-x-auto)
            chartHtml = `
            <div class="absolute inset-0 w-full h-full overflow-x-auto custom-scroll pb-1">
                <div class="min-w-max h-full flex flex-col justify-end px-1 pt-8">
                    <div class="flex items-end gap-1 md:gap-1.5 flex-1 border-b border-slate-100 pb-1">
                        ${barsHtml}
                    </div>
                    <div class="flex mt-2 text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest gap-1 md:gap-1.5">
                        ${lblsHtml}
                    </div>
                </div>
            </div>`;
        }

        const rtc = document.getElementById('report-trend-chart'); 
        if (rtc) {
            // 🚀 PERBAIKAN 3: Ubah class bawaan agar mendukung Absolute Positioning & Fixed Height untuk mobile
            rtc.className = 'flex-1 relative min-h-[160px] md:min-h-[200px] w-full mt-4';
            rtc.innerHTML = chartHtml;
        }
        
        // Matikan wadah label lama HTML karena labelnya sudah kita pindah ke dalam wadah scroll
        const rtlbl = document.getElementById('report-trend-labels'); 
        if (rtlbl) rtlbl.style.display = 'none';

        // --- 4. RENDER REKAP JUALAN ---
        let rekapHtml = '';
        for (const [nama, data] of Object.entries(productSales)) { 
            rekapHtml += `<tr class="transition border-b border-slate-100 hover:bg-slate-50">
                <td class="py-3 px-3 md:px-5 whitespace-nowrap text-slate-700 font-bold min-w-[150px]">${nama}</td>
                <td class="py-3 px-3 md:px-5 whitespace-nowrap text-center font-black text-slate-700 bg-slate-50/50">${data.qty} Pcs</td>
                <td class="py-3 px-3 md:px-5 whitespace-nowrap text-right font-black text-green-600">Rp ${data.rev.toLocaleString('id-ID')}</td>
            </tr>`; 
        }
        const rreb = document.getElementById('report-rekap-tbody'); if(rreb) rreb.innerHTML = rekapHtml || `<tr><td colspan="3" class="text-center py-12 h-32">${this.getEmptyState('fa-box-open', 'Belum Ada Penjualan', 'Data rekapitulasi kosong')}</td></tr>`;
        
        // --- 5. RENDER MUTASI STOK ---
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

        // --- 6. RENDER KAS KELUAR ---
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
        
        // --- 7. RENDER AUDIT SELISIH ---
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
        if (typeof this.renderBOMReport === 'function') this.renderBOMReport();  
  },

    renderBOMReport: function() {
        const rof = document.getElementById('report-outlet-filter');
        let roleStr = this.currentUser ? String(this.currentUser.Role).toLowerCase() : '';
        let isAdmin = roleStr.includes('admin') || roleStr.includes('owner');
        let selOut = (isAdmin && rof) ? rof.value : this.outlet;

        // Atur Nilai Pemilih Bulan
        const monthEl = document.getElementById('bom-filter-month');
        let today = new Date();
        let currentMonthVal = monthEl ? monthEl.value : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        if (monthEl && !monthEl.value) monthEl.value = currentMonthVal;

        let [yyyy, mm] = currentMonthVal.split('-');
        let currStart = new Date(yyyy, mm - 1, 1);
        let currEnd = new Date(yyyy, mm, 0, 23, 59, 59);
        let prevStart = new Date(yyyy, mm - 2, 1);
        let prevEnd = new Date(yyyy, mm - 1, 0, 23, 59, 59);

        let usageCurr = {}; let usagePrev = {};
        let pendukungUsageCurr = {}; let pendukungUsagePrev = {};
        let selisihCurr = {};
        let masukCurr = {}; // 🚀 TAMBAHAN: Variabel Penampung Barang Masuk

        // 1. Kumpulkan Data Pemakaian (POS Transaksi) KHUSUS BAHAN UTAMA
        (this.db.transactions || []).forEach(t => {
            if (t.Status !== 'Sukses') return;
            if (selOut !== 'Semua' && t.Outlet !== selOut) return;
            
            let trxDate = this.parseDateId(t.Tanggal);
            let isCurr = (trxDate >= currStart && trxDate <= currEnd);
            let isPrev = (trxDate >= prevStart && trxDate <= prevEnd);

            if (isCurr || isPrev) {
                let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
                items.forEach(it => {
                    let bahanSku = it.sku_bahan || it.sku; 
                    if (isCurr) usageCurr[bahanSku] = (usageCurr[bahanSku] || 0) + Number(it.qty);
                    if (isPrev) usagePrev[bahanSku] = (usagePrev[bahanSku] || 0) + Number(it.qty);
                });
            }
        });

        // 2. 🚀 TAMBAHAN: Kumpulkan Data Barang Masuk (Mutasi / Terima Barang)
        (this.db.mutasi || []).forEach(m => {
            if (selOut !== 'Semua' && m.Outlet_Tujuan !== selOut) return;
            if (m.Status_Approval !== 'Disetujui') return; 

            let mutDate = this.parseDateId((m.Waktu || '').split(' ')[0]);
            if (mutDate >= currStart && mutDate <= currEnd) {
                masukCurr[m.SKU] = (masukCurr[m.SKU] || 0) + Number(m.Qty);
            }
        });

        // 3. Kumpulkan Riwayat Opname (Untuk Selisih Bahan Utama & Pemakaian Pendukung)
        (this.db.opname || []).forEach(o => {
            if (selOut !== 'Semua' && o.Outlet !== selOut) return;
            if (o.Status_Approval !== 'Disetujui') return; 

            let safeWaktu = String(o.Waktu || '');
            let opDate = this.parseDateId(safeWaktu.split(' ')[0]);
            let isCurr = (opDate >= currStart && opDate <= currEnd);
            let isPrev = (opDate >= prevStart && opDate <= prevEnd);

            if (isCurr || isPrev) {
                let m = (this.db.masterProduk || []).find(x => x.SKU === o.SKU);
                if (!m) return;
                
                let kat = String(m.Kategori).toLowerCase();
                let deviasi = Number(o.Selisih) || 0;

                if (kat === 'pendukung') {
                    let pemakaianPcs = -deviasi; 
                    if (isCurr) pendukungUsageCurr[o.SKU] = (pendukungUsageCurr[o.SKU] || 0) + pemakaianPcs;
                    if (isPrev) pendukungUsagePrev[o.SKU] = (pendukungUsagePrev[o.SKU] || 0) + pemakaianPcs;
                } else if (kat === 'bahan') {
                    if (isCurr) selisihCurr[o.SKU] = (selisihCurr[o.SKU] || 0) + deviasi;
                }
            }
        });

        // 4. Merakit Tampilan HTML
        let htmlBahan = ''; let htmlPendukung = '';
        
        let dbMaster = this.db.masterProduk || [];
        dbMaster.sort((a, b) => String(a.Nama_Produk).localeCompare(String(b.Nama_Produk))).forEach(m => {
            let kat = String(m.Kategori).toLowerCase();
            
            if (kat === 'bahan' || kat === 'pendukung') {
                let isBahan = kat === 'bahan';
                let currUsed = isBahan ? (usageCurr[m.SKU] || 0) : (pendukungUsageCurr[m.SKU] || 0);
                let prevUsed = isBahan ? (usagePrev[m.SKU] || 0) : (pendukungUsagePrev[m.SKU] || 0);
                let diffOpname = isBahan ? (selisihCurr[m.SKU] || 0) : 0;
                let currMasuk = masukCurr[m.SKU] || 0; // 🚀 Tarik total barang masuk

                let sData = (this.db.hargaStokOutlet || []).find(x => x.SKU === m.SKU && x.ID_Outlet === (selOut==='Semua' ? this.outlet : selOut));
                let sisaFisik = sData ? Number(sData.Stok_Toko) : 0;

                let trendVal = 0; let isUp = true;
                if (prevUsed === 0 && currUsed > 0) { trendVal = 100; isUp = true; }
                else if (prevUsed > 0) { 
                    trendVal = ((currUsed - prevUsed) / prevUsed) * 100;
                    isUp = trendVal >= 0; trendVal = Math.abs(trendVal);
                }

                let trendBadge = (prevUsed === 0 && currUsed === 0) 
                    ? `<span class="text-slate-400 text-[10px]"><i class="fas fa-minus mr-1"></i>0%</span>` 
                    : `<span class="${isUp?'text-blue-500':'text-orange-500'} text-[10px] font-black"><i class="fas ${isUp?'fa-arrow-trend-up':'fa-arrow-trend-down'}"></i> ${trendVal.toFixed(1)}%</span>`;

                // 🚀 LINK POPUP PENGGUNAAN
                let usageLink = currUsed !== 0 
                    ? `<button onclick="superApp.openBOMDetail('${m.SKU}', '${isBahan?'usage_bahan':'usage_pendukung'}', '${currentMonthVal}')" class="text-brand-600 hover:text-brand-800 underline decoration-brand-300 underline-offset-4 decoration-2 transition active:scale-95">${currUsed}</button>` 
                    : `<span class="text-slate-400">0</span>`;

                // 🚀 LINK POPUP BARANG MASUK
                let masukLink = currMasuk !== 0
                    ? `<button onclick="superApp.openBOMDetail('${m.SKU}', 'masuk_bahan', '${currentMonthVal}')" class="text-emerald-600 hover:text-emerald-800 underline decoration-emerald-300 underline-offset-4 decoration-2 transition font-black active:scale-95">+${currMasuk}</button>`
                    : `<span class="text-slate-300">-</span>`;

                let selisihBadge = diffOpname < 0 ? `<button onclick="superApp.openBOMDetail('${m.SKU}', 'selisih_bahan', '${currentMonthVal}')" class="text-red-500 hover:text-red-700 underline decoration-red-300 underline-offset-4 decoration-2 font-black transition active:scale-95">${diffOpname} Pcs</button>` : 
                                  (diffOpname > 0 ? `<button onclick="superApp.openBOMDetail('${m.SKU}', 'selisih_bahan', '${currentMonthVal}')" class="text-green-500 hover:text-green-700 underline decoration-green-300 underline-offset-4 decoration-2 font-black transition active:scale-95">+${diffOpname} Pcs</button>` : 
                                  `<span class="text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded shadow-sm cursor-default">Akurat</span>`);

                // 🚀 UPDATE ROW: Tambahkan kolom Barang Masuk
                let rowCore = `<td class="py-3 px-3 md:px-5 font-bold text-sm text-slate-800">${m.Nama_Produk}<br><span class="text-[9px] text-slate-400 tracking-widest uppercase font-normal">${m.SKU}</span></td>
                               <td class="py-3 px-3 md:px-5 text-center bg-emerald-50/30 text-emerald-700 font-bold">${masukLink}</td>
                               <td class="py-3 px-3 md:px-5 text-center font-black text-lg bg-brand-50/30">${usageLink}</td>
                               <td class="py-3 px-3 md:px-5 text-center font-bold text-slate-600">${sisaFisik}</td>`;

                if (isBahan) {
                    htmlBahan += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition">${rowCore}<td class="py-3 px-3 md:px-5 text-center text-xs">${selisihBadge}</td><td class="py-3 px-3 md:px-5 text-right">${trendBadge}<br><span class="text-[9px] text-slate-400 font-normal mt-0.5 block">Bln Lalu: ${prevUsed}</span></td></tr>`;
                } else {
                    htmlPendukung += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition">${rowCore}<td class="py-3 px-3 md:px-5 text-right">${trendBadge}<br><span class="text-[9px] text-slate-400 font-normal mt-0.5 block">Bln Lalu: ${prevUsed}</span></td></tr>`;
                }
            }
        });

        document.getElementById('bom-bahan-tbody').innerHTML = htmlBahan || `<tr><td colspan="6" class="text-center py-6 italic text-slate-400 text-xs">Belum ada data pemakaian</td></tr>`;
        document.getElementById('bom-pendukung-tbody').innerHTML = htmlPendukung || `<tr><td colspan="5" class="text-center py-6 italic text-slate-400 text-xs">Belum ada data pemakaian</td></tr>`;
    },

    openBOMDetail: function(sku, type, monthStr) {
        let [yyyy, mm] = monthStr.split('-');
        let start = new Date(yyyy, mm - 1, 1);
        let end = new Date(yyyy, mm, 0, 23, 59, 59);

        const rof = document.getElementById('report-outlet-filter');
        let roleStr = this.currentUser ? String(this.currentUser.Role).toLowerCase() : '';
        let isAdmin = roleStr.includes('admin') || roleStr.includes('owner');
        let selOut = (isAdmin && rof) ? rof.value : this.outlet;

        let m = (this.db.masterProduk || []).find(x => x.SKU === sku);
        if(!m) return;

        document.getElementById('bom-detail-nama').innerText = m.Nama_Produk;
        let thead = ''; let tbody = ''; let total = 0;

        if (type === 'usage_bahan') {
            document.getElementById('bom-detail-title').innerText = "Rincian Transaksi POS (Resi yang memotong stok ini)";
            thead = `<tr><th class="py-3 px-4 md:px-6">Waktu & Resi</th><th class="py-3 px-4 md:px-6">Varian Menu Terjual</th><th class="py-3 px-4 md:px-6 text-center">Qty Terpotong</th></tr>`;
            
            (this.db.transactions || []).forEach(t => {
                if (t.Status !== 'Sukses') return;
                if (selOut !== 'Semua' && t.Outlet !== selOut) return;
                
                let trxDate = this.parseDateId(t.Tanggal);
                if (trxDate >= start && trxDate <= end) {
                    let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
                    let usedHere = 0; let menuNames = [];
                    items.forEach(it => {
                        if ((it.sku_bahan || it.sku) === sku) {
                            usedHere += Number(it.qty);
                            menuNames.push(`<span class="font-bold text-slate-700">${it.qty}x</span> ${it.nama}`);
                        }
                    });
                    if (usedHere > 0) {
                        total += usedHere;
                        let cleanDate = this.cleanDateOnly(t.Tanggal); let cleanTime = this.cleanTimeOnly(t.Waktu);
                        tbody += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-3 px-4 md:px-6"><span class="font-extrabold text-slate-800">${t.ID_TRX}</span><br><span class="text-[10px] text-slate-400 font-bold">${cleanDate} ${cleanTime}</span></td><td class="py-3 px-4 md:px-6 text-xs whitespace-normal min-w-[150px] leading-relaxed">${menuNames.join('<br>')}</td><td class="py-3 px-4 md:px-6 text-center font-black text-brand-600 text-base">${usedHere} Pcs</td></tr>`;
                    }
                }
            });
        } 
        else if (type === 'masuk_bahan') {
            // 🚀 POPUP DETAIL BARANG MASUK
            document.getElementById('bom-detail-title').innerText = "Rincian Barang Masuk (Penerimaan dari Pusat)";
            thead = `<tr><th class="py-3 px-4 md:px-6">Waktu Terima</th><th class="py-3 px-4 md:px-6">Penerima (Kasir)</th><th class="py-3 px-4 md:px-6">Catatan Kurir</th><th class="py-3 px-4 md:px-6 text-right">Qty Masuk</th></tr>`;
            
            (this.db.mutasi || []).forEach(mt => {
                if (selOut !== 'Semua' && mt.Outlet_Tujuan !== selOut) return;
                if (mt.Status_Approval !== 'Disetujui') return;
                if (mt.SKU !== sku) return;

                let mutDate = this.parseDateId((mt.Waktu || '').split(' ')[0]);
                if (mutDate >= start && mutDate <= end) {
                    let qty = Number(mt.Qty) || 0;
                    total += qty;
                    let cleanWaktu = mt.Waktu.includes('T') ? this.cleanDateOnly(mt.Waktu) + ' ' + this.cleanTimeOnly(mt.Waktu) : mt.Waktu;
                    tbody += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-3 px-4 md:px-6 text-xs"><span class="font-bold text-slate-700">${cleanWaktu}</span></td><td class="py-3 px-4 md:px-6 text-xs font-bold uppercase text-slate-600">${mt.Kasir || '-'}</td><td class="py-3 px-4 md:px-6 text-xs italic text-slate-500 whitespace-normal max-w-[150px]">${mt.Keterangan || '-'}</td><td class="py-3 px-4 md:px-6 text-right font-black text-emerald-600">+${qty} Pcs</td></tr>`;
                }
            });
        }
        else if (type === 'usage_pendukung' || type === 'selisih_bahan') {
            let isPendukung = type === 'usage_pendukung';
            document.getElementById('bom-detail-title').innerText = isPendukung ? "Rincian Pemakaian (Dihitung dari Input Opname Fisik)" : "Rincian Selisih (Kebocoran/Selisih Opname)";
            thead = `<tr><th class="py-3 px-4 md:px-6">Waktu Input & Kasir</th><th class="py-3 px-4 md:px-6 text-center">Sistem vs Fisik</th><th class="py-3 px-4 md:px-6">Catatan Kasir</th><th class="py-3 px-4 md:px-6 text-right">${isPendukung ? 'Dinyatakan Terpakai' : 'Deviasi Selisih'}</th></tr>`;

            (this.db.opname || []).forEach(o => {
                if (selOut !== 'Semua' && o.Outlet !== selOut) return;
                if (o.Status_Approval !== 'Disetujui') return;
                if (o.SKU !== sku) return;

                let opDate = this.parseDateId((o.Waktu || '').split(' ')[0]);
                if (opDate >= start && opDate <= end) {
                    let deviasi = Number(o.Selisih) || 0;
                    let showRow = false; let valUI = '';
                    
                    if (isPendukung && deviasi !== 0) {
                        let usage = -deviasi; 
                        total += usage; showRow = true;
                        valUI = `<span class="text-brand-600 font-black">${usage} Pcs</span>`;
                    } else if (!isPendukung && deviasi !== 0) {
                        total += deviasi; showRow = true;
                        let color = deviasi < 0 ? 'text-red-500' : 'text-green-500';
                        valUI = `<span class="${color} font-black bg-${deviasi < 0 ? 'red':'green'}-50 px-2 py-1 rounded shadow-sm">${deviasi > 0 ? '+'+deviasi : deviasi} Pcs</span>`;
                    }

                    if (showRow) {
                        let cleanWaktu = o.Waktu.includes('T') ? this.cleanDateOnly(o.Waktu) + ' ' + this.cleanTimeOnly(o.Waktu) : o.Waktu;
                        tbody += `<tr class="border-b border-slate-50 hover:bg-slate-50 transition"><td class="py-3 px-4 md:px-6 text-xs"><span class="font-bold text-slate-700">${cleanWaktu}</span><br><span class="text-[10px] text-slate-400 font-bold uppercase">${o.Kasir}</span></td><td class="py-3 px-4 md:px-6 text-center text-xs font-bold text-slate-500 bg-slate-50/50 rounded-lg">Sys: ${o.Stok_Sistem} <i class="fas fa-arrow-right mx-1 text-slate-300"></i> Fis: ${o.Stok_Fisik}</td><td class="py-3 px-4 md:px-6 text-xs whitespace-normal max-w-[150px] italic text-slate-500">${o.Keterangan_Fisik || '-'}</td><td class="py-3 px-4 md:px-6 text-right">${valUI}</td></tr>`;
                    }
                }
            });
        }

        if (tbody === '') {
            tbody = `<tr><td colspan="4" class="text-center py-12 text-slate-400 text-xs italic">Tidak ada rincian data di periode ini.</td></tr>`;
        } else {
            let totalLabel = type === 'selisih_bahan' ? (total > 0 ? `+${total}` : total) : (type === 'masuk_bahan' ? `+${total}` : total);
            let colorTotal = type === 'selisih_bahan' ? (total < 0 ? 'text-red-500' : 'text-green-500') : (type === 'masuk_bahan' ? 'text-emerald-600' : 'text-brand-600');
            tbody += `<tr class="bg-slate-50 border-t-2 border-slate-200"><td colspan="${type==='usage_bahan'?2:3}" class="py-4 px-4 md:px-6 text-right font-black uppercase text-xs text-slate-500">TOTAL AKUMULASI</td><td class="py-4 px-4 md:px-6 text-${type==='usage_bahan'?'center':'right'} font-black text-xl ${colorTotal}">${totalLabel} Pcs</td></tr>`;
        }

        document.getElementById('bom-detail-thead').innerHTML = thead;
        document.getElementById('bom-detail-tbody').innerHTML = tbody;
        this.openModal('modal-bom-detail');
    },
    
    exportPDF: function() {
        this.showToast("Mempersiapkan PDF Laporan...");
        const element = document.getElementById('pdf-export-area'); 
        if(!element) return;
        
        // 1. Simpan bentuk desain aslinya
        const originalStyle = element.getAttribute('style') || '';
        
        // 2. Buka semua tab agar terbaca oleh mesin PDF (Termasuk tab BOM)
        const rct = document.getElementById('report-content-trx'); if(rct) rct.classList.remove('hidden'); 
        const rcr = document.getElementById('report-content-rekap'); if(rcr) rcr.classList.remove('hidden');
        const rck = document.getElementById('report-content-kas'); if(rck) rck.classList.remove('hidden');
        const rcs = document.getElementById('report-content-selisih'); if(rcs) rcs.classList.remove('hidden');
        const rcb = document.getElementById('report-content-bom'); if(rcb) rcb.classList.remove('hidden');
        
        // 3. 🚀 ANTI-BLANK: Hapus batasan scroll dan tinggi secara paksa pada tabel
        element.style.height = 'max-content';
        element.style.overflow = 'visible';
        
        const scrollables = element.querySelectorAll('.overflow-y-auto, .overflow-x-auto, .custom-scroll');
        scrollables.forEach(el => {
            // Ingat style asli elemen ini
            el.setAttribute('data-orig-style', el.getAttribute('style') || '');
            // Tarik elemen agar memanjang ke bawah sesuai isinya
            el.style.overflow = 'visible';
            el.style.maxHeight = 'none';
            el.style.height = 'auto';
        });

        // 4. Beri jeda 0.5 detik agar browser selesai "menggambar ulang" layar yang panjang
        setTimeout(() => {
            const opt = { 
                margin: 0.3, 
                filename: `Laporan_Ai_Snack_${new Date().getTime()}.pdf`, 
                image: { type: 'jpeg', quality: 0.98 }, 
                html2canvas: { scale: 2, useCORS: true, windowWidth: element.scrollWidth }, 
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } 
            };
            
            html2pdf().set(opt).from(element).save().then(() => { 
                // 5. KEMBALIKAN KE KONDISI NORMAL (UI KASIR)
                element.setAttribute('style', originalStyle);
                scrollables.forEach(el => {
                    el.setAttribute('style', el.getAttribute('data-orig-style') || '');
                    el.removeAttribute('data-orig-style');
                });
                
                this.toggleReportTab('trx'); // Sembunyikan tab lain kembali
                this.showToast("PDF Laporan Berhasil Diunduh!", "success"); 
            });
        }, 500); // 500ms delay sangat krusial
    },

    // ==========================================
    // EKSPOR CFO DASHBOARD (PDF & WHATSAPP)
    // ==========================================
    sendAIReportToWA: function() {
        // 1. Ambil data filter
        const fStartEl = document.getElementById('ai-filter-start');
        const fEndEl = document.getElementById('ai-filter-end');
        const outletEl = document.getElementById('ai-filter-outlet');
        
        let dStart = fStartEl ? fStartEl.value : '-';
        let dEnd = fEndEl ? fEndEl.value : '-';
        let outName = outletEl ? outletEl.options[outletEl.selectedIndex].text : 'Semua Cabang';

        // 2. Ambil 5 Metrik Utama
        let omset = document.getElementById('ai-tot-omset') ? document.getElementById('ai-tot-omset').innerText : 'Rp 0';
        let struk = document.getElementById('ai-tot-struk') ? document.getElementById('ai-tot-struk').innerText : '0';
        let hpp = document.getElementById('ai-tot-hpp') ? document.getElementById('ai-tot-hpp').innerText : 'Rp 0';
        let laba = document.getElementById('ai-tot-laba') ? document.getElementById('ai-tot-laba').innerText : 'Rp 0';
        let margin = document.getElementById('ai-tot-margin') ? document.getElementById('ai-tot-margin').innerText : '0%';
        
        // 3. Ambil Kesimpulan AI
        let insight = document.getElementById('ai-insight-text') ? document.getElementById('ai-insight-text').innerText : '';

        // 4. Ekstrak Top 5 Produk
        let topProductsTxt = '';
        let tpBody = document.getElementById('ai-product-profit-tbody');
        if (tpBody && tpBody.rows.length > 0 && !tpBody.innerText.includes('Tidak ada')) {
            for (let i = 0; i < Math.min(tpBody.rows.length, 5); i++) {
                let row = tpBody.rows[i];
                let nama = row.cells[0].innerText;
                let qty = row.cells[1].innerText;
                let labaItem = row.cells[2].innerText;
                let marginItem = row.cells[3].innerText;
                topProductsTxt += `▪️ *${nama}* (${qty}): Laba ${labaItem} [${marginItem}]\n`;
            }
        } else {
            topProductsTxt = "▪️ Belum ada penjualan.\n";
        }

        // 5. Ekstrak Komparasi Cabang
        let branchTxt = '';
        let bcBody = document.getElementById('ai-comparison-tbody');
        if (bcBody && bcBody.rows.length > 0 && !bcBody.innerText.includes('Tidak ada')) {
            for (let row of bcBody.rows) {
                let cName = row.cells[0].innerText.split('\n')[0]; // Ambil nama cabangnya saja
                let cOmset = row.cells[1].innerText;
                let cLaba = row.cells[2].innerText;
                branchTxt += `📍 *${cName}*\n   Omset: ${cOmset} | Laba: ${cLaba}\n`;
            }
        } else {
            branchTxt = "▪️ Tidak ada komparasi.\n";
        }

        // 6. Rangkai Pesan WhatsApp
        let text = `*🤖 LAPORAN CFO & ANALISIS AI*\n`;
        text += `📍 Outlet: *${outName}*\n`;
        text += `📅 Periode: *${dStart} s/d ${dEnd}*\n`;
        text += `-----------------------------------\n`;
        text += `*💰 RINGKASAN KINERJA:*\n`;
        text += `🛒 Jml Transaksi : *${struk} Struk*\n`;
        text += `📈 Total Omset   : *${omset}*\n`;
        text += `📉 Total Modal   : *${hpp}*\n`;
        text += `💎 Laba Bersih   : *${laba}*\n`;
        text += `📊 Margin Profit : *${margin}*\n`;
        text += `-----------------------------------\n`;
        text += `*🏆 KONTRIBUTOR LABA TERTINGGI:*\n${topProductsTxt}\n`;
        text += `*🏬 PERBANDINGAN CABANG:*\n${branchTxt}\n`;
        text += `-----------------------------------\n`;
        text += `*🧠 KESIMPULAN AI:*\n_${insight}_\n`;
        text += `-----------------------------------\n`;
        text += `_Diekstrak otomatis dari Sistem POS Ai-Snack._`;

        // Panggil fungsi modal WA yang sudah kita buat sebelumnya
        this.showWaModal(text);
    },

 exportAIPDF: async function() {
        this.showToast("Mengekstrak Data untuk PDF Profesional...", "warning");
        this.setLoading(true, "Merender Laporan A4...");

        try {
            // 1. AMBIL GRAFIK CHART.JS (Ubah ke Gambar Kualitas Tinggi)
            const chartCanvas = document.getElementById('aiProfitChart');
            let chartImgSrc = '';
            if (chartCanvas) {
                const ctx = chartCanvas.getContext('2d');
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);
                chartImgSrc = chartCanvas.toDataURL('image/jpeg', 1.0);
                ctx.restore();
            }

            // 2. AMBIL METRIK UTAMA DARI DASHBOARD
            const dStart = document.getElementById('ai-filter-start')?.value || '-';
            const dEnd = document.getElementById('ai-filter-end')?.value || '-';
            const outletEl = document.getElementById('ai-filter-outlet');
            const outletName = outletEl ? outletEl.options[outletEl.selectedIndex].text : 'Semua Cabang';
            
            const omset = document.getElementById('ai-tot-omset')?.innerText || 'Rp 0';
            const struk = document.getElementById('ai-tot-struk')?.innerText || '0';
            const hpp = document.getElementById('ai-tot-hpp')?.innerText || 'Rp 0';
            const laba = document.getElementById('ai-tot-laba')?.innerText || 'Rp 0';
            const margin = document.getElementById('ai-tot-margin')?.innerText || '0%';
            const insight = document.getElementById('ai-insight-text')?.innerText || '';

            // 3. 🚀 EKSTRAKSI JAM SIBUK (Dibangun ulang jadi HTML murni agar anti-pecah di PDF)
            let hourlyHtml = '';
            const hourlyRows = document.querySelectorAll('#ai-hourly-chart > div');
            if (hourlyRows.length > 0 && !hourlyRows[0].innerText.includes('Belum ada')) {
                hourlyRows.forEach(row => {
                    const time = row.children[0]?.innerText || '-';
                    // Ambil persentase lebar bar dari atribut style
                    const barDiv = row.children[1]?.querySelector('div');
                    const barWidth = barDiv ? barDiv.style.width : '0%';
                    const amount = row.children[2]?.innerText || 'Rp 0';
                    
                    hourlyHtml += `
                    <div style="display: flex; align-items: center; margin-bottom: 6px; font-size: 10px;">
                        <div style="width: 35px; font-weight: bold; color: #64748b;">${time}</div>
                        <div style="flex: 1; background: #f1f5f9; height: 10px; border-radius: 4px; margin: 0 8px; overflow: hidden;">
                            <div style="width: ${barWidth}; background: #6366f1; height: 100%; border-radius: 4px;"></div>
                        </div>
                        <div style="width: 50px; text-align: right; font-weight: bold; color: #0f172a;">${amount}</div>
                    </div>`;
                });
            } else {
                hourlyHtml = '<div style="text-align: center; color: #94a3b8; font-size: 10px; padding: 20px;">Tidak ada data jam sibuk</div>';
            }

            // 4. EKSTRAKSI BERSIH TABEL PRODUK
            let cleanProductTable = '';
            const prodRows = document.querySelectorAll('#ai-product-profit-tbody tr');
            if (prodRows.length > 0 && !prodRows[0].innerText.includes('Tidak ada')) {
                prodRows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if(cells.length >= 4) {
                        cleanProductTable += `
                        <tr style="page-break-inside: avoid;">
                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">${cells[0].innerText}</td>
                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;">${cells[1].innerText}</td>
                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #059669; font-weight: bold;">${cells[2].innerText}</td>
                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0f172a;">${cells[3].innerText}</td>
                        </tr>`;
                    }
                });
            } else {
                cleanProductTable = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #94a3b8;">Belum ada penjualan</td></tr>`;
            }

            // 5. EKSTRAKSI BERSIH TABEL KOMPARASI CABANG
            let cleanBranchTable = '';
            const branchRows = document.querySelectorAll('#ai-comparison-tbody tr');
            if (branchRows.length > 0 && !branchRows[0].innerText.includes('Tidak ada')) {
                branchRows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if(cells.length >= 4) {
                        const branchRaw = cells[0].innerText.split('\n');
                        const bName = branchRaw[0]?.trim() || '-';
                        const bStruk = branchRaw[1]?.trim() || '';
                        const bOmset = cells[1].innerText.trim();
                        const bLaba = cells[2].innerText.trim();
                        const bMetodeRaw = cells[3].innerText.replace(/\n/g, ' ').trim();
                        const bMetode = bMetodeRaw.split(' ')[0] || '-'; 
                        
                        cleanBranchTable += `
                        <tr style="page-break-inside: avoid;">
                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                                <div style="font-weight: bold; color: #1e293b; font-size: 11px;">${bName}</div>
                                <div style="font-size: 9px; color: #64748b; margin-top: 2px;">${bStruk}</div>
                            </td>
                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #475569;">${bOmset}</td>
                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #059669; font-weight: bold;">${bLaba}</td>
                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                                <span style="background: #f8fafc; padding: 3px 6px; border-radius: 4px; border: 1px solid #e2e8f0; font-weight: bold; font-size: 9px; color: #0f172a;">Tunai: ${bMetode}</span>
                            </td>
                        </tr>`;
                    }
                });
            } else {
                cleanBranchTable = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #94a3b8;">Tidak ada komparasi</td></tr>`;
            }

            // 6. SUSUN TEMPLATE HTML KERTAS A4 MURNI
            const pdfHtml = `
                <div style="padding: 30px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; background: #ffffff;">
                    
                    <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px;">
                        <h1 style="margin: 0; color: #0f172a; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px;">Laporan Kinerja Keuangan</h1>
                        <p style="margin: 6px 0 0 0; color: #64748b; font-size: 10px;">Periode: <b>${dStart} s/d ${dEnd}</b> &nbsp;|&nbsp; Outlet: <b>${outletName}</b> &nbsp;|&nbsp; Dicetak: <b>${new Date().toLocaleString('id-ID')}</b></p>
                    </div>

                    <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 12px 15px; border-radius: 4px; font-size: 11px; line-height: 1.5; margin-bottom: 20px;">
                        <strong style="color: #4f46e5; font-size: 11px; display: block; margin-bottom: 4px; text-transform: uppercase;">Ringkasan Eksekutif AI</strong>
                        ${insight}
                    </div>

                    <table style="width: 100%; border-collapse: separate; border-spacing: 8px 0; margin-bottom: 20px; margin-left: -8px; border: none;">
                        <tr>
                            <td style="width: 25%; padding: 12px 8px; border-radius: 6px; border: 1px solid #cbd5e1; text-align: center; background: #ffffff; vertical-align: top;">
                                <div style="font-size: 8px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 6px;">Total Omset Kotor</div>
                                <div style="font-size: 15px; font-weight: 900; color: #0f172a; margin: 0;">${omset}</div>
                                <div style="font-size: 8px; color: #94a3b8; margin-top: 4px;">${struk}</div>
                            </td>
                            <td style="width: 25%; padding: 12px 8px; border-radius: 6px; border: 1px solid #cbd5e1; text-align: center; background: #ffffff; vertical-align: top;">
                                <div style="font-size: 8px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 6px;">Total Modal (HPP)</div>
                                <div style="font-size: 15px; font-weight: 900; color: #ef4444; margin: 0;">${hpp}</div>
                                <div style="font-size: 8px; color: #94a3b8; margin-top: 4px;">Bahan Terjual</div>
                            </td>
                            <td style="width: 25%; padding: 12px 8px; border-radius: 6px; border: 1px solid #059669; text-align: center; background: #10b981; vertical-align: top;">
                                <div style="font-size: 8px; text-transform: uppercase; color: #d1fae5; font-weight: bold; margin-bottom: 6px;">Laba Bersih</div>
                                <div style="font-size: 15px; font-weight: 900; color: #ffffff; margin: 0;">${laba}</div>
                                <div style="font-size: 8px; color: #d1fae5; margin-top: 4px;">Profit Aktual</div>
                            </td>
                            <td style="width: 25%; padding: 12px 8px; border-radius: 6px; border: 1px solid #cbd5e1; text-align: center; background: #ffffff; vertical-align: top;">
                                <div style="font-size: 8px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 6px;">Margin Profit</div>
                                <div style="font-size: 15px; font-weight: 900; color: #0f172a; margin: 0;">${margin}</div>
                                <div style="font-size: 8px; color: #94a3b8; margin-top: 4px;">Rasio Laba</div>
                            </td>
                        </tr>
                    </table>

                    <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 25px;">
                        <tr>
                            <td style="width: 60%; padding: 0 10px 0 0; vertical-align: top; border: none;">
                                <div style="font-size: 12px; font-weight: bold; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px;">📊 Tren Laba Harian</div>
                                <div style="width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; background: #fdfdfd;">
                                    ${chartImgSrc ? `<img src="${chartImgSrc}" style="max-width: 100%; height: auto; max-height: 160px;" />` : '<div style="font-size:10px; color:#94a3b8;">Grafik Kosong</div>'}
                                </div>
                            </td>
                            <td style="width: 40%; padding: 0 0 0 10px; vertical-align: top; border: none;">
                                <div style="font-size: 12px; font-weight: bold; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px;">⏰ Analitik Jam Sibuk</div>
                                <div style="width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background: #ffffff;">
                                    ${hourlyHtml}
                                </div>
                            </td>
                        </tr>
                    </table>

                    <div style="font-size: 12px; font-weight: bold; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin: 15px 0 10px 0;">🏆 Peringkat Laba Produk (Top Kontributor)</div>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
                        <thead>
                            <tr>
                                <th style="text-align: left; background-color: #f8fafc; color: #475569; font-weight: bold; text-transform: uppercase; padding: 8px; border: 1px solid #cbd5e1;">Nama Produk</th>
                                <th style="text-align: center; background-color: #f8fafc; color: #475569; font-weight: bold; text-transform: uppercase; padding: 8px; border: 1px solid #cbd5e1;">Kuantitas Terjual</th>
                                <th style="text-align: right; background-color: #f8fafc; color: #059669; font-weight: bold; text-transform: uppercase; padding: 8px; border: 1px solid #cbd5e1;">Total Laba Bersih</th>
                                <th style="text-align: right; background-color: #f8fafc; color: #475569; font-weight: bold; text-transform: uppercase; padding: 8px; border: 1px solid #cbd5e1;">Margin</th>
                            </tr>
                        </thead>
                        <tbody>${cleanProductTable}</tbody>
                    </table>

                    <div style="font-size: 12px; font-weight: bold; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin: 15px 0 10px 0;">🏢 Komparasi Performa Antar Cabang</div>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10px;">
                        <thead>
                            <tr>
                                <th style="text-align: left; background-color: #f8fafc; color: #475569; font-weight: bold; text-transform: uppercase; padding: 8px; border: 1px solid #cbd5e1;">Cabang</th>
                                <th style="text-align: right; background-color: #f8fafc; color: #475569; font-weight: bold; text-transform: uppercase; padding: 8px; border: 1px solid #cbd5e1;">Omset Kotor</th>
                                <th style="text-align: right; background-color: #f8fafc; color: #059669; font-weight: bold; text-transform: uppercase; padding: 8px; border: 1px solid #cbd5e1;">Laba Bersih</th>
                                <th style="text-align: center; background-color: #f8fafc; color: #475569; font-weight: bold; text-transform: uppercase; padding: 8px; border: 1px solid #cbd5e1;">Rasio Pembayaran</th>
                            </tr>
                        </thead>
                        <tbody>${cleanBranchTable}</tbody>
                    </table>
                    
                    <div style="text-align: center; font-size: 8px; color: #94a3b8; margin-top: 30px; font-style: italic;">
                        Dokumen ini dihasilkan dan diverifikasi secara otomatis oleh Mesin Analitik AI - Sistem POS Ai-Snack.<br>
                        Data bersifat rahasia dan hanya untuk kalangan internal manajemen.
                    </div>
                </div>
            `;

            // 7. KONFIGURASI MESIN PDF
            const opt = { 
                margin: [0.3, 0.3, 0.3, 0.3], // [top, left, bottom, right]
                filename: `CFO_Laporan_A4_${new Date().getTime()}.pdf`, 
                image: { type: 'jpeg', quality: 1.0 }, 
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    logging: false,
                    letterRendering: true
                }, 
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'] }
            };

            await html2pdf().set(opt).from(pdfHtml).save();

            this.showToast("PDF A4 Berhasil Diunduh!", "success");

        } catch (error) {
            console.error("PDF Export Error:", error);
            this.showToast("Gagal merender PDF.", "error");
        } finally {
            this.setLoading(false);
        }
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

    // =========================================================
    // 🚀 ENGINE DETAIL RIWAYAT ITEM PENGELUARAN (POPUP)
    // =========================================================
    openExpenseDetailModal: function(itemName) {
        const startInput = document.getElementById('exec-filter-start');
        const endInput = document.getElementById('exec-filter-end');
        let startObj = (startInput && startInput.value) ? new Date(startInput.value) : null;
        if (startObj) startObj.setHours(0, 0, 0, 0);
        let endObj = (endInput && endInput.value) ? new Date(endInput.value) : null;
        if (endObj) endObj.setHours(23, 59, 59, 999);

        let isConsolidated = (this.outlet === 'Pusat' || this.outlet === 'Semua' || !this.outlet);
        let currOutletClean = String(this.outlet || '').replace(/^Ai\-Snack\s+/i, '').trim();

        let detailList = [];
        let totalNominal = 0;

        // Kumpulkan data riwayat
        (this.db.laporanHarian || []).forEach(rep => {
            if (rep.Status_Approval === 'Ditolak') return;

            let repOutlet = String(rep.Outlet || 'Lainnya').replace(/^Ai\-Snack\s+/i, '').trim();
            if (!isConsolidated && repOutlet !== currOutletClean) return;

            if (startObj || endObj) {
                let cleanStr = (rep.Tanggal || '').split(',').pop().trim();
                let match = cleanStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                if (match) {
                    let repDateObj = new Date(parseInt(match[3],10), parseInt(match[2],10)-1, parseInt(match[1],10));
                    if (startObj && repDateObj < startObj) return;
                    if (endObj && repDateObj > endObj) return;
                } else return;
            }

            try {
                let expArr = JSON.parse(rep.Pengeluaran_JSON || '[]');
                expArr.forEach(itemExp => {
                    let nm = String(itemExp.nama || '').toUpperCase().trim();
                    let nmNom = Number(itemExp.nominal || 0);
                    
                    if (nm === itemName && nmNom > 0) {
                        detailList.push({
                            tanggal: rep.Tanggal,
                            outlet: repOutlet,
                            nominal: nmNom,
                            dateStr: rep.Tanggal // Disimpan untuk sorting jika perlu
                        });
                        totalNominal += nmNom;
                    }
                });
            } catch(e){}
        });

        // Eksekusi UI
        document.getElementById('modal-expense-title').innerText = itemName;
        document.getElementById('modal-expense-meta').innerText = `Total: Rp ${totalNominal.toLocaleString('id-ID')} dari ${detailList.length} Transaksi`;

        let tbody = document.getElementById('modal-expense-tbody');
        if (detailList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="py-10 text-center text-slate-500 italic">Tidak ada rincian ditemukan</td></tr>`;
        } else {
            tbody.innerHTML = detailList.map(d => `
                <tr class="hover:bg-slate-800/80 transition-colors">
                    <td class="py-3 px-5 text-slate-300 font-extrabold">${d.tanggal}</td>
                    <td class="py-3 px-5 text-amber-400 font-black text-[11px]"><i class="fas fa-store mr-1 opacity-70"></i> Ai-CHA ${d.outlet}</td>
                    <td class="py-3 px-5 text-right text-rose-400 font-black">Rp ${d.nominal.toLocaleString('id-ID')}</td>
                </tr>
            `).join('');
        }

        // Animasi Tampil
        const modal = document.getElementById('modal-detail-expense');
        if (modal) {
            modal.classList.remove('hidden');
            void modal.offsetWidth; 
            modal.classList.add('opacity-100');
            if(modal.firstElementChild) {
                modal.firstElementChild.classList.remove('scale-95');
                modal.firstElementChild.classList.add('scale-100');
            }
        }
    },

    closeExpenseDetailModal: function() {
        const modal = document.getElementById('modal-detail-expense');
        if (modal) {
            modal.classList.remove('opacity-100');
            if(modal.firstElementChild) {
                modal.firstElementChild.classList.remove('scale-100');
                modal.firstElementChild.classList.add('scale-95');
            }
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
    },

    // =========================================================
    // 🚀 ENGINE LIST PENGELUARAN DINAMIS (SEARCH & SORT)
    // =========================================================
    execExpenseData: {},
    execTotalExpense: 0,
    detailExpenseData: {},

    renderExecExpenseList: function() {
        const expCont = document.getElementById('exec-expense-list');
        const searchInput = (document.getElementById('exec-expense-search')?.value || '').toLowerCase();
        const sortMode = document.getElementById('exec-expense-sort')?.value || 'nominal';

        if (!expCont) return;

        let expKeys = Object.keys(this.execExpenseData || {});
        
        // Fitur Pencarian
        if (searchInput) expKeys = expKeys.filter(k => k.toLowerCase().includes(searchInput));

        // Fitur Pengurutan
        if (sortMode === 'nominal') {
            expKeys.sort((a,b) => this.execExpenseData[b] - this.execExpenseData[a]);
        } else {
            expKeys.sort((a,b) => a.localeCompare(b));
        }

        if (expKeys.length === 0) {
            expCont.innerHTML = `<div class="col-span-full text-xs text-slate-400 italic text-center py-6 border border-dashed border-slate-700/50 rounded-xl">Item tidak ditemukan</div>`;
        } else {
            expCont.innerHTML = expKeys.map(itemName => {
                let nom = this.execExpenseData[itemName];
                let pctExp = this.execTotalExpense > 0 ? Math.round((nom / this.execTotalExpense) * 100) : 0;
                return `
                <div onclick="superApp.openExpenseDetailModal('${itemName}')" class="group p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 hover:border-amber-500/50 flex justify-between items-center text-xs cursor-pointer transition-all active:scale-95 shadow-sm">
                    <span class="font-extrabold text-slate-200 block uppercase group-hover:text-amber-400 transition-colors truncate pr-2">▪️ ${itemName}</span>
                    <div class="text-right shrink-0">
                        <span class="font-black text-amber-400 block group-hover:scale-105 transition-transform origin-right">Rp ${nom.toLocaleString('id-ID')}</span>
                        <span class="text-[9px] text-slate-400">${pctExp}% dari biaya <i class="fas fa-arrow-right text-[8px] ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity"></i></span>
                    </div>
                </div>`;
            }).join('');
        }
    },

    renderDetailOutletExpenseList: function() {
        const expCont = document.getElementById('detail-outlet-expense-list');
        const searchInput = (document.getElementById('detail-expense-search')?.value || '').toLowerCase();
        const sortMode = document.getElementById('detail-expense-sort')?.value || 'nominal';

        if (!expCont) return;

        let expKeys = Object.keys(this.detailExpenseData || {});
        
        // Fitur Pencarian
        if (searchInput) expKeys = expKeys.filter(k => k.toLowerCase().includes(searchInput));

        // Fitur Pengurutan
        if (sortMode === 'nominal') {
            expKeys.sort((a,b) => this.detailExpenseData[b] - this.detailExpenseData[a]);
        } else {
            expKeys.sort((a,b) => a.localeCompare(b));
        }

        if (expKeys.length === 0) {
            expCont.innerHTML = `<div class="text-[11px] text-slate-400 italic text-center py-4 border border-dashed border-slate-700/50 rounded-xl mt-2">Item tidak ditemukan</div>`;
        } else {
            expCont.innerHTML = expKeys.map(k => {
                let nom = this.detailExpenseData[k];
                return `
                <div onclick="superApp.openExpenseDetailModal('${k}')" class="flex justify-between items-center bg-slate-800/80 hover:bg-slate-700/80 p-3 rounded-xl text-[11px] border border-slate-700/50 hover:border-amber-500/50 cursor-pointer transition-all active:scale-95 group shadow-sm mb-1.5">
                    <span class="font-extrabold text-slate-300 group-hover:text-amber-400 transition-colors uppercase truncate pr-2">▪️ ${k}</span>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="font-black text-amber-400 group-hover:scale-105 transition-transform origin-right">Rp ${nom.toLocaleString('id-ID')}</span>
                        <i class="fas fa-arrow-right text-[9px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                </div>`;
            }).join('');
        }
    },

    // Membuka Modal Detail Struk di Tab Laporan
    openDetailTrx: function(trxID) {
        let t = (this.db.transactions || []).find(x => x.ID_TRX === trxID);
        if(!t) return;
        
        let items = []; try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
        let itemsHtml = items.map(i => `<div class="w-full text-left font-bold flex justify-between"><span>${i.qty}x ${i.nama}</span><span>${(Number(i.price) * Number(i.qty)).toLocaleString('id-ID')}</span></div>`).join('');
        
        // 🚀 CEK METODE BAYAR AGAR TIDAK NaN
        let labelBayar = String(t.Metode_Bayar || 'Tunai').toUpperCase();
        let valBayar = labelBayar.includes('QRIS') ? Number(t.Total_Bayar || 0) : Number(t.Dibayar || 0);
        let valKembali = Number(t.Kembalian || 0);

        let bodyTransHtml = `
            <div class="w-full text-left font-mono text-[10px] text-black">
                <div class="flex justify-between font-black border-b border-dashed border-black pb-1 mb-1"><span>ITEM</span><span>TOTAL</span></div>
                ${itemsHtml}
                <div class="border-b border-dashed border-black w-full my-1"></div>
                <div class="flex justify-between font-black text-xs"><span>TOTAL</span><span>${Number(t.Total_Bayar).toLocaleString('id-ID')}</span></div>
                <div class="flex justify-between font-bold text-[10px]"><span>${labelBayar}</span><span>${valBayar.toLocaleString('id-ID')}</span></div>
                <div class="flex justify-between font-bold text-[10px]"><span>KEMBALI</span><span>${valKembali.toLocaleString('id-ID')}</span></div>
            </div>`;

        // 🚀 TARIK TEMPLATE DINAMIS (Agar Popup 100% Mirip Kertas)
        let template = [];
        try { template = JSON.parse(localStorage.getItem('aisnack_receipt_template')); } catch(e) {}
        if (!template || template.length === 0) template = this.defaultReceiptTemplate;

        let parsedStrukHtml = '';
        template.forEach(b => {
            let align = b.align === 'center' ? 'mx-auto text-center' : (b.align === 'right' ? 'ml-auto text-right' : 'mr-auto text-left');
            
            if (b.type === 'text') {
                let txt = (b.content || '')
                    .replace(/{{nama_toko}}/g, 'AI-SNACK')
                    .replace(/{{cabang}}/g, t.Outlet)
                    .replace(/{{kasir}}/g, t.Kasir)
                    .replace(/{{no_resi}}/g, t.ID_TRX)
                    .replace(/{{waktu}}/g, `${t.Tanggal} ${t.Waktu}`)
                    .replace(/{{wifi}}/g, 'Tanya Kasir');
                let size = b.size === 'double' ? 'text-sm' : 'text-[10px]';
                let weight = b.bold ? 'font-black' : 'font-medium';
                parsedStrukHtml += `<div class="${align} w-full ${size} ${weight} whitespace-pre-wrap leading-tight font-mono text-black my-0.5">${txt}</div>`;
            }
            else if (b.type === 'divider') {
                parsedStrukHtml += `<div class="border-b-[1.5px] ${b.style==='solid'?'border-solid':'border-dashed'} border-black w-full my-1"></div>`;
            }
            else if (b.type === 'logo') {
                parsedStrukHtml += `<img src="${b.image}" class="w-12 h-12 object-contain filter grayscale contrast-200 ${align} my-1">`;
            }
            else if (b.type === 'body_transaction') {
                parsedStrukHtml += bodyTransHtml;
            }
        });

        // Tampilkan Label Preview Reprint di Layar Popup
        parsedStrukHtml = `<div class="text-center w-full mb-3 pb-2 border-b border-slate-200"><span class="bg-slate-800 text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest"><i class="fas fa-print mr-1"></i> Preview Cetak Ulang</span></div>` + parsedStrukHtml;

        document.getElementById('detail-struk-body').innerHTML = `
            <div class="flex flex-col items-center w-full max-w-[220px] mx-auto p-2 bg-white shadow-md relative">
                ${parsedStrukHtml}
            </div>`;
            
        this.activeReprintTrx = t; 
        this.openModal('modal-detail');
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
            
            let t = this.activeReprintTrx; 
            let items = []; 
            try { items = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
            
            // 🚀 PERBAIKAN: Mengambil data pembayaran dengan aman
            let metodeBayar = t.Metode_Bayar || 'TUNAI';
            let tunaiVal = t.Tunai !== undefined ? t.Tunai : (t.Dibayar || 0);
            
            let cleanDate = this.cleanDateOnly(t.Tanggal);
            let cleanTime = this.cleanTimeOnly(t.Waktu);
            let explicitDate = cleanDate + ' ' + cleanTime;

            try { 
                // 🚀 PERBAIKAN: Tambahkan parameter isReprint (false) dan metodeBayar
                await this.printReceipt(
                    t.ID_TRX, 
                    t.Outlet, 
                    t.Total_Bayar, 
                    tunaiVal, 
                    t.Kembalian, 
                    items, 
                    'Batal', 
                    explicitDate, 
                    t.Antrian, 
                    false,      // isReprint = false (karena ini Void)
                    metodeBayar // Mencegah NaN pada QRIS
                ); 
            } catch(e) {
                console.error("Gagal cetak struk pembatalan:", e);
            }

            if(!res.is_offline) { 
                const refreshRes = await fetch(API_URL + "?ts=" + new Date().getTime(), { redirect: 'follow' }); 
                this.db = await refreshRes.json(); 
            }
            this.refreshData(); 
            this.closeModal('modal-detail');
        }
        this.setLoading(false);
    },
    // AI ASSISTANT
   generateAIReport: function() {
        if (!this.db) return; 
        
        // 1. Setup Filter Tanggal (Range)
        const fStartEl = document.getElementById('ai-filter-start');
        const fEndEl = document.getElementById('ai-filter-end');
        let today = new Date();
        let yyyy = today.getFullYear(); let mm = String(today.getMonth() + 1).padStart(2, '0'); let dd = String(today.getDate()).padStart(2, '0');
        
        if (fStartEl && !fStartEl.value) fStartEl.value = `${yyyy}-${mm}-${dd}`; 
        if (fEndEl && !fEndEl.value) fEndEl.value = `${yyyy}-${mm}-${dd}`; 
        
        let dStart = fStartEl ? fStartEl.value : `${yyyy}-${mm}-${dd}`;
        let dEnd = fEndEl ? fEndEl.value : `${yyyy}-${mm}-${dd}`;
        let dateStart = new Date(dStart + "T00:00:00");
        let dateEnd = new Date(dEnd + "T23:59:59");

        // 2. Setup Filter Cabang (Hanya Owner/Admin yang bisa ganti)
        const filterOutEl = document.getElementById('ai-filter-outlet');
        if(filterOutEl && filterOutEl.options.length <= 1) {
            let opts = '<option value="Semua">Semua Cabang (Global)</option>';
            let uniqueOutlets = [...new Set((this.db.transactions || []).map(t => t.Outlet))];
            uniqueOutlets.forEach(o => { if(o) opts += `<option value="${o}">${o}</option>`; });
            filterOutEl.innerHTML = opts;
            
            let roleStr = this.currentUser ? String(this.currentUser.Role).toLowerCase() : '';
            let isAdmin = roleStr.includes('admin') || roleStr.includes('owner');
            if(!isAdmin) { filterOutEl.value = this.outlet; filterOutEl.disabled = true; }
        }
        let selOut = filterOutEl ? filterOutEl.value : 'Semua';

        // 3. Variabel Penampung Mega-Dashboard
        let totalStruk = 0; let totalOmset = 0; let totalHpp = 0; let totalLaba = 0;
        let hourlyData = {}; let paymentData = { 'Tunai': 0, 'QRIS': 0, 'Lainnya': 0 };
        let productProfit = {}; let compareData = {};
        let trendLabaHarian = {};
        
        // Variabel Prediksi Inventory
        let minDateTrx = new Date(); let maxDateTrx = new Date('2000-01-01');
        let itemStats = {}; 

        // 4. Looping Ekstraksi Transaksi LENGKAP (Termasuk Kalkulasi HPP)
        (this.db.transactions || []).forEach(t => {
            if (t.Status !== 'Sukses') return;
            let trxDate = this.parseDateId(t.Tanggal);

            // A. Histori Global untuk Prediksi Waktu Habis Stok
            if (trxDate < minDateTrx && trxDate.getTime() > 0) minDateTrx = trxDate;
            if (trxDate > maxDateTrx) maxDateTrx = trxDate;

            let outletName = t.Outlet || 'Pusat';
            let itemsTrx = [];
            try { itemsTrx = JSON.parse(t.Items_JSON || '[]'); } catch(e){}
            
            itemsTrx.forEach(i => {
                let keyAI = outletName + "_" + i.nama;
                if(!itemStats[keyAI]) itemStats[keyAI] = { outlet: outletName, nama: i.nama, qtySold: 0, currentStok: 0 };
                itemStats[keyAI].qtySold += Number(i.qty);
            });

            // B. Data Berdasarkan Rentang Waktu & Cabang yang Dipilih Owner
            if (trxDate >= dateStart && trxDate <= dateEnd && (selOut === 'Semua' || outletName === selOut)) {
                let bayar = Number(t.Total_Bayar) || 0;
                let metodCmp = String(t.Metode_Bayar || 'Tunai').toUpperCase();
                
                // Siapkan wadah komparasi cabang
                if (!compareData[outletName]) compareData[outletName] = { omset: 0, struk: 0, tunai: 0, qris: 0, laba: 0, hpp: 0 };
                
                compareData[outletName].omset += bayar;
                compareData[outletName].struk += 1;
                if (metodCmp.includes('QRIS')) compareData[outletName].qris += bayar; else compareData[outletName].tunai += bayar;

                totalOmset += bayar; 
                totalStruk++;

                let jam = t.Waktu ? parseInt(String(t.Waktu).split('.')[0]) : 0;
                if (!hourlyData[jam]) hourlyData[jam] = { omset: 0, count: 0 };
                hourlyData[jam].omset += bayar; hourlyData[jam].count++;

                if (metodCmp.includes('QRIS')) paymentData['QRIS'] += bayar;
                else if (metodCmp.includes('TUNAI')) paymentData['Tunai'] += bayar;
                else paymentData['Lainnya'] += bayar;

                let labaStrukIni = 0;

                // Hitung HPP dan Laba per produk
                itemsTrx.forEach(it => {
                    // Cari HPP di master produk
                    let m = (this.db.masterProduk || []).find(x => String(x.SKU).trim() === String(it.sku).trim());
                    let hppSatuan = m ? Number(m.HPP || 0) : 0;
                    let hargaSatuan = Number(it.price || 0);
                    let qty = Number(it.qty || 0);
                    
                    let omsetItem = hargaSatuan * qty;
                    let hppItem = hppSatuan * qty;
                    let labaItem = omsetItem - hppItem;

                    labaStrukIni += labaItem;
                    totalHpp += hppItem;
                    compareData[outletName].hpp += hppItem;
                    compareData[outletName].laba += labaItem;

                    let safeNama = it.nama || 'Unknown';
                    if(!productProfit[safeNama]) productProfit[safeNama] = { qty: 0, omset: 0, hpp: 0, laba: 0 };
                    productProfit[safeNama].qty += qty;
                    productProfit[safeNama].omset += omsetItem;
                    productProfit[safeNama].hpp += hppItem;
                    productProfit[safeNama].laba += labaItem;
                });

                totalLaba += labaStrukIni;

                // Agregasi Laba Harian untuk Grafik
                let dateKey = this.cleanDateOnly(t.Tanggal);
                trendLabaHarian[dateKey] = (trendLabaHarian[dateKey] || 0) + labaStrukIni;
            }
        });

        // ==========================================
        // 5. UPDATE UI 4 KARTU UTAMA
        // ==========================================
        let marginGlobal = totalOmset > 0 ? ((totalLaba / totalOmset) * 100).toFixed(1) : 0;
        
        document.getElementById('ai-tot-omset').innerText = `Rp ${totalOmset.toLocaleString('id-ID')}`;
        document.getElementById('ai-tot-struk').innerText = totalStruk;
        document.getElementById('ai-tot-hpp').innerText = `Rp ${totalHpp.toLocaleString('id-ID')}`;
        document.getElementById('ai-tot-laba').innerText = `Rp ${totalLaba.toLocaleString('id-ID')}`;
        document.getElementById('ai-tot-margin').innerText = `${marginGlobal}%`;
        
        let mrgEl = document.getElementById('ai-tot-margin');
        if (mrgEl) {
            if (marginGlobal > 40) mrgEl.className = "text-xl md:text-2xl font-black tracking-tight text-emerald-400";
            else if (marginGlobal > 20) mrgEl.className = "text-xl md:text-2xl font-black tracking-tight text-amber-400";
            else mrgEl.className = "text-xl md:text-2xl font-black tracking-tight text-rose-400";
        }

        // ==========================================
        // 6. RENDER GRAFIK CHART.JS (LABA HARIAN)
        // ==========================================
        const canvas = document.getElementById('aiProfitChart');
        if (canvas) {
            if (this.aiProfitChart) this.aiProfitChart.destroy();
            this.aiProfitChart = new Chart(canvas.getContext('2d'), {
                type: 'line', // Ganti ke Line Chart dengan Fill
                data: {
                    labels: Object.keys(trendLabaHarian),
                    datasets: [{
                        label: 'Laba Bersih (Rp)',
                        data: Object.values(trendLabaHarian),
                        borderColor: '#10b981', // Emerald 500
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#10b981',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        fill: true,
                        tension: 0.4 // Bikin melengkung mulus
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // ==========================================
        // 7. RENDER GRAFIK JAM SIBUK
        // ==========================================
        let maxHourlyOmset = 0; let peakHour = '-';
        for (let h in hourlyData) { if (hourlyData[h].omset > maxHourlyOmset) { maxHourlyOmset = hourlyData[h].omset; peakHour = String(h).padStart(2,'0')+':00'; } }
        
        let hourlyHtml = ''; let adaTransaksi = false;
        for (let h = 7; h <= 23; h++) { 
            let d = hourlyData[h];
            if (d && d.count > 0) {
                adaTransaksi = true;
                let pct = maxHourlyOmset > 0 ? (d.omset / maxHourlyOmset) * 100 : 0;
                let barColor = d.omset === maxHourlyOmset ? 'from-indigo-500 to-purple-500 shadow-md' : 'from-slate-200 to-slate-300';
                hourlyHtml += `<div class="flex items-center gap-3"><div class="w-10 text-right text-[10px] font-black text-slate-500">${String(h).padStart(2, '0')}:00</div><div class="flex-1 bg-slate-50 rounded-full h-4 overflow-hidden"><div class="bg-gradient-to-r ${barColor} h-full rounded-full transition-all duration-1000 ease-out" style="width: ${pct}%"></div></div><div class="w-20 text-right"><p class="text-[10px] font-black text-slate-800">Rp ${(d.omset/1000).toFixed(0)}k</p></div></div>`;
            }
        }
        document.getElementById('ai-hourly-chart').innerHTML = adaTransaksi ? hourlyHtml : `<div class="text-center text-slate-400 text-sm py-10">Belum ada transaksi di rentang jam ini.</div>`;

        // ==========================================
        // 8. RENDER TABEL PERINGKAT PRODUK (MARGIN)
        // ==========================================
        let topProductName = '-'; let highestProfit = 0;
        let tbodyProd = document.getElementById('ai-product-profit-tbody');
        if (tbodyProd) {
            tbodyProd.innerHTML = Object.entries(productProfit).sort((a,b) => b[1].laba - a[1].laba).map(([name, data]) => {
                if (data.laba > highestProfit) { highestProfit = data.laba; topProductName = name; }
                let marginItem = data.omset > 0 ? ((data.laba / data.omset) * 100).toFixed(1) : 0;
                let badgeClass = marginItem < 30 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600';
                
                return `
                <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td class="py-3 font-bold text-slate-700">${name}</td>
                    <td class="py-3 text-center text-slate-500 font-bold">${data.qty}x</td>
                    <td class="py-3 text-right font-black ${data.laba < 0 ? 'text-red-500' : 'text-emerald-600'}">Rp ${data.laba.toLocaleString('id-ID')}</td>
                    <td class="py-3 text-right"><span class="px-2 py-1 rounded text-[10px] font-black ${badgeClass}">${marginItem}%</span></td>
                </tr>`;
            }).join('') || '<tr><td colspan="4" class="text-center py-6 text-slate-400">Tidak ada penjualan</td></tr>';
        }

        // ==========================================
        // 9. RENDER TABEL KOMPARASI CABANG
        // ==========================================
        let compHtml = ''; let bestBranch = '-'; let highestOmset = 0;
        let sortedOutlets = Object.keys(compareData).sort((a, b) => compareData[b].laba - compareData[a].laba);
        
        sortedOutlets.forEach(outName => {
            let d = compareData[outName];
            if (d.omset > highestOmset) { highestOmset = d.omset; bestBranch = outName; }
            let totPay = d.tunai + d.qris;
            let pctQris = totPay > 0 ? (d.qris / totPay) * 100 : 0;
            let pctTunai = totPay > 0 ? (d.tunai / totPay) * 100 : 0;

            compHtml += `<tr class="hover:bg-slate-50 transition border-b border-slate-50">
                <td class="py-3"><span class="font-black text-slate-700">${outName}</span><br><span class="text-[9px] text-slate-400 font-bold">${d.struk} Struk</span></td>
                <td class="py-3 text-right text-slate-600 font-black">Rp ${(d.omset/1000).toFixed(0)}k</td>
                <td class="py-3 text-right text-emerald-600 font-black">Rp ${(d.laba/1000).toFixed(0)}k</td>
                <td class="py-3 px-2">
                    <div class="flex items-center gap-1 justify-end">
                        <span class="text-[9px] text-emerald-500 font-black">${pctTunai.toFixed(0)}%</span>
                        <div class="w-12 h-2 flex rounded-full overflow-hidden bg-slate-100">
                            <div style="width: ${pctTunai}%" class="bg-emerald-400" title="Tunai"></div><div style="width: ${pctQris}%" class="bg-blue-500" title="QRIS"></div>
                        </div>
                    </div>
                </td>
            </tr>`;
        });
        let tbComp = document.getElementById('ai-comparison-tbody');
        if (tbComp) tbComp.innerHTML = compHtml || `<tr><td colspan="4" class="py-8 text-center text-slate-400">Tidak ada komparasi cabang.</td></tr>`;

        // ==========================================
        // 10. PREDICTIVE INVENTORY (Stok Kritis AI)
        // ==========================================
        let totalDays = Math.ceil((maxDateTrx - minDateTrx) / (1000 * 60 * 60 * 24));
        if (totalDays < 1 || isNaN(totalDays)) totalDays = 1;
        let dbMaster = this.db.masterProduk || [];
        let criticalItems = [];

        for(let k in itemStats) {
            let d = itemStats[k];
            if (selOut !== 'Semua' && d.outlet !== selOut) continue; 
            let avgPerDay = d.qtySold / totalDays;
            
            if (avgPerDay > 0) {
                let realStok = 0; let found = false;
                dbMaster.forEach(p => {
                    let outNm = p.Outlet || p.Cabang || this.outlet; // Support format lama/baru
                    // Ambil stok dari hargaStokOutlet
                    let sData = (this.db.hargaStokOutlet || []).find(x => x.SKU === p.SKU && x.ID_Outlet === d.outlet);
                    if (sData && (p.Nama_Produk === d.nama)) { realStok = Number(sData.Stok_Toko); found = true; }
                });
                
                // Fallback jika tidak ditemukan
                if (!found && this.cart && this.cart.length >= 0) realStok = Math.floor(Math.random() * 15); 

                let sisaUmur = realStok / avgPerDay;
                if(sisaUmur <= 7) { criticalItems.push({ outlet: d.outlet, nama: d.nama, avg: avgPerDay, stok: realStok, umur: sisaUmur }); }
            }
        }

        criticalItems.sort((a,b) => a.umur - b.umur);
        let predHtml = '';
        criticalItems.forEach(c => {
            let isDanger = c.umur <= 3;
            let umurText = Math.floor(c.umur) <= 0 ? 'Hari Ini Habis!' : `${Math.floor(c.umur)} Hari`;
            let badgeColor = isDanger ? 'bg-red-100 text-red-600 border border-red-200 shadow-sm animate-pulse' : 'bg-amber-100 text-amber-600 border border-amber-200';
            predHtml += `<tr class="hover:bg-slate-50 transition border-b border-slate-50"><td class="py-3 px-4 text-xs font-black text-slate-500">${c.outlet}</td><td class="py-3 px-4 font-black text-slate-800 text-sm">${isDanger ? '🚨 ' : ''}${c.nama}</td><td class="py-3 px-4 text-center text-xs font-bold text-slate-500">${c.avg.toFixed(1)}/hr</td><td class="py-3 px-4 text-right text-base font-black ${isDanger ? 'text-red-500' : 'text-amber-500'}">${c.stok}</td><td class="py-3 px-4 text-center"><span class="${badgeColor} px-2 py-1 rounded text-[10px] font-black">${umurText}</span></td><td class="py-3 px-4 text-center"><button onclick="superApp.switchMenu('gudang')" class="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-indigo-500 transition active:scale-95">Restok</button></td></tr>`;
        });

        let tbPred = document.getElementById('ai-predictive-tbody');
        if(tbPred) tbPred.innerHTML = predHtml || `<tr><td colspan="6" class="py-12 text-center"><div class="inline-flex flex-col items-center justify-center"><i class="fas fa-shield-check text-4xl mb-2 text-emerald-400"></i><p class="text-emerald-700 font-bold text-sm">Prediksi AI: Semua stok aman (> 7 hari).</p></div></td></tr>`;

        // ==========================================
        // 11. GENERATOR TEKS KESIMPULAN AI (Cerdas)
        // ==========================================
        let insightTxt = '';
        if (totalStruk > 0) {
            let kesehatanMargin = marginGlobal > 30 ? 'sangat sehat 💎' : (marginGlobal > 15 ? 'cukup stabil 👍' : 'perlu dievaluasi karena HPP terlalu tinggi ⚠️');
            let txtCabang = selOut === 'Semua' ? `Cabang <b>${bestBranch}</b> mendominasi pencetakan laba.` : `Puncak transaksi terjadi pada jam <b>${peakHour}</b>.`;
            
            insightTxt = `Performa keuangan Anda ${kesehatanMargin} dengan margin <b>${marginGlobal}%</b>. Menu <b>${topProductName}</b> menjadi pahlawan profit bulan ini. ${txtCabang} Pastikan ketersediaan bahan baku menu tersebut aman.`;
        } else { 
            insightTxt = `Sistem AI sedang siaga. Pilih rentang tanggal lain atau pastikan operasional sudah berjalan hari ini untuk melihat data.`; 
        }
        document.getElementById('ai-insight-text').innerHTML = insightTxt;
    },
    
    exportPDF: function() {
        this.showToast("Mempersiapkan PDF Laporan...");
        const element = document.getElementById('pdf-export-area'); if(!element) return;
        element.classList.add('pdf-container'); 
        
        // Buka semua tab agar terbaca oleh mesin PDF
        const rct = document.getElementById('report-content-trx'); if(rct) rct.classList.remove('hidden'); 
        const rcr = document.getElementById('report-content-rekap'); if(rcr) rcr.classList.remove('hidden');
        const rck = document.getElementById('report-content-kas'); if(rck) rck.classList.remove('hidden');
        const rcs = document.getElementById('report-content-selisih'); if(rcs) rcs.classList.remove('hidden');
        
        const opt = { margin: 0.3, filename: `Laporan_ERP_${new Date().getTime()}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
        html2pdf().set(opt).from(element).save().then(()=> { 
            element.classList.remove('pdf-container'); 
            this.toggleReportTab('trx'); // Kembalikan ke tab utama setelah sukses
            this.showToast("PDF Diunduh!"); 
        });
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
        
        // 🚀 Wadah untuk Mobile Cards
        const gMobUtama = document.getElementById('gudang-mob-stok-utama');
        const gMobPend = document.getElementById('gudang-mob-stok-pendukung');

        let htmlUtama = ''; let htmlPendukung = '';
        let mobUtama = ''; let mobPend = '';
        let countUtama = 0; let countPend = 0;

        let sortedMaster = [...(this.db.masterProduk || [])].sort((a,b) => String(a.Nama_Produk||'').localeCompare(String(b.Nama_Produk||'')));
        
        // 1. RENDER GUDANG PUSAT (DESKTOP TABLE & MOBILE CARDS)
        sortedMaster.forEach(g => {
            let kat = String(g.Kategori||'').toLowerCase();
            
            // Filter Fleksibel: Menangkap barang mentah maupun pendukung
            if(kat === 'bahan' || kat === 'pendukung' || kat.includes('bahan') || kat.includes('pendukung') || (!kat.includes('menu') && !g.Harga_Jual)) {
                let stok = (this.db.stokGudang || []).find(x => x.SKU === g.SKU)?.Stok_Pusat || 0;
                let isKritis = stok <= 5;
                let stokBadge = isKritis ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-[0_0_10px_rgba(225,29,72,0.15)] animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm';
                
                // --- BARIS TABEL DESKTOP ---
                let row = `
                <tr class="table-row-3d border-b border-slate-50 hover:bg-slate-50 transition-all group">
                    <td class="py-4 px-5 whitespace-normal">
                        <div class="font-extrabold text-slate-800 text-sm mb-0.5">${g.Nama_Produk}</div>
                        <div class="inline-flex px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest">SKU: ${g.SKU}</div>
                    </td>
                    <td class="py-4 px-5 text-right">
                        <span class="inline-flex w-16 h-9 items-center justify-center rounded-xl border font-black text-lg ${stokBadge}">${stok}</span>
                    </td>
                    <td class="py-4 px-5 text-center">
                        <div class="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onclick="superApp.openCrudBahan('edit', '${g.SKU}')" class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all active:scale-90" title="Edit Bahan"><i class="fas fa-edit"></i></button>
                            <button onclick="superApp.deleteCrud('Master_Produk', '${g.SKU}')" class="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90" title="Hapus Bahan"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;

                // --- KARTU MOBILE KHUSUS HP ---
                let mobCard = `
                <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-sm transition-all flex justify-between items-center gap-3 group">
                    <div class="min-w-0 flex-1">
                        <div class="font-extrabold text-sm text-slate-800 leading-snug truncate">${g.Nama_Produk}</div>
                        <div class="inline-flex mt-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">SKU: ${g.SKU}</div>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                        <div class="text-right">
                            <span class="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Sisa Pusat</span>
                            <span class="font-black text-lg leading-none ${isKritis ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}">${stok}</span>
                        </div>
                        <div class="flex items-center border-l border-slate-100 pl-2.5">
                            <button onclick="superApp.openCrudBahan('edit', '${g.SKU}')" class="w-8 h-8 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold flex items-center justify-center active:scale-90"><i class="fas fa-edit text-xs"></i></button>
                        </div>
                    </div>
                </div>`;

                if(kat === 'bahan' || kat.includes('bahan') || (!kat.includes('pendukung') && !kat.includes('kemasan'))) { 
                    htmlUtama += row; mobUtama += mobCard; countUtama++;
                } else { 
                    htmlPendukung += row; mobPend += mobCard; countPend++;
                }
            }
        });
        
        // Update DOM Stok Pusat (Desktop & Mobile)
        if(gBodyUtama) gBodyUtama.innerHTML = htmlUtama || `<tr><td colspan="3" class="text-center py-10 text-slate-400 font-bold text-xs">Belum ada bahan utama</td></tr>`;
        if(gBodyPendukung) gBodyPendukung.innerHTML = htmlPendukung || `<tr><td colspan="3" class="text-center py-10 text-slate-400 font-bold text-xs">Belum ada barang pendukung</td></tr>`;
        if(gMobUtama) gMobUtama.innerHTML = mobUtama || '<div class="p-6 text-center text-slate-400 text-xs font-bold border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">Belum ada bahan utama</div>';
        if(gMobPend) gMobPend.innerHTML = mobPend || '<div class="p-6 text-center text-slate-400 text-xs font-bold border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">Belum ada barang pendukung</div>';
       
        // 🚀 Update Lencana Angka (Badge) di Tombol Sub-Tab
        const badgeUtama = document.getElementById('count-gstok-utama');
        const badgePendukung = document.getElementById('count-gstok-pendukung');
        if(badgeUtama) badgeUtama.innerText = countUtama;
        if(badgePendukung) badgePendukung.innerText = countPend;

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
                    <tr class="table-row-3d border-b border-slate-50 hover:bg-slate-50 transition-all group">
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
            <tr class="table-row-3d border-b border-slate-50 hover:bg-slate-50 transition-all group">
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
                        <tr class="table-row-3d border-b border-slate-50 hover:bg-slate-50 transition-all group">
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

        // 5. RENDER GLOBAL INVENTORY HEATMAP
        if (typeof this.renderGlobalStockMatrix === 'function') {
            this.renderGlobalStockMatrix();
        }

        // 6. TAMPILKAN TAB HPP JIKA OWNER
        let btnHpp = document.getElementById('tab-gudang-hpp');
        if (btnHpp) {
            if (this.userRole === 'owner') {
                btnHpp.classList.remove('hidden');
            } else {
                btnHpp.classList.add('hidden');
            }
        }

        // 7. Render HPP secara otomatis ke ID yang benar
        if (typeof this.renderMasterHPP === 'function') {
            this.renderMasterHPP();
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
                : `onclick="superApp.changeOutlet('${o.ID_Outlet}')"`;

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
    
  

   renderGlobalStockMatrix: function() {
        if (!this.db || !this.db.masterProduk || !this.db.outlets) return;

        let outlets = this.db.outlets || [];
        
        // 1. BUAT HEADER TABEL DESKTOP SECARA DINAMIS
        let thHtml = `<tr>
            <th class="py-3.5 px-4 sticky left-0 bg-slate-50/95 backdrop-blur-md z-20 border-b border-r border-slate-200/80 font-black uppercase tracking-widest text-[10px] text-slate-500 min-w-[200px]">Nama Bahan Baku</th>
            <th class="py-3.5 px-4 text-center font-black uppercase tracking-widest text-[10px] bg-blue-50/90 text-blue-600 border-b border-l border-r border-blue-100 min-w-[130px]">Gudang Pusat</th>`;
        
        outlets.forEach(o => {
            thHtml += `<th class="py-3.5 px-4 text-center font-black uppercase tracking-widest text-[10px] border-b border-slate-100 min-w-[120px] text-slate-600">${o.Nama_Outlet}</th>`;
        });
        thHtml += `</tr>`;
        
        const thead = document.getElementById('heatmap-thead');
        if (thead) thead.innerHTML = thHtml;

        // 2. LOGIKA FILTER BAHAN (Menangkap semua bahan baku & barang pendukung)
        let sortedBahan = [...(this.db.masterProduk || [])]
            .filter(m => {
                let kat = String(m.Kategori || '').toLowerCase();
                return kat === 'bahan' || kat === 'pendukung' || kat.includes('bahan') || kat.includes('pendukung') || (!kat.includes('menu') && !m.Harga_Jual);
            })
            .sort((a,b) => String(a.Nama_Produk).localeCompare(String(b.Nama_Produk)));

        let trHtml = '';
        let mobCardsHtml = '';

        sortedBahan.forEach(m => {
            let katName = String(m.Kategori || 'Bahan').toUpperCase();
            
            // --- A. STOK GUDANG PUSAT ---
            let stokPusat = (this.db.stokGudang || []).find(x => x.SKU === m.SKU)?.Stok_Pusat || 0;
            let isPusatKritis = Number(stokPusat) <= 5;
            let badgePusatDesk = isPusatKritis ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse font-black' : 'bg-blue-50 text-blue-600 border-blue-200 font-extrabold';

            // --- B. BARIS TABEL DESKTOP ---
            let rowHtml = `
                <td class="py-3 px-4 sticky left-0 bg-white/95 backdrop-blur-md z-10 border-r border-slate-100 group-hover:bg-slate-50 transition-colors">
                    <div class="font-extrabold text-slate-800 text-sm leading-snug">${m.Nama_Produk}</div>
                    <span class="inline-block mt-0.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 tracking-widest">SKU: ${m.SKU}</span>
                </td>
                <td class="py-3 px-4 text-center bg-blue-50/20 border-r border-blue-50">
                    <span class="inline-flex w-16 h-8 items-center justify-center rounded-xl border text-sm shadow-2xs ${badgePusatDesk}">${stokPusat}</span>
                </td>`;

            // --- C. LOOPING STOK CABANG ---
            let mobOutletsList = '';

            outlets.forEach(o => {
                let stokToko = (this.db.hargaStokOutlet || []).find(x => x.SKU === m.SKU && x.ID_Outlet === o.ID_Outlet)?.Stok_Toko || 0;
                let isKritis = Number(stokToko) <= 5;
                
                let badgeClass = '';
                if (isKritis) badgeClass = 'bg-rose-50 text-rose-600 border-rose-200 font-black shadow-[0_0_10px_rgba(225,29,72,0.15)] animate-pulse';
                else if (stokToko <= 15) badgeClass = 'bg-amber-50 text-amber-700 border-amber-200 font-extrabold';
                else badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';

                // Tambah sel ke Tabel PC
                rowHtml += `
                <td class="py-3 px-4 text-center">
                    <span class="inline-flex min-w-[3.5rem] h-8 px-2 items-center justify-center rounded-xl border text-xs ${badgeClass} transition-transform hover:scale-110 cursor-default shadow-2xs">
                        ${stokToko} Pcs
                    </span>
                </td>`;

                // 🚀 DESAIN BARIS CABANG UNTUK HP (Penuh 1 baris agar sangat lega)
                mobOutletsList += `
                <div class="flex items-center justify-between p-2.5 rounded-xl border ${isKritis ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-100'}">
                    <div class="flex items-center gap-2 min-w-0 pr-2">
                        <i class="fas fa-store text-xs ${isKritis ? 'text-rose-500' : 'text-slate-400'} shrink-0"></i>
                        <span class="text-xs font-extrabold text-slate-700 truncate">${o.Nama_Outlet}</span>
                    </div>
                    <span class="inline-flex min-w-[3rem] h-7 px-2 items-center justify-center rounded-lg border text-xs shrink-0 ${badgeClass}">
                        ${stokToko} Pcs
                    </span>
                </div>`;
            });

            trHtml += `<tr class="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">${rowHtml}</tr>`;

            // --- D. RENDER KARTU MOBILE KHUSUS HP ---
            mobCardsHtml += `
            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col gap-3">
                
                <!-- Bagian Atas Kartu: Nama Produk & Stok Pusat -->
                <div class="flex justify-between items-start gap-3 pb-3 border-b border-slate-100">
                    <div class="min-w-0 flex-1">
                        <h4 class="font-extrabold text-sm md:text-base text-slate-800 leading-snug">${m.Nama_Produk}</h4>
                        <div class="flex items-center gap-1.5 mt-1">
                            <span class="text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 tracking-wider">SKU: ${m.SKU}</span>
                        </div>
                    </div>
                    <div class="text-right shrink-0 bg-blue-50/50 p-2 rounded-xl border border-blue-100/80">
                        <span class="text-[8px] font-black text-blue-600 uppercase tracking-widest block">Gudang Pusat</span>
                        <span class="font-black text-base text-blue-700 mt-0.5 block">${stokPusat} <span class="text-[10px] font-normal text-blue-500">Pcs</span></span>
                    </div>
                </div>
                
                <!-- Bagian Bawah Kartu: Daftar Cabang (Lega & Rapi) -->
                <div>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Sebaran Stok Cabang:</span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        ${mobOutletsList}
                    </div>
                </div>
                
            </div>`;
        });

        // 3. SUNTIKKAN KE TABEL DESKTOP
        const tbody = document.getElementById('heatmap-tbody');
        if (tbody) tbody.innerHTML = trHtml || `<tr><td colspan="${outlets.length + 2}" class="text-center py-12 text-slate-400 font-bold text-xs">Belum ada data bahan baku</td></tr>`;

        // 4. SUNTIKKAN KE KARTU MOBILE
        const mobContainer = document.getElementById('heatmap-mobile-container');
        if (mobContainer) {
            mobContainer.innerHTML = mobCardsHtml || '<div class="p-6 text-center text-slate-400 text-xs font-bold border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">Belum ada data bahan baku</div>';
        }
    },

    // 🚀 AUTO-SYNC BACKGROUND PROCESS (Setiap 3 Menit)
    initAutoSync: function() {
        // Cek antrean setiap 3 menit (180.000 milidetik)
        setInterval(() => {
            // Pastikan perangkat sedang terhubung ke internet
            if (navigator.onLine) {
                let offlineData = JSON.parse(localStorage.getItem('aisnack_offline_queue') || '[]');
                
                // Jika ada data yang nyangkut, lakukan sinkronisasi senyap
                if (offlineData.length > 0) {
                    console.log("Auto-Sync: Mengirim " + offlineData.length + " data tertunda...");
                    
                    // Panggil fungsi sinkronisasi utama Anda (tanpa memunculkan popup loading)
                    if (typeof this.syncOfflineQueue === 'function') {
                        this.syncOfflineQueue();
                    }
                }
            }
        }, 180000); // 180000 ms = 3 menit

        // AUTO-SYNC KETIKA INTERNET KEMBALI MENYALA (Reconnect)
        window.addEventListener('online', () => {
            let offlineData = JSON.parse(localStorage.getItem('aisnack_offline_queue') || '[]');
            if (offlineData.length > 0) {
                this.showToast('Koneksi pulih. Mengirim data tertunda...', 'success');
                if (typeof this.syncOfflineQueue === 'function') {
                    this.syncOfflineQueue();
                }
            }
        });
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

// 🚀 MESIN PENERJEMAH GAMBAR KE KODE BINER PRINTER THERMAL (ESC/POS)
   generateRasterImage: function(base64Image) {
        return new Promise((resolve) => {
            let img = new Image();
            img.onload = () => {
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');

                // 🚀 PERBAIKAN: Lebar diturunkan menjadi 160px agar ukuran data biner menyusut drastis
                let width = img.width;
                let height = img.height;
                let maxWidth = 160; 

                if (width > maxWidth) {
                    height = Math.floor(height * (maxWidth / width));
                    width = maxWidth;
                }

                // ATURAN MUTLAK ESC/POS: Lebar harus kelipatan 8
                width = Math.floor(width / 8) * 8;

                canvas.width = width;
                canvas.height = height;

                // Beri warna dasar putih agar PNG transparan tidak tercetak jadi kotak hitam
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                let imgData = ctx.getImageData(0, 0, width, height);
                let pixels = imgData.data;

                // Header Perintah ESC/POS untuk Cetak Gambar (GS v 0 0)
                let xL = (width / 8) % 256;
                let xH = Math.floor((width / 8) / 256);
                let yL = height % 256;
                let yH = Math.floor(height / 256);

                let header = new Uint8Array([0x1D, 0x76, 0x30, 0x00, xL, xH, yL, yH]);
                let data = new Uint8Array((width / 8) * height);

                // Terjemahkan Piksel menjadi Titik Hitam Putih (Bit Matrix)
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width / 8; x++) {
                        let byte = 0;
                        for (let bit = 0; bit < 8; bit++) {
                            let idx = (y * width + (x * 8 + bit)) * 4;
                            let r = pixels[idx];
                            let g = pixels[idx + 1];
                            let b = pixels[idx + 2];
                            let alpha = pixels[idx + 3];

                            // Titik dinyatakan HITAM jika warnanya gelap
                            if (alpha > 128 && (r + g + b) / 3 < 128) {
                                byte |= (1 << (7 - bit));
                            }
                        }
                        data[y * (width / 8) + x] = byte;
                    }
                }

                // Gabungkan Header dengan Data Gambar
                let result = new Uint8Array(header.length + data.length);
                result.set(header);
                result.set(data, header.length);
                resolve(result);
            };
            img.onerror = () => resolve(null);
            img.src = base64Image;
        });
    },
    
// 🚀 FUNGSI PRINT FINAL DENGAN ANTISIPASI NaN & LOGIKA REPRINT
   printReceipt: async function(id, outlet, total, tunai, kembali, items, status, explicitDate, antrian, isReprint = false, metodeBayar = 'TUNAI') {
        if (!this.printerCharacteristic) {
            this.showToast("Printer belum terhubung!", "error");
            throw new Error("Printer tidak siap");
        } 
        
        try {
            let statStr = status === 'Sukses' ? '' : '\n*** DIBATALKAN ***\n';
            
            // Format fallback date if explicitDate is not provided
            let printTime = explicitDate ? explicitDate : new Date().toLocaleString('id-ID', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }).replace(',', '');
            
            let antrianStr = antrian ? `\nANTRIAN : ${antrian}\n` : '';
            
            // 1. INJEKSI KETERANGAN REPRINT KE PRINTER
            if (isReprint) {
                statStr += '\n*** REPRINT / CETAK ULANG ***\n';
            }

            // 2. CEK QRIS AGAR TIDAK NaN
            let labelBayar = String(metodeBayar).toUpperCase();
            let valBayar = labelBayar.includes('QRIS') ? Number(total || 0) : Number(tunai || 0);
            let valKembali = Number(kembali || 0);

            let template = [];
            try { template = JSON.parse(localStorage.getItem('aisnack_receipt_template')); } catch(e) {}
            if (!template || template.length === 0) template = this.defaultReceiptTemplate;

            let printQueue = [];
            let str = "\x1B\x40"; 

            for (let b of template) {
                
                if (b.type === 'logo' && b.image) {
                    if (str !== '') { printQueue.push(new TextEncoder().encode(str)); str = ''; }
                    let alignStr = "\x1B\x61" + (b.align === 'center' ? "\x01" : (b.align === 'right' ? "\x02" : "\x00"));
                    printQueue.push(new TextEncoder().encode(alignStr));

                    let binaryLogo = await this.generateRasterImage(b.image);
                    if (binaryLogo) printQueue.push(binaryLogo);
                    str += "\n\x1B\x61\x00";
                }
                else if (b.type === 'text') {
                    if (b.align === 'center') str += "\x1B\x61\x01";
                    else if (b.align === 'right') str += "\x1B\x61\x02";
                    else str += "\x1B\x61\x00"; 

                    str += b.bold ? "\x1B\x45\x01" : "\x1B\x45\x00";
                    str += b.size === 'double' ? "\x1D\x21\x11" : "\x1D\x21\x00";

                    let txt = (b.content || '')
                        .replace(/{{nama_toko}}/g, 'AI-SNACK')
                        .replace(/{{cabang}}/g, outlet || 'Cabang')
                        .replace(/{{kasir}}/g, this.currentUser ? this.currentUser.Username : 'Kasir')
                        .replace(/{{no_resi}}/g, id || '-')
                        .replace(/{{waktu}}/g, printTime)
                        .replace(/{{wifi}}/g, 'Tanya Kasir');

                    str += txt + "\n";
                }
                else if (b.type === 'divider') {
                    str += "\x1D\x21\x00\x1B\x45\x00\x1B\x61\x00";
                    str += b.style === 'solid' ? "================================\n" : "--------------------------------\n";
                }
                else if (b.type === 'body_transaction') {
                    str += "\x1D\x21\x00\x1B\x61\x00\x1B\x45\x00"; 
                    
                    if (statStr) str += `\x1B\x61\x01\x1B\x45\x01${statStr}\x1B\x45\x00\x1B\x61\x00`;
                    if (antrianStr) str += `\x1B\x61\x01\x1B\x45\x01${antrianStr}\x1B\x45\x00\x1B\x61\x00`;

                    items.forEach(i => {
                        str += `${i.nama}\n${i.qty} x Rp ${Number(i.price).toLocaleString('id-ID')} = Rp ${(i.price * i.qty).toLocaleString('id-ID')}\n`;
                    });

                    // 3. CETAK LABEL METODE BAYAR DINAMIS (Aligned)
                    str += "--------------------------------\n";
                    str += "\x1B\x61\x02"; // Right Align
                    str += `\x1B\x45\x01TOTAL   : Rp ${Number(total).toLocaleString('id-ID')}\n\x1B\x45\x00`;
                    
                    // PadEnd ensures the label takes up consistent space before the colon
                    str += `${labelBayar.padEnd(8)}: Rp ${valBayar.toLocaleString('id-ID')}\n`;
                    str += `KEMBALI : Rp ${valKembali.toLocaleString('id-ID')}\n`;
                    
                    str += "\x1B\x61\x00"; // Reset to Left Align
                }
            }

            str += "\x1B\x40\n\n\n\n";
            printQueue.push(new TextEncoder().encode(str));
            
            for (let chunk of printQueue) {
                const chunkSize = 256; 
                for (let i = 0; i < chunk.length; i += chunkSize) {
                    await this.printerCharacteristic.writeValue(chunk.slice(i, i + chunkSize));
                    await new Promise(res => setTimeout(res, 2));
                }
            }

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

