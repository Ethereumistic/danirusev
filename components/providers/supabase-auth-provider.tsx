'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';

// Get the site URL from environment variable with no fallback
const getSiteUrl = () => {
  if (typeof window === 'undefined') return ''; // Handle server-side

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    console.error('NEXT_PUBLIC_SITE_URL is not set!');
    // In development, fall back to localhost
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3000';
    }
    // In production, we must have the environment variable
    throw new Error('NEXT_PUBLIC_SITE_URL must be set in production!');
  }

  return siteUrl;
};

type AuthContextType = {
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
  initialRole = null
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialRole?: string | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [userRole, setUserRole] = useState<string | null>(initialRole);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const router = useRouter();
  const supabase = createClient();

  // Zustand store for persisting role across navigations
  const {
    userRole: storedRole,
    setUserRole: setStoredRole,
    setIsAuthenticated,
    clearAuth
  } = useAuthStore();

  // Fetch user role - checks public.users (Payload CMS) for admin, defaults to 'customer' for regular users
  const fetchUserRole = async (userEmail: string | undefined) => {
    if (!userEmail) {
      setUserRole(null);
      setStoredRole(null);
      return;
    }

    // First check if we already have the role in store (for quick navigation)
    // But if we have an initialRole from server, that takes priority
    if (initialRole && !userRole) {
      setUserRole(initialRole);
      setStoredRole(initialRole);
      return;
    }

    if (storedRole && !userRole) {
      setUserRole(storedRole);
    }

    try {
      // Check if user exists in public.users (Payload CMS users - typically admins)
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', userEmail)
        .single();

      if (error) {
        // PGRST116 = "no rows returned" - this is expected for regular customers
        if (error.code === 'PGRST116') {
          const customerRole = 'customer';
          setUserRole(customerRole);
          setStoredRole(customerRole);
          return;
        }
        console.error('Error fetching user role:', error);
        const customerRole = 'customer';
        setUserRole(customerRole);
        setStoredRole(customerRole);
        return;
      }

      const role = data?.role || 'customer';
      setUserRole(role);
      setStoredRole(role);
    } catch (err) {
      console.error('Error fetching user role:', err);
      const customerRole = 'customer';
      setUserRole(customerRole);
      setStoredRole(customerRole);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      // If we already have initialUser from server, we skip the initial getUser call or just sync it
      if (initialUser) {
        setIsAuthenticated(true);
        if (initialRole) {
          setUserRole(initialRole);
          setStoredRole(initialRole);
        } else {
          await fetchUserRole(initialUser.email);
        }
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsAuthenticated(!!user);

      if (storedRole && user) {
        setUserRole(storedRole);
      }

      await fetchUserRole(user?.email);
      setIsLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);

      if (!currentUser) {
        clearAuth();
        setUserRole(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        await fetchUserRole(currentUser.email);
      }

      // Only refresh if the event is significant to avoid infinite loops
      if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) {
        router.refresh();
      }
    });

    // Listen for storage changes (for cross-tab logout/login sync)
    const handleStorageChange = (e: StorageEvent) => {
      // 1. Listen for Supabase session changes
      // The key usually starts with 'sb-' and ends with '-auth-token'
      if (e.key?.includes('-auth-token')) {
        if (!e.newValue) {
          // Session was cleared in another tab (LOGOUT)
          console.log('Detected session removal in another tab, signing out...');
          setUser(null);
          setUserRole(null);
          clearAuth();

          // Force a complete refresh to clear all server-side cookies
          window.location.reload();
        } else {
          // Session was created in another tab (LOGIN)
          // We could try to parse and set the user, but a refresh is safer to sync everything
          console.log('Detected session creation in another tab, refreshing...');
          router.refresh();
        }
      }

      // 2. Listen for our own store changes
      if (e.key === 'auth-storage' && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue);
          const oldValue = e.oldValue ? JSON.parse(e.oldValue) : null;

          // If authentication state changed in another tab
          if (newValue?.state?.isAuthenticated !== oldValue?.state?.isAuthenticated) {
            if (!newValue?.state?.isAuthenticated) {
              console.log('Detected logout in another tab via store...');
              setUser(null);
              setUserRole(null);
              clearAuth();
              router.refresh();
            } else {
              router.refresh();
            }
          }
        } catch (err) {
          // Ignore parsing errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    getUser();

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, supabase, initialUser, initialRole]);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const siteUrl = getSiteUrl();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'customer',
          },
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });

      if (error) throw error;

      await fetch('/api/emails/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      toast.success('Проверете имейла си за връзка за потвърждение!');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Грешка при регистрация');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Вие се вписахте успешно!');

      // Update local state immediately to avoid waiting for onAuthStateChange
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        // We'll let onAuthStateChange handle the role fetch and refresh
        // but we push the navigation immediately
      }

      // 1. Try SPA navigation first
      router.push('/');
      router.refresh();

      // 2. Fallback: Force a hard redirect after a short delay if we're still on the sign-in page
      // This ensures the user is DEFINITELY redirected even if SPA navigation fails
      setTimeout(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('sign-in')) {
          window.location.replace('/');
        }
      }, 500);

    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Грешка при влизане');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // 1. Clear client state FIRST
      setUser(null);
      setUserRole(null);
      clearAuth();

      // 2. Call server-side sign-out route to clear cookies RELIABLY
      const response = await fetch('/api/auth/sign-out', { method: 'POST' });
      if (!response.ok) {
        console.error('Server-side sign out failed');
      }

      // 3. Just in case, also call the client-side sign out
      await supabase.auth.signOut({ scope: 'global' });

      toast.success('Излязохте успешно!');

      // 4. Force a hard reload to ensure a fresh server-side state
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Грешка при излизане');
      setUser(null);
      setUserRole(null);
      clearAuth();
      window.location.href = '/';
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const siteUrl = getSiteUrl();
      console.log('Using site URL for reset password:', siteUrl); // Debug log

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback`,
      });

      if (error) throw error;

      // Send password reset email using our API route
      await fetch('/api/emails/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      toast.success('Password reset instructions sent to your email!');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Error sending reset password email');
      throw error;
    }
  };

  const value = {
    user,
    userRole,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 