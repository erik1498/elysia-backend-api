/**
 * Mengonversi input ke format MySQL/MariaDB Datetime (YYYY-MM-DD HH:MM:SS)
 * Menggunakan waktu lokal (Local Time) bukan UTC.
 */
export const toMysqlDatetime = (dateInput: any): string => {
    if (!dateInput) return dateInput;
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput;

    // Trik untuk mendapatkan Local Time tanpa library eksternal:
    // Kita ambil komponen tahun, bulan, tgl, jam, menit, detik secara manual
    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Konversi hanya pada key yang ditentukan (Targeted Conversion)
 * @param data Objek data dari request
 * @param dateKeys Array berisi nama field yang bertipe tanggal (e.g., ['tanggal_perolehan', 'tgl_lahir'])
 */
export const prepareDatabaseData = (data: any, dateKeys: string[] = []) => {
    if (!data || typeof data !== 'object' || dateKeys.length === 0) return data;
    
    const cleanedData = { ...data };

    for (const key of dateKeys) {
        // Hanya proses jika key tersebut ada di dalam data dan memiliki nilai
        if (cleanedData[key]) {
            cleanedData[key] = toMysqlDatetime(cleanedData[key]);
        }
    }
    
    return cleanedData;
};