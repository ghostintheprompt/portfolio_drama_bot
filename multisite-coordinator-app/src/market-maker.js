// Automated Market Maker Bot
// Provides continuous liquidity and creates organic-looking trading volume
// YOU are both buyer and seller until real liquidity arrives

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const VPNManager = require('./vpn-manager');

class MarketMaker {
  constructor(config) {
    this.config = {
      // Network
      network: config.network || 'mumbai',
      tokenAddress: config.tokenAddress,
      lpAddress: config.lpAddress,
      routerAddress: config.routerAddress,

      // Strategy
      targetVolume24h: config.targetVolume24h || 2000, // USD
      priceTarget: config.priceTarget || 'drift-up', // 'drift-up', 'stable', 'volatile'
      maxPriceChange: config.maxPriceChange || 0.05, // 5% max per trade

      // Timing
      minTimeBetweenTrades: config.minTimeBetweenTrades || 300, // 5 min
      maxTimeBetweenTrades: config.maxTimeBetweenTrades || 1800, // 30 min

      // Capital
      tradingCapital: config.tradingCapital || 1000,
      maxPositionSize: config.maxPositionSize || 100,

      // Risk
      stopLossPercent: config.stopLossPercent || 0.3, // 30%
      takeProfitPercent: config.takeProfitPercent || 0.1, // 10%

      // Advanced
      enableWhaleDetection: config.enableWhaleDetection !== false,
      enableAutoRebalance: config.enableAutoRebalance !== false,
      vpnEnabled: config.vpnEnabled || false,
      vpnProvider: config.vpnProvider || 'none',
      testMode: config.testMode || false
    };

    this.provider = this.setupProvider();
    this.vpn = new VPNManager(this.config.vpnEnabled ? this.config.vpnProvider : 'none');

    // State
    this.mainWallet = null;
    this.tradingWallets = [];
    this.positions = [];
    this.totalVolume = 0;
    this.currentInventory = 0;
    this.availableCapital = this.config.tradingCapital;
    this.initialPrice = 0;
    this.currentPrice = 0;
    this.priceHistory = [];
    this.isRunning = false;
    this.eventCallbacks = {};

    // Stats
    this.stats = {
      totalTrades: 0,
      totalBuys: 0,
      totalSells: 0,
      totalVolume: 0,
      totalProfit: 0,
      totalGasCost: 0,
      startTime: null,
      organicTradesDetected: 0
    };
  }

  setupProvider() {
    const rpcUrl = this.config.network === 'mumbai'
      ? 'https://rpc-mumbai.maticvigil.com'
      : 'https://polygon-rpc.com';
    return new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  // Event system for GUI
  on(event, callback) {
    this.eventCallbacks[event] = callback;
  }

  emit(event, data) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event](data);
    }
  }

  async initialize() {
    this.emit('status', { message: '🤖 Initializing Market Maker...', type: 'info' });

    // Load wallets
    await this.loadWallets();

    // Get initial price
    this.initialPrice = await this.getCurrentPrice();
    this.currentPrice = this.initialPrice;

    // Check balances
    await this.checkBalances();

    // Connect VPN if enabled
    if (this.config.vpnEnabled) {
      const vpnResult = await this.vpn.connect();
      this.emit('vpn_connected', { success: vpnResult.success });
    }

    this.stats.startTime = Date.now();

    this.emit('initialized', {
      initialPrice: this.initialPrice,
      tradingCapital: this.availableCapital,
      walletsCount: this.tradingWallets.length
    });
  }

  async loadWallets() {
    const walletsFile = path.join(__dirname, '../wallets.json');

    if (!fs.existsSync(walletsFile)) {
      throw new Error('Wallets not found. Run Launch Coordinator first to generate wallets.');
    }

    const walletsData = JSON.parse(fs.readFileSync(walletsFile));

    // First wallet is main wallet
    this.mainWallet = new ethers.Wallet(walletsData[0].privateKey, this.provider);

    // Rest are trading wallets
    for (let i = 1; i < Math.min(walletsData.length, 6); i++) {
      const wallet = new ethers.Wallet(walletsData[i].privateKey, this.provider);
      this.tradingWallets.push(wallet);
    }

    this.emit('wallets_loaded', {
      mainWallet: this.mainWallet.address,
      tradingWalletsCount: this.tradingWallets.length
    });
  }

  async checkBalances() {
    for (let i = 0; i < this.tradingWallets.length; i++) {
      const wallet = this.tradingWallets[i];
      const balance = await wallet.getBalance();
      const balanceInMatic = parseFloat(ethers.utils.formatEther(balance));

      this.emit('wallet_balance', {
        index: i,
        address: wallet.address,
        balance: balanceInMatic,
        hasEnough: balanceInMatic > 10
      });

      if (balanceInMatic < 10) {
        this.emit('status', {
          message: `⚠️ Wallet ${i + 1} needs more MATIC for gas`,
          type: 'warning'
        });
      }
    }
  }

  async run() {
    if (this.isRunning) {
      throw new Error('Market Maker is already running');
    }

    await this.initialize();

    this.isRunning = true;
    this.emit('started', {});

    // Main trading loop
    while (this.isRunning) {
      try {
        // Check for stop signal
        if (fs.existsSync(path.join(__dirname, '../STOP'))) {
          this.emit('status', { message: '🛑 Stop signal detected', type: 'warning' });
          break;
        }

        // Execute trading cycle
        await this.executeTradingCycle();

        // Check risk limits
        await this.checkRiskManagement();

        // Detect organic volume
        if (this.config.enableWhaleDetection) {
          await this.detectOrganicTraders();
        }

        // Auto rebalance if needed
        if (this.config.enableAutoRebalance) {
          await this.rebalanceInventory();
        }

        // Wait random time
        const waitTime = this.randomBetween(
          this.config.minTimeBetweenTrades,
          this.config.maxTimeBetweenTrades
        );

        this.emit('waiting', {
          seconds: waitTime,
          nextTradeIn: new Date(Date.now() + waitTime * 1000)
        });

        await this.sleep(waitTime * 1000);

      } catch (error) {
        this.emit('error', { message: error.message });
        await this.sleep(60000); // Wait 1 min on error
      }
    }

    this.emit('stopped', {});
  }

  async executeTradingCycle() {
    // Update current price
    this.currentPrice = await this.getCurrentPrice();

    // Decide action
    const action = this.decideAction();

    // Select wallet
    const wallet = this.selectWallet();

    // Calculate size
    const tradeSize = this.calculateTradeSize(action);

    this.emit('trade_planned', {
      action,
      size: tradeSize,
      wallet: wallet.address
    });

    // Execute trade
    if (action === 'buy') {
      await this.executeBuy(wallet, tradeSize);
    } else {
      await this.executeSell(wallet, tradeSize);
    }

    // Update stats
    this.updateStats();
  }

  decideAction() {
    // Check inventory ratio
    const inventoryValue = this.currentInventory * this.currentPrice;
    const totalValue = inventoryValue + this.availableCapital;
    const tokenPercent = totalValue > 0 ? inventoryValue / totalValue : 0;

    // If holding too many tokens (>60%), bias toward selling
    if (tokenPercent > 0.6) {
      return Math.random() > 0.3 ? 'sell' : 'buy'; // 70% sell
    }

    // If holding too few tokens (<30%), bias toward buying
    if (tokenPercent < 0.3) {
      return Math.random() > 0.3 ? 'buy' : 'sell'; // 70% buy
    }

    // Strategy-based decision
    switch (this.config.priceTarget) {
      case 'drift-up':
        return Math.random() > 0.45 ? 'buy' : 'sell'; // 55% buy

      case 'stable':
        return Math.random() > 0.5 ? 'buy' : 'sell'; // 50/50

      case 'volatile':
        // Bigger swings, still balanced
        return Math.random() > 0.5 ? 'buy' : 'sell';

      default:
        return Math.random() > 0.5 ? 'buy' : 'sell';
    }
  }

  calculateTradeSize(action) {
    // Base size with randomness
    const variance = 0.5 + Math.random(); // 50% to 150%
    let size = this.config.maxPositionSize * variance;

    // Volatile strategy uses bigger swings
    if (this.config.priceTarget === 'volatile') {
      size *= (1 + Math.random()); // Up to 2x bigger
    }

    // Constrain by available capital/inventory
    if (action === 'buy') {
      size = Math.min(size, this.availableCapital * 0.2);
    } else {
      const inventoryValue = this.currentInventory * this.currentPrice;
      size = Math.min(size, inventoryValue * 0.3);
    }

    return Math.max(10, Math.min(size, this.config.maxPositionSize * 1.5));
  }

  selectWallet() {
    if (this.tradingWallets.length === 0) {
      return this.mainWallet;
    }
    const index = Math.floor(Math.random() * this.tradingWallets.length);
    return this.tradingWallets[index];
  }

  async executeBuy(wallet, amountUSD) {
    this.emit('trade_start', {
      action: 'buy',
      amount: amountUSD,
      wallet: wallet.address
    });

    try {
      if (this.config.testMode) {
        // Simulate
        await this.sleep(1000);
        const tokensReceived = amountUSD / this.currentPrice;

        this.currentInventory += tokensReceived;
        this.availableCapital -= amountUSD;
        this.totalVolume += amountUSD;

        this.positions.push({
          type: 'buy',
          amount: amountUSD,
          tokens: tokensReceived,
          price: this.currentPrice,
          timestamp: Date.now(),
          tx: '0xSIMULATED' + Math.random().toString(16).substr(2, 8),
          simulated: true
        });

        this.stats.totalBuys++;
        this.stats.totalTrades++;

        this.emit('trade_complete', {
          action: 'buy',
          amount: amountUSD,
          tokens: tokensReceived,
          tx: 'SIMULATED',
          simulated: true
        });

        return;
      }

      // Real execution
      const maticPrice = await this.getMaticPrice();
      const maticAmount = amountUSD / maticPrice;

      const routerAddress = this.config.network === 'mumbai'
        ? '0x8954AfA98594b838bda56FE4C12a09D7739D179b'
        : '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';

      const router = new ethers.Contract(
        routerAddress,
        ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
        wallet
      );

      const path = [
        '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
        this.config.tokenAddress
      ];

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const tokensExpected = amountUSD / this.currentPrice;
      const minTokens = ethers.utils.parseEther((tokensExpected * 0.95).toString());

      const tx = await router.swapExactETHForTokens(
        minTokens,
        path,
        wallet.address,
        deadline,
        {
          value: ethers.utils.parseEther(maticAmount.toString()),
          gasLimit: 300000
        }
      );

      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const gasCostUSD = parseFloat(ethers.utils.formatEther(gasUsed)) * maticPrice;

      // Parse actual tokens received from logs
      const tokensReceived = tokensExpected; // Simplified

      this.currentInventory += tokensReceived;
      this.availableCapital -= amountUSD;
      this.totalVolume += amountUSD;
      this.stats.totalGasCost += gasCostUSD;

      this.positions.push({
        type: 'buy',
        amount: amountUSD,
        tokens: tokensReceived,
        price: this.currentPrice,
        timestamp: Date.now(),
        tx: tx.hash,
        gasCost: gasCostUSD
      });

      this.stats.totalBuys++;
      this.stats.totalTrades++;

      this.emit('trade_complete', {
        action: 'buy',
        amount: amountUSD,
        tokens: tokensReceived,
        tx: tx.hash,
        gasCost: gasCostUSD
      });

    } catch (error) {
      this.emit('trade_error', {
        action: 'buy',
        amount: amountUSD,
        error: error.message
      });
      throw error;
    }
  }

  async executeSell(wallet, amountUSD) {
    this.emit('trade_start', {
      action: 'sell',
      amount: amountUSD,
      wallet: wallet.address
    });

    try {
      const tokensToSell = amountUSD / this.currentPrice;

      if (tokensToSell > this.currentInventory) {
        this.emit('status', {
          message: '⚠️ Not enough inventory to sell, skipping',
          type: 'warning'
        });
        return;
      }

      if (this.config.testMode) {
        // Simulate
        await this.sleep(1000);

        this.currentInventory -= tokensToSell;
        this.availableCapital += amountUSD;
        this.totalVolume += amountUSD;

        this.positions.push({
          type: 'sell',
          amount: amountUSD,
          tokens: tokensToSell,
          price: this.currentPrice,
          timestamp: Date.now(),
          tx: '0xSIMULATED' + Math.random().toString(16).substr(2, 8),
          simulated: true
        });

        this.stats.totalSells++;
        this.stats.totalTrades++;

        this.emit('trade_complete', {
          action: 'sell',
          amount: amountUSD,
          tokens: tokensToSell,
          tx: 'SIMULATED',
          simulated: true
        });

        return;
      }

      // Real execution would go here
      // Similar to buy but swapExactTokensForETH

    } catch (error) {
      this.emit('trade_error', {
        action: 'sell',
        amount: amountUSD,
        error: error.message
      });
      throw error;
    }
  }

  async getCurrentPrice() {
    if (this.config.testMode) {
      // Simulate price movement
      if (this.currentPrice === 0) {
        return 0.0001; // Initial price
      }

      // Random walk
      const change = (Math.random() - 0.48) * 0.02; // Slight upward bias
      return this.currentPrice * (1 + change);
    }

    // Real price from LP
    try {
      const lpContract = new ethers.Contract(
        this.config.lpAddress,
        ['function getReserves() view returns (uint112, uint112, uint32)'],
        this.provider
      );

      const reserves = await lpContract.getReserves();
      const maticPrice = await this.getMaticPrice();

      const price = (parseFloat(ethers.utils.formatEther(reserves[0])) /
                     parseFloat(ethers.utils.formatEther(reserves[1]))) * maticPrice;

      return price;
    } catch (error) {
      return this.currentPrice || 0.0001;
    }
  }

  async getMaticPrice() {
    if (this.config.testMode) {
      return 0.50;
    }

    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd');
      const data = await response.json();
      return data['matic-network'].usd;
    } catch (error) {
      return 0.50;
    }
  }

  async checkRiskManagement() {
    const priceChange = (this.currentPrice - this.initialPrice) / this.initialPrice;

    // Stop loss
    if (priceChange < -this.config.stopLossPercent) {
      this.emit('stop_loss_triggered', { priceChange });
      this.stop();
      return;
    }

    // Take profit
    if (priceChange > this.config.takeProfitPercent && this.currentInventory > 0) {
      this.emit('take_profit_triggered', { priceChange });
      // Could auto-exit here
    }
  }

  async detectOrganicTraders() {
    // Placeholder for detecting external trades
    // In real implementation, would monitor blockchain events
    if (Math.random() > 0.95) { // 5% chance per cycle
      this.stats.organicTradesDetected++;
      this.emit('organic_trade_detected', {
        count: this.stats.organicTradesDetected
      });
    }
  }

  async rebalanceInventory() {
    const inventoryValue = this.currentInventory * this.currentPrice;
    const totalValue = inventoryValue + this.availableCapital;
    const tokenPercent = totalValue > 0 ? inventoryValue / totalValue : 0;

    // Target 50/50 balance
    if (tokenPercent > 0.7 || tokenPercent < 0.3) {
      this.emit('rebalancing', { tokenPercent });
    }
  }

  updateStats() {
    this.stats.totalVolume = this.totalVolume;

    // Calculate P&L
    const inventoryValue = this.currentInventory * this.currentPrice;
    const totalValue = inventoryValue + this.availableCapital;
    const initialValue = this.config.tradingCapital;
    this.stats.totalProfit = totalValue - initialValue - this.stats.totalGasCost;

    // Record price
    this.priceHistory.push({
      price: this.currentPrice,
      timestamp: Date.now()
    });

    // Keep last 24 hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.priceHistory = this.priceHistory.filter(p => p.timestamp > oneDayAgo);

    this.emit('stats_updated', this.getStats());
  }

  getStats() {
    const inventoryValue = this.currentInventory * this.currentPrice;
    const totalValue = inventoryValue + this.availableCapital;
    const priceChange = this.initialPrice > 0
      ? ((this.currentPrice - this.initialPrice) / this.initialPrice * 100)
      : 0;

    const runningTime = this.stats.startTime
      ? (Date.now() - this.stats.startTime) / 1000 / 60 / 60 // hours
      : 0;

    return {
      ...this.stats,
      currentPrice: this.currentPrice,
      priceChange,
      inventoryValue,
      inventoryTokens: this.currentInventory,
      availableCapital: this.availableCapital,
      totalValue,
      roi: ((totalValue - this.config.tradingCapital) / this.config.tradingCapital * 100),
      runningTimeHours: runningTime,
      tradesPerHour: runningTime > 0 ? this.stats.totalTrades / runningTime : 0
    };
  }

  stop() {
    this.isRunning = false;
    this.emit('stopping', {});
  }

  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = MarketMaker;
