import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

const ACTOR_TIMEOUT_MS = 10000; // 10 seconds

export interface BackendStatus {
  isReady: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  retry: () => void;
}

export function useBackendStatus(): BackendStatus {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [timeoutError, setTimeoutError] = useState<Error | null>(null);

  useEffect(() => {
    if (isFetching && !actor) {
      // Set a timeout for actor initialization
      const timeout = setTimeout(() => {
        if (!actor) {
          setTimeoutError(new Error('Backend connection timeout. Please check your connection and try again.'));
        }
      }, ACTOR_TIMEOUT_MS);

      return () => clearTimeout(timeout);
    } else if (actor) {
      // Clear timeout error when actor is ready
      setTimeoutError(null);
    }
  }, [isFetching, actor]);

  const retry = () => {
    setTimeoutError(null);
    // Invalidate and refetch the actor query
    queryClient.invalidateQueries({ queryKey: ['actor'] });
    queryClient.refetchQueries({ queryKey: ['actor'] });
  };

  return {
    isReady: !!actor && !isFetching,
    isLoading: isFetching && !timeoutError,
    isError: !!timeoutError,
    error: timeoutError,
    retry,
  };
}
