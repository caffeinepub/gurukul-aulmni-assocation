import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { isSuperAdminPrincipal } from '@/config/superAdmins';

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal().toString();

  // Check if current user is a super-admin
  const isSuperAdmin = isSuperAdminPrincipal(principal);

  const query = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.isCallerAdmin();
    },
    // If super-admin, we can skip the backend check (but still run it for consistency)
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  return {
    // Super-admins are always admin, otherwise check backend
    isAdmin: isSuperAdmin || query.data || false,
    isLoading: isAuthenticated && !isSuperAdmin && (actorFetching || query.isLoading),
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
