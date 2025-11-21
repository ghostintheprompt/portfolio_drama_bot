// Electron Main Process
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { PersonalWalletCoordinator } = require('./coordinator');
const MarketMaker = require('./market-maker');

const store = new Store();
let mainWindow;
let coordinator;
let marketMaker;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a1a'
  });

  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('get-config', () => {
  return store.get('config', {
    network: 'mumbai',
    numWallets: 5,
    totalBuyAmount: 500,
    timingVariance: 0.5,
    amountVariance: 0.5,
    vpnEnabled: false
  });
});

ipcMain.handle('save-config', (event, config) => {
  store.set('config', config);
  return { success: true };
});

ipcMain.handle('start-simulation', async (event, config) => {
  try {
    coordinator = new PersonalWalletCoordinator({
      ...config,
      testMode: true,
      iterations: config.iterations || 10
    });

    // Forward events to renderer
    coordinator.on('status', (data) => {
      mainWindow.webContents.send('coordinator-status', data);
    });

    coordinator.on('simulation_result', (data) => {
      mainWindow.webContents.send('simulation-result', data);
    });

    coordinator.on('analysis_complete', (data) => {
      mainWindow.webContents.send('analysis-complete', data);
    });

    await coordinator.run();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('start-launch', async (event, config) => {
  try {
    coordinator = new PersonalWalletCoordinator({
      ...config,
      testMode: false
    });

    // Forward all events to renderer
    coordinator.on('status', (data) => {
      mainWindow.webContents.send('coordinator-status', data);
    });

    coordinator.on('wallet_created', (data) => {
      mainWindow.webContents.send('wallet-created', data);
    });

    coordinator.on('wallet_balance', (data) => {
      mainWindow.webContents.send('wallet-balance', data);
    });

    coordinator.on('launch_start', (data) => {
      mainWindow.webContents.send('launch-start', data);
    });

    coordinator.on('waiting', (data) => {
      mainWindow.webContents.send('waiting', data);
    });

    coordinator.on('trade_start', (data) => {
      mainWindow.webContents.send('trade-start', data);
    });

    coordinator.on('trade_complete', (data) => {
      mainWindow.webContents.send('trade-complete', data);
    });

    coordinator.on('trade_error', (data) => {
      mainWindow.webContents.send('trade-error', data);
    });

    coordinator.on('launch_complete', (data) => {
      mainWindow.webContents.send('launch-complete', data);
    });

    coordinator.on('emergency_stop', (data) => {
      mainWindow.webContents.send('emergency-stop', data);
    });

    await coordinator.run();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('emergency-stop', () => {
  const fs = require('fs');
  const stopFile = path.join(__dirname, '../STOP');
  fs.writeFileSync(stopFile, '');
  return { success: true };
});

ipcMain.handle('check-wallets', async () => {
  try {
    const config = store.get('config');
    const tempCoordinator = new PersonalWalletCoordinator({
      ...config,
      testMode: true
    });

    await tempCoordinator.setupWallets();

    const wallets = tempCoordinator.wallets.map((w, i) => ({
      index: i,
      address: w.address
    }));

    return { success: true, wallets };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Market Maker Handlers
ipcMain.handle('start-market-maker', async (event, config) => {
  try {
    marketMaker = new MarketMaker(config);

    // Forward all events to renderer
    marketMaker.on('status', (data) => {
      mainWindow.webContents.send('mm-status', data);
    });

    marketMaker.on('initialized', (data) => {
      mainWindow.webContents.send('mm-initialized', data);
    });

    marketMaker.on('wallets_loaded', (data) => {
      mainWindow.webContents.send('mm-wallets-loaded', data);
    });

    marketMaker.on('wallet_balance', (data) => {
      mainWindow.webContents.send('mm-wallet-balance', data);
    });

    marketMaker.on('started', (data) => {
      mainWindow.webContents.send('mm-started', data);
    });

    marketMaker.on('waiting', (data) => {
      mainWindow.webContents.send('mm-waiting', data);
    });

    marketMaker.on('trade_planned', (data) => {
      mainWindow.webContents.send('mm-trade-planned', data);
    });

    marketMaker.on('trade_start', (data) => {
      mainWindow.webContents.send('mm-trade-start', data);
    });

    marketMaker.on('trade_complete', (data) => {
      mainWindow.webContents.send('mm-trade-complete', data);
    });

    marketMaker.on('trade_error', (data) => {
      mainWindow.webContents.send('mm-trade-error', data);
    });

    marketMaker.on('stats_updated', (data) => {
      mainWindow.webContents.send('mm-stats-updated', data);
    });

    marketMaker.on('organic_trade_detected', (data) => {
      mainWindow.webContents.send('mm-organic-trade', data);
    });

    marketMaker.on('stop_loss_triggered', (data) => {
      mainWindow.webContents.send('mm-stop-loss', data);
    });

    marketMaker.on('stopping', (data) => {
      mainWindow.webContents.send('mm-stopping', data);
    });

    marketMaker.on('stopped', (data) => {
      mainWindow.webContents.send('mm-stopped', data);
    });

    // Run market maker
    marketMaker.run().catch(error => {
      mainWindow.webContents.send('mm-error', { message: error.message });
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-market-maker', async () => {
  if (marketMaker) {
    marketMaker.stop();
    return { success: true };
  }
  return { success: false, error: 'Market maker not running' };
});

ipcMain.handle('get-mm-stats', async () => {
  if (marketMaker) {
    return { success: true, stats: marketMaker.getStats() };
  }
  return { success: false, error: 'Market maker not running' };
});
