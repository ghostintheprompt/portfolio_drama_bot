// Market Maker UI Logic
const { ipcRenderer } = require('electron');

// Mode Switching
function switchMode(mode) {
  // Update button states
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`mode-${mode}`).classList.add('active');

  // Hide all modes
  document.getElementById('coordinator-mode').style.display = 'none';
  document.getElementById('market-maker-mode').style.display = 'none';
  document.getElementById('hybrid-mode').style.display = 'none';

  // Show selected mode
  document.getElementById(`${mode}-mode`).style.display = 'block';
}

// Market Maker Functions
function getMMConfig() {
  const config = getConfig(); // From renderer.js

  return {
    ...config,
    tradingCapital: parseFloat(document.getElementById('mm-trading-capital').value),
    targetVolume24h: parseFloat(document.getElementById('mm-target-volume').value),
    priceTarget: document.getElementById('mm-price-target').value,
    maxPositionSize: parseFloat(document.getElementById('mm-max-position').value),
    minTimeBetweenTrades: parseInt(document.getElementById('mm-min-time').value) * 60,
    maxTimeBetweenTrades: parseInt(document.getElementById('mm-max-time').value) * 60,
    stopLossPercent: parseFloat(document.getElementById('mm-stop-loss').value) / 100,
    takeProfitPercent: parseFloat(document.getElementById('mm-take-profit').value) / 100,
    enableWhaleDetection: document.getElementById('mm-whale-detection').checked,
    enableAutoRebalance: document.getElementById('mm-auto-rebalance').checked
  };
}

async function startMarketMaker() {
  const config = getMMConfig();

  if (!config.tokenAddress || !config.lpAddress) {
    alert('Please set Token Address and LP Address in the configuration first!');
    switchMode('coordinator');
    return;
  }

  if (config.network === 'polygon') {
    const confirmed = confirm(
      `🚨 WARNING: You are about to start market making on POLYGON MAINNET!\n\n` +
      `Trading Capital: $${config.tradingCapital}\n` +
      `This will run continuously until stopped.\n\n` +
      `Are you sure?`
    );

    if (!confirmed) return;
  }

  addMMLog('🤖 Starting Market Maker...', 'info');

  const result = await ipcRenderer.invoke('start-market-maker', config);

  if (!result.success) {
    addMMLog(`❌ Failed to start: ${result.error}`, 'error');
    alert(`Error: ${result.error}`);
  }
}

async function stopMarketMaker() {
  const confirmed = confirm('Stop the Market Maker? It will complete the current trade first.');

  if (confirmed) {
    const result = await ipcRenderer.invoke('stop-market-maker');
    if (result.success) {
      addMMLog('🛑 Stopping Market Maker...', 'warning');
    }
  }
}

function addMMLog(message, type = 'info') {
  const log = document.getElementById('mm-log');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  entry.innerHTML = `<span class="log-time">${timestamp}</span> ${message}`;
  log.prepend(entry);

  while (log.children.length > 100) {
    log.removeChild(log.lastChild);
  }
}

function updateMMDashboard(stats) {
  // Price
  document.getElementById('mm-current-price').textContent = `$${stats.currentPrice.toFixed(6)}`;
  const priceChangeEl = document.getElementById('mm-price-change');
  priceChangeEl.textContent = `${stats.priceChange >= 0 ? '+' : ''}${stats.priceChange.toFixed(2)}%`;
  priceChangeEl.className = 'stat-change ' + (stats.priceChange >= 0 ? 'positive' : 'negative');

  // P&L
  document.getElementById('mm-total-pnl').textContent = `$${stats.totalProfit.toFixed(2)}`;
  const roiEl = document.getElementById('mm-roi');
  roiEl.textContent = `${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(2)}% ROI`;
  roiEl.className = 'stat-change ' + (stats.roi >= 0 ? 'positive' : 'negative');

  // Volume
  document.getElementById('mm-total-volume').textContent = `$${stats.totalVolume.toLocaleString()}`;
  document.getElementById('mm-trades-count').textContent = `${stats.totalTrades} trades (${stats.totalBuys}B/${stats.totalSells}S)`;

  // Inventory
  document.getElementById('mm-inventory-value').textContent = `$${stats.inventoryValue.toFixed(2)}`;
  document.getElementById('mm-inventory-tokens').textContent = `${stats.inventoryTokens.toLocaleString()} tokens`;

  // Capital
  document.getElementById('mm-available-capital').textContent = `$${stats.availableCapital.toFixed(2)}`;
  const capitalPercent = stats.totalValue > 0 ? (stats.availableCapital / stats.totalValue * 100) : 0;
  document.getElementById('mm-capital-percent').textContent = `${capitalPercent.toFixed(1)}%`;

  // Time
  document.getElementById('mm-running-time').textContent = `${stats.runningTimeHours.toFixed(1)}h`;
  document.getElementById('mm-trades-per-hour').textContent = `${stats.tradesPerHour.toFixed(1)}/hr`;

  // Gas & Organic
  document.getElementById('mm-gas-cost').textContent = `$${stats.totalGasCost.toFixed(2)}`;
  document.getElementById('mm-organic-trades').textContent = `${stats.organicTradesDetected} organic`;

  // Net Profit
  const netProfit = stats.totalProfit - stats.totalGasCost;
  document.getElementById('mm-net-profit').textContent = `$${netProfit.toFixed(2)}`;
  const netRoiEl = document.getElementById('mm-net-roi');
  const netRoi = ((netProfit / stats.totalValue) * 100) || 0;
  netRoiEl.textContent = `${netRoi >= 0 ? '+' : ''}${netRoi.toFixed(2)}%`;
  netRoiEl.className = 'stat-change ' + (netRoi >= 0 ? 'positive' : 'negative');
}

function addMMTrade(trade) {
  const tradesList = document.getElementById('mm-trades');

  const tradeEl = document.createElement('div');
  tradeEl.className = `mm-trade-item ${trade.action}`;
  tradeEl.innerHTML = `
    <span class="trade-time">${new Date().toLocaleTimeString()}</span>
    <span class="trade-action ${trade.action}">${trade.action.toUpperCase()}</span>
    <span class="trade-amount">$${trade.amount.toFixed(2)}</span>
    <span class="trade-tokens">${trade.tokens.toLocaleString()} tokens</span>
    <span class="trade-tx">${trade.tx ? (trade.simulated ? 'SIMULATED' : trade.tx.substring(0, 10) + '...') : ''}</span>
  `;

  tradesList.insertBefore(tradeEl, tradesList.firstChild);

  // Keep last 50 trades
  while (tradesList.children.length > 50) {
    tradesList.removeChild(tradesList.lastChild);
  }
}

// Event Listeners
ipcRenderer.on('mm-status', (event, data) => {
  addMMLog(data.message, data.type);
});

ipcRenderer.on('mm-initialized', (event, data) => {
  addMMLog(`✅ Initialized: Price $${data.initialPrice.toFixed(6)}, Capital $${data.tradingCapital}`, 'success');
});

ipcRenderer.on('mm-wallets-loaded', (event, data) => {
  addMMLog(`👛 Loaded ${data.tradingWalletsCount} trading wallets`, 'success');
});

ipcRenderer.on('mm-started', (event, data) => {
  addMMLog('🚀 Market Maker Started - Running 24/7', 'success');
});

ipcRenderer.on('mm-waiting', (event, data) => {
  addMMLog(`⏳ Next trade in ${(data.seconds / 60).toFixed(1)} minutes...`, 'info');
});

ipcRenderer.on('mm-trade-planned', (event, data) => {
  addMMLog(`📊 Planning ${data.action.toUpperCase()}: $${data.size.toFixed(2)}`, 'info');
});

ipcRenderer.on('mm-trade-start', (event, data) => {
  addMMLog(`🔄 Executing ${data.action.toUpperCase()}: $${data.amount.toFixed(2)}`, 'info');
});

ipcRenderer.on('mm-trade-complete', (event, data) => {
  const msg = `✅ ${data.action.toUpperCase()} complete: $${data.amount.toFixed(2)} = ${data.tokens.toLocaleString()} tokens`;
  addMMLog(msg, 'success');
  addMMTrade(data);
});

ipcRenderer.on('mm-trade-error', (event, data) => {
  addMMLog(`❌ Trade failed: ${data.error}`, 'error');
});

ipcRenderer.on('mm-stats-updated', (event, data) => {
  updateMMDashboard(data);
});

ipcRenderer.on('mm-organic-trade', (event, data) => {
  addMMLog(`🎉 Organic trade detected! Total: ${data.count}`, 'success');
});

ipcRenderer.on('mm-stop-loss', (event, data) => {
  addMMLog(`🛑 STOP LOSS TRIGGERED: ${(data.priceChange * 100).toFixed(2)}%`, 'error');
  alert(`Stop Loss Triggered!\nPrice dropped ${(data.priceChange * 100).toFixed(2)}%`);
});

ipcRenderer.on('mm-stopping', (event, data) => {
  addMMLog('⏹️ Market Maker stopping...', 'warning');
});

ipcRenderer.on('mm-stopped', (event, data) => {
  addMMLog('⏹️ Market Maker stopped', 'warning');
});

ipcRenderer.on('mm-error', (event, data) => {
  addMMLog(`❌ Error: ${data.message}`, 'error');
});

// Refresh stats every 10 seconds when MM is running
setInterval(async () => {
  const result = await ipcRenderer.invoke('get-mm-stats');
  if (result.success) {
    updateMMDashboard(result.stats);
  }
}, 10000);
