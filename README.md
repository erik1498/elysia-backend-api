🏗️ 1. Persiapan Awal
---------------------

Pastikan runtime **Bun**, **Redis**, dan **MySQL** sudah terinstall dan berjalan di mesin Anda.

### Instalasi Dependencies

```bash
bun install
```

### Konfigurasi Environment

Buat file `.env` di root direktori dan sesuaikan kredensial berikut:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=yourpassword
DB_NAME=yourdatabasename

# Application Environment
NODE_ENV=development # Ubah ke 'production' saat deploy
PORT=3000

# Cache Configuration
REDIS_URL=redis://localhost:6379

# Security (Gunakan string random yang panjang)  
JWT_ACCESS_TOKEN_SECRET=a-string-secret-at-least-256-bits-long  
JWT_REFRESH_TOKEN_SECRET=a-string-secret-at-least-256-bits-long
```

🗄️ 2. Manajemen Database (Drizzle ORM)
---------------------------------------

Aplikasi menggunakan Drizzle ORM untuk memastikan skema database selalu sinkron dengan kode sumber.

### Langkah A: Generate Migrasi

Membaca file model.ts dan menghasilkan file SQL di folder /drizzle.

```bash
bun db:generate
```

### Langkah B: Jalankan Migrasi

Mengeksekusi file migrasi untuk memperbarui struktur tabel di MySQL.

```bash
bun db:migrate
```

### Langkah C: Inisialisasi Data Otomatis (Seed)

Gunakan perintah berikut untuk mengisi data Roles dan Admin User secara otomatis:

```bash
bun db:seed
```

3. Menjalankan Aplikasi
--------------------------

Aplikasi memiliki dua mode operasi utama:

### Mode Pengembangan (Development)

Dilengkapi dengan fitur **Hot Reload**. Server otomatis restart setiap kali ada perubahan kode.

```bash
bun dev
```

### Mode Produksi (Production)

Dijalankan untuk performa maksimal. Pastikan NODE\_ENV=production sudah disetel di .env.

```bash
bun start
```

Ringkasan Perintah (Cheat Sheet)
-----------------------------------
| Kategori | Tugas                     | Perintah        |
|----------|---------------------------|-----------------|
| Setup    | Install Dependencies      | bun install     |
| Database | Buat File Migrasi         | bun db:generate |
| Database | Eksekusi ke Server        | bun db:migrate  |
| Database | Isi Data Admin & Roles    | bun db:seed     |
| Runtime  | Mode Development          | bun dev         |
| Runtime  | Mode Produksi             | bun start       |

Troubleshooting (Prinsip Fail-Fast)
--------------------------------------

Aplikasi ini menerapkan prinsip **Fail-Fast**. Jika aplikasi langsung berhenti setelah dijalankan, periksa hal berikut:

1.  **MySQL Status**: Pastikan MySQL aktif di port 3306 dan database sudah dibuat secara manual sebelum menjalankan migrasi.
    
2.  **Redis Readiness**: Tanpa Redis, sistem _Rate Limiting_, _Blacklist Token_, _Idempotency_Key_ tidak bisa diinisialisasi, sehingga aplikasi akan mematikan diri secara otomatis.
    
3.  **Migration Check**: Jika muncul error Relation "table\_name" does not exist, jalankan kembali bun db:migrate.
    
4.  **JWT Secret**: Jika login gagal terus-menerus, pastikan JWT\_SECRET di .env sudah terisi dan cukup panjang.



Saran Tambahan
-------------------------------------

Jika Anda ingin melihat data yang baru saja dimasukkan oleh script seed tanpa menggunakan terminal, Anda bisa menjalankan `bun db:studio`. Ini akan membuka dashboard visual di browser Anda untuk mengelola isi tabel.