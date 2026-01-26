# Authentication System Setup Guide

This document explains how to use the authentication system in this Next.js frontend application.

## Overview

The authentication system is designed to work with the DPlus API Server (`dplus-api-server-v1`) and follows these principles:

- **Access Token**: Stored in `localStorage`, sent via `Authorization: Bearer` header
- **Refresh Token**: Stored as httpOnly cookie by the server, automatically included in requests
- **Auto Refresh**: When access token expires, server automatically refreshes it and returns via `X-New-Access-Token` header
- **Device Type**: Always set to `"web"` for this user-facing frontend

## Architecture

### File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Auth context provider
├── hooks/
│   └── useAuth.ts               # useAuth hook
├── services/
│   └── auth.service.ts          # Auth API calls
├── types/
│   └── auth.types.ts            # Auth type definitions
└── utils/
    ├── api-client.ts            # API fetch wrapper
    └── token.utils.ts           # Token management utilities
```

## Setup

### 1. Environment Variables

Add to your `.env.local`:

```bash
# API Server URL
NEXT_PUBLIC_DEV_API_URL=http://localhost:4000
```

### 2. Wrap Your App with AuthProvider

In your root layout or app component:

```tsx
// src/app/layout.tsx
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Usage

### Using the useAuth Hook

```tsx
"use client";

import { useAuth } from "@/hooks/useAuth";

export default function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout, register, googleLogin } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name || user?.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Login Example

```tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = await login(email, password);

    if (success) {
      // Redirect to dashboard or home
      window.location.href = "/";
    } else {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

### Register Example

```tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = await register(email, password, name);

    if (success) {
      window.location.href = "/";
    } else {
      setError("Registration failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (optional)"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
```

### Google Login Example

```tsx
"use client";

import { useAuth } from "@/hooks/useAuth";

export default function GoogleLoginButton() {
  const { googleLogin, isLoading } = useAuth();

  const handleGoogleLogin = async () => {
    // Get Google ID token from Google Sign-In SDK
    // This is a simplified example - you'll need to integrate Google Sign-In SDK
    const idToken = "YOUR_GOOGLE_ID_TOKEN";

    const success = await googleLogin(idToken);

    if (success) {
      window.location.href = "/";
    }
  };

  return (
    <button onClick={handleGoogleLogin} disabled={isLoading}>
      Sign in with Google
    </button>
  );
}
```

### Protected Route Example

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <div>Protected content</div>;
}
```

## API Endpoints

The following endpoints are available from the backend:

### User Auth Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Login with Google
- `POST /api/auth/logout` - Logout (requires auth)
- `DELETE /api/auth/withdraw` - Delete account (requires auth)
- `GET /api/auth/me` - Get current user info (requires auth)
- `POST /api/auth/refresh` - Refresh access token

## Auth Context API

### State

- `user: User | null` - Current user object
- `isAuthenticated: boolean` - Whether user is logged in
- `isLoading: boolean` - Whether auth check is in progress

### Methods

- `login(email: string, password: string): Promise<boolean>` - Login with credentials
- `googleLogin(idToken: string): Promise<boolean>` - Login with Google
- `register(email: string, password: string, name?: string): Promise<boolean>` - Register new user
- `logout(): Promise<void>` - Logout current user
- `checkAuth(): Promise<void>` - Manually check auth status

## Token Management

The system automatically manages tokens:

1. **Access Token** is stored in `localStorage` with key `"accessToken"`
2. **Refresh Token** is stored as httpOnly cookie by the server (not accessible from JS)
3. When access token expires, the server automatically refreshes it
4. The new token is returned in the `X-New-Access-Token` response header
5. The API client automatically saves the new token to localStorage

## Error Handling

Common error codes from the backend:

- `INVALID_CREDENTIALS` - Wrong email/password
- `TOKEN_EXPIRED` - Access token expired (auto-refreshed by server)
- `REFRESH_TOKEN_INVALID` - Refresh token is invalid (user must re-login)
- `REFRESH_TOKEN_EXPIRED` - Refresh token expired (user must re-login)
- `NO_ACCESS_TOKEN` - No access token provided
- `INACTIVE_ACCOUNT` - User account is inactive

## Security Notes

1. Never commit real API keys or secrets to Git
2. Access tokens are stored in localStorage (not ideal for XSS protection, but acceptable for this use case)
3. Refresh tokens are httpOnly cookies (more secure, protected from XSS)
4. Always use HTTPS in production
5. The server validates and verifies all tokens

## Development vs Production

### Development
```bash
NEXT_PUBLIC_DEV_API_URL=http://localhost:4000
```

### Production
```bash
NEXT_PUBLIC_DEV_API_URL=https://api.yourdomain.com
```

## Testing

To test the authentication system:

1. Start the API server: `cd ../dplus-api-server-v1 && npm run dev`
2. Start the frontend: `npm run dev`
3. Navigate to your login page
4. Register a new account or login
5. Check browser DevTools → Application → Local Storage for `accessToken`
6. Check Network tab for `Authorization: Bearer` headers

## Troubleshooting

### "useAuth must be used within AuthProvider"

Make sure you've wrapped your app with `<AuthProvider>` in the root layout.

### Access token not being sent

Check that the API client is properly including the `Authorization` header with the Bearer token.

### Cookies not being set

Make sure:
- API server has CORS configured to allow credentials
- Frontend is using `credentials: "include"` in fetch calls (already configured in `api-client.ts`)

### Token refresh not working

The server automatically refreshes tokens when:
- Access token is expired
- Refresh token is still valid
- User has the refresh token cookie

Check the `X-New-Access-Token` header in network responses.
