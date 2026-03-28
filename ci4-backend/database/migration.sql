-- ============================================================
--  AdminPanel – MySQL Migration
--  Run this SQL in your MySQL database (e.g. via phpMyAdmin,
--  MySQL Workbench, or the mysql CLI).
-- ============================================================

CREATE DATABASE IF NOT EXISTS adminpanel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE adminpanel;

-- ── 1. Auth Users ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auth_user (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    email       VARCHAR(191)    NOT NULL,
    first_name  VARCHAR(100)    NOT NULL,
    last_name   VARCHAR(100)    NOT NULL,
    password    VARCHAR(255)    NOT NULL,
    created_at  DATETIME        NULL,
    updated_at  DATETIME        NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_auth_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. Teachers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
    id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id          INT UNSIGNED    NOT NULL,
    university_name  VARCHAR(200)    NOT NULL,
    gender           ENUM('male','female','other') NOT NULL DEFAULT 'male',
    year_joined      YEAR            NOT NULL,
    created_at       DATETIME        NULL,
    updated_at       DATETIME        NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_teachers_user_id (user_id),          -- enforces 1-to-1
    CONSTRAINT fk_teachers_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 3. Auth Tokens (for token-based auth) ────────────────────
CREATE TABLE IF NOT EXISTS auth_tokens (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED    NOT NULL,
    token       VARCHAR(64)     NOT NULL,
    expires_at  DATETIME        NOT NULL,
    created_at  DATETIME        NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_auth_tokens_token (token),
    CONSTRAINT fk_tokens_user
        FOREIGN KEY (user_id) REFERENCES auth_user (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
