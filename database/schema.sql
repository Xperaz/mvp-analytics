CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT,
    created_at TEXT,
    plan_type TEXT
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    event_type TEXT,
    event_data TEXT,
    timestamp TEXT,
    session_id TEXT
);

CREATE TABLE reports (
    id INTEGER PRIMARY KEY,
    name TEXT,
    query_sql TEXT,
    created_by INTEGER,
    created_at TEXT,
    is_public INTEGER DEFAULT 0
);

INSERT INTO users VALUES 
(1, 'admin@company.com', '2024-01-01', 'enterprise'),
(2, 'user@company.com', '2024-01-15', 'basic');

INSERT INTO events VALUES 
(1, 1, 'page_view', '{"page": "/dashboard"}', '2024-01-01 10:00:00', 'sess_123'),
(2, 2, 'click', '{"button": "signup"}', '2024-01-01 11:00:00', 'sess_456');

INSERT INTO reports VALUES 
(1, 'Daily Active Users', 'SELECT COUNT(DISTINCT user_id) FROM events WHERE DATE(timestamp) = DATE("now")', 1, '2024-01-01', 1);
