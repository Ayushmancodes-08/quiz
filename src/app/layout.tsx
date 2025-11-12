import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseAuthProvider } from '@/hooks/use-supabase-auth';
import Header from '@/components/shared/header';
import { SupabaseProvider } from '@/supabase/provider';

export const metadata: Metadata = {
  title: {
    default: 'QuizMasterAI - AI-Powered Quiz Platform',
    template: '%s | QuizMasterAI',
  },
  description: 'Create AI-powered quizzes with advanced anti-cheat features. Real-time analytics, leaderboards, and comprehensive quiz management for educators.',
  keywords: ['quiz', 'AI', 'education', 'anti-cheat', 'online testing', 'quiz generator', 'assessment'],
  authors: [{ name: 'QuizMasterAI Team' }],
  creator: 'QuizMasterAI',
  publisher: 'QuizMasterAI',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'QuizMasterAI - AI-Powered Quiz Platform',
    description: 'Create AI-powered quizzes with advanced anti-cheat features',
    siteName: 'QuizMasterAI',
    images: [
      {
        url: '/icon.svg',
        width: 1200,
        height: 630,
        alt: 'QuizMasterAI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuizMasterAI - AI-Powered Quiz Platform',
    description: 'Create AI-powered quizzes with advanced anti-cheat features',
    images: ['/icon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body
        className={cn(
          'min-h-screen font-body antialiased'
        )}
      >
        <SupabaseProvider>
          <SupabaseAuthProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <Toaster />
          </SupabaseAuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}

// Conditional layout component to hide header on quiz pages
function ConditionalLayout({ children }: { children: React.ReactNode }) {
  'use client';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isQuizPage = pathname.startsWith('/quiz/');

  if (isQuizPage) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
