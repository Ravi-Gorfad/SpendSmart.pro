# SpendSmart Frontend

A modern, production-ready React frontend for the SpendSmart expense tracking application.

## Features

- 🔐 OTP-based authentication with email verification
- 📱 Fully responsive design with Bootstrap 5
- 🎨 Modern and beautiful UI/UX
- 🔒 JWT token-based authentication
- 📊 Dashboard with expense tracking (ready for backend integration)
- 🚀 Built with Vite for fast development

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Backend Configuration

Make sure your Spring Boot backend is running on `http://localhost:8080` or update the proxy configuration in `vite.config.js`.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, etc.)
├── pages/          # Page components
├── services/       # API service layer
├── utils/          # Utility functions
├── styles/         # Global styles
└── App.jsx         # Main app component
```

