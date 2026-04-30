# SkillLeap: Generative Outcome Engine

🚀 [Coba Aplikasi SkillLeap Secara Langsung di Sini](https://skill-leap.pages.dev)

SkillLeap adalah platform akselerasi karir teknologi berbasis AI yang dirancang untuk memutus siklus _Tutorial Hell_ dan praktik kecurangan dalam pembelajaran digital. Platform ini mengandalkan _Generative Outcome Engine_ untuk memvalidasi kompetensi secara otentik, memandu pengguna dari pembelajaran teori hingga simulasi wawancara teknis.

Proyek ini dikembangkan oleh **Tim Apa Aja Jadi** untuk kompetisi IO Festival.

## 👥 Tim Pengembang

- **Rio Santoso** (riosantoso6090@gmail.com)
- **Muhammad Raffi Suryadi** (m.raffi.suryadi@gmail.com)
- **Vincent Benedict Alimin** (vincba098@gmail.com)

---

## 🎯 Latar Belakang & Masalah

- **Krisis Kesiapan Kerja:** Terdapat kesenjangan (skill gap) jutaan talenta digital di Indonesia yang kesulitan memenuhi standar industri.
- **Tutorial Hell:** Mayoritas platform pendidikan hanya menyajikan video pasif yang membuat pengguna merasa bisa, namun gagal saat wawancara teknis.
- **Rentan Kecurangan:** Penggunaan bank soal statis memungkinkan pengguna mencari kunci jawaban di internet tanpa pemahaman logika dasar.

## 💡 Solusi Kami

SkillLeap membuang paradigma bank soal mati. Setiap rintangan soal, kuis, dan studi kasus dirakit secara dinamis (_real-time_) oleh AI. Pengguna dipaksa untuk benar-benar memahami materi melalui sistem penalti waktu (_cooldown_) dan diuji melalui simulasi teknis layaknya di perusahaan nyata.

---

## 🚀 Fitur Utama

1. **Generative Roadmap 4 Minggu**
   Jalur pembelajaran terstruktur yang disesuaikan dengan profesi (seperti Data Analyst, Software Engineer). Tidak ada lompatan kurikulum; setiap materi dikunci secara sekuensial.
2. **Adaptive Question & Sistem Cooldown**
   Pengguna wajib menjawab soal rintangan buatan AI untuk berpindah materi. Jawaban salah akan memicu penalti _cooldown_ selama 1 menit untuk memaksa evaluasi ulang materi (mencegah tebak-tebakan).
3. **Automated Evaluation Engine**
   Pengguna wajib menyelesaikan keseluruhan roadmap yang telah dibuat untuk mendapatkan penilaian berbasis _Mini Case Study_ yang mereplikasi masalah industri nyata. AI memberikan skor (0 hingga 100) dan umpan balik teknis mendetail.
4. **AI Interview Simulator**
   Fasilitas latihan simulasi wawancara teknis interaktif bersama agen AI. Dilengkapi fitur unduhan transkrip sebagai cermin evaluasi mandiri (_self-reflection_) sebelum menghadapi HRD nyata.
5. **Live Assistance & Dashboard**
   Asisten _chatbot_ siaga di seluruh halaman untuk diskusi teknis dan dasbor utama untuk memantau kemajuan serta skor evaluasi pengguna.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

Sistem ini dibangun dengan arsitektur _Full-Stack Serverless Edge_ untuk latensi minimal dan performa maksimal:

- **Kerangka Kerja (Framework):** SvelteKit (Svelte 5)
- **Bahasa Pemrograman:** Svelte + TypeScript
- **Styling UI:** Tailwind CSS v4, Lucide Svelte, Svelte Simple Icons
- **Pangkalan Data (Database):** Cloudflare D1 (Serverless SQLite)
- **Infrastruktur / Peladen:** Cloudflare Pages & Cloudflare Edge Workers
- **Integrasi AI:**
  - Model Evaluasi: API DeepSeek
  - Model Chatbot: Google Gemini API (`@google/genai`)
  - Model Wawancara Suara: Gemini Live API (WebSocket)

---

## ⚙️ Panduan Instalasi Lokal

Ikuti langkah langkah berikut untuk menjalankan proyek ini di mesin lokal Anda:

### 1. Kloning Repositori

```bash
git clone <URL_REPOSITORI>
cd skill-leap
```

### 2. Instalasi Dependensi

```bash
npm install
```

### 3. Konfigurasi Lingkungan (Environment Variables)

Buat fail .dev.vars di direktori utama dan isi dengan kunci API Anda:

```bash
GEMINI_API_KEY="kunci_api_gemini_anda"
DEEPSEEK_API_KEY="kunci_api_deepseek_anda"
```

### 4. Persiapan Pangkalan Data (Cloudflare D1)

Jalankan skrip SQL untuk membangun tabel lokal dan memasukkan data tiruan (dummy):

```bash
npx wrangler d1 execute DB --local --file=Database/database.sql
npx wrangler d1 execute DB --local --file=Database/data.sql
```

### 5. Jalankan Peladen Pengembangan

```bash
npm run dev
```
