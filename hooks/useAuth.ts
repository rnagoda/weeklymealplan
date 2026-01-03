import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const {
    session,
    user,
    profile,
    isLoading,
    setSession,
    setUser,
    setProfile,
    setIsLoading,
    signOut: clearAuth,
  } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Fetch profile if user exists
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        // Clear all queries on sign out
        queryClient.clear();
        setProfile(null);
      } else if (session.user) {
        // Fetch profile on sign in
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser, setIsLoading, setProfile, queryClient]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearAuth();
    queryClient.clear();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'recipeapp://reset-password',
    });
    if (error) throw error;
  };

  return {
    session,
    user,
    profile,
    isLoading,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}
