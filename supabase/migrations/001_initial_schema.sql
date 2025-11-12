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
    user_id TEXT NOT NULL, -- Can be 'anonymous' or a UUID
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

-- Create indexes for better query performance
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
-- Users can only read and update their own profile
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Quizzes Policies
-- Anyone can read quizzes by ID (for shared links)
CREATE POLICY "Anyone can view quizzes by ID"
    ON public.quizzes FOR SELECT
    USING (true);

-- Only authenticated users can create quizzes
CREATE POLICY "Authenticated users can create quizzes"
    ON public.quizzes FOR INSERT
    WITH CHECK (auth.uid() = author_id);

-- Only quiz authors can update their quizzes
CREATE POLICY "Authors can update own quizzes"
    ON public.quizzes FOR UPDATE
    USING (auth.uid() = author_id);

-- Only quiz authors can delete their quizzes
CREATE POLICY "Authors can delete own quizzes"
    ON public.quizzes FOR DELETE
    USING (auth.uid() = author_id);

-- Quiz Attempts Policies
-- Anyone (including anonymous) can create quiz attempts
CREATE POLICY "Anyone can create quiz attempts"
    ON public.quiz_attempts FOR INSERT
    WITH CHECK (
        student_name IS NOT NULL AND 
        LENGTH(student_name) > 0 AND
        registration_number IS NOT NULL AND 
        LENGTH(registration_number) > 0 AND
        score >= 0 AND 
        score <= 100 AND
        violations >= 0
    );

-- Users can view attempts they took OR attempts for quizzes they created
CREATE POLICY "Users can view own attempts or created quiz attempts"
    ON public.quiz_attempts FOR SELECT
    USING (
        auth.uid()::text = user_id OR 
        auth.uid() = author_id
    );

-- Users can update attempts they took OR quiz authors can update attempts for their quizzes
CREATE POLICY "Users can update own attempts or authors can update quiz attempts"
    ON public.quiz_attempts FOR UPDATE
    USING (
        auth.uid()::text = user_id OR 
        auth.uid() = author_id
    )
    WITH CHECK (
        -- Prevent modification of critical fields
        score >= 0 AND 
        score <= 100 AND
        violations >= 0
    );

-- Users can delete attempts they took OR quiz authors can delete attempts for their quizzes
CREATE POLICY "Users can delete own attempts or authors can delete quiz attempts"
    ON public.quiz_attempts FOR DELETE
    USING (
        auth.uid()::text = user_id OR 
        auth.uid() = author_id
    );
