import { ethers } from 'ethers';
import { EventEmitter } from 'events';

class MempoolSniffer extends EventEmitter {
  private provider: ethers.WebSocketProvider | null = null;
  private isSniffing: boolean = false;
  private targetContracts: string[] = [];

  constructor() {
    super();
  }

  async start(rpcUrl: string) {
    if (this.isSniffing) return;
    
    try {
      this.provider = new ethers.WebSocketProvider(rpcUrl);
      this.isSniffing = true;
      console.log(`[SNIFFER] Started on ${rpcUrl}`);

      this.provider.on('pending', async (txHash: string) => {
        try {
          const tx = await this.provider?.getTransaction(txHash);
          if (tx) {
            this.analyzeTransaction(tx);
          }
        } catch (e) {
          // Transaction might have been mined already
        }
      });
    } catch (error) {
      console.error('[SNIFFER] Connection failed:', error);
      this.isSniffing = false;
    }
  }

  private analyzeTransaction(tx: ethers.TransactionResponse) {
    // Look for high-value liquidity movements on target contracts
    if (tx.to && this.targetContracts.includes(tx.to.toLowerCase())) {
      const value = parseFloat(ethers.formatEther(tx.value));
      
      if (value > 10) { // arbitrary threshold
        console.log(`[SNIFFER] High-value Tx detected: ${tx.hash} | Value: ${value} ETH`);
        this.emit('detect', {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: value,
          data: tx.data
        });
      }
    }
  }

  addTarget(address: string) {
    this.targetContracts.push(address.toLowerCase());
  }

  stop() {
    this.provider?.removeAllListeners();
    this.isSniffing = false;
    console.log('[SNIFFER] Stopped.');
  }
}

export const sniffer = new MempoolSniffer();
