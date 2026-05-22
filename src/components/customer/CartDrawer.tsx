import React, { useState } from 'react';
import { X, Trash2, Minus, Plus, CreditCard, Banknote, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase, isMockMode } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    tableNumber,
    clearCart,
  } = useCart();

  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('qris');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!cartOpen) return null;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    // If no table tracking, default to Table 'General' or prompt
    const finalTable = tableNumber || '01';

    try {
      if (isMockMode) {
        // Simulate checkout in Mock Mode
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const mockOrderId = `mock-order-${Math.floor(100000 + Math.random() * 900000)}`;
        
        // Save mock order details to sessionStorage for the tracking page
        sessionStorage.setItem(
          `mock_order_${mockOrderId}`,
          JSON.stringify({
            id: mockOrderId,
            table_number: finalTable,
            status: 'pending',
            payment_method: paymentMethod,
            payment_status: 'unpaid',
            total_amount: cartTotal,
            created_at: new Date().toISOString(),
            items: cartItems.map((item) => ({
              id: Math.random().toString(),
              menu: item.menu,
              quantity: item.quantity,
              spice_level: item.spiceLevel,
              notes: item.notes,
              price: item.menu.price,
            })),
          })
        );

        clearCart();
        setCartOpen(false);
        router.push(`/status/${mockOrderId}`);
      } else {
        // Real Supabase Checkout Flow
        
        // 1. Create order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            table_number: finalTable,
            status: 'pending',
            payment_method: paymentMethod,
            payment_status: 'unpaid',
            total_amount: cartTotal,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // 2. Create order items
        const orderItemsToInsert = cartItems.map((item) => ({
          order_id: orderData.id,
          menu_id: item.menu.id,
          quantity: item.quantity,
          spice_level: item.spiceLevel,
          notes: item.notes || '',
          price: Number(item.menu.price),
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsToInsert);

        if (itemsError) throw itemsError;

        // 3. Success -> Cleanup and redirect
        clearCart();
        setCartOpen(false);
        router.push(`/status/${orderData.id}`);
      }
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const message = err instanceof Error ? err.message : 'Something went wrong during checkout. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isSubmitting && setCartOpen(false)}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-md bg-gray-50 h-full shadow-2xl flex flex-col z-10 transition-transform duration-300 transform translate-x-0">
        
        {/* Header */}
        <div className="bg-white p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#046A55]/10 p-2 rounded-xl text-[#046A55]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-gray-950 text-base leading-tight">My Basket</h2>
              <span className="text-xs text-gray-500 font-semibold">
                Table {tableNumber || '01'} • {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
              </span>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            disabled={isSubmitting}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Bar */}
        {errorMsg && (
          <div className="bg-red-50 text-red-700 text-xs font-bold p-3 border-b border-red-100 text-center animate-pulse">
            {errorMsg}
          </div>
        )}

        {/* Scrollable Items list */}
        <div className="flex-grow overflow-y-auto p-5 space-y-3.5 scrollbar-none">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="bg-white p-6 rounded-full shadow-sm mb-4 text-gray-300">
                <ShoppingBag className="w-12 h-12" />
              </div>
              <h3 className="font-bold text-gray-800 text-base">Your basket is empty</h3>
              <p className="text-xs text-gray-500 max-w-[200px] mt-1.5 leading-relaxed">
                Add delicious food and drinks from our menu to get started!
              </p>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div
                key={`${item.menu.id}-${item.spiceLevel}-${index}`}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-3.5 relative group hover:border-[#046A55]/20 transition-all"
              >
                {/* Food thumb */}
                <img
                  src={item.menu.image_url || ''}
                  alt={item.menu.name}
                  className="w-16 h-16 rounded-lg object-cover bg-gray-50 border border-gray-100"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
                  }}
                />

                {/* Details */}
                <div className="flex-grow flex flex-col">
                  <h4 className="font-bold text-gray-900 text-xs md:text-sm line-clamp-1 leading-tight mb-0.5">
                    {item.menu.name}
                  </h4>
                  
                  {/* Spice level badge */}
                  <div className="flex flex-wrap gap-1.5 my-1">
                    {item.spiceLevel > 0 && (
                      <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-100">
                        🔥 Level {item.spiceLevel}
                      </span>
                    )}
                    {item.notes.trim() && (
                      <span className="bg-gray-50 text-gray-500 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-gray-100 italic line-clamp-1 max-w-[150px]">
                        &quot;{item.notes}&quot;
                      </span>
                    )}
                  </div>

                  <span className="font-extrabold text-[#046A55] text-sm mt-auto">
                    ${(Number(item.menu.price) * item.quantity).toFixed(2)}
                  </span>
                </div>

                {/* Steppers & Delete */}
                <div className="flex flex-col items-end justify-between min-w-[70px]">
                  <button
                    onClick={() => removeFromCart(item.menu.id, item.spiceLevel, item.notes)}
                    disabled={isSubmitting}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 border border-gray-200">
                    <button
                      onClick={() => updateQuantity(item.menu.id, item.spiceLevel, item.notes, item.quantity - 1)}
                      disabled={isSubmitting}
                      className="w-5.5 h-5.5 rounded-full hover:bg-white text-gray-600 flex items-center justify-center transition-colors focus:outline-none"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-gray-800 text-xs min-w-[12px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menu.id, item.spiceLevel, item.notes, item.quantity + 1)}
                      disabled={isSubmitting}
                      className="w-5.5 h-5.5 rounded-full hover:bg-white text-gray-600 flex items-center justify-center transition-colors focus:outline-none"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Footer panel */}
        {cartItems.length > 0 && (
          <div className="bg-white p-5 border-t border-gray-100 space-y-4">
            
            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="font-bold text-gray-900 text-xs uppercase tracking-wider block">Payment Option</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                    paymentMethod === 'qris'
                      ? 'border-[#046A55] bg-[#046A55]/5 text-[#046A55]'
                      : 'border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  QRIS (Scan Pay)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-[#046A55] bg-[#046A55]/5 text-[#046A55]'
                      : 'border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  Pelayan (Cash)
                </button>
              </div>
            </div>

            {/* Calculations */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Service Fee & Tax</span>
                <span className="font-bold text-gray-800">$0.00</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-sm">Total Amount</span>
                <span className="font-black text-[#046A55] text-lg">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-sm text-white shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-[#046A55] hover:bg-[#035242] shadow-[#046A55]/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : (
                `Send Order (${tableNumber ? `Meja ${tableNumber}` : 'Table 01'})`
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
export default CartDrawer;
