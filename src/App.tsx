/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Shield, 
  Terminal, 
  Network, 
  Cpu, 
  Wifi, 
  Ghost,
  Share2,
  Lock,
  Eye,
  Zap,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Node {
  id: string;
  address: string;
  lastSeen: number;
  status: 'idle' | 'tasked' | 'offline';
  capabilities: string[];
}

interface VpnStatus {
  connected: boolean;
  ip: string;
  fingerprint: {
    userAgent: string;
    viewport: { w: number, h: number };
    canvasFingerprint: string;
  };
}

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [vpn, setVpn] = useState<VpnStatus | null>(null);
  const [logs, setLogs] = useState<{ id: string, msg: string, time: string, type: 'info' | 'warn' | 'success' }[]>([]);
  const [mempool, setMempool] = useState<{ hash: string, value: number, time: string }[]>([]);
  const [isLive, setIsLive] = useState(true);

  const addLog = useCallback((msg: string, type: 'info' | 'warn' | 'success' = 'info') => {
    setLogs(prev => [
      { id: Math.random().toString(36), msg, time: new Date().toLocaleTimeString(), type },
      ...prev.slice(0, 49)
    ]);
  }, []);

  const fetchNodes = async () => {
    try {
      const res = await fetch('/api/coordinator/nodes');
      const data = await res.json();
      setNodes(data);
    } catch (e) {
      console.error('Failed to fetch nodes');
    }
  };

  const fetchVpn = async () => {
    try {
      const res = await fetch('/api/coordinator/vpn/status');
      const data = await res.json();
      setVpn(data);
    } catch (e) {
      console.error('Failed to fetch VPN status');
    }
  };

  // Simulate incoming mempool data for visual feedback
  const simulateMempool = useCallback(() => {
    if (!isLive) return;
    if (Math.random() > 0.7) {
      const newTx = {
        hash: '0x' + Math.random().toString(16).substring(2, 10) + '...',
        value: Math.random() * 50,
        time: new Date().toLocaleTimeString()
      };
      setMempool(prev => [newTx, ...prev.slice(0, 9)]);
      if (newTx.value > 40) {
        addLog(`[ALERT] Whale transaction detected: ${newTx.hash}`, 'warn');
      }
    }
  }, [isLive, addLog]);

  // Simulate a beacon check-in
  const simulateBeacon = async () => {
    const nodeId = 'NODE-' + Math.floor(Math.random() * 9999);
    addLog(`[C2] Manual beacon registration triggered for ${nodeId}`, 'info');
    try {
      await fetch('/api/coordinator/beacon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: nodeId,
          address: '0x' + Math.random().toString(16).substring(2, 42),
          capabilities: ['trading', 'sniffing', 'vpn_relay']
        })
      });
      fetchNodes();
    } catch (e) {
      addLog('[ERROR] Beacon registration failed', 'warn');
    }
  };

  useEffect(() => {
    fetchNodes();
    fetchVpn();
    const nodeInterval = setInterval(fetchNodes, 5000);
    const mInterval = setInterval(simulateMempool, 2000);
    return () => {
      clearInterval(nodeInterval);
      clearInterval(mInterval);
    };
  }, [simulateMempool]);

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      <div className="scanline" />
      
      {/* Header */}
      <header className="flex justify-between items-end mb-8 border-b border-apt-grid pb-4">
        <div>
          <h1 className="text-4xl font-bold text-apt-accent tracking-tighter flex items-center gap-3">
            <Ghost className="w-10 h-10" />
            AETERNA DRAMA C2 <span className="text-sm font-normal text-gray-500 opacity-50 uppercase tracking-widest">[APT-41-SUITE]</span>
          </h1>
          <p className="text-gray-500 mt-1 uppercase text-xs flex items-center gap-2">
            <Activity className="w-3 h-3 text-apt-accent animate-pulse" />
            System Status: Operational | Connection: Secure | Nodes: {nodes.length}
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={simulateBeacon}
            className="flex items-center gap-2 px-4 py-2 bg-apt-accent/10 border border-apt-accent/30 text-apt-accent text-sm hover:bg-apt-accent/20 transition-all rounded-sm uppercase"
          >
            <Zap className="w-4 h-4" /> Trigger Beacon
          </button>
          <div className="terminal-card py-2 px-4 flex items-center gap-3">
             <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">Master Controller</span>
                <span className="text-xs text-apt-accent tabular-nums">{new Date().toLocaleTimeString()}</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column - Nodes & C2 */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="terminal-card h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-apt-grid/50">
              <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-white">
                <Cpu className="w-4 h-4 text-apt-accent" /> Active Edge Nodes
              </h2>
              <span className="text-[10px] bg-apt-accent text-black px-1 font-bold">{nodes.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
              <AnimatePresence>
                {nodes.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full opacity-20">
                      <Wifi className="w-12 h-12 mb-2" />
                      <p className="text-xs italic uppercase">Waiting for beacons...</p>
                   </div>
                )}
                {nodes.map((node) => (
                  <motion.div 
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 border border-apt-grid bg-white/5 flex flex-col gap-1 rounded-sm"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-apt-accent leading-none">{node.id}</span>
                      <span className={`text-[9px] uppercase px-1 rounded-sm ${node.status === 'offline' ? 'bg-apt-warn text-white' : 'bg-apt-accent text-black'}`}>
                        {node.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono truncate">{node.address}</span>
                    <div className="flex gap-1 mt-1">
                      {node.capabilities.map(cap => (
                        <span key={cap} className="text-[8px] border border-gray-700 px-1 text-gray-400 capitalize">{cap.replace('_', ' ')}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          <section className="terminal-card">
             <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-white mb-4">
                <Shield className="w-4 h-4 text-apt-info" /> Anti-Forensics Status
             </h2>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-500">VPN TUNNEL</span>
                   <span className={vpn?.connected ? 'text-apt-accent' : 'text-apt-warn'}>
                      {vpn?.connected ? 'ENCRYPTED' : 'EXPOSED'}
                   </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-gray-500">RELAY EXIT</span>
                   <span className="text-apt-info">{vpn?.ip || '0.0.0.0'}</span>
                </div>
                <div className="p-3 bg-black/40 border border-apt-grid text-[10px] space-y-1">
                   <div className="text-apt-info font-bold opacity-70">SPOOFFED FINGERPRINT [SHA-256]</div>
                   <div className="text-gray-500 break-all leading-tight">
                      {vpn?.fingerprint?.userAgent || 'Initializing spoof layer...'}
                   </div>
                   <div className="flex justify-between mt-2 pt-2 border-t border-apt-grid/30">
                      <span>CANVAS_HASH: {vpn?.fingerprint?.canvasFingerprint || 'PENDING'}</span>
                      <span>RESOLUTION: {vpn?.fingerprint?.viewport.w}x{vpn?.fingerprint?.viewport.h}</span>
                   </div>
                </div>
             </div>
          </section>
        </div>

        {/* Middle Column - Analytics & Charts */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
           <section className="terminal-card h-[300px]">
              <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-white mb-4">
                <Activity className="w-4 h-4 text-apt-accent" /> C2 Resource Utilization
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { time: '00:00', cpu: 12, mem: 45 },
                    { time: '04:00', cpu: 32, mem: 48 },
                    { time: '08:00', cpu: 25, mem: 52 },
                    { time: '12:00', cpu: 85, mem: 75 },
                    { time: '16:00', cpu: 65, mem: 68 },
                    { time: '20:00', cpu: 45, mem: 60 },
                    { time: '23:59', cpu: 55, mem: 62 },
                  ]}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00ff41" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="time" stroke="#555" fontSize={10} />
                    <YAxis stroke="#555" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #1a1a1a' }}
                      itemStyle={{ color: '#00ff41' }}
                    />
                    <Area type="monotone" dataKey="cpu" stroke="#00ff41" fillOpacity={1} fill="url(#colorCpu)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </section>

           <section className="terminal-card h-[400px] flex flex-col">
              <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-white mb-4">
                <Zap className="w-4 h-4 text-apt-accent" /> Blockchain Mempool Sniffer
              </h2>
              <div className="flex-1 overflow-y-auto space-y-2 text-[10px] font-mono">
                {mempool.map((tx, idx) => (
                   <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    key={tx.hash + idx} 
                    className="p-2 border-l-2 border-apt-grid hover:border-apt-accent bg-white/5 flex justify-between items-center group transition-all"
                   >
                      <div className="flex flex-col">
                        <span className="text-apt-info">{tx.hash}</span>
                        <span className="text-gray-500">PENDING_CONFIRMATION | {tx.time}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${tx.value > 10 ? 'text-apt-warn' : 'text-apt-accent'}`}>
                          {tx.value.toFixed(4)} ETH
                        </span>
                      </div>
                   </motion.div>
                ))}
              </div>
           </section>
        </div>

        {/* Right Column - Logs & Graphs */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
           <section className="terminal-card h-[400px] flex flex-col">
              <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-white mb-4">
                <Terminal className="w-4 h-4 text-gray-400" /> Command Log
              </h2>
              <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px] pr-2 scrollbar-thin">
                {logs.map((log) => (
                   <div key={log.id} className="flex gap-2">
                      <span className="text-gray-600">[{log.time}]</span>
                      <span className={log.type === 'warn' ? 'text-apt-warn' : log.type === 'success' ? 'text-apt-accent' : 'text-gray-400'}>
                        {log.msg}
                      </span>
                   </div>
                ))}
              </div>
           </section>

           <section className="terminal-card">
              <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-white mb-4">
                <Share2 className="w-4 h-4 text-apt-info" /> Viral Path Analysis
              </h2>
              <div className="space-y-4">
                 <div className="p-4 bg-apt-grid/20 border border-apt-grid flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute -right-4 -top-4 w-24 h-24 border border-apt-accent opacity-10 rounded-full" 
                    />
                    <Network className="w-12 h-12 text-apt-info animate-pulse" />
                    <div className="text-center">
                       <p className="text-[10px] text-gray-500 uppercase">Target Influence Reach</p>
                       <p className="text-2xl font-bold text-apt-info italic">528K+</p>
                    </div>
                    <button className="w-full py-2 bg-apt-info/10 border border-apt-info/30 text-apt-info text-[10px] uppercase font-bold hover:bg-apt-info/20 transition-all">
                       Compute Viral Path
                    </button>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[9px] uppercase">
                       <span className="text-gray-500">Social Graph Depth</span>
                       <span className="text-white">12 LAYERS</span>
                    </div>
                    <div className="w-full bg-apt-grid h-1">
                       <div className="bg-apt-info w-[75%] h-full" />
                    </div>
                 </div>
              </div>
           </section>
        </div>

      </div>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 left-0 w-full bg-black/80 border-t border-apt-grid px-6 py-2 flex justify-between items-center text-[10px] z-50">
         <div className="flex gap-6">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-apt-accent shadow-[0_0_5px_#00ff41]" />
               <span className="text-gray-400">UPTIME: 14:28:42</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-apt-info" />
               <span className="text-gray-400">AES-256 ENCRYPTION ACTIVE</span>
            </div>
         </div>
         <div className="flex gap-6 uppercase">
            <span className="text-gray-600">Region: US-EAST-VIRGINIA-REDACTED</span>
            <span className="text-apt-accent font-bold">LIVE FEED ACTIVE</span>
         </div>
      </footer>
    </div>
  );
}
