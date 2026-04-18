import { Router } from 'express';
import { sniffer } from '../core/mempool-sniffer.js';

export const snifferRouter = Router();

snifferRouter.post('/start', async (req, res) => {
  const { rpcUrl } = req.body;
  await sniffer.start(rpcUrl);
  res.json({ status: 'started' });
});

snifferRouter.post('/stop', (req, res) => {
  sniffer.stop();
  res.json({ status: 'stopped' });
});

snifferRouter.post('/targets', (req, res) => {
  const { address } = req.body;
  sniffer.addTarget(address);
  res.json({ status: 'added' });
});
