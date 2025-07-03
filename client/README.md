# AutoFlow - Smart Spending from Yield

**AutoFlow** helps everyday users deposit USDC, earn yield, and spend from their yield or credit via MetaMask Card with seamless Circle Wallet onboarding.

## 🌟 Features

### 📧 **Welcome & Onboarding**
- Welcome header: "Welcome to AutoFlow – Smart Spending from Yield"
- Email input form to create a Circle Wallet (calls backend API)
- Shows Circle Wallet address + success state once created

### 📊 **Dashboard Page**
- Display wallet address (shortened)
- Available USDC balance (from Circle)
- Yield earned (real-time or mocked)
- Credit line availability
- "Spend Mode" selector:
  - ✅ Spend from Yield
  - ✅ Spend with Credit (if available)
- [Simulate Spend] button

### 💰 **Deposit Page**
- Dropdown to select token (USDC, DAI, ETH)
- Input field for amount
- [Deposit] button with estimated APY (5.2% for USDC)
- Tooltip: "Deposits are routed to yield strategies like Aave"

### 🔁 **Spend Simulation Page**
- Input: Amount to spend
- Show: Available yield
- CTA: [Simulate Card Spend]
- Outcome states:
  - ✅ Success: "You spent $25 from yield"
  - ❌ Error: "Insufficient balance"

### ⚙️ **Credit Settings Page**
- Slider: Set credit utilization (0% to 80%)
- Toggle: "Auto-repay from future yield"
- Health factor visual bar (green/yellow/red)
- Shows: "Current credit limit: $X"

### 📜 **Transaction & Activity Log**
- Timeline view of all transactions
- Filters by action type (Deposit/Spend/Yield/Repay)
- Transaction details with amounts and timestamps

### 💳 **MetaMask Card Section**
- Status: "Card Linked" or "Apply for Card"
- Button: [Spend Using Card]
- Links to MetaMask Card application

## 🚀 Getting Started

### Prerequisites
- Node.js 19+ 
- Yarn package manager
- MetaMask browser extension (optional)

### Installation

1. **Clone and install dependencies:**
```bash
# Install client dependencies
cd client
yarn install

# Install server dependencies  
cd ../server
yarn install
```

2. **Environment Setup:**

Create `.env.local` in the `client` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Create `.env` in the `server` directory:
```env
CIRCLE_API_KEY=your_circle_api_key_here
CIRCLE_API_BASE_URL=https://api.circle.com/v1/w3s
PORT=3000
```

3. **Start the development servers:**

```bash
# Terminal 1: Start the backend server
cd server
yarn dev

# Terminal 2: Start the frontend
cd client  
yarn dev
```

4. **Open the application:**
Navigate to [http://localhost:3001](http://localhost:3001) in your browser.

## 📱 Mobile-First Design

AutoFlow is built with a **mobile-first approach**:

- ✅ Responsive design that works on all screen sizes
- ✅ Touch-friendly buttons (minimum 44px touch targets)
- ✅ Large, readable fonts optimized for mobile
- ✅ Bottom navigation for mobile devices
- ✅ Swipe-friendly cards and interactions
- ✅ Green theme (#0BDA51, #C8FACC) for consistency

## 🛠 Technology Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui component library  
- **Backend:** Node.js, Express
- **Wallet Integration:** Circle APIs for programmable wallets
- **MetaMask Integration:** MetaMask SDK for Web3 connectivity

## 🔧 API Integration

### Circle Wallet APIs
- `POST /api/circle/onboard` - Create user and wallet
- `GET /api/circle/users/:userId` - Get user info
- `GET /api/circle/users/:userId/wallets` - Get user wallets

### Mock Data
The application includes realistic mock data for:
- Transaction history
- Yield calculations  
- Credit scores and limits
- MetaMask Card status

## 🎯 Demo Flow

1. **Landing Page:** User sees welcome message and features
2. **Onboarding:** User enters email to create Circle Wallet
3. **Success State:** Shows wallet address and account details
4. **Dashboard:** View balance, yield earned, credit available
5. **Deposit:** Add USDC with yield projections
6. **Spend Simulation:** Test card spending scenarios
7. **Settings:** Configure credit limits and auto-repay
8. **History:** View transaction timeline

## 🏆 MetaMask Card Hackathon

This application was built for the **MetaMask Card Hackathon** with the following key features:

- **Circle Wallet Integration:** Email-based wallet creation
- **MetaMask Card Support:** Spending simulation and card linking
- **Yield-First Spending:** Smart routing of payments
- **Auto-Repay:** Automatic credit repayment from yield
- **Mobile-Optimized UX:** Touch-friendly interface

## 📋 Component Architecture

### Modular Components
- `<WalletOverview />` - Displays wallet info and balances
- `<SpendSimulator />` - Card spending simulation
- `<DepositForm />` - Asset deposit interface  
- `<TransactionLog />` - Transaction history display
- `<AuthModal />` - Wallet connection modal

### Hooks
- `useWallets()` - Wallet connection and management
- `useCircleWallet()` - Circle API integration
- `useMetaMaskWallet()` - MetaMask connectivity

## 🔐 Security Features

- **Circle Security:** Leverages Circle's secure programmable wallets
- **Email Recovery:** Account recovery via email verification
- **Health Factor Monitoring:** Prevents over-leverage
- **Auto-Repay:** Reduces credit risk through automated payments

## 🤝 Contributing

This is a hackathon project. For improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - Built for MetaMask Card Hackathon

---

**AutoFlow** - Earn while you spend, spend while you earn! 🚀 