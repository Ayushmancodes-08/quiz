'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useSupabaseClient } from '@/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User, Image as ImageIcon, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '');
      setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || '');
      setIsLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          avatar_url: avatarUrl,
        },
      });

      if (error) throw error;

      await supabase
        .from('user_profiles')
        .update({
          display_name: displayName,
        } as any)
        .eq('id', user.id);

      toast({
        title: 'Settings Saved',
        description: 'Your profile has been updated successfully.',
      });

      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message || 'Could not update your profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your profile settings</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                <AvatarFallback className="text-2xl">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar" className="text-base font-semibold">
                  Profile Photo URL
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Enter a URL to your profile photo
                </p>
              </div>
            </div>

            {/* Avatar URL Input */}
            <div className="space-y-2">
              <Label htmlFor="avatar">
                <ImageIcon className="inline h-4 w-4 mr-2" />
                Photo URL
              </Label>
              <Input
                id="avatar"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Paste a link to your profile photo (Google Photos, Imgur, etc.)
              </p>
            </div>

            {/* Display Name Input */}
            <div className="space-y-2">
              <Label htmlFor="displayName">
                <User className="inline h-4 w-4 mr-2" />
                Display Name
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                This name will be displayed throughout the app
              </p>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="h-11 bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving || !displayName.trim()}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-primary">💡</span>
              <div>
                <p className="font-medium">Profile Photo</p>
                <p className="text-muted-foreground">
                  Use a direct image URL. Right-click on any image online and select "Copy Image Address"
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-primary">🔒</span>
              <div>
                <p className="font-medium">Privacy</p>
                <p className="text-muted-foreground">
                  Your profile information is only visible to you and students taking your quizzes
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-primary">✨</span>
              <div>
                <p className="font-medium">Google Sign-In</p>
                <p className="text-muted-foreground">
                  If you signed in with Google, your photo is automatically synced
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
