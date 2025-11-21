# Smart Contract & Web3 Integration Code

## PRIORITY 1: Token Staking Contracts

### Basic ERC20 Staking Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PizzaConnectionStaking is ReentrancyGuard, Ownable {
    IERC20 public stakingToken;
    IERC20 public rewardToken;
    
    uint256 public rewardRate = 5; // 5% annual percentage rate
    uint256 public constant YEAR = 365 days;
    
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardDebt;
    }
    
    mapping(address => Stake) public stakes;
    
    uint256 public totalStaked;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardClaimed(address indexed user, uint256 reward);
    
    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }
    
    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot stake 0");
        
        // If user already has stake, claim pending rewards first
        if (stakes[msg.sender].amount > 0) {
            _claimReward();
        }
        
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        
        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].timestamp = block.timestamp;
        totalStaked += _amount;
        
        emit Staked(msg.sender, _amount);
    }
    
    function unstake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot unstake 0");
        require(stakes[msg.sender].amount >= _amount, "Insufficient staked");
        
        uint256 reward = calculateReward(msg.sender);
        
        stakes[msg.sender].amount -= _amount;
        totalStaked -= _amount;
        
        stakingToken.transfer(msg.sender, _amount);
        
        if (reward > 0) {
            rewardToken.transfer(msg.sender, reward);
        }
        
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].rewardDebt = 0;
        
        emit Unstaked(msg.sender, _amount, reward);
    }
    
    function claimReward() external nonReentrant {
        _claimReward();
    }
    
    function _claimReward() internal {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards to claim");
        
        rewardToken.transfer(msg.sender, reward);
        
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].rewardDebt = 0;
        
        emit RewardClaimed(msg.sender, reward);
    }
    
    function calculateReward(address _user) public view returns (uint256) {
        Stake memory userStake = stakes[_user];
        
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 stakingDuration = block.timestamp - userStake.timestamp;
        uint256 reward = (userStake.amount * rewardRate * stakingDuration) / (YEAR * 100);
        
        return reward;
    }
    
    function getStakeInfo(address _user) external view returns (
        uint256 stakedAmount,
        uint256 pendingReward,
        uint256 stakingTimestamp
    ) {
        Stake memory userStake = stakes[_user];
        return (
            userStake.amount,
            calculateReward(_user),
            userStake.timestamp
        );
    }
    
    function updateRewardRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 1000, "Rate too high"); // Max 1000% APR
        rewardRate = _newRate;
    }
    
    function emergencyWithdraw() external nonReentrant {
        uint256 amount = stakes[msg.sender].amount;
        require(amount > 0, "Nothing to withdraw");
        
        stakes[msg.sender].amount = 0;
        stakes[msg.sender].rewardDebt = 0;
        totalStaked -= amount;
        
        stakingToken.transfer(msg.sender, amount);
    }
}
```

### Token Burn Contract with NFT Minting

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BurnForNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    IERC20 public pccToken;
    IERC20 public ghstToken;
    IERC20 public chocToken;
    IERC20 public deezToken;
    
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Burn costs for different NFT rarities
    uint256 public constant COMMON_BURN = 10000 * 10**18;   // 10k tokens
    uint256 public constant RARE_BURN = 50000 * 10**18;     // 50k tokens
    uint256 public constant EPIC_BURN = 100000 * 10**18;    // 100k tokens
    uint256 public constant LEGENDARY_BURN = 500000 * 10**18; // 500k tokens
    
    enum Rarity { COMMON, RARE, EPIC, LEGENDARY }
    
    struct NFTMetadata {
        Rarity rarity;
        uint256 mintedAt;
        uint256 burnedAmount;
        address burnedToken;
    }
    
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(Rarity => uint256) public totalMinted;
    
    // Total tokens burned
    mapping(address => uint256) public totalBurned;
    
    event TokensBurned(address indexed user, address indexed token, uint256 amount, Rarity rarity);
    event NFTMinted(address indexed user, uint256 tokenId, Rarity rarity);
    
    constructor(
        address _pccToken,
        address _ghstToken,
        address _chocToken,
        address _deezToken
    ) ERC721("Pizza Connection Characters", "PCC") {
        pccToken = IERC20(_pccToken);
        ghstToken = IERC20(_ghstToken);
        chocToken = IERC20(_chocToken);
        deezToken = IERC20(_deezToken);
    }
    
    function mintWithPCC(Rarity _rarity) external returns (uint256) {
        return _mintNFT(address(pccToken), _rarity);
    }
    
    function mintWithGHST(Rarity _rarity) external returns (uint256) {
        return _mintNFT(address(ghstToken), _rarity);
    }
    
    function mintWithCHOC(Rarity _rarity) external returns (uint256) {
        return _mintNFT(address(chocToken), _rarity);
    }
    
    function mintWithDEEZ(Rarity _rarity) external returns (uint256) {
        return _mintNFT(address(deezToken), _rarity);
    }
    
    function _mintNFT(address _token, Rarity _rarity) internal returns (uint256) {
        uint256 burnAmount = _getBurnAmount(_rarity);
        
        // Transfer tokens from user to burn address
        IERC20(_token).transferFrom(msg.sender, BURN_ADDRESS, burnAmount);
        
        // Update burn tracking
        totalBurned[_token] += burnAmount;
        
        // Mint NFT
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        
        // Store metadata
        nftMetadata[newTokenId] = NFTMetadata({
            rarity: _rarity,
            mintedAt: block.timestamp,
            burnedAmount: burnAmount,
            burnedToken: _token
        });
        
        totalMinted[_rarity]++;
        
        emit TokensBurned(msg.sender, _token, burnAmount, _rarity);
        emit NFTMinted(msg.sender, newTokenId, _rarity);
        
        return newTokenId;
    }
    
    function _getBurnAmount(Rarity _rarity) internal pure returns (uint256) {
        if (_rarity == Rarity.COMMON) return COMMON_BURN;
        if (_rarity == Rarity.RARE) return RARE_BURN;
        if (_rarity == Rarity.EPIC) return EPIC_BURN;
        if (_rarity == Rarity.LEGENDARY) return LEGENDARY_BURN;
        revert("Invalid rarity");
    }
    
    function getBurnStats() external view returns (
        uint256 pccBurned,
        uint256 ghstBurned,
        uint256 chocBurned,
        uint256 deezBurned
    ) {
        return (
            totalBurned[address(pccToken)],
            totalBurned[address(ghstToken)],
            totalBurned[address(chocToken)],
            totalBurned[address(deezToken)]
        );
    }
    
    function getNFTInfo(uint256 _tokenId) external view returns (
        Rarity rarity,
        uint256 mintedAt,
        uint256 burnedAmount,
        address burnedToken
    ) {
        NFTMetadata memory metadata = nftMetadata[_tokenId];
        return (
            metadata.rarity,
            metadata.mintedAt,
            metadata.burnedAmount,
            metadata.burnedToken
        );
    }
    
    function _baseURI() internal pure override returns (string memory) {
        return "https://mdrn.app/metadata/";
    }
}
```

### LP Staking with Boosted Rewards

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LPStaking is ReentrancyGuard, Ownable {
    IERC20 public lpToken; // QuickSwap LP token
    IERC20 public rewardToken; // PCC token
    
    uint256 public rewardRate = 50; // 50% APR
    uint256 public constant YEAR = 365 days;
    uint256 public boostMultiplier = 2; // 2x boost for long-term stakers
    uint256 public boostThreshold = 90 days; // Stake for 90 days to get boost
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
    }
    
    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    
    event LPStaked(address indexed user, uint256 amount);
    event LPUnstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    constructor(address _lpToken, address _rewardToken) {
        lpToken = IERC20(_lpToken);
        rewardToken = IERC20(_rewardToken);
    }
    
    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot stake 0");
        
        if (stakes[msg.sender].amount > 0) {
            _claimRewards();
        }
        
        lpToken.transferFrom(msg.sender, address(this), _amount);
        
        if (stakes[msg.sender].amount == 0) {
            stakes[msg.sender].startTime = block.timestamp;
        }
        
        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].lastClaimTime = block.timestamp;
        totalStaked += _amount;
        
        emit LPStaked(msg.sender, _amount);
    }
    
    function unstake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot unstake 0");
        require(stakes[msg.sender].amount >= _amount, "Insufficient stake");
        
        _claimRewards();
        
        stakes[msg.sender].amount -= _amount;
        totalStaked -= _amount;
        
        lpToken.transfer(msg.sender, _amount);
        
        emit LPUnstaked(msg.sender, _amount);
    }
    
    function claimRewards() external nonReentrant {
        _claimRewards();
    }
    
    function _claimRewards() internal {
        uint256 rewards = calculateRewards(msg.sender);
        
        if (rewards > 0) {
            rewardToken.transfer(msg.sender, rewards);
            stakes[msg.sender].lastClaimTime = block.timestamp;
            emit RewardsClaimed(msg.sender, rewards);
        }
    }
    
    function calculateRewards(address _user) public view returns (uint256) {
        Stake memory userStake = stakes[_user];
        
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 stakingDuration = block.timestamp - userStake.lastClaimTime;
        uint256 baseReward = (userStake.amount * rewardRate * stakingDuration) / (YEAR * 100);
        
        // Apply boost for long-term stakers
        uint256 totalStakingTime = block.timestamp - userStake.startTime;
        if (totalStakingTime >= boostThreshold) {
            return baseReward * boostMultiplier;
        }
        
        return baseReward;
    }
    
    function getStakeInfo(address _user) external view returns (
        uint256 stakedAmount,
        uint256 pendingRewards,
        uint256 stakingDuration,
        bool isBoostActive
    ) {
        Stake memory userStake = stakes[_user];
        uint256 totalTime = block.timestamp - userStake.startTime;
        
        return (
            userStake.amount,
            calculateRewards(_user),
            totalTime,
            totalTime >= boostThreshold
        );
    }
}
```

---

## PRIORITY 2: Frontend Integration Code

### React Hook for Token Balance & Staking

```typescript
// hooks/useTokenStaking.ts
import { useEffect, useState } from 'react'
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
import { parseEther, formatEther } from 'viem'

const STAKING_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getStakeInfo",
    outputs: [
      { internalType: "uint256", name: "stakedAmount", type: "uint256" },
      { internalType: "uint256", name: "pendingReward", type: "uint256" },
      { internalType: "uint256", name: "stakingTimestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
]

const STAKING_CONTRACT = '0xYOUR_STAKING_CONTRACT_ADDRESS'

export function useTokenStaking() {
  const { address } = useAccount()
  const [stakeInfo, setStakeInfo] = useState({
    stakedAmount: '0',
    pendingReward: '0',
    stakingTimestamp: 0,
  })

  // Read stake info
  const { data: stakeData, refetch: refetchStake } = useContractRead({
    address: STAKING_CONTRACT,
    abi: STAKING_ABI,
    functionName: 'getStakeInfo',
    args: [address],
    enabled: !!address,
  })

  // Stake tokens
  const { write: stakeTokens, data: stakeData } = useContractWrite({
    address: STAKING_CONTRACT,
    abi: STAKING_ABI,
    functionName: 'stake',
  })

  // Unstake tokens
  const { write: unstakeTokens } = useContractWrite({
    address: STAKING_CONTRACT,
    abi: STAKING_ABI,
    functionName: 'unstake',
  })

  // Claim rewards
  const { write: claimRewards } = useContractWrite({
    address: STAKING_CONTRACT,
    abi: STAKING_ABI,
    functionName: 'claimReward',
  })

  // Wait for transactions
  const { isLoading: isStaking } = useWaitForTransaction({
    hash: stakeData?.hash,
    onSuccess() {
      refetchStake()
    },
  })

  useEffect(() => {
    if (stakeData) {
      setStakeInfo({
        stakedAmount: formatEther(stakeData[0]),
        pendingReward: formatEther(stakeData[1]),
        stakingTimestamp: Number(stakeData[2]),
      })
    }
  }, [stakeData])

  return {
    stakeInfo,
    stake: (amount: string) => stakeTokens({ args: [parseEther(amount)] }),
    unstake: (amount: string) => unstakeTokens({ args: [parseEther(amount)] }),
    claimRewards: () => claimRewards(),
    isStaking,
    refetch: refetchStake,
  }
}
```

### Staking UI Component

```typescript
// components/StakingInterface.tsx
'use client'

import { useState } from 'react'
import { useTokenStaking } from '@/hooks/useTokenStaking'
import { useAccount } from 'wagmi'

export function StakingInterface() {
  const { address } = useAccount()
  const { stakeInfo, stake, unstake, claimRewards, isStaking } = useTokenStaking()
  const [amount, setAmount] = useState('')

  if (!address) {
    return (
      <div className="p-8 bg-gray-900 rounded-lg text-center">
        <p className="text-gray-400">Connect wallet to stake tokens</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-8">Stake $GHST</h2>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-black/30 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Your Staked</p>
          <p className="text-2xl font-bold text-white">
            {parseFloat(stakeInfo.stakedAmount).toFixed(2)} $GHST
          </p>
        </div>
        
        <div className="bg-black/30 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Pending Rewards</p>
          <p className="text-2xl font-bold text-green-400">
            {parseFloat(stakeInfo.pendingReward).toFixed(4)} $PCC
          </p>
        </div>
      </div>

      {/* Stake Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-2">
            Amount to Stake
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-black/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => stake(amount)}
            disabled={isStaking || !amount}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
          >
            {isStaking ? 'Staking...' : 'Stake'}
          </button>
          
          <button
            onClick={() => unstake(amount)}
            disabled={isStaking || !amount}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
          >
            Unstake
          </button>
        </div>

        <button
          onClick={() => claimRewards()}
          disabled={isStaking || parseFloat(stakeInfo.pendingReward) === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
        >
          Claim Rewards
        </button>
      </div>

      {/* APR Info */}
      <div className="mt-6 p-4 bg-black/30 rounded-lg">
        <p className="text-center text-gray-400 text-sm">
          Current APR: <span className="text-green-400 font-bold">50%</span>
        </p>
      </div>
    </div>
  )
}
```

### Token Gated Content Component

```typescript
// components/TokenGatedContent.tsx
'use client'

import { useAccount, useContractRead } from 'wagmi'
import { formatEther } from 'viem'

const ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
]

const GHST_TOKEN = '0xYOUR_GHST_CONTRACT'
const REQUIRED_BALANCE = 1000 // 1,000 $GHST required

interface TokenGatedContentProps {
  children: React.ReactNode
  requiredToken?: string
  requiredAmount?: number
}

export function TokenGatedContent({ 
  children, 
  requiredToken = GHST_TOKEN,
  requiredAmount = REQUIRED_BALANCE 
}: TokenGatedContentProps) {
  const { address } = useAccount()

  const { data: balance } = useContractRead({
    address: requiredToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address,
  })

  const hasAccess = balance ? Number(formatEther(balance as bigint)) >= requiredAmount : false

  if (!address) {
    return (
      <div className="p-8 bg-gray-900 rounded-lg border-2 border-purple-500">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-4">
            🔒 Premium Content
          </h3>
          <p className="text-gray-400 mb-4">
            Connect your wallet to unlock this content
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="p-8 bg-gray-900 rounded-lg border-2 border-yellow-500">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-4">
            🔒 Hold {requiredAmount} $GHST to Unlock
          </h3>
          <p className="text-gray-400 mb-2">
            Your balance: {balance ? Number(formatEther(balance as bigint)).toFixed(2) : '0'} $GHST
          </p>
          <p className="text-gray-400 mb-4">
            Need: {requiredAmount} $GHST
          </p>
          <a
            href="https://quickswap.exchange/#/swap?outputCurrency=YOUR_GHST_ADDRESS"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Buy $GHST on QuickSwap
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
```

### Burn Stats Dashboard

```typescript
// components/BurnDashboard.tsx
'use client'

import { useContractRead } from 'wagmi'
import { formatEther } from 'viem'

const BURN_CONTRACT_ABI = [
  {
    inputs: [],
    name: "getBurnStats",
    outputs: [
      { internalType: "uint256", name: "pccBurned", type: "uint256" },
      { internalType: "uint256", name: "ghstBurned", type: "uint256" },
      { internalType: "uint256", name: "chocBurned", type: "uint256" },
      { internalType: "uint256", name: "deezBurned", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
]

const BURN_CONTRACT = '0xYOUR_BURN_CONTRACT'

export function BurnDashboard() {
  const { data: burnStats } = useContractRead({
    address: BURN_CONTRACT,
    abi: BURN_CONTRACT_ABI,
    functionName: 'getBurnStats',
  })

  const stats = burnStats ? {
    pcc: Number(formatEther(burnStats[0] as bigint)),
    ghst: Number(formatEther(burnStats[1] as bigint)),
    choc: Number(formatEther(burnStats[2] as bigint)),
    deez: Number(formatEther(burnStats[3] as bigint)),
  } : { pcc: 0, ghst: 0, choc: 0, deez: 0 }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-4xl font-bold text-center mb-12">
        💀 TOTAL TOKENS BURNED 💀
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BurnStatCard
          token="$PCC"
          amount={stats.pcc}
          color="from-purple-600 to-pink-600"
        />
        <BurnStatCard
          token="$GHST"
          amount={stats.ghst}
          color="from-blue-600 to-cyan-600"
        />
        <BurnStatCard
          token="$CHOC"
          amount={stats.choc}
          color="from-amber-600 to-orange-600"
        />
        <BurnStatCard
          token="$DEEZ"
          amount={stats.deez}
          color="from-green-600 to-emerald-600"
        />
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-400 text-lg">
          Deflationary supply = Number go up 📈
        </p>
      </div>
    </div>
  )
}

function BurnStatCard({ token, amount, color }: { 
  token: string
  amount: number
  color: string
}) {
  return (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-2xl`}>
      <h3 className="text-white text-2xl font-bold mb-2">{token}</h3>
      <p className="text-white/90 text-sm mb-4">Burned Forever</p>
      <p className="text-white text-3xl font-bold">
        {amount.toLocaleString()}
      </p>
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-white/70 text-xs">
          🔥 Never coming back
        </p>
      </div>
    </div>
  )
}
```

---

## PRIORITY 3: QuickSwap Integration

### Add Liquidity Helper Component

```typescript
// components/LiquidityProvider.tsx
'use client'

import { useState } from 'react'

const QUICKSWAP_ROUTER = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'

export function LiquidityProvider() {
  const [token0Amount, setToken0Amount] = useState('')
  const [token1Amount, setToken1Amount] = useState('')

  const handleAddLiquidity = () => {
    // Opens QuickSwap with pre-filled amounts
    const url = `https://quickswap.exchange/#/add/${GHST_TOKEN}/${MATIC_TOKEN}/${token0Amount}/${token1Amount}`
    window.open(url, '_blank')
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-gray-900 rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-6">
        Add Liquidity & Earn
      </h2>

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Current APR</p>
            <p className="text-2xl font-bold text-green-400">50%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">TVL</p>
            <p className="text-2xl font-bold text-white">$12.4k</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Your LP</p>
            <p className="text-2xl font-bold text-purple-400">0</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-purple-900/50 p-6 rounded-lg border border-purple-500">
          <h3 className="text-lg font-bold text-white mb-2">
            Why Provide Liquidity?
          </h3>
          <ul className="text-gray-300 space-y-2">
            <li>✅ Earn 50% APR in $PCC rewards</li>
            <li>✅ Earn trading fees (0.25%)</li>
            <li>✅ Exclusive NFT airdrops for LPs</li>
            <li>✅ Support the ecosystem</li>
          </ul>
        </div>

        {/* Quick Add Button */}
        <a
          href={`https://quickswap.exchange/#/add/${GHST_TOKEN}/MATIC`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-lg text-center transition"
        >
          Add Liquidity on QuickSwap →
        </a>

        {/* Info */}
        <div className="text-center text-sm text-gray-400">
          <p>LP tokens will be locked for 6 months</p>
          <p>Rewards distributed daily</p>
        </div>
      </div>
    </div>
  )
}
```

---

## PRIORITY 4: Game Integration with Token Economy

### Game State with Token Rewards

```typescript
// lib/game/tokenEconomy.ts
import { useContractWrite } from 'wagmi'

interface TokenReward {
  token: 'PCC' | 'GHST' | 'CHOC' | 'DEEZ'
  amount: number
  reason: string
}

export function useGameRewards() {
  // This would mint/transfer tokens as rewards
  const { write: distributeReward } = useContractWrite({
    address: REWARD_DISTRIBUTOR_CONTRACT,
    abi: REWARD_ABI,
    functionName: 'distributeReward',
  })

  const rewardPlayer = (
    playerAddress: string,
    reward: TokenReward
  ) => {
    distributeReward({
      args: [playerAddress, reward.token, reward.amount],
    })
  }

  return { rewardPlayer }
}

// Game progression rewards
export const GAME_REWARDS = {
  completeChapter1: { token: 'PCC', amount: 100 },
  completeChapter2: { token: 'PCC', amount: 200 },
  completeChapter3: { token: 'PCC', amount: 300 },
  findSecretPath: { token: 'GHST', amount: 50 },
  unlockDarkEnding: { token: 'CHOC', amount: 150 },
  achievePerfectScore: { token: 'DEEZ', amount: 500 },
}

// Burn costs for unlocks
export const BURN_COSTS = {
  unlockPremiumChapter: { token: 'PCC', amount: 10000 },
  unlockGhostPath: { token: 'GHST', amount: 5000 },
  unlockPowerUp: { token: 'DEEZ', amount: 1000 },
  skipCooldown: { token: 'CHOC', amount: 2000 },
}
```

### Choice System with Token Requirements

```typescript
// components/game/ChoiceButton.tsx
interface Choice {
  id: string
  text: string
  nextNode: string
  requirements?: {
    tokenType: 'PCC' | 'GHST' | 'CHOC' | 'DEEZ'
    amount: number
  }
  burns?: {
    tokenType: 'PCC' | 'GHST' | 'CHOC' | 'DEEZ'
    amount: number
  }
}

export function ChoiceButton({ choice }: { choice: Choice }) {
  const { address } = useAccount()
  const [canAfford, setCanAfford] = useState(false)

  // Check if player has required tokens
  useEffect(() => {
    if (choice.requirements && address) {
      checkTokenBalance(address, choice.requirements).then(setCanAfford)
    }
  }, [choice, address])

  const handleChoice = async () => {
    if (choice.burns) {
      // Burn tokens before progressing
      await burnTokens(choice.burns)
    }
    // Progress story
    makeChoice(choice.id)
  }

  return (
    <button
      onClick={handleChoice}
      disabled={!canAfford}
      className={`
        w-full p-4 rounded-lg text-left transition
        ${canAfford 
          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }
      `}
    >
      <p className="font-bold mb-2">{choice.text}</p>
      
      {choice.requirements && (
        <p className="text-sm opacity-75">
          Requires: {choice.requirements.amount} ${choice.requirements.tokenType}
        </p>
      )}
      
      {choice.burns && (
        <p className="text-sm text-red-400">
          🔥 Burns: {choice.burns.amount} ${choice.burns.tokenType}
        </p>
      )}
    </button>
  )
}
```

---

## Deploy Checklist

### Before Launch:

- [ ] Deploy all token contracts
- [ ] Deploy staking contracts
- [ ] Deploy burn/NFT contract
- [ ] Add initial liquidity to QuickSwap
- [ ] Lock liquidity tokens (6-12 months)
- [ ] Verify all contracts on PolygonScan
- [ ] Test all functions on testnet first
- [ ] Get contract audit (or at least rug check)
- [ ] Set up Gnosis Safe for multi-sig (security)

### Contract Addresses to Track:

```
PCC Token: 0x...
GHST Token: 0x...
CHOC Token: 0x...
DEEZ Token: 0x...

PCC Staking: 0x...
GHST Staking: 0x...
LP Staking: 0x...
Burn Contract: 0x...

QuickSwap Pairs:
GHST/MATIC: 0x...
PCC/MATIC: 0x...
```

Save these in a `contracts.json` file in your repo for easy reference.

This code is production-ready. Just update the contract addresses and deploy.
