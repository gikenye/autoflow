# AutoFlow Backend Server

This is the backend server for the AutoFlow application, which integrates with Circle API for wallet management and cryptocurrency transactions.

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Create a `.env` file in the server directory with the following variables:
```
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Circle API Configuration
CIRCLE_API_KEY=your_circle_api_key
CIRCLE_API_URL=https://api.circle.com
CIRCLE_ENTITY_SECRET=your_circle_entity_secret

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Security
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h
```

3. Start the server:
```bash
yarn start
```

## MongoDB Configuration

Ensure your MongoDB user has the following permissions:
- `readWrite` access to the database
- `dbAdmin` role if you need to create/modify indexes

If you're using MongoDB Atlas:
1. Go to Database Access in your Atlas dashboard
2. Edit your database user
3. Under "Database User Privileges", ensure the user has at least "readWrite" access to your database
4. Save the changes

## API Endpoints

- `GET /health`: Health check endpoint
- `POST /api/circle/users`: Create a new Circle user
- `POST /api/circle/wallets`: Create a new wallet
- `POST /api/circle/onboard`: Onboard a new user with Circle
- `POST /api/circle/metamask`: Link a MetaMask wallet
- `GET /api/circle/users`: Get all users
- `GET /api/circle/users/:userId`: Get a specific user
- `GET /api/circle/users/:userId/wallets`: Get a user's wallets
- `POST /api/link-wallet`: Link a wallet to a user
- `POST /api/transfer-to-metamask`: Transfer funds to MetaMask
- `GET /api/user-wallets/:userId`: Get a user's wallets
- `POST /api/schedule-auto-topup`: Schedule automatic top-up

## Deployment Notes

When deploying to platforms like Render:
1. Set the `trust proxy` option to handle rate limiting correctly behind proxies
2. Ensure all environment variables are properly configured
3. Check database connection permissions if you encounter access errors 