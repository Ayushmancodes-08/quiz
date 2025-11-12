"use client";

import Link from 'next/link';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import Logo from './logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutDashboard, LogOut, User } from 'lucide-react';

export default function Header() {
  const { user, logout, loading } = useSupabaseAuth();

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0];
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center px-4">
        <Logo />
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <nav className="flex items-center space-x-2">
            {loading ? (
              <div className="h-8 md:h-10 w-16 md:w-20 animate-pulse rounded-md bg-muted"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 md:h-9 md:w-9 rounded-full">
                    <Avatar className="h-8 w-8 md:h-9 md:w-9">
                      <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                      <AvatarFallback className="text-xs md:text-sm">{getInitials(displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <User className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="h-9 md:h-10">
                <Link href="/auth">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
