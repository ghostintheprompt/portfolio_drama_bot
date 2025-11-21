# Quick Start Guide

Get your PCC Token Coordinator running in 5 minutes.

## Step 1: Install Dependencies

```bash
cd multisite-coordinator-app
npm install
```

## Step 2: Get Mumbai Test MATIC

1. Go to https://faucet.polygon.technology/
2. Enter your wallet addresses (app will show them)
3. Request test MATIC (free)

## Step 3: Deploy Test Token (Optional)

If you want to test with a real token:

```bash
# Install Hardhat
npm install --save-dev hardhat

# Deploy test token
npx hardhat run scripts/deploy.js --network mumbai
```

Or use an existing Mumbai testnet token for testing.

## Step 4: Configure App

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

Set these values:
```
NETWORK=mumbai
TOKEN_ADDRESS=0xYourTestToken
LP_ADDRESS=0xYourTestLP
NUM_WALLETS=5
TOTAL_BUY_AMOUNT=100
```

## Step 5: Run First Simulation

```bash
# Start the app
npm run dev
```

In the GUI:
1. Click "Check Wallets" to see your wallets
2. Set iterations to 10
3. Click "Run Simulations"
4. Look for privacy scores 8+

## Step 6: Analyze Results

Review the simulation results:
- **Privacy Score 8-10**: ✅ Excellent, ready for mainnet
- **Privacy Score 6-7**: ⚠️ Good, but tweak settings
- **Privacy Score 0-5**: ❌ Adjust timing/amount variance

## Step 7: Optimize Settings

If privacy scores are low:

1. **Increase Timing Variance**: 0.5 → 0.7
2. **Increase Amount Variance**: 0.5 → 0.7
3. **Add More Wallets**: 5 → 8
4. **Run more simulations**: 10 → 50

## Step 8: Test with Small Amount

Before full launch, test with a tiny amount:

```bash
# In .env
NETWORK=polygon
TOTAL_BUY_AMOUNT=10  # Just $10
```

This verifies:
- Real transactions work
- Gas fees are acceptable
- Slippage settings are correct

## Step 9: Full Launch

When ready:

1. Set your real launch parameters
2. Set launch time (future timestamp)
3. Review the schedule
4. Click "Start Live Launch"
5. Monitor progress

## Common Issues

### "Insufficient funds"
- Get more test MATIC from faucet
- Check all wallets have balance

### "Transaction failed"
- Increase slippage (if needed)
- Check gas prices
- Verify token address

### Low privacy scores
- Increase both variance settings
- Use more wallets
- Spread over longer time window

## Next Steps

After successful Mumbai testing:

1. Deploy your real token on Polygon
2. Create liquidity pool
3. Run final simulations with real amounts
4. Execute mainnet launch
5. Monitor results

## VPN Setup (Optional but Recommended)

### NordVPN

```bash
# Install
brew install nordvpn

# Login
nordvpn login

# Enable in app
VPN_ENABLED=true
VPN_PROVIDER=nordvpn
```

### Mullvad

```bash
# Install
brew install mullvad-vpn

# Configure account
mullvad account set YOUR_ACCOUNT_NUMBER

# Enable in app
VPN_ENABLED=true
VPN_PROVIDER=mullvad
```

### ExpressVPN

```bash
# Install from expressvpn.com
# Activate account

# Enable in app
VPN_ENABLED=true
VPN_PROVIDER=expressvpn
```

## Security Checklist

Before mainnet launch:

- [ ] Tested on Mumbai testnet
- [ ] Privacy scores consistently 8+
- [ ] All wallets funded in advance
- [ ] VPN enabled and tested
- [ ] Launch time set correctly
- [ ] Emergency stop button tested
- [ ] wallets.json backed up securely
- [ ] No public discussion of launch timing

## Tips for Success

1. **Test extensively**: Run 50-100 simulations
2. **Start small**: First mainnet test with $10-50
3. **Use VPN**: Route through different servers
4. **Be patient**: Spread over 6-12 hours
5. **Monitor**: Watch the dashboard during launch
6. **Stay quiet**: Don't announce until after

## Support

If you run into issues:

1. Check the full README.md
2. Review error messages in status log
3. Test on Mumbai first
4. Verify all addresses are correct
5. Check wallet balances

---

**Ready to launch?** Start with simulations on Mumbai and work your way up to mainnet! 🚀
