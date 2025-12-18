# ACM Fort Santiago - Learning Platform

A gamified learning platform built with Next.js 15, featuring user progression, community challenges, and interactive trivia. This platform provides an engaging learning experience through points, levels, badges, streaks, and collaborative quests.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup and Installation](#setup-and-installation)
- [Contributing](#contributing)
- [How to Use](#how-to-use)
- [Gamification Features](#gamification-features)
- [Project Structure](#project-structure)
- [Development Commands](#development-commands)
- [Admin Features](#admin-features)

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

### Frontend
- **Framework**: Next.js 15.5.4 with App Router and Turbopack
- **UI Library**: React 19
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Component Library**: shadcn/ui (New York variant)
- **Animations**: tw-animate-css
- **Theme**: next-themes for dark/light mode
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono

### Backend & Services
- **Authentication**: Clerk (with middleware protection)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Server Actions**: Next.js Server Actions for data mutations

### Development Tools
- **Build Tool**: Turbopack
- **Linting**: ESLint with Next.js recommended config
- **Package Manager**: npm/bun
- **Path Aliases**: `@/*` for clean imports

## Architecture

### Route Groups
The application uses Next.js route groups to organize pages without affecting URL structure:

- **`app/(platform)/`** - Main application pages (dashboard, leaderboards, courses, events, social)
  - Protected by Clerk authentication middleware
  - Uses `PlatformLayout` with sidebar navigation and XP tracking
  - Real-time user data syncing

- **`app/(admin)/`** - Admin-specific pages for content management
  - Role-based access control (requires `role: "admin"` in Firebase)
  - Quest, trivia, and event creation/management
  - User analytics and moderation

- **`app/(api)/`** - API routes grouped separately
  - Server-side data operations
  - Firebase integration endpoints

### Authentication Flow
- **Clerk Integration**: Full authentication via `@clerk/nextjs`
- **Middleware Protection**: Root-level `middleware.ts` protects routes
- **Public Routes**: `/sign-in`, `/sign-up`, and static assets excluded
- **User Sync**: Clerk user data synchronized with Firebase on sign-in
- **Session Management**: Automatic session handling via `ClerkProvider`

### Layout Hierarchy
```
RootLayout (app/layout.tsx)
├── ClerkProvider - Authentication context
├── ThemeProvider - Dark/light mode support
└── PlatformLayout (app/(platform)/layout.tsx)
    ├── Sidebar Navigation - Collapsible with user profile
    ├── XP Progress Bar - Real-time experience tracking
    └── Page Content - Dynamic route rendering
```

### Data Layer

#### Firebase Structure
```
firestore/
├── users/                    # User profiles and progress
│   ├── {userId}/
│   │   ├── points: number
│   │   ├── level: number
│   │   ├── experience: number
│   │   ├── streak: number
│   │   ├── displayedBadges: Badge[]
│   │   └── ...
├── quests/                   # Community quests
│   ├── {questId}/
│   │   ├── title: string
│   │   ├── description: string
│   │   ├── targetContributors: number
│   │   ├── currentContributors: number
│   │   ├── rewards: Reward[]
│   │   └── ...
├── trivia/                   # Daily trivia questions
│   ├── {triviaId}/
│   │   ├── question: string
│   │   ├── options: string[]
│   │   ├── correctAnswer: number
│   │   └── ...
└── events/                   # Upcoming events
```

#### Handlers & Services
- **`handlers/`** - Business logic layer
  - `level-handler.ts` - XP calculations and level progression
  - `points-handler.ts` - Points awarding and validation
  - `streak-handler.ts` - Daily streak tracking
  - `user-handler.ts` - User CRUD operations
  - `admin-handler.ts` - Admin content management

- **`service/`** - Infrastructure layer
  - `firebase-service.ts` - Firebase utilities and queries
  - `storage-service.ts` - File upload/download management

- **`actions/`** - Server Actions
  - `user-actions.ts` - Server-side user data fetching

### Styling System
- **CSS Variables**: Theme colors defined in `globals.css`
- **Dark Mode**: Automatic theme switching with `next-themes`
- **Utility Function**: `cn()` in `lib/utils.ts` combines `clsx` + `tailwind-merge`
- **Component Styling**: shadcn/ui components use CSS variables for theming

### Path Aliases
Configured in `tsconfig.json` and `components.json`:
```typescript
"@/*"              // Root directory
"@/components"     // React components
"@/components/ui"  // shadcn/ui components
"@/lib"            // Utility functions
"@/hooks"          // Custom React hooks
"@/handlers"       // Business logic
"@/service"        // Infrastructure services
"@/actions"        // Server actions
```

## Setup and Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v10.0.0 or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))

### Required External Services

You'll need accounts and API keys for:

1. **Clerk** - Authentication service
   - Create account at [clerk.com](https://clerk.com)
   - Create a new application
   - Get your publishable and secret keys

2. **Firebase** - Database and storage
   - Create project at [firebase.google.com](https://firebase.google.com)
   - Enable Firestore Database
   - Enable Storage
   - Get your Firebase configuration

### Installation Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd acm-fort-santiago
```

#### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using bun (faster):
```bash
bun install
```

#### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxx
```

**Important**: Never commit `.env.local` to version control. It's already included in `.gitignore`.

#### 4. Configure Firebase

1. In your Firebase Console, set up Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see `firestore.rules` if available)

2. Set up Firebase Storage:
   - Go to Storage
   - Get started with default rules
   - Configure CORS if needed for file uploads

#### 5. Configure Clerk

1. In your Clerk Dashboard:
   - Go to "API Keys" and copy your keys to `.env.local`
   - Configure sign-in/sign-up settings
   - Set up redirect URLs:
     - Development: `http://localhost:3000`
     - Production: Your deployed URL

#### 6. Run the Development Server

```bash
npm run dev
```

Or with bun:
```bash
bun run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

#### 7. Verify Installation

1. Open browser to `http://localhost:3000`
2. Sign up for a new account
3. Check that authentication works
4. Verify Firebase connection in browser console

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Troubleshooting

#### Port Already in Use
If port 3000 is taken, specify a different port:
```bash
PORT=3001 npm run dev
```

#### Firebase Connection Issues
- Verify all Firebase environment variables are correct
- Check Firebase project settings
- Ensure Firestore and Storage are enabled

#### Clerk Authentication Issues
- Verify Clerk keys are correct
- Check that redirect URLs are configured
- Ensure `NEXT_PUBLIC_` prefix is used for client-side variables

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules
npm install
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

We welcome contributions to ACM Fort Santiago! Please follow these guidelines to ensure a smooth collaboration process.

### Branch Structure

The project uses a three-tier branch strategy:

```
production (main) ← staging ← dev branches
```

- **`production`** (main branch) - Production-ready code, deployed to live environment
- **`staging`** - Pre-production testing branch, used for integration testing
- **`dev branches`** - Individual feature/fix branches created by contributors

### Contribution Workflow

#### 1. Create Your Development Branch

**IMPORTANT**: Always create your branch from `staging`, NOT from `production`.

```bash
# Ensure you're on staging branch
git checkout staging

# Pull latest changes
git pull origin staging

# Create your feature branch with a descriptive name
git checkout -b feature/your-feature-name
```

#### Branch Naming Conventions

Use descriptive branch names that clearly indicate what you're working on:

**Features:**
```bash
feature/add-quiz-system
feature/user-profile-page
feature/leaderboard-filters
```

**Bug Fixes:**
```bash
fix/streak-calculation-bug
fix/avatar-upload-error
fix/navigation-mobile-view
```

**Enhancements:**
```bash
enhance/improve-xp-animations
enhance/optimize-firebase-queries
enhance/update-theme-colors
```

**Refactoring:**
```bash
refactor/user-handler-logic
refactor/component-structure
refactor/api-error-handling
```

#### 2. Make Your Changes

```bash
# Work on your changes
# ... code, test, commit ...

# Commit with clear messages
git add .
git commit -m "feat: add quiz system with multiple choice questions"
```

**Commit Message Guidelines:**
- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Prefix with type: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Keep first line under 50 characters
- Add detailed description if needed

#### 3. Keep Your Branch Updated

Regularly sync with `staging` to avoid merge conflicts:

```bash
# Fetch latest changes
git fetch origin

# Merge staging into your branch
git checkout your-branch-name
git merge origin/staging

# Or use rebase (cleaner history)
git rebase origin/staging
```

#### 4. Test Your Changes

Before submitting a pull request:

- [ ] Run the development server and test functionality
- [ ] Check for console errors and warnings
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Run linting: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Test authentication flows
- [ ] Verify Firebase operations work correctly

#### 5. Push Your Branch

```bash
# Push your branch to remote
git push origin your-branch-name
```

#### 6. Create a Pull Request

1. Go to the repository on GitHub
2. Click "New Pull Request"
3. **Important**: Set base branch to `staging` (not `production`)
4. Set compare branch to your feature branch
5. Fill out the PR template:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Enhancement
- [ ] Refactoring
- [ ] Documentation

## Changes Made
- List specific changes
- Include file modifications
- Mention new dependencies if any

## Testing
- [ ] Tested locally
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Build passes

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

6. Request review from maintainers
7. Wait for approval and address any feedback

#### 7. After PR Approval

Once approved:
- Your PR will be merged into `staging`
- Delete your feature branch (locally and remotely)
- `staging` will be tested and eventually merged to `production`

```bash
# Delete local branch
git checkout staging
git branch -d your-branch-name

# Delete remote branch
git push origin --delete your-branch-name
```

### Code Style Guidelines

#### TypeScript
- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` type - use proper typing
- Use type imports: `import type { User } from '@/lib/firebase/types'`

#### React Components
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop typing

```typescript
interface ComponentProps {
  title: string;
  onAction: () => void;
  isLoading?: boolean;
}

export function Component({ title, onAction, isLoading = false }: ComponentProps) {
  // Component logic
}
```

#### File Organization
- Place components in `components/` directory
- Use `components/ui/` for shadcn/ui components only
- Business logic goes in `handlers/`
- Firebase operations in `service/`
- Server actions in `actions/`

#### Styling
- Use Tailwind CSS classes
- Follow existing design patterns
- Use `cn()` utility for conditional classes
- Leverage CSS variables for theme colors
- Test both light and dark modes

#### Import Order
```typescript
// 1. React and Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party libraries
import { toast } from 'sonner'

// 3. Internal components
import { Button } from '@/components/ui/button'
import { UserCard } from '@/components/profile/user-card'

// 4. Utilities and types
import { cn } from '@/lib/utils'
import type { User } from '@/lib/firebase/types'

// 5. Relative imports
import { helper } from './helper'
```

### What to Contribute

#### Good First Issues
- UI improvements and polish
- Bug fixes
- Documentation updates
- Adding tests
- Accessibility improvements

#### Feature Ideas
- New gamification mechanics
- Additional content types
- Social features enhancements
- Analytics and reporting
- Mobile app integration

#### Areas Needing Help
- Performance optimization
- Security enhancements
- Accessibility (a11y)
- Internationalization (i18n)
- Test coverage

### Getting Help

- **Questions?** Open a discussion in GitHub Discussions
- **Bug?** Create an issue with detailed steps to reproduce
- **Feature idea?** Open a feature request issue
- **Stuck?** Reach out to maintainers in the issue comments

### Code Review Process

All PRs go through review:
1. Automated checks (linting, build)
2. Code review by maintainers
3. Testing in staging environment
4. Approval and merge

Be patient and responsive to feedback. Reviews help maintain code quality and consistency.

---

Thank you for contributing to ACM Fort Santiago!

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
