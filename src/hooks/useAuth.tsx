import { logger } from "@/utils/logger";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUser, signInUser, signOutUser } from '@/api/auth';
import { User, SignInFormType } from '@/utils/types';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/lib/redux/slice/localStorageSlice';
import { useLocation } from 'react-router-dom';

export function useAuth() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const location = useLocation();

  // Don't query auth on signin/signup pages to prevent race conditions
  const isAuthPage = ['/signin', '/signup', '/reset-password', '/forgot-password'].some(
    page => location.pathname.includes(page)
  );

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await getUser(); // Server validates httpOnly cookie
      } catch {
        return null; // Not authenticated
      }
    },
    enabled: !isAuthPage, // Only run query when NOT on auth pages
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

  // NOTE: Redux sync removed from here - useSignin handles it on login
  // This prevents conflicts between multiple state update sources

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
    isError: !!error,
    signIn,
    signOut,
  };
}
