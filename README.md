# Nippon Toyota — Smart Incentive Calculator

This is a web application built with **Next.js**, **Prisma**, and **PostgreSQL** to manage and calculate tiered sales incentives for vehicle Sales Officers based on dynamic, admin-configured slab structures.

## 🔗 Live Link
- **Deployed Application**: [https://nippy-toyota-app.vercel.app](https://nippy-toyota-app.vercel.app)

---

## 🔑 Demo Access
You can log in instantly using the "Quick Access" buttons on the landing page, or enter the credentials below:

| Role | Name | Email | Password |
|------|------|-------|----------|
| **Admin** | Rajesh Kumar | `admin@nippytoyota.com` | `admin123` |
| **Sales Officer** | Anita Sharma | `anita.sharma@nippytoyota.com` | `sales123` |
| **Sales Officer** | Vikram Patel | `vikram.patel@nippytoyota.com` | `sales123` |

---

## 🚀 Key Features

### 1. Admin Portal (`/admin`)
- **Car Inventory Registry**: Full CRUD management of vehicle models. Toggle models between "Live" and "Draft" states (Draft vehicles are hidden from Sales Officer logs).
- **Dynamic Slab Configurator**: Visual timeline editor to configure commission brackets (Min/Max sales bounds and corresponding rate per car).
  - *Real-time validation*: Enforces sequential, gap-free, and overlap-free ranges. Validation issues are highlighted in red, and saves are blocked until resolved.
  - *Gemini AI Suggestions*: Generates optimized payout bracket configurations based on target outlays and volumes.
  - *Audit History*: Chronological publication log showing previous commission structures with snapshot previews.
- **Verification Approvals**: Audit queue showing submitted monthly logs. Admins can override quantities and verify submissions. Approved logs are locked securely with verification timestamps.
- **Executive Analytics**: MOM incentive payout trend charts (interactive tooltips, custom grid crosshairs) and sales officer performance leaderboard.

### 2. Sales Officer Portal (`/dashboard`)
- **Interactive Volume Logger**: Plus/minus steppers for active vehicle lines with floating indicators and border flashes for tactile feedback.
- **Live Payout Estimator**: Calculates total earnings in real-time. Unlocking a higher slab tier triggers a visual milestone update.
- **Milestone Target Ring**: Radial progress charts showing sales progress against customizable monthly targets.
- **Earnings Projection Simulator**: Slider-based sidebar widget for projecting hypothetical earnings.
- **PDF Statement Generator**: Clean, print-friendly invoice download referencing current slab parameters and model breakdowns. All currencies render using standard `Rs.` notation to prevent PDF viewer rendering bugs.
- **Month Switcher**: Change months to isolate logs and view previously saved submissions.

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL database (e.g., local server or cloud-hosted like Neon)

### Installation
1. Clone the repository and navigate to the application folder:
   ```bash
   git clone https://github.com/KrishnaKanhaiya1/Smart-Incentive-Calculator.git
   cd nippy-toyota-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Create a `.env` file in the root folder:
   ```env
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   JWT_SECRET="your-jwt-secret-key-32-characters"
   GEMINI_API_KEY="your-optional-google-gemini-key"
   ```

4. Push the schema and seed initial demo data (accounts, default vehicles, default slab tiers):
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. Run the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🧪 Running Tests
The project contains comprehensive unit tests verifying the calculation formulas, validations, and helper utilities.

```bash
# Run unit tests
npm run test

# Run tests with coverage reporting
npm run test:coverage
```

---

## 📁 Repository Structure
```
src/
├── app/
│   ├── page.tsx                    # Login Page
│   ├── admin/                      # Admin views & dashboard tabs
│   ├── dashboard/                  # Sales officer portal
│   └── api/                        # Next.js API Routes (auth, cars, slabs, sales)
├── components/
│   ├── SalesDashboard.tsx          # Sales interface & calculations
│   ├── VisualSlabBuilder.tsx       # Dynamic slab configuration editor
│   ├── AdminApprovalsManager.tsx   # Admin review & verification tool
│   ├── AdminAnalytics.tsx          # Leaderboards & MoM area chart
│   └── CarInventoryManager.tsx     # Vehicle model management list
├── hooks/                          # Custom React hooks (auth, session)
├── lib/
│   ├── calc.ts                     # Core payout calculation engine
│   └── validations.ts              # Sequential slab range validation checks
└── middleware.ts                   # JWT session protection & RBAC route guard
```
