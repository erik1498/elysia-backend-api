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

### Langkah C: Inisialisasi Akun Administrator

Setelah tabel terbuat, Anda perlu memasukkan data master (Admin & Role). Anda bisa melakukannya melalui **Drizzle Studio** (Visual) atau SQL Client:

```sql
-- 1. Tambah User Admin (Password: admin123)  
INSERT INTO user_tab (uuid, nama, username, password) VALUES  ('5f522ed1-8a70-4c10-8ce4-b89c47b0a240', 'ADMINISTRATOR', 'admin', '$2b$10$Zi/A.A4IfmBVpoLSG0ORx.jFgofn4dXfUWyAY88aGAFsMVe77VYYO');  

-- 2. Tambah Master Roles  
INSERT INTO role_tab (uuid, nama) VALUES  ('c0f29810-dfe4-11f0-a259-145afc5d4423', 'super_admin'),  ('e6df4ca8-dff1-11f0-a259-145afc5d4423', 'accounting');

-- 3. Hubungkan User ke Role
INSERT INTO user_role_tab (uuid, user_uuid, role_uuid) VALUES   ('4cb0c890-05cc-11f1-8d2c-145afc5d4423', '5f522ed1-8a70-4c10-8ce4-b89c47b0a240', 'c0f29810-dfe4-11f0-a259-145afc5d4423'),  ('5c8b83e9-05cc-11f1-8d2c-145afc5d4423', '5f522ed1-8a70-4c10-8ce4-b89c47b0a240', 'e6df4ca8-dff1-11f0-a259-145afc5d4423');   `
```

🚀 3. Menjalankan Aplikasi
--------------------------

Aplikasi memiliki dua mode operasi utama:

### 🟢 Mode Pengembangan (Development)

Dilengkapi dengan fitur **Hot Reload**. Server otomatis restart setiap kali ada perubahan kode.

```bash
bun dev
```

### 🔵 Mode Produksi (Production)

Dijalankan untuk performa maksimal. Pastikan NODE\_ENV=production sudah disetel di .env.

```bash
# Jalankan aplikasi mode produksi
bun start
```

📋 Ringkasan Perintah (Cheat Sheet)
-----------------------------------
| Kategori | Tugas                | Perintah        |
|----------|----------------------|-----------------|
| Setup    | Install Dependencies | bun install     |
| Database | Buat File Migrasi    | bun db:generate |
| Database | Eksekusi ke Server   | bun db:migrate  |
| Runtime  | Mode Development     | bun dev         |
| Runtime  | Mode Produksi        | bun start       |

🚨 Troubleshooting (Prinsip Fail-Fast)
--------------------------------------

Aplikasi ini menerapkan prinsip **Fail-Fast**. Jika aplikasi langsung berhenti setelah dijalankan, periksa hal berikut:

1.  **MySQL Status**: Pastikan MySQL aktif di port 3306 dan database sudah dibuat secara manual sebelum menjalankan migrasi.
    
2.  **Redis Readiness**: Tanpa Redis, sistem _Rate Limiting_ dan _Blacklist Token_ tidak bisa diinisialisasi, sehingga aplikasi akan mematikan diri secara otomatis.
    
3.  **Migration Check**: Jika muncul error Relation "table\_name" does not exist, jalankan kembali bun db:migrate.
    
4.  **JWT Secret**: Jika login gagal terus-menerus, pastikan JWT\_SECRET di .env sudah terisi dan cukup panjang.