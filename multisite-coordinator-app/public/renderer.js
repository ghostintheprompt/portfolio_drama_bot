const { ipcRenderer } = require('electron');

// Load saved config on startup
window.addEventListener('DOMContentLoaded', async () => {
  const config = await ipcRenderer.invoke('get-config');
  loadConfig(config);

  // Set default launch time to 1 hour from now
  const defaultTime = new Date(Date.now() + 60 * 60 * 1000);
  document.getElementById('launchTime').value = formatDateTimeLocal(defaultTime);
});

function formatDateTimeLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function loadConfig(config) {
  document.getElementById('network').value = config.network || 'mumbai';
  document.getElementById('tokenAddress').value = config.tokenAddress || '';
  document.getElementById('lpAddress').value = config.lpAddress || '';
  document.getElementById('numWallets').value = config.numWallets || 5;
  document.getElementById('totalBuyAmount').value = config.totalBuyAmount || 500;
  document.getElementById('timingVariance').value = config.timingVariance || 0.5;
  document.getElementById('amountVariance').value = config.amountVariance || 0.5;
  document.getElementById('vpnEnabled').checked = config.vpnEnabled || false;
}

function getConfig() {
  return {
    network: document.getElementById('network').value,
    tokenAddress: document.getElementById('tokenAddress').value,
    lpAddress: document.getElementById('lpAddress').value,
    numWallets: parseInt(document.getElementById('numWallets').value),
    totalBuyAmount: parseFloat(document.getElementById('totalBuyAmount').value),
    timingVariance: parseFloat(document.getElementById('timingVariance').value),
    amountVariance: parseFloat(document.getElementById('amountVariance').value),
    launchTime: new Date(document.getElementById('launchTime').value),
    vpnEnabled: document.getElementById('vpnEnabled').checked
  };
}

async function saveConfig() {
  const config = getConfig();
  const result = await ipcRenderer.invoke('save-config', config);

  if (result.success) {
    addLog('✅ Configuration saved successfully', 'success');
  } else {
    addLog('❌ Failed to save configuration', 'error');
  }
}

async function checkWallets() {
  addLog('🔍 Checking wallets...', 'info');

  const result = await ipcRenderer.invoke('check-wallets');

  if (result.success) {
    displayWallets(result.wallets);
    addLog(`✅ Found ${result.wallets.length} wallets`, 'success');
  } else {
    addLog(`❌ Error: ${result.error}`, 'error');
  }
}

function displayWallets(wallets) {
  const walletList = document.getElementById('walletList');
  walletList.innerHTML = wallets.map((w, i) => `
    <div class="wallet-item">
      <div class="wallet-header">
        <span class="wallet-label">Wallet ${w.index + 1}</span>
        <span class="wallet-purpose">${i === 0 ? 'Primary LP' : i === 1 ? 'Public Trading' : 'Private Holdings'}</span>
      </div>
      <div class="wallet-address">${w.address}</div>
      <div class="wallet-balance" id="balance-${w.index}">Checking balance...</div>
    </div>
  `).join('');
}

async function runSimulation() {
  const config = getConfig();
  config.iterations = parseInt(document.getElementById('iterations').value);

  addLog(`🧪 Starting ${config.iterations} simulations on ${config.network}...`, 'info');
  document.getElementById('resultsSection').style.display = 'block';

  const result = await ipcRenderer.invoke('start-simulation', config);

  if (!result.success) {
    addLog(`❌ Simulation failed: ${result.error}`, 'error');
  }
}

async function startLiveLaunch() {
  const config = getConfig();

  if (config.network === 'mumbai') {
    addLog('⚠️  Warning: You are launching on testnet', 'warning');
  } else {
    const confirmed = confirm(
      `🚨 WARNING: You are about to execute REAL trades on Polygon mainnet!\n\n` +
      `Total Amount: $${config.totalBuyAmount}\n` +
      `Wallets: ${config.numWallets}\n` +
      `Launch Time: ${config.launchTime.toLocaleString()}\n\n` +
      `Are you sure you want to proceed?`
    );

    if (!confirmed) {
      return;
    }
  }

  document.getElementById('launchSection').style.display = 'block';
  addLog('🚀 Starting live launch...', 'info');

  const result = await ipcRenderer.invoke('start-launch', config);

  if (!result.success) {
    addLog(`❌ Launch failed: ${result.error}`, 'error');
  }
}

async function emergencyStop() {
  const confirmed = confirm('🛑 Are you sure you want to trigger an emergency stop?');

  if (confirmed) {
    await ipcRenderer.invoke('emergency-stop');
    addLog('🛑 EMERGENCY STOP TRIGGERED', 'error');
  }
}

function addLog(message, type = 'info') {
  const log = document.getElementById('statusLog');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  entry.innerHTML = `<span class="log-time">${timestamp}</span> ${message}`;
  log.prepend(entry);

  // Limit to 100 entries
  while (log.children.length > 100) {
    log.removeChild(log.lastChild);
  }
}

// Event listeners from main process
ipcRenderer.on('coordinator-status', (event, data) => {
  addLog(data.message, data.type);
});

ipcRenderer.on('wallet-created', (event, data) => {
  addLog(`✅ Created wallet ${data.index + 1}: ${data.address.substring(0, 10)}...`, 'success');
});

ipcRenderer.on('wallet-balance', (event, data) => {
  const balanceEl = document.getElementById(`balance-${data.index}`);
  if (balanceEl) {
    balanceEl.innerHTML = `
      <span class="balance-amount">${parseFloat(data.balance).toFixed(4)} MATIC</span>
      ${data.hasEnough ? '<span class="status-ok">✓</span>' : '<span class="status-warn">⚠️ Low balance</span>'}
    `;
  }
  addLog(`Wallet ${data.index + 1}: ${data.balance} MATIC`, data.hasEnough ? 'success' : 'warning');
});

ipcRenderer.on('simulation-result', (event, data) => {
  displaySimulationResult(data);
});

ipcRenderer.on('analysis-complete', (event, data) => {
  displayAnalysis(data);
});

ipcRenderer.on('launch-start', (event, data) => {
  displayLaunchSchedule(data.schedule);
});

ipcRenderer.on('waiting', (event, data) => {
  addLog(`⏳ Waiting ${data.waitMinutes} minutes until next trade...`, 'info');
});

ipcRenderer.on('trade-start', (event, data) => {
  addLog(`🔄 Executing trade: Wallet ${data.walletIndex + 1}, $${data.amount.toFixed(2)}`, 'info');
});

ipcRenderer.on('trade-complete', (event, data) => {
  const msg = data.simulated
    ? `✅ Simulated trade: Wallet ${data.walletIndex + 1}, $${data.amount.toFixed(2)}`
    : `✅ Trade complete: Wallet ${data.walletIndex + 1}, $${data.amount.toFixed(2)}, TX: ${data.txHash.substring(0, 10)}...`;
  addLog(msg, 'success');
  addTradeToHistory(data);
});

ipcRenderer.on('trade-error', (event, data) => {
  addLog(`❌ Trade failed: Wallet ${data.walletIndex + 1}, Error: ${data.error}`, 'error');
});

ipcRenderer.on('launch-complete', (event, data) => {
  addLog('🎉 Launch complete! All trades executed.', 'success');
});

ipcRenderer.on('emergency-stop', (event, data) => {
  addLog('🛑 EMERGENCY STOP ACTIVATED', 'error');
});

function displaySimulationResult(result) {
  const resultsGrid = document.getElementById('resultsGrid');

  const resultCard = document.createElement('div');
  resultCard.className = 'result-card';
  resultCard.innerHTML = `
    <h4>Simulation #${result.iteration}</h4>
    <div class="result-stats">
      <div class="stat">
        <span class="stat-label">Privacy Score</span>
        <span class="stat-value ${result.privacyScore >= 8 ? 'good' : result.privacyScore >= 6 ? 'ok' : 'bad'}">
          ${result.privacyScore.toFixed(1)}/10
        </span>
      </div>
      <div class="stat">
        <span class="stat-label">Time Spread</span>
        <span class="stat-value">${result.timeSpreadMinutes.toFixed(0)} min</span>
      </div>
      <div class="stat">
        <span class="stat-label">Total Buys</span>
        <span class="stat-value">${result.totalBuys}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Avg Amount</span>
        <span class="stat-value">$${result.avgAmount.toFixed(2)}</span>
      </div>
    </div>
  `;

  resultsGrid.insertBefore(resultCard, resultsGrid.firstChild);

  // Limit to 20 results shown
  while (resultsGrid.children.length > 20) {
    resultsGrid.removeChild(resultsGrid.lastChild);
  }
}

function displayAnalysis(data) {
  addLog(`📊 Analysis Complete:`, 'success');
  addLog(`   Average Privacy Score: ${data.avgPrivacyScore}/10`, 'info');
  addLog(`   Average Time Spread: ${data.avgTimeSpread} minutes`, 'info');
  addLog(`   Best Run: #${data.bestRun.iteration} (score: ${data.bestRun.privacyScore}/10)`, 'success');
}

function displayLaunchSchedule(schedule) {
  const progress = document.getElementById('launchProgress');

  progress.innerHTML = `
    <h3>Scheduled Trades</h3>
    <div class="schedule-list">
      ${schedule.map((buy, i) => `
        <div class="schedule-item" id="schedule-${i}">
          <span class="schedule-time">${new Date(buy.timestamp).toLocaleTimeString()}</span>
          <span class="schedule-wallet">Wallet ${buy.walletIndex + 1}</span>
          <span class="schedule-amount">$${buy.amount.toFixed(2)}</span>
          <span class="schedule-status">⏳ Pending</span>
        </div>
      `).join('')}
    </div>
  `;
}

function addTradeToHistory(trade) {
  const history = document.getElementById('tradeHistory');

  if (!history.querySelector('.trade-item')) {
    history.innerHTML = '<h3>Trade History</h3>';
  }

  const item = document.createElement('div');
  item.className = 'trade-item';
  item.innerHTML = `
    <span class="trade-time">${new Date().toLocaleTimeString()}</span>
    <span class="trade-wallet">Wallet ${trade.walletIndex + 1}</span>
    <span class="trade-amount">$${trade.amount.toFixed(2)}</span>
    <span class="trade-tx">${trade.txHash ? trade.txHash.substring(0, 10) + '...' : 'Simulated'}</span>
  `;

  history.appendChild(item);
}
