export const config = {
  port: process.env.PORT || 3000,
  supervisorEmail: process.env.SUPERVISOR_EMAIL || 'supervisor@example.com',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  databasePath: ':memory:', // In-memory for prototype
};