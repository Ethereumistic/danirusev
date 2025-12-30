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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Zustand store for persisting role across navigations
  const { userRole: storedRole, setUserRole: setStoredRole, setIsAuthenticated, clearAuth } = useAuthStore();

  // Fetch user role - checks public.users (Payload CMS) for admin, defaults to 'customer' for regular users
  const fetchUserRole = async (userEmail: string | undefined) => {
    if (!userEmail) {
      setUserRole(null);
      setStoredRole(null);
      return;
    }

    // First check if we already have the role in store (for quick navigation)
    if (storedRole) {
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
        // They don't exist in public.users (Payload CMS table), only in auth.users
        if (error.code === 'PGRST116') {
          // User is authenticated but not in Payload CMS users table = regular customer
          const customerRole = 'customer';
          setUserRole(customerRole);
          setStoredRole(customerRole);
          return;
        }
        // For other errors, log and treat as customer
        console.error('Error fetching user role:', error);
        const customerRole = 'customer';
        setUserRole(customerRole);
        setStoredRole(customerRole);
        return;
      }

      // User found in public.users - use their role (likely 'admin')
      const role = data?.role || 'customer';
      setUserRole(role);
      setStoredRole(role);
    } catch (err) {
      console.error('Error fetching user role:', err);
      // On any error, if user is authenticated, treat them as customer
      const customerRole = 'customer';
      setUserRole(customerRole);
      setStoredRole(customerRole);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsAuthenticated(!!user); // Sync auth state to store

      // If we have stored role and same user, use it immediately
      if (storedRole && user) {
        setUserRole(storedRole);
      }

      await fetchUserRole(user?.email);
      setIsLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user); // Sync auth state to store
      if (!session?.user) {
        clearAuth();
        setUserRole(null);
      } else {
        await fetchUserRole(session?.user?.email);
      }
      router.refresh();
    });

    getUser();

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, supabase]);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const siteUrl = getSiteUrl();
      console.log('Using site URL for redirect:', siteUrl); // Debug log

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

      // Send welcome email using our API route
      await fetch('/api/emails/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      toast.success('Check your email for the confirmation link!');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Error signing up');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Вие се вписахте успешно!');
      router.push('/'); // Redirect to home page
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Error signing in');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear the stored role on sign out
      clearAuth();
      setUserRole(null);

      toast.success('Излязохте успешно!');
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
      throw error;
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