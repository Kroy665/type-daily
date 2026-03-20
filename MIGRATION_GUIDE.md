# Migration Guide - Type Daily v2.0.0

## Overview
This guide will help you migrate your Type Daily application to version 2.0.0 which includes:
- Leaderboard system
- Daily challenges
- Achievements & badges
- Streak tracking
- Enhanced analytics

---

## ⚠️ Important Notes

- **Database Changes**: This update adds new tables and columns
- **No Data Loss**: Existing results and texts are preserved
- **Downtime**: Minimal (< 5 minutes for migration)
- **Backwards Compatible**: All existing features continue to work

---

## 📋 Prerequisites

Before starting, ensure you have:
- [x] PostgreSQL database running
- [x] Node.js 18+ installed
- [x] All environment variables configured
- [x] Backup of your database (recommended)

---

## 🚀 Migration Steps

### Step 1: Pull Latest Code

```bash
git pull origin main
# or download the latest code
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs the Zod package added for validation.

### Step 3: Review Schema Changes

Open `prisma/schema.prisma` and review the changes:
- New fields on `User` model (bestWpm, bestAccuracy, etc.)
- New `Achievement`, `UserAchievement` models
- New `DailyChallenge`, `DailyChallengeResult` models
- New enum types: `Role`, `AchievementType`

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

### Step 5: Create and Apply Migration

**Option A: Development (Interactive)**
```bash
npx prisma migrate dev --name add_leaderboard_features
```

**Option B: Production (Non-interactive)**
```bash
npx prisma migrate deploy
```

This will:
- Add new columns to `User` table
- Create `Achievement` table
- Create `UserAchievement` table
- Create `DailyChallenge` table
- Create `DailyChallengeResult` table
- Add indexes for performance

### Step 6: Seed Achievements

```bash
npm run seed
```

This creates all 10 achievements in the database.

Expected output:
```
Start seeding achievements...
✓ Achievement: First Steps
✓ Achievement: Speed Learner
✓ Achievement: Fast Typer
✓ Achievement: Speed Demon
✓ Achievement: Precise
✓ Achievement: Almost Perfect
✓ Achievement: Perfectionist
✓ Achievement: Consistent
✓ Achievement: Marathon Runner
✓ Achievement: Century Club
Seeding finished.
```

### Step 7: Backfill User Stats (Optional but Recommended)

This script will calculate stats for existing users based on their past results:

```typescript
// Run this in a separate file or via Prisma Studio
// File: scripts/backfill-stats.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function backfillUserStats() {
    const users = await prisma.user.findMany({
        include: {
            results: true
        }
    })

    for (const user of users) {
        if (user.results.length === 0) continue

        const bestWpm = Math.max(...user.results.map(r => r.wpm))
        const bestAccuracy = Math.max(...user.results.map(r => r.accuracy))
        const totalTests = user.results.length

        await prisma.user.update({
            where: { id: user.id },
            data: {
                bestWpm,
                bestAccuracy,
                totalTests,
                currentStreak: 0, // Will be calculated on next test
                longestStreak: 0,
                lastTestDate: user.results[user.results.length - 1].created
            }
        })

        console.log(`✓ Updated stats for ${user.email}`)
    }
}

backfillUserStats()
    .then(() => console.log('Done!'))
    .catch(console.error)
    .finally(() => prisma.$disconnect())
```

Run it:
```bash
npx ts-node scripts/backfill-stats.ts
```

### Step 8: Restart Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Step 9: Verify Migration

Check the following:

1. **Database Tables**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('Achievement', 'UserAchievement', 'DailyChallenge', 'DailyChallengeResult');
```

2. **User Columns**
```sql
-- Check new columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'User'
AND column_name IN ('bestWpm', 'bestAccuracy', 'totalTests', 'currentStreak');
```

3. **Achievements Count**
```sql
-- Should return 10
SELECT COUNT(*) FROM "Achievement";
```

4. **Access New Pages**
- Visit `http://localhost:3000/leaderboard`
- Visit `http://localhost:3000/challenge`
- Visit `http://localhost:3000/profile` (check achievements section)

---

## 🔄 Rollback Plan

If something goes wrong:

### Option 1: Rollback Migration

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back <migration_name>

# Apply previous version
git checkout <previous_commit>
npx prisma migrate deploy
```

### Option 2: Restore Database Backup

```bash
# Restore from backup
psql -U your_user -d your_database < backup.sql
```

---

## 🎯 Post-Migration Tasks

### 1. Set Admin Emails (If Not Already)

```bash
# In .env file
ADMIN_EMAILS=your-email@example.com,admin2@example.com
```

### 2. Add Some Sample Texts

Ensure you have texts for daily challenges:
```sql
-- Check text count
SELECT COUNT(*), difficulty, time FROM "Text" GROUP BY difficulty, time;
```

Need at least a few MEDIUM difficulty, 60-second texts for daily challenges.

### 3. Test All Features

- [ ] Complete a typing test
- [ ] Check if stats update (bestWpm, totalTests, etc.)
- [ ] View leaderboard
- [ ] Try daily challenge
- [ ] Check achievements on profile
- [ ] Verify streak tracking (complete test next day)

### 4. Monitor Performance

Watch for:
- Slow leaderboard queries (add indexes if needed)
- Daily challenge generation time
- Stats update performance

---

## 📊 Database Performance Optimization

If you have many users (>1000), consider:

### Add Composite Indexes

```sql
-- For faster leaderboard queries
CREATE INDEX idx_user_leaderboard ON "User"(bestWpm DESC, bestAccuracy DESC);

-- For daily challenge queries
CREATE INDEX idx_daily_challenge_date ON "DailyChallenge"(date DESC);

-- For user achievements
CREATE INDEX idx_user_achievement_user ON "UserAchievement"(userId, unlockedAt DESC);
```

### Optimize Leaderboard Query

```typescript
// Add pagination
const leaderboard = await prisma.user.findMany({
    // ... existing query
    skip: (page - 1) * limit,
    take: limit
})
```

---

## 🐛 Troubleshooting

### Issue: Migration Fails

**Error**: "Column already exists"
```
Solution: Check if you have pending migrations
npx prisma migrate status
npx prisma migrate resolve --applied <migration_name>
```

**Error**: "Foreign key constraint fails"
```
Solution: Ensure all related data exists
- Check if texts exist for DailyChallenge
- Verify user IDs are valid
```

### Issue: Seed Script Fails

**Error**: "Unique constraint failed"
```
Solution: Achievements already exist, safe to ignore
Or run: npx prisma db seed --reset
```

### Issue: Stats Not Updating

**Check**:
1. Verify API route changes are deployed
2. Check browser console for errors
3. Verify database connection
4. Check if `updateUserStats` is being called

**Debug**:
```typescript
// Add logging in results/create.tsx
console.log('Creating result:', validatedData)
console.log('Updating user stats for:', user.id)
```

### Issue: Daily Challenge Not Generating

**Check**:
1. Ensure texts exist in database
2. Check difficulty and time match (MEDIUM, 60)
3. Verify API route is accessible

**Fix**:
```sql
-- Add sample text if none exist
INSERT INTO "Text" (id, text, difficulty, time, created, updated)
VALUES (
    gen_random_uuid(),
    'Your sample text here...',
    'MEDIUM',
    60,
    NOW(),
    NOW()
);
```

---

## 📞 Support

If you encounter issues:

1. Check console/server logs
2. Verify database schema with `npx prisma studio`
3. Review migration files in `prisma/migrations/`
4. Check API responses in browser Network tab

---

## ✅ Success Checklist

After migration, you should have:

- [x] All new database tables created
- [x] 10 achievements seeded
- [x] User stats columns populated
- [x] Leaderboard accessible
- [x] Daily challenge working
- [x] Achievements displaying on profile
- [x] No errors in console
- [x] All existing features still working

---

**Migration Version**: 2.0.0
**Last Updated**: 2026-03-18
**Estimated Time**: 10-15 minutes
