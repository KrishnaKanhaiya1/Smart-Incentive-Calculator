# SIC Deployment Guide

## Current Status

✅ **Project Created**: Full-stack Next.js application built
✅ **Git Repository**: Initialized locally with initial commit
✅ **Database Schema**: Prisma setup with PostgreSQL support
✅ **Authentication**: NextAuth.js configured
✅ **Admin Portal**: Car models & incentive slabs management
✅ **Sales Portal**: Real-time incentive calculator
✅ **API Routes**: Complete CRUD endpoints with auth

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account**: https://github.com/anantkumarntpc-afk/sic
2. **Vercel Account**: https://vercel.com (connected to GitHub)
3. **PostgreSQL Database**: 
   - Local: `postgresql://user:password@localhost:5432/database_name`
   - Cloud: Vercel Postgres, Supabase, or Railway

## Quick Deployment (3 Steps)

### Step 1: Push to GitHub

```bash
# Option A: Using Git (if credentials cached)
cd C:\tmp\sic
git push -u origin master

# Option B: Using GitHub CLI (requires authentication)
# This will open browser for authentication if first time
gh repo create anantkumarntpc-afk/sic --source=. --push

# Option C: Manual (if automated push fails)
# 1. Go to https://github.com/anantkumarntpc-afk/sic
# 2. Copy the repo URL
# 3. Follow GitHub's push instructions
```

### Step 2: Deploy to Vercel

**Automatic (Recommended)**:
1. Go to https://vercel.com/new
2. Connect GitHub account
3. Select `anantkumarntpc-afk/sic` repository
4. Add environment variables:
   ```
   DATABASE_URL = postgresql://user:password@localhost:5432/database_name
   NEXTAUTH_SECRET = (generate: openssl rand -hex 32)
   NEXTAUTH_URL = https://[your-vercel-url].vercel.app
   ```
5. Click Deploy

**Manual Using Vercel CLI**:
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Step 3: Configure Database

After deployment:

1. Connect to your PostgreSQL database
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Environment Variables

Create `.env.local` (or set in Vercel dashboard):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -hex 32"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_API_URL="https://your-domain.vercel.app"
```

## Database Setup

### Option 1: Vercel Postgres (Recommended for Vercel)
1. Go to Vercel dashboard
2. Project Settings → Storage
3. Create Postgres
4. Connection string will be in `.env.local`

### Option 2: Supabase
1. Go to https://supabase.com
2. Create new project
3. Get PostgreSQL connection string
4. Add to environment variables

### Option 3: Railway.app
1. Go to https://railway.app
2. Create PostgreSQL plugin
3. Copy connection string
4. Add to environment variables

## Testing Deployment

After deployment is live:

### Test Admin Portal
```
URL: https://your-domain.vercel.app/auth/login
Email: admin@example.com
Password: password123

Features:
- Add car models ✓
- Configure incentive slabs ✓
- View dashboard statistics ✓
```

### Test Sales Portal
```
URL: https://your-domain.vercel.app/auth/login
Email: sales@example.com
Password: password123

Features:
- Log sales volumes ✓
- Real-time incentive calculation ✓
- Monthly tracking ✓
```

## Troubleshooting

### Push Fails with "Authentication Failed"
**Solution**: 
- GitHub Desktop: https://desktop.github.com
- GitHub CLI: `gh auth login` (opens browser)
- Personal Access Token: 
  1. Go to https://github.com/settings/tokens
  2. Generate token with `repo` scope
  3. Use as password in git push

### Vercel Deployment Fails
**Check**:
- All environment variables are set
- Database URL is correct
- Migrations can run

**Debug**:
```bash
npm run build  # Test build locally
npx prisma migrate deploy  # Test migrations
```

### App Won't Start
**Check logs**:
```bash
# Vercel
vercel logs  # View deployment logs

# Local
npm run dev  # Test locally
```

## Performance Monitoring

Once live:

### Vercel Analytics
- https://vercel.com/dashboard/[project]/analytics

### Database
- Monitor connections
- Check slow queries
- Optimize N+1 queries

## Next Steps

1. **Domain**: Add custom domain in Vercel
2. **SSL**: Automatic with Vercel
3. **Monitoring**: Set up error tracking (Sentry)
4. **Backup**: Configure database backups
5. **CI/CD**: GitHub Actions already configured

## Support

- Repository: https://github.com/anantkumarntpc-afk/sic
- Issues: GitHub Issues tab
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**Created at**: 2026-05-31
**Status**: Ready for deployment
**Git Commit**: Initial commit ready to push
