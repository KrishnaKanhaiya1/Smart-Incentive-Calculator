# 🚀 Deployment Guide - Nippon Toyota SIC

## Quick Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Neon PostgreSQL account (already set up)
- Vercel account

### Step-by-Step Deployment

#### 1. Create GitHub Repository

```bash
cd nippy-toyota-app

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "feat: Nippon Toyota Smart Incentive Calculator - Enterprise RBAC with real-time calculations"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/nippy-toyota-app.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

1. Go to https://vercel.com and sign up with GitHub
2. Click "New Project"
3. Select your nippy-toyota-app GitHub repository
4. Click "Import"
5. In the "Environment Variables" section, add:
   - `DATABASE_URL` = your Neon PostgreSQL URL
   - `JWT_SECRET` = generate with: `openssl rand -base64 32`
6. Click "Deploy"
7. Wait 2-3 minutes for build to complete

#### 3. Get Your Live URL

Your app is now deployed at: `https://{project-name}.vercel.app`

(Vercel will show you the exact URL after deployment)

### Post-Deployment Verification

```bash
# Test the live URL
1. Open https://{your-vercel-url}.vercel.app
2. Login with admin@nippytoyota.com / admin123
3. Add a car model
4. Create incentive slab
5. Logout
6. Login with anita.sharma@nippytoyota.com / sales123
7. Log car sales
8. Verify payout calculation
9. Logout
10. Try accessing /admin as sales user → should redirect
```

## Database Setup

After deployment, run migrations:

```bash
# Connect to production database
npx prisma db push

# Seed demo data
npx prisma db seed

# Verify seeding
npx prisma studio --engine-port 5555
```

## Troubleshooting

### Build fails: "Next.js inferred your workspace root"
**Fix**: Already fixed in vercel.json with turbopack.root

### 500 errors after deploy
**Check**:
- DATABASE_URL is set in Vercel environment variables
- JWT_SECRET is set in Vercel environment variables
- Database migrations were run

### Login fails after deploy
**Check**:
- Seed data was run: `npx prisma db seed`
- JWT_SECRET matches between local and Vercel

### Static files not loading (CSS, images)
**Check**:
- Build completed successfully (check Vercel build logs)
- No build errors in output

## Performance Monitoring

After deployment, monitor:

1. **Build Time**: Should be < 5 minutes
2. **Runtime**: Check Vercel Functions dashboard
3. **Database**: Monitor Neon Console for slow queries
4. **Errors**: Check Vercel error logs (should be 0)
5. **Response Times**: Check Vercel Analytics (should be < 500ms)

## Rollback

To rollback to a previous version:

1. Go to Vercel Dashboard → Deployments
2. Find the deployment you want to rollback to
3. Click "Redeploy"
4. Takes 1-2 minutes

## Other Hosting Options

### Railway.app (Alternative)
```bash
1. Go to https://railway.app
2. Connect GitHub
3. Select nippy-toyota-app repository
4. Add DATABASE_URL and JWT_SECRET
5. Deploy
```

### AWS Amplify (Alternative)
```bash
1. Go to AWS Amplify Console
2. Connect GitHub
3. Select nippy-toyota-app
4. Configure build settings
5. Add environment variables
6. Deploy
```

### Docker (Self-Hosted)
```dockerfile
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Deploy with:
```bash
docker build -t nippy-toyota .
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  nippy-toyota
```

## CI/CD Pipeline

GitHub Actions automatically tests on every push:

1. Installs dependencies
2. Runs build
3. Runs linter
4. Reports results

See `.github/workflows/build.yml` for configuration.

## Monitoring & Alerts

Set up alerts in Vercel:

- High error rate (> 1%)
- Deployment failures
- Response time > 1 second
- Function timeouts

## Security Best Practices

1. ✅ Never commit `.env` or secrets
2. ✅ Use `.env.local` for local development
3. ✅ Rotate JWT_SECRET periodically
4. ✅ Monitor Vercel logs for suspicious activity
5. ✅ Keep Vercel and dependencies updated

## Support

For issues:
1. Check Vercel build logs
2. Check database connectivity
3. Verify environment variables
4. Check GitHub Actions workflow results
