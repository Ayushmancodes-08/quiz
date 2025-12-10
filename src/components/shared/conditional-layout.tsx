'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/shared/header';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isQuizPage = pathname?.startsWith('/quiz/');

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
