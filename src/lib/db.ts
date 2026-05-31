/**
 * SQLite database singleton using better-sqlite3.
 *
 * The database file is created automatically at `social-portal.db` in the
 * project root if it does not exist. All tables are created on first run.
 *
 * This module is server-side only — never import it in client components.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// ---------------------------------------------------------------------------
// Database path
// ---------------------------------------------------------------------------

const DB_PATH = path.join(process.cwd(), 'social-portal.db');

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  _db.pragma('journal_mode = WAL');
  // Enforce foreign key constraints
  _db.pragma('foreign_keys = ON');

  initSchema(_db);

  return _db;
}

// ---------------------------------------------------------------------------
// Schema initialisation
// ---------------------------------------------------------------------------

function initSchema(db: Database.Database): void {
  db.exec(`
    -- -------------------------------------------------------------------------
    -- admin_users
    -- -------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS admin_users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT    NOT NULL,
      role          TEXT    NOT NULL DEFAULT 'staff'
                            CHECK (role IN ('super_admin', 'staff')),
      created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at    TEXT
    );

    -- -------------------------------------------------------------------------
    -- social_connections
    -- -------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS social_connections (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      platform          TEXT    NOT NULL UNIQUE
                                CHECK (platform IN ('instagram','facebook','linkedin','twitter','youtube')),
      access_token      TEXT    NOT NULL,   -- AES-256-GCM encrypted
      refresh_token     TEXT,               -- AES-256-GCM encrypted
      token_expires_at  TEXT,               -- ISO-8601
      account_id        TEXT    NOT NULL,
      account_name      TEXT    NOT NULL,
      page_id           TEXT,
      connected_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      connected_by      INTEGER NOT NULL REFERENCES admin_users(id),
      is_active         INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      last_refreshed_at TEXT
    );

    -- -------------------------------------------------------------------------
    -- media_library
    -- -------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS media_library (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name           TEXT    NOT NULL,
      original_file_name  TEXT    NOT NULL,
      drive_file_id       TEXT,             -- Google Drive file ID
      public_url          TEXT    NOT NULL,
      mime_type           TEXT    NOT NULL,
      media_type          TEXT    NOT NULL
                                  CHECK (media_type IN ('image','video','document')),
      file_size           INTEGER NOT NULL,
      width               INTEGER,
      height              INTEGER,
      duration            REAL,
      event_name          TEXT    NOT NULL DEFAULT '',
      description         TEXT    NOT NULL DEFAULT '',
      event_date          TEXT,
      location            TEXT,
      category            TEXT    NOT NULL DEFAULT 'Other',
      beneficiaries_count INTEGER,
      volunteer_count     INTEGER,
      tags                TEXT    NOT NULL DEFAULT '[]', -- JSON array
      uploaded_by         INTEGER NOT NULL REFERENCES admin_users(id),
      uploaded_at         TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at          TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_media_category   ON media_library(category);
    CREATE INDEX IF NOT EXISTS idx_media_uploaded_at ON media_library(uploaded_at DESC);

    -- -------------------------------------------------------------------------
    -- knowledge_base
    -- -------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name          TEXT    NOT NULL,
      original_file_name TEXT    NOT NULL,
      drive_file_id      TEXT,
      public_url         TEXT    NOT NULL,
      mime_type          TEXT    NOT NULL,
      file_size          INTEGER NOT NULL,
      doc_type           TEXT    NOT NULL DEFAULT 'other',
      extracted_text     TEXT,
      description        TEXT,
      uploaded_by        INTEGER NOT NULL REFERENCES admin_users(id),
      uploaded_at        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    -- -------------------------------------------------------------------------
    -- posts
    -- -------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS posts (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      title                TEXT    NOT NULL,
      event_description    TEXT    NOT NULL DEFAULT '',
      media_ids            TEXT    NOT NULL DEFAULT '[]',  -- JSON array of media_library ids
      poster_drive_file_id TEXT,
      poster_public_url    TEXT,
      generated_content    TEXT,   -- JSON
      platforms            TEXT    NOT NULL DEFAULT '[]',  -- JSON array of platform names
      status               TEXT    NOT NULL DEFAULT 'draft'
                                   CHECK (status IN ('draft','scheduled','publishing','published','partially_published','failed')),
      scheduled_at         TEXT,   -- ISO-8601
      published_at         TEXT,   -- ISO-8601
      publish_results      TEXT,   -- JSON
      created_by           INTEGER NOT NULL REFERENCES admin_users(id),
      created_at           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at           TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_posts_status     ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_scheduled  ON posts(scheduled_at) WHERE status = 'scheduled';

    -- -------------------------------------------------------------------------
    -- analytics_snapshots
    -- -------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS analytics_snapshots (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      platform         TEXT    NOT NULL,
      post_id          INTEGER NOT NULL REFERENCES posts(id),
      platform_post_id TEXT    NOT NULL,
      reach            INTEGER,
      impressions      INTEGER,
      engagement       INTEGER,
      likes            INTEGER,
      comments         INTEGER,
      shares           INTEGER,
      saves            INTEGER,
      clicks           INTEGER,
      fetched_at       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_post_id  ON analytics_snapshots(post_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_platform ON analytics_snapshots(platform);

    -- -------------------------------------------------------------------------
    -- impact_metrics
    -- -------------------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS impact_metrics (
      id                     INTEGER PRIMARY KEY AUTOINCREMENT,
      period                 TEXT    NOT NULL UNIQUE,  -- YYYY-MM
      events_count           INTEGER NOT NULL DEFAULT 0,
      posts_published        INTEGER NOT NULL DEFAULT 0,
      total_reach            INTEGER NOT NULL DEFAULT 0,
      volunteers_participated INTEGER NOT NULL DEFAULT 0,
      campaigns_conducted    INTEGER NOT NULL DEFAULT 0,
      fundraising_activities INTEGER NOT NULL DEFAULT 0,
      beneficiaries_reached  INTEGER NOT NULL DEFAULT 0,
      recorded_at            TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      recorded_by            INTEGER NOT NULL REFERENCES admin_users(id)
    );
  `);
}

// ---------------------------------------------------------------------------
// Convenience: ensure DB file path is accessible (useful for diagnostics)
// ---------------------------------------------------------------------------

export function getDbPath(): string {
  return DB_PATH;
}

export function dbExists(): boolean {
  return fs.existsSync(DB_PATH);
}
