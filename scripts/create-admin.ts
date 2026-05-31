#!/usr/bin/env tsx
/**
 * Admin User Bootstrap Script
 * ============================
 * Creates the first admin user in the SQLite database (social-portal.db).
 *
 * Usage:
 *   npm run create-admin
 *
 * The script reads credentials interactively from stdin so that passwords
 * are never stored in shell history or environment variables.
 *
 * The database file is created automatically if it does not exist.
 * The script is idempotent — running it with an existing email prints a
 * warning and exits without creating a duplicate.
 *
 * No Firebase or cloud credentials are required.
 */

import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';

// Load .env.local so NEXTAUTH_SECRET etc. are available if needed later
import { config } from 'dotenv';
config({ path: path.resolve(process.cwd(), '.env.local') });

// ---------------------------------------------------------------------------
// Database setup (mirrors src/lib/db.ts — kept self-contained for the script)
// ---------------------------------------------------------------------------

const DB_PATH = path.join(process.cwd(), 'social-portal.db');

function openDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create admin_users table if it doesn't exist yet
  db.exec(`
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
  `);

  return db;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n🔐  CONCERN Admin User Bootstrap\n');
  console.log(`Database : ${DB_PATH}`);
  console.log('This script creates an admin user in the local SQLite database.');
  console.log('Run it once during initial setup.\n');

  const rl = readline.createInterface({ input, output });

  try {
    const name = (await rl.question('Full name: ')).trim();
    const email = (await rl.question('Email address: ')).trim().toLowerCase();
    const password = (await rl.question('Password (min 8 chars): ')).trim();
    const confirmPassword = (await rl.question('Confirm password: ')).trim();

    // Validation
    if (!name || name.length < 2) {
      console.error('\n❌  Name must be at least 2 characters.\n');
      process.exit(1);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error('\n❌  Invalid email address.\n');
      process.exit(1);
    }
    if (password.length < 8) {
      console.error('\n❌  Password must be at least 8 characters.\n');
      process.exit(1);
    }
    if (password !== confirmPassword) {
      console.error('\n❌  Passwords do not match.\n');
      process.exit(1);
    }

    console.log('\n⏳  Opening database...');
    const db = openDb();

    // Check for existing user
    const existing = db
      .prepare('SELECT id FROM admin_users WHERE email = ? COLLATE NOCASE')
      .get(email);

    if (existing) {
      console.warn(`\n⚠️   A user with email "${email}" already exists. No changes made.\n`);
      process.exit(0);
    }

    // Hash password
    console.log('⏳  Hashing password...');
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user
    console.log('⏳  Creating admin user...');
    const result = db
      .prepare(
        `INSERT INTO admin_users (name, email, password_hash, role)
         VALUES (?, ?, ?, 'super_admin')`
      )
      .run(name, email, passwordHash);

    console.log('\n✅  Admin user created successfully!');
    console.log(`    Row ID  : ${result.lastInsertRowid}`);
    console.log(`    Name    : ${name}`);
    console.log(`    Email   : ${email}`);
    console.log(`    Role    : super_admin`);
    console.log(`    DB file : ${DB_PATH}`);
    console.log('\n    You can now log in at /admin/login\n');

    db.close();
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('\n❌  Unexpected error:', err);
  process.exit(1);
});
