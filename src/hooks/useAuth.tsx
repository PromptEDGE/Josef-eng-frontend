import { logger } from "@/utils/logger";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUser, signInUser, signOutUser } from '@/api/auth';
import { User, SignInFormType } from '@/utils/types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/lib/redux/slice/localStorageSlice';
import { clearUser } from '@/lib/redux/slice/localStorageSlice';

export function useAuth() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await getUser(); // Server validates httpOnly cookie
      } catch {
        return null; // Not authenticated
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Previously called cacheTime
  });

  const signIn = useMutation({
    mutationFn: signInUser,
    onSuccess: (userData) => {
      queryClient.setQueryData(['auth', 'me'], userData);
    },
  });

  const signOut = useMutation({
    mutationFn: signOutUser,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear(); // Clear all cached data
      dispatch(clearUser()); // Clear Redux state
      window.location.href = '/signin';
    },
  });

  // Sync user data to Redux when it changes
  useEffect(() => {
    if (user) {
      // User is authenticated - sync to Redux
      dispatch(setUser({ user }));
    } else if (user === null && !isLoading) {
      // User is explicitly null (not authenticated) and not loading - clear Redux
      dispatch(clearUser());
    }
  }, [user, isLoading, dispatch]);

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
    isError: !!error,
    signIn,
    signOut,
  };
}
