# Layman News App

Layman is a premium, AI-powered news reader designed to simplify complex news into easy-to-understand summaries.

## ✨ Features
- **AI-Powered Summaries**: Complex articles simplified for a 10-year-old using Gemini.
- **Voice Interaction**: Ask Layman questions using your voice and hear the bot talk back.
- **Push Notifications**: Real-time "Breaking News" alerts.
- **Reading Streak**: Gamified daily usage tracking.
- **Offline Mode**: Read your saved articles anywhere, even without internet.
- **Real-time Sync**: Your bookmarks sync instantly across all your devices.

---

## 🚀 Getting Started

### 1. Installation
Navigate to the app directory and install dependencies:
```bash
cd layman-app
npm install
```

### 2. Environment Variables
Create a `.env` file in the `layman-app` directory with the following:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_NEWSDATA_API_KEY=your_newsdata_api_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run the App
```bash
npx expo start
```

---

## 🛠 Backend Setup (Supabase)

We use the Supabase CLI to manage our database migrations.

### 1. Database Migrations
To apply the schema to your remote Supabase project:

1. **Login to Supabase**:
   ```bash
   npx supabase login
   ```

2. **Link your project**:
   (Replace `your-project-ref` with your actual project ID from the Supabase dashboard)
   ```bash
   npx supabase link --project-ref your-project-ref
   ```

3. **Push the schema**:
   ```bash
   npx supabase db push
   ```

### 2. Database Schema
The `saved_articles` table includes **Row Level Security (RLS)** and **Realtime** support.
- **Table**: `saved_articles`
- **Security**: Users can only access their own data.
- **Sync**: Enabled for real-time updates.

---

## 📱 Interactive Walkthroughs
Detailed walkthroughs of implemented features can be found in the project artifacts directory.


## AI Workflow
- Used Antigravity for code generation
- Used ChatGPT for debugging and planning
- Defined AI rules using CLAUDE.md for consistency
- Broke tasks into smaller prompts and iterated step-by-step.