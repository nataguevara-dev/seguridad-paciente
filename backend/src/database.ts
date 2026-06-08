let db: any;

if (typeof Bun !== 'undefined' && Bun) {
  const { Database } = await import('bun:sqlite');
  db = new Database();
} else {
  const Database = (await import('better-sqlite3')).default;
  db = new Database(':memory:');
}

// Initialize schema
const schema = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  clinicalHistoryNumber TEXT UNIQUE NOT NULL,
  documentType TEXT NOT NULL,
  documentNumber TEXT NOT NULL,
  birthDate TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS safety_events (
  id TEXT PRIMARY KEY,
  patientId TEXT NOT NULL,
  reporterId TEXT NOT NULL,
  service TEXT NOT NULL,
  location TEXT NOT NULL,
  occurredAt TEXT NOT NULL,
  description TEXT NOT NULL,
  notificationStatus TEXT NOT NULL DEFAULT 'pending',
  notificationError TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (patientId) REFERENCES patients(id),
  FOREIGN KEY (reporterId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notification_configs (
  supervisorEmail TEXT PRIMARY KEY
);
`;

db.exec(schema);

const existingConfig = db.prepare('SELECT supervisorEmail FROM notification_configs LIMIT 1').get();
if (!existingConfig) {
  db.prepare('INSERT INTO notification_configs (supervisorEmail) VALUES (?)').run('supervisor@example.com');
}

export { db };
