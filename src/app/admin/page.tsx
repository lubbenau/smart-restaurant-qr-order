'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar, AdminTab } from '@/components/admin/Sidebar';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { OrderFeed } from '@/components/admin/OrderFeed';
import { MenuManagement } from '@/components/admin/MenuManagement';
import { QRGenerator } from '@/components/admin/QRGenerator';
import { SalesReports } from '@/components/admin/SalesReports';
import { supabase, isMockMode, Menu, Order } from '@/lib/supabase';
import { AlertCircle, User, Bell } from 'lucide-react';

// Mock seed menus for Admin initialization fallback
const ADMIN_MOCK_MENUS: Menu[] = [
  {
    id: '1',
    name: 'Pear & Orange',
    price: 25.00,
    description: 'Freshly baked warm pear tarts topped with sliced sweet oranges and organic honey glaze.',
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600',
    category: 'Breakfast',
    is_available: true,
    estimated_time: '20 min',
    rating: 4.8,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Meat & Mashrooms',
    price: 37.00,
    description: 'Grilled premium beef sirloin medallions served with sautéed portobello mushrooms and microgreens on rustic sourdough toast.',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
    category: 'Breakfast',
    is_available: true,
    estimated_time: '30 min',
    rating: 5.0,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Egg & Bread',
    price: 25.00,
    description: 'Soft boiled free-range organic egg served on butter-toasted thick brioche bread with sliced avocado.',
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600',
    category: 'Breakfast',
    is_available: true,
    estimated_time: '10 min',
    rating: 4.7,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Sweet pancake',
    price: 13.00,
    description: 'Fluffy buttermilk pancakes topped with glazed nuts, rich maple syrup, and whipped vanilla mascarpone.',
    image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=600',
    category: 'Dessert',
    is_available: true,
    estimated_time: '10 min',
    rating: 4.9,
    created_at: new Date().toISOString(),
  }
];

// Mock seed orders for Admin initialization
const ADMIN_MOCK_ORDERS: Order[] = [
  {
    id: 'mock-order-111111',
    table_number: '03',
    status: 'completed',
    payment_method: 'qris',
    payment_status: 'paid',
    total_amount: 62.00,
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mock-order-222222',
    table_number: '05',
    status: 'preparing',
    payment_method: 'cash',
    payment_status: 'unpaid',
    total_amount: 37.00,
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-order-333333',
    table_number: '01',
    status: 'pending',
    payment_method: 'qris',
    payment_status: 'unpaid',
    total_amount: 25.00,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  }
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [menus, setMenus] = useState<Menu[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Track the initial set of order IDs loaded on mount to filter out old pending orders
  const initialOrderIdsRef = useRef<Set<string>>(new Set());
  
  // Track new orders that arrived in this active session for the popups
  const [newIncomingOrders, setNewIncomingOrders] = useState<any[]>([]);

  // State to track if browser audio has been unlocked via user interaction
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Auto-unlock audio on first click or touch anywhere on the page
  useEffect(() => {
    const unlockAudio = () => {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAD';
      audio.play().then(() => {
        setAudioUnlocked(true);
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      }).catch(() => {});
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('click', unlockAudio);
      window.addEventListener('touchstart', unlockAudio);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      }
    };
  }, []);

  // Sound & State Trigger for newly arrived orders
  const triggerNewOrderNotification = useCallback((order: any) => {
    // 1. Play real-time notification audio chime
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        // Fallback: Dual-tone synthesized alarm if browser blocks autoplay
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Soft chime E5
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
    } catch (err) {}

    // 2. Add to active session new order queue for popup toasts
    setNewIncomingOrders((prev) => {
      if (prev.some((o) => o.id === order.id)) return prev;
      return [order, ...prev];
    });
  }, []);

  // 1. Fetch initial states
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      if (isMockMode) {
        setMenus(ADMIN_MOCK_MENUS);
        
        // Load custom orders that might be added via the customer tab simulation
        const storedMockOrders: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('mock_order_')) {
            const raw = localStorage.getItem(key);
            if (raw) {
              try {
                storedMockOrders.push(JSON.parse(raw));
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
        
        // Merge starter mock orders and newly checked out user mock orders
        const combinedOrders = [...storedMockOrders, ...ADMIN_MOCK_ORDERS.map((o) => ({
          ...o,
          items: o.id === 'mock-order-111111'
            ? [
                { id: 'm1', quantity: 1, spice_level: 0, notes: 'Susu dipisah', price: 25.00, menus: { name: 'Pear & Orange' } },
                { id: 'm2', quantity: 1, spice_level: 2, notes: '', price: 37.00, menus: { name: 'Meat & Mushrooms' } }
              ]
            : o.id === 'mock-order-222222'
            ? [{ id: 'm3', quantity: 1, spice_level: 3, notes: 'Pedas mantap', price: 37.00, menus: { name: 'Meat & Mushrooms' } }]
            : [{ id: 'm4', quantity: 1, spice_level: 0, notes: '', price: 25.00, menus: { name: 'Egg & Bread' } }]
        }))];

        setOrders(combinedOrders);
        combinedOrders.forEach((o) => initialOrderIdsRef.current.add(o.id));
        setLoading(false);
      } else {
        try {
          // Fetch menus
          const { data: menuData } = await supabase
            .from('menus')
            .select('*')
            .order('name', { ascending: true });
          
          setMenus(menuData || []);

          // Fetch orders
          const { data: orderData } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          // Load items for each order
          if (orderData) {
            const enrichedOrders = await Promise.all(
              orderData.map(async (order) => {
                const { data: items } = await supabase
                  .from('order_items')
                  .select('id, quantity, spice_level, notes, price, menus(name)')
                  .eq('order_id', order.id);
                
                return {
                  ...order,
                  items: items || [],
                };
              })
            );
            setOrders(enrichedOrders);
            enrichedOrders.forEach((o) => initialOrderIdsRef.current.add(o.id));
          }
        } catch (err) {
          console.error('Error fetching admin dashboard data:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
  }, []);

  // 2. Real-time Subscription Setup & Robust Polling Fallback for Incoming Customer Orders
  useEffect(() => {
    let channel: any = null;
    let pollInterval: any = null;

    if (isMockMode) {
      // Mock Periodical Poller to pull user checkout orders from localStorage
      pollInterval = setInterval(() => {
        const storedMockOrders: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('mock_order_')) {
            const raw = localStorage.getItem(key);
            if (raw) {
              try {
                storedMockOrders.push(JSON.parse(raw));
              } catch (e) {
                console.error(e);
              }
            }
          }
        }

        setOrders((prev) => {
          // Add any new localStorage orders not already in local state and not part of initial loaded list
          const newOrders = storedMockOrders.filter(
            (s) => !initialOrderIdsRef.current.has(s.id) && !prev.some((p) => p.id === s.id)
          );
          
          if (newOrders.length > 0) {
            newOrders.forEach((o) => {
              triggerNewOrderNotification(o);
            });
            return [...newOrders, ...prev];
          }
          return prev;
        });
      }, 2000);
    } else {
      // A. Real-time Subscription via Supabase postgres_changes
      channel = supabase
        .channel('admin-orders-monitor')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'orders' },
          async (payload) => {
            const newOrder = payload.new as Order;
            if (initialOrderIdsRef.current.has(newOrder.id)) return;

            // Fetch order items
            const { data: items } = await supabase
              .from('order_items')
              .select('id, quantity, spice_level, notes, price, menus(name)')
              .eq('order_id', newOrder.id);

            const enriched = {
              ...newOrder,
              items: items || [],
            };

            // Trigger notification popup and chime audio
            triggerNewOrderNotification(enriched);

            setOrders((prev) => {
              if (prev.some((o) => o.id === enriched.id)) return prev;
              return [enriched, ...prev];
            });
          }
        )
        .subscribe();

      // B. Robust Polling Fallback (Every 4 seconds)
      // Guarantees admin receives all orders even if Supabase replication/real-time is disabled/fails
      pollInterval = setInterval(async () => {
        try {
          const { data: latestOrders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && latestOrders) {
            setOrders((prev) => {
              const newOrdersToNotify: any[] = [];
              const updatedOrdersList = [...prev];

              for (const lo of latestOrders) {
                const existingIndex = prev.findIndex((p) => p.id === lo.id);
                if (existingIndex === -1) {
                  // New order detected!
                  if (!initialOrderIdsRef.current.has(lo.id)) {
                    newOrdersToNotify.push(lo);
                  }
                  updatedOrdersList.push(lo);
                } else {
                  // Sync status/payment changes made from other sessions
                  if (
                    prev[existingIndex].status !== lo.status ||
                    prev[existingIndex].payment_status !== lo.payment_status
                  ) {
                    updatedOrdersList[existingIndex] = {
                      ...updatedOrdersList[existingIndex],
                      ...lo
                    };
                  }
                }
              }

              // Enrich and notify new orders asynchronously
              if (newOrdersToNotify.length > 0) {
                newOrdersToNotify.forEach(async (no) => {
                  const { data: items } = await supabase
                    .from('order_items')
                    .select('id, quantity, spice_level, notes, price, menus(name)')
                    .eq('order_id', no.id);

                  const enriched = {
                    ...no,
                    items: items || [],
                  };
                  triggerNewOrderNotification(enriched);
                });
              }

              // Sort by created_at descending
              return updatedOrdersList.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            });
          }
        } catch (err) {
          console.error('Failed to poll latest orders:', err);
        }
      }, 4000);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [triggerNewOrderNotification]);

  const activeOrdersCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex font-sans relative">
      
      {/* 1. Left Vertical Admin Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* Main Desktop Header */}
        <header className="h-20 border-b border-[#1E293B] px-8 flex items-center justify-between shrink-0 bg-[#0F172A]/30 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black tracking-tight text-white capitalize leading-none">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'orders' && 'Real-time Order Feed'}
              {activeTab === 'menus' && 'Menu & Stock Manager'}
              {activeTab === 'qr' && 'Auto QR Sticker Engine'}
              {activeTab === 'reports' && 'Business Intelligence Laporan'}
            </h1>

            {newIncomingOrders.length > 0 && activeTab !== 'orders' && (
              <span className="bg-amber-500 text-gray-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                <Bell className="w-3.5 h-3.5 fill-gray-950 animate-bounce" />
                {newIncomingOrders.length} Baru Masuk
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!audioUnlocked && (
              <button
                onClick={() => {
                  const audio = new Audio('/notification.mp3');
                  audio.play().then(() => {
                    setAudioUnlocked(true);
                  }).catch(() => {
                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    osc.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.1);
                    setAudioUnlocked(true);
                  });
                }}
                className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse cursor-pointer"
              >
                <Bell className="w-4 h-4 shrink-0 animate-bounce" />
                Aktifkan Suara Notifikasi
              </button>
            )}

            {isMockMode && (
              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Offline Simulator Mode
              </span>
            )}

            <div className="flex items-center gap-3 pl-4 border-l border-[#1E293B]">
              <div className="text-right">
                <span className="text-xs text-gray-300 font-bold block">Adam Bajaber</span>
                <span className="text-[10px] text-gray-500 font-semibold block uppercase">Noms Coffee Head</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-[#10B981] text-gray-950 font-black flex items-center justify-center shadow-md shadow-[#10B981]/15 cursor-pointer">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Panels Content Router */}
        <div className="flex-grow p-8 overflow-y-auto">
          {loading ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Loading cafe credentials...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <DashboardOverview orders={orders} />}
              {activeTab === 'orders' && (
                <OrderFeed
                  orders={orders}
                  setOrders={setOrders}
                  selectedOrder={selectedOrder}
                  setSelectedOrder={setSelectedOrder}
                />
              )}
              {activeTab === 'menus' && <MenuManagement menus={menus} setMenus={setMenus} />}
              {activeTab === 'qr' && <QRGenerator />}
              {activeTab === 'reports' && <SalesReports orders={orders} />}
            </>
          )}
        </div>

      </main>

      {/* Floating Glassmorphic Toast Notification for New Orders */}
      {newIncomingOrders.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#1E293B]/90 backdrop-blur-lg border border-[#10B981]/30 rounded-2xl p-4 shadow-2xl shadow-[#10B981]/10 text-white animate-fade-in-up">
          <div className="flex items-start gap-3">
            <div className="bg-[#10B981]/15 text-[#10B981] p-2.5 rounded-xl shrink-0 animate-pulse">
              <Bell className="w-5 h-5" />
            </div>
            
            <div className="flex-grow space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#10B981] font-black uppercase tracking-wider">Pesanan Baru Masuk!</span>
                <span className="text-[10px] text-gray-400 font-mono font-bold">Meja {newIncomingOrders[0].table_number}</span>
              </div>
              <h4 className="font-black text-xs text-white uppercase mt-0.5">
                Invoice: <span className="font-mono text-emerald-400">{newIncomingOrders[0].id.slice(0, 8)}...</span>
              </h4>
              <p className="text-[11px] text-gray-300 leading-normal line-clamp-2">
                {newIncomingOrders[0].items?.map((item: any) => `${item.quantity}x ${item.menus?.name || item.menu?.name || 'Item'}`).join(', ') || 'Memuat detail menu...'}
              </p>
              
              <div className="flex items-center gap-2 pt-3">
                <button
                  onClick={() => {
                    setSelectedOrder(newIncomingOrders[0]);
                    setActiveTab('orders');
                    setNewIncomingOrders((prev) => prev.slice(1));
                  }}
                  className="flex-grow bg-[#10B981] hover:bg-[#10B981]/95 text-gray-950 font-black text-[10px] uppercase py-2 px-3 rounded-lg transition-all text-center"
                >
                  Lihat Pesanan
                </button>
                <button
                  onClick={() => {
                    setNewIncomingOrders((prev) => prev.slice(1));
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-[10px] uppercase py-2 px-3 rounded-lg transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
