# AutoFlow Server - Circle Developer-Controlled Wallets Integration

This is the backend server for the AutoFlow DeFi application, providing Circle Developer-Controlled Wallets SDK integration for seamless user onboarding with crypto wallets.

## 🏗️ Architecture

- **Framework**: Express.js with ES6 modules
- **Integration**: Circle Developer-Controlled Wallets SDK
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Circle API key-based

## 📋 Prerequisites

1. **Node.js**: Version 18.0.0 or higher
2. **MongoDB**: Local installation or MongoDB Atlas account
3. **Circle Account**: Sign up at [Circle Developer Console](https://console.circle.com/)
4. **Circle API Key**: Obtain from your Circle dashboard
5. **Entity Secret**: Obtain from Circle dashboard
6. **Testnet Access**: ETH-SEPOLIA, MATIC-AMOY, etc.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
yarn install
```

### 2. Environment Setup

There are two ways to set up environment variables:

#### Option 1: System Environment Variables

Set the environment variables directly in your system:

**Linux/Mac:**
```bash
export CIRCLE_API_KEY=your_circle_api_key_here
export CIRCLE_ENTITY_SECRET=your_circle_entity_secret_here
export MONGODB_URI=mongodb://localhost:27017/autoflow
export PORT=5000
```

**Windows Command Prompt:**
```cmd
set CIRCLE_API_KEY=your_circle_api_key_here
set CIRCLE_ENTITY_SECRET=your_circle_entity_secret_here
set MONGODB_URI=mongodb://localhost:27017/autoflow
set PORT=5000
```

**Windows PowerShell:**
```powershell
$env:CIRCLE_API_KEY="your_circle_api_key_here"
$env:CIRCLE_ENTITY_SECRET="your_circle_entity_secret_here"
$env:MONGODB_URI="mongodb://localhost:27017/autoflow"
$env:PORT="5000"
```

#### Option 2: Environment File (for development)

Create a `.env` file in the server directory with the following variables:

```env
# Circle Developer-Controlled Wallets API Configuration
CIRCLE_API_KEY=your_circle_api_key_here
CIRCLE_ENTITY_SECRET=your_circle_entity_secret_here
CIRCLE_API_BASE_URL=https://api.circle.com

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/autoflow

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Then install dotenv and update your start script:

```bash
yarn add dotenv
```

Add this line at the top of your entry file (src/index.js):
```javascript
import 'dotenv/config'
```

### 3. Start the Server

```bash
# Development mode (with auto-reload)
yarn dev

# Development mode with local MongoDB (uses cross-env)
yarn dev:local

# Production mode
yarn start
```

The server will start on `http://localhost:5000` by default or the port specified in your environment variables.

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns server status and information.

### Circle Wallet Management

#### Create Wallet
```
POST /api/circle/wallets
Content-Type: application/json

{
  "email": "user@example.com",
  "blockchain": "ETH-SEPOLIA"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "walletId": "...",
    "walletSetId": "...",
    "address": "0x...",
    "blockchain": "ETH-SEPOLIA",
    "state": "LIVE",
    "accountType": "EOA",
    "custodyType": "DEVELOPER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "userId": "65f5e26e8a8f5e1234567890"
  }
}
```

#### Get Wallet by ID
```
GET /api/circle/wallets/:walletId
```

#### List Wallets
```
GET /api/circle/wallets?walletSetId=abc123
```

### Transactions

#### Create Transaction
```
POST /api/circle/transaction
Content-Type: application/json

{
  "walletId": "wallet-id-here",
  "destinationAddress": "0x123abc...",
  "amounts": ["0.01"],
  "tokenId": "token-id-here",
  "feeLevel": "MEDIUM"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "transaction-id",
      "status": "PENDING",
      "amounts": ["0.01"],
      "sourceAddress": "0x...",
      "destinationAddress": "0x123abc..."
    }
  }
}
```

### Complete Onboarding
```
POST /api/circle/onboard
Content-Type: application/json

{
  "email": "user@example.com",
  "blockchain": "ETH-SEPOLIA"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User successfully onboarded with Circle Developer-Controlled Wallet",
  "data": {
    "email": "user@example.com",
    "dbId": "65f5e26e8a8f5e1234567890",
    "walletSetId": "...",
    "walletSetName": "WalletSet for user@example.com",
    "walletSetCreatedAt": "2024-01-01T00:00:00.000Z",
    "walletId": "...",
    "walletAddress": "0x...",
    "blockchain": "ETH-SEPOLIA",
    "walletState": "LIVE",
    "accountType": "EOA",
    "custodyType": "DEVELOPER",
    "walletCreatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### MetaMask Registration
```
POST /api/circle/metamask
Content-Type: application/json

{
  "email": "user@example.com",
  "address": "0x123abc..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered with MetaMask successfully",
  "data": {
    "userId": "65f5e26e8a8f5e1234567890",
    "email": "user@example.com",
    "walletAddress": "0x123abc...",
    "signupMethod": "METAMASK",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### User Management

#### Get All Users
```
GET /api/circle/users?page=1&limit=10
```

Returns paginated list of all users in the database.

## 🌐 Frontend Integration

Update your frontend to call the server API:

```javascript
// Update the API base URL to point to your server
const API_BASE_URL = 'http://localhost:3001';

async function onboardUser(email, blockchain = 'ETH-SEPOLIA') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/circle/onboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, blockchain }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Onboarding failed');
    }
  } catch (error) {
    console.error('Error onboarding user:', error);
    throw error;
  }
}
```

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Express-validator for request validation
- **Error Handling**: Structured error responses without sensitive data leakage

## 🔧 Configuration

### Supported Blockchains
- `ETH-SEPOLIA`: Ethereum Sepolia testnet
- `MATIC-AMOY`: Polygon Amoy testnet
- `AVAX-FUJI`: Avalanche Fuji testnet
- `SOL-DEVNET`: Solana devnet

## 📁 Project Structure

```
server/
├── src/
│   ├── index.js              # Main server entry point
│   ├── lib/
│   │   ├── circle-api.js     # Circle API integration library
│   │   └── db.js             # MongoDB connection setup
│   ├── models/
│   │   └── User.js           # User and wallet Mongoose models
│   ├── services/
│   │   └── userService.js    # User-related database operations
│   └── routes/
│       └── circle.js         # Circle API route handlers
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🔍 Error Handling

The API returns structured error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created successfully
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid API key)
- `404`: Not Found
- `409`: Conflict (resource already exists)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## 🧪 Testing

### Manual Testing with curl

```bash
# Health check
curl http://localhost:3001/health

# Test user onboarding
curl -X POST http://localhost:3001/api/circle/onboard \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "blockchain": "ETH-SEPOLIA"}'

# Get user information
curl http://localhost:3001/api/circle/users/test@example.com

# Get user wallets
curl http://localhost:3001/api/circle/users/test@example.com/wallets
```

## 🚀 Deployment

### Development
```bash
yarn dev
```

### Production
```bash
yarn start
```

### Using PM2 (Recommended for production)
```bash
npm install -g pm2
pm2 start src/index.js --name "autoflow-server"
pm2 startup
pm2 save
```

## 📚 Next Steps

1. **Deploy the server** to your preferred hosting platform
2. **Update frontend** to use the server endpoints
3. **Implement authentication** for your API routes if needed
4. **Add database integration** for user state management
5. **Set up monitoring** and logging for production

## 🆘 Support

- **Circle Documentation**: https://developers.circle.com/
- **Circle API Reference**: https://developers.circle.com/api-reference/
- **Express.js Documentation**: https://expressjs.com/

## 📄 License

MIT 