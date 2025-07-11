
# 🌀 AutoFlow

**AutoFlow** is a smart DeFi wallet that lets users **earn, manage, and spend on-chain yield** — without needing to understand crypto. It’s designed for everyday people who want to grow and use their money digitally, just like with a neobank — but powered by decentralized finance.

Built on **Celo**, AutoFlow supports **Mento stable assets like USDC** to offer fast, low-cost, and mobile-first DeFi experiences to underserved communities.

---

## 🚨 The Problem

Despite the potential of DeFi, most people can't use it. Seed phrases, gas fees, MetaMask popups — it’s too technical. Meanwhile, millions of people in frontier markets are underserved by traditional banking systems and can’t access savings tools that grow their money.

They don’t need more wallets.  
They need **access, simplicity, and usability**.

---

## 💡 The Solution

**AutoFlow** abstracts away crypto complexity into a **simple, seamless digital wallet** experience:

- **Sign up with just an email** — no MetaMask or seed phrase needed
- **Deposit USDC** — stored safely in a Circle custodial wallet
- **Earn real yield via Aave** — funds are auto-deposited to on-chain lending pools
- **Spend the yield** — via a simulated MetaMask Card built into the UI

Under the hood, AutoFlow uses **Celo smart contracts**, **Circle wallets**, and **Mento stablecoins** to deliver a smooth, secure, and affordable experience tailored for mobile-first, real-world users.

---

## 🌍 Real-World Vision

In the long run, **AutoFlow aims to become the DeFi-powered neobank** for users in emerging markets:

- A nurse in rural Kenya can deposit USDC and automatically earn interest.
- She receives a daily or weekly yield summary — visualized simply.
- When she needs to pay for groceries or school fees, she clicks “Spend” and uses the yield from her MetaMask Card balance.
- No tokens. No lingo. Just savings that work.

---

## 🔧 Tech Stack

| Layer             | Technology                              |
|------------------|------------------------------------------|
| **Smart Contracts**   | Solidity, deployed on **Celo testnet**     |
| **Frontend**          | React, TailwindCSS                     |
| **Backend**           | Node.js / Next.js API routes           |
| **Wallets**           | Circle Developer-Controlled Wallets    |
| **Card Utility**      | MetaMask SDK (simulated card interface) |
| **DeFi Yield**        | Aave v3 on Celo                        |
| **Stablecoins**       | Mento USDC (`0x...`)                   |

---

## 🔗 Integrations

- **Circle Wallets**: Custodial wallet creation and treasury management  
- **Aave v3**: Yield generation via USDC lending  
- **MetaMask SDK**: Simulated card-style spend experience  
- **Celo**: Eco-friendly, low-gas Layer 1 optimized for mobile  
- **Mento USDC**: Stable asset for deposits and yield

---

## 🧪 Features

✅ Email onboarding (no crypto wallet needed)  
✅ Automatic yield generation on deposits  
✅ Simulated MetaMask Card to “spend” yield  
✅ Friendly UI for mobile & desktop  
✅ Admin dashboard to monitor yield flow and balances

---

## 🛠 How It Works

1. **User signs up via Circle**  
   → Creates a developer-controlled wallet in the background

2. **User deposits USDC**  
   → Sent to a smart contract and deposited to Aave on Celo

3. **Yield is generated**  
   → Periodically calculated via smart contract or backend logic

4. **User "spends" from card UI**  
   → Transfers balance to a dedicated Circle wallet linked to the card

5. **Optional MetaMask linking**  
   → User can connect a MetaMask wallet for tracking or additional control

---

## 📁 Directory Overview

```
/contracts           # Solidity smart contracts (Aave, Celo logic)
/pages/api           # Backend logic (Circle SDK, transfers)
/components          # React UI (Card, Wallets, Dashboard)
/lib                 # Helper functions for Circle & blockchain
/hooks               # Custom React logic for wallet handling
/public              # Assets, logos, icons
```

---

## ⚙️ Setup Guide

1. **Clone the repo**

   ```bash
   git clone https://github.com/gikenye/autoflow.git
   cd autoflow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   Create `.env.local` with your credentials:

   ```ini
   CIRCLE_API_KEY=your_circle_key
   CIRCLE_TREASURY_WALLET_ID=your_treasury_wallet_id
   CONTRACT_ADDRESS=your_celo_contract
   CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
   ```

4. **Start the project**

   ```bash
   npm run dev
   ```

---

## 🧠 Challenges Faced

- Bridging custodial (Circle) and non-custodial (Celo/Aave) logic  
- Simulating realistic card-like UX without actual card issuance  
- Designing for non-crypto users while using crypto-native infrastructure

---

## 🏁 What’s Next

- Deploy contracts to **Celo mainnet**  
- Real-time yield tracking via **The Graph** or subgraphs  
- Enable **fiat on/off ramps** (e.g. Mobile Money ↔ USDC)  
- Pilot testing in Kenya and Nigeria  
- Explore **Celo dAppStore** integration  
- Work toward **real MetaMask Card** or Visa partnership

---

## 🤝 Built By

**[Gikenye]** — Product-focused dev building inclusive Web3 experiences for everyday Africans.

---

## 📜 License

MIT
