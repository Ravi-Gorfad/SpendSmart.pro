# SpendSmart Frontend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:8080/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Features Implemented

### Authentication
- ✅ User Registration with OTP verification
- ✅ Email OTP verification flow
- ✅ User Login with JWT tokens
- ✅ Forgot Password with OTP
- ✅ Password Reset flow
- ✅ Protected Routes
- ✅ Token-based authentication

### UI/UX
- ✅ Modern, responsive design
- ✅ Bootstrap 5 integration
- ✅ Beautiful gradient backgrounds
- ✅ Smooth animations and transitions
- ✅ Mobile-friendly responsive layout
- ✅ Toast notifications for user feedback
- ✅ Loading states and form validation

### Dashboard
- ✅ Dashboard layout with sidebar navigation
- ✅ Statistics cards (Income, Expense, Balance, Savings)
- ✅ Recent transactions list
- ✅ Quick actions panel
- ✅ Ready for transaction and category management integration

## Project Structure

```
spendsmart-frontend/
├── src/
│   ├── components/          # Reusable components (future)
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx # Authentication context
│   ├── pages/              # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── VerifyOtp.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   └── Dashboard.jsx
│   ├── services/           # API services
│   │   └── api.js          # Axios configuration and API calls
│   ├── styles/             # Global styles
│   │   └── index.css       # Main stylesheet
│   ├── utils/              # Utility functions
│   │   ├── ProtectedRoute.jsx
│   │   └── PublicRoute.jsx
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## API Integration

The frontend is configured to communicate with the Spring Boot backend at `http://localhost:8080/api`.

### Available Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - User login
- `POST /api/password/forgot` - Forgot password
- `POST /api/password/verify-reset-otp` - Verify reset OTP
- `POST /api/password/reset` - Reset password
- `POST /api/password/resend-reset-otp` - Resend reset OTP

## Next Steps

When the backend transaction and category APIs are ready:

1. **Add Transaction Management**
   - Create transaction service in `src/services/transactionService.js`
   - Add transaction pages/components
   - Integrate with dashboard

2. **Add Category Management**
   - Create category service in `src/services/categoryService.js`
   - Add category management UI
   - Integrate with transaction forms

3. **Add Charts and Analytics**
   - Install and configure charting library (Recharts is already included)
   - Create analytics components
   - Add reports page

4. **Enhancements**
   - Add user profile page
   - Add settings page
   - Add export functionality
   - Add data visualization

## Backend CORS Configuration

**IMPORTANT:** You need to configure CORS in your Spring Boot backend to allow requests from the frontend.

See `CORS_CONFIG.md` in the backend project root for detailed instructions on how to add CORS configuration to your `SecurityConfig.java`.

The Vite proxy will handle CORS in development, but you'll need proper CORS configuration for production or if you're not using the proxy.

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Make sure your Spring Boot backend has CORS configured (see `CORS_CONFIG.md`)
2. Check that the backend is running on port 8080
3. Verify the frontend is running on port 3000
4. Check browser console for detailed CORS error messages

### API Connection Issues
- Verify the backend is running on port 8080
- Check the `VITE_API_URL` in your `.env` file
- Check browser console for detailed error messages

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (requires 18+)

## Technologies Used

- **React 18** - UI library
- **React Router 6** - Routing
- **Vite** - Build tool
- **Bootstrap 5** - CSS framework
- **React Bootstrap** - Bootstrap components for React
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Toastify** - Toast notifications
- **Recharts** - Chart library (ready for use)

