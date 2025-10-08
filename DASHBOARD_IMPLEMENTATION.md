# Dashboard Implementation - Community Quests, Daily Trivia & Streaks

## Overview
This implementation adds full functionality for community quests, daily trivia, and user activity streaks to the main dashboard page with real-time Firebase updates.

## Features Implemented

### 1. **Community Quests** 🎯
- **Real-time Quest Display**: Active quests are fetched from Firebase and updated in real-time
- **Progress Tracking**: Shows current contributors vs target goal with a progress bar
- **Reward System**: Displays rewards for all contributors and top contributors
- **Contribution Submission**: Users can submit their quest contributions with:
  - Optional submission URL (e.g., GitHub link)
  - Required description of their work
- **One-Time Contribution**: Users can only contribute once per quest
- **Automatic Rewards**: XP/Points are automatically awarded when contribution is submitted
- **Quest Completion**: Quests automatically mark as completed when target is reached

### 2. **Daily Trivia** 🧠
- **Real-time Trivia Loading**: Fetches active trivia questions from Firebase
- **Multiple Choice Interface**: Dynamic choice rendering with visual feedback
- **Answer Submission**: 
  - Submit answers and receive immediate feedback (correct/incorrect)
  - Green highlight for correct answers
  - Red highlight for incorrect selections
- **One Answer Per Day**: Users can only answer once per day
- **Automatic Rewards**: Correct answers award configured XP/Points
- **Streak Update**: Answering trivia updates the user's activity streak

### 3. **Activity Streak System** 🔥
- **Unified Streak Tracking**: Tracks daily activity from both trivia and quest contributions
- **Once Per Day Update**: Streak only updates once per day, even with multiple activities
- **Consecutive Day Logic**: 
  - Increments by 1 if activity happens on consecutive days
  - Resets to 1 if a day is missed
- **Longest Streak Tracking**: Keeps track of the user's best streak
- **Visual Display**: Shows current streak with flame icon and best streak indicator

## File Structure

### New Files Created
```
handlers/
  └── streak-handler.ts          # Manages user streak logic

components/ui/
  └── textarea.tsx                # Textarea component for contributions
```

### Modified Files
```
app/(platform)/
  └── page.tsx                    # Main dashboard with quest, trivia, and streak features

handlers/
  └── admin-handler.ts            # Added quest contribution tracking functions
```

## Firebase Collections

### Collections Used
1. **`community-quests`**
   - Stores active community quests created by admins
   - Fields: title, description, targetContributors, currentContributors, rewards, status

2. **`quest-contributions`**
   - Tracks user contributions to quests
   - Fields: questId, userId, submissionUrl, submissionText, contributedAt

3. **`daily-trivia`**
   - Stores daily trivia questions
   - Fields: question, choices[], correctAnswer, rewards[], startDate, endDate, status

4. **`trivia-answers`**
   - Records user answers to trivia
   - Fields: triviaId, userId, answer, isCorrect, answeredAt

5. **`user-streaks`**
   - Tracks user activity streaks
   - Fields: userId, currentStreak, longestStreak, lastActivityDate

## Key Functions

### Streak Handler (`handlers/streak-handler.ts`)
- `getUserStreak(userId)` - Fetches user's streak data
- `updateStreak(userId)` - Updates streak (max once per day)
- `hasUpdatedStreakToday(userId)` - Checks if streak already updated today

### Admin Handler (`handlers/admin-handler.ts`)
- `submitQuestContribution()` - Records quest contribution and awards rewards
- `hasUserContributedToQuest()` - Checks if user already contributed
- `getQuestContributions()` - Gets all contributions for a quest
- `submitTriviaAnswer()` - Records trivia answer and awards rewards
- `hasUserAnsweredTrivia()` - Checks if user already answered
- `getActiveDailyTrivia()` - Fetches current active trivia
- `getActiveCommunityQuests()` - Fetches current active quests

## Real-time Updates

The dashboard uses Firebase's `onSnapshot` to provide real-time updates:

```typescript
// Real-time quest updates
subscribe<CommunityQuest>(
  "community-quests",
  async (quests) => {
    // Updates when quest data changes in Firebase
    const activeQuestsList = quests.filter((q) => q.status === "active");
    setActiveQuests(activeQuestsList);
  }
);
```

This means:
- ✅ Quest progress updates instantly when other users contribute
- ✅ New quests appear automatically when admins create them
- ✅ Completed quests disappear from the dashboard in real-time

## User Flow

### Contributing to a Quest
1. User sees active quest on dashboard with current progress
2. Clicks "Contribute" button
3. Fills in contribution form (URL optional, description required)
4. Submits contribution
5. System checks if already contributed (prevents duplicates)
6. Records contribution in Firebase
7. Updates quest contributor count
8. Awards rewards (XP/Points) immediately
9. Updates user's activity streak
10. Shows success message with streak count

### Answering Daily Trivia
1. User sees daily trivia card on dashboard
2. Clicks "Answer Today's Trivia"
3. Reads question and selects an answer
4. Clicks "Submit Answer"
5. System checks if already answered today
6. Records answer in Firebase
7. Shows correct/incorrect feedback
8. Awards rewards if correct
9. Updates user's activity streak
10. Shows success message with rewards and streak

### Streak Maintenance
- Answering trivia OR contributing to a quest updates the streak
- Only ONE streak update allowed per day (whichever happens first)
- Missing a day resets the streak to 1 on next activity
- Consecutive days increment the streak by 1
- Best streak is always preserved

## Admin Management

Admins can create and manage quests and trivia through the admin panel:

### Creating a Quest
- Define title and description
- Set target contributor count
- Configure rewards for all contributors and top contributor
- Quest automatically tracks progress and completes when target is reached

### Creating Daily Trivia
- Write question and provide 4 choices
- Specify correct answer
- Set rewards (XP/Points)
- Configure start/end dates
- Trivia automatically becomes active during the specified period

## Benefits

1. **Engagement**: Daily activities keep users coming back
2. **Gamification**: Streaks, rewards, and progress bars motivate participation
3. **Real-time**: Instant feedback and live updates enhance user experience
4. **Fair**: One contribution/answer per day prevents gaming the system
5. **Flexible**: Admins can easily create new challenges through the admin panel
6. **Scalable**: Firebase real-time database handles concurrent users efficiently

## Future Enhancements

Potential improvements:
- Leaderboard for longest streaks
- Streak recovery (pay points to restore broken streak)
- Weekly quest challenges with bigger rewards
- Trivia difficulty levels
- Contribution voting/rating system
- Quest categories and tags
- Push notifications for new quests/trivia
- Streak milestones with special badges
