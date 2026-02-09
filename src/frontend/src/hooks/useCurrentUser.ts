import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile } from './useQueries';

export function useCurrentUser() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal().toString();
  const principalShort = principal ? `${principal.slice(0, 5)}...${principal.slice(-3)}` : '';

  return {
    identity,
    isAuthenticated,
    principal,
    principalShort,
    userProfile: userProfile || null,
    isLoading: loginStatus === 'initializing' || profileLoading,
    isFetched,
  };
}
