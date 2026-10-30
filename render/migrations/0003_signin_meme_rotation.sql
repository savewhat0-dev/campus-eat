CREATE TABLE signin_meme_sequences (
 email TEXT PRIMARY KEY,
 next_index INTEGER NOT NULL DEFAULT 0,
 previous_key TEXT,
 pending_key TEXT,
 pending_state TEXT,
 pending_started BIGINT
);
