'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ShieldAlert, Home, Mail } from 'lucide-react';
import { config } from '@/lib/config';
import { useEffect, useState } from 'react';

export default function SecurityViolationPage() {
  const [sessionId, setSessionId] = useState('N/A');
  const adminEmail = config.admin.email;
  const supportSubject = 'Security Violation Report';
  
  useEffect(() => {
    setSessionId(sessionStorage.getItem('sessionId') || 'N/A');
  }, []);
  
  const supportBody = `Hello,\n\nI received a security violation notice and would like to report this.\n\nSession ID: ${sessionId}\nTimestamp: ${new Date().toISOString()}\n\nPlease review this incident.\n\nThank you.`;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-3xl">Security Violation Detected</CardTitle>
          <CardDescription className="text-base mt-2">
            Multiple security violations have been detected. This incident has been logged for review.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Detected Activities</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Screenshot attempts</li>
                <li>• Tab switching during protected content</li>
                <li>• Automation tool usage</li>
                <li>• Developer tools access</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Badge variant="outline">Important</Badge>
              What happens next?
            </h3>
            <p className="text-sm text-muted-foreground">
              Your activity has been logged and may be reviewed by administrators. 
              Repeated violations may result in restricted access to protected content.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Link href={config.urls.dashboard} className="w-full sm:w-auto flex-1">
            <Button className="w-full" variant="default">
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
          <a 
            href={`mailto:${adminEmail}?subject=${encodeURIComponent(supportSubject)}&body=${encodeURIComponent(supportBody)}`}
            className="w-full sm:w-auto flex-1"
          >
            <Button className="w-full" variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </a>
        </CardFooter>

        <div className="px-6 pb-6">
          <p className="text-xs text-center text-muted-foreground">
            If you believe this is an error, please contact support at{' '}
            <a 
              href={`mailto:${adminEmail}`}
              className="text-primary hover:underline font-medium"
            >
              {adminEmail}
            </a>
            {' '}with your session ID.
          </p>
        </div>
      </Card>
    </div>
  );
}
