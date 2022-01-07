CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    desc TEXT,
    deadline INTEGER,
    frequency VARCHAR(10),
    done INTEGER,
    repeat BOOLEAN    
);