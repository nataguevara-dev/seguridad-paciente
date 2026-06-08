export const config = {
  jwtSecret: process.env.JWT_SECRET || 'patient-safety-secret',
  port: parseInt(process.env.PORT || '3000', 10),
  supervisorEmail: process.env.SUPERVISOR_EMAIL || 'supervisor@example.com',
  simulateEmail: (process.env.SIMULATE_EMAIL || 'false') === 'true',
  mailhogHost: process.env.MAILHOG_HOST || 'mailhog',
  mailhogSmtpPort: parseInt(process.env.MAILHOG_SMTP_PORT || '1025', 10),
  mailTransport: process.env.MAIL_TRANSPORT || 'smtp'
};
