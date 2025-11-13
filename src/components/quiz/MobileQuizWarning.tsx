"use client";

import { AlertTriangle, Smartphone, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MobileQuizWarningProps {
  isIncognito: boolean | null;
  onProceed: () => void;
  onOpenIncognito: () => void;
}

export function MobileQuizWarning({ 
  isIncognito, 
  onProceed, 
  onOpenIncognito 
}: MobileQuizWarningProps) {
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl">Mobile Quiz Mode</CardTitle>
          </div>
          <CardDescription>
            Please read the following instructions carefully
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Incognito Mode Recommendation */}
          {isIncognito === false && (
            <Alert className="border-orange-500 bg-orange-50">
              <EyeOff className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-900">Incognito Mode Recommended</AlertTitle>
              <AlertDescription className="text-orange-800">
                For better security, we recommend taking this quiz in incognito/private mode.
                This helps prevent browser extensions from interfering.
              </AlertDescription>
            </Alert>
          )}

          {isIncognito === true && (
            <Alert className="border-green-500 bg-green-50">
              <Eye className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Incognito Mode Active</AlertTitle>
              <AlertDescription className="text-green-800">
                Great! You're using incognito mode. This provides better security.
              </AlertDescription>
            </Alert>
          )}

          {/* Mobile-Specific Rules */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Mobile Quiz Rules
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">⚠️</span>
                <p><strong>Limited Tab Switching</strong> - First 2 switches are free, then you get 3 warnings before violation</p>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <p><strong>NO Screenshots</strong> - Taking screenshots will result in violations</p>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <p><strong>NO AI Assistants</strong> - Using AI tools (Comet, ChatGPT, etc.) will be detected</p>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <p><strong>NO Copy/Paste</strong> - Copying questions or pasting answers is not allowed</p>
              </div>
            </div>
          </div>

          {/* Violation Policy */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Violation Policy</AlertTitle>
            <AlertDescription>
              You are allowed <strong>2 violations</strong>. On the <strong>3rd violation</strong>, 
              your quiz will be automatically submitted and flagged for review.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            {isIncognito === false && (
              <Button 
                onClick={onOpenIncognito}
                className="w-full"
                variant="default"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Open in Incognito Mode
              </Button>
            )}

            <Button 
              onClick={onProceed}
              className="w-full"
              variant={isIncognito === false ? "outline" : "default"}
            >
              I Understand, Start Quiz
            </Button>
          </div>

          {/* How to Open Incognito */}
          {isIncognito === false && (
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p className="font-semibold">How to open in incognito:</p>
              <p><strong>Chrome/Edge:</strong> Menu → New Incognito Window</p>
              <p><strong>Safari:</strong> Tabs → Private</p>
              <p><strong>Firefox:</strong> Menu → New Private Window</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Simple warning banner for during quiz
 */
export function MobileQuizBanner() {
  return (
    <div className="bg-blue-50 border-b border-blue-200 p-3 text-center text-sm">
      <p className="text-blue-900">
        <strong>Mobile Mode:</strong> First 2 tab switches free, then 3 warnings before violation. 
        Screenshots and AI assistants trigger immediate violations.
      </p>
    </div>
  );
}
