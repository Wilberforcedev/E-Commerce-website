import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, User, Coupon, FilterState, OrderStatus, ShippingAddress } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_COUPONS } from '../data/initialData';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  currentUser: User | null;
  appliedCoupon: Coupon | null;
  filters: FilterState;
  toasts: ToastMessage[];
  
  // UI states
  activeView: 'shop' | 'admin' | 'orders' | 'wishlist';
  activeProductDetail: Product | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isAuthOpen: boolean;
  isOrderTrackerOpen: boolean;
  activeOrderConfirmation: Order | null;
  
  // Setters
  setActiveView: (view: 'shop' | 'admin' | 'orders' | 'wishlist') => void;
  setActiveProductDetail: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAuthOpen: (open: boolean) => void;
  setIsOrderTrackerOpen: (open: boolean) => void;
  setActiveOrderConfirmation: (order: Order | null) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  
  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  placeOrder: (address: ShippingAddress, paymentMethod: string, shippingCost: number) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  login: (email: string, role?: 'customer' | 'admin') => void;
  logout: () => void;
  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Calculated helpers
  cartSubtotal: number;
  cartDiscount: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'novamart_products_v1',
  CART: 'novamart_cart_v1',
  WISHLIST: 'novamart_wishlist_v1',
  ORDERS: 'novamart_orders_v1',
  USER: 'novamart_user_v1'
};

const DEFAULT_FILTERS: FilterState = {
  category: 'All',
  search: '',
  minPrice: 0,
  maxPrice: 1000,
  minRating: 0,
  inStockOnly: false,
  sortBy: 'featured'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-3'];
    } catch {
      return ['prod-1', 'prod-3'];
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      id: 'usr-default',
      name: 'Wilberforce Dev',
      email: 'wilberofficial2001@gmail.com',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    };
  });

  // UI state
  const [activeView, setActiveView] = useState<'shop' | 'admin' | 'orders' | 'wishlist'>('shop');
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState<boolean>(false);
  const [activeOrderConfirmation, setActiveOrderConfirmation] = useState<Order | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Toast Helper
  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    addToast(`Added to Bag`, `${product.name} (x${quantity}) has been added to your shopping cart.`);
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    if (item) {
      addToast(`Removed from Bag`, `${item.product.name} was removed from cart.`, 'info');
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    const inList = wishlist.includes(productId);
    const prod = products.find((p) => p.id === productId);
    if (inList) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      addToast('Removed from Saved', prod ? `${prod.name} removed from your wishlist.` : undefined, 'info');
    } else {
      setWishlist((prev) => [...prev, productId]);
      addToast('Saved to Wishlist', prod ? `${prod.name} saved to your wishlist.` : undefined, 'success');
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Coupon
  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = INITIAL_COUPONS.find((c) => c.code === trimmed);

    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code. Try WELCOME10 or SAVE25' };
    }

    if (found.minSpend && cartSubtotal < found.minSpend) {
      return { success: false, message: `This coupon requires a minimum spend of $${found.minSpend}` };
    }

    setAppliedCoupon(found);
    addToast('Coupon Applied!', `${found.code} was applied to your order.`, 'success');
    return { success: true, message: `Applied: ${found.description}` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon Removed', undefined, 'info');
  };

  // Calculation helpers
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const cartDiscount = appliedCoupon
    ? appliedCoupon.discountPercent
      ? (cartSubtotal * appliedCoupon.discountPercent) / 100
      : appliedCoupon.discountAmount || 0
    : 0;

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Order Placement
  const placeOrder = (
    address: ShippingAddress,
    paymentMethod: string,
    shippingCost: number
  ): Order => {
    const subtotal = cartSubtotal;
    const discount = cartDiscount;
    const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
    const total = Math.max(0, Math.round((subtotal - discount + shippingCost + tax) * 100) / 100);

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `NM-2026-${randomNum}`;
    const trackingNum = `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString(),
      items: [...cart],
      subtotal,
      discount,
      shipping: shippingCost,
      tax,
      total,
      status: 'Pending',
      shippingAddress: address,
      paymentMethod,
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      trackingNumber: trackingNum,
      carrier: shippingCost > 15 ? 'FedEx Priority' : 'DHL Standard'
    };

    // Decrease stock of bought products
    setProducts((prev) =>
      prev.map((prod) => {
        const bought = cart.find((item) => item.product.id === prod.id);
        if (bought) {
          return { ...prod, stock: Math.max(0, prod.stock - bought.quantity) };
        }
        return prod;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setActiveOrderConfirmation(newOrder);
    addToast('Order Placed Successfully!', `Order #${orderNumber} is being processed.`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    addToast('Order Updated', `Order status changed to ${newStatus}.`, 'info');
  };

  // Product Admin Operations
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast('Product Created', `${newProduct.name} has been added to inventory.`);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    addToast('Product Updated', `${updated.name} changes saved.`);
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('Product Removed', prod ? `${prod.name} deleted.` : undefined, 'info');
  };

  // Auth
  const login = (email: string, role: 'customer' | 'admin' = 'customer') => {
    const user: User = {
      id: `usr-${Date.now()}`,
      name: role === 'admin' ? 'Store Administrator' : email.split('@')[0],
      email,
      role,
      avatar:
        role === 'admin'
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    };
    setCurrentUser(user);
    addToast('Welcome back!', `Logged in as ${user.name} (${user.role}).`);
  };

  const logout = () => {
    setCurrentUser(null);
    if (activeView === 'admin') {
      setActiveView('shop');
    }
    addToast('Logged Out', 'You have been signed out safely.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        wishlist,
        orders,
        currentUser,
        appliedCoupon,
        filters,
        toasts,
        activeView,
        activeProductDetail,
        isCartOpen,
        isCheckoutOpen,
        isAuthOpen,
        isOrderTrackerOpen,
        activeOrderConfirmation,
        setActiveView,
        setActiveProductDetail,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsAuthOpen,
        setIsOrderTrackerOpen,
        setActiveOrderConfirmation,
        setFilters,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCoupon,
        removeCoupon,
        placeOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        login,
        logout,
        addToast,
        removeToast,
        cartSubtotal,
        cartDiscount,
        cartCount
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
