# PCC Game Token Liquidity Coordinator

Desktop OSX application for managing personal multi-wallet liquidity distribution for the Pizza Connection game token ecosystem.

## Two Powerful Modes

### 🚀 Launch Coordinator
One-time liquidity event for token launches. Distributes buys across your multiple personal wallets over 6-12 hours with privacy-focused patterns.

**Best for:**
- Initial token launch
- Creating day-1 liquidity
- Bootstrap activity

### 🤖 Market Maker Bot
Continuous 24/7 automated trading. YOU become both buyer and seller, creating organic-looking volume until real traders arrive.

**Best for:**
- Building sustained volume
- Providing ongoing liquidity
- Attracting organic traders

### ⚡ Hybrid Strategy (Recommended)
Combine both: Launch Coordinator on Day 1, then Market Maker Bot for weeks 1-4.

## Purpose

This tool helps you bootstrap initial liquidity for your PCC game token across multiple personal wallets. It's designed for:

- Creating initial game token liquidity
- Building sustained trading volume
- Distributing your holdings across multiple wallets for security
- Privacy-focused OpSec for wallet management
- Testing strategies on Mumbai testnet before mainnet deployment

## Features

### Launch Coordinator Features
- **Multi-Wallet Management**: Manage 5-20 personal wallets from one interface
- **Privacy-Focused Distribution**: Randomize timing and amounts for OpSec
- **Testnet Simulation**: Test strategies 100+ times on Mumbai (free)
- **Privacy Scoring**: 0-10 score, targets 8+ for optimal patterns
- **Emergency Stop**: Immediate halt of all pending trades

### Market Maker Bot Features
- **24/7 Automated Trading**: Continuous buy/sell execution
- **Three Strategies**: Drift Up, Stable, or Volatile price targets
- **Real-Time P&L Dashboard**: Track profit/loss, ROI, volume
- **Whale Detection**: Responds intelligently to large trades
- **Auto Rebalancing**: Maintains optimal token/cash ratio
- **Stop Loss Protection**: Auto-exit at configurable loss threshold

### Shared Features
- **VPN Integration**: Route trades through VPN for privacy
- **Live Monitoring**: Real-time dashboard with trade tracking
- **Testnet First**: Always test on Mumbai before mainnet
- **Multiple Networks**: Support for Mumbai testnet and Polygon mainnet

## Installation

### Prerequisites

- Node.js 16+ installed
- OSX 10.15 or later

### Setup

```bash
# Navigate to app directory
cd multisite-coordinator-app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

## Quick Mode Comparison

| Feature | Launch Coordinator | Market Maker Bot |
|---------|-------------------|------------------|
| **Duration** | One-time (6-12 hours) | Continuous (1-30 days) |
| **Trades** | 5-20 total | 30-50 per day |
| **Volume Created** | Initial liquidity | Sustained volume |
| **Capital Needed** | $500-2,000 | $1,000-5,000 |
| **Gas Costs** | $10-50 total | $15-100 per day |
| **Best For** | Launch day | Building liquidity |
| **Automation** | Scheduled buys | Continuous trading |
| **P&L Tracking** | No | Yes (full dashboard) |

**Recommended:** Use both! Launch Coordinator for Day 1, Market Maker Bot for ongoing growth.

## Usage

### MODE 1: Launch Coordinator

#### 1. Test on Mumbai Testnet (FREE)

```bash
# Run in development mode
npm run dev

# Or run simulations from CLI
npm run simulate
```

**Steps:**
1. Get free test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
2. Deploy test token on Mumbai
3. Configure token/LP addresses in the app
4. Run 10-100 simulations to optimize your pattern
5. Review privacy scores (aim for 8+/10)

#### 2. Deploy to Mainnet

```bash
# Build OSX app
npm run build

# Or run directly
npm start
```

**Steps:**
1. Set network to "Polygon Mainnet"
2. Enter your real token address
3. Configure buy amounts
4. Review schedule before executing
5. Launch!

### MODE 2: Market Maker Bot

#### 1. Configure Strategy

Switch to "Market Maker Bot" mode and configure:

- **Trading Capital**: $1,000-5,000 (dedicated to trading)
- **Price Strategy**: Drift Up, Stable, or Volatile
- **Position Sizes**: $50-150 per trade
- **Time Between Trades**: 5-30 minutes
- **Risk Limits**: Stop loss and take profit levels

#### 2. Start Bot

```bash
# Test on Mumbai first
Click "Start Market Maker" in GUI
Monitor P&L dashboard

# After testing, run on Polygon mainnet
```

#### 3. Monitor Performance

Real-time dashboard shows:
- Current price and % change
- Total profit/loss and ROI
- Trading volume generated
- Token inventory and cash balance
- Gas costs and net profit
- Organic trades detected

#### 4. When to Stop

- Organic volume exceeds bot volume (success!)
- 30 days completed
- Price targets achieved
- Stop loss triggered

**See MARKET_MAKER_GUIDE.md for complete documentation**

### MODE 3: Hybrid Strategy

The most effective approach:

**Week 1:**
1. Day 1 Morning: Run Launch Coordinator
2. Day 1 Afternoon: Start Market Maker Bot
3. Days 2-7: Let Market Maker run 24/7

**Week 2-3:**
1. Monitor for organic traders
2. Reduce Market Maker activity gradually
3. Let organic volume take over

**Week 4+:**
1. Turn off Market Maker
2. Organic liquidity sustains itself
3. Mission accomplished!

## Configuration Guide (Launch Coordinator)

### Basic Settings

- **Network**: Choose `mumbai` for testing or `polygon` for live
- **Token Address**: Your PCC token contract address
- **LP Address**: Your liquidity pool address
- **Number of Wallets**: How many personal wallets to use (5-20)
- **Total Buy Amount**: Total USD value to distribute

### Privacy Settings

- **Timing Variance** (0-1): How spread out trades are
  - 0.3 = Trades within 2-4 hours
  - 0.5 = Trades spread over 8 hours (recommended)
  - 0.8 = Trades spread over 12+ hours

- **Amount Variance** (0-1): How much amounts vary
  - 0.3 = Amounts within 30% of average
  - 0.5 = Amounts vary significantly (recommended)
  - 0.8 = Highly varied amounts

### Launch Time

Set when you want the first trade to execute. Trades will be distributed over several hours from this time.

## Privacy Score

The app analyzes your distribution pattern and assigns a privacy score (0-10):

- **8-10**: Excellent privacy, looks natural
- **6-7**: Good privacy, minor clustering
- **4-5**: Fair privacy, some patterns visible
- **0-3**: Poor privacy, obvious coordination

**What it checks:**
- Time gaps between trades (should vary)
- Amount variation (should be diverse)
- Wallet distribution (no single wallet dominant)

## Wallet Structure

The app generates wallets with different purposes:

1. **Wallet 1 (Primary)**: Provides initial LP
2. **Wallet 2 (Public)**: Known trading wallet
3. **Wallets 3-N (Private)**: Anonymous holdings

All wallets are YOUR wallets, stored locally in `wallets.json`.

## VPN Integration

For additional privacy, enable VPN routing:

```bash
# Install VPN client (example with NordVPN)
brew install nordvpn

# Enable in app settings
VPN_ENABLED=true
VPN_PROVIDER=nordvpn
```

The app will automatically route transactions through different VPN servers.

## Safety Features

### Emergency Stop

Click "Emergency Stop" or create a file named `STOP` in the app directory to immediately halt all pending trades.

### Pre-Flight Checks

Before any live launch, the app verifies:
- All wallets have sufficient MATIC for gas
- Token contract is valid
- LP exists and has liquidity
- Network connectivity is stable

### Testnet First

ALWAYS test on Mumbai before mainnet:
1. Run 100 simulations
2. Find patterns with 8+ privacy score
3. Test with small amounts ($10-50) on mainnet
4. Then run full launch

## File Structure

```
multisite-coordinator-app/
├── src/
│   ├── main.js          # Electron main process
│   └── coordinator.js   # Core trading logic
├── public/
│   ├── index.html       # GUI interface
│   ├── renderer.js      # GUI logic
│   └── styles.css       # Styling
├── wallets.json         # Your wallet private keys (KEEP SECURE!)
├── .env                 # Configuration
└── package.json         # Dependencies
```

## Security Considerations

### Wallet Security

- `wallets.json` contains your private keys
- NEVER commit this file to git
- NEVER share this file
- Back it up securely

### OpSec Best Practices

1. **Use VPN** when executing trades
2. **Test extensively** on Mumbai first
3. **Review privacy scores** before mainnet
4. **Don't tweet/discuss** until after launch
5. **Keep wallets funded** days in advance

## Troubleshooting

### "Insufficient funds" error

- Check all wallets have enough MATIC for gas
- Use "Check Wallets" button to see balances

### "Transaction failed" error

- Increase slippage tolerance
- Check gas prices aren't too high
- Verify token/LP addresses are correct

### Low privacy scores

- Increase timing variance to 0.6-0.8
- Increase amount variance to 0.5-0.7
- Add more wallets (8-10 instead of 5)

## Command Line Interface

### Run simulations

```bash
node src/coordinator.js \
  --network=mumbai \
  --test-mode=true \
  --iterations=100 \
  --num-wallets=5 \
  --total-buy-amount=500
```

### Run live launch

```bash
node src/coordinator.js \
  --network=polygon \
  --test-mode=false \
  --token-address=0xYourToken \
  --lp-address=0xYourLP
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review simulation results for insights
3. Test on Mumbai first
4. Open an issue in the repository

## Additional Documentation

- **QUICKSTART.md** - 5-minute setup guide
- **MARKET_MAKER_GUIDE.md** - Complete Market Maker Bot documentation
- **AUTOMATED_LAUNCH_SYSTEM.md** - Original technical specification

## Disclaimer

This tool is for managing YOUR OWN personal wallets for YOUR OWN token project. You are responsible for:
- Compliance with local regulations
- Security of your private keys
- Proper use of the tool
- Gas fees and transaction costs
- Trading decisions and outcomes

## License

MIT License - See LICENSE file for details

---

**Remember**: Always test on Mumbai testnet first. Start small. Use VPN. Monitor carefully. Keep your keys secure. 🚀
