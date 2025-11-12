'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageSquare, 
  QrCode,
  Check,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareQuizDialogProps {
  quizId: string;
  quizTitle: string;
  trigger?: React.ReactNode;
}

export function ShareQuizDialog({ quizId, quizTitle, trigger }: ShareQuizDialogProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();

  const quizUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/quiz/${quizId}` 
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(quizUrl);
      setCopied(true);
      toast({
        title: 'Link Copied!',
        description: 'Quiz link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy link to clipboard',
      });
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Take this quiz: ${quizTitle}`);
    const body = encodeURIComponent(
      `Hi!\n\nI'd like to invite you to take this quiz:\n\n${quizTitle}\n\n${quizUrl}\n\nGood luck!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Take this quiz: ${quizTitle}\n${quizUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(quizUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Take this quiz: ${quizTitle}`);
    const url = encodeURIComponent(quizUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(quizUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleShowQR = () => {
    setShowQR(!showQR);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(quizUrl)}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-headline">Share Quiz</DialogTitle>
          <DialogDescription>
            Share "{quizTitle}" with students
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Copy Link Section */}
          <div className="space-y-3">
            <Label htmlFor="quiz-link" className="text-base font-semibold">
              Quiz Link
            </Label>
            <div className="flex gap-2">
              <Input
                id="quiz-link"
                value={quizUrl}
                readOnly
                className="flex-1"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                onClick={handleCopyLink}
                size="icon"
                variant={copied ? 'default' : 'outline'}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Quick Share</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleShareEmail}
                className="justify-start"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                onClick={handleShareWhatsApp}
                className="justify-start"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={handleShareFacebook}
                className="justify-start"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={handleShareTwitter}
                className="justify-start"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={handleShareLinkedIn}
                className="justify-start"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={handleShowQR}
                className="justify-start"
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
            </div>
          </div>

          {/* QR Code Display */}
          {showQR && (
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-base font-semibold">QR Code</Label>
              <div className="flex flex-col items-center space-y-3 bg-white p-6 rounded-lg">
                <img
                  src={qrCodeUrl}
                  alt="Quiz QR Code"
                  className="w-64 h-64"
                />
                <p className="text-sm text-gray-600 text-center">
                  Students can scan this QR code to access the quiz
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrCodeUrl;
                    link.download = `quiz-${quizId}-qr.png`;
                    link.click();
                  }}
                >
                  Download QR Code
                </Button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
            <p className="font-medium">💡 Sharing Tips:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Copy the link and share via any platform</li>
              <li>• Use QR code for in-person distribution</li>
              <li>• Email directly to students</li>
              <li>• Share on social media for wider reach</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
