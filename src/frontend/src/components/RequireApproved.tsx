import { type ReactNode } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useIsCallerApproved, useRequestApproval } from '@/hooks/useQueries';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, ShieldAlert, Clock, AlertCircle } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { toast } from 'sonner';
import BackendUnavailableCard from './BackendUnavailableCard';

interface RequireApprovedProps {
  children: ReactNode;
}

export default function RequireApproved({ children }: RequireApprovedProps) {
  const { isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const { data: isApproved, isLoading: approvalLoading, isFetched, isError: approvalError, refetch: refetchApproval } = useIsCallerApproved();
  const { isReady: backendReady, isLoading: backendLoading, isError: backendError, retry: retryBackend } = useBackendStatus();
  const { login } = useInternetIdentity();
  const requestApprovalMutation = useRequestApproval();

  const handleRequestApproval = async () => {
    try {
      await requestApprovalMutation.mutateAsync();
      toast.success('Approval request submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit approval request. Please try again.');
    }
  };

  const handleRetry = () => {
    retryBackend();
    refetchApproval();
  };

  // Backend unavailable - show error with retry
  if (backendError) {
    return <BackendUnavailableCard onRetry={retryBackend} />;
  }

  // Backend loading - only show when authenticated
  if (isAuthenticated && backendLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  // Only show loading when authenticated and queries are actually running
  const isLoading = isAuthenticated && backendReady && (authLoading || approvalLoading);

  // Loading state - only when authenticated and backend is ready
  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show immediately without loading
  if (!isAuthenticated) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access this feature</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={login} size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - when authenticated but queries failed
  if (approvalError) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Unable to Load Data</CardTitle>
            <CardDescription>
              There was an error loading your access information. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleRetry} size="lg">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not approved - only show after data is fetched
  if (isFetched && !isApproved) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <Card className="w-full max-w-md border-amber-500/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>Membership Approval Required</CardTitle>
            <CardDescription>
              Your membership is pending approval. Please request approval to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleRequestApproval} 
              size="lg" 
              className="w-full"
              disabled={requestApprovalMutation.isPending}
            >
              {requestApprovalMutation.isPending ? 'Submitting...' : 'Request Approval'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              An administrator will review your request shortly
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
