import express from 'express';
import cors from 'cors';
import { db } from './database';
import authRoutes from './routes/auth';
import eventsRoutes from './routes/events';

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Patient Safety Reporting API' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app };