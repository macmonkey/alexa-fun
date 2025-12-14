import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import { alexaService } from './alexa.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', alexa: alexaService.isInitialized() });
});

// Start server
async function start() {
  try {
    console.log('Initializing Alexa connection...');
    console.log('(Falls ein Browser-Fenster aufgeht, bitte bei Amazon einloggen)');

    await alexaService.init();

    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
      console.log(`Devices: ${alexaService.getDevices().length} Echo(s) gefunden`);
    });
  } catch (error) {
    console.error('Failed to start:', error);

    // Starte trotzdem den Server für Debugging
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT} (Alexa not connected)`);
    });
  }
}

start();
