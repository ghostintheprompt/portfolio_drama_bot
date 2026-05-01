import { ethers } from 'ethers';
import { EventEmitter } from 'events';

class MempoolSniffer extends EventEmitter {
  private provider: ethers.WebSocketProvider | null = null;
  private isSniffing: boolean = false;
  private targetContracts: string[] = [];
  
  // Actionable Improvement: Automated Discovery Targets
  private knownFactories: string[] = [
    '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // Uniswap V2 Factory
    '0x1F98431c8aD98523631AE4a59f267346ea31F984'  // Uniswap V3 Factory
  ];

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
    if (!tx.to) return;
    const to = tx.to.toLowerCase();

    // Discovery Logic: Monitor Factories for new pairings
    if (this.knownFactories.map(f => f.toLowerCase()).includes(to)) {
      console.log(`[DISCOVERY] Potential new pool creation detected on Factory: ${tx.hash}`);
      // In a real implementation, we'd decode the 'createPair' call
      // Here we simulate the discovery of a new active target
      const mockNewPool = '0x' + Math.random().toString(16).substring(2, 42);
      if (!this.targetContracts.includes(mockNewPool)) {
        console.log(`[DISCOVERY] Dynamically adding new target pool: ${mockNewPool}`);
        this.addTarget(mockNewPool);
        this.emit('discovery', { id: 's3', address: mockNewPool, origin: tx.hash });
      }
    }

    // Look for high-value liquidity movements on target contracts
    if (this.targetContracts.includes(to)) {
      const value = parseFloat(ethers.formatEther(tx.value));
      
      // Formalized Alert: INC-1 (Whale Liquidity Alert)
      if (value > 10) { 
        console.log(`[SOC] INC-1: High-value Tx detected: ${tx.hash}`);
        this.emit('alert', {
          id: 'INC-1',
          severity: 'HIGH',
          description: 'Significant liquidity movement detected in target pool.',
          forensics: {
            txHash: tx.hash,
            origin: tx.from,
            impact: value,
            timestamp: Date.now()
          }
        });
      }

      // Actionable Scenario: s2 (Arbitrage Vectoring)
      // Logic: Detect if transaction hits a known DEX pair and check gas price for priority
      if (tx.gasPrice && tx.gasPrice > ethers.parseUnits('100', 'gwei')) {
        console.log(`[INTEL] s2: High-gas transaction detected on target. Potential arbitrage/front-run.`);
        this.emit('detect', {
          id: 's2',
          type: 'ARBITRAGE_VECTOR',
          data: {
            hash: tx.hash,
            priority: 'CRITICAL',
            estimatedProfit: value * 0.02 // Simulated vector mapping
          }
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
