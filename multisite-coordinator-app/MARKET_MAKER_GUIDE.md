# Market Maker Bot Guide

Complete guide to using the automated market maker bot for continuous liquidity provision.

## What is Market Making?

Instead of coordinating a one-time launch, the Market Maker Bot runs continuously (24/7) executing buys and sells from YOUR wallets to:

1. **Create volume** - Trades throughout the day create visible on-chain activity
2. **Provide liquidity** - You are both buyer and seller until real traders arrive
3. **Price discovery** - Natural-looking price movement
4. **Attract traders** - Activity brings organic volume

## How It Works

```
You provide: $2,000 total
├─ $1,000 for LP (locked liquidity)
└─ $1,000 for trading (market making capital)

Bot executes:
├─ Buy $50-150 → Creates +3-7% pump
├─ Wait 5-30 minutes (randomized)
├─ Sell $40-140 → Creates -2-6% dip
└─ Repeat 24/7

Result:
├─ 30-50 trades per day
├─ $1,500-2,500 daily volume
├─ Natural price chart
└─ Attracts real traders
```

## Three Strategies

### 1. Drift Up (Recommended for Launch)

**Goal:** Gradual price appreciation

**How it works:**
- 55% buys, 45% sells (slight buy bias)
- Price drifts up 10-30% over first week
- Creates FOMO as chart shows uptrend

**Best for:**
- Initial launch phase
- Building momentum
- Attracting attention

**Expected outcome:**
- Week 1: +15-25% price increase
- Organic traders start appearing
- Building holder base

### 2. Stable (Recommended for Mature Tokens)

**Goal:** Maintain current price level

**How it works:**
- 50% buys, 50% sells (balanced)
- Price oscillates ±5% around target
- Provides consistent liquidity

**Best for:**
- After initial launch
- When organic volume exists
- Stabilizing price

**Expected outcome:**
- Price stays relatively flat
- Reduced volatility
- Predictable trading

### 3. Volatile (Advanced)

**Goal:** Create excitement with big swings

**How it works:**
- Larger position sizes (up to 2x)
- 50/50 buys/sells but bigger moves
- ±10-20% swings

**Best for:**
- Generating buzz
- Meme token strategies
- High-risk tolerance

**Expected outcome:**
- Wild price action
- Attracts degen traders
- Higher risk/reward

## Configuration Guide

### Trading Capital

**What it is:** Amount dedicated to buying and selling

**Recommended:**
- Minimum: $500
- Optimal: $1,000-2,000
- Maximum: $5,000+

**Why it matters:**
- More capital = bigger trades = more volume
- But: More capital at risk

### Target 24h Volume

**What it is:** Daily volume goal

**Recommended:**
- Small cap: $1,000-2,000/day
- Mid cap: $5,000-10,000/day
- Large cap: $20,000+/day

**Reality check:**
- Your trading capital limits actual volume
- With $1k capital, expect $1.5-2.5k daily volume
- Bot trades multiple times to hit target

### Max Position Size

**What it is:** Maximum single trade amount

**Recommended:**
- Conservative: $50-75
- Moderate: $100-150
- Aggressive: $200-300

**Impact:**
- Smaller = more frequent trades, smoother chart
- Larger = fewer trades, bigger price moves

### Time Between Trades

**What it is:** Randomized wait between transactions

**Recommended:**
- Min: 5-10 minutes
- Max: 20-40 minutes

**Why randomize:**
- Avoids bot-like patterns
- Looks like different traders
- Harder to detect

### Stop Loss

**What it is:** Auto-stop if price drops

**Recommended:**
- Conservative: 20-30%
- Moderate: 30-40%
- Aggressive: 50%

**When it triggers:**
- Immediate stop
- Saves remaining capital
- Prevents catastrophic loss

### Take Profit

**What it is:** Alert when price rises

**Recommended:** 10-20%

**What happens:**
- Just an alert (doesn't auto-stop)
- You decide whether to continue
- Can manually exit position

## Performance Dashboard

### Key Metrics Explained

**Current Price**
- Real-time token price
- Updates with each trade
- Shows % change from start

**Total P&L**
- Unrealized profit/loss
- Includes inventory value
- Doesn't include gas costs

**Total Volume**
- Cumulative trading volume
- All buys + sells combined
- What appears on DexScreener

**Inventory**
- Tokens currently held
- Value in USD
- Needed for selling

**Available Capital**
- USD available to buy
- Needed for buying
- Rebalances automatically

**Gas Costs**
- Total spent on fees
- Mainnet: $20-50/day typically
- Testnet: Free

**Net Profit**
- Total P&L - Gas Costs
- Real profit/loss
- Most important metric

## P&L Scenarios

### Scenario 1: Small Gains (Most Common)

```
Starting capital: $1,000
After 7 days:
├─ Token inventory: $550 (up 10%)
├─ Available capital: $480
├─ Total value: $1,030
├─ Gas costs: $30
└─ Net profit: $0 (broke even)

Strategy working: Building volume, attracting traders
```

### Scenario 2: Price Appreciation

```
Starting capital: $1,000
After 14 days:
├─ Token inventory: $700 (up 40%)
├─ Available capital: $350
├─ Total value: $1,050
├─ Gas costs: $50
└─ Net profit: $0 (broke even)

But: Price up 40%, organic traders arriving
Real profit comes from tokens you held separately
```

### Scenario 3: Successful Market Making

```
Starting capital: $1,000
After 30 days:
├─ Scalping profits: $200
├─ Token appreciation: $150
├─ Total value: $1,350
├─ Gas costs: $100
└─ Net profit: $250 (25% ROI)

Plus: $10k-30k real liquidity from organic traders
This is the ideal outcome
```

### Scenario 4: Stop Loss Triggered

```
Starting capital: $1,000
Price drops 35%:
├─ Stop loss triggered
├─ Remaining value: $700
├─ Gas costs: $20
└─ Net loss: $320 (32% loss)

Saved: $680 instead of losing more
```

## Advanced Features

### Whale Detection

**What it does:**
- Monitors for large trades (>3x your position size)
- Responds intelligently

**When whale buys:**
- Bot buys too (rides momentum)
- Capitalizes on pump

**When whale sells:**
- Bot buys (provides liquidity)
- Absorbs sell pressure
- Stabilizes price

**Enable this:** Yes (default on)

### Auto Rebalancing

**What it does:**
- Maintains 50/50 token/cash balance
- Prevents being over-exposed

**If you have too many tokens (>60%):**
- Forces sells to rebalance
- Reduces risk

**If you have too much cash (>70%):**
- Forces buys to rebalance
- Maintains inventory for selling

**Enable this:** Yes (default on)

## Common Questions

### Q: Will people know it's a bot?

**A:** If configured properly, no. The bot:
- Uses multiple wallets (looks like different people)
- Randomizes timing and amounts
- Trades through VPN (different IPs)
- Simulates human behavior patterns

### Q: Is this profitable?

**A:** Sometimes. Expected outcomes:
- 40% of time: Small profit (5-15%)
- 40% of time: Break even (±5%)
- 20% of time: Small loss (5-15%)

**But:** Main goal is building liquidity, not direct profit.

### Q: How long should I run it?

**A:** Recommended timeline:
- Week 1: Run 24/7
- Week 2: Start reducing (if organic volume appears)
- Week 3-4: Minimal activity, mostly passive
- Month 2+: Turn off, organic liquidity exists

### Q: What if price crashes?

**A:** Stop loss protection:
- Set at 30% by default
- Auto-stops if triggered
- Saves most of capital

### Q: Can I run both Launch Coordinator and Market Maker?

**A:** Yes! Hybrid strategy:
1. Day 1: Launch Coordinator (initial liquidity)
2. Day 1-30: Market Maker Bot (build volume)
3. Best of both approaches

### Q: How much will gas cost?

**A:** Depends on network and activity:
- Mumbai testnet: $0 (free)
- Polygon mainnet: $0.50-2 per trade
- 30-50 trades/day = $15-100/day
- Week 1 gas: $100-700

**Tip:** Test on Mumbai first!

## Best Practices

### Before Starting

1. **Test on Mumbai testnet**
   - Run for 24 hours minimum
   - Verify P&L tracking works
   - Check all features

2. **Start small on mainnet**
   - First run: $100-200 capital
   - Verify everything works
   - Then scale up

3. **Set conservative limits**
   - Stop loss: 30%
   - Max position: $75
   - Min time: 10 minutes

4. **Monitor closely first 24h**
   - Check trades executing properly
   - Watch gas costs
   - Verify P&L calculations

### While Running

1. **Check daily**
   - Review P&L dashboard
   - Monitor for organic trades
   - Adjust settings if needed

2. **Watch for organic volume**
   - Goal: Attract real traders
   - When they arrive: Reduce bot activity
   - Let organic volume take over

3. **Don't panic sell**
   - Bot handles ups and downs
   - Trust the stop loss
   - Give it time to work

4. **Log everything**
   - Save daily screenshots
   - Track metrics over time
   - Learn for next launch

### When to Stop

**Good reasons:**
- Organic volume exceeds bot volume
- Price target achieved
- 30 days completed
- Real liquidity established

**Bad reasons:**
- One bad day
- Small temporary loss
- Impatience

## Troubleshooting

### "Insufficient funds" errors

**Solution:**
- Check all trading wallets have MATIC
- Need 10+ MATIC per wallet for gas
- Refund wallets and restart

### Bot keeps buying, no sells

**Problem:** Inventory empty, nothing to sell

**Solution:**
- Manually send tokens to trading wallets
- Or wait - bot will rebalance naturally

### Price dropping despite bot

**Reality:** Bot can't stop external selling

**Options:**
- Continue (if within stop loss)
- Stop bot, reassess
- Add more buy pressure

### High gas costs

**Solution:**
- Reduce trade frequency (increase min time)
- Reduce position sizes
- Wait for lower gas times

### No organic traders appearing

**Patience:** Usually takes 1-2 weeks

**Boost efforts:**
- Market on Twitter/Telegram
- List on DEX aggregators
- Create content/memes
- Build community

## Success Metrics

### Week 1 Goals

- [ ] 200+ trades executed
- [ ] $5,000-10,000 cumulative volume
- [ ] Price up 10-30% or stable
- [ ] 0-3 organic traders detected
- [ ] Bot running smoothly

### Week 2 Goals

- [ ] 400+ total trades
- [ ] $15,000-25,000 cumulative volume
- [ ] 5-15 organic traders
- [ ] Real holders: 50-100
- [ ] Reducing bot activity

### Month 1 Goals

- [ ] $50,000+ cumulative volume
- [ ] 30-50% organic volume
- [ ] 200-500 holders
- [ ] Real liquidity: $10k-30k
- [ ] Bot mostly passive

### Long-term Success

- [ ] Bot turned off
- [ ] Organic volume sustains itself
- [ ] Healthy liquidity depth
- [ ] Active community
- [ ] Mission accomplished

---

**Remember:** The bot is a tool to bootstrap liquidity. The real success is when you no longer need it because organic trading has taken over. 🚀
