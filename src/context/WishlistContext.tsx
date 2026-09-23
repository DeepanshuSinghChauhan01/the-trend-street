import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product } from '../types/index.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => boolean;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  isSyncing: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('trendstreet_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const wishlistIdRef = useRef<string | null>(null);
  const hasMergedGuestWishlist = useRef(false);

  // Guests (no Supabase session): persist locally, exactly as before.
  useEffect(() => {
    if (userId) return;
    try {
      localStorage.setItem('trendstreet_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }, [wishlist, userId]);

  // Track Supabase auth state.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) setUserId(data.session?.user.id || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id || null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // On login: create/find the user's wishlist row, merge any guest-session
  // items into it once, then hydrate wishlist state from Supabase (source of truth).
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) {
      wishlistIdRef.current = null;
      hasMergedGuestWishlist.current = false;
      return;
    }

    let active = true;

    async function syncFromServer() {
      setIsSyncing(true);
      try {
        const wishlistId = await getOrCreateWishlistId();
        if (!wishlistId) return;

        if (!hasMergedGuestWishlist.current && wishlist.length) {
          const { data: existingItems } = await supabase.from('wishlist_items').select('product_id').eq('wishlist_id', wishlistId);
          const existingIds = new Set((existingItems || []).map((i: any) => i.product_id));
          const toInsert = wishlist.filter(p => !existingIds.has(p.id)).map(p => ({ wishlist_id: wishlistId, product_id: p.id }));
          if (toInsert.length) await supabase.from('wishlist_items').insert(toInsert);
        }
        hasMergedGuestWishlist.current = true;

        const { data: items } = await supabase.from('wishlist_items').select('product_id').eq('wishlist_id', wishlistId);
        const ids = (items || []).map((i: any) => i.product_id);
        if (!active) return;

        if (!ids.length) {
          setWishlist([]);
          return;
        }
        const res = await fetch(`/api/products?ids=${ids.join(',')}`);
        const json = await res.json();
        if (active && json.success) setWishlist(json.data);
      } catch (err) {
        console.error('Failed to sync wishlist with Supabase', err);
      } finally {
        if (active) setIsSyncing(false);
      }
    }

    async function getOrCreateWishlistId(): Promise<string | null> {
      if (wishlistIdRef.current) return wishlistIdRef.current;
      const { data: existing } = await supabase.from('wishlists').select('id').eq('user_id', userId).maybeSingle();
      if (existing) {
        wishlistIdRef.current = existing.id;
        return existing.id;
      }
      const { data: created, error } = await supabase.from('wishlists').insert({ user_id: userId }).select('id').single();
      if (error) {
        console.error('Failed to create wishlist', error);
        return null;
      }
      wishlistIdRef.current = created.id;
      return created.id;
    }

    syncFromServer();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function persistAdd(productId: string) {
    if (!userId || !isSupabaseConfigured) return;
    try {
      let wishlistId = wishlistIdRef.current;
      if (!wishlistId) {
        const { data: existing } = await supabase.from('wishlists').select('id').eq('user_id', userId).maybeSingle();
        wishlistId = existing?.id || null;
        if (!wishlistId) {
          const { data: created } = await supabase.from('wishlists').insert({ user_id: userId }).select('id').single();
          wishlistId = created?.id || null;
        }
        wishlistIdRef.current = wishlistId;
      }
      if (!wishlistId) return;
      await supabase.from('wishlist_items').upsert(
        { wishlist_id: wishlistId, product_id: productId },
        { onConflict: 'wishlist_id,product_id', ignoreDuplicates: true }
      );
    } catch (err) {
      console.error('Failed to save wishlist item', err);
    }
  }

  async function persistRemove(productId: string) {
    if (!userId || !isSupabaseConfigured || !wishlistIdRef.current) return;
    try {
      await supabase.from('wishlist_items').delete().eq('wishlist_id', wishlistIdRef.current).eq('product_id', productId);
    } catch (err) {
      console.error('Failed to remove wishlist item', err);
    }
  }

  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
    persistAdd(product.id);
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
    persistRemove(productId);
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  const toggleWishlist = (product: Product): boolean => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      return false;
    } else {
      addToWishlist(product);
      return true;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
        isSyncing,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
