import { createClient } from '@supabase/supabase-js';

// Define fully Type-Safe interfaces for our tables
export interface Menu {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  category: 'Breakfast' | 'Lunch' | 'Treats' | 'Dessert' | 'Drinks';
  is_available: boolean;
  estimated_time: string;
  rating: number;
  created_at: string;
}

export interface Order {
  id: string;
  table_number: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  payment_method: 'cash' | 'qris';
  payment_status: 'unpaid' | 'paid';
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_id: string;
  quantity: number;
  spice_level: number;
  notes: string | null;
  price: number;
  created_at: string;
  menus?: Menu; // Nested relation from join query
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// A mock flag to help components know if we're running with local mock fallbacks
export const isMockMode = !supabaseUrl || !supabaseAnonKey;

if (isMockMode) {
  console.warn(
    'Supabase environment variables are missing! The application is running in MOCK mode with fully functional offline state simulation.'
  );
}

// Initialize Supabase Client
// We use a dummy URL/key if not provided to allow building without environment variables
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project-id.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
