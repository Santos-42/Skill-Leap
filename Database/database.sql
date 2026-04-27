-- 1. Tabel Pengguna Inti
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Induk Roadmap
CREATE TABLE roadmaps (
    id TEXT PRIMARY KEY,
    role_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Modul
CREATE TABLE modules (
    id TEXT PRIMARY KEY,
    roadmap_id TEXT NOT NULL,
    module_name TEXT NOT NULL,
    module_order INTEGER NOT NULL,
    FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE
);

-- 4. Tabel Materi
CREATE TABLE materials (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    content_text TEXT,
    video_url TEXT,
    material_order INTEGER NOT NULL,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- 5. Tabel Pendaftaran Pengguna ke Roadmap
CREATE TABLE user_roadmaps (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    roadmap_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE
);

-- 6. Tabel Pelacakan Progres
CREATE TABLE user_module_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at DATETIME,
    current_material_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- 7. Tabel Utilitas Sampingan
CREATE TABLE chatbot_threads (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    messages TEXT NOT NULL, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Tabel Penilaian Evaluasi
CREATE TABLE evaluations (
    id TEXT PRIMARY KEY,
    user_roadmap_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    user_answer TEXT, 
    ai_score INTEGER, 
    ai_decision TEXT, 
    ai_feedback TEXT, 
    transcript_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_roadmap_id) REFERENCES user_roadmaps(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);