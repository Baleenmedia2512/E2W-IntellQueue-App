-- 07-06-2025 - Logesh - test_e2w
ALTER TABLE queue_table
ADD FcmToken VARCHAR(255) DEFAULT NULL;

-- 02-06-2025 - Logesh - test_e2w
TRUNCATE TABLE queue_history_table;
TRUNCATE TABLE queue_table;

-- 31-05-2025 - Logesh - test_e2w
CREATE TABLE fcm_token_table (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    EntryDateTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    Token VARCHAR(512) NOT NULL UNIQUE
);