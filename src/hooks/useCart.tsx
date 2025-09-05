import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  providerId?: string;
  providerName?: string;
  price: number;
  quantity: number;
  serviceDetails?: any;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate or get session ID for guest users
const getGuestSessionId = (): string => {
  let sessionId = sessionStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Load cart items on mount and auth state changes
  useEffect(() => {
    loadCartItems();
  }, [isAuthenticated, user]);

  // Transfer guest cart to authenticated user on login
  useEffect(() => {
    if (isAuthenticated && user) {
      transferGuestCartToUser();
    }
  }, [isAuthenticated, user]);

  const loadCartItems = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated && user) {
        // Load from authenticated user cart
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const cartItems: CartItem[] = data.map(item => ({
          id: item.id,
          serviceId: item.service_id,
          serviceName: item.service_name,
          providerId: item.provider_id,
          providerName: item.provider_name,
          price: Number(item.price),
          quantity: item.quantity,
          serviceDetails: item.service_details
        }));

        setItems(cartItems);
      } else {
        // Load from guest cart using session storage as backup
        const guestSessionId = getGuestSessionId();
        
        try {
          const { data, error } = await supabase
            .from('guest_cart_items')
            .select('*')
            .eq('session_id', guestSessionId);

          if (error) throw error;

          const cartItems: CartItem[] = data.map(item => ({
            id: item.id,
            serviceId: item.service_id,
            serviceName: item.service_name,
            providerId: item.provider_id,
            providerName: item.provider_name,
            price: Number(item.price),
            quantity: item.quantity,
            serviceDetails: item.service_details
          }));

          setItems(cartItems);
        } catch (error) {
          // Fallback to localStorage if database fails
          const localCart = localStorage.getItem('guest_cart');
          if (localCart) {
            setItems(JSON.parse(localCart));
          }
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cart items',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const transferGuestCartToUser = async () => {
    if (!user) return;

    const guestSessionId = sessionStorage.getItem('guest_session_id');
    if (!guestSessionId) return;

    try {
      // Get guest cart items
      const { data: guestItems } = await supabase
        .from('guest_cart_items')
        .select('*')
        .eq('session_id', guestSessionId);

      if (guestItems && guestItems.length > 0) {
        // Transfer to user cart
        for (const item of guestItems) {
          await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              service_id: item.service_id,
              service_name: item.service_name,
              provider_id: item.provider_id,
              provider_name: item.provider_name,
              price: item.price,
              quantity: item.quantity,
              service_details: item.service_details
            });
        }

        // Clear guest cart
        await supabase
          .from('guest_cart_items')
          .delete()
          .eq('session_id', guestSessionId);

        // Clear local storage
        localStorage.removeItem('guest_cart');
        sessionStorage.removeItem('guest_session_id');

        toast({
          title: 'Cart transferred',
          description: 'Your cart items have been saved to your account'
        });

        // Reload cart items
        loadCartItems();
      }
    } catch (error) {
      console.error('Error transferring guest cart:', error);
    }
  };

  const addToCart = async (newItem: Omit<CartItem, 'id' | 'quantity'>) => {
    setIsLoading(true);
    try {
      // Check if item already exists
      const existingItem = items.find(item => 
        item.serviceId === newItem.serviceId && 
        item.providerId === newItem.providerId
      );

      if (existingItem) {
        // Update quantity
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        // Add new item
        if (isAuthenticated && user) {
          const { data, error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              service_id: newItem.serviceId,
              service_name: newItem.serviceName,
              provider_id: newItem.providerId,
              provider_name: newItem.providerName,
              price: newItem.price,
              quantity: 1,
              service_details: newItem.serviceDetails || {}
            })
            .select()
            .single();

          if (error) throw error;

          const cartItem: CartItem = {
            id: data.id,
            serviceId: data.service_id,
            serviceName: data.service_name,
            providerId: data.provider_id,
            providerName: data.provider_name,
            price: Number(data.price),
            quantity: data.quantity,
            serviceDetails: data.service_details
          };

          setItems(prev => [...prev, cartItem]);
        } else {
          // Guest user
          const guestSessionId = getGuestSessionId();
          
          try {
            const { data, error } = await supabase
              .from('guest_cart_items')
              .insert({
                session_id: guestSessionId,
                service_id: newItem.serviceId,
                service_name: newItem.serviceName,
                provider_id: newItem.providerId,
                provider_name: newItem.providerName,
                price: newItem.price,
                quantity: 1,
                service_details: newItem.serviceDetails || {}
              })
              .select()
              .single();

            if (error) throw error;

            const cartItem: CartItem = {
              id: data.id,
              serviceId: data.service_id,
              serviceName: data.service_name,
              providerId: data.provider_id,
              providerName: data.provider_name,
              price: Number(data.price),
              quantity: data.quantity,
              serviceDetails: data.service_details
            };

            setItems(prev => [...prev, cartItem]);
          } catch (error) {
            // Fallback to localStorage
            const cartItem: CartItem = {
              id: `temp_${Date.now()}`,
              serviceId: newItem.serviceId,
              serviceName: newItem.serviceName,
              providerId: newItem.providerId,
              providerName: newItem.providerName,
              price: newItem.price,
              quantity: 1,
              serviceDetails: newItem.serviceDetails || {}
            };

            const updatedItems = [...items, cartItem];
            setItems(updatedItems);
            localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
          }
        }

        toast({
          title: 'Added to cart',
          description: `${newItem.serviceName} has been added to your cart`
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setIsLoading(true);
    try {
      if (isAuthenticated && user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);

        if (error) throw error;
      } else {
        const guestSessionId = getGuestSessionId();
        try {
          const { error } = await supabase
            .from('guest_cart_items')
            .delete()
            .eq('id', itemId);

          if (error) throw error;
        } catch (error) {
          // Fallback to localStorage
          const updatedItems = items.filter(item => item.id !== itemId);
          localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
        }
      }

      setItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: 'Removed from cart',
        description: 'Item has been removed from your cart'
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    setIsLoading(true);
    try {
      if (isAuthenticated && user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);

        if (error) throw error;
      } else {
        const guestSessionId = getGuestSessionId();
        try {
          const { error } = await supabase
            .from('guest_cart_items')
            .update({ quantity })
            .eq('id', itemId);

          if (error) throw error;
        } catch (error) {
          // Fallback to localStorage
          const updatedItems = items.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          );
          localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
        }
      }

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item quantity',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated && user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const guestSessionId = getGuestSessionId();
        try {
          const { error } = await supabase
            .from('guest_cart_items')
            .delete()
            .eq('session_id', guestSessionId);

          if (error) throw error;
        } catch (error) {
          // Clear localStorage
          localStorage.removeItem('guest_cart');
        }
      }

      setItems([]);
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      totalAmount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};