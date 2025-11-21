// VPN Manager for Privacy-Enhanced Trading
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class VPNManager {
  constructor(provider = 'none') {
    this.provider = provider;
    this.isConnected = false;
    this.currentServer = null;
  }

  async connect(server = null) {
    if (this.provider === 'none') {
      console.log('VPN disabled, using direct connection');
      return { success: true, message: 'VPN disabled' };
    }

    try {
      console.log(`Connecting to VPN (${this.provider})...`);

      switch (this.provider) {
        case 'nordvpn':
          return await this.connectNordVPN(server);
        case 'expressvpn':
          return await this.connectExpressVPN(server);
        case 'mullvad':
          return await this.connectMullvad(server);
        case 'surfshark':
          return await this.connectSurfshark(server);
        default:
          throw new Error(`Unsupported VPN provider: ${this.provider}`);
      }
    } catch (error) {
      return {
        success: false,
        message: `VPN connection failed: ${error.message}`
      };
    }
  }

  async disconnect() {
    if (this.provider === 'none' || !this.isConnected) {
      return { success: true };
    }

    try {
      console.log(`Disconnecting from VPN (${this.provider})...`);

      switch (this.provider) {
        case 'nordvpn':
          await execAsync('nordvpn disconnect');
          break;
        case 'expressvpn':
          await execAsync('expressvpn disconnect');
          break;
        case 'mullvad':
          await execAsync('mullvad disconnect');
          break;
        case 'surfshark':
          await execAsync('surfshark disconnect');
          break;
      }

      this.isConnected = false;
      this.currentServer = null;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: `VPN disconnection failed: ${error.message}`
      };
    }
  }

  async getStatus() {
    if (this.provider === 'none') {
      return {
        connected: false,
        server: null,
        ip: await this.getPublicIP()
      };
    }

    try {
      let status;

      switch (this.provider) {
        case 'nordvpn':
          status = await execAsync('nordvpn status');
          break;
        case 'expressvpn':
          status = await execAsync('expressvpn status');
          break;
        case 'mullvad':
          status = await execAsync('mullvad status');
          break;
        case 'surfshark':
          status = await execAsync('surfshark status');
          break;
      }

      const connected = status.stdout.includes('Connected');
      const ip = await this.getPublicIP();

      return {
        connected,
        server: this.currentServer,
        ip
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  async getPublicIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'Unknown';
    }
  }

  // NordVPN specific
  async connectNordVPN(server = null) {
    try {
      let command = 'nordvpn connect';

      if (server) {
        command += ` ${server}`;
      } else {
        // Connect to random server for privacy
        const countries = ['us', 'uk', 'de', 'nl', 'ch', 'sg'];
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        command += ` ${randomCountry}`;
      }

      const result = await execAsync(command);

      this.isConnected = result.stdout.includes('Connected');
      this.currentServer = server || 'auto';

      return {
        success: this.isConnected,
        message: result.stdout
      };
    } catch (error) {
      throw error;
    }
  }

  // ExpressVPN specific
  async connectExpressVPN(server = null) {
    try {
      let command = 'expressvpn connect';

      if (server) {
        command += ` ${server}`;
      } else {
        // Connect to smart location
        command += ' smart';
      }

      const result = await execAsync(command);

      this.isConnected = result.stdout.includes('Connected');
      this.currentServer = server || 'smart';

      return {
        success: this.isConnected,
        message: result.stdout
      };
    } catch (error) {
      throw error;
    }
  }

  // Mullvad specific
  async connectMullvad(server = null) {
    try {
      const command = 'mullvad connect';
      const result = await execAsync(command);

      this.isConnected = result.stdout.includes('Connected');
      this.currentServer = 'auto';

      return {
        success: this.isConnected,
        message: result.stdout
      };
    } catch (error) {
      throw error;
    }
  }

  // Surfshark specific
  async connectSurfshark(server = null) {
    try {
      let command = 'surfshark';

      if (server) {
        command += ` --server ${server}`;
      }

      const result = await execAsync(command);

      this.isConnected = result.stdout.includes('Connected');
      this.currentServer = server || 'auto';

      return {
        success: this.isConnected,
        message: result.stdout
      };
    } catch (error) {
      throw error;
    }
  }

  // Rotate VPN server for enhanced privacy
  async rotateServer() {
    if (this.provider === 'none') {
      return { success: true };
    }

    console.log('Rotating VPN server...');

    await this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    return await this.connect();
  }

  // Enhanced privacy: Use different VPN server for each wallet
  async connectForWallet(walletIndex) {
    if (this.provider === 'none') {
      return { success: true };
    }

    // Define server pools by provider
    const servers = this.getServerPool();

    if (servers.length === 0) {
      return await this.connect();
    }

    // Use wallet index to select server (deterministic but varied)
    const serverIndex = walletIndex % servers.length;
    const server = servers[serverIndex];

    console.log(`Connecting to VPN server for Wallet ${walletIndex + 1}: ${server}`);

    await this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 2000));
    return await this.connect(server);
  }

  getServerPool() {
    switch (this.provider) {
      case 'nordvpn':
        return ['us', 'uk', 'de', 'nl', 'ch', 'ca', 'au', 'sg', 'jp', 'fr'];
      case 'expressvpn':
        return ['usny', 'uklo', 'deff', 'nlam', 'sgma', 'hk', 'jp', 'au'];
      case 'mullvad':
        return []; // Mullvad auto-selects
      case 'surfshark':
        return ['us', 'uk', 'de', 'nl', 'ch', 'ca', 'sg', 'jp'];
      default:
        return [];
    }
  }

  // Test VPN is working
  async testConnection() {
    const beforeIP = await this.getPublicIP();
    await this.connect();
    await new Promise(resolve => setTimeout(resolve, 3000));
    const afterIP = await this.getPublicIP();

    const isWorking = beforeIP !== afterIP;

    return {
      success: isWorking,
      beforeIP,
      afterIP,
      message: isWorking
        ? `VPN working: IP changed from ${beforeIP} to ${afterIP}`
        : `VPN not working: IP still ${beforeIP}`
    };
  }
}

module.exports = VPNManager;
