import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { BackendSnapshot } from '@/backend';

export function useListBackendSnapshots() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const query = useQuery<BackendSnapshot[]>({
    queryKey: ['backendSnapshots'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.listBackendSnapshots();
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

export function useCreateBackendSnapshot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.createBackendSnapshot();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backendSnapshots'] });
    },
  });
}

export function useDeleteBackendSnapshot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.deleteBackendSnapshot(id);
      if (!result) {
        throw new Error('Snapshot does not exist');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backendSnapshots'] });
    },
  });
}

export function useClearAllBackendSnapshots() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.clearAllBackendSnapshots();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backendSnapshots'] });
    },
  });
}
