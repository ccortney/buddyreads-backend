CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
        CHECK (position('@' IN email) > 1),
    profile_picture TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE buddyreads (
    id SERIAL PRIMARY KEY,
    book_id TEXT NOT  NULL, 
    created_by INTEGER 
        REFERENCES users ON DELETE CASCADE,
    buddy INTEGER 
        REFERENCES users ON DELETE CASCADE,
    status TEXT NOT NULL
);

CREATE TABLE buddyreadstats (
    buddyread_id INTEGER
        REFERENCES buddyreads ON DELETE CASCADE, 
    user_id INTEGER
        REFERENCES users ON DELETE CASCADE, 
    progress INTEGER DEFAULT 0,
    rating INTEGER DEFAULT NULL,
    PRIMARY KEY (buddyread_id, user_id)
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY, 
    buddyread_id INTEGER
        REFERENCES buddyreads ON DELETE CASCADE, 
    user_id INTEGER
        REFERENCES users ON DELETE CASCADE,
    page INTEGER NOT NULL,
    message TEXT NOT NULL,
    viewed BOOLEAN DEFAULT FALSE,
    liked BOOLEAN DEFAULT FALSE
);