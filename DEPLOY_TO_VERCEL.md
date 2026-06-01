[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/anantkumarntpc-afk/sic&project-name=smart-incentive-calculator&repository-name=sic&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL&envDescription=Required%20environment%20variables%20for%20SIC&envLink=https://github.com/anantkumarntpc-afk/sic%23environment-variables)

# Smart Incentive Calculator - Deploy to Vercel

Click the **Deploy with Vercel** button above to instantly deploy this application!

## What Happens When You Click Deploy

1. **Sign in** to your Vercel account (or create one)
2. **Fork** the repository to your GitHub account
3. **Configure** environment variables
4. **Deploy** automatically to Vercel

## Before Clicking Deploy

You'll need:
- ✅ Vercel account (free)
- ✅ PostgreSQL database URL
- ✅ A random string for NEXTAUTH_SECRET

## Get Database URL

**Option A: Vercel Postgres (Easiest)**
- Dashboard → Storage → Create Postgres
- Copy connection string

**Option B: Supabase**
- https://supabase.com → Create project
- Copy PostgreSQL connection string

**Option C: Railway**  
- https://railway.app → Create PostgreSQL
- Copy connection string

## Generate NEXTAUTH_SECRET

Run in any terminal:
```bash
openssl rand -hex 32
```

Copy the output and use it as `NEXTAUTH_SECRET`.

## Environment Variables

When prompted, set:

```
DATABASE_URL = postgresql://user:password@host:5432/sic
NEXTAUTH_SECRET = (your generated secret)
NEXTAUTH_URL = https://[your-app-name].vercel.app
```

## After Deployment

1. ✅ Wait for deployment to complete (~2-3 minutes)
2. ✅ Visit your live URL
3. ✅ Test with demo credentials:
   - Admin: admin@example.com / password123
   - Sales: sales@example.com / password123

## Features

✅ **Admin Portal**
- Manage car models
- Configure incentive slabs
- View statistics

✅ **Sales Portal**  
- Log sales volumes
- Real-time calculations
- Monthly tracking

✅ **Full Stack**
- Next.js 14
- PostgreSQL
- Authentication
- RBAC

## Troubleshooting

**Build Fails**
- Check environment variables are set
- Ensure DATABASE_URL is correct

**App Won't Start**
- Check Vercel logs: Deployments → Select → View logs
- Verify database credentials

**Demo Users Not Working**
- Database may not be seeded
- Create new user via /auth/register

## Documentation

- [README.md](README.md) - Full documentation
- [VERCEL_QUICK_DEPLOY.md](VERCEL_QUICK_DEPLOY.md) - Detailed guide

---

**Ready? Click the Deploy with Vercel button at the top!** 🚀
