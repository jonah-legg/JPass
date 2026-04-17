CREATE DATABASE IF NOT EXISTS jpass_db;

\c jpass_db

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    auth_hash VARCHAR(128) NOT NULL,
    auth_salt VARCHAR(64) NOT NULL,
    encryption_salt VARCHAR(64) NOT NULL,
    encrypted_vault BYTEA NOT NULL,
    vault_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP NULL DEFAULT NULL
);

CREATE INDEX idx_users_email ON users(email);