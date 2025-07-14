# Abyss Climber - Replit Configuration

## Overview

Abyss Climber is a full-stack web application that gamifies rock climbing progress tracking. Built with a "Made in Abyss" anime theme, it allows users to log climbing sessions, track boulder problems, complete quests, and progress through different "layers" of difficulty. The app combines climbing data with RPG-style elements like experience points, achievements, and a whistle-based level system.

**Current Status**: Fully functional with completely redesigned skill system using grade-based progression instead of XP. Features 5 organized skill categories with accordion-style UI, independent quest management with complete/discard functionality, and grade-based whistle advancement. All components display real user data with no placeholder content. **Latest Update**: Enhanced skill system with improved readability, fixed multi-style progression, and AI-powered quest completion analysis - skills now progress both from boulder problems and quest completions with intelligent skill development recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

### ✓ Notification Toggle System & Grade System Readability Fix (Latest - January 2025)
- **Notification Toggle Feature**: Added toggleable notification system in profile settings with database persistence
- **Database Schema Update**: Added `notificationsEnabled` field to users table with default value of `true`
- **API Integration**: Created `/api/user/notifications` endpoint for updating user notification preferences
- **Universal Notification Control**: All toast notifications (XP, achievements, relics) now respect user's notification preference
- **Grade System Readability Fix**: Fixed white text on grey background issue in grade system dropdown with proper contrast
- **Enhanced Settings UI**: Improved settings section with functional Switch components and better styling
- **Mobile-Optimized**: Notification preferences work seamlessly across all devices and screen sizes

### ✓ Fixed Relic System Toast Notifications & Stacking (January 2025)
- **Fixed Toast Notification Bug**: Increased toast limit from 1 to 3 and added timing delay to prevent relic notifications from being overridden by "Problem Added" toast
- **Enhanced Relic Toast Visibility**: Improved relic toast styling with bright yellow theme and 8-second duration for better visibility
- **Relic Stacking Feature**: Implemented grouping of duplicate relics with count displays (e.g., "(2) Apprentice Whistle")
- **Comprehensive Logging**: Added detailed console logging for relic drop debugging and monitoring
- **Fixed Relic Drop Probability**: Corrected critical bug in relic drop logic that prevented proper 10% drop chance calculation
- **Cache Invalidation**: Added proper cache invalidation for relic data to update UI immediately when relics are found
- **Grouped Relic Display**: Relics with same name are now grouped together showing count and combined history when clicked
- **Enhanced Relic Details**: Clicking grouped relics shows detailed history of all finds with dates, layers, and grades

### ✓ Enhanced Food Scan Functionality (January 2025)
- **Automatic Macro Addition**: Fixed food scan function to automatically add scanned food to daily macros instead of just analyzing
- **Enhanced Feedback System**: Updated client-side to show comprehensive feedback including Nanachi's personality-driven comments about food
- **Improved Nutrition Tracking**: Scanned food now creates nutrition entries with complete macro breakdown and scan metadata
- **Confidence-Based Notifications**: Low confidence scans show additional warnings to users for manual adjustment if needed
- **Real-time Macro Updates**: Food scanning now provides immediate daily nutrition summary updates
- **Database Integration**: Enhanced scan data storage with confidence scores, timestamps, and Nanachi's nutritional insights

### ✓ Automatic Quest Generation System Optimization (January 2025)
- **Fixed Quest Generation Limits**: Corrected automatic quest generation to create exactly 3 daily quests and 1 weekly quest per user
- **Removed Manual Generation Buttons**: Eliminated manual quest generation buttons from home tab since quests are now fully automated
- **Enhanced Generation Logic**: Added comprehensive console logging and proper quest count validation to prevent over-generation
- **Daily Quest Control**: Fixed logic to check for existing daily quests and generate exactly 3 per day (not more, not less)
- **Weekly Quest Control**: Weekly quests now generate only if user has no active weekly quest and hasn't completed one in the last 7 days
- **Expired Quest Cleanup**: Implemented automatic cleanup of expired quests before generating new ones
- **24-Hour Daily Quest Regeneration**: Daily quests now properly expire after 24 hours and are automatically regenerated
- **7-Day Weekly Quest Regeneration**: Weekly quests now properly expire after 7 days and are automatically regenerated
- **Improved Error Handling**: Added proper error logging and fallback mechanisms in quest generation system
- **Updated UI Messages**: Changed home tab text to reflect automatic quest generation instead of manual button prompts
- **Background Generation**: Quests are generated automatically when users visit the app through authentication endpoint
- **Consistent Quest Counting**: Updated all quest count endpoints to properly filter expired quests and only count active ones
- **Fixed Daily Quest Allowance**: Modified quest generation to prevent replacement quests - users now start with 3 daily quests and total available decreases as they complete them (no new quests generated until next day)

### ✓ AbyssMap Component Optimization (January 2025)
- **Performance Optimization**: Moved LAYERS array outside component to prevent recreation on each render
- **Memory Optimization**: Added React.memo wrapper to prevent unnecessary re-renders
- **Code Structure**: Streamlined component structure with cleaner variable naming and reduced complexity
- **Accessibility Fix**: Added DialogDescription to fix accessibility warnings
- **Bundle Size**: Removed unused imports (getLayerInfo, X icon) to reduce bundle size
- **Render Performance**: Optimized layer styling calculations to reduce render time
- **Clean Architecture**: Separated data constants from component logic for better maintainability

### ✓ Comprehensive Nutrition Tracking System Implementation (January 2025)
- **Delver Tent Transformation**: Successfully transformed "Quests" tab into "Delver Tent" with tabbed interface featuring Quest and Nutrition submenus
- **Nutrition Database Schema**: Created complete nutrition database with tables for food entries, goals, and AI recommendations
- **AI-Powered Food Scanning**: Implemented OpenAI Vision API integration for analyzing food photos and providing detailed nutrition information
- **Nanachi Nutrition Service**: Created comprehensive nutrition service with AI-powered food analysis, personalized goal setting, and nutrition recommendations
- **Complete Nutrition API**: Implemented full API endpoints for food scanning, entry management, goal setting, and progress tracking
- **Nutrition Dashboard**: Built comprehensive nutrition dashboard with macro tracking, daily progress, and meal breakdown visualization
- **Personalized Recommendations**: AI-generated nutrition recommendations based on user goals, climbing performance, and dietary patterns
- **Food Image Analysis**: Real-time food scanning with nutrition breakdown and Nanachi's personality-driven insights
- **Nutrition Goal Setting**: Personalized nutrition goals based on climbing performance needs and user preferences
- **Nutrition Analytics**: Complete nutrition analysis with daily/weekly progress tracking and AI-powered insights
- **Tabbed Interface**: Seamless tabbed navigation between Quest management and Nutrition tracking within "Delver Tent"
- **Memory Integration**: Nutrition interactions stored in Nanachi's memory system for personalized future recommendations
- **Chat Goals Interface**: Interactive chat interface for discussing nutrition goals with Nanachi with quick-start options
- **Enhanced Personalized Insights**: Nanachi now provides insights based on climbing performance (whistle level, XP, grades, recent sessions)
- **Recipe Recommendations**: AI-generated personalized recipes with climbing benefits and Nanachi's personality-driven tips
- **Dynamic Macro Targets**: Calories, protein, carbs, and fat recommendations that adapt based on climbing needs and goals
- **Performance-Connected Analysis**: Nutrition insights directly connected to layer progression and whistle advancement
- **Independent Chat-Based Goals**: Nutrition tab now works independently based on chat goals - Nanachi saves goals and implements them automatically
- **Smart Goal Processing**: Chat conversations automatically update macro targets and personalized insights
- **Contextual Memory Integration**: Nutrition analysis references previous chat goals for consistent, personalized recommendations

### ✓ Nanachi AI Personal Assistant Implementation (January 2025)
- **Personal AI Assistant**: Implemented Nanachi from Made in Abyss as a personal climbing assistant with authentic character personality
- **Chat Interface**: Created complete chat interface with natural conversation flow, image upload, and real-time messaging
- **Image Analysis**: Integrated OpenAI Vision API for analyzing boulder problem photos and providing beta advice
- **Personalized Responses**: AI adapts responses based on user's current layer, whistle level, skills, and climbing progress
- **Made in Abyss Personality**: Nanachi uses characteristic speech patterns including "naa" and references to the Abyss
- **Boulder Problem Beta**: Provides specific technical advice about holds, body positioning, and movement from uploaded images  
- **User Data Integration**: Accesses user stats, skills, and progress to give targeted training recommendations
- **Chat History**: Maintains conversation context with message timestamps and user/assistant message separation
- **Mobile Responsive**: Fully responsive chat interface with image preview and smooth animations
- **Home Screen Integration**: Added "Nanachi" button in top right of home screen for easy access to AI assistant
- **Memory System**: Comprehensive memory system with database persistence for storing user interactions, preferences, and conversation history
- **Contextual Awareness**: Nanachi remembers past conversations and references them in future interactions for personalized responses
- **Progress Tab Integration**: Nanachi serves as the AI analyst for the Progress tab, providing personalized, character-driven analysis with memory integration
- **Intelligent Memory Management**: Automatic memory cleanup, importance scoring, and contextual retrieval for relevant conversation context
- **Personality-Driven Analysis**: Progress analysis features Nanachi's authentic character personality with personalized greetings and encouragement

### ✓ Natural Made in Abyss Visual Enhancements (January 2025)
- **Complete Visual Overhaul**: Merged mystical and natural elements inspired by Made in Abyss anime scenes throughout entire app
- **Natural CSS Effects**: Added moss-overlay, nature-background, waterfall-mist, vine-border, forest-shadow, and nature-spore animations
- **Organic Card Design**: Implemented nature-card styling with irregular borders and moss-like textures replacing standard cards
- **Living Background System**: Every page now has nature-background with moss overlays, forest canopy shadows, and floating spores
- **Waterfall & Mist Effects**: Added subtle waterfall-mist animations on progress page for atmospheric depth
- **Vine Growth Animations**: Animated vine borders that grow on component mount for organic feel
- **Natural Particle System**: Floating nature spores throughout app that simulate natural floating particles from the abyss
- **Layer Fog Effect**: Bottom fog layers on all pages creating depth and immersion
- **Balanced Theme Integration**: Maintained mystical elements (ancient-text, abyss-button) while adding natural textures
- **Full App Coverage**: Applied nature theme to: home, session, progress, profile, workout, quests, sessions, layer-overview, whistle-overview pages
- **Color Harmony**: Integrated green moss tones (rgba(34, 197, 94)) with existing abyss color palette
- **Subtle Implementation**: Natural effects kept subtle per user request - not overwhelming the interface
- **Firefly Particle System**: Added subtle firefly-like particles that float behind the UI for atmospheric effects - implemented across all major pages with varying animation delays
- **Firefly Animation**: Created firefly-float keyframes with gentle movement patterns, opacity changes, and multi-colored particles (amber, green, teal)
- **Atmospheric Enhancement**: Firefly particles positioned with bottom percentage positioning to create depth and natural floating effect behind interface elements

### ✓ Location Finder Implementation & Real Data Integration (January 2025)
- **Home Page Location Finder**: Moved location finder to home page after tab visibility issues - now accessible to all users
- **GPS Integration**: Implemented GPS location access with proper permission handling and error messages
- **Manual Location Search**: Added manual location input placeholder for future Google Places API integration
- **Real Data Only Policy**: Removed AI-generated fake locations - system now shows clear message about API requirements
- **Professional Implementation**: Ready for Google Places API integration for real climbing location data
- **Enhanced User Experience**: Clear messaging about real location services instead of placeholder data
- **Simplified Session Form**: Reduced session form to two tabs (Climbing Session, Home Workout) for better usability
- **Location Service Architecture**: Prepared backend for real location API integration with proper error handling

### ✓ Enhanced Skill System & AI-Powered Quest Completion (January 2025)
- **Fixed Multi-Style Skill Progression**: Boulder problems with multiple climbing styles now properly update all relevant skills
- **Improved Skill Tree Readability**: Complete UI redesign with better visual hierarchy, progress bars, and skill level indicators
- **AI-Powered Quest Completion Analysis**: Implemented OpenAI integration to analyze completed quests and automatically improve relevant skills
- **Enhanced Skill Display**: Added XP progress bars, level indicators, and grade system integration throughout skill tree
- **Better Skill Organization**: Cleaner category presentation with collapsible sections and intuitive skill grouping
- **Real-time Skill Updates**: Skills now update immediately when boulder problems are completed or quests are finished
- **Comprehensive Skill Tracking**: Each skill shows current level, total problems completed, and progress to next level
- **Grade System Integration**: All skill grades display in user's preferred grade system (V-Scale, Font, German)
- **Fixed Skill Cache Invalidation**: Added proper cache invalidation in SessionTracker to ensure skills update immediately
- **Improved Visual Design**: Added appropriate icons for each skill category and subcategory with gradient backgrounds
- **Enhanced Mobile Experience**: Single-column layout on mobile with larger touch targets and better spacing
- **Versatile Quest System**: Enhanced AI quest generation to create engaging quests targeting ALL skill types from the skill tree
- **Comprehensive Skill Coverage**: Resolved skill gap where only 37 of 60+ skills could be leveled through boulder problems
- **Creative Quest Templates**: Added 100+ fun quest templates across 8 quest types targeting specific skills
- **Dual Skill Progression**: Skills can now be leveled through both boulder problem completion AND AI-powered quest analysis
- **Fun & Engaging Quests**: Added creative challenges like "Silent Feet Challenge", "Beta Breaker", and "Visualization Victory"

### ✓ Layer Quest System Implementation (January 2025)
- **Database Schema**: Created layerQuests table with proper structure for layer-specific quest tracking
- **Predefined Layer Quests**: Implemented 7 unique layer quests themed to each layer with escalating difficulty:
  - Layer 1 (Edge of Abyss): Send 3 V2+ problems (150 XP)
  - Layer 2 (Forest of Temptation): Complete 3 overhang problems in one session (200 XP)
  - Layer 3 (Great Fault): Send 5 V4+ problems (300 XP)
  - Layer 4 (Goblets of Giants): Send 8 V4+ problems using all 4 grip types (600 XP)
  - Layer 5 (Sea of Corpses): Send 5 V5+ problems with 2 overhangs and 2 technical across sessions (800 XP)
  - Layer 6 (Capital of Unreturned): Send 25 V4+ problems across 5 sessions with 10 styles and 3 outdoor (1200 XP)
  - Layer 7 (Final Maelstrom): Send 3 V6+ problems including 1 V7+ overhang and perfect session (1500 XP)
- **Layer Quest UI Component**: Added LayerQuest component with progress tracking, completion buttons, and layer advancement
- **Dual Requirements System**: Users must complete both XP thresholds AND layer quests to advance
- **API Endpoints**: Layer quest management with progress tracking and completion
- **Real-time Updates**: Proper cache invalidation and XP tracking for immediate UI updates
- **Fixed Quest Display**: Only layer quests appear in Layer UI, daily/weekly quests excluded
- **XP System Integration**: Layer quest completion awards XP and updates user progression
- **Enhanced Difficulty Scaling**: Later layers (4-7) feature dramatically increased challenge requirements and XP rewards

### ✓ Multi-Platform Deployment & Developer Tools (January 2025)
- **APK Export Capabilities**: Complete Capacitor integration for Android APK generation with automated build scripts
- **Developer Reset Tools**: Development-only data reset functionality with secure user authentication and environment checks
- **Enhanced PWA Support**: Progressive Web App manifest with native app shortcuts, theme colors, and mobile optimization
- **Multi-Account Architecture**: Confirmed and documented existing robust multi-account support with proper per-user data separation
- **Build Automation**: One-click APK generation with build-android.sh script and proper Capacitor configuration
- **Mobile App Features**: Native Android app capabilities with splash screens, status bar theming, and app shortcuts
- **Developer UI Components**: Professional developer tools interface with confirmation dialogs and secure reset operations
- **PWA Manifest**: Complete Progressive Web App support with app shortcuts for quick session/progress access
- **Deployment Ready**: Full mobile deployment capabilities with both APK and PWA installation options

### ✓ Automatic Achievement Unlocking System Implementation (Latest - January 2025)
- **Automatic Achievement Unlocking**: Implemented automatic achievement detection and unlocking when users complete boulder problems or quests
- **Achievement Notification System**: Created toast notification system with `useAchievementNotification` hook to display achievement unlocks in real-time
- **Updated Server Response Format**: Modified server routes to return newly unlocked achievements along with original responses for seamless integration
- **Achievement Service Integration**: Enhanced `achievementService.checkAndUnlockAchievements()` to return newly unlocked achievements for instant notification
- **Component Updates**: Updated SessionTracker, ActiveQuests, and quest page components to handle achievement responses and show notifications
- **Removed Manual Achievement Checking**: Removed "Check Achievements" button from profile page since achievements now unlock automatically
- **Enhanced User Experience**: Users now receive immediate feedback when achievements are unlocked, eliminating need to manually check progress
- **Real-time Achievement Tracking**: Achievements unlock automatically after problem completion, quest completion, or session activities
- **Toast Notification Integration**: Multiple achievement unlocks displayed as sequential toast notifications with proper styling and timing
- **Cache Management**: Added proper cache invalidation for achievement queries to ensure UI updates immediately after unlocking

### ✓ Comprehensive Home Workout Feature Implementation (January 2025)
- **AI-Powered Workout Generation**: Complete OpenAI integration generating personalized workouts based on user's climbing stats, weaknesses, and recent activity
- **Workout Database Schema**: Added workoutSessions table with comprehensive workout tracking including type, intensity, duration, exercises, and XP rewards
- **Full Backend API System**: Implemented complete CRUD operations for workout generation, creation, retrieval, and completion with proper authentication
- **Dynamic Workout Types**: Four distinct workout categories (stretching, meditation, strength training, combo) with smart intensity scaling based on whistle rank
- **Session Management Integration**: Seamlessly integrated Home Workout tab into existing session form with tabbed interface (Climbing Session + Home Workout)
- **Complete UI System**: Built WorkoutSession component with timer, progress tracking, and exercise guidance plus WorkoutGenerator for AI-based workout creation
- **Dedicated Workout Page**: Full workout management page with generator, active session, and workout history tabs at `/workout` route
- **XP Reward System**: Workout completion awards XP based on duration and intensity, properly integrated with user progression system
- **Workout History Tracking**: Complete history of all workouts with completion status, XP earned, and detailed exercise breakdowns
- **Real-time Progress**: Timer-based workout sessions with pause/resume functionality and automatic completion tracking
- **Workout Analytics**: Smart workout recommendations based on user's current layer, whistle level, weakest skills, and recent climbing activity
- **Mobile-Responsive Design**: Fully responsive workout interface with Made in Abyss theme consistency and smooth animations

## Recent Changes (January 2025)

### ✓ Dynamic Layer System Unification (Latest - January 2025)
- **Created Shared Layer Configuration**: Unified layer configuration in `client/src/utils/layerConfig.ts` with consistent naming, icons, and descriptions across all components
- **Fixed Layer System Inconsistency**: Progress tab now uses same dynamic layer calculation as Home tab via `/api/layer-progress` endpoint
- **Enhanced Layer Display**: Added proper layer icons, colors, XP progress, and lore-based descriptions ("The Goblets of Giants", "Sea of Corpses", etc.)
- **Unified Layer Logic**: Both Home and Progress tabs now use `getLayerInfo()` function for consistent layer information display
- **Dynamic Layer Updates**: Layer information updates in real-time based on user's actual XP progression, not static user.currentLayer field
- **Complete Layer Details**: Progress tab now shows layer progress bar, XP requirements, and authentic layer descriptions matching the Made in Abyss lore

### ✓ Comprehensive Progress Tab Overhaul (January 2025)
- **Fixed Whistle XP System**: Implemented proper exponential XP thresholds (Red: 0, Blue: 500, Moon: 1500, Black: 3500, White: 7500)
- **Dynamic Progress Tracking**: Current XP and next level requirements update automatically based on user's total XP
- **Enhanced Whistle Display**: Added level titles, visual indicators, and proper whistle names for each rank
- **XP Breakdown Tooltip**: Interactive tooltip shows weekly XP earned, problems solved, and average grade with detailed breakdown
- **Expanded Statistics Section**: Added 6 comprehensive stats (Total Sessions, Problems Solved, Weekly Time, Best Grade, Avg Grade 7d, Session Consistency)
- **Personal Milestones System**: New section tracking First V5 Send, First Outdoor Session, Longest Send Streak, and Personal Best Session
- **Grade System Integration**: All grades display in user's preferred grade system throughout the progress page
- **Enhanced Data Queries**: Comprehensive backend queries for calculating streaks, milestones, and progress statistics
- **Real-time Performance Tracking**: Weekly time tracking, session consistency metrics, and milestone achievement dates
- **API Endpoint**: New `/api/enhanced-progress` endpoint providing complete progress analytics with whistles, stats, and milestones

### ✓ Complete Grade System Conversion Feature (January 2025)
- **Database Schema Update**: Added `preferredGradeSystem` field to users table with default "V-Scale"
- **Grade System Context**: Implemented app-wide grade system state management with useGradeSystem hook
- **Profile Settings**: Added functional dropdown in profile page to change preferred grade system
- **Client-Side Grade Converter**: Created comprehensive grade conversion utility supporting V-Scale, Fontainebleau, and German (Saxon) systems
- **Server-Side Grade Converter**: Updated server-side converter to handle all grade system conversions
- **Whistle Overview Update**: All whistle progression displays now show grades in user's preferred system
- **API Endpoint**: Added PATCH /api/user/grade-system endpoint for updating user preferences
- **Database Storage**: Added updateUserGradeSystem method to storage interface for persistence
- **Cache Management**: Proper cache invalidation for grade system changes affecting skills and progress
- **Real-time Updates**: Grade system changes apply immediately across all app components
- **Grade Range Conversion**: Dynamic conversion of grade ranges (e.g., "V3-V4" → "6A-6A+" for Font system)
- **Progress Tracking**: Whistle advancement progress properly converts grades for accurate tracking

### ✓ Comprehensive Code Cleanup & Performance Optimization (January 2025)
- **React.memo Optimization**: Added React.memo to key components (SessionIndicator, SessionControls, ActiveQuests, SessionTracker, Session page, Quest page) to prevent unnecessary re-renders
- **Error Boundary Implementation**: Added comprehensive error boundaries with custom ErrorBoundary component for better error handling and user experience
- **Enhanced Form Validation**: Improved form validation with real-time error feedback, visual error states, and better user guidance
- **Loading State Improvements**: Replaced custom loading spinners with consistent LoadingSpinner component throughout the app
- **Cache Management Optimization**: Enhanced cache invalidation patterns to ensure data consistency across all XP-changing operations
- **Component Code Cleanup**: Removed unused imports, consolidated constants, and optimized component structure
- **Enhanced Session Management**: Improved session form validation with proper error handling and user feedback
- **Quest System Polish**: Added better error handling, loading states, and cache invalidation for quest operations
- **Performance Monitoring**: Added error logging for better debugging and issue tracking
- **UI/UX Consistency**: Standardized loading states, error messages, and form validation across all components

### ✓ Comprehensive XP Reward System Implementation (Latest - January 2025)
- **Grade-Based XP Calculation**: Implemented scalable XP system with V0-V1 (5 XP), V2-V3 (10 XP), V4-V5 (15 XP), V6+ (20+ XP)
- **Smart XP Multipliers**: Attempt-based multipliers (1.5x for first attempt, 1.2x for ≤3 attempts, 0.8x for >10 attempts)
- **Style Bonus System**: 20% XP bonus for technical climbing styles (technical, balance, coordination, endurance)
- **Real-Time XP Tracking**: Live session XP counter showing current XP, completed problems, and average XP per problem
- **XP Persistence**: All XP data stored in PostgreSQL with proper user and session tracking
- **Session XP Summary**: Session detail pages display total XP earned with individual problem XP breakdown
- **XP Animation Effects**: Celebratory XP gain animations when problems are completed
- **Automatic User XP Updates**: User's total XP automatically updated when problems are completed
- **Layer Progression Integration**: XP properly contributes to existing layer advancement system
- **XP Display Components**: Reusable XP display components with breakdown views and different sizes

### ✓ Session Management System Overhaul (January 2025)
- **Session Detail Pages**: Added complete session detail view with `/session/:id` route showing XP earned
- **Session List Page**: Created dedicated sessions page (`/sessions`) with monthly grouping and statistics
- **Backend Session API**: Added GET `/api/sessions/:id` endpoint with proper authentication and ownership checks
- **Enhanced Navigation**: Fixed 404 errors when clicking on past sessions from RecentSessions component
- **Session Data Persistence**: All session data properly stored and retrieved from PostgreSQL database
- **Session Grouping**: Sessions organized by month with summary statistics
- **Boulder Problems Display**: Session details show all associated boulder problems with grades, completion status, and XP earned
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
- **XP-Based Layer Progression**: Replaced quest-based layer advancement with challenging XP thresholds (Layer 1: 0 XP to Layer 7: 35,000 XP)
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
- **Streamlined Navigation**: Progress tab with AI assistant in bottom navigation, Layers overview accessible via "View All Layers" button on home page
- **Comprehensive Layer Overview**: Dedicated screen showing all 7 layers with completion status and XP requirements, accessible from home page
- **Progressive Layer Difficulty**: Significantly increased XP requirements for each layer (Layer 2: 800 XP, Layer 3: 2,500 XP, Layer 4: 5,500 XP, Layer 5: 10,000 XP, Layer 6: 18,000 XP, Layer 7: 35,000 XP)
- **Whistle Progression Overview**: Dedicated screen showing all 6 whistle levels (Bell, Red, Blue, Moon, Black, White) with authentic progression requirements based on actual grade achievements, accessible via "View All Whistles" button on home page

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