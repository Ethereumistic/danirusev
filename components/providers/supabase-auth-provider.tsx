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
      } else if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
        await fetchUserRole(currentUser.email);
      }

      // Refresh server components to sync cookies
      if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) {
        router.refresh();
      }
    });

    getUser();

    return () => {
      subscription.unsubscribe();
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

      // Update state
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      }

      // Redirect and Refresh
      router.push('/');
      router.refresh();

      // Reliable hard redirect if SPA fails
      setTimeout(() => {
        if (window.location.pathname.includes('sign-in')) {
          window.location.href = '/';
        }
      }, 800);

    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Грешка при влизане');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // 1. Clear local state and start navigation immediately for better UX
      setUser(null);
      setUserRole(null);
      clearAuth();
      router.push('/');

      // 2. Clear cookies server-side
      await fetch('/api/auth/sign-out', { method: 'POST' });

      // 3. Complete client-side sign out
      await supabase.auth.signOut();

      toast.success('Излязохте успешно!');

      // 4. Final hard redirect to ensure everything is flushed and we are at /
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Грешка при излизане');
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