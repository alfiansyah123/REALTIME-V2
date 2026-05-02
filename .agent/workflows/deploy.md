---
description: Cara Deploy ke Hosting (CPanel/PHP)
---

Langkah-langkah untuk melakukan deploy aplikasi CPA Tracker ke hosting:

### 1. Build Aplikasi (Frontend)
Jalankan perintah berikut di terminal komputer Anda (di dalam folder project):
```bash
cd apps/dashboard
npm run build
```
Perintah ini akan menghasilkan folder bernama **`dist`**. Folder ini berisi semua file yang siap diupload.

### 2. Setup Database di Hosting
1. Buka **MySQL Database Wizard** di CPanel Anda.
2. Buat database baru (contoh: `cpa_dashboard`).
3. Buat user database dan password, lalu hubungkan ke database tersebut.
4. Buka **phpMyAdmin**, pilih database yang baru dibuat, lalu pilih menu **Import**.
5. Upload file `database.sql` yang ada di root project ini.

### 3. Konfigurasi API
Buka file **`dist/api/config.php`** (atau `public/api/config.php` sebelum di-build) dan sesuaikan dengan data database hosting Anda:
```php
$host = 'localhost';
$db   = 'nama_database_anda';
$user = 'username_database_anda';
$pass = 'password_database_anda';
```

### 4. Upload File ke Hosting
1. Masuk ke **File Manager** di CPanel.
2. Cari dan buka folder bernama **`report.cuanfbpro.shop`** (sesuai subdomain Anda).
3. Upload semua isi yang ada di dalam folder **`dist`** hasil build tadi ke dalam folder tersebut.
   - Pastikan file `.htaccess` juga ikut ter-upload.

### 5. Selesai
Buka domain Anda di browser. Dashboard seharusnya sudah bisa diakses dan terhubung ke database hosting.

---
**Catatan Penting**:
- Jika Anda menggunakan subfolder (misal: `domain.com/tracker`), pastikan Anda mengupdate `base` di `vite.config.js` sebelum melakukan build.
- Pastikan versi PHP di hosting minimal **7.4 atau 8.x**.
