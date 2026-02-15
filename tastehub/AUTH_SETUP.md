# TasteHub - Authentication Setup Guide

## Overview
TasteHub now includes a complete authentication system with user registration, login, and protected routes.

## Environment Setup

### Required Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the following required variables:

#### NextAuth Configuration (REQUIRED)
- `NEXTAUTH_URL`: Your application URL (default: http://localhost:3000)
- `NEXTAUTH_SECRET`: Generate with: `openssl rand -base64 32`

#### OAuth Providers (OPTIONAL)
If you want to enable OAuth login (Google/GitHub), add:

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add to `.env.local`:
   - `GOOGLE_CLIENT_ID=your-client-id`
   - `GOOGLE_CLIENT_SECRET=your-client-secret`

**GitHub OAuth:**
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Add to `.env.local`:
   - `GITHUB_CLIENT_ID=your-client-id`
   - `GITHUB_CLIENT_SECRET=your-client-secret`

#### Social Media API Keys (For future features)
- `INSTAGRAM_API_KEY`: Your Instagram API key
- `FACEBOOK_API_KEY`: Your Facebook API key
- `TWITTER_API_KEY`: Your Twitter API key

## Features

### 1. Landing Page (`/`)
- Beautiful hero section introducing TasteHub
- Feature highlights
- Login and Sign Up buttons

### 2. Authentication Pages
- **Login** (`/login`): Sign in with email/password or OAuth providers
- **Sign Up** (`/signup`): Create a new account with name, email, and password

### 3. Protected Routes
The following routes require authentication:
- `/dashboard` - User dashboard with stats and quick actions
- `/calendar` - Content calendar view
- `/add-post` - Create new posts
- `/analytics` - View performance analytics

### 4. Dashboard Features
- Welcome message with user name
- Statistics cards (Total posts, Scheduled, Published, Engagement)
- Quick action links
- Recent posts overview
- Platform-specific post counts

## User Flow

1. **New User**:
   - Visit landing page
   - Click "Get Started Free" or "Sign Up"
   - Fill registration form
   - Automatically logged in and redirected to dashboard

2. **Existing User**:
   - Click "Sign In" from landing page
   - Enter credentials
   - Redirected to dashboard

3. **Authenticated User**:
   - Access all features via navigation
   - View dashboard with personalized stats
   - Create and manage posts
   - View analytics
   - Sign out from navbar

## Security Features

- Passwords are hashed using bcrypt
- JWT-based sessions
- Protected API routes
- Middleware-based route protection
- CSRF protection via NextAuth

## Development

### Start the Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## Data Storage

Currently, the application uses **in-memory storage** for users. This means:
- User data is lost when the server restarts
- Not suitable for production

### Recommended for Production:
1. Set up a database (PostgreSQL, MongoDB, etc.)
2. Update `DATABASE_URL` in `.env.local`
3. Replace in-memory storage in `/src/lib/auth.ts` with database calls
4. Use Prisma or another ORM for database operations

## Troubleshooting

### "Invalid credentials" error
- Check if user is registered
- Verify password is correct
- Check server logs for detailed errors

### OAuth not working
- Verify client IDs and secrets are correct
- Check redirect URIs match exactly
- Ensure OAuth apps are enabled in provider settings

### Session not persisting
- Verify `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again
- Check browser console for errors

## API Endpoints

- `POST /api/register` - Create new user account
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/session` - Get current session

## Next Steps

1. Generate your `NEXTAUTH_SECRET`
2. Set up OAuth providers (optional)
3. Test the authentication flow
4. Customize the dashboard with your data
5. Deploy to production with a real database

## Support

For issues or questions, please check the NextAuth.js documentation at [next-auth.js.org](https://next-auth.js.org)
