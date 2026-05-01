import { Router } from 'express';
import { coordinator } from '../core/coordinator.js';
import { vpnManager } from '../core/vpn-manager.js';

export const coordinatorRouter = Router();

coordinatorRouter.get('/nodes', (req, res) => {
  res.json(coordinator.getNodes());
});

coordinatorRouter.post('/beacon', (req, res) => {
  const { id, address, capabilities } = req.body;
  const result = coordinator.registerBeacon(id, address, capabilities);
  res.json(result);
});

coordinatorRouter.post('/task', (req, res) => {
  const { nodeId, task } = req.body;
  const result = coordinator.assignTask(nodeId, task);
  if (result.error) {
    return res.status(403).json(result);
  }
  res.json(result);
});

coordinatorRouter.get('/vpn/status', async (req, res) => {
  const status = await vpnManager.getStatus();
  res.json(status);
});

coordinatorRouter.post('/vpn/connect', async (req, res) => {
  const result = await vpnManager.connect(req.body.provider);
  res.json(result);
});
