# Quick Start Guide - SpendSmart Frontend

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
cd spendsmart-frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 3. Make Sure Backend is Running
Ensure your Spring Boot backend is running on `http://localhost:8080`

## ✅ What's Included

- **Complete Authentication Flow**
  - User Registration with OTP
  - Email Verification
  - Login/Logout
  - Forgot Password
  - Password Reset

- **Modern Dashboard**
  - Statistics Overview
  - Recent Transactions
  - Quick Actions
  - Responsive Design

- **Production Ready Features**
  - JWT Token Management
  - Protected Routes
  - Error Handling
  - Loading States
  - Toast Notifications
  - Form Validation

## 🎨 Features

- Beautiful gradient UI design
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions
- Bootstrap 5 styling
- React Icons integration
- Toast notifications for user feedback

## 📝 Next Steps

1. **Configure CORS** - See `CORS_CONFIG.md` in the backend project
2. **Test Authentication** - Try registering a new user
3. **Add Transaction APIs** - When backend transaction endpoints are ready
4. **Add Category Management** - When backend category endpoints are ready

## 🐛 Common Issues

**Port Already in Use?**
- Change port in `vite.config.js` or kill the process using port 3000

**Backend Connection Failed?**
- Check backend is running on port 8080
- Verify CORS is configured (see `CORS_CONFIG.md`)
- Check browser console for errors

**Module Not Found?**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 📚 Documentation

- Full setup: See `SETUP.md`
- API integration: See `README.md`
- Backend CORS: See `../SpendSmart.pro/CORS_CONFIG.md`

