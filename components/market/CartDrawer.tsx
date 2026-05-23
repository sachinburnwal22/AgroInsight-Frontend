"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Trash2, ShoppingBag, CreditCard, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    cartItems,
    cartTotal,
    removeFromCart,
    checkout,
    isCheckingOut,
    checkoutSuccess,
    resetCheckoutStatus
  } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Dark Overlay Backplate */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm"
      />

      {/* Drawer Container Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full sm:w-[450px] z-[160] bg-[#070710]/95 border-l border-white/10 p-6 flex flex-col backdrop-blur-2xl shadow-2xl text-foreground font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-black text-white">Your Seed Cart</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white cursor-pointer border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {checkoutSuccess ? (
          /* Transaction Success State Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-6 px-4"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_30px_rgba(0,208,132,0.3)] animate-bounce">
              <ShieldCheck className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-white font-mono tracking-wide uppercase">TRANSACTION_COMPLETED</h4>
              <p className="text-xs text-muted-foreground uppercase font-mono tracking-widest text-primary">Status: SECURE_PAID_SUCCESS</p>
              <p className="text-sm text-slate-300 leading-relaxed pt-2">
                Your payment has been verified. The order is stored, and your items are ready for shipment.
              </p>
            </div>

            <button
              onClick={() => {
                resetCheckoutStatus();
                onClose();
              }}
              className="w-full py-4 bg-primary hover:bg-primary/95 text-black font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,208,132,0.4)] transition-all select-none cursor-pointer"
            >
              Return to Marketplace
            </button>
          </motion.div>
        ) : (
          /* Shopping Cart Flow State Screen */
          <>
            {/* Scrollable Items list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center py-20">
                  <ShoppingBag className="w-12 h-12 stroke-[1] mb-3 text-white/20 animate-pulse" />
                  <p className="text-sm font-semibold">Your cart is empty</p>
                  <p className="text-xs mt-1 text-white/40">Explore the 3D shops and add agricultural items to checkout.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-white/5 border border-white/5 rounded-xl flex gap-4 items-center relative overflow-hidden group hover:border-white/10 transition-colors"
                  >
                    {/* Item Thumbnail */}
                    <div
                      className="w-16 h-16 rounded-lg bg-cover bg-center border border-white/10 flex-shrink-0"
                      style={{ backgroundImage: `url(${item.product.image})` }}
                    />
                    
                    {/* Item Metadata */}
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {item.quantity} x ₹{item.product.price}
                      </p>
                      <p className="text-xs text-primary font-bold mt-1">
                        Subtotal: ₹{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Delete Controls */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 text-muted-foreground hover:text-rose-400 transition-all cursor-pointer flex-shrink-0"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Total Block & Checkout Footer */}
            {cartItems.length > 0 && (
              <div className="mt-6 border-t border-white/5 pt-6 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground font-semibold">Subtotal Amount</span>
                  <span className="text-2xl font-black text-white">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="h-[1px] bg-white/5" />
                
                <button
                  onClick={checkout}
                  disabled={isCheckingOut}
                  className="w-full py-4 bg-gradient-to-r from-primary to-accent text-background font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,208,132,0.3)] hover:shadow-[0_0_30px_rgba(0,208,132,0.5)] transition-all flex items-center justify-center gap-2 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      <span>Processing Transaction...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4.5 h-4.5" />
                      <span>Proceed to Payment</span>
                    </>
                  )}
                </button>
                <p className="text-[9px] text-center text-muted-foreground font-mono uppercase tracking-widest leading-none pt-1">
                  SECURE_GATEWAY // TEST_MODE_ACTIVE
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </>
  );
}
