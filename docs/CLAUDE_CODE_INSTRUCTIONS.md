# Claude Code Instructions for GitHub Repositories

## Project Context

You're working on three interconnected web properties:
1. **ghostintheprompt.com** - Technical blog (AI, security, gaming)
2. **mdrn.app** - NFT/literary art platform (467 books, 420+ NFTs)
3. **pcc.quest** - Pizza Connection game (blockchain game with NFT characters)

**Brand Identity:** "From C64 to AI" - The digital pirate ethos, bridging retro computing culture with modern Web3 and AI technology.

---

## Repository Setup Instructions

### For Each Repository, Set Up:

```bash
# Standard .gitignore
node_modules/
.env
.env.local
dist/
build/
.DS_Store
*.log
.vercel
.next/

# For Web3/blockchain projects, also add:
cache/
artifacts/
typechain/
coverage/
```

### Environment Variables Template

Create `.env.example` in each repo:

```env
# API Keys
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Blockchain (for PCC.QUEST and MDRN.APP)
ALCHEMY_API_KEY=your_key_here
WALLET_PRIVATE_KEY=your_key_here
POLYGON_RPC_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=your_contract_address

# Analytics
GA_TRACKING_ID=your_ga_id
HOTJAR_ID=your_hotjar_id

# Email
CONVERTKIT_API_KEY=your_key_here

# Payments
STRIPE_PUBLIC_KEY=your_key_here
STRIPE_SECRET_KEY=your_key_here

# Database (if using)
DATABASE_URL=your_database_url
```

---

## GhostInThePrompt.com - Technical Blog

### Tech Stack Recommendation

**Option 1: Static Site with JAMstack**
```
- Framework: Next.js 14+ (App Router)
- Content: MDX for blog posts
- Styling: Tailwind CSS
- Hosting: Vercel
- CMS: Contentlayer or next-mdx-remote
```

**Option 2: Headless CMS**
```
- Framework: Next.js
- CMS: Sanity.io or Strapi
- Styling: Tailwind CSS
- Hosting: Vercel
```

### Key Features to Implement

1. **Blog System**
   - MDX support for rich content
   - Syntax highlighting for code
   - Table of contents
   - Reading time estimation
   - Series/category organization

2. **SEO Optimization**
   - Dynamic meta tags
   - OpenGraph images
   - JSON-LD schema
   - Sitemap generation
   - RSS feed

3. **Analytics Integration**
   - Google Analytics 4
   - View counter
   - Popular posts widget

4. **Monetization**
   - Affiliate link management
   - Ad placement system (Google AdSense)
   - Sponsored post templates

### File Structure

```
ghostintheprompt/
├── app/
│   ├── (blog)/
│   │   ├── [slug]/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── newsletter/route.ts
│   │   └── analytics/route.ts
│   └── layout.tsx
├── components/
│   ├── Article.tsx
│   ├── SeriesList.tsx
│   └── NewsletterForm.tsx
├── content/
│   └── posts/
│       ├── 2024/
│       │   ├── ai-security-basics.mdx
│       │   └── red-team-ops-intro.mdx
│       └── series.json
├── lib/
│   ├── mdx.ts
│   ├── seo.ts
│   └── analytics.ts
└── public/
    └── images/
```

### Content Templates

**Article Template (content/posts/_template.mdx):**
```mdx
---
title: "Your Title Here"
date: "2024-11-20"
description: "Meta description for SEO"
tags: ["ai", "security", "gaming"]
series: "red-team-operations"
coverImage: "/images/cover.jpg"
affiliateLinks:
  - name: "Product Name"
    url: "https://amazon.com/..."
    disclaimer: true
---

Your content here...

## Section with code

\`\`\`python
# Example code
def example():
    return "Hello World"
\`\`\`

<AffiliateLink product="Product Name" />
```

### Claude Code Commands

```bash
# Set up the project
npm create next-app@latest ghostintheprompt
cd ghostintheprompt

# Install dependencies
npm install contentlayer next-contentlayer gray-matter rehype-prism-plus remark-gfm

# Create content system
mkdir -p content/posts/2024
touch contentlayer.config.ts

# Set up components
mkdir -p components/blog
touch components/blog/Article.tsx
touch components/blog/NewsletterForm.tsx

# Configure Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## MDRN.APP - NFT/Literary Platform

### Tech Stack Recommendation

```
- Framework: Next.js 14+ with App Router
- Web3: wagmi + viem (modern Web3 libraries)
- UI: Tailwind CSS + shadcn/ui
- NFT Data: Alchemy NFT API or Moralis
- Audio: Howler.js
- Hosting: Vercel
```

### Key Features to Implement

1. **NFT Gallery**
   - Grid view with lazy loading
   - Filter by collection
   - Search functionality
   - Individual NFT pages with metadata

2. **Book Library**
   - Free ebook downloads
   - Audiobook player
   - Series organization
   - Reading progress tracking (localStorage)

3. **Web3 Integration**
   - Wallet connection (MetaMask, WalletConnect)
   - Display owned NFTs
   - Token balances ($GHST, $CHOC, $PCC, $DEEZ)
   - Exclusive content for NFT holders

4. **Membership System**
   - Gated content based on NFT ownership
   - Tiered benefits display
   - Subscribe/manage subscription

### File Structure

```
mdrn-app/
├── app/
│   ├── (gallery)/
│   │   ├── nfts/
│   │   │   ├── [contract]/
│   │   │   │   └── [tokenId]/page.tsx
│   │   │   └── page.tsx
│   │   └── collections/page.tsx
│   ├── (books)/
│   │   ├── books/
│   │   │   ├── [slug]/page.tsx
│   │   │   └── page.tsx
│   │   └── audio/page.tsx
│   ├── api/
│   │   ├── nfts/route.ts
│   │   └── books/route.ts
│   └── layout.tsx
├── components/
│   ├── web3/
│   │   ├── ConnectButton.tsx
│   │   ├── NFTCard.tsx
│   │   └── TokenBalance.tsx
│   ├── books/
│   │   ├── BookCard.tsx
│   │   └── AudioPlayer.tsx
│   └── membership/
│       └── TierCard.tsx
├── lib/
│   ├── web3/
│   │   ├── contracts.ts
│   │   └── config.ts
│   └── nft/
│       └── fetchNFTs.ts
├── data/
│   ├── books.json
│   └── collections.json
└── public/
    ├── books/
    └── audio/
```

### Web3 Configuration

**lib/web3/config.ts:**
```typescript
import { createConfig, http } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [polygon],
  connectors: [
    injected(),
    walletConnect({ projectId: 'YOUR_PROJECT_ID' }),
  ],
  transports: {
    [polygon.id]: http(),
  },
})

// Contract addresses
export const CONTRACTS = {
  PCC_CHARACTERS: '0x6774225402abEF5Aa34e80B8e7cbd99B61d8dd80',
  GHST_TOKEN: 'YOUR_GHST_ADDRESS',
  CHOC_TOKEN: 'YOUR_CHOC_ADDRESS',
  PCC_TOKEN: 'YOUR_PCC_ADDRESS',
  DEEZ_TOKEN: 'YOUR_DEEZ_ADDRESS',
}
```

### Claude Code Commands

```bash
# Set up the project
npm create next-app@latest mdrn-app
cd mdrn-app

# Install Web3 dependencies
npm install wagmi viem @tanstack/react-query
npm install @rainbow-me/rainbowkit  # Optional: better wallet UI

# Install UI dependencies
npm install howler @radix-ui/react-dialog class-variance-authority

# Set up data structure
mkdir -p data public/books public/audio
touch data/books.json data/collections.json

# Create Web3 components
mkdir -p components/web3
touch components/web3/ConnectButton.tsx
touch components/web3/NFTGallery.tsx
```

### Books Data Structure (data/books.json)

```json
{
  "books": [
    {
      "id": "book-001",
      "title": "Your Book Title",
      "series": "Horror Collection",
      "genre": ["horror", "gothic"],
      "description": "Book description",
      "coverImage": "/covers/book-001.jpg",
      "formats": {
        "epub": "/books/book-001.epub",
        "pdf": "/books/book-001.pdf",
        "audio": "/audio/book-001.mp3"
      },
      "isPremium": false,
      "requiredNFT": null,
      "publishedDate": "2024-01-01",
      "wordCount": 50000
    }
  ]
}
```

---

## PCC.QUEST - Pizza Connection Game

### Tech Stack Recommendation

```
- Framework: Next.js 14 + React
- Game Logic: Custom state machine or Phaser.js (if complex)
- Web3: wagmi + viem
- State Management: Zustand or React Context
- UI: Tailwind CSS + Framer Motion
- Hosting: Vercel
```

### Key Features to Implement

1. **Game Engine**
   - Story progression system
   - Choice tracking
   - Save/load game state (localStorage + Web3)
   - Branching narrative tree

2. **Character System**
   - NFT character selection
   - Character stats/attributes
   - Special abilities based on rarity

3. **Token Integration**
   - Earn tokens through gameplay
   - Spend tokens for advantages
   - Staking mechanics (optional)

4. **Social Features**
   - Leaderboards
   - Achievement system
   - Share endings

### File Structure

```
pcc-quest/
├── app/
│   ├── game/
│   │   ├── [storyId]/page.tsx
│   │   └── layout.tsx
│   ├── characters/
│   │   ├── [tokenId]/page.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── story/route.ts
│   │   ├── save/route.ts
│   │   └── leaderboard/route.ts
│   └── layout.tsx
├── components/
│   ├── game/
│   │   ├── StoryNode.tsx
│   │   ├── ChoiceButton.tsx
│   │   ├── CharacterStats.tsx
│   │   └── GameUI.tsx
│   ├── web3/
│   │   └── CharacterSelector.tsx
│   └── ui/
│       └── TokenDisplay.tsx
├── lib/
│   ├── game/
│   │   ├── storyEngine.ts
│   │   ├── saveSystem.ts
│   │   └── achievements.ts
│   └── web3/
│       └── contracts.ts
├── data/
│   ├── story/
│   │   ├── intro.json
│   │   ├── chapter1.json
│   │   └── endings.json
│   └── characters/
│       └── stats.json
└── public/
    └── assets/
```

### Story Data Structure (data/story/intro.json)

```json
{
  "nodes": [
    {
      "id": "start",
      "type": "story",
      "title": "The Beginning",
      "content": "You wake up in a pizzeria...",
      "choices": [
        {
          "id": "choice-1",
          "text": "Investigate the kitchen",
          "nextNode": "kitchen-1",
          "requirements": null,
          "consequences": {
            "tokens": 10,
            "stat": "perception"
          }
        },
        {
          "id": "choice-2",
          "text": "Check the front door",
          "nextNode": "door-1",
          "requirements": {
            "minStat": "strength",
            "value": 5
          },
          "consequences": {
            "tokens": 5
          }
        }
      ],
      "image": "/assets/pizzeria-interior.jpg",
      "audio": "/audio/ambience/pizzeria.mp3"
    }
  ]
}
```

### Game Engine (lib/game/storyEngine.ts)

```typescript
export interface StoryNode {
  id: string
  type: 'story' | 'battle' | 'puzzle' | 'ending'
  title: string
  content: string
  choices: Choice[]
  image?: string
  audio?: string
}

export interface Choice {
  id: string
  text: string
  nextNode: string
  requirements?: {
    minStat?: string
    value?: number
    hasNFT?: string
    tokenBalance?: number
  }
  consequences?: {
    tokens?: number
    stat?: string
    statChange?: number
    unlockAchievement?: string
  }
}

export interface GameState {
  currentNode: string
  visitedNodes: string[]
  characterStats: {
    strength: number
    perception: number
    charisma: number
    intelligence: number
  }
  inventory: string[]
  tokenBalance: number
  achievements: string[]
  choices: Record<string, string>
}

export class StoryEngine {
  private state: GameState
  private storyData: Record<string, StoryNode>

  constructor(initialState?: GameState) {
    this.state = initialState || this.getDefaultState()
    this.storyData = {}
  }

  getDefaultState(): GameState {
    return {
      currentNode: 'start',
      visitedNodes: [],
      characterStats: {
        strength: 5,
        perception: 5,
        charisma: 5,
        intelligence: 5,
      },
      inventory: [],
      tokenBalance: 0,
      achievements: [],
      choices: {},
    }
  }

  async loadStory(chapter: string) {
    const response = await fetch(`/api/story/${chapter}`)
    const data = await response.json()
    this.storyData = data.nodes.reduce((acc, node) => {
      acc[node.id] = node
      return acc
    }, {})
  }

  getCurrentNode(): StoryNode {
    return this.storyData[this.state.currentNode]
  }

  canMakeChoice(choice: Choice): boolean {
    if (!choice.requirements) return true

    const { minStat, value, hasNFT, tokenBalance } = choice.requirements

    if (minStat && value) {
      if (this.state.characterStats[minStat] < value) return false
    }

    if (tokenBalance) {
      if (this.state.tokenBalance < tokenBalance) return false
    }

    // Check NFT ownership via Web3
    if (hasNFT) {
      // Implement NFT check
    }

    return true
  }

  makeChoice(choiceId: string) {
    const currentNode = this.getCurrentNode()
    const choice = currentNode.choices.find(c => c.id === choiceId)

    if (!choice) throw new Error('Invalid choice')
    if (!this.canMakeChoice(choice)) throw new Error('Requirements not met')

    // Apply consequences
    if (choice.consequences) {
      const { tokens, stat, statChange, unlockAchievement } = choice.consequences

      if (tokens) this.state.tokenBalance += tokens
      if (stat && statChange) {
        this.state.characterStats[stat] += statChange
      }
      if (unlockAchievement) {
        this.state.achievements.push(unlockAchievement)
      }
    }

    // Update state
    this.state.visitedNodes.push(this.state.currentNode)
    this.state.choices[this.state.currentNode] = choiceId
    this.state.currentNode = choice.nextNode

    return this.getCurrentNode()
  }

  saveGame() {
    localStorage.setItem('pcc-game-save', JSON.stringify(this.state))
  }

  loadGame() {
    const saved = localStorage.getItem('pcc-game-save')
    if (saved) {
      this.state = JSON.parse(saved)
    }
  }
}
```

### Claude Code Commands

```bash
# Set up the project
npm create next-app@latest pcc-quest
cd pcc-quest

# Install dependencies
npm install wagmi viem zustand framer-motion
npm install howler  # for audio

# Optional: Phaser for more complex game mechanics
npm install phaser

# Set up game structure
mkdir -p data/story data/characters
mkdir -p lib/game components/game
mkdir -p public/assets/images public/assets/audio

# Create initial files
touch lib/game/storyEngine.ts
touch lib/game/saveSystem.ts
touch components/game/StoryNode.tsx
touch data/story/intro.json
```

---

## Common Implementation Patterns

### SEO Component (All Sites)

**components/SEO.tsx:**
```typescript
import Head from 'next/head'

interface SEOProps {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  tags?: string[]
}

export function SEO({
  title,
  description,
  image = '/og-image.jpg',
  url,
  type = 'website',
  publishedTime,
  tags,
}: SEOProps) {
  const siteName = 'Your Site Name'
  const fullTitle = `${title} | ${siteName}`

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* OpenGraph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {url && <meta property="og:url" content={url} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {tags && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
    </Head>
  )
}
```

### Newsletter Form (All Sites)

**components/NewsletterForm.tsx:**
```typescript
'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 px-4 py-2 border rounded"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
      {status === 'success' && (
        <p className="text-green-600">Thanks for subscribing!</p>
      )}
      {status === 'error' && (
        <p className="text-red-600">Something went wrong. Try again.</p>
      )}
    </form>
  )
}
```

### Analytics Hook (All Sites)

**lib/analytics.ts:**
```typescript
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
  }
}

export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    })
  }
}

// Usage in components
import { trackEvent } from '@/lib/analytics'

function handleClick() {
  trackEvent('button_click', {
    button_name: 'download_book',
    book_id: 'book-001',
  })
}
```

---

## Development Workflow

### Starting a New Feature

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes
# ...

# Commit with conventional commits
git commit -m "feat: add newsletter subscription"
git commit -m "fix: resolve Web3 connection issue"
git commit -m "docs: update README with setup instructions"

# Push and create PR
git push origin feature/feature-name
```

### Testing Checklist

- [ ] Mobile responsive
- [ ] Web3 wallet connection works
- [ ] SEO meta tags present
- [ ] Analytics events fire correctly
- [ ] Images optimized (WebP, proper sizing)
- [ ] Accessibility (keyboard navigation, ARIA labels)
- [ ] Performance (Lighthouse score >90)

### Deployment

```bash
# Vercel deployment (automatic on push to main)
# Or manual:
vercel deploy --prod

# Environment variables to set in Vercel:
# - All API keys from .env.example
# - NODE_ENV=production
```

---

## Troubleshooting Common Issues

### Web3 Connection Issues

```typescript
// Check network
const { chain } = useAccount()
if (chain?.id !== polygon.id) {
  // Prompt user to switch network
  await switchChain({ chainId: polygon.id })
}
```

### NFT Loading Slow

```typescript
// Implement pagination
const NFTS_PER_PAGE = 24

// Use React Query for caching
import { useQuery } from '@tanstack/react-query'

const { data } = useQuery({
  queryKey: ['nfts', page],
  queryFn: () => fetchNFTs(page),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

---

## Maintenance Tasks

### Weekly
- Review analytics
- Check for broken links
- Monitor API usage/costs
- Respond to community feedback

### Monthly
- Update dependencies: `npm update`
- Review and update content
- Check SEO performance
- Backup data

### Quarterly
- Major dependency updates
- Security audit
- Performance optimization
- Feature planning based on user feedback

---

This should give you everything you need to work efficiently with Claude Code on your repositories!
