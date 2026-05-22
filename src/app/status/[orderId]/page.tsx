'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Coffee, Flame, CheckCircle, Clock, Sparkles, CreditCard } from 'lucide-react';
import { supabase, isMockMode, Order, formatRupiah } from '@/lib/supabase';

interface OrderWithItems extends Order {
  items?: {
    id: string;
    quantity: number;
    spice_level: number;
    notes: string;
    price: number;
    menu: {
      name: string;
      image_url: string;
    };
  }[];
}

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQRIS, setShowQRIS] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      setLoading(true);

      if (isMockMode || orderId.startsWith('mock-')) {
        // Read simulated order from localStorage
        const savedMock = localStorage.getItem(`mock_order_${orderId}`);
        if (savedMock) {
          try {
            setOrder(JSON.parse(savedMock));
          } catch (e) {
            console.error('Failed to parse mock order:', e);
          }
        }
        setLoading(false);
      } else {
        try {
          // Fetch order
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

          if (orderError) throw orderError;

          // Fetch items with joined menu details
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('id, quantity, spice_level, notes, price, menus(name, image_url)')
            .eq('order_id', orderId);

          if (itemsError) throw itemsError;

          // Map structure for easier usage
          const structuredItems = itemsData?.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            spice_level: item.spice_level,
            notes: item.notes,
            price: item.price,
            menu: {
              name: item.menus?.name || 'Unknown Item',
              image_url: item.menus?.image_url || '',
            },
          }));

          setOrder({
            ...orderData,
            items: structuredItems,
          });
        } catch (err) {
          console.error('Error loading order status:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrderDetails();

    // 1. REAL-TIME SUPABASE SUBSCRIPTION FOR ORDER UPDATES
    let channel: any = null;
    let pollInterval: any = null;

    if (!isMockMode && !orderId.startsWith('mock-')) {
      channel = supabase
        .channel(`order-tracking-${orderId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
          async (payload) => {
            if (payload.new) {
              setOrder((prev) => (prev ? { ...prev, ...payload.new } : null));
            }
          }
        )
        .subscribe();

      // 2. ROBUST POLLING FALLBACK (Every 3 seconds)
      // This guarantees synchronization even if Supabase replication/real-time is disabled
      pollInterval = setInterval(async () => {
        try {
          const { data: updatedOrder, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

          if (!error && updatedOrder) {
            setOrder((prev) => {
              if (!prev) return prev;
              if (
                prev.status !== updatedOrder.status ||
                prev.payment_status !== updatedOrder.payment_status ||
                prev.total_amount !== updatedOrder.total_amount
              ) {
                return { ...prev, ...updatedOrder };
              }
              return prev;
            });
          }
        } catch (err) {
          console.error('Failed to poll order status:', err);
        }
      }, 3000);
    } else {
      // 3. MOCK REALTIME STORAGE POLL
      // Periodic poller that reads updated status from localStorage every 1.5 seconds
      pollInterval = setInterval(() => {
        const savedMock = localStorage.getItem(`mock_order_${orderId}`);
        if (savedMock) {
          try {
            const parsed = JSON.parse(savedMock);
            setOrder((prev) => {
              if (!prev) return parsed;
              // Only update if status or payment_status or payment_method has changed
              if (
                prev.status !== parsed.status ||
                prev.payment_status !== parsed.payment_status ||
                prev.total_amount !== parsed.total_amount
              ) {
                return parsed;
              }
              return prev;
            });
          } catch (e) {
            console.error('Failed to parse mock order during polling:', e);
          }
        }
      }, 1500);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D7EFEA] flex flex-col items-center justify-center font-sans p-6">
        <div className="bg-white p-8 rounded-[24px] shadow-sm flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#046A55] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Tracking Order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">Order not found</h2>
        <p className="text-xs text-gray-500 mt-2 max-w-xs">We couldn&apos;t load details for this order. Please scan the table QR code and try again.</p>
        <button
          onClick={() => router.push('/menu')}
          className="bg-[#046A55] text-white px-6 py-2.5 rounded-full font-bold text-xs mt-5 shadow-md shadow-[#046A55]/20"
        >
          Go Back to Menu
        </button>
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: 'Diterima', desc: 'Kitchen accepts order' },
    { key: 'preparing', label: 'Dibuat', desc: 'Chef preparing meals' },
    { key: 'ready', label: 'Siap Diantar', desc: 'Server bringing order' },
    { key: 'completed', label: 'Selesai', desc: 'Bon appétit!' },
  ];

  const getStepIndex = (status: string) => {
    if (status === 'pending') return 0;
    if (status === 'preparing') return 1;
    if (status === 'ready') return 2;
    if (status === 'completed') return 3;
    return -1;
  };

  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="min-h-screen bg-[#D7EFEA] flex flex-col font-sans max-w-md mx-auto relative shadow-2xl border-x border-gray-100 pb-10">
      
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.push('/menu')}
          className="w-10 h-10 bg-white hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-sm text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-extrabold text-gray-950 text-base leading-tight">Track Order</h1>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Table {order.table_number}</p>
        </div>
      </div>

      {/* Main Track Section */}
      <div className="px-6 flex-grow space-y-5">
        
        {/* Status card */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 bg-[#046A55]/5 rounded-2xl p-4">
            <div className="bg-[#046A55] text-white p-2.5 rounded-xl">
              <Coffee className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Status Pesanan</span>
              <h3 className="font-black text-gray-950 text-base leading-none mt-0.5">
                {order.status === 'pending' && 'Pesanan Diterima'}
                {order.status === 'preparing' && 'Sedang Dibuat'}
                {order.status === 'ready' && 'Siap Diantar!'}
                {order.status === 'completed' && 'Pesanan Selesai'}
                {order.status === 'cancelled' && 'Dibatalkan'}
              </h3>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          {order.status !== 'cancelled' ? (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {steps.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                
                return (
                  <div key={step.key} className="relative flex gap-4 items-start">
                    {/* Circle Node */}
                    <div className={`absolute -left-6.5 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                      isPassed
                        ? 'bg-[#046A55] border-[#046A55] text-white'
                        : isCurrent
                        ? 'bg-amber-500 border-amber-500 text-white animate-ping-once'
                        : 'bg-white border-gray-200'
                    }`}>
                      {(isPassed || order.status === 'completed') && (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      {isCurrent && order.status !== 'completed' && (
                        <Clock className="w-3 h-3 text-white" />
                      )}
                    </div>

                    <div className="flex-grow">
                      <h4 className={`text-xs font-extrabold transition-colors leading-tight ${
                        isCurrent ? 'text-gray-950 text-sm' : isPassed ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-gray-400 leading-normal mt-0.5">{step.desc}</p>
                    </div>

                    {isCurrent && order.status !== 'completed' && (
                      <span className="bg-amber-100 text-amber-800 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-red-50 text-red-700 text-xs font-bold p-4 rounded-xl text-center border border-red-100">
              Pesanan ini telah dibatalkan oleh Admin Noms Coffee. Silakan hubungi kasir/pelayan.
            </div>
          )}
        </div>

        {/* Order Details list */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-widest border-b border-gray-100 pb-3">
            Rincian Item
          </h3>
          
          <div className="divide-y divide-gray-50 max-h-[160px] overflow-y-auto pr-1 scrollbar-none space-y-2.5">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-3 pt-2.5 first:pt-0">
                <img
                  src={item.menu.image_url}
                  alt={item.menu.name}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
                  }}
                />
                <div className="flex-grow">
                  <h5 className="font-bold text-gray-900 text-xs leading-tight">{item.menu.name}</h5>
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    <span className="text-[9px] text-gray-400 font-semibold">Qty: {item.quantity}</span>
                    {item.spice_level > 0 && (
                      <span className="text-[9px] text-amber-600 font-bold">🔥 Lvl {item.spice_level}</span>
                    )}
                    {item.notes && (
                      <span className="text-[9px] text-gray-400 italic font-medium line-clamp-1 max-w-[120px]">
                        &quot;{item.notes}&quot;
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-bold text-gray-800 text-xs">{formatRupiah(Number(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <span className="font-bold text-gray-500 text-xs">Total Pembayaran</span>
            <span className="font-extrabold text-[#046A55] text-base">{formatRupiah(order.total_amount)}</span>
          </div>
        </div>

        {/* QRIS / Cash Payment Instructions widget */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-widest">Metode Pembayaran</h3>
            <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded">
              {order.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
            </span>
          </div>

          <div className="flex gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100 items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#046A55]" />
              <span className="font-bold text-xs text-gray-700">
                {order.payment_method === 'qris' ? 'QRIS Scan & Pay' : 'Pelayan (Bayar Cash)'}
              </span>
            </div>
            {order.payment_status === 'unpaid' && order.payment_method === 'qris' && (
              <button
                onClick={() => setShowQRIS(!showQRIS)}
                className="bg-[#046A55] hover:bg-[#035242] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                {showQRIS ? 'Hide QR' : 'Show QRIS'}
              </button>
            )}
          </div>

          {/* QRIS Image Mock Drawer */}
          {showQRIS && order.payment_status === 'unpaid' && (
            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50 animate-fade-in text-center space-y-3">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider">NOMS COFFEE OFFICIAL QRIS</span>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=qris-noms-coffee-mock"
                alt="QRIS Code"
                className="w-32 h-32 bg-white p-2 rounded-lg border border-gray-100 shadow-sm"
              />
              <p className="text-[9px] text-gray-500 leading-relaxed max-w-[200px]">
                Silakan scan kode QRIS di atas untuk melakukan transfer. Konfirmasikan bukti bayar ke pelayan saat mengantarkan pesanan.
              </p>
            </div>
          )}

          {order.payment_method === 'cash' && order.payment_status === 'unpaid' && (
            <p className="text-[10px] text-gray-400 italic text-center">
              * Silakan serahkan uang tunai sebesar <span className="font-bold text-gray-700">{formatRupiah(order.total_amount)}</span> ke pelayan saat pesanan diantarkan ke meja Anda.
            </p>
          )}
        </div>

      </div>
      
      {/* Decorative footer */}
      <div className="py-6 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#046A55]" />
        <span className="text-[9px] font-bold text-[#046A55]/70 tracking-widest uppercase">English Cafe Imersa</span>
      </div>

    </div>
  );
}
