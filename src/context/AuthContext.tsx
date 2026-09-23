import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShippingAddress } from '../types/index.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  adminToken: string | null;
  isAdmin: boolean;
  addresses: ShippingAddress[];
  defaultAddress: ShippingAddress | null;
  login: (email: string, name?: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  adminLogout: () => void;
  addAddress: (address: ShippingAddress) => void;
  deleteAddress: (index: number) => void;
  setDefaultAddress: (index: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('trendstreet_user');
      return saved ? JSON.parse(saved) : {
        id: 'cust-demo',
        name: 'Arjun Sharma',
        email: 'trendstreet277@gmail.com',
        phone: '+91 98765 43210',
        role: 'customer',
      };
    } catch {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [addresses, setAddresses] = useState<ShippingAddress[]>(() => {
    try {
      const saved = localStorage.getItem('trendstreet_addresses');
      return saved ? JSON.parse(saved) : [
        {
          fullName: 'Arjun Sharma',
          mobile: '+91 98765 43210',
          email: 'trendstreet277@gmail.com',
          addressLine1: 'Civil Lines, Station Road',
          apartmentSuiteArea: 'Opposite District Court',
          city: 'Mainpuri',
          state: 'Uttar Pradesh',
          pincode: '205001',
          landmark: 'Civil Lines Post Office',
          isDefault: true,
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('trendstreet_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('trendstreet_user');
    }
  }, [user]);

  // Sync admin state with the real Supabase session (persists across refresh via
  // Supabase's own storage, and updates automatically on token refresh/sign-out).
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    async function syncSession(session: import('@supabase/supabase-js').Session | null) {
      if (!session) {
        if (active) {
          setAdminToken(null);
          setIsAdmin(false);
        }
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!active) return;

      const role = profile?.role;
      const hasAdminAccess = role === 'admin' || role === 'manager';
      setAdminToken(hasAdminAccess ? session.access_token : null);
      setIsAdmin(hasAdminAccess);

      setUser({
        id: session.user.id,
        name: profile?.full_name || session.user.email?.split('@')[0] || 'Customer',
        email: session.user.email || '',
        role: hasAdminAccess ? 'admin' : 'customer',
      });
    }

    supabase.auth.getSession().then(({ data }) => syncSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('trendstreet_addresses', JSON.stringify(addresses));
  }, [addresses]);

  const login = async (email: string, name?: string, phone?: string): Promise<{ success: boolean; message?: string }> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) return { success: false, message: error.message };
      } catch (err: any) {
        console.warn('Supabase auth fallback:', err.message);
      }
    }

    // Optimistic local profile while the OTP email is pending verification.
    // Real role/admin status is always derived from the verified Supabase
    // session + profiles.role once sign-in completes (see the session-sync effect above).
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      phone: phone || '',
      role: 'customer',
    };
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: false, message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return { success: false, message: error?.message || 'Invalid admin credentials.' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.session.user.id)
      .maybeSingle();

    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      await supabase.auth.signOut();
      return { success: false, message: 'This account does not have admin access.' };
    }

    setAdminToken(data.session.access_token);
    setIsAdmin(true);
    return { success: true };
  };

  const adminLogout = () => {
    setAdminToken(null);
    setIsAdmin(false);
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  const addAddress = (address: ShippingAddress) => {
    setAddresses(prev => {
      const next = address.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : [...prev];
      return [...next, address];
    });
  };

  const deleteAddress = (index: number) => {
    setAddresses(prev => prev.filter((_, i) => i !== index));
  };

  const setDefaultAddress = (index: number) => {
    setAddresses(prev =>
      prev.map((addr, i) => ({
        ...addr,
        isDefault: i === index,
      }))
    );
  };

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        adminToken,
        isAdmin,
        addresses,
        defaultAddress,
        login,
        logout,
        adminLogin,
        adminLogout,
        addAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
