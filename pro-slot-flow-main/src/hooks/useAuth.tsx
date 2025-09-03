import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Types for our authentication system
export type UserRole = 'customer' | 'provider' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  auth_role: UserRole;
  role: UserRole;
  business_name: string | null;
  phone: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  isProvider: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  hasPermission: (section: string) => boolean;
  isRole: (role: UserRole) => boolean;
  canAccess: (requiredRole: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile with role information
  const fetchProfile = async (userId: string, retryCount = 0): Promise<UserProfile | null> => {
    try {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Check if it's an auth_role column missing error
        if (error.message && error.message.includes('auth_role')) {
          console.error('auth_role column is missing from user_profiles table');
          console.error('Please run: ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS auth_role TEXT DEFAULT \'customer\';');
          return null;
        }

        // If profile doesn't exist and this is first attempt, try to create it
        if (error.code === 'PGRST116' && retryCount === 0) {
          console.log('Profile not found, creating default profile...');
          
          // Try to create a default profile (handle missing auth_role gracefully)
          try {
            const { data: newProfile, error: createError } = await (supabase as any)
              .from('user_profiles')
              .insert({
                user_id: userId,
                role: 'customer',
                onboarding_completed: false
              })
              .select('*')
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              return null;
            }

            // Add auth_role if it doesn't exist in the returned data
            if (newProfile && !newProfile.auth_role) {
              newProfile.auth_role = newProfile.role || 'customer';
            }

            return newProfile as UserProfile;
          } catch (createError) {
            console.error('Failed to create profile:', createError);
            return null;
          }
        }
        
        console.error('Error fetching profile:', error);
        return null;
      }

      // Handle case where profile exists but auth_role might be missing
      if (data && !data.auth_role) {
        data.auth_role = data.role || 'customer';
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Initialize auth state - SIMPLIFIED FOR PRODUCTION STABILITY
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Create a simple default profile without database dependency
          setProfile({
            id: session.user.id,
            user_id: session.user.id,
            full_name: session.user.user_metadata?.full_name || 'User',
            auth_role: 'customer',
            role: 'customer',
            business_name: null,
            phone: session.user.user_metadata?.phone || null,
            onboarding_completed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.debug('Auth initialization error (suppressed):', error);
      } finally {
        // Always set loading to false immediately for production stability
        setLoading(false);
      }
    };

    // Immediate timeout to prevent any loading delays
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 100); // 100ms timeout for instant loading

    initializeAuth().finally(() => {
      clearTimeout(timeoutId);
      setLoading(false);
    });

    // Simplified auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user);
            setProfile({
              id: session.user.id,
              user_id: session.user.id,
              full_name: session.user.user_metadata?.full_name || 'User',
              auth_role: 'customer',
              role: 'customer',
              business_name: null,
              phone: session.user.user_metadata?.phone || null,
              onboarding_completed: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
          }
        } catch (error) {
          console.debug('Auth state change error (suppressed):', error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData || {}
      }
    });

    if (error) {
      throw error;
    }

    // If user is created and we have session, ensure profile exists
    if (data.user && data.session) {
      // Wait a moment for database trigger
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Fetch or create profile
      const profile = await fetchProfile(data.user.id);
      if (profile) {
        setProfile(profile);
      }
    }
  };

  // Sign out function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await (supabase as any)
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    // Refresh profile
    const updatedProfile = await fetchProfile(user.id);
    setProfile(updatedProfile);
  };

  // Check if user has specific admin permission
  const hasPermission = (section: string): boolean => {
    if (!profile) return false;
    
    // Super admin has all permissions
    if (profile.auth_role === 'super_admin') return true;
    
    // Non-admin roles don't have admin permissions
    if (profile.auth_role !== 'admin') return false;
    
    // For admin role, we need to check the admin_permissions table
    // This would typically be done with a separate hook or query
    // For now, return true for basic admin access
    // TODO: Implement section-specific permission checking
    console.debug('Checking permission for section:', section);
    return true;
  };

  // Check if user has specific role
  const isRole = (role: UserRole): boolean => {
    return profile?.auth_role === role;
  };

  // Check if user can access based on role hierarchy
  const canAccess = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!profile) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Super admin can access everything
    if (profile.auth_role === 'super_admin') return true;
    
    // Check if user's role is in the required roles
    return roles.includes(profile.auth_role);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.auth_role === 'admin' || profile?.auth_role === 'super_admin',
    isCustomer: profile?.auth_role === 'customer',
    isProvider: profile?.auth_role === 'provider',
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasPermission,
    isRole,
    canAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};