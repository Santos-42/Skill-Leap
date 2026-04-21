CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roadmaps (
    id TEXT PRIMARY KEY,
    role_name TEXT UNIQUE NOT NULL,
    roadmap_data TEXT NOT NULL 
);

CREATE TABLE user_roadmaps (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    roadmap_id TEXT NOT NULL,
    roadmap_data TEXT NOT NULL,
    current_module_id INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id)
);

CREATE TABLE chatbot_threads (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    messages TEXT NOT NULL, 
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE evaluations (
    id TEXT PRIMARY KEY,
    roadmap_id TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    user_answer TEXT, 
    ai_score INTEGER, 
    ai_decision TEXT, 
    ai_feedback TEXT, 
    transcript_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roadmap_id) REFERENCES user_roadmaps(id) ON DELETE CASCADE
);