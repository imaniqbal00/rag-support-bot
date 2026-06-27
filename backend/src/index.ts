import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import documentsRoutes from './routes/documents.routes';
import queryRoutes from './routes/query.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Serve widget.js — works locally and on Vercel
app.use('/widget.js', express.static(path.join(__dirname, '../public/widget.js')));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/analytics', analyticsRoutes);

// Local dev: start the HTTP server
// Vercel: export the app as a serverless handler
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Backend running on http://localhost:${config.port}`);
  });
}

export default app;
