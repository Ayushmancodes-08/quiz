import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseAuthProvider } from '@/hooks/use-supabase-auth';
import Header from '@/components/shared/header';
import { SupabaseProvider } from '@/supabase/provider';

export const metadata: Metadata = {
  title: 'QuizMasterAI',
  description: 'AI-Powered Quiz Generation and Anti-Cheat Platform',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
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
