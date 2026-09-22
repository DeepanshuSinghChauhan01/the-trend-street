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
  adminLogin: (password: string) => Promise<{ success: boolean; message?: string }>;
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

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('trendstreet_admin_token') || null;
    } catch {
      return null;
    }
  });

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

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('trendstreet_admin_token', adminToken);
    } else {
      localStorage.removeItem('trendstreet_admin_token');
    }
  }, [adminToken]);

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

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      phone: phone || '',
      role: email === 'trendstreet277@gmail.com' ? 'admin' : 'customer',
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

  const adminLogin = async (password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, email: user?.email || 'trendstreet277@gmail.com' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Invalid admin credentials' };
      }
      setAdminToken(data.token);
      return { success: true };
    } catch {
      return { success: false, message: 'Server communication error' };
    }
  };

  const adminLogout = () => {
    setAdminToken(null);
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
        isAdmin: Boolean(adminToken),
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
