import { useIsAdmin } from './useIsAdmin';
import { useIsCallerApproved } from './useQueries';
import { useCurrentUser } from './useCurrentUser';
import { useBackendStatus } from './useBackendStatus';

export interface UserAccess {
  isAuthenticated: boolean;
  isApproved: boolean;
  isAdmin: boolean;
  canManageMembers: boolean;
  canManageContent: boolean;
  canManageEvents: boolean;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
}

export function useAccess(): UserAccess {
  const { isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const { data: isApproved = false, isLoading: approvalLoading, isError: approvalError, refetch: refetchApproval } = useIsCallerApproved();
  const { isAdmin, isLoading: adminLoading, isError: adminError, refetch: refetchAdmin } = useIsAdmin();
  const { isReady: backendReady, isLoading: backendLoading, isError: backendError, retry: retryBackend } = useBackendStatus();

  // Only show loading when authenticated and queries are actually running
  const isLoading = isAuthenticated && (authLoading || backendLoading || (backendReady && (approvalLoading || adminLoading)));
  const isError = backendError || (isAuthenticated && backendReady && (approvalError || adminError));

  const retry = () => {
    if (backendError) retryBackend();
    if (approvalError) refetchApproval();
    if (adminError) refetchAdmin();
  };

  return {
    isAuthenticated,
    isApproved,
    isAdmin,
    canManageMembers: isAdmin,
    canManageContent: isAdmin,
    canManageEvents: isAdmin,
    isLoading,
    isError,
    retry,
  };
}
