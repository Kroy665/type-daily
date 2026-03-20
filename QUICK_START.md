# Quick Start Guide - Type Daily v2.0.0

## 🚀 Getting Started

### First Time Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Set Up Environment Variables**
```bash
# Copy example and fill in your values
cp .env.example .env

# Required variables:
# DATABASE_URL=postgresql://user:password@localhost:5432/typedaily
# NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
# NEXTAUTH_URL=http://localhost:3000
# GOOGLE_CLIENT_ID=<from Google Cloud Console>
# GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
# ADMIN_EMAILS=your-email@example.com
```

3. **Generate Prisma Client**
```bash
npx prisma generate
```

4. **Run Database Migration**
```bash
npx prisma migrate dev
```

5. **Seed Achievements**
```bash
npm run seed
```

6. **Add Sample Texts**
```bash
npm run add-texts
```

7. **Start Development Server**
```bash
npm run dev
```

Visit: http://localhost:3000

---

## 📝 Common Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run linter
```

### Database
```bash
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration
npx prisma migrate deploy # Apply migrations (production)
npx prisma generate      # Generate Prisma client
npm run seed             # Seed achievements
npm run add-texts        # Add sample typing texts
```

### Useful Prisma Commands
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name description_of_change
```

---

## 🎯 Testing the New Features

### 1. Test Leaderboard
1. Complete a few typing tests
2. Visit `/leaderboard`
3. Check your ranking
4. Try different sort options

### 2. Test Daily Challenge
1. Visit `/challenge`
2. Click "Start Challenge"
3. Complete the typing test
4. See your rank on daily leaderboard

### 3. Test Achievements
1. Complete typing tests with different speeds/accuracy
2. Visit `/profile`
3. Scroll to "Achievements" section
4. Check which badges you've unlocked

### 4. Test Streak Tracking
1. Complete a test today
2. Come back tomorrow and complete another
3. Check profile to see streak increment

---

## 🐛 Troubleshooting

### "No text found for this difficulty and time"
**Solution:** Add sample texts
```bash
npm run add-texts
```

### "NEXTAUTH_SECRET environment variable is not set"
**Solution:** Add to `.env` file
```bash
openssl rand -base64 32  # Generate secret
# Add to .env: NEXTAUTH_SECRET=<generated_value>
```

### "Prisma Client not generated"
**Solution:**
```bash
npx prisma generate
```

### Database connection errors
**Solution:** Check your DATABASE_URL in `.env`
```bash
# Make sure PostgreSQL is running
# Verify connection string format:
# postgresql://user:password@host:port/database
```

### Migration errors
**Solution:**
```bash
# Check migration status
npx prisma migrate status

# If stuck, reset (WARNING: deletes data)
npx prisma migrate reset
npx prisma migrate dev
```

---

## 📊 Sample Data

### Text Distribution (After running `npm run add-texts`)
- **Easy**: 5 texts (3 × 60s, 1 × 300s, 1 × 900s)
- **Medium**: 7 texts (5 × 60s, 1 × 300s, 1 × 900s)
- **Hard**: 5 texts (3 × 60s, 1 × 300s, 1 × 900s)

### Achievement List (After running `npm run seed`)
10 achievements across speed, accuracy, and consistency categories

---

## 🔑 Admin Features

### Set Admin Email
Add to `.env`:
```bash
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Admin Capabilities
- Create new typing texts
- Delete existing texts
- Access `/text` page for text management

---

## 📱 Main Pages

| URL | Description | Auth Required |
|-----|-------------|---------------|
| `/` | Home - Typing test | No |
| `/auth/login` | Login with Google | No |
| `/leaderboard` | Global rankings | Yes |
| `/challenge` | Daily challenge | Yes |
| `/profile` | User stats & achievements | Yes |
| `/text` | Text management (admin) | Yes (Admin) |

---

## 🎨 Features Overview

### Typing Test (Home Page)
- Select difficulty: Easy, Medium, Hard
- Select time: 1min, 5mins, 15mins
- Real-time WPM calculation
- Accuracy tracking
- Results popup on completion

### Leaderboard
- Top 100 global rankings
- Sort by: WPM, Accuracy, Streak, Total Tests
- Your rank card highlighted
- Medal badges for top 3

### Daily Challenge
- New challenge every 24 hours
- One attempt per user per day
- Real-time leaderboard
- Countdown timer
- Completion tracking

### Profile & Analytics
- Performance graphs
- Personal bests
- Achievements grid
- Streak tracking
- Test history

---

## 📖 Additional Resources

- `NEW_FEATURES.md` - Detailed feature documentation
- `MIGRATION_GUIDE.md` - Database migration guide
- `PRODUCTION_IMPROVEMENTS.md` - Production readiness checklist

---

## ✅ Quick Checklist

Before testing:
- [ ] PostgreSQL running
- [ ] `.env` file configured
- [ ] Dependencies installed
- [ ] Prisma client generated
- [ ] Migrations applied
- [ ] Achievements seeded
- [ ] Sample texts added
- [ ] Dev server running

---

## 🆘 Need Help?

1. Check server logs for errors
2. Check browser console for errors
3. Verify database with `npx prisma studio`
4. Review `.env` configuration
5. Check PostgreSQL is running

---

**Version**: 2.0.0
**Last Updated**: 2026-03-18
