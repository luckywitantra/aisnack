/* Ai-Snack PWA install helper. Never bypasses Chrome's installability checks. */
(function(){
  'use strict';
  let deferredPrompt=null, shown=false;
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
  const safe=(v)=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function close(){const n=document.getElementById('aisnack-pwa-overlay');if(n)n.remove();}
  function open(){
    if(shown||standalone()||sessionStorage.getItem('aisnack_pwa_prompt_dismissed')==='1')return;
    shown=true;
    const overlay=document.createElement('div');overlay.id='aisnack-pwa-overlay';
    overlay.innerHTML=`<section id="aisnack-pwa-card" role="dialog" aria-modal="true" aria-labelledby="aisnack-pwa-title">
      <header class="pwa-head"><img class="pwa-logo" src="icon-192.png" alt=""><div><div style="font-size:11px;font-weight:800;letter-spacing:.12em;opacity:.9">AISNACK ENTERPRISE</div><h2 id="aisnack-pwa-title" style="font-size:21px;font-weight:900;margin:3px 0 0">Pasang Ai-Snack POS</h2></div><button class="pwa-close" type="button" aria-label="Tutup">×</button></header>
      <div class="pwa-body"><p style="font-weight:700;margin:0 0 6px">Akses lebih cepat dari layar utama HP.</p><p style="font-size:13px;color:#64748b;margin:0">Instal sebagai aplikasi web agar mudah dibuka tanpa mengetik alamat setiap kali.</p>
      <div class="pwa-status" id="aisnack-pwa-status">Memeriksa dukungan instalasi browser…</div>
      <div id="aisnack-pwa-instructions" class="pwa-instructions" hidden></div>
      <div style="margin-top:16px"><button id="aisnack-pwa-install" class="pwa-btn pwa-primary" type="button">Pasang aplikasi</button><button id="aisnack-pwa-guide" class="pwa-btn pwa-secondary" type="button">Tampilkan cara instal manual</button></div>
      <p style="font-size:11px;color:#94a3b8;margin:12px 0 0">Jika Chrome menolak instalasi, popup ini tidak dapat melewati pemeriksaan keamanan browser.</p></div></section>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.pwa-close').addEventListener('click',()=>{sessionStorage.setItem('aisnack_pwa_prompt_dismissed','1');close();});
    overlay.addEventListener('click',e=>{if(e.target===overlay){sessionStorage.setItem('aisnack_pwa_prompt_dismissed','1');close();}});
    const status=overlay.querySelector('#aisnack-pwa-status'), guide=overlay.querySelector('#aisnack-pwa-guide'), instructions=overlay.querySelector('#aisnack-pwa-instructions'), install=overlay.querySelector('#aisnack-pwa-install');
    if(!window.isSecureContext || location.protocol!=='https:')status.textContent='Alamat tidak terdeteksi sebagai HTTPS. GitHub Pages harus dibuka melalui https://; jangan membuka file HTML secara langsung.';
    else if(deferredPrompt)status.textContent='Chrome menyediakan dialog instalasi. Tekan Pasang aplikasi untuk melanjutkan.';
    else status.textContent='Chrome belum menyediakan dialog instalasi otomatis. Gunakan menu Chrome atau periksa manifest dan service worker.';
    install.addEventListener('click',async()=>{
      if(!deferredPrompt){instructions.hidden=false;instructions.innerHTML='<strong>Instalasi manual:</strong><ol style="padding-left:20px;list-style:decimal;margin-top:6px"><li>Buka alamat GitHub Pages aplikasi langsung di Chrome.</li><li>Tekan menu ⋮ di kanan atas.</li><li>Pilih <strong>Instal aplikasi</strong> atau <strong>Tambahkan ke layar utama</strong> jika tersedia.</li><li>Jika pilihan tetap menyebut aplikasi tidak dapat diinstal, lakukan pemeriksaan teknis di bawah—jangan menghapus data transaksi.</li></ol>';return;}
      try{deferredPrompt.prompt();const choice=await deferredPrompt.userChoice;deferredPrompt=null;if(choice&&choice.outcome==='accepted'){status.textContent='Permintaan instalasi diterima. Ikuti konfirmasi Android/Chrome.';install.disabled=true;install.textContent='Permintaan dikirim';}else{status.textContent='Instalasi dibatalkan. Anda dapat mencoba lagi dari menu Chrome.';}}catch(err){status.textContent='Chrome tidak dapat membuka dialog instalasi saat ini. Coba menu ⋮ Chrome.';console.warn('PWA install prompt error',err);}
    });
    guide.addEventListener('click',()=>{instructions.hidden=!instructions.hidden;if(!instructions.hidden)instructions.innerHTML='<strong>Cara instal manual di Android:</strong><ol style="padding-left:20px;list-style:decimal;margin-top:6px"><li>Pastikan alamat diawali <strong>https://</strong> dan berasal dari domain GitHub Pages yang benar.</li><li>Buka menu Chrome ⋮, lalu cari <strong>Instal aplikasi</strong>.</li><li>Jika hanya ada <strong>Tambahkan ke layar utama</strong>, gunakan pilihan tersebut sebagai pintasan.</li><li>Jika Chrome menampilkan <strong>App tidak dapat diinstal</strong>, lanjutkan pemeriksaan manifest/ikon/URL di bawah.</li></ol><p style="margin-top:8px"><strong>Catatan admin:</strong> pastikan file manifest.json, icon-192.png, icon-512.png, sw.js, dan pwa-install.js sudah terunggah pada folder publik GitHub Pages yang sama dengan index.html.</p>';});
  }
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;const status=document.getElementById('aisnack-pwa-status');if(status)status.textContent='Chrome siap menampilkan dialog instalasi. Tekan Pasang aplikasi.';const btn=document.getElementById('aisnack-pwa-install');if(btn)btn.textContent='Pasang aplikasi';});
  window.addEventListener('appinstalled',()=>{close();sessionStorage.setItem('aisnack_pwa_prompt_dismissed','1');});
  window.addEventListener('load',()=>{if(!standalone())setTimeout(open,8000);});
})();
