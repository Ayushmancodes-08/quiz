import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SecurityLogsPage() {
  let logs: any[] = [];
  let error: any = null;
  let user: any = null;

  try {
    const supabase = await createClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    // Uncomment when you want to require authentication
    // if (!user) {
    //   redirect('/login');
    // }

    // Fetch recent security logs
    const { data, error: fetchError } = await supabase
      .from('security_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    logs = data || [];
    error = fetchError;
  } catch (e) {
    console.error('Error fetching security logs:', e);
    error = e;
  }

  // Group violations by type
  const violationStats = logs?.reduce((acc, log) => {
    acc[log.violation_type] = (acc[log.violation_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Logs Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and review security violations across your application
        </p>
      </div>

      {/* Setup Notice */}
      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Setup Required</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>To enable database logging, run the migration:</p>
            <code className="block bg-muted p-3 rounded text-sm">
              supabase migration up
            </code>
            <p className="text-sm">
              Or manually run: <code className="text-xs">supabase/migrations/20241113000000_create_security_logs.sql</code>
            </p>
            <p className="text-sm">
              💡 Security violations are still being logged to the console.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Violations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{logs?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Unique Users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {new Set(logs?.map(l => l.user_id)).size || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Last 24 Hours</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {logs?.filter(l =>
                new Date(l.timestamp) > new Date(Date.now() - 86400000)
              ).length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Violation Types */}
      <Card>
        <CardHeader>
          <CardTitle>Violation Types</CardTitle>
          <CardDescription>Breakdown of security violations by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(violationStats || {}).map(([type, count]) => (
              <div key={type} className="border rounded-lg p-3 bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1 capitalize">
                  {type.replace(/_/g, ' ')}
                </p>
                <p className="text-2xl font-bold">{String(count)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Violations</CardTitle>
          <CardDescription>Latest security events and violations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    URL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs?.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="destructive" className="text-xs">
                        {log.violation_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground font-mono">
                      {log.user_id?.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                      {log.url}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                      {log.ip_address || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
