# PORTFOLIO DRAMA BOT

<div align="center">
  <img src="porfolio_drama_bot.png" width="256" height="256" alt="Portfolio Drama Bot Icon" />
</div>

A professional-grade, Advanced Persistent Threat (APT)-inspired Command and Control (C2) suite for portfolio management, liquidity coordination, and social influence mapping.

![Status: Operational](https://img.shields.io/badge/Status-Operational-00ff41?style=flat-square)
![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue?style=flat-square)
![Stack: React + Express](https://img.shields.io/badge/Stack-React_%2B_Express-00d1ff?style=flat-square)

## Overview

AETERNA DRAMA C2 is a resilient orchestration layer designed to manage distributed trading nodes and influence vectors. By leveraging architectural patterns found in sophisticated network operations, this suite provides unparalleled control over market liquidity and social sentiment.

## Core Systems

### 1. C2 Architecture (Coordinator/Agent)
The core `Coordinator` operates on a beacon-relay model. Edge nodes (proxies/bots) check in via asynchronous beacons.
*   **Jittered Beaconing**: Randomized check-in intervals to prevent pattern detection.
*   **Task Queuing**: Centralized command assignment for distributed execution.
*   **Node Vitality**: Automatic health monitoring and dead-node pruning.

### 2. Mempool Sniffer (Blockchain Intel)
Real-time monitoring of Ethereum/EVM pending transactions.
*   **Whale Detection**: Instant alerts for high-value liquidity movements.
*   **Contract Targets**: Filter transactions hitting specific liquidity pools or smart contracts.
*   **Arbitrage Vectoring**: Identifies potential trading opportunities before they are mined.

### 3. Graph Analyzer (Viral Influence)
A graph-theory engine designed for social engineering.
*   **Influence Mapping**: Maps relationships between social media entities.
*   **Shortest Path to Viral Reach**: Calculates the most efficient path to trigger a viral event through Key Opinion Leaders (KOLs).
*   **Sentiment Vectors**: Evaluates edge weights based on interaction strength.

### 4. Anti-Forensics (Stealth Suite)
Comprehensive privacy layer for automated scrapers and trading nodes.
*   **VPN Relay**: Automated routing through secure exit points.
*   **Fingerprint Spoofing**: Randomized User-Agents, canvas noise, and hardware profiles.
*   **Behavioral Masking**: Anti-bot evasion techniques for modern firewalls.

## Tech Stack

*   **Frontend**: React 19, Tailwind CSS 4, Framer Motion, Lucide Icons, Recharts.
*   **Backend**: Node.js (Express), `ethers.js` v6, TSX.
*   **Communication**: REST API w/ Jittered Beacons.
*   **Database**: In-memory C2 state (Persistence ready).

## Getting Started

### Prerequisites
*   Node.js (LTS)
*   An Ethereum RPC (WebSocket recommended for sniffing)

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/your-org/aeterna-drama-c2.git
    cd aeterna-drama-c2
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment:
    ```bash
    cp .env.example .env
    # Edit .env with your GEMINI_API_KEY and RPC providers
    ```
4.  Launch in development mode:
    ```bash
    npm run dev
    ```

## Usage

### Mission Control
Access the dashboard at `http://localhost:3000`. Use the holographic interface to:
*   Monitor active node beacons.
*   Track live mempool transactions.
*   View VPN relay health and fingerprint status.
*   Assign tasks to edge nodes.

## Security Disclaimer

This software is for educational and authorized research purposes only. The authors take no responsibility for any unauthorized usage. The patterns implemented (C2, Beaconing, Spoofing) are designed to demonstrate high-level architectural resilience in distributed systems.

---
**[MISSION PARAMS: REDACTED]**
