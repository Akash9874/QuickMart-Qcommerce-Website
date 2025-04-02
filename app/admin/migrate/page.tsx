'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { runMigrations } from '@/app/lib/migrate';

export default function MigratePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunMigrations = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);
    
    try {
      const migrationResult = await runMigrations();
      setResult(migrationResult);
      
      if (!migrationResult.success) {
        setError(migrationResult.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run migrations');
      console.error('Migration error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Database Migrations</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Run Database Migrations</CardTitle>
          <CardDescription>
            This will run all database migrations to fix product IDs and cart data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Running these migrations will:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-sm">
            <li>Fix product IDs to match the correct format</li>
            <li>Remove orphaned cart items</li>
            <li>Ensure all carts have the required timestamp fields</li>
            <li>Create carts for users that don't have one</li>
            <li>Fix invalid cart item quantities</li>
          </ul>
          
          {result && (
            <div className="mt-6 space-y-4">
              <Alert variant={result.success ? "default" : "destructive"}>
                <div className="flex items-center gap-2">
                  {result.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  {result.success ? 'All migrations completed successfully.' : error}
                </AlertDescription>
              </Alert>
              
              {result.success && (
                <div className="border rounded-md p-4 text-sm">
                  <h3 className="font-medium mb-2">Migration Details:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleRunMigrations} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Migrations...
              </>
            ) : (
              'Run All Migrations'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        <p className="mb-2">Use this tool with caution. It's recommended to backup your database before running migrations.</p>
        <p>If you encounter any issues, please contact your administrator.</p>
      </div>
    </div>
  );
} 