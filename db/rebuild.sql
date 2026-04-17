DROP DATABASE IF EXISTS jpass_db;
CREATE DATABASE jpass_db;

\c jpass_db

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(64) NOT NULL,
    server_salt VARCHAR(32) NOT NULL,
    client_salt VARCHAR(32) NOT NULL,
    encrypted_vault BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE INDEX idx_users_email ON users(email);