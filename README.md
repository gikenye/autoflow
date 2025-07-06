
# 🌀 AutoFlow

AutoFlow is a smart DeFi wallet that lets users **earn, manage, and spend yield** — all without needing to understand crypto.

It combines the power of **Circle**, **Aave**, and the **MetaMask SDK** to create a frictionless experience that feels like a digital neobank with yield-earning and spendable balances.

---

## 🚀 What It Does

1. **Email Sign-Up (via Circle)**  
   Users onboard with just an email — no seed phrase, no MetaMask required.

2. **Auto-Deposit to Aave**  
   Deposited USDC is routed to Aave to generate real-time yield.

3. **Simulated MetaMask Card**  
   Users can simulate spending their earnings using a "MetaMask Card" interface powered by MetaMask SDK and Circle smart wallets.

4. **Jargon-Free UI/UX**  
   Built to feel like a normal finance app — no crypto lingo, no Web3 overload.

---

## 🔧 Tech Stack

| Layer         | Technology                                |
|--------------|--------------------------------------------|
| **Smart Contract** | Solidity (Aave v3 + custom logic)       |
| **Frontend**       | React, TailwindCSS                     |
| **Backend**        | Node.js (Next.js API routes)           |
| **Wallets**        | Circle Programmable Wallets SDK        |
| **Card Utility**   | MetaMask SDK (for simulation & linking)|
| **Chain**          | Ethereum Sepolia (Testnet)             |

---

## 🔗 Integrations

- **Circle Developer-Controlled Wallets**  
  For user onboarding, custody, and off-chain wallet management using USDC.

- **Aave v3**  
  To generate yield using pooled USDC from users.

- **MetaMask SDK**  
  For connecting MetaMask wallets and simulating card-like spending experiences.

---

## 🏗 Features

- ✅ Email-based onboarding via Circle
- ✅ Supply and withdraw USDC from Aave
- ✅ Simulated MetaMask Card spend from yield
- ✅ Friendly, mobile-optimized UI
- ✅ Admin dashboard to monitor yield and transfers

---

## ⚙️ How It Works

1. **User signs up via Circle**  
   → Auto-creates a Circle wallet (custodial).

2. **User connects MetaMask (optional)**  
   → Links a public EVM wallet for simulation.

3. **USDC deposited**  
   → Sent to AutoFlow contract and supplied to Aave.

4. **Yield simulation begins**  
   → Backend fetches Aave data or mocks simulated yield based on time and principal.

5. **User “spends” yield via MetaMask Card**  
   → Transfers simulated yield to a Circle wallet designated as `circleMetaMaskCard`.

---

## 📁 Directory Structure

```
/contracts           # Solidity contracts (Aave interactions)
/pages/api           # API routes (Circle, transfers)
/components          # React UI components
/lib                 # Circle SDK helpers
/hooks               # Custom React hooks (wallets, contract)
/public              # Static assets
```

---

## 🛠 Setup Instructions

1. **Clone the repo**

   ```bash
   git clone https://github.com/gikenye/autoflow.git
   cd autoflow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Add environment variables**

   Create a `.env.local` file:

   ```ini
   CIRCLE_API_KEY=your_circle_key
   CIRCLE_TREASURY_WALLET_ID=your_treasury_wallet_id
   CONTRACT_ADDRESS=your_deployed_contract_address
   ALCHEMY_API_KEY=your_alchemy_key
   ```

4. **Run locally**

   ```bash
   npm run dev
   ```

---

## 🧠 Challenges

- Bridging off-chain Circle logic with on-chain Aave yield flows  
- Making DeFi UX friendly for non-crypto users  
- Simulating a card-like experience without issuing real cards  

---

## 🏁 What’s Next

- Real on-chain card issuing (via MetaMask Snaps or Visa partners)  
- Real-time yield tracking via The Graph  
- Yield sharing between users  
- Mobile-native PWA version  

---

## 🤝 Team

Built for the **MetaMask Card Dev Cook-Off**  
By **[Gikenye]**

---

## 📄 License

**MIT**
