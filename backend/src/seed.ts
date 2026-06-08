import { randomUUID, createHash } from 'crypto';

const JWT_SECRET = 'patient-safety-secret';

async function main() {
  let db: any;

  if (typeof Bun !== 'undefined' && Bun) {
    const { Database } = await import('bun:sqlite');
    db = new Database();
  } else {
    const Database = (await import('better-sqlite3')).default;
    db = new Database(':memory:');
  }

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
  db.prepare('INSERT INTO notification_configs (supervisorEmail) VALUES (?)').run('supervisor@example.com');

  // Create test user
  const userId = randomUUID();
  const passwordHash = createHash('sha256').update('Seed123!' + JWT_SECRET).digest('hex');
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO users (id, email, passwordHash, role, createdAt) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, 'seed@test.com', passwordHash, 'reporter', now);

  // Patient names
  const patientNames = [
    { first: 'Ana', last: 'Pérez García' },
    { first: 'Carlos', last: 'López Martínez' },
    { first: 'María', last: 'Rodríguez Fernández' },
    { first: 'Juan', last: 'Sánchez González' },
    { first: 'Laura', last: 'Torres Hernández' },
    { first: 'Pedro', last: 'Ramírez Díaz' },
    { first: 'Sofía', last: 'Morales Vargas' },
    { first: 'Diego', last: 'Castillo Reyes' },
    { first: 'Valentina', last: 'Ortiz Mendoza' },
    { first: 'Santiago', last: 'Herrera Ríos' },
    { first: 'Gabriela', last: 'Jiménez Luna' },
    { first: 'Mateo', last: 'Ríos Cruz' },
    { first: 'Isabella', last: 'Aguilar Vega' },
    { first: 'Sebastián', last: 'Delgado Peña' },
    { first: 'Camila', last: 'Flores Soto' },
  ];

  const documentTypes = ['Cédula de ciudadanía', 'Tarjeta de identidad', 'Pasaporte'];
  const services = ['Urgencias', 'Medicina Interna', 'Pediatría', 'Cirugía General', 'Ginecología'];
  const locations = [
    'Hospital Central', 'Clínica del Sur', 'Centro Médico Norte',
    'Hospital Universitario', 'Clínica San José'
  ];

  const patientWeights = [
    25, 22, 18, 15, 14, 12, 10, 9, 7, 6, 5, 4, 3, 3, 3
  ];
  const totalWeight = patientWeights.reduce((a, b) => a + b, 0);

  const insertPatient = db.prepare(
    'INSERT INTO patients (id, firstName, lastName, clinicalHistoryNumber, documentType, documentNumber, birthDate) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const patients: { id: string; first: string; last: string }[] = [];

  for (let i = 0; i < patientNames.length; i++) {
    const p = patientNames[i];
    const id = randomUUID();
    const docType = documentTypes[i % documentTypes.length];
    const docNum = String(1000000000 + i).slice(0, 10);
    const birthDate = `19${60 + i % 40}-${String(1 + i % 12).padStart(2, '0')}-${String(1 + i % 28).padStart(2, '0')}`;

    insertPatient.run(id, p.first, p.last, `HC-${10000 + i}`, docType, docNum, birthDate);
    patients.push({ id, first: p.first, last: p.last });
  }

  const serviceWeights: { service: string; target: number }[] = [
    { service: 'Urgencias', target: 60 },
    { service: 'Medicina Interna', target: 35 },
    { service: 'Pediatría', target: 35 },
    { service: 'Cirugía General', target: 35 },
    { service: 'Ginecología', target: 35 },
  ];
  const totalEvents = serviceWeights.reduce((a, s) => a + s.target, 0);

  const startDate = new Date('2026-01-01T00:00:00Z');
  const endDate = new Date('2026-06-30T23:59:59Z');
  const dateRangeMs = endDate.getTime() - startDate.getTime();

  const insertEvent = db.prepare(
    'INSERT INTO safety_events (id, patientId, reporterId, service, location, occurredAt, description, notificationStatus, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  let eventCount = 0;
  const eventCountsByService: Record<string, number> = {};

  for (const sw of serviceWeights) {
    for (let i = 0; i < sw.target; i++) {
      const eventId = randomUUID();

      // Weighted patient selection
      let rand = Math.random() * totalWeight;
      let selectedPatientIdx = 0;
      for (let j = 0; j < patientWeights.length; j++) {
        rand -= patientWeights[j];
        if (rand <= 0) {
          selectedPatientIdx = j;
          break;
        }
      }
      const patient = patients[selectedPatientIdx];

      const location = locations[Math.floor(Math.random() * locations.length)];

      // Generate occurredAt with business hour skew (~70% 8-18h)
      const randomMs = Math.random() * dateRangeMs;
      const baseDate = new Date(startDate.getTime() + randomMs);
      const isBusinessHour = Math.random() < 0.7;
      const hour = isBusinessHour
        ? 8 + Math.floor(Math.random() * 11)
        : Math.floor(Math.random() * 24);
      baseDate.setUTCHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);
      const occurredAt = baseDate.toISOString();

      const description = `Evento de prueba #${i + 1} para ${patient.first} ${patient.last} en ${sw.service}`;

      insertEvent.run(eventId, patient.id, userId, sw.service, location, occurredAt, description, 'pending', occurredAt);

      eventCount++;
      eventCountsByService[sw.service] = (eventCountsByService[sw.service] || 0) + 1;
    }
  }

  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  const patientCount = db.prepare('SELECT COUNT(*) as c FROM patients').get() as { c: number };
  const eventCountRow = db.prepare('SELECT COUNT(*) as c FROM safety_events').get() as { c: number };

  console.log(`Seeded: ${userCount.c} user, ${patientCount.c} patients, ${eventCountRow.c} events`);
  console.log('Events per service:');
  for (const sw of serviceWeights) {
    console.log(`  ${sw.service}: ${eventCountsByService[sw.service] || 0}`);
  }

  const monthlyStats = db.prepare(
    `SELECT CAST(strftime('%Y', createdAt) AS INTEGER) as year,
            CAST(strftime('%m', createdAt) AS INTEGER) as month,
            COUNT(*) as count
     FROM safety_events GROUP BY year, month ORDER BY year, month`
  ).all() as { year: number; month: number; count: number }[];

  console.log('Events per month:');
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  for (const m of monthlyStats) {
    console.log(`  ${monthNames[m.month - 1]} ${m.year}: ${m.count}`);
  }
}

main().catch(console.error);
