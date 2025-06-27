import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "./AuthContext";
import { API_ENDPOINTS } from "../utils/constants";
import { toast } from "react-toastify";
import { CartContext } from "./CartContext";

const LOCAL_KEY = "guest_cart";

export const CartProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState([]);

  const validateStock = async (id, productId, quantity) => {
    const res = await axios.get(`${API_ENDPOINTS.PRODUCTS}/${productId}`);
    const product = res.data.data;
    const adjustedQuantity = Math.min(quantity, product.stockQuantity);

    return {
      id,
      productId,
      quantity: adjustedQuantity,
      productName: product.name,
      productPrice: product.price,
      productImage: product.imageUrl,
      totalPrice: product.price * adjustedQuantity,
    };
  };

  const loadCart = useCallback(async () => {
    if (isAuthenticated) {
      const res = await axios.get(API_ENDPOINTS.CART, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Check Stock Quantity using addToCart
      const validatedItems = await Promise.all(
        res.data.data.map((item) =>
          validateStock(item.id, item.productId, item.quantity)
        )
      );
      setCart(validatedItems);
    } else {
      const local = localStorage.getItem(LOCAL_KEY);
      const guestCart = local ? JSON.parse(local) : [];

      if (guestCart.length === 0) {
        setCart([]);
        return;
      }

      // Fetch product info for each item
      try {
        const enrichedCart = await Promise.all(
          guestCart.map(async (item) => {
            const res = await axios.get(
              `${API_ENDPOINTS.PRODUCTS}/${item.productId}`
            );
            const product = res.data.data;
            return {
              ...item,
              id: item.productId, // use productId as a stable ID
              productName: product.name,
              productPrice: product.price,
              productImage: product.imageUrl,
              totalPrice: product.price * item.quantity,
            };
          })
        );
        setCart(enrichedCart);
      } catch (err) {
        console.error("Failed to enrich guest cart:", err);
        setCart([]);
      }
    }
  }, [isAuthenticated, token]);

  // Add or update item
  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (quantity <= 0 || isNaN(quantity)) quantity = 1;
      if (isAuthenticated) {
        await axios.post(
          API_ENDPOINTS.CART,
          { productId, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const res = await axios.get(API_ENDPOINTS.CART, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(res.data.data);
      } else {
        const existing = cart.find((i) => i.productId === productId);
        const newCart = existing
          ? cart.map((i) =>
              i.productId === productId ? { ...i, quantity: quantity } : i
            )
          : [...cart, { productId, quantity }];
        await setCart(newCart);
        loadCart();
      }
    },
    [cart, isAuthenticated, loadCart, token]
  );

  // Load cart from either backend or localStorage
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated, token, loadCart]);

  // Sync to localStorage for guests
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  // Remove item
  const removeFromCart = useCallback(
    async (cartItemId) => {
      if (isAuthenticated) {
        await axios.delete(`${API_ENDPOINTS.CART}/${cartItemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(cart.filter((i) => i.id !== cartItemId));
      } else {
        setCart(cart.filter((i) => i.id !== cartItemId));
      }
    },
    [cart, isAuthenticated, token]
  );

  // Merge guest cart into API cart after login
  const syncGuestCart = useCallback(async () => {
    const guestCartRaw = localStorage.getItem(LOCAL_KEY);
    if (!guestCartRaw || !isAuthenticated) return;

    const guestCart = JSON.parse(guestCartRaw);

    try {
      // Step 1: Get current backend cart
      const res = await axios.get(API_ENDPOINTS.CART, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const backendCart = res.data.data; // [{ cartItemId, productId, quantity }]

      // Step 2: Merge
      for (const guestItem of guestCart) {
        const match = backendCart.find(
          (item) => item.productId === guestItem.productId
        );
        if (!match) {
          // Not in backend  add it
          await axios.post(
            API_ENDPOINTS.CART,
            { productId: guestItem.productId, quantity: guestItem.quantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else if (guestItem.quantity > match.quantity) {
          // Exists in both  update only if guest quantity is higher
          await axios.post(
            API_ENDPOINTS.CART,
            { productId: guestItem.productId, quantity: guestItem.quantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      // Step 3: Cleanup
      localStorage.removeItem(LOCAL_KEY);

      // Step 4: Reload backend cart
      const updated = await axios.get(API_ENDPOINTS.CART, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(updated.data.data);
    } catch (err) {
      console.error("Cart merge failed:", err);
      toast.error("Failed to sync cart");
    }
  }, [isAuthenticated, token]);

  const value = useMemo(
    () => ({
      cart,
      setCart,
      reloadCart: loadCart,
      addToCart,
      removeFromCart,
      syncGuestCart,
    }),
    [cart, setCart, loadCart, addToCart, removeFromCart, syncGuestCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
