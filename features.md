# AETERNA DRAMA C2 - Feature Manifest (V2.0.0)

This document serves as the official Source of Truth for the Portfolio Drama Bot suite capabilities, scenarios, and guardrails.

## Scenarios (Offensive & Intel) - Count: 3

| ID | Name | Description | Status |
|----|------|-------------|--------|
| s1 | OS-Aware Persistence | Delivers OS-specific dropper scripts (systemd/powershell) for persistence. | **Actionable** |
| s2 | Arbitrage Vectoring | Real-time identification of exploitable arbitrage/front-run opportunities. | **Actionable** |
| s3 | Dynamic Discovery | Automatically identifies and targets new liquidity pools from DEX factories. | **Autonomous** |

## SOC Alerts (Defensive) - Count: 1

| ID | Name | Description | Severity |
|----|------|-------------|----------|
| INC-1 | Whale Liquidity Alert | Triggered on high-value transactions hitting monitored contracts. | **HIGH** |

## Guardrails (Policy) - Count: 2

| ID | Name | Description | Type |
|----|------|-------------|------|
| POLICY-1 | Execution Sandbox | Prevents offensive payload execution on restricted IP ranges. | **Mandatory** |
| POLICY-2 | Behavioral Guardrail | Rate-limits command issuance (3/min) to prevent Command Storms. | **Active** |

## Advanced Logic Implementation
- [x] VPN Relay (Actionable Subprocess)
- [x] Social Graph Analysis (Weighted Dijkstra)
- [x] Mempool Sniffing (Dynamic Discovery Targets)
- [x] C2 Coordination (OS-Specific Payloads)
- [x] Covert Channels (Jittered WebSockets)
