import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useQueries';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import RequireApproved from '@/components/RequireApproved';
import BackendUnavailableCard from '@/components/BackendUnavailableCard';
import AlumniProfileForm from '@/components/AlumniProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AlumniProfile } from '@/backend';

export default function MyProfilePage() {
  return (
    <RequireApproved>
      <MyProfileContent />
    </RequireApproved>
  );
}

function MyProfileContent() {
  const navigate = useNavigate();
  const { isAuthenticated } = useCurrentUser();
  const { isReady: backendReady, isError: backendError, retry: retryBackend } = useBackendStatus();
  const { data: profile, isLoading: profileLoading, isFetched, isError: profileError, refetch: refetchProfile } = useGetCallerUserProfile();
  const saveMutation = useSaveCallerUserProfile();
  const [formData, setFormData] = useState<AlumniProfile | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSave = async (data: AlumniProfile) => {
    try {
      await saveMutation.mutateAsync(data);
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleRetry = () => {
    retryBackend();
    refetchProfile();
  };

  if (!isAuthenticated) {
    return null;
  }

  // Backend unavailable
  if (backendError) {
    return <BackendUnavailableCard onRetry={retryBackend} />;
  }

  // Query error
  if (profileError) {
    return <BackendUnavailableCard onRetry={handleRetry} title="Unable to Load Profile" description="There was an error loading your profile. Please try again." />;
  }

  const isLoading = !backendReady || profileLoading;

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const isNewProfile = isFetched && profile === null;

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isNewProfile ? 'Create Your Profile' : 'Edit Your Profile'}</CardTitle>
            <CardDescription>
              {isNewProfile
                ? 'Welcome! Please complete your profile to connect with fellow alumni'
                : 'Update your information to keep the community connected'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlumniProfileForm
              initialData={formData}
              onSave={handleSave}
              isLoading={saveMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
