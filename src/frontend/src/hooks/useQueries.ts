import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { AlumniProfile, Event, Announcement, EditableEvent, EditableAnnouncement } from '@/backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<AlumniProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
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
      try {
        return await actor.searchAlumniProfiles(filterYear || null, filterDepartment || null);
      } catch {
        return [];
      }
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
      try {
        const years = await actor.getGraduationYears();
        return Array.from(years).sort((a, b) => b - a);
      } catch {
        return [];
      }
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
      try {
        const depts = await actor.getDepartments();
        return depts.sort();
      } catch {
        return [];
      }
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
      try {
        const events = await actor.getEvents(byPast || null);
        return events.sort((a, b) => Number(a.timestampNanos - b.timestampNanos));
      } catch {
        return [];
      }
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
      try {
        const announcements = await actor.getAnnouncements();
        return announcements.sort((a, b) => Number(b.timestampNanos - a.timestampNanos));
      } catch {
        return [];
      }
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
