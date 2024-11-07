// backend/db.js

/*
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kubeadmin.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clusters (
    id TEXT PRIMARY KEY,
    name TEXT,
    config TEXT,
    created_at TEXT
  )`);
});

module.exports = db;
*/

/*
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'kubeadmin.db');
const db = new Database(dbPath);

// Create the clusters table if it doesn't exist
db.exec(`CREATE TABLE IF NOT EXISTS clusters (
  id TEXT PRIMARY KEY,
  name TEXT,
  config TEXT,
  created_at TEXT
)`);

module.exports = db;
*/

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function kubeadminDB() {
  const db = await open({
    filename: path.resolve(__dirname, 'kubeadmin.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS clusters (
      id TEXT PRIMARY KEY,
      name TEXT,
      config TEXT,
      address TEXT,
      version TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS appstore (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      address TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS imagestore (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      address TEXT NOT NULL
    );
  `);

  return db;
}

getClusterById = async (clusterId) => {
  try {
    const db = await kubeadminDB();
    const cluster = await db.get('SELECT id, name, config, address, version, created_at FROM clusters WHERE id = ?', clusterId);
    return cluster;
  } catch (error) {
    return null;
  }
}

getAppStoreById = async (appstoreId) => {
  try {
    const db = await kubeadminDB();
    const appstore = await db.get('SELECT id, name, type, address FROM appstore WHERE id = ?', appstoreId);
    return appstore;
  } catch (error) {
    return null;
  }
}

getImageStoreById = async (imagestoreId) => {
  try {
    const db = await kubeadminDB();
    const imagestore = await db.get('SELECT id, name, type, address FROM imagestore WHERE id = ?', imagestoreId);
    return imagestore;
  } catch (error) {
    return null;
  }
}


module.exports = { kubeadminDB, getClusterById, getAppStoreById, getImageStoreById };