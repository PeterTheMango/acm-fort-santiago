# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 15.5.4 application with React 19, TypeScript, Tailwind CSS v4, and Clerk authentication. The project uses the App Router architecture with route groups and includes shadcn/ui component integration.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Architecture

### Route Groups
The application uses Next.js route groups to organize pages without affecting URL structure:
- `app/(platform)/` - Main application pages
- `app/(admin)/` - Admin-specific pages (currently empty)
- `app/(api)/` - API routes grouped separately

### Authentication
- Clerk integration via `@clerk/nextjs` for authentication
- Middleware configured at root level (`middleware.ts`) to protect routes
- Authentication UI components in root layout:
  - `SignInButton`, `SignUpButton` for unauthenticated users
  - `UserButton` for authenticated users
- Middleware matcher excludes static assets and Next.js internals

### Layout Structure
- Root layout (`app/layout.tsx`) wraps entire application with:
  - `ClerkProvider` for authentication context
  - Geist font family (sans and mono variants)
  - Global header with auth UI
  - Tailwind CSS utilities applied via `globals.css`

### Styling
- Tailwind CSS v4 with PostCSS
- `tw-animate-css` for animations
- shadcn/ui design system configured (New York style variant)
- CSS custom properties for theming with light/dark mode support
- Utility function `cn()` in `lib/utils.ts` for class name composition using `clsx` and `tailwind-merge`

### Path Aliases
Configured in `tsconfig.json` and `components.json`:
- `@/*` - Root directory
- `@/components` - UI components
- `@/components/ui` - shadcn/ui components
- `@/lib` - Utility functions
- `@/hooks` - Custom React hooks

### shadcn/ui Integration
- Configured with New York style variant
- Icon library: Lucide React
- CSS variables enabled for theming
- Component registry ready (currently empty)
- Base color: neutral

### TypeScript Configuration
- Target: ES2017
- Strict mode enabled
- Path aliases use `@/*` prefix
- Next.js plugin enabled for enhanced type checking

### Linting
- ESLint with Next.js recommended config
- TypeScript-aware linting enabled
- Ignores: `node_modules/`, `.next/`, `out/`, `build/`, `next-env.d.ts`

## Environment Variables
- `.env.local` contains Clerk API keys (not tracked in git)
- Required for authentication to work locally
- Always use shadcn-ui mcp tools when creating or updating components in the project.