import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { AlumniProfile, Event, Announcement, EditableEvent, EditableAnnouncement, UserApprovalInfo, ApprovalStatus } from '@/backend';
import { Principal } from '@icp-sdk/core/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const query = useQuery<AlumniProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  return {
    ...query,
    isLoading: isAuthenticated && (actorFetching || query.isLoading),
    isFetched: isAuthenticated && !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: AlumniProfile) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['alumniProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['graduationYears'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useSearchAlumniProfiles(filterYear?: number | null, filterDepartment?: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AlumniProfile[]>({
    queryKey: ['alumniProfiles', filterYear, filterDepartment],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.searchAlumniProfiles(filterYear || null, filterDepartment || null);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetGraduationYears() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number[]>({
    queryKey: ['graduationYears'],
    queryFn: async () => {
      if (!actor) return [];
      const years = await actor.getGraduationYears();
      return Array.from(years).sort((a, b) => b - a);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetDepartments() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      if (!actor) return [];
      const depts = await actor.getDepartments();
      return depts.sort();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetEvents(byPast?: boolean | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['events', byPast],
    queryFn: async () => {
      if (!actor) return [];
      const events = await actor.getEvents(byPast || null);
      return events.sort((a, b) => Number(a.timestampNanos - b.timestampNanos));
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: EditableEvent) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.createEvent(event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, event }: { id: bigint; event: EditableEvent }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.updateEvent(id, event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.deleteEvent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useGetAnnouncements() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      if (!actor) return [];
      const announcements = await actor.getAnnouncements();
      return announcements.sort((a, b) => Number(b.timestampNanos - a.timestampNanos));
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcement: EditableAnnouncement) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.createAnnouncement(announcement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.deleteAnnouncement(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// Approval system hooks
export function useIsCallerApproved() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const query = useQuery<boolean>({
    queryKey: ['isApproved'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.isCallerApproved();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  return {
    isApproved: query.data || false,
    isLoading: isAuthenticated && (actorFetching || query.isLoading),
    isFetched: isAuthenticated && !!actor && query.isFetched,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isApproved'] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const query = useQuery<UserApprovalInfo[]>({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.listApprovals();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  return {
    ...query,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}
