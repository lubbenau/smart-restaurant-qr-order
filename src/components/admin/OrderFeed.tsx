import React, { useState, useEffect } from 'react';
import { Clock, Check, Coffee, XCircle, DollarSign, AlertCircle, Volume2 } from 'lucide-react';
import { supabase, isMockMode, Order } from '@/lib/supabase';

interface OrderItemWithMenu {
  id: string;
  quantity: number;
  spice_level: number;
  notes: string;
  price: number;
  menus: {
    name: string;
  };
}

interface AdminOrder extends Order {
  items?: OrderItemWithMenu[];
}

interface OrderFeedProps {
  orders: AdminOrder[];
  setOrders: React.Dispatch<React.SetStateAction<AdminOrder[]>>;
}

export const OrderFeed: React.FC<OrderFeedProps> = ({ orders, setOrders }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'completed'>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // 1. Play premium synthesized chime alarm when a new order is received
  const playChimeAlarm = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        // Fallback: Synthesize dual-tone deluxe bell using Web Audio API!
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // High soft chime note E5
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain1.gain.setValueAtTime(0.12, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.55);

        // Deluxe harmonic G5 chime slightly delayed
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12);
        gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.12);
        osc2.stop(ctx.currentTime + 0.7);
      });
    } catch (e) {
      console.warn('AudioContext synthesizer blocked by browser autoplay rules:', e);
    }
  };

  // Trigger alarm sound on list changes representing a new order additions
  useEffect(() => {
    if (orders.length > 0) {
      const hasPending = orders.some((o) => o.status === 'pending');
      if (hasPending) {
        // Visual indicator that audio is ready to fire
        console.log('New order alerts triggered.');
      }
    }
  }, [orders]);

  // Handle Order status updates
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      if (isMockMode || orderId.startsWith('mock-')) {
        // Update local session storage in mock mode
        const mockOrderKey = `mock_order_${orderId}`;
        const savedMock = sessionStorage.getItem(mockOrderKey);
        
        let updatedOrder: AdminOrder | null = null;
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id === orderId) {
              const u = { ...o, status: newStatus as any };
              updatedOrder = u;
              return u;
            }
            return o;
          })
        );

        if (savedMock && updatedOrder) {
          const parsed = JSON.parse(savedMock);
          sessionStorage.setItem(mockOrderKey, JSON.stringify({ ...parsed, status: newStatus }));
        }

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as any } : null));
        }
      } else {
        // Update in Supabase
        const { error } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId);

        if (error) throw error;

        // Visual Optimistic updates
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as any } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Toggle Payment Status
  const handleTogglePayment = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    try {
      if (isMockMode || orderId.startsWith('mock-')) {
        const mockOrderKey = `mock_order_${orderId}`;
        const savedMock = sessionStorage.getItem(mockOrderKey);

        let updatedOrder: AdminOrder | null = null;
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id === orderId) {
              const u = { ...o, payment_status: nextStatus as any };
              updatedOrder = u;
              return u;
            }
            return o;
          })
        );

        if (savedMock && updatedOrder) {
          const parsed = JSON.parse(savedMock);
          sessionStorage.setItem(mockOrderKey, JSON.stringify({ ...parsed, payment_status: nextStatus }));
        }

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, payment_status: nextStatus as any } : null));
        }
      } else {
        const { error } = await supabase
          .from('orders')
          .update({ payment_status: nextStatus })
          .eq('id', orderId);

        if (error) throw error;

        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, payment_status: nextStatus as any } : o))
        );

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, payment_status: nextStatus as any } : null));
        }
      }
    } catch (err) {
      console.error('Failed to toggle payment:', err);
    }
  };

  const filteredOrders = orders
    .filter((o) => filter === 'all' || o.status === filter)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      
      {/* List Panel */}
      <div className="lg:col-span-2 flex flex-col bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden h-full">
        
        {/* Header Tab Filter */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {(['all', 'pending', 'preparing', 'ready', 'completed'] as const).map((tab) => {
              const count = orders.filter((o) => tab === 'all' || o.status === tab).length;
              const isActive = filter === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none uppercase tracking-wider ${
                    isActive
                      ? 'bg-[#10B981] text-gray-950 shadow-sm'
                      : 'bg-[#1E293B] text-gray-400 hover:text-white'
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          <button
            onClick={playChimeAlarm}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all focus:outline-none"
          >
            <Volume2 className="w-4 h-4 animate-bounce" />
            Test Alarm Sound
          </button>
        </div>

        {/* Orders Card Feed */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3 scrollbar-none">
          {filteredOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="bg-[#1E293B] p-5 rounded-full mb-3 text-gray-600">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-gray-300 text-sm uppercase tracking-wide">No Orders Found</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Waiting for customers to scan and place orders...</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between hover:border-[#10B981]/50 ${
                    isSelected
                      ? 'bg-[#1E293B]/60 border-[#10B981]'
                      : 'bg-[#0B0F19] border-[#1E293B] hover:bg-[#1E293B]/20'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-[#10B981]/15 text-[#10B981] text-xs font-black px-3 py-0.5 rounded-md">
                        Meja {order.table_number}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-gray-300 font-semibold text-xs leading-normal">
                      Order: <span className="font-mono text-white text-xs">{order.id.slice(0, 8)}...</span> ({itemCount} items)
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-white font-extrabold text-xs">${Number(order.total_amount).toFixed(2)}</span>
                    
                    {/* Status Badge */}
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      order.status === 'pending'
                        ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                        : order.status === 'preparing'
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                        : order.status === 'ready'
                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 animate-pulse'
                        : order.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/15 text-red-500 border border-red-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Order Detail Sidebar Panel */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden h-full flex flex-col justify-between">
        {selectedOrder ? (
          <div className="flex flex-col h-full">
            {/* Header info */}
            <div className="p-5 border-b border-[#1E293B] bg-[#0B0F19]">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-[#10B981]/15 text-[#10B981] text-sm font-black px-3.5 py-1 rounded-lg">
                  Meja {selectedOrder.table_number}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {new Date(selectedOrder.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-white font-black text-xs uppercase tracking-widest truncate">
                Invoice ID: <span className="font-mono">{selectedOrder.id}</span>
              </h3>
            </div>

            {/* List items */}
            <div className="flex-grow overflow-y-auto p-5 space-y-3.5 scrollbar-none divide-y divide-[#1E293B]/60">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="pt-3.5 first:pt-0 flex justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs">{item.menus?.name || 'Unknown Menu'}</h5>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-gray-800 text-gray-400 text-[9px] px-2 py-0.5 rounded font-bold">Qty: {item.quantity}</span>
                      {item.spice_level > 0 && (
                        <span className="bg-amber-950/40 text-amber-500 text-[9px] px-2 py-0.5 rounded font-black border border-amber-900/30">🔥 Lvl {item.spice_level}</span>
                      )}
                      {item.notes && (
                        <p className="text-[9px] text-gray-500 italic max-w-[150px] leading-relaxed truncate">&quot;{item.notes}&quot;</p>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-gray-300 font-mono text-xs">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Actions panel */}
            <div className="p-5 border-t border-[#1E293B] space-y-4 bg-[#0B0F19]">
              
              {/* Payment Summary */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500 font-bold block">TOTAL AMOUNT</span>
                  <span className="text-white font-black text-base font-mono">${Number(selectedOrder.total_amount).toFixed(2)}</span>
                </div>
                <button
                  onClick={() => handleTogglePayment(selectedOrder.id, selectedOrder.payment_status)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                    selectedOrder.payment_status === 'paid'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                  }`}
                >
                  {selectedOrder.payment_status === 'paid' ? 'Lunas (Paid)' : 'Belum Bayar'}
                </button>
              </div>

              {/* Status Steppers Toggles */}
              <div className="space-y-2 border-t border-[#1E293B] pt-4">
                <span className="text-gray-500 text-[10px] font-black uppercase block tracking-wider">Update Order Status</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'preparing')}
                    disabled={selectedOrder.status === 'preparing'}
                    className="flex items-center justify-center gap-1.5 bg-[#1E293B] hover:bg-[#1E293B]/80 hover:text-white text-gray-300 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:bg-[#10B981]/15 disabled:text-[#10B981]"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    Kitchen (Dibuat)
                  </button>
                  
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'ready')}
                    disabled={selectedOrder.status === 'ready'}
                    className="flex items-center justify-center gap-1.5 bg-[#1E293B] hover:bg-[#1E293B]/80 hover:text-white text-gray-300 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:bg-indigo-500/15 disabled:text-indigo-400"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Siap Saji
                  </button>
                  
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                    disabled={selectedOrder.status === 'completed'}
                    className="flex items-center justify-center gap-1.5 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400 border border-emerald-900/30 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:bg-emerald-500/10"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Selesai
                  </button>
                  
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                    disabled={selectedOrder.status === 'cancelled'}
                    className="flex items-center justify-center gap-1.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Batal Order
                  </button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
            <Clock className="w-10 h-10 text-gray-600 mb-2" />
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-400">Order Details</h4>
            <p className="text-[11px] leading-relaxed max-w-[200px] mt-1">Select an incoming order from the feed to view invoice details, spice levels, and take actions.</p>
          </div>
        )}
      </div>

    </div>
  );
};
export default OrderFeed;
