'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShoppingBasket, Heart, ReceiptText, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase, isMockMode, Menu } from '@/lib/supabase';
import { SearchBar } from '@/components/customer/SearchBar';
import { CategoryList } from '@/components/customer/CategoryList';
import { MenuCard } from '@/components/customer/MenuCard';
import { BottomNavbar, CustomerTab } from '@/components/customer/BottomNavbar';
import { CustomizeModal } from '@/components/customer/CustomizeModal';
import { CartDrawer } from '@/components/customer/CartDrawer';

// Mock menus matching the exact visual references
const MOCK_ITEMS: Menu[] = [
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
  },
  {
    id: '5',
    name: 'Iced Matcha Latte',
    price: 18.00,
    description: 'Ceremonial grade Japanese Matcha whisked with cold oat milk over pure ice crystals.',
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600',
    category: 'Drinks',
    is_available: true,
    estimated_time: '5 min',
    rating: 4.8,
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Creamy Cappuccino',
    price: 16.00,
    description: 'Silky espresso macchiato with fine milk foam dust and cinnamon powder toppings.',
    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=600',
    category: 'Drinks',
    is_available: true,
    estimated_time: '5 min',
    rating: 4.6,
    created_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Caramel Croissant',
    price: 14.00,
    description: 'Flaky baked pastry covered with salted warm butter caramel fillings.',
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600',
    category: 'Treats',
    is_available: true,
    estimated_time: '8 min',
    rating: 4.5,
    created_at: new Date().toISOString(),
  }
];

export const CustomerMenuContent: React.FC = () => {
  const searchParams = useSearchParams();
  const { tableNumber, setTableNumber, cartItemCount, setCartOpen } = useCart();
  
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<CustomerTab>('menu');

  // Customize item state
  const [selectedItem, setSelectedItem] = useState<Menu | null>(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState<boolean>(false);

  // Parse Table Parameter
  useEffect(() => {
    const meja = searchParams.get('meja');
    if (meja) {
      setTableNumber(meja);
    }
  }, [searchParams, setTableNumber]);

  // Fetch menus & setup real-time listener
  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true);
      if (isMockMode) {
        setMenus(MOCK_ITEMS);
        setLoading(false);
      } else {
        try {
          const { data, error } = await supabase
            .from('menus')
            .select('*')
            .order('name', { ascending: true });

          if (error) throw error;
          setMenus(data || []);
        } catch (err) {
          console.error('Error fetching menus:', err);
          // Graceful fallback to mock data on DB error
          setMenus(MOCK_ITEMS);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMenus();

    // Supabase Real-time Stock Sync Subscription
    if (!isMockMode) {
      const channel = supabase
        .channel('menus-realtime-customer')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'menus' },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              setMenus((prev) =>
                prev.map((item) =>
                  item.id === payload.new.id ? { ...item, ...payload.new } : item
                )
              );
            } else if (payload.eventType === 'INSERT') {
              setMenus((prev) => [...prev, payload.new as Menu]);
            } else if (payload.eventType === 'DELETE') {
              setMenus((prev) => prev.filter((item) => item.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Mock simulation: Toggle availability of "Pear & Orange" after 15s to demonstrate the live sync feature!
      const timer = setTimeout(() => {
        setMenus((prev) =>
          prev.map((item) =>
            item.name === 'Pear & Orange'
              ? { ...item, is_available: false }
              : item
          )
        );
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, []);

  const { addToCart } = useCart();

  const handleSelectItem = (item: Menu) => {
    setSelectedItem(item);
    setIsCustomizeOpen(true);
  };

  const handleAddCustomized = (item: Menu, quantity: number, spiceLevel: number, notes: string) => {
    addToCart(item, quantity, spiceLevel, notes);
  };

  // Categories list extraction
  const categories = ['All', 'Breakfast', 'Lunch', 'Treats', 'Dessert', 'Drinks'];

  // Filter logic
  const filteredMenus = menus.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans max-w-md mx-auto relative overflow-x-hidden shadow-2xl border-x border-gray-100 pb-32">
      
      {isMockMode && (
        <div className="bg-amber-550 bg-amber-500 text-gray-950 px-5 py-2.5 text-xs font-black text-center border-b border-amber-600 animate-pulse flex flex-col gap-0.5 z-50">
          <span>⚠️ OFFLINE SIMULATOR MODE AKTIF</span>
          <span className="font-semibold text-[10px] opacity-90 leading-tight">
            Pesanan disimpan lokal di HP Anda. Agar Laptop Admin menerima suara notifikasi & pesanan, Anda harus menambahkan Supabase Environment Variables di Vercel.
          </span>
        </div>
      )}
      
      {/* 1. White Top Header (as shown in reference image) */}
      <div className="bg-white px-6 pt-8 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Menu</h1>
            {tableNumber && (
              <span className="inline-block bg-[#046A55]/10 text-[#046A55] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                Meja {tableNumber}
              </span>
            )}
          </div>
          
          <button
            onClick={() => setCartOpen(true)}
            className="w-11 h-11 bg-[#046A55] text-white rounded-xl flex items-center justify-center shadow-md shadow-[#046A55]/20 hover:scale-105 active:scale-95 transition-all relative"
          >
            <ShoppingBasket className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* 2. White Capsule Search Bar */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* 3. Green Pastel Content Body (from reference image) */}
      <div className="bg-[#D7EFEA] rounded-t-[32px] px-6 pt-6 pb-2 flex-grow space-y-5 shadow-inner">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-[#1E293B] text-lg">Categories</h2>
          <span className="text-xs font-semibold text-[#046A55]/70">Noms Coffee Cabang</span>
        </div>

        {/* 4. Horizontal Scrolling Category Pill Indicators */}
        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 5. Food Menu Items - Dual Grid System */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-4 border-[#046A55] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#046A55] font-semibold uppercase tracking-wider">Preparing Kitchen...</p>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-bold text-gray-500">No items matches filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-[#046A55] font-bold text-xs underline mt-2 block mx-auto"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredMenus.map((item) => (
              <MenuCard key={item.id} item={item} onSelect={handleSelectItem} />
            ))}
          </div>
        )}
      </div>

      {/* Item Customizer Overlay Modal */}
      <CustomizeModal
        item={selectedItem}
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        onAdd={handleAddCustomized}
      />

      {/* Advanced Sliding Basket Drawer */}
      <CartDrawer />

      {/* 6. Floating White Capsule Navigation Bottom Bar */}
      <BottomNavbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'orders') {
            setCartOpen(true);
            setActiveTab('menu'); // reset visually
          }
        }}
        orderCount={cartItemCount}
      />

    </div>
  );
};
export default CustomerMenuContent;
