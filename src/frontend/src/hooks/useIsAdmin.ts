import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    isAdmin: query.data || false,
    isLoading: actorFetching || query.isLoading,
  };
}
