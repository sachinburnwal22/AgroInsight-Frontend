"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  isCheckingOut: boolean;
  checkoutSuccess: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<boolean>;
  fetchCart: () => Promise<void>;
  checkout: () => Promise<void>;
  resetCheckoutStatus: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { token, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Fetch cart items when token changes
  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [token]);

  const fetchCart = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === "success") {
        setCartItems(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load cart items:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity = 1): Promise<boolean> => {
    if (!token) {
      toast.error("Please sign in to add products to your cart.");
      return false;
    }
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/cart/add",
        { product_id: productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === "success") {
        toast.success(res.data.message || "Product added to cart!");
        await fetchCart();
        return true;
      }
      return false;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to add product to cart.";
      toast.error(errMsg);
      return false;
    }
  };

  const removeFromCart = async (cartItemId: number): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await axios.delete(`http://127.0.0.1:8000/api/cart/remove/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === "success") {
        toast.success(res.data.message || "Item removed from cart");
        await fetchCart();
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove item.");
      return false;
    }
  };

  // Dynamically load Razorpay SDK script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const checkout = async () => {
    if (!token || !user) {
      toast.error("Please log in to proceed to checkout.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsCheckingOut(true);
    try {
      // 1. Create Razorpay/Mock Order in Backend
      const orderRes = await axios.post(
        "http://127.0.0.1:8000/api/payment/create-order",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (orderRes.data.status !== "success") {
        throw new Error("Failed to create order on payment server.");
      }

      const orderData = orderRes.data;

      // 2. Handle Mock Payment Checkout (No credentials configured)
      if (orderData.is_mock) {
        toast.info("Entering simulated Sandbox transaction... (No API Keys Configured)");
        
        setTimeout(async () => {
          try {
            const verifyRes = await axios.post(
              "http://127.0.0.1:8000/api/payment/verify",
              {
                razorpay_order_id: orderData.razorpay_order_id,
                razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(2, 11),
                razorpay_signature: "sig_mock_" + Math.random().toString(36).substring(2, 11),
                is_mock: true
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.status === "success") {
              setCheckoutSuccess(true);
              setCartItems([]);
              toast.success("Transaction Simulated successfully!");
            }
          } catch (err: any) {
            toast.error(err.response?.data?.message || "Mock checkout verification failed.");
          } finally {
            setIsCheckingOut(false);
          }
        }, 1800);
        return;
      }

      // 3. Handle Real Razorpay Gateway Transaction
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway assets. Please check your network connection.");
        setIsCheckingOut(false);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount_paise,
        currency: "INR",
        name: "AgroInsight AgriMarket",
        description: "Immersive 3D AgriMarket Purchase",
        order_id: orderData.razorpay_order_id,
        handler: async function (response: any) {
          setIsCheckingOut(true);
          try {
            const verifyRes = await axios.post(
              "http://127.0.0.1:8000/api/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                is_mock: false
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.status === "success") {
              setCheckoutSuccess(true);
              setCartItems([]);
              toast.success("Order placed successfully! Transaction verified.");
            }
          } catch (verifyErr: any) {
            toast.error(verifyErr.response?.data?.message || "Order payment signature verification failed.");
          } finally {
            setIsCheckingOut(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#00d084",
        },
        modal: {
          ondismiss: function () {
            setIsCheckingOut(false);
            toast.error("Checkout canceled by user.");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Checkout connection failed.");
      setIsCheckingOut(false);
    }
  };

  const resetCheckoutStatus = () => {
    setCheckoutSuccess(false);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        isCheckingOut,
        checkoutSuccess,
        addToCart,
        removeFromCart,
        fetchCart,
        checkout,
        resetCheckoutStatus
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
