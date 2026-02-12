🏗️ 1. Persiapan Awal
---------------------

Pastikan runtime **Bun** sudah terpasang. Bun digunakan sebagai engine utama karena kecepatannya dalam eksekusi skrip dan manajemen paket.

```bash
# Verifikasi instalasi bun  
bun -v
```

### Konfigurasi Environment

buat file .env sesuaikan kredensial berikut:

Cuplikan kode

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=yourpassword
DB_NAME=restful_api_db

NODE_ENV=development

REDIS_URL=redis://localhost:6379

JWT_ACCESS_TOKEN_SECRET=a-string-secret-at-least-256-bits-long
JWT_REFRESH_TOKEN_SECRET=a-string-secret-at-least-256-bits-long

PORT=3000
```

🗄️ 2. Manajemen Database (Drizzle ORM)
---------------------------------------

Drizzle ORM memungkinkan kita mengelola database secara **Type-safe**. Alur kerja migrasi mengikuti skema berikut:

### Langkah A: Generate Migrasi

Membaca file model.ts dan membandingkannya dengan database untuk menghasilkan file SQL baru.

```bash
bun db:generate
```

### Langkah B: Jalankan Migrasi

Mengeksekusi file SQL yang ada di folder /drizzle ke database fisik.

```bash
bun db:migrate
```

### Langkah C: Database GUI (Studio)

Melihat dan memanipulasi data secara visual melalui antarmuka web.

```bash
bun db:studio
```

🚀 3. Menjalankan Aplikasi
--------------------------

Aplikasi memiliki dua mode operasi utama:

### 🟢 Mode Pengembangan (Development)

Menggunakan fitur **Hot Reload**. Setiap perubahan pada file akan langsung memicu restart server secara instan.

```bash
bun dev
```

### 🔵 Mode Produksi (Production)

Dijalankan setelah aplikasi selesai dikembangkan dan siap melayani trafik publik. ubah `NODE_ENV=production` pada .env

```   
# Build (jika diperlukan) dan jalankan  
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

Aplikasi ini didesain dengan prinsip **Fail-Fast**. Jika aplikasi langsung berhenti setelah dijalankan, sistem sedang melindungi dirinya dari kegagalan data. Periksa indikator berikut:

1.  **MySQL Status**: Cek apakah port 3306 sudah terbuka dan database yang dituju sudah dibuat.
    
2.  **Redis Readiness**: Tanpa Redis, fitur keamanan (Blacklist & Rate Limit) tidak bisa berjalan, sehingga aplikasi akan mematikan dirinya sendiri.
    
3.  **Migration Check**: Jika muncul error Relation "table\_name" does not exist, artinya ada langkah bun db:migrate yang terlewat.