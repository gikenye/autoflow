# AutoFlow DeFi - Circle Programmable Wallets Integration

A complete DeFi application built with **modular architecture** featuring email-based wallet onboarding using Circle Programmable Wallets.

## 🏗️ Architecture

This project uses a **separated client-server architecture** for better maintainability and security:

```
workspace/
├── client/          # Next.js React Frontend
├── server/          # Express.js Backend with Circle API
└── README.md        # This file
```

### 🎯 Why Separated Architecture?

✅ **Security**: Circle API keys stay server-side only  
✅ **Scalability**: Independent scaling of frontend and backend  
✅ **Maintainability**: Clear separation of concerns  
✅ **Deployment**: Deploy frontend and backend independently  
✅ **Development**: Teams can work independently on each part  

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd server
yarn install
# Set up your .env file with Circle API credentials
yarn dev
```
Server runs on `http://localhost:3001`

### 2. Start the Frontend
```bash
cd client
yarn install
# Set up your .env.local file
yarn dev
```
Frontend runs on `http://localhost:3000`

### 3. Test the Integration
Visit `http://localhost:3000` and use the onboarding form to create a Circle wallet.

## 📁 Project Structure

### Backend (`/server`)
- **Express.js** server with Circle API integration
- **RESTful API** endpoints for wallet operations
- **Security middleware** (helmet, CORS, rate limiting)
- **Input validation** and error handling
- **Circle API utilities** for user and wallet management

### Frontend (`/client`)
- **Next.js** React application
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Client utilities** for API communication

## 🔗 API Endpoints

The server provides these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `POST` | `/api/circle/users` | Create Circle user |
| `POST` | `/api/circle/wallets` | Create USDC wallet |
| `POST` | `/api/circle/onboard` | Complete onboarding (recommended) |
| `GET` | `/api/circle/users/:id` | Get user info |
| `GET` | `/api/circle/users/:id/wallets` | Get user wallets |

## 🛠️ Environment Setup

### Server (`.env`)
```env
CIRCLE_API_KEY=your_circle_api_key_here
CIRCLE_API_BASE_URL=https://api.circle.com/v1/w3s
PORT=3001
CLIENT_URL=http://localhost:3000
```

### Client (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📚 Features

### ✅ Implemented
- **Email-based onboarding** (no wallet extensions needed)
- **USDC wallet creation** on BASE-SEPOLIA/ETH-SEPOLIA
- **Complete API integration** with Circle Programmable Wallets
- **React components** for wallet onboarding
- **TypeScript interfaces** for type safety
- **Error handling** and validation
- **Security best practices**
- **Comprehensive documentation**

### 🔮 Future Enhancements
- **User authentication** system
- **Database integration** for user state
- **USDC transfer functionality**
- **Yield farming integration**
- **Multi-chain support**
- **Advanced wallet management**

## 🛡️ Security Features

- **Server-side API keys**: Circle credentials never exposed to frontend
- **CORS protection**: Configurable cross-origin policies
- **Rate limiting**: Protection against abuse
- **Input validation**: Express-validator middleware
- **Helmet.js**: Security headers
- **Error sanitization**: No sensitive data in error responses

## 🧪 Testing

### Manual Testing
```bash
# Test server health
curl http://localhost:3001/health

# Test onboarding
curl -X POST http://localhost:3001/api/circle/onboard \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "blockchain": "BASE-SEPOLIA"}'
```

### Integration Testing
1. Start both server and client
2. Navigate to the onboarding page
3. Enter test email and submit
4. Verify wallet creation

## 📖 Documentation

- **Server Documentation**: [`server/README.md`](server/README.md)
- **Client Documentation**: [`client/CIRCLE_API_SETUP.md`](client/CIRCLE_API_SETUP.md)
- **Circle API Reference**: https://developers.circle.com/api-reference/

## 🚀 Deployment

### Option 1: Separate Deployment
Deploy frontend and backend to different platforms:
- **Frontend**: Vercel, Netlify, AWS Amplify
- **Backend**: Railway, Render, AWS EC2, DigitalOcean

### Option 2: Single Platform
Deploy both to platforms that support full-stack apps:
- **Railway**: Full-stack deployment
- **Render**: Monorepo support
- **AWS/GCP**: Container-based deployment

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Circle Documentation**: https://developers.circle.com/
- **Next.js Documentation**: https://nextjs.org/docs
- **Express.js Documentation**: https://expressjs.com/

---

**Built with ❤️ for the DeFi community** 