# QuizMasterAI

AI-powered quiz platform with advanced anti-cheat features and real-time analytics.

## Features

### For Teachers/Admins
- **AI Quiz Generation** - Create quizzes using Google Gemini AI on any topic
- **Share Quizzes** - Multiple sharing options (link, QR code, email, social media)
- **Real-time Analytics** - Performance tracking and AI-powered insights
- **Leaderboard** - Students ranked by score with trophy system
- **Delete Management** - Remove individual attempts or entire quizzes
- **Review System** - View detailed student answers and performance

### For Students
- **Take Quizzes** - Clean, distraction-free interface
- **Review Answers** - See correct/incorrect answers after completion
- **Mobile Responsive** - Works seamlessly on all devices
- **Anti-Cheat Monitoring** - Fair testing environment

### Anti-Cheat System
- **Browser Lockdown** - Fullscreen mode with keyboard lock
- **Screenshot Detection** - Blocks all screenshot methods
- **Tab Switching Detection** - Monitors focus changes
- **AI Agent Detection** - Identifies automation tools
- **3-Strike Policy** - Auto-submit after violations
- **Wake Lock** - Prevents screen sleep during quiz

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini (via Genkit)
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Supabase Auth (Email + Google OAuth)

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account ([supabase.com](https://supabase.com))
- Google AI API key ([makersuite.google.com](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone and install:**
   ```bash
   git clone <your-repo-url>
   cd quiz-main
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_API_KEY=your_google_ai_api_key
   ```

4. **Set up Supabase database:**
   
   Go to your Supabase project → SQL Editor and run:

   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Create user_profiles table
   CREATE TABLE IF NOT EXISTS public.user_profiles (
       id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
       email TEXT NOT NULL,
       display_name TEXT NOT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
   );

   -- Create quizzes table
   CREATE TABLE IF NOT EXISTS public.quizzes (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       title TEXT NOT NULL,
       topic TEXT NOT NULL,
       difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
       questions JSONB NOT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
   );

   -- Create quiz_attempts table
   CREATE TABLE IF NOT EXISTS public.quiz_attempts (
       id UUID PRIMARY KEY,
       quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
       quiz_title TEXT NOT NULL,
       user_id TEXT NOT NULL,
       user_name TEXT NOT NULL,
       student_name TEXT NOT NULL,
       registration_number TEXT NOT NULL,
       author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       answers JSONB NOT NULL,
       score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
       started_at TIMESTAMPTZ NOT NULL,
       completed_at TIMESTAMPTZ NOT NULL,
       violations INTEGER NOT NULL CHECK (violations >= 0),
       is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
       created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
   );

   -- Create indexes
   CREATE INDEX IF NOT EXISTS idx_quizzes_author_id ON public.quizzes(author_id);
   CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON public.quizzes(created_at DESC);
   CREATE INDEX IF NOT EXISTS idx_quiz_attempts_author_id ON public.quiz_attempts(author_id);
   CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
   CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
   CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at DESC);

   -- Enable Row Level Security
   ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

   -- User Profiles Policies
   CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

   -- Quizzes Policies
   CREATE POLICY "Anyone can view quizzes by ID" ON public.quizzes FOR SELECT USING (true);
   CREATE POLICY "Authenticated users can create quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = author_id);
   CREATE POLICY "Authors can update own quizzes" ON public.quizzes FOR UPDATE USING (auth.uid() = author_id);
   CREATE POLICY "Authors can delete own quizzes" ON public.quizzes FOR DELETE USING (auth.uid() = author_id);

   -- Quiz Attempts Policies
   CREATE POLICY "Anyone can create quiz attempts" ON public.quiz_attempts FOR INSERT 
   WITH CHECK (
       student_name IS NOT NULL AND 
       LENGTH(student_name) > 0 AND
       registration_number IS NOT NULL AND 
       LENGTH(registration_number) > 0 AND
       score >= 0 AND 
       score <= 100 AND
       violations >= 0
   );

   CREATE POLICY "Users can view own attempts or created quiz attempts" ON public.quiz_attempts FOR SELECT 
   USING (
       auth.uid()::text = user_id OR 
       auth.uid() = author_id
   );

   CREATE POLICY "Users can update own attempts or authors can update quiz attempts" ON public.quiz_attempts FOR UPDATE 
   USING (
       auth.uid()::text = user_id OR 
       auth.uid() = author_id
   )
   WITH CHECK (
       score >= 0 AND 
       score <= 100 AND
       violations >= 0
   );

   CREATE POLICY "Users can delete own attempts or authors can delete quiz attempts" ON public.quiz_attempts FOR DELETE 
   USING (
       auth.uid()::text = user_id OR 
       auth.uid() = author_id
   );

   -- Auto-create user profile function
   CREATE OR REPLACE FUNCTION public.handle_new_user() 
   RETURNS TRIGGER AS $$
   BEGIN
       INSERT INTO public.user_profiles (id, email, display_name, created_at)
       VALUES (
           NEW.id,
           NEW.email,
           COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
           NOW()
       );
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Trigger for new users
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   CREATE TRIGGER on_auth_user_created 
       AFTER INSERT ON auth.users 
       FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

5. **Configure Google OAuth (Optional):**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add your Google OAuth credentials

6. **Start development server:**
   ```bash
   npm run dev
   ```

7. **Open your browser:**
   ```
   http://localhost:9002
   ```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Admin dashboard
│   ├── quiz/               # Quiz pages
│   └── layout.tsx          # Root layout
├── components/
│   ├── dashboard/          # Admin components
│   ├── quiz/               # Quiz-taking components
│   ├── shared/             # Shared components
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and types
└── supabase/               # Supabase client and types
```

## Available Scripts

```bash
npm run dev          # Start development server (port 9002)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

## Key Features Explained

### Leaderboard System
- Students automatically ranked by score
- Top 3 get trophy icons (🏆 Gold, 🥈 Silver, 🥉 Bronze)
- Visual hierarchy with gradient backgrounds
- Mobile-responsive card layout

### Anti-Cheat Features
- **Fullscreen Mode**: Automatically enters fullscreen
- **Keyboard Lock**: Blocks Alt+Tab, Windows key, etc. (Chrome/Edge)
- **Screenshot Detection**: Blocks PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5
- **Tab Detection**: Monitors visibility changes
- **AI Detection**: Identifies automation tools (Selenium, Puppeteer)
- **Wake Lock**: Prevents screen sleep (Chrome/Edge)

### Share Options
- Direct link copy
- QR code generation
- Email sharing
- WhatsApp, Facebook, Twitter, LinkedIn

### Analytics Dashboard
- Real-time performance tracking
- Score distribution charts
- Performance trends over time
- AI-powered summaries
- Student statistics

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Core Features | ✅ | ✅ | ✅ | ✅ |
| Keyboard Lock | ✅ | ✅ | ⚠️ | ❌ |
| Wake Lock | ✅ | ✅ | ❌ | ❌ |

**Recommended**: Chrome or Edge for full anti-cheat features

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `GOOGLE_API_KEY` | Google AI API key for quiz generation | Yes |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted

## Troubleshooting

### Database Connection Issues
- Verify Supabase URL and keys in `.env.local`
- Check if tables are created in Supabase
- Ensure RLS policies are enabled

### Quiz Generation Fails
- Verify Google AI API key is valid
- Check API quota limits
- Ensure network connectivity

### Anti-Cheat Not Working
- Use Chrome or Edge for full features
- Check browser permissions
- Ensure HTTPS in production

## License

MIT

## Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ using Next.js, Supabase, and Google AI**
