const KUNCI_PRODUK = 'produk_umkm';
const KUNCI_WA = 'wa_umkm';
const KUNCI_ALAMAT = 'alamat_umkm';
const KUNCI_TAMPILAN = 'tampilan_umkm';
const KUNCI_MENU_KUSTOM = 'menu_umkm';
const KUNCI_KREDENSIAL = 'kredensial_admin';
const KREDENSIAL_DEFAULT = { username: 'admin', password: 'desa123' };
const ALAMAT_DEFAULT = 'Sukasari, Purwakarta, Jawa Barat';
const WARNA_DEFAULT = { forest: '#263f34', clay: '#bd8159', cream: '#f7f5ee' };
const TAMPILAN_DEFAULT = {
    brandName: 'Sukasari Lokal', brandSubtitle: 'Purwakarta · Jawa Barat', navCatalog: 'Koleksi', navLocation: 'Lokasi',
    heroEyebrow: 'DARI TANGAN WARGA SUKASARI', heroTitleLine1: 'Yang baik,', heroTitleLine2: 'tumbuh dari desa.',
    heroDescription: 'Temukan rasa, karya, dan cerita dari UMKM warga Sukasari, Purwakarta. Dibuat dengan sepenuh hati, untuk dinikmati lebih dekat.',
    heroCta: 'Jelajahi karya warga', heroCaption: 'BUATAN LOKAL, CERITANYA PERSONAL', sealTop: 'DARI', sealTitle: 'DESA', sealBottom: '♡ DENGAN HATI',
    introMessage: 'Mendukung usaha kecil, merayakan hal-hal besar.', introPlace: 'SUKASARI · PURWAKARTA',
    catalogEyebrow: 'PILIHAN DARI DESA', catalogTitle: 'Etalase warga', catalogDescription: 'Setiap produk punya kisah. Temukan yang cocok untukmu.',
    searchPlaceholder: 'Cari produk atau cerita...', locationEyebrow: 'BERKUNJUNG KE SUKASARI', locationTitleLine1: 'Temukan kami', locationTitleLine2: 'di sekitar sini.',
    directionsLabel: 'Buka petunjuk arah', locationNote: 'Lokasi dapat diperbarui oleh admin agar lebih tepat.',
    footerBrand: 'Sukasari Lokal', footerMessage: 'Merawat cerita, menguatkan usaha warga.', footerCopyright: 'UMKM Desa Sukasari'
};
const FIELD_TAMPILAN = [
    ['brandName', 'Nama brand'], ['brandSubtitle', 'Keterangan brand'], ['navCatalog', 'Menu navigasi katalog'], ['navLocation', 'Menu navigasi lokasi'],
    ['heroEyebrow', 'Label kecil hero'], ['heroTitleLine1', 'Judul hero — baris 1'], ['heroTitleLine2', 'Judul hero — baris 2'],
    ['heroDescription', 'Deskripsi hero', true], ['heroCta', 'Teks tombol hero'], ['heroCaption', 'Keterangan hero'],
    ['sealTop', 'Lencana — tulisan atas'], ['sealTitle', 'Lencana — tulisan utama'], ['sealBottom', 'Lencana — tulisan bawah'],
    ['introMessage', 'Pesan pengantar'], ['introPlace', 'Keterangan lokasi pengantar'], ['catalogEyebrow', 'Label kecil katalog'],
    ['catalogTitle', 'Judul katalog'], ['catalogDescription', 'Deskripsi katalog'], ['searchPlaceholder', 'Petunjuk kolom pencarian'],
    ['locationEyebrow', 'Label kecil lokasi'], ['locationTitleLine1', 'Judul lokasi — baris 1'], ['locationTitleLine2', 'Judul lokasi — baris 2'],
    ['directionsLabel', 'Teks petunjuk arah'], ['locationNote', 'Catatan lokasi'], ['footerBrand', 'Nama brand footer'],
    ['footerMessage', 'Pesan footer'], ['footerCopyright', 'Teks hak cipta']
];

function ambilTampilanTersimpan() {
    try {
        const tersimpan = JSON.parse(localStorage.getItem(KUNCI_TAMPILAN) || '{}');
        return {
            teks: { ...TAMPILAN_DEFAULT, ...(tersimpan.teks && typeof tersimpan.teks === 'object' ? tersimpan.teks : {}) },
            warna: { ...WARNA_DEFAULT, ...(tersimpan.warna && typeof tersimpan.warna === 'object' ? tersimpan.warna : {}) }
        };
    } catch {
        return { teks: { ...TAMPILAN_DEFAULT }, warna: { ...WARNA_DEFAULT } };
    }
}

let pengaturanTampilan = ambilTampilanTersimpan();

function ambilPenyimpanan(kunci, nilaiDefault) {
    try {
        const nilai = localStorage.getItem(kunci);
        return nilai === null ? nilaiDefault : nilai;
    } catch {
        return nilaiDefault;
    }
}

function ambilKredensialAdmin() {
    try {
        const data = JSON.parse(localStorage.getItem(KUNCI_KREDENSIAL) || 'null');
        if (data && typeof data.username === 'string' && data.username.trim() && typeof data.password === 'string' && data.password) {
            return { username: data.username, password: data.password };
        }
    } catch { /* Gunakan akun awal jika data tidak dapat dibaca. */ }
    return { ...KREDENSIAL_DEFAULT };
}

function ambilProdukTersimpan() {
    try {
        const data = JSON.parse(localStorage.getItem(KUNCI_PRODUK) || '[]');
        return Array.isArray(data) ? data.filter(item => item && typeof item === 'object') : [];
    } catch {
        return [];
    }
}

let daftarProduk = ambilProdukTersimpan();
let menuKustom = (() => {
    try {
        const data = JSON.parse(localStorage.getItem(KUNCI_MENU_KUSTOM) || '[]');
        return Array.isArray(data) ? data.filter(item => typeof item === 'string' && item.trim()) : [];
    } catch { return []; }
})();
let nomorWA = ambilPenyimpanan(KUNCI_WA, '6281234567890');
let alamatUMKM = ambilPenyimpanan(KUNCI_ALAMAT, ALAMAT_DEFAULT);
let kredensialAdmin = ambilKredensialAdmin();
let kategoriAktif = 'Semua';
let urlPratinjau = null;
let idProdukDiedit = null;
let menuSedangDisunting = false;
let teksMenuSebelumEdit = null;

const gridProduk = document.getElementById('product-grid');
const listProdukAdmin = document.getElementById('admin-product-list');
const imageModal = document.getElementById('image-modal');
const fullProductImage = document.getElementById('full-product-image');
const inputFoto = document.getElementById('prod-img');
const pratinjauFoto = document.getElementById('image-preview');
const pratinjauVideo = document.getElementById('video-preview');
const tombolSubmitProduk = document.getElementById('btn-submit-product');
const tombolBatalEdit = document.getElementById('btn-cancel-edit');

function tampilkanToast(pesan, tipe = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast${tipe === 'error' ? ' error' : ''}`;
    toast.textContent = pesan;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
}

function terapkanTampilan() {
    Object.entries(pengaturanTampilan.teks).forEach(([kunci, nilai]) => {
        document.querySelectorAll(`[data-site-key="${kunci}"]`).forEach(elemen => {
            elemen.textContent = String(nilai);
        });
    });
    const inputCari = document.getElementById('search-input');
    inputCari.placeholder = pengaturanTampilan.teks.searchPlaceholder || TAMPILAN_DEFAULT.searchPlaceholder;
    inputCari.setAttribute('aria-label', inputCari.placeholder);
    const akar = document.documentElement;
    akar.style.setProperty('--forest', pengaturanTampilan.warna.forest);
    akar.style.setProperty('--forest-deep', pengaturanTampilan.warna.forest);
    akar.style.setProperty('--clay', pengaturanTampilan.warna.clay);
    akar.style.setProperty('--cream', pengaturanTampilan.warna.cream);
    akar.style.setProperty('--paper', '#fffefa');
}

function renderFormTampilan() {
    const wadah = document.getElementById('site-content-fields');
    wadah.replaceChildren();
    FIELD_TAMPILAN.forEach(([kunci, label, multiline]) => {
        const pembungkus = document.createElement('div');
        pembungkus.className = 'site-field';
        const labelElemen = document.createElement('label');
        const id = `site-field-${kunci}`;
        labelElemen.htmlFor = id;
        labelElemen.textContent = label;
        const input = document.createElement(multiline ? 'textarea' : 'input');
        input.id = id;
        input.maxLength = multiline ? 400 : 100;
        input.value = pengaturanTampilan.teks[kunci] || '';
        if (!multiline) input.type = 'text';
        pembungkus.append(labelElemen, input);
        wadah.appendChild(pembungkus);
    });
    document.getElementById('theme-forest').value = pengaturanTampilan.warna.forest;
    document.getElementById('theme-clay').value = pengaturanTampilan.warna.clay;
    document.getElementById('theme-cream').value = pengaturanTampilan.warna.cream;
}

function simpanTampilanWebsite(reset = false) {
    let teks;
    let warna;
    if (reset) {
        teks = { ...TAMPILAN_DEFAULT };
        warna = { ...WARNA_DEFAULT };
    } else {
        teks = Object.fromEntries(FIELD_TAMPILAN.map(([kunci]) => [
            kunci,
            document.getElementById(`site-field-${kunci}`).value.trim() || TAMPILAN_DEFAULT[kunci]
        ]));
        warna = {
            forest: document.getElementById('theme-forest').value,
            clay: document.getElementById('theme-clay').value,
            cream: document.getElementById('theme-cream').value
        };
    }
    try {
        localStorage.setItem(KUNCI_TAMPILAN, JSON.stringify({ teks, warna }));
        pengaturanTampilan = { teks, warna };
        terapkanTampilan();
        renderFormTampilan();
        tampilkanToast(reset ? 'Tampilan awal berhasil dipulihkan.' : 'Konten dan tampilan website berhasil disimpan.');
    } catch {
        tampilkanToast('Tampilan tidak dapat disimpan di browser ini.', 'error');
    }
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', maximumFractionDigits: 0
    }).format(Number(angka) || 0);
}

function buatKeadaanKosong(judul, keterangan, tampilkanReset = false) {
    const keadaan = document.createElement('div');
    keadaan.className = 'empty-state';
    const heading = document.createElement('strong');
    heading.textContent = judul;
    const detail = document.createElement('span');
    detail.textContent = keterangan;
    keadaan.append(heading, detail);

    if (tampilkanReset) {
        const reset = document.createElement('button');
        reset.type = 'button';
        reset.className = 'btn-reset-filter';
        reset.textContent = 'Tampilkan semua produk';
        reset.addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            kategoriAktif = 'Semua';
            renderKategoriMenu();
            tampilkanProdukTerpilih();
        });
        keadaan.appendChild(reset);
    }
    gridProduk.appendChild(keadaan);
}

function renderKategoriMenu() {
    const menuKategori = document.getElementById('category-menu');
    const kategoriProduk = [...new Set([...menuKustom, ...daftarProduk.map(produk => produk.category).filter(Boolean)])];
    renderDaftarMenuKustom();
    if (kategoriAktif !== 'Semua' && !kategoriProduk.includes(kategoriAktif)) kategoriAktif = 'Semua';

    menuKategori.replaceChildren();
    ['Semua', ...kategoriProduk].forEach(kategori => {
        const tombol = document.createElement('button');
        tombol.type = 'button';
        tombol.className = `category-link${kategoriAktif === kategori ? ' active' : ''}`;
        tombol.dataset.category = kategori;
        tombol.textContent = kategori;
        menuKategori.appendChild(tombol);
    });
}

function tampilkanProdukTerpilih() {
    const kataKunci = document.getElementById('search-input').value.trim().toLocaleLowerCase('id');
    const hasil = daftarProduk.filter(produk => {
        const kategori = produk.category || 'Lainnya';
        const teks = `${produk.name || ''} ${produk.desc || ''} ${kategori}`.toLocaleLowerCase('id');
        return (kategoriAktif === 'Semua' || kategori === kategoriAktif) && teks.includes(kataKunci);
    });
    renderProduk(hasil);
}

function renderProduk(data) {
    gridProduk.replaceChildren();
    if (!data.length) {
        buatKeadaanKosong(
            daftarProduk.length ? 'Belum ada yang cocok.' : 'Karya warga segera hadir.',
            daftarProduk.length ? 'Coba kata kunci lain atau tampilkan semua produk.' : 'Produk UMKM akan ditampilkan di sini setelah admin menambahkannya.',
            daftarProduk.length > 0
        );
        return;
    }

    data.forEach((produk, index) => {
        const kartu = document.createElement('article');
        kartu.className = 'product-card';
        kartu.style.animationDelay = `${Math.min(index * 0.07, 0.35)}s`;

        const adalahVideo = produk.mediaType === 'video' || String(produk.img || '').startsWith('data:video/');
        let media;
        if (adalahVideo) {
            media = document.createElement('video');
            media.className = 'product-video';
            media.src = produk.img || '';
            media.controls = true;
            media.playsInline = true;
            media.preload = 'metadata';
            media.setAttribute('aria-label', `Video ${produk.name || 'produk'}`);
        } else {
            media = document.createElement('button');
            media.type = 'button';
            media.className = 'product-image-button';
            media.setAttribute('aria-label', `Lihat foto ${produk.name || 'produk'} ukuran penuh`);
            const foto = document.createElement('img');
            foto.src = produk.img || '';
            foto.alt = produk.name || 'Foto produk UMKM';
            foto.loading = 'lazy';
            media.appendChild(foto);
        }

        const info = document.createElement('div');
        info.className = 'product-info';
        const kategori = document.createElement('span');
        kategori.className = 'product-category';
        kategori.textContent = produk.category || 'Lainnya';
        const nama = document.createElement('h3');
        nama.textContent = produk.name || 'Produk UMKM';
        const deskripsi = document.createElement('p');
        deskripsi.textContent = produk.desc || '';
        const harga = document.createElement('div');
        harga.className = 'price';
        harga.textContent = formatRupiah(produk.price);
        const pesan = `Halo, saya tertarik dengan produk ${produk.name || 'UMKM Sukasari'}. Apakah masih tersedia?`;
        const nomorProduk = String(produk.phone || nomorWA).replace(/\D/g, '');
        const beli = document.createElement('a');
        beli.className = 'btn-buy';
        beli.href = `https://wa.me/${encodeURIComponent(nomorProduk)}?text=${encodeURIComponent(pesan)}`;
        beli.target = '_blank';
        beli.rel = 'noopener noreferrer';
        beli.textContent = '↗ Pesan via WhatsApp';
        info.append(kategori, nama, deskripsi, harga, beli);
        kartu.append(media, info);
        gridProduk.appendChild(kartu);
    });
}

function renderDaftarMenuKustom() {
    const wadah = document.getElementById('custom-category-list');
    if (!wadah) return;
    wadah.replaceChildren();
    menuKustom.forEach(nama => {
        const baris = document.createElement('div');
        baris.className = 'custom-category-item';
        const teks = document.createElement('span');
        teks.textContent = nama;
        const hapus = document.createElement('button');
        hapus.type = 'button';
        hapus.dataset.removeCategory = nama;
        hapus.textContent = 'Hapus';
        baris.append(teks, hapus);
        wadah.appendChild(baris);
    });
}

function renderAdminList() {
    listProdukAdmin.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = 'Produk yang ditampilkan';
    listProdukAdmin.appendChild(heading);

    if (!daftarProduk.length) {
        const kosong = document.createElement('p');
        kosong.className = 'modal-intro';
        kosong.textContent = 'Belum ada produk. Tambahkan produk menggunakan form di atas.';
        listProdukAdmin.appendChild(kosong);
        return;
    }

    daftarProduk.forEach(produk => {
        const baris = document.createElement('div');
        baris.className = 'admin-item';
        const nama = document.createElement('span');
        nama.textContent = produk.name || 'Produk tanpa nama';
        const actions = document.createElement('div');
        actions.className = 'admin-item-actions';
        [['edit', 'Edit'], ['delete', 'Hapus']].forEach(([aksi, label]) => {
            const tombol = document.createElement('button');
            tombol.type = 'button';
            tombol.dataset.action = aksi;
            tombol.dataset.id = String(produk.id);
            tombol.textContent = label;
            if (aksi === 'edit') tombol.className = 'admin-edit-button';
            actions.appendChild(tombol);
        });
        baris.append(nama, actions);
        listProdukAdmin.appendChild(baris);
    });
}

function simpanProduk() {
    try {
        localStorage.setItem(KUNCI_PRODUK, JSON.stringify(daftarProduk));
        renderKategoriMenu();
        tampilkanProdukTerpilih();
        renderAdminList();
        return true;
    } catch {
        tampilkanToast('Penyimpanan browser penuh. Coba gunakan foto yang lebih kecil.', 'error');
        return false;
    }
}

function tutupDashboardAdmin() {
    document.getElementById('admin-modal').style.display = 'none';
    document.getElementById('customer-site').hidden = false;
}

function keluarModeAdmin() {
    batalkanSuntingMenu();
    tutupDashboardAdmin();
    document.getElementById('admin-preview-bar').hidden = true;
    document.getElementById('btn-edit-menu').hidden = true;
    document.getElementById('btn-add-category').hidden = true;
}

function ubahModeSuntingMenu() {
    const tombolSunting = document.getElementById('btn-edit-menu');
    const tautanMenu = [...document.querySelectorAll('[data-site-key]')];

    if (!menuSedangDisunting) {
        teksMenuSebelumEdit = tautanMenu.map(tautan => tautan.textContent);
        tautanMenu.forEach(tautan => {
            tautan.contentEditable = 'true';
            tautan.setAttribute('aria-label', `Sunting teks: ${tautan.textContent}`);
        });
        menuSedangDisunting = true;
        tombolSunting.textContent = 'Simpan menu';
        tautanMenu[0]?.focus();
        return;
    }

    const teksBaru = Object.fromEntries(FIELD_TAMPILAN.map(([kunci]) => {
        const elemen = document.querySelector(`[data-site-key="${kunci}"]`);
        return [kunci, elemen ? (elemen.textContent.trim() || TAMPILAN_DEFAULT[kunci]) : pengaturanTampilan.teks[kunci]];
    }));

    const pengaturanLama = pengaturanTampilan;
    pengaturanTampilan = { ...pengaturanTampilan, teks: { ...pengaturanTampilan.teks, ...teksBaru } };
    try {
        localStorage.setItem(KUNCI_TAMPILAN, JSON.stringify(pengaturanTampilan));
        selesaiSuntingMenu();
        terapkanTampilan();
        tampilkanToast('Nama menu berhasil disimpan.');
    } catch {
        pengaturanTampilan = pengaturanLama;
        tampilkanToast('Nama menu tidak dapat disimpan di browser ini.', 'error');
    }
}

function selesaiSuntingMenu() {
    document.querySelectorAll('[data-site-key]').forEach(tautan => {
        tautan.contentEditable = 'false';
        tautan.removeAttribute('aria-label');
    });
    menuSedangDisunting = false;
    teksMenuSebelumEdit = null;
    document.getElementById('btn-edit-menu').textContent = 'Sunting';
}

function batalkanSuntingMenu() {
    if (!menuSedangDisunting) return;
    document.querySelectorAll('[data-site-key]').forEach((tautan, indeks) => {
        tautan.textContent = teksMenuSebelumEdit[indeks];
    });
    selesaiSuntingMenu();
}

function perbaruiPeta() {
    const alamat = alamatUMKM || ALAMAT_DEFAULT;
    const query = encodeURIComponent(alamat);
    document.getElementById('location-address').textContent = alamat;
    document.getElementById('location-map').src = `https://maps.google.com/maps?q=${query}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    document.getElementById('directions-link').href = `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function simpanPengaturan() {
    const alamat = document.getElementById('admin-location').value.trim();
    if (!alamat) return tampilkanToast('Alamat lokasi tidak boleh kosong.', 'error');

    try {
        localStorage.setItem(KUNCI_ALAMAT, alamat);
        alamatUMKM = alamat;
        perbaruiPeta();
        tampilkanToast('Lokasi etalase berhasil diperbarui.');
    } catch {
        tampilkanToast('Pengaturan tidak dapat disimpan di browser ini.', 'error');
    }
}

function bersihkanPratinjauFoto() {
    if (urlPratinjau) URL.revokeObjectURL(urlPratinjau);
    urlPratinjau = null;
    pratinjauFoto.removeAttribute('src');
    pratinjauFoto.hidden = true;
    pratinjauVideo.pause();
    pratinjauVideo.removeAttribute('src');
    pratinjauVideo.load();
    pratinjauVideo.hidden = true;
}

function batalEditProduk() {
    idProdukDiedit = null;
    document.getElementById('admin-form').reset();
    bersihkanPratinjauFoto();
    tombolSubmitProduk.textContent = 'Tambah produk';
    document.getElementById('product-form-title').textContent = 'Tambah produk';
    tombolBatalEdit.hidden = true;
}

function tutupFoto() {
    imageModal.classList.remove('is-open');
    fullProductImage.removeAttribute('src');
}

function simpanVideo(file) {
    return new Promise((resolve, reject) => {
        const pembaca = new FileReader();
        pembaca.onload = () => resolve(pembaca.result);
        pembaca.onerror = () => reject(new Error('Video tidak dapat dibaca.'));
        pembaca.readAsDataURL(file);
    });
}

function optimalkanFoto(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const gambar = new Image();
        gambar.onload = () => {
            URL.revokeObjectURL(url);
            const skala = Math.min(1, 1400 / Math.max(gambar.width, gambar.height));
            const kanvas = document.createElement('canvas');
            kanvas.width = Math.max(1, Math.round(gambar.width * skala));
            kanvas.height = Math.max(1, Math.round(gambar.height * skala));
            const konteks = kanvas.getContext('2d');
            if (!konteks) return reject(new Error('Canvas tidak tersedia.'));
            konteks.drawImage(gambar, 0, 0, kanvas.width, kanvas.height);
            resolve(kanvas.toDataURL('image/jpeg', 0.84));
        };
        gambar.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Foto tidak dapat dibaca.'));
        };
        gambar.src = url;
    });
}

// Inisialisasi tampilan dan data lokasi.
terapkanTampilan();
renderFormTampilan();
document.getElementById('admin-location').value = alamatUMKM;
document.getElementById('year').textContent = new Date().getFullYear();
perbaruiPeta();
renderKategoriMenu();
tampilkanProdukTerpilih();
renderAdminList();

// Filter katalog.
document.getElementById('search-input').addEventListener('input', tampilkanProdukTerpilih);
document.getElementById('category-menu').addEventListener('click', event => {
    const tombol = event.target.closest('.category-link');
    if (!tombol) return;
    kategoriAktif = tombol.dataset.category;
    renderKategoriMenu();
    tampilkanProdukTerpilih();
});

gridProduk.addEventListener('click', event => {
    const tombol = event.target.closest('.product-image-button');
    if (!tombol) return;
    const foto = tombol.querySelector('img');
    if (!foto || !foto.src) return;
    fullProductImage.src = foto.src;
    fullProductImage.alt = foto.alt;
    imageModal.classList.add('is-open');
});
document.getElementById('image-modal-close').addEventListener('click', tutupFoto);
imageModal.addEventListener('click', event => {
    if (event.target === imageModal) tutupFoto();
});

// Login dan modal admin.
document.getElementById('btn-login-trigger').addEventListener('click', () => {
    document.getElementById('login-modal').style.display = 'flex';
});
document.querySelectorAll('[data-close]').forEach(tombol => {
    tombol.addEventListener('click', () => {
        document.getElementById(tombol.dataset.close).style.display = 'none';
    });
});
window.addEventListener('click', event => {
    if (event.target.classList.contains('modal')) event.target.style.display = 'none';
});
document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    tutupFoto();
    document.querySelectorAll('.modal').forEach(modal => { modal.style.display = 'none'; });
    if (document.getElementById('admin-modal').style.display === 'block') tutupDashboardAdmin();
    document.getElementById('account-modal').style.display = 'none';
});
document.getElementById('login-form').addEventListener('submit', event => {
    event.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    if (user === kredensialAdmin.username && pass === kredensialAdmin.password) {
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('login-form').reset();
        document.getElementById('admin-preview-bar').hidden = false;
        document.getElementById('btn-edit-menu').hidden = false;
        document.getElementById('btn-add-category').hidden = false;
        document.getElementById('customer-site').hidden = false;
        document.getElementById('admin-modal').style.display = 'none';
        window.scrollTo(0, 0);
        tampilkanToast('Selamat datang, Admin. Website tampil dalam mode pratinjau.');
    } else {
        tampilkanToast('Username atau password salah.', 'error');
    }
});
document.getElementById('credentials-form').addEventListener('submit', event => {
    event.preventDefault();
    const passwordSaatIni = document.getElementById('current-admin-password').value;
    const usernameBaru = document.getElementById('new-admin-username').value.trim();
    const passwordBaru = document.getElementById('new-admin-password').value;
    const konfirmasiPassword = document.getElementById('confirm-admin-password').value;

    if (passwordSaatIni !== kredensialAdmin.password) {
        tampilkanToast('Password saat ini tidak sesuai.', 'error');
        return;
    }
    if (passwordBaru.length < 5) {
        tampilkanToast('Password baru harus minimal 5 karakter.', 'error');
        return;
    }
    if (passwordBaru !== konfirmasiPassword) {
        tampilkanToast('Konfirmasi password baru tidak cocok.', 'error');
        return;
    }

    const kredensialBaru = { username: usernameBaru, password: passwordBaru };
    try {
        localStorage.setItem(KUNCI_KREDENSIAL, JSON.stringify(kredensialBaru));
        kredensialAdmin = kredensialBaru;
        event.currentTarget.reset();
        tampilkanToast('Username dan password berhasil diperbarui di browser ini.');
    } catch {
        tampilkanToast('Akun tidak dapat disimpan di browser ini.', 'error');
    }
});
document.getElementById('btn-exit-admin').addEventListener('click', tutupDashboardAdmin);
document.getElementById('btn-add-category').addEventListener('click', () => {
    document.getElementById('admin-modal').style.display = 'block';
            batalEditProduk();
        document.getElementById('prod-name').focus();
});
document.getElementById('add-category-form').addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('new-category-name');
    const nama = input.value.trim();
    if (!nama) return;
    if ([...menuKustom, ...daftarProduk.map(produk => produk.category)].some(item => String(item || '').toLocaleLowerCase('id') === nama.toLocaleLowerCase('id'))) {
        tampilkanToast('Menu tersebut sudah tersedia.', 'error');
        return;
    }
    const sebelumnya = menuKustom;
    menuKustom = [...menuKustom, nama];
    try {
        localStorage.setItem(KUNCI_MENU_KUSTOM, JSON.stringify(menuKustom));
        input.value = '';
        renderKategoriMenu();
        tampilkanToast('Menu UMKM berhasil ditambahkan.');
    } catch {
        menuKustom = sebelumnya;
        tampilkanToast('Menu tidak dapat disimpan di browser ini.', 'error');
    }
});
document.getElementById('custom-category-list').addEventListener('click', event => {
    const tombol = event.target.closest('[data-remove-category]');
    if (!tombol) return;
    menuKustom = menuKustom.filter(nama => nama !== tombol.dataset.removeCategory);
    try {
        localStorage.setItem(KUNCI_MENU_KUSTOM, JSON.stringify(menuKustom));
        renderKategoriMenu();
        tampilkanToast('Menu berhasil dihapus.');
    } catch {
        tampilkanToast('Menu tidak dapat diperbarui.', 'error');
    }
});
document.getElementById('btn-open-account-settings').addEventListener('click', () => {
    document.getElementById('account-modal').style.display = 'block';
});
document.getElementById('btn-exit-account').addEventListener('click', () => {
    document.getElementById('account-modal').style.display = 'none';
});
document.getElementById('btn-exit-preview').addEventListener('click', keluarModeAdmin);
document.getElementById('btn-edit-menu').addEventListener('click', ubahModeSuntingMenu);
document.querySelector('.main-nav').addEventListener('keydown', event => {
    if (menuSedangDisunting && event.key === 'Enter') event.preventDefault();
});
document.getElementById('btn-save-settings').addEventListener('click', simpanPengaturan);
document.getElementById('btn-save-site-content').addEventListener('click', () => simpanTampilanWebsite());
document.getElementById('btn-reset-site-content').addEventListener('click', () => {
    if (window.confirm('Kembalikan semua teks dan warna ke tampilan awal?')) simpanTampilanWebsite(true);
});

// Tambah, edit, dan hapus produk.
tombolBatalEdit.addEventListener('click', batalEditProduk);
listProdukAdmin.addEventListener('click', event => {
    const tombol = event.target.closest('button[data-action]');
    if (!tombol) return;
    const produk = daftarProduk.find(item => String(item.id) === tombol.dataset.id);
    if (!produk) return;

    if (tombol.dataset.action === 'delete') {
        if (!window.confirm(`Hapus produk “${produk.name || 'tanpa nama'}”?`)) return;
        const sebelumnya = daftarProduk;
        daftarProduk = daftarProduk.filter(item => String(item.id) !== tombol.dataset.id);
        if (simpanProduk()) tampilkanToast('Produk berhasil dihapus.');
        else daftarProduk = sebelumnya;
        return;
    }

    idProdukDiedit = produk.id;
    document.getElementById('prod-name').value = produk.name || '';
    document.getElementById('prod-category').value = produk.category || '';
    document.getElementById('prod-price').value = produk.price || '';
    document.getElementById('prod-wa').value = produk.phone || nomorWA;
    document.getElementById('prod-desc').value = produk.desc || '';
    inputFoto.value = '';
    bersihkanPratinjauFoto();
    if (produk.img) {
        if (produk.mediaType === 'video' || String(produk.img).startsWith('data:video/')) {
            pratinjauVideo.src = produk.img;
            pratinjauVideo.hidden = false;
        } else {
            pratinjauFoto.src = produk.img;
            pratinjauFoto.hidden = false;
        }
    }
    tombolSubmitProduk.textContent = 'Simpan perubahan';
    document.getElementById('product-form-title').textContent = 'Edit produk';
    tombolBatalEdit.hidden = false;
    document.querySelector('.admin-box').scrollTo({
        top: document.getElementById('admin-form').offsetTop,
        behavior: 'smooth'
    });
});

inputFoto.addEventListener('change', () => {
    if (urlPratinjau) URL.revokeObjectURL(urlPratinjau);
    urlPratinjau = null;
    pratinjauFoto.hidden = true;
    pratinjauVideo.pause();
    pratinjauVideo.hidden = true;
    const file = inputFoto.files[0];
    if (!file) return;
    const ekstensi = file.name.split('.').pop().toLocaleLowerCase('id');
    const adalahVideo = file.type.startsWith('video/');
    const adalahJpeg = ['jpg', 'jpeg'].includes(ekstensi);
    const adalahFoto = file.type.startsWith('image/') || adalahJpeg;
    const ukuranMaksimum = (adalahVideo ? 2 : 6) * 1024 * 1024;
    if ((!adalahFoto && !adalahVideo) || file.size > ukuranMaksimum) {
        inputFoto.value = '';
        tampilkanToast(adalahVideo ? 'Ukuran video maksimal 2 MB.' : 'Pilih foto JPG/JPEG atau format gambar lain dengan ukuran maksimal 6 MB.', 'error');
        return;
    }
    urlPratinjau = URL.createObjectURL(file);
    if (adalahVideo) {
        pratinjauVideo.src = urlPratinjau;
        pratinjauVideo.hidden = false;
    } else {
        pratinjauFoto.src = urlPratinjau;
        pratinjauFoto.hidden = false;
    }
});

document.getElementById('admin-form').addEventListener('submit', async event => {
    event.preventDefault();
    const file = inputFoto.files[0];
    const produkLama = idProdukDiedit === null
        ? null
        : daftarProduk.find(produk => String(produk.id) === String(idProdukDiedit));
    if (!file && !produkLama) {
        tampilkanToast('Pilih foto produk terlebih dahulu.', 'error');
        return;
    }

    tombolSubmitProduk.disabled = true;
    try {
        const produkBaru = {
            id: produkLama ? produkLama.id : Date.now(),
            name: document.getElementById('prod-name').value.trim(),
            category: document.getElementById('prod-category').value.trim(),
            price: parseInt(document.getElementById('prod-price').value, 10),
            phone: document.getElementById('prod-wa').value.trim().replace(/\D/g, ''),
                    img: file ? (file.type.startsWith('video/') ? await simpanVideo(file) : await optimalkanFoto(file)) : produkLama.img,
        mediaType: file ? (file.type.startsWith('video/') ? 'video' : 'image') : (produkLama.mediaType || 'image'),
        desc: document.getElementById('prod-desc').value.trim()
        };
        const sebelumnya = [...daftarProduk];
        if (produkLama) {
            daftarProduk = daftarProduk.map(item => String(item.id) === String(produkLama.id) ? produkBaru : item);
        } else {
            daftarProduk.unshift(produkBaru);
        }

        if (simpanProduk()) {
            batalEditProduk();
            tampilkanToast(produkLama ? 'Perubahan produk berhasil disimpan.' : 'Produk berhasil ditambahkan.');
        } else {
            daftarProduk = sebelumnya;
            renderKategoriMenu();
            tampilkanProdukTerpilih();
            renderAdminList();
        }
    } catch {
        tampilkanToast('Foto gagal diproses. Coba pilih gambar lain.', 'error');
    } finally {
        tombolSubmitProduk.disabled = false;
    }
});
