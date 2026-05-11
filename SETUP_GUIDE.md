# Voltrix Markets Trading Platform - Setup Guide

## Project Overview
Voltrix Markets is a simplified digital trading platform similar to Deriv, focused on even/odd style prediction markets.

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (optional - server can run without it for development)

## Installation & Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Configuration

The backend `.env` file has been configured with:
- MongoDB Atlas connection string
- JWT secret key
- CORS settings for frontend

**Backend Environment Variables:**
```env
PORT=5000
MONGO_URI=mongodb+srv://volatrixadmin:VOLATRIX12345@volatrix.7v8baci.mongodb.net/?appName=volatrix
JWT_SECRET=volatrix-trading-secret-key-2024-very-secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
DERIV_APP_ID=332LK4VWd9A4pEEfTMn53
DERIV_API_TOKEN=
```

### 3. Running the Application

#### Option 1: Run Services Separately

**Start Backend:**
```bash
cd backend
npm start
```
Backend will run on: `http://localhost:5000`

**Start Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:5173`

#### Option 2: Run Both Services (Recommended)

Open two terminal windows and run both commands simultaneously:
- Terminal 1: `cd backend && npm start`
- Terminal 2: `cd frontend && npm run dev`

### 4. Verification

**Test Backend API:**
```bash
curl http://localhost:5000/api/health
```
Expected response:
```json
{
  "status": "ok",
  "service": "Volatrix backend foundation"
}
```

**Access Frontend:**
Open browser and navigate to: `http://localhost:5173`

## Current Features

### Backend (Node.js + Express)
- ✅ Express server setup with CORS
- ✅ MongoDB connection (with graceful fallback)
- ✅ WebSocket foundation for real-time updates
- ✅ JWT authentication structure
- ✅ Health check endpoint
- ✅ User and trade models structure

### Frontend (React + Vite + Tailwind)
- ✅ Modern React setup with Vite
- ✅ TailwindCSS for styling
- ✅ React Router for navigation
- ✅ Zustand for state management
- ✅ Axios for API communication
- ✅ Framer Motion for animations

## Database Notes

- The server can run without MongoDB connection for development
- MongoDB Atlas connection is configured but may fail due to network restrictions
- All database operations will log warnings but won't crash the server
- For full functionality, ensure MongoDB is accessible

## Development Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start with nodemon for development
- `npm test` - Run tests (not configured yet)

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Issues & Solutions

1. **MongoDB Connection Failed**
   - Server will continue running without database
   - Some features may not work properly
   - Check network connectivity for MongoDB Atlas

2. **Port Already in Use**
   - Backend: Change PORT in `.env` file
   - Frontend: Vite will automatically find next available port

3. **CORS Issues**
   - Ensure CLIENT_URL in backend `.env` matches frontend URL
   - Default is set to `http://localhost:5173`

4. **Dependencies Issues**
   - Delete `node_modules` and run `npm install` again
   - Ensure Node.js version is 16 or higher

## Next Steps for Development

1. **Complete User Authentication**
   - Implement registration/login endpoints
   - Add JWT token validation
   - Create user dashboard

2. **Build Trading Features**
   - Implement even/odd prediction markets
   - Add real-time price updates
   - Create trade execution logic

3. **Admin Panel**
   - User management
   - Balance control
   - Trade monitoring

4. **Database Integration**
   - Ensure MongoDB connection is stable
   - Add proper error handling
   - Implement data persistence

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure both frontend and backend are running simultaneously
