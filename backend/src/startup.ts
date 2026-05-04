import Database from 'better-sqlite3';
import express from 'express';

// Initialize in-memory database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE patients (
    id TEXT PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    clinicalHistoryNumber TEXT UNIQUE NOT NULL,
    documentType TEXT NOT NULL,
    documentNumber TEXT NOT NULL,
    birthDate TEXT NOT NULL
  );

  CREATE TABLE safety_events (
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

  CREATE TABLE notification_configs (
    supervisorEmail TEXT PRIMARY KEY
  );
`);

// Insert default notification config
db.prepare('INSERT INTO notification_configs (supervisorEmail) VALUES (?)').run('supervisor@example.com');

// Initialize Express app
const app = express();
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Patient Safety Reporting API' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { db, app };