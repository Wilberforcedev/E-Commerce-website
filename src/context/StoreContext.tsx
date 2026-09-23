import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Product,
  CartItem,
  Order,
  User,
  Coupon,
  FilterState,
  OrderStatus,
  ShippingAddress
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_COUPONS } from '../data/initialData';
import { auth, googleProvider, db } from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  writeBatch,
  runTransaction
} from 'firebase/firestore';

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
  isAuthLoading: boolean;
  isProductsLoading: boolean;

  // UI states
  activeView: 'shop' | 'admin' | 'orders' | 'wishlist';
  activeProductDetail: Product | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isAuthOpen: boolean;
  isOrderTrackerOpen: boolean;
  isVoiceSearchOpen: boolean;
  activeOrderConfirmation: Order | null;

  // Setters
  setActiveView: (view: 'shop' | 'admin' | 'orders' | 'wishlist') => void;
  setActiveProductDetail: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAuthOpen: (open: boolean) => void;
  setIsOrderTrackerOpen: (open: boolean) => void;
  setIsVoiceSearchOpen: (open: boolean) => void;
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

  placeOrder: (address: ShippingAddress, paymentMethod: string, shippingCost: number) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;

  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Auth actions
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  login: (email: string, role?: 'customer' | 'admin') => void;
  logout: () => Promise<void>;

  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Calculated helpers
  cartSubtotal: number;
  cartDiscount: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CART: 'novamart_cart_v2',
  WISHLIST: 'novamart_wishlist_v2',
  USER_BACKUP: 'novamart_user_v2',
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
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

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

  // UI state
  const [activeView, setActiveView] = useState<'shop' | 'admin' | 'orders' | 'wishlist'>('shop');
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState<boolean>(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState<boolean>(false);
  const [activeOrderConfirmation, setActiveOrderConfirmation] = useState<Order | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Synchronize Firebase Auth State
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      setIsAuthLoading(true);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          let userRole: 'customer' | 'admin' = 'customer';
          let loadedWishlist: string[] = wishlist;

          if (userSnap.exists()) {
            const data = userSnap.data();
            // Role is strictly read from Firestore server document or designated root owner email
            if (data.role === 'admin' || fbUser.email === 'wilberofficial2001@gmail.com') {
              userRole = 'admin';
            }
            if (Array.isArray(data.wishlist) && data.wishlist.length > 0) {
              loadedWishlist = data.wishlist;
              setWishlist(data.wishlist);
            }
          } else {
            // First time self-registration: strictly default to customer unless verified root admin
            if (fbUser.email === 'wilberofficial2001@gmail.com') {
              userRole = 'admin';
            }

            await setDoc(
              userDocRef,
              {
                uid: fbUser.uid,
                email: fbUser.email || '',
                displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
                photoURL: fbUser.photoURL || '',
                role: userRole,
                wishlist: loadedWishlist,
                createdAt: new Date().toISOString()
              },
              { merge: true }
            );
          }

          const mappedUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
            email: fbUser.email || '',
            role: userRole,
            avatar: fbUser.photoURL || undefined
          };

          setCurrentUser(mappedUser);
          localStorage.setItem(STORAGE_KEYS.USER_BACKUP, JSON.stringify(mappedUser));
        } catch (error) {
          console.error('Error fetching Firestore user profile:', error);
          const fallbackUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
            email: fbUser.email || '',
            role: 'customer',
            avatar: fbUser.photoURL || undefined
          };
          setCurrentUser(fallbackUser);
        }
      } else {
        // Fallback to local storage demo user if previously set
        try {
          const savedBackup = localStorage.getItem(STORAGE_KEYS.USER_BACKUP);
          if (savedBackup) {
            setCurrentUser(JSON.parse(savedBackup));
          } else {
            setCurrentUser(null);
          }
        } catch {
          setCurrentUser(null);
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Synchronize Products Collection from Firestore
  useEffect(() => {
    const productsCol = collection(db, 'products');
    const unsubscribeProducts = onSnapshot(
      productsCol,
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed initial products to Firestore
          try {
            const batch = writeBatch(db);
            INITIAL_PRODUCTS.forEach((prod) => {
              const docRef = doc(db, 'products', prod.id);
              batch.set(docRef, prod);
            });
            await batch.commit();
          } catch (seedErr) {
            console.error('Failed to seed products to Firestore:', seedErr);
          }
          setIsProductsLoading(false);
        } else {
          const loadedProducts = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Product, 'id'>)
          }));
          setProducts(loadedProducts);
          setIsProductsLoading(false);
        }
      },
      (err) => {
        console.warn('Firestore products snapshot listener:', err);
        setIsProductsLoading(false);
      }
    );

    return () => unsubscribeProducts();
  }, []);

  // 3. Synchronize Orders Collection from Firestore
  useEffect(() => {
    const ordersCol = collection(db, 'orders');
    const unsubscribeOrders = onSnapshot(
      ordersCol,
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed initial orders to Firestore so tracking works
          try {
            const batch = writeBatch(db);
            INITIAL_ORDERS.forEach((order) => {
              const docRef = doc(db, 'orders', order.id);
              batch.set(docRef, order);
            });
            await batch.commit();
          } catch (seedErr) {
            console.error('Failed to seed orders to Firestore:', seedErr);
          }
        } else {
          const loadedOrders = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Order, 'id'>)
          }));
          // Sort newest first
          loadedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setOrders(loadedOrders);
        }
      },
      (err) => {
        console.warn('Firestore orders snapshot listener:', err);
      }
    );

    return () => unsubscribeOrders();
  }, []);

  // Sync cart & wishlist to local storage
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
      // If user is logged in, sync wishlist to their Firestore doc
      if (currentUser?.id && auth.currentUser) {
        updateDoc(doc(db, 'users', currentUser.id), {
          wishlist
        }).catch((err) => console.warn('Could not sync wishlist to Firestore:', err));
      }
    } catch (e) {
      console.error(e);
    }
  }, [wishlist, currentUser?.id]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    // Live stock verification against latest catalog
    const liveProduct = products.find((p) => p.id === product.id) || product;
    if (liveProduct.stock <= 0) {
      addToast('Item Sold Out', `${liveProduct.name} is currently out of stock.`, 'error');
      return;
    }

    const existing = cart.find((item) => item.product.id === product.id);
    const currentCartQty = existing ? existing.quantity : 0;
    if (currentCartQty + quantity > liveProduct.stock) {
      addToast(
        'Inventory Limit',
        `Only ${liveProduct.stock} in stock. You already have ${currentCartQty} in your bag.`,
        'error'
      );
      return;
    }

    setCart((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product: liveProduct, quantity }];
    });
    addToast(`Added to Bag`, `${product.name} (x${quantity}) added.`);
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

    const liveProduct = products.find((p) => p.id === productId);
    if (liveProduct && quantity > liveProduct.stock) {
      addToast(
        'Stock Limit Reached',
        `Only ${liveProduct.stock} items available for "${liveProduct.name}".`,
        'error'
      );
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

  // Order Placement with Atomic Firestore Transaction
  const placeOrder = async (
    address: ShippingAddress,
    paymentMethod: string,
    shippingCost: number
  ): Promise<Order> => {
    if (cart.length === 0) {
      throw new Error('Your shopping cart is empty.');
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `NM-2026-${randomNum}`;
    const trackingNum = `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const orderId = `ord-${Date.now()}`;
    const orderDocRef = doc(db, 'orders', orderId);

    // Atomic transaction: reads live prices and stock, verifies availability,
    // decrements stock, and commits order simultaneously.
    const validatedOrder = await runTransaction(db, async (transaction) => {
      let validatedSubtotal = 0;
      const validatedItems: CartItem[] = [];
      const stockUpdates: { ref: any; newStock: number }[] = [];

      for (const item of cart) {
        const productRef = doc(db, 'products', item.product.id);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`Item "${item.product.name}" is no longer available.`);
        }

        const liveData = productSnap.data() as Product;
        const currentStock = typeof liveData.stock === 'number' ? liveData.stock : 0;

        if (currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${liveData.name}". Available: ${currentStock}, Requested: ${item.quantity}.`
          );
        }

        // Live verified price from Firestore
        const livePrice = typeof liveData.price === 'number' ? liveData.price : item.product.price;
        validatedSubtotal += livePrice * item.quantity;

        const remainingStock = currentStock - item.quantity;
        validatedItems.push({
          ...item,
          product: {
            ...item.product,
            price: livePrice,
            stock: remainingStock
          }
        });

        stockUpdates.push({
          ref: productRef,
          newStock: remainingStock
        });
      }

      // Validated discount calculation
      let discount = 0;
      if (appliedCoupon) {
        if (!appliedCoupon.minSpend || validatedSubtotal >= appliedCoupon.minSpend) {
          if (appliedCoupon.discountPercent) {
            discount = (validatedSubtotal * appliedCoupon.discountPercent) / 100;
          } else if (appliedCoupon.discountAmount) {
            discount = appliedCoupon.discountAmount;
          }
        }
      }

      const tax = Math.round((validatedSubtotal - discount) * 0.08 * 100) / 100;
      const total = Math.max(0, Math.round((validatedSubtotal - discount + shippingCost + tax) * 100) / 100);

      const orderPayload: Order = {
        id: orderId,
        userId: currentUser?.id || (auth.currentUser?.uid ?? 'guest'),
        orderNumber,
        date: new Date().toISOString(),
        items: validatedItems,
        subtotal: validatedSubtotal,
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

      // 1. Decrement stock atomically
      for (const update of stockUpdates) {
        transaction.update(update.ref, { stock: update.newStock });
      }

      // 2. Write order atomically
      transaction.set(orderDocRef, orderPayload);

      return orderPayload;
    });

    setOrders((prev) => [validatedOrder, ...prev]);
    clearCart();
    setActiveOrderConfirmation(validatedOrder);
    addToast('Order Placed Successfully!', `Order #${orderNumber} confirmed with verified pricing & stock.`, 'success');
    return validatedOrder;
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (e) {
      console.warn('Could not update order status in Firestore:', e);
    }
    addToast('Order Updated', `Order status changed to ${newStatus}.`, 'info');
  };

  // Product Admin Operations with Firestore Persistence
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    try {
      await setDoc(doc(db, 'products', newProduct.id), newProduct);
    } catch (e) {
      console.warn('Could not save product to Firestore:', e);
    }
    setProducts((prev) => [newProduct, ...prev]);
    addToast('Product Created', `${newProduct.name} saved to Firestore inventory.`);
  };

  const updateProduct = async (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    try {
      await setDoc(doc(db, 'products', updated.id), updated, { merge: true });
    } catch (e) {
      console.warn('Could not update product in Firestore:', e);
    }
    addToast('Product Updated', `${updated.name} changes persisted.`);
  };

  const deleteProduct = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.warn('Could not delete product from Firestore:', e);
    }
    addToast('Product Removed', prod ? `${prod.name} deleted.` : undefined, 'info');
  };

  // Firebase Authentication
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      addToast('Signed in with Google', `Welcome back, ${fbUser.displayName || fbUser.email}!`);
      setIsAuthOpen(false);
    } catch (error: any) {
      console.error('Google Sign-in error:', error);
      addToast('Sign-in Failed', error.message || 'Could not complete Google Sign-in.', 'error');
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      addToast('Welcome Back', `Signed in as ${result.user.email}`);
      setIsAuthOpen(false);
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      addToast('Authentication Error', error.message || 'Incorrect email or password.', 'error');
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      addToast('Account Created', `Welcome to NovaMart, ${result.user.email}!`);
      setIsAuthOpen(false);
    } catch (error: any) {
      console.error('Sign-up error:', error);
      addToast('Registration Error', error.message || 'Could not create account.', 'error');
      throw error;
    }
  };

  // Demo profile fallback
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
    localStorage.setItem(STORAGE_KEYS.USER_BACKUP, JSON.stringify(user));
    addToast('Demo Mode Activated', `Signed in as ${user.name} (${user.role}).`);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign-out error:', e);
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER_BACKUP);
    if (activeView === 'admin') {
      setActiveView('shop');
    }
    addToast('Signed Out', 'You have been signed out securely.', 'info');
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
        isAuthLoading,
        isProductsLoading,
        activeView,
        activeProductDetail,
        isCartOpen,
        isCheckoutOpen,
        isAuthOpen,
        isOrderTrackerOpen,
        isVoiceSearchOpen,
        activeOrderConfirmation,
        setActiveView,
        setActiveProductDetail,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsAuthOpen,
        setIsOrderTrackerOpen,
        setIsVoiceSearchOpen,
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
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
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
