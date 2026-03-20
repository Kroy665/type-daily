# New Features Documentation

## 🎉 What's New

We've added three major features to Type Daily:

1. **Global Leaderboard** 🏆
2. **Daily Challenges** 🎯
3. **Enhanced Analytics & Achievements** 📊

---

## 🏆 1. Global Leaderboard

### Features
- **Global Rankings**: See top 100 typers worldwide
- **Multiple Sort Options**:
  - Best WPM
  - Best Accuracy
  - Current Streak
  - Total Tests
- **Your Rank Card**: Highlighted card showing your position
- **Real-time Stats**: Total tests, current streak, longest streak

### How It Works
- Automatically tracks your best WPM and accuracy
- Updates in real-time after each test
- Rank calculated based on your best performance

### Access
Navigate to `/leaderboard` or click "Leaderboard" in the header

---

## 🎯 2. Daily Challenges

### Features
- **New Challenge Daily**: Fresh typing challenge every 24 hours
- **Challenge Leaderboard**: Compete with others on the same text
- **One Attempt Per Day**: Each challenge can only be completed once
- **Timed Typing**: Complete the challenge within the time limit
- **Instant Results**: See your ranking immediately after completion

### How It Works
1. Visit `/challenge` to see today's challenge
2. Click "Start Challenge" when ready
3. Type the text as fast and accurately as possible
4. Submit automatically when time runs out
5. See your ranking on the daily leaderboard

### Challenge Details
- **Auto-Generated**: System picks a random medium difficulty text daily
- **60 Second Timer**: Standard time limit for all challenges
- **Scoring**: Based on WPM and accuracy

---

## 📊 3. Enhanced Analytics & Achievements

### New Profile Features

#### Achievements System
10 unlockable achievements:

| Achievement | Requirement | Icon |
|-------------|-------------|------|
| First Steps | Complete first test | 🎯 |
| Speed Learner | Reach 50 WPM | 🚀 |
| Fast Typer | Reach 75 WPM | ⚡ |
| Speed Demon | Reach 100+ WPM | 👹 |
| Precise | 90%+ accuracy | 🎓 |
| Almost Perfect | 95%+ accuracy | 💎 |
| Perfectionist | 100% accuracy | 👑 |
| Consistent | 7-day streak | 🔥 |
| Marathon Runner | 30-day streak | 🏃 |
| Century Club | 100 total tests | 💯 |

#### Streak Tracking
- **Current Streak**: Consecutive days of typing
- **Longest Streak**: Your personal best
- **Auto-Reset**: Breaks if you miss a day
- **Daily Tracking**: One test per day maintains streak

#### Personal Bests
- **Best WPM**: Highest words per minute achieved
- **Best Accuracy**: Highest accuracy percentage
- **Total Tests**: Lifetime test count
- **Global Rank**: Your position on the leaderboard

---

## 🗄️ Database Changes

### New Models

```prisma
User:
  - bestWpm: Int
  - bestAccuracy: Int
  - totalTests: Int
  - currentStreak: Int
  - longestStreak: Int
  - lastTestDate: DateTime

Achievement:
  - type: AchievementType (enum)
  - name: String
  - description: String
  - icon: String

UserAchievement:
  - userId + achievementId (relation)
  - unlockedAt: DateTime

DailyChallenge:
  - date: DateTime (unique)
  - textId: String
  - difficulty: Difficulty
  - timeLimit: Int

DailyChallengeResult:
  - userId + challengeId (unique per user per challenge)
  - wpm, accuracy, wrongWords
```

---

## 🚀 Setup Instructions

### 1. Update Environment Variables

No new environment variables required! The features work with existing setup.

### 2. Run Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Create migration (when ready)
npx prisma migrate dev --name add_leaderboard_and_challenges

# Or apply existing migrations
npx prisma migrate deploy
```

### 3. Seed Achievements

```bash
npm run seed
```

This creates all 10 achievements in the database.

### 4. Restart Development Server

```bash
npm run dev
```

---

## 📡 New API Endpoints

### Leaderboard
- `GET /api/leaderboard/global?orderBy=bestWpm&limit=100`
- `GET /api/leaderboard/user-rank`

### Daily Challenges
- `GET /api/challenges/today`
- `POST /api/challenges/submit`

### Achievements
- `GET /api/achievements/user`

---

## 🎨 New Pages

1. **`/leaderboard`** - Global leaderboard with rankings
2. **`/challenge`** - Daily typing challenge
3. **`/profile`** - Enhanced with achievements section

---

## 🔧 Technical Implementation

### Auto Stats Update
Every time a user completes a test:
1. Check if new personal best (WPM/Accuracy)
2. Update total test count
3. Calculate streak (consecutive days)
4. Check and unlock achievements
5. Update global rank

### Streak Calculation
- Tests on same day don't increment streak
- Tests on consecutive days increment by 1
- Missing a day resets streak to 1
- Longest streak is preserved separately

### Achievement Unlocking
- Checked automatically after each test
- Uses database constraints to prevent duplicates
- Unlocked achievements are permanent

---

## 🎯 Future Enhancements

### Planned Features
- [ ] Weekly leaderboard resets
- [ ] Friends-only leaderboard
- [ ] Challenge difficulty variations
- [ ] Custom challenges
- [ ] Achievement notifications/toasts
- [ ] Streak recovery (miss 1 day grace period)
- [ ] Share results on social media
- [ ] Monthly challenge calendar

---

## 🐛 Known Issues

1. **First Load Performance**: Large leaderboards may be slow
   - Solution: Add pagination

2. **Timezone Handling**: Daily challenges based on server time
   - Solution: Add user timezone preference

3. **Streak Edge Cases**: May not handle timezone changes perfectly
   - Solution: Improve date comparison logic

---

## 📝 Testing Checklist

- [ ] Complete a typing test and verify stats update
- [ ] Check leaderboard ranking appears correctly
- [ ] Attempt daily challenge
- [ ] Verify achievement unlocking
- [ ] Test streak tracking over multiple days
- [ ] Check all sorting options on leaderboard
- [ ] Verify mobile responsiveness

---

## 💡 Tips for Users

1. **Build Your Streak**: Type daily to unlock Marathon Runner achievement
2. **Practice Accuracy First**: Perfect accuracy unlocks Perfectionist badge
3. **Daily Challenges**: Great way to compete with others
4. **Check Leaderboard**: See how you stack up globally
5. **Profile Page**: Track your progress over time

---

**Version**: 2.0.0
**Last Updated**: 2026-03-18
**Compatibility**: Next.js 14, Prisma 5, PostgreSQL
