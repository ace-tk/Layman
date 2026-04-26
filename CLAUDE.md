# CLAUDE.md - Layman Project Guide

## 1. Project Overview
- **App Name**: Layman
- **Mission**: A simplified news reader focused on business, tech, and startups, designed to make complex topics easy for everyone to understand.
- **Tech Stack**: React Native (Expo) + Supabase (Auth/DB) + NewsData.io (API) + Google Gemini (AI).

## 2. Key Features
- **Authentication**: Secure login/signup via Supabase Auth.
- **Home Screen**: Featured article carousel + category-based news list.
- **Article Detail**: Immersive reading experience with "Layman Cards" (2-sentence summaries).
- **Bookmarks**: Save articles for later reading; synced in real-time across devices.
- **Profile Screen**: User stats, Reading Streak (gamification), and settings.
- **Interactive AI Chat**: "Ask Layman" voice-enabled chat for contextual article summaries.

## 3. Coding Rules
- **Structure**: Use functional components with React Hooks (useState, useEffect, useMemo).
- **Modularity**: Keep components focused, reusable, and small.
- **Data Flow**: Use centralized services for all API and side-effect logic (e.g., `src/services/newsService.ts`, `src/services/aiService.js`).
- **Real Data**: Avoid hardcoded data in the final application; pull from real APIs.
- **Organization**: Maintain a clean `src/` directory (components, screens, services, navigation, context).
- **TypeScript**: Use strict typing for props, state, and API responses.

## 4. UI Guidelines
- **Palette**: Warm, inviting colors (#FFF0E5 background, #FF8A65 accent).
- **Aesthetics**: Rounded corners (20px-30px), consistent 16px/20px padding, and soft shadows.
- **Design System**: Minimalist and modern; prioritize whitespace and readability.
- **Feedback**: Use subtle haptics (impactLight) for buttons, tabs, and bookmarks.

## 5. API Usage
- **NewsData.io**: Primary source for global technology and business articles.
- **Supabase**: Handles User Auth, real-time database syncing, and Row Level Security (RLS).
- **Google Gemini**: Powers the "Layman" AI voice chat and article simplification.

## 6. Important Constraints
- **Headlines**: Strictly target 48–52 characters for main titles to maintain layout consistency.
- **Article Detail**: Must follow the horizontal "swipe card" summary layout.
- **Data Integrity**: Ensure offline support via AsyncStorage for saved articles.
- **Reliability**: All haptic and notification calls must be wrapped in try/catch for safety.

## 7. Development Notes
- **Simplicity First**: Prefer clean, native solutions over adding heavy third-party libraries.
- **Performance**: Optimize lists with `FlatList` and memoize expensive calculations.
- **UX Focus**: Every interaction should feel premium, smooth, and interactive.

## 8. Structured AI Workflow
Always follow this 4-step process for every feature:
1.  **/plan**: Research requirements and break the feature into logical, actionable steps.
2.  **/implement**: Write clean, modular code following the project's coding rules and UI guidelines.
3.  **/review**: Perform self-checks for bugs, edge cases, responsiveness, and UI fidelity.
4.  **/commit**: Provide a clear, professional summary of the changes made.

