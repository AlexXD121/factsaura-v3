# FactSaura Backend

AI-powered misinformation detection platform backend built with Express.js.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Jan AI server running on localhost:1337 (for AI features)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```bash
npm run dev
```

4. Verify setup:
```bash
node verify-setup.js
```

### Testing

Run the test suite:
```bash
npm test
```

Check server health:
```bash
curl http://localhost:3001/health
```

## 📁 Project Structure

```
server/
├── config/           # Configuration management
├── controllers/      # Request handlers
├── models/          # Data models
├── routes/          # API routes
├── services/        # Business logic
├── test/           # Test files
├── server.js       # Main server file
└── package.json    # Dependencies and scripts
```

## 🔗 API Endpoints

### Health Check
- `GET /health` - Server health status

### API Routes
- `GET /api` - API information
- `GET /api/posts` - Posts endpoints (to be implemented)
- `GET /api/ai` - AI analysis endpoints (to be implemented)  
- `GET /api/users` - User management endpoints (to be implemented)

## 🛠️ Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite
- `node verify-setup.js` - Verify project setup

### Environment Variables
See `.env.example` for all available configuration options.

## 📋 Implementation Status

### ✅ Completed (Task 1.1)
- Express.js server with middleware (CORS, helmet, rate limiting)
- Project structure (routes, controllers, services, models)
- Environment configuration
- Health check endpoint
- Basic error handling
- Test setup

### 🔄 Next Tasks
- Task 1.2: Frontend Foundation Setup
- Task 1.3: Database & Authentication Setup  
- Task 2.1: Jan AI Integration
- Task 2.2: Core UI Components
- Task 2.3: Posts API & Basic Feed

## 🤝 Contributing

This is part of the FactSaura hackathon project. Follow the task-based development approach outlined in the project specifications.