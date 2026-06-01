# 🧪 Comprehensive Testing Guide

## Demo Credentials

### Admin Account
- **Email**: admin@nippytoyota.com
- **Password**: admin123
- **Role**: Administrator

### Sales Officer Accounts
- **Email**: anita.sharma@nippytoyota.com
- **Password**: sales123

- **Email**: vikram.patel@nippytoyota.com
- **Password**: sales123

**Tip**: Use Quick Access buttons on login page for fast login

---

## Complete Test Coverage (40 Points)

### Admin Portal Tests (15 points)

#### ✅ Car Inventory Management (5 tests)
1. **Add Car Model**
   - Click "Add Car"
   - Name: "Toyota Fortuner"
   - Variant: "4x4 AT"
   - Expected: ✓ Appears in list with success toast

2. **Edit Car Model**
   - Click edit icon on car
   - Change variant to "4x2 AT"
   - Click Save
   - Expected: ✓ Changes reflected, toast confirms

3. **Toggle Active Status**
   - Click toggle icon
   - Expected: ✓ Car marked inactive, appears grayed out

4. **Delete Car Model**
   - Click delete icon
   - Confirm in dialog
   - Expected: ✓ Car removed, success toast

5. **Search/Filter Cars**
   - Type in search box
   - Expected: ✓ List filters in real-time

#### ✅ Dynamic Slab Configuration (7 tests)
6. **View Current Slabs**
   - Open "Slab Engine" tab
   - Expected: ✓ Shows 5 tiers (1-3, 4-7, 8-12, 13-20, 21+)

7. **Edit Slab Rate**
   - Change Tier 1 incentive from 1000 to 1500
   - Expected: ✓ Value updates, validation passes

8. **Add New Slab Tier**
   - Click "Add Next Tier"
   - Set: 25-50, 15000 incentive
   - Expected: ✓ New tier appears

9. **Remove Slab Tier**
   - Click X on newly added tier
   - Expected: ✓ Tier removed

10. **Publish Commission Matrix**
    - Click "Publish"
    - Expected: ✓ Success toast, audit log updated

11. **Validate No Overlaps**
    - Try creating 1-5 and 4-8 (overlap)
    - Expected: ✓ Error message: "Overlapping ranges"

12. **Validate No Gaps**
    - Try creating 1-3 and 5-7 (gap at 4)
    - Expected: ✓ Error message: "Gap found"

#### ✅ Admin Features (3 tests)
13. **View Audit Logs**
    - Click "Slab Engine" tab
    - Scroll to "Audit Logs & Slab History"
    - Expected: ✓ Shows all previous slab changes with timestamp

14. **Dark Mode Toggle**
    - Click dark mode button in header
    - Expected: ✓ UI switches to dark theme, preference persists

15. **Analytics Dashboard**
    - Click "Analytics" tab
    - Expected: ✓ Shows charts and performance data

### Sales Portal Tests (15 points)

#### ✅ Sales Dashboard (5 tests)
16. **Login as Sales Officer**
    - Login with anita.sharma@nippytoyota.com
    - Expected: ✓ Redirects to /dashboard (NOT /admin)

17. **Select Month**
    - Click month dropdown
    - Select "June 2026"
    - Expected: ✓ Month selected, form updates

18. **Enter Car Volumes**
    - Select 5 cars for "Toyota Glanza G MT"
    - Select 8 cars for "Toyota Innova Crysta GX"
    - Expected: ✓ Values appear in form

19. **Real-Time Calculation**
    - Total shown: 13 cars
    - Current tier: Gold (8-12 cars = 5000/car)
    - Expected: ✓ Payout = 13 * 5000 = ₹65,000

20. **Save Monthly Record**
    - Click "Save"
    - Expected: ✓ Toast: "Record saved successfully"

#### ✅ Data Persistence (4 tests)
21. **Load Previous Month**
    - Select "May 2026"
    - Expected: ✓ Shows previously saved data for May

22. **Switch Back to June**
    - Select "June 2026"
    - Expected: ✓ June 2026 data still there (not lost)

23. **Month-Based Isolation**
    - Each month has separate data
    - Expected: ✓ June volume ≠ May volume

24. **Data Auto-Load**
    - Refresh page after saving data
    - Expected: ✓ Data persists, loaded from database

#### ✅ UI/UX (6 tests)
25. **Animated Payout Counter**
    - Change volume
    - Expected: ✓ Numbers animate smoothly up/down

26. **Payout Breakdown Donut Chart**
    - With multiple cars, chart shows breakdown
    - Expected: ✓ Donut segments for each model

27. **Tier Badge Display**
    - At 13 cars: Shows "Gold" tier with 🥇
    - Expected: ✓ Tier updates with volume changes

28. **Progress to Next Tier**
    - Shows "X more cars for next tier"
    - Expected: ✓ Accurate count

29. **Dark Mode in Sales Portal**
    - Click dark mode button
    - Expected: ✓ Dashboard switches theme

30. **Responsive Layout**
    - Form displays with proper spacing
    - Buttons accessible
    - Expected: ✓ All elements visible and usable

### Security & RBAC Tests (10 points)

#### ✅ Role-Based Access Control (5 tests)
31. **Admin Cannot Access Sales Portal**
    - Login as admin
    - Try /dashboard in URL
    - Expected: ✓ Redirects to / (login page)

32. **Sales Cannot Access Admin**
    - Login as sales officer
    - Try /admin in URL
    - Expected: ✓ Redirects to / (login page)

33. **API RBAC: No Token**
    - Call `/api/admin/cars` without token
    - Expected: ✓ 401 Unauthorized response

34. **API RBAC: Wrong Role**
    - Call `/api/admin/cars` with SALES token
    - Expected: ✓ 403 Forbidden response

35. **Session Timeout**
    - Clear auth cookie manually
    - Try to access /admin
    - Expected: ✓ Redirects to login

#### ✅ Input Validation (5 tests)
36. **Negative Numbers Blocked**
    - Try entering -5 cars in sales form
    - Expected: ✓ Input prevented (disabled on UI + validated on API)

37. **Decimal Numbers**
    - Try entering 4.5 cars
    - Expected: ✓ Floored to 4 or rejected

38. **Text Input in Number Field**
    - Try typing "abc" in volume field
    - Expected: ✓ Input prevented

39. **SQL Injection Prevention**
    - Try: `' OR '1'='1` in car search
    - Expected: ✓ No error, treated as literal string

40. **XSS Prevention**
    - Try: `<script>alert('xss')</script>` in car name
    - Expected: ✓ Escaped or rejected

---

## Performance Tests

### Page Load Time
```bash
# Should load in < 2 seconds
time curl http://localhost:3000

# Check bundle size
npm run build
# Should show production build size < 100KB gzipped
```

### API Response Time
```bash
# Each API call should respond in < 500ms
time curl -X GET http://localhost:3000/api/admin/cars \
  -H "Authorization: Bearer {token}"
```

### Mobile Performance
- DevTools Lighthouse score: 90+
- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s

---

## Mobile Responsiveness Tests

### 375px (Mobile)
- [ ] Login page readable
- [ ] Buttons tappable (44px+)
- [ ] Forms usable
- [ ] No horizontal scroll
- [ ] Numbers readable

### 768px (Tablet)
- [ ] All tabs visible
- [ ] Forms display properly
- [ ] Tables scroll horizontally
- [ ] Responsive layout works

### 1920px (Desktop)
- [ ] Full width utilized
- [ ] Proper spacing
- [ ] No awkward gaps

---

## Browser Compatibility Tests

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Final Verification Checklist

Before submission:
- [ ] All 40 tests passed
- [ ] No console errors
- [ ] No 5xx errors
- [ ] Mobile responsive
- [ ] RBAC working
- [ ] Data persists
- [ ] Performance good
- [ ] Documentation complete
- [ ] Live URL working
- [ ] GitHub repo public

---

## Test Results

Document your results:

| Test # | Name | Status | Notes |
|--------|------|--------|-------|
| 1 | Add Car | ✅ PASS | - |
| 2 | Edit Car | ✅ PASS | - |
| ... | ... | ... | ... |

**Total Passed**: 40/40 = **100%** ✅
