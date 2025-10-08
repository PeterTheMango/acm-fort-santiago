# ACM Fort Santiago - Learning Platform

A gamified learning platform built with Next.js 15, featuring user progression, community challenges, and interactive trivia.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup and Installation](#setup-and-installation)
- [How to Use](#how-to-use)
- [Gamification Features](#gamification-features)
- [Project Structure](#project-structure)

## Features

- **User Authentication**: Secure login via Clerk
- **Gamification System**: Points, levels, badges, and achievements
- **Activity Streaks**: Daily engagement tracking
- **Community Quests**: Collaborative challenges
- **Daily Tech Trivia**: Test your knowledge daily
- **Leaderboards**: Compete with other learners
- **Social Features**: Connect with peers
- **Dark/Light Mode**: Theme customization

## Tech Stack

- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **Authentication**: Clerk
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Styling**: Tailwind CSS with next-themes for dark mode
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Setup and Installation

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Firebase project
- Clerk account

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd acm-fort-santiago
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## How to Use

### Navigation

The platform uses a collapsible sidebar navigation with the following sections:

1. **Dashboard** - Overview of your activity, quests, and trivia
2. **Courses** - Browse available learning content
3. **Upcoming Events** - View scheduled workshops and seminars
4. **Leaderboards** - See top performers and your ranking
5. **Social** - Connect with other learners

### User Profile

Access your profile by clicking on your avatar in the sidebar footer:

- **View Profile** - See your stats, level, and badges
- **Theme** - Switch between Light, Dark, or System theme
- **Logout** - Sign out of your account
- **Admin Panel** - (Admins only) Access administrative features

### Dashboard Features

The dashboard displays:

- **Community Quest** - Current active community challenge with progress tracking
- **Weekly Coding Challenge** - Programming challenges to test your skills
- **Daily Tech Trivia** - Answer trivia questions to earn rewards
- **Activity Streak** - Visual display of your consecutive active days
- **Upcoming Events** - Calendar of scheduled events

## Gamification Features

### 1. Experience Points (XP) & Levels

**Location**: Profile header (top-right corner shows current level)

**How it works**:
- Earn XP by completing activities (trivia, quests, challenges)
- Each level requires progressively more XP
- Level badge displayed on your avatar
- XP progress bar shown in platform layout header

**Visual Indicator**:
- Level number displayed on a badge icon overlay on your avatar
- Progress notification appears when gaining XP

### 2. Activity Streaks

**Location**: Dashboard → Activity Streak card (bottom section)

**How it works**:
- Tracks consecutive days of activity
- Activities that count: Daily trivia, quest contributions
- Streak updates automatically when you complete eligible activities
- Shows current streak and best streak record

**Visual Design**:
- Large flame icon background
- Current streak count prominently displayed
- "Best: X days" shows your longest streak below

**Benefits**:
- Encourages daily engagement
- Builds consistent learning habits

### 3. Community Quests

**Location**: Dashboard → First card in top row (labeled "COMMUNITY QUEST")

**How it works**:
- Admin creates quests with target contributor counts
- Users participate to help reach the goal
- Real-time progress tracking via progress bar
- Rewards distributed upon quest completion

**Reward Tiers**:
- **All Contributors** (🏆 Amber icon): Points/XP for everyone who participated
- **Top Contributor** (🥇 Purple icon): Bonus rewards for top performers

**Visual Indicators**:
- Quest icon (📜)
- Progress bar showing contributors/target
- Reward tooltips on hover

### 4. Daily Tech Trivia

**Location**: Dashboard → Third card in top row (labeled "DAILY TECH TRIVIA")

**How it works**:
- New trivia question released daily
- Multiple choice format
- One attempt per day
- Immediate feedback on answers
- Correct answers earn points and update streak

**Rewards**:
- Configurable points for correct answers
- Streak continuation
- XP contribution towards leveling up

**States**:
- Active: "Answer Today's Trivia" button
- Completed: "Already Answered Today" (disabled)
- No Question: "No Trivia Available" (disabled)

### 5. Badges & Achievements

**Location**:
- Profile header (displayed badges shown next to username)
- Full collection viewable in profile page

**How it works**:
- Awarded for specific accomplishments
- Users can select which badges to display (up to 3)
- Hover over badges to see their names and meanings

**Badge Types**:
- Achievement badges
- Event participation badges
- Special recognition badges
- Milestone badges

### 6. Leaderboards

**Location**: Sidebar → Leaderboards section

**How it works**:
- Rankings based on total XP
- Updates in real-time
- Shows user's current position
- Displays top performers

**Categories**:
- Overall ranking
- Level-based rankings
- Weekly/Monthly leaders

### 7. Points System

**How Points are Earned**:

| Activity | Points Awarded |
|----------|---------------|
| Correct Trivia Answer | Configured per question |
| Quest Contribution | Varies by quest |
| Challenge Completion | Varies by challenge |
| Daily Login | Streak bonus |

**Points Usage**:
- Contribute to XP for leveling up
- Determine leaderboard position
- Unlock achievements and badges

### 8. Visual Feedback

**Notifications**:
- Toast notifications appear for:
  - XP gained
  - Level up achievements
  - Streak updates
  - Rewards earned
  - Quest contributions

**Progress Indicators**:
- XP progress bar in header
- Quest progress bars
- Streak flame animation
- Level badge on avatar

## Project Structure

```
acm-fort-santiago/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin panel routes
│   ├── (platform)/               # Main platform routes
│   │   ├── layout.tsx           # Platform layout with XP tracking
│   │   ├── page.tsx             # Dashboard
│   │   └── leaderboards/        # Leaderboards page
│   ├── api/                     # API routes
│   └── layout.tsx               # Root layout
├── actions/                      # Server actions
│   └── user-actions.ts          # User data fetching
├── components/                   # React components
│   ├── admin/                   # Admin components
│   ├── profile/                 # Profile components
│   └── ui/                      # shadcn/ui components
├── handlers/                     # Business logic
│   ├── admin-handler.ts         # Admin operations
│   ├── level-handler.ts         # Level/XP calculations
│   ├── points-handler.ts        # Points management
│   ├── streak-handler.ts        # Streak tracking
│   └── user-handler.ts          # User operations
├── lib/                         # Utilities
│   └── firebase/                # Firebase configuration
│       ├── types.ts             # TypeScript types
│       └── user-manager.ts      # User CRUD operations
├── service/                     # Service layer
│   ├── firebase-service.ts      # Firebase utilities
│   └── storage-service.ts       # File storage
└── public/                      # Static assets
    ├── level.png                # Level badge icon
    ├── streak.png               # Streak flame icon
    ├── quest.png                # Quest icon
    └── trivia.png               # Trivia icon
```

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Admin Features

Admin users (with `role: "admin"` in Firebase) have access to:

- **Admin Panel**: Create and manage quests, trivia, events
- **User Management**: View and modify user data
- **Analytics**: Track platform engagement
- **Content Creation**: Add new challenges and content

Access admin panel via the shield icon in the user dropdown menu.

## Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ by the ACM Fort Santiago Team**
