# Abyss Climber - Replit Configuration

## Overview

Abyss Climber is a full-stack web application that gamifies rock climbing progress tracking. Built with a "Made in Abyss" anime theme, it allows users to log climbing sessions, track boulder problems, complete quests, and progress through different "layers" of difficulty. The app combines climbing data with RPG-style elements like experience points, achievements, and a whistle-based level system.

**Current Status**: Fully functional with completely redesigned skill system using grade-based progression instead of XP. Features 5 organized skill categories with accordion-style UI, independent quest management with complete/discard functionality, and grade-based whistle advancement. All components display real user data with no placeholder content.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

### ✓ Session Management System Overhaul (Latest - January 2025)
- **Session Detail Pages**: Added complete session detail view with `/session/:id` route
- **Session List Page**: Created dedicated sessions page (`/sessions`) with monthly grouping and statistics
- **Backend Session API**: Added GET `/api/sessions/:id` endpoint with proper authentication and ownership checks
- **Enhanced Navigation**: Fixed 404 errors when clicking on past sessions from RecentSessions component
- **Session Data Persistence**: All session data properly stored and retrieved from PostgreSQL database
- **Session Grouping**: Sessions organized by month with summary statistics
- **Boulder Problems Display**: Session details show all associated boulder problems with grades and completion status
- **Responsive Design**: Mobile-first design with proper spacing and hover effects

### ✓ Profile Picture System Enhancement (January 2025)
- **Real File Upload**: Complete file upload system using multer with local storage
- **Image Validation**: Comprehensive file type, size, and format validation
- **Auto Cleanup**: Automatic deletion of old profile images when new ones are uploaded
- **Enhanced UI**: Improved button styling and responsive layout for profile picture controls
- **Error Handling**: Better error messages and user feedback for upload failures

### ✓ Core Features Implemented
- **7-Layer progression system** based on Made in Abyss layers (Edge of Abyss → Final Maelstrom)
- **Skill-based whistle system** (Bell → White Whistle) with grade-based progression instead of XP
- **Concrete quest system** with trackable goals like "Complete 5 boulder problems with difficulty V2"
- **Daily skill-focused quests** that target users' weakest skills for balanced progression
- **Climbing session tracking** for indoor/outdoor sessions with boulder problem logging
- **Grade conversion system** supporting V-Scale, Fontainebleau, and German grading systems
- **Progress analysis** with AI insights on strengths, weaknesses, and recommendations
- **Mobile-responsive UI** with Made in Abyss-inspired dark fantasy theme and immersive animations

### ✓ Code Cleanup & Optimization (January 2025)
- **Consolidated Session Management**: Created custom useSession hook to eliminate duplicate timer and state logic
- **Removed Automatic Quest Updates**: Fully decoupled quest system from session activities - quest progress is now entirely manual
- **Component Refactoring**: Cleaned up SessionIndicator, SessionTracker, and session page to remove redundant code
- **Performance Improvements**: Added loading skeleton states to prevent UI flickering and reduce unnecessary re-renders
- **UI/UX Enhancements**: Improved button labeling, consistent navigation patterns, and better error handling
- **Session State Management**: Fixed three-state model (idle/active/paused) with accurate timer behavior and proper persistence

### ✓ Enhanced Features (Latest Updates - January 2025)
- **XP-Based Layer Progression**: Replaced quest-based layer advancement with XP thresholds (Layer 1: 0 XP to Layer 7: 12,000 XP)
- **Automatic Layer Advancement**: Players advance layers automatically when reaching XP thresholds
- **Diverse Quest Type System**: 7 distinct quest categories (Technique, Creative, Social, Endurance, Progression, Exploration, Mindfulness) with 35+ unique templates
- **Smart Quest Variety**: Each quest type offers unique challenges beyond simple "complete X problems" format
- **Intelligent Type Selection**: System ensures variety by tracking used quest types and limiting progression quests to 1 per day
- **Creative Quest Mechanics**: Includes blindfolded climbing, beta breaking, style switching, elimination games, and mindfulness practices
- **Social Integration**: Encourages community interaction through teaching, group challenges, and peer support quests
- **Endurance Challenges**: Time trials, circuits, stamina builders, and consecutive problem challenges
- **One-Time Layer Quests**: Special high-XP quests for each layer (300-3000 XP) generated only once per layer
- **Proper Random Selection**: Uses crypto-quality randomization to ensure different quests each time
- **Quest Adaptation**: Daily quests automatically adapt to user's skill level and current layer
- **Comprehensive Quest Tracking**: Quests track by grade, style, wall angle, and location requirements
- **Fallback AI Generation**: When all template pool is exhausted, system falls back to AI-generated quests
- **Real-time XP Progress**: Progress bars show exact XP needed for next layer advancement
- **Grade-based Whistle System**: Whistle levels still advance based on highest climbing grade achieved
- **Independent Quest Management**: Complete or discard quests outside of climbing sessions (manual completion only)
- **Enhanced Progress Display**: Shows XP progress, total XP, and layer advancement status
- **Session Pause/Resume System**: Users can now pause climbing sessions and resume them later
- **Session Status Tracking**: Sessions track status (active/paused/completed) in database
- **Session Persistence**: Active sessions are preserved when navigating away from session screen
- **Session Indicator**: Visual indicator shows when a session is active or paused across the app
- **Flexible Session Management**: Users can leave sessions without ending them, maintaining progress
- **Decoupled Quest System**: Quest completion is entirely manual - no automatic progress tracking from session activities

### ✓ Enhanced Profile Experience (January 2025)
- **Comprehensive Achievement System**: 20+ unique achievements across 4 categories (Explorer, Climber, Master, Special) with icons, descriptions, and XP rewards
- **Visual Achievement Cards**: Modern card-based UI showing unlocked achievements with progress bars for locked ones
- **Profile Picture Upload**: Full profile picture upload system with circular avatar display and file validation
- **XP Progress Visualization**: Real-time layer progress bar showing current XP and progress to next layer
- **Achievement Unlock Conditions**: Smart achievement tracking based on quest completion, climbing milestones, session goals, and progression markers
- **Motivational UI Elements**: Engaging visual design with fantasy-themed icons, progress indicators, and achievement categories
- **Profile Statistics**: Enhanced stats display including total completed quests alongside sessions and problems
- **Achievement Categories**: Organized achievements by Explorer (quest-based), Climber (session/problem-based), Master (progression-based), and Special (unique challenges)
- **Real-time Achievement Checking**: Manual achievement unlock system with progress tracking and XP rewards
- **Persistent Achievement Storage**: All achievements stored in database with unlock timestamps and progress tracking

### ✓ Technical Implementation
- **Database**: PostgreSQL with Drizzle ORM, all tables created and configured
- **Authentication**: Replit Auth with session management and automatic skill initialization
- **API Integration**: OpenAI API key configured for quest generation and analysis
- **Frontend**: React with Tailwind CSS, complete mobile-first design with fantasy animations
- **Backend**: Express.js with comprehensive API routes and skill progression system

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state and caching
- **UI Components**: Radix UI primitives with custom Tailwind CSS styling
- **Styling**: Tailwind CSS with custom theme variables for the "Made in Abyss" aesthetic

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with JSON responses

### Key Components

#### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **Schema**: Located in `shared/schema.ts` for type sharing between client and server
- **Tables**: Users, climbing sessions, boulder problems, quests, achievements, and sessions
- **Migrations**: Handled through Drizzle Kit with schema-first approach

#### Authentication System
- **Provider**: Replit Auth with OIDC integration
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: HTTP-only cookies with secure flags in production
- **User Management**: Automatic user creation/updates on authentication

#### API Structure
- **Base Path**: `/api` for all backend routes
- **Authentication**: Session-based with middleware protection
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Validation**: Zod schemas for request/response validation

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, creating/updating user records
2. **Session Management**: Climbing sessions are created and tracked with start/end times
3. **Problem Logging**: Boulder problems are associated with sessions and include grades, attempts, and completion status
4. **Quest System**: AI-generated quests are created based on user progress and climbing history
5. **Progress Tracking**: XP, achievements, and layer progression are calculated from climbing data
6. **Real-time Updates**: TanStack Query manages cache invalidation and optimistic updates

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL (serverless PostgreSQL)
- **Authentication**: Replit Auth service
- **AI Integration**: OpenAI API for quest generation and progress analysis
- **UI Components**: Radix UI for accessible component primitives

### Development Tools
- **TypeScript**: Full type safety across the stack
- **ESLint/Prettier**: Code formatting and linting
- **Vite**: Development server and build tool
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Development Environment
- **Development Server**: Vite dev server with HMR for frontend
- **Backend Server**: Express server with tsx for TypeScript execution
- **Database**: Neon PostgreSQL with connection pooling
- **Environment Variables**: Required for DATABASE_URL, SESSION_SECRET, and OPENAI_API_KEY

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Process**: Single Node.js process serving both API and static files

### Key Features
- **Mobile-First Design**: Responsive design optimized for mobile climbing use
- **Offline Capability**: Client-side caching for offline session tracking
- **Progressive Web App**: Service worker for app-like experience
- **Real-time Analytics**: Live progress tracking and statistics

The application follows a monorepo structure with shared types and utilities, enabling efficient development and deployment on the Replit platform.