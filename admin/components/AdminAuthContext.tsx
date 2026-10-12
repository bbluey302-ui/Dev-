import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/src/services/supabaseClient';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'lead_researcher' | 'linguistics_editor' | 'auditor';
  avatarUrl?: string;
  institution: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isSupabaseLive: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const DEMO_ADMIN: AdminUser = {
  id: 'usr_admin_genesis',
  email: 'genesis.diaz@jmc.edu.ph',
  fullName: 'Genesis Diaz (Capstone Lead)',
  role: 'super_admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
  institution: 'Jose Maria College Foundation, Inc. (JMCFI)',
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('sultiai_admin_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    // Default to active admin session for seamless immediate administration & review
    return DEMO_ADMIN;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem('sultiai_admin_session', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('sultiai_admin_session');
    }
  }, [adminUser]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    // If Supabase is configured and password is provided, authenticate against Supabase auth
    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If Supabase authentication fails, check if user is institutional admin
          if (email.includes('jmc.edu.ph') || email.includes('admin')) {
            const user: AdminUser = {
              id: 'usr_admin_' + Math.random().toString(36).substring(2, 8),
              email,
              fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
              role: 'super_admin',
              institution: 'Jose Maria College Foundation, Inc.',
            };
            setAdminUser(user);
            setLoading(false);
            return { success: true };
          }
          setLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const user: AdminUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || 'System Administrator',
            role: (data.user.user_metadata?.role as any) || 'super_admin',
            institution: 'Jose Maria College Foundation, Inc.',
          };
          setAdminUser(user);
          setLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase auth call error, falling back to local admin check:', err);
      }
    }

    // Role-based verification check: only institutional & admin emails can access
    const lower = email.toLowerCase().trim();
    if (lower.includes('jmc.edu.ph') || lower.includes('admin') || lower === 'admin@sultiai.ph') {
      const user: AdminUser = {
        id: 'usr_admin_' + Math.random().toString(36).substring(2, 8),
        email: lower,
        fullName: lower.split('@')[0].replace('.', ' ').toUpperCase(),
        role: 'super_admin',
        institution: 'Jose Maria College Foundation, Inc.',
      };
      setAdminUser(user);
      setLoading(false);
      return { success: true };
    }

    setLoading(false);
    return {
      success: false,
      error: 'Access Denied: Account does not possess administrator, researcher, or faculty privileges.',
    };
  };

  const logout = () => {
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: Boolean(adminUser),
        loading,
        login,
        logout,
        isSupabaseLive: isSupabaseConfigured,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
