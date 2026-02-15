# 🚀 Quick Start Guide - TasteHub Authentication

## ⚡ Get Started in 3 Minutes

### Step 1: Generate Secret Key
Run this command in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and paste it in your `.env.local` file as `NEXTAUTH_SECRET`:
```
NEXTAUTH_SECRET=<paste-the-generated-key-here>
```

### Step 2: Restart the Server
If the server is already running, stop it (Ctrl+C) and restart:
```bash
npm run dev
```

If not running, just start it:
```bash
cd tastehub
npm run dev
```

### Step 3: Test the Application

1. **Visit the landing page**: [http://localhost:3000](http://localhost:3000)
   - Beautiful landing page with product features
   - Login and Sign Up buttons

2. **Create an account**:
   - Click "Get Started Free" or "Sign Up"
   - Fill in your details:
     - Name: John Doe
     - Email: john@example.com
     - Password: password123 (min 6 characters)
   - You'll be automatically logged in!

3. **Explore the Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - View your stats
   - See recent posts
   - Access quick actions

4. **Navigate the app**:
   - **Dashboard** - Main overview
   - **Calendar** - Content calendar
   - **Add Post** - Create new posts
   - **Analytics** - View performance

## 🎯 Test Credentials

After you sign up, you can use these credentials to log in:
- Email: [whatever you signed up with]
- Password: [whatever you used]

## ✨ Features to Try

### 1. Landing Page (/)
- Modern gradient hero section
- Feature highlights
- Sign up / Sign in buttons

### 2. Sign Up (/signup)
- Create new account
- Auto-login after registration
- OAuth options (Google/GitHub if configured)

### 3. Login (/login)
- Email/password login
- OAuth login options
- Error handling

### 4. Dashboard (/dashboard)
- Welcome message with your name
- Statistics cards
- Quick action buttons
- Recent posts
- Platform overview

### 5. Protected Routes
Try visiting these without logging in - you'll be redirected:
- /dashboard
- /calendar
- /add-post
- /analytics

## 🔐 Security Features

- ✅ Password hashing (bcrypt)
- ✅ JWT sessions
- ✅ Route protection (middleware)
- ✅ CSRF protection
- ✅ Secure cookies

## 📱 OAuth Setup (Optional)

Want to enable Google/GitHub login?

### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth credentials
4. Add redirect: `http://localhost:3000/api/auth/callback/google`
5. Add to `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### GitHub OAuth:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Add to `.env.local`:
   ```
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

## 🐛 Troubleshooting

### "Invalid credentials" error
- Make sure you've signed up first
- Check if you're using the correct email/password

### "NEXTAUTH_SECRET" error
- Generate a secret using: `openssl rand -base64 32`
- Add it to `.env.local`
- Restart the server

### Can't access protected routes
- Make sure you're logged in
- Check if session is active: visit `/api/auth/session`

### Port already in use
```bash
# Kill the process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 npm run dev
```

## 📊 Current Status

✅ Authentication system fully implemented
✅ Landing page created
✅ Login/Signup pages ready
✅ Dashboard with stats
✅ Protected routes configured
✅ Navbar shows auth state
✅ Sign out functionality

## 🎨 What You'll See

### Landing Page
- Purple/pink gradient hero
- 6 feature cards
- CTA buttons
- Professional footer

### Dashboard
- Personalized welcome
- 4 stat cards (posts, scheduled, published, engagement)
- 3 quick action cards
- Recent posts list
- Platform-specific cards (Instagram, Facebook, Twitter)

## 🔄 User Flow

```
New User Flow:
Landing → Sign Up → Auto Login → Dashboard → Explore Features

Existing User Flow:
Landing → Login → Dashboard → Manage Content

Sign Out Flow:
Any Page → Click "Sign Out" → Landing Page
```

## 📝 Important Notes

⚠️ **Data Storage**: Currently using in-memory storage
- User data resets when server restarts
- For production, use a real database

⚠️ **Middleware Warning**: You may see a warning about middleware convention
- This is just a Next.js 16 deprecation warning
- Doesn't affect functionality

## 🚢 Ready for Production?

Before deploying:
1. ✅ Set up a database (PostgreSQL/MongoDB)
2. ✅ Update DATABASE_URL in .env
3. ✅ Generate production NEXTAUTH_SECRET
4. ✅ Set correct NEXTAUTH_URL
5. ✅ Configure OAuth for production URLs
6. ✅ Enable email verification
7. ✅ Add rate limiting
8. ✅ Set up logging/monitoring

## 🎉 You're All Set!

Your TasteHub authentication system is ready to use. Start by:
1. Generating your NEXTAUTH_SECRET
2. Creating an account
3. Exploring the dashboard

For detailed documentation, see `AUTH_SETUP.md`

Happy coding! 🚀
