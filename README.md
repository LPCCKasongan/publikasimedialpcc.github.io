# Backend Warta Jemaat — LP Churh

Backend + database untuk situs Warta Jemaat yang sudah Anda buat. **Tampilan (HTML/CSS) situs sama sekali tidak diubah** — file `public/index.html` adalah file yang Anda unggah, hanya bagian `<script>` di paling bawah yang diganti agar mengambil dan menyimpan data lewat API, bukan dari array sementara di browser.

## Apa yang berubah dan apa yang tidak

| | |
|---|---|
| **Tidak berubah** | Semua HTML, CSS, warna, font, layout, teks, ID/class elemen |
| **Berubah** | Bagian `<script>` — sekarang memanggil `/api/...` ke server, bukan menyimpan data di variabel JavaScript saja |
| **Baru** | `server.js` (server), database berbasis file JSON ("data/warta.json") untuk menyimpan jadwal secara permanen — tanpa perlu compile apa pun, jadi langsung jalan di Windows/Mac/Linux manapun |

Sekarang saat admin menambah/mengubah/menghapus jadwal ibadah, datanya **tersimpan permanen di database** — tidak hilang saat halaman dimuat ulang, dan sama untuk semua pengunjung dari perangkat manapun (karena semua orang mengambil data dari server yang sama).

## Struktur folder

```
lp-churh-backend/
├── server.js          ← server Express + API + database
├── package.json
├── .env.example        ← contoh konfigurasi (salin jadi .env)
├── data/
│   └── warta.json       ← database (dibuat otomatis saat server pertama kali jalan)
└── public/
    └── index.html        ← situs Anda (tampilan sama persis, hanya script yang tersambung API)
```

## Cara menjalankan di komputer Anda

Prasyarat: [Node.js](https://nodejs.org) versi 18 ke atas sudah terpasang.

1. Buka folder ini di terminal:
   ```
   cd lp-churh-backend
   ```
2. Pasang dependensi:
   ```
   npm install
   ```
3. Salin file konfigurasi lalu (opsional) ubah kode admin:
   ```
   cp .env.example .env
   ```
   Buka `.env`, ganti `ADMIN_CODE=gereja2026` dengan kode rahasia Anda sendiri.
4. Jalankan server:
   ```
   npm start
   ```
5. Buka browser ke **http://localhost:3000** — situs akan tampil persis seperti sebelumnya, tapi sekarang jadwal ibadah diambil dari database.

Tombol **⚙ Admin** di pojok kanan bawah tetap berfungsi sama seperti sebelumnya — login pakai kode admin dari `.env`, lalu tambah/ubah/hapus jadwal seperti biasa. Setiap perubahan langsung disimpan ke `data/warta.json`.

## Cara kerja singkat

- `GET /api/ibadah` — semua pengunjung situs mengambil daftar jadwal dari sini.
- `POST /api/ibadah`, `PUT /api/ibadah/:id`, `DELETE /api/ibadah/:id` — hanya bisa dipakai jika mengirim kode admin yang benar (dicek di server, bukan cuma di browser — jadi lebih aman dari sebelumnya).
- `GET/PUT /api/settings` — menyimpan teks tanggal besar di bagian atas situs.
- Semua data disimpan di file `data/warta.json` — satu file teks biasa yang bisa Anda cadangkan (backup) kapan saja dengan menyalinnya, atau bahkan dibuka/diedit langsung kalau perlu.

## Jika ingin situs ini online (bisa diakses publik)

Yang sudah dibuat ini adalah server yang berjalan di komputer Anda (`localhost`). Supaya bisa diakses jemaat dari internet, server perlu di-hosting. Beberapa pilihan yang cocok untuk backend Node.js seperti ini:

- **Railway** atau **Render** — tinggal hubungkan folder ini ke akun Anda, keduanya mendukung Node.js dan penyimpanan file dengan mudah.
- **VPS** (misalnya DigitalOcean, Niagahoster, dsb.) — jalankan `npm install && npm start` di server, lalu arahkan domain gereja ke situ.

Beri tahu saya jika Anda ingin saya bantu siapkan salah satu dari opsi ini.

## Catatan keamanan

Sistem admin di sini masih sederhana — satu kode admin yang sama untuk semua. Ini sudah lebih aman dari versi sebelumnya (kode dicek di server, bukan hanya di browser), tapi untuk situs yang benar-benar publik dan digunakan jangka panjang, sebaiknya ditingkatkan lagi (misalnya akun+kata sandi per pengurus, atau proteksi tambahan). Beri tahu saya kalau ingin fitur itu ditambahkan.
