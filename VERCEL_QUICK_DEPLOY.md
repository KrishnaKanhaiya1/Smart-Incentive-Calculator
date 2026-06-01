# Smart Incentive Calculator - Vercel Deployment Guide

## ⚡ Quick Start (5 Minutes)

### Step 1: Prepare Your Vercel Account
1. Go to https://vercel.com
2. Sign up or login
3. Bookmark: https://vercel.com/new

### Step 2: Deploy Project
1. Go to https://vercel.com/new
2. Click **"Continue"** (without GitHub)
3. Choose **"Create Git Repository"** option
4. Upload the `sic` folder or ZIP file
5. Select **Node.js** runtime
6. Click **Deploy**

### Step 3: Add Environment Variables
After first deployment, go to **Project Settings → Environment Variables** and add:

```
DATABASE_URL = postgresql://user:password@host:5432/sic

NEXTAUTH_SECRET = (generate random hex string)

NEXTAUTH_URL = https://your-app.vercel.app
```

### Step 4: Set Up Database
Choose one option:

**Option A: Vercel Postgres (Easiest)**
1. In Vercel dashboard, go to **Storage**
2. Click **Create → Postgres**
3. Copy connection string to `DATABASE_URL`

**Option B: Supabase**
1. Go to https://supabase.com
2. Create new project → PostgreSQL
3. Copy connection string

**Option C: Railway**
1. Go to https://railway.app
2. Create PostgreSQL plugin
3. Copy connection string

### Step 5: Deploy Database
1. In Vercel, go to **Deployments**
2. Redeploy latest build
3. First run will auto-migrate database

### Step 6: Generate NEXTAUTH_SECRET
Run in terminal:
```bash
openssl rand -hex 32
```
Copy output and paste in Vercel environment variables

## Testing the Live App

Once deployed, test these features:

### Admin Portal
1. Go to `https://your-app.vercel.app/auth/login`
2. Login: `admin@example.com` / `password123`
3. ✅ Add Car Model
4. ✅ Configure Incentive Slabs
5. ✅ View Dashboard

### Sales Officer Portal
1. Go to `https://your-app.vercel.app/auth/login`
2. Login: `sales@example.com` / `password123`
3. ✅ Log Sales Volume
4. ✅ View Real-time Calculations
5. ✅ Submit Monthly Data

## Troubleshooting

### Build Fails
**Solution**: Ensure environment variables are set BEFORE deployment

### Database Connection Error
**Check**:
- `DATABASE_URL` is correct
- Database accepts connections from Vercel
- Firewall allows access

### Authentication Not Working
**Solution**: 
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your Vercel domain

### Slow Page Load
**Check**:
- Database query performance
- API response times
- Vercel Analytics

## File Structure

```
sic/
├── app/
│   ├── admin/
│   │   ├── car-models/
│   │   ├── incentive-slabs/
│   │   └── dashboard/
│   ├── sales/
│   │   └── dashboard/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── api/
│   │   ├── auth/
│   │   ├── car-models/
│   │   ├── incentive-slabs/
│   │   └── sales-entries/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
└── README.md
```

## Performance Optimization Tips

1. **Database**: Index frequently queried fields
2. **Images**: Use Next.js Image optimization
3. **API**: Use caching strategies
4. **Frontend**: Lazy load components

## Security Checklist

✅ Password hashing (bcrypt)  
✅ Session management (NextAuth.js)  
✅ CSRF protection  
✅ SQL injection prevention (Prisma)  
✅ Environment variables encrypted  
✅ HTTPS enforced  
✅ Database backups  

## Monitoring & Analytics

### Vercel Dashboard
- Deployments
- Analytics
- Edge Network
- Performance

### Database Monitoring
- Connection pool status
- Query performance
- Storage usage

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **NextAuth Docs**: https://next-auth.js.org

## Custom Domain (Optional)

1. In Vercel, go to **Domains**
2. Add your domain
3. Update DNS records
4. SSL auto-configured

## That's It! 🎉

Your Smart Incentive Calculator is now live on Vercel!

### Demo Credentials (Pre-configured)
- **Admin**: admin@example.com / password123
- **Sales**: sales@example.com / password123

### Access Your App
- **URL**: https://your-app.vercel.app
- **Repository**: Already included in Vercel deployment
- **Updates**: Push changes to trigger auto-redeploy

---
**Ready to deploy? Start here:** https://vercel.com/new
