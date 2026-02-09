import { useIsAdmin } from './useIsAdmin';
import { useIsCallerApproved } from './useQueries';
import { useCurrentUser } from './useCurrentUser';

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
  const { isApproved, isLoading: approvalLoading, isError: approvalError, refetch: refetchApproval } = useIsCallerApproved();
  const { isAdmin, isLoading: adminLoading, isError: adminError, refetch: refetchAdmin } = useIsAdmin();

  // Only show loading when authenticated and queries are actually running
  const isLoading = isAuthenticated && (authLoading || approvalLoading || adminLoading);
  const isError = isAuthenticated && (approvalError || adminError);

  const retry = () => {
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
