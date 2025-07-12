# Abyss Climber - Replit Configuration

## Overview

Abyss Climber is a full-stack web application that gamifies rock climbing progress tracking. Built with a "Made in Abyss" anime theme, it allows users to log climbing sessions, track boulder problems, complete quests, and progress through different "layers" of difficulty. The app combines climbing data with RPG-style elements like experience points, achievements, and a whistle-based level system.

**Current Status**: Fully functional with all core features implemented including concrete quest completion system, climbing progress analysis, and grade conversion between V-Scale, Fontainebleau, and German systems. All components now display real user data with no placeholder content.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

### ✓ Core Features Implemented
- **7-Layer progression system** based on Made in Abyss layers (Edge of Abyss → Final Maelstrom)
- **Skill-based whistle system** (Red → White Whistle) with individual skill tracking and XP progression
- **Concrete quest system** with trackable goals like "Complete 5 boulder problems with difficulty V2"
- **Daily skill-focused quests** that target users' weakest skills for balanced progression
- **Climbing session tracking** for indoor/outdoor sessions with boulder problem logging
- **Grade conversion system** supporting V-Scale, Fontainebleau, and German grading systems
- **Progress analysis** with AI insights on strengths, weaknesses, and recommendations
- **Mobile-responsive UI** with Made in Abyss-inspired dark fantasy theme and immersive animations

### ✓ Enhanced Features (Latest Updates)
- **Skill System**: Six climbing skills (crimps, dynos, movement, strength, balance, flexibility)
- **Automatic Skill XP**: Boulder problems award XP based on grade and climbing style
- **Daily Quests**: Skill-targeted daily challenges with Made in Abyss themed lore
- **Fantasy UI**: Immersive animations including whistle-pulse, floating, curse effects, and relic shimmer
- **Session Form**: Comprehensive session tracking with problem logging and skill progression
- **Real-time Progress**: Live skill tracking with visual progression indicators
- **Quest Completion**: Interactive quest completion, discard, and generation with progress tracking
- **Layer Progress**: Real-time layer advancement based on completed quests and climbing achievements

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