import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { BackendStatus } from '@/backend';

export function useBackendSummary() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const query = useQuery<BackendStatus>({
    queryKey: ['backendStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getBackendStatus();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    ...query,
    isLoading: isAuthenticated && (actorFetching || query.isLoading),
  };
}
