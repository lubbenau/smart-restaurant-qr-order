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

const rawSupabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const rawSupabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// Check if the URL starts with http:// or https:// to be a valid supabase URL
const isValidSupabaseUrl = rawSupabaseUrl.startsWith('http://') || rawSupabaseUrl.startsWith('https://');

export const isMockMode = !isValidSupabaseUrl || !rawSupabaseAnonKey;

if (isMockMode) {
  console.warn(
    'Supabase environment variables are missing or invalid! The application is running in MOCK mode with fully functional offline state simulation.'
  );
}

const finalSupabaseUrl = isValidSupabaseUrl 
  ? rawSupabaseUrl 
  : 'https://placeholder-project-id.supabase.co';

// Initialize Supabase Client
// We use a dummy URL/key if not provided or invalid to allow building without environment variables
export const supabase = createClient(
  finalSupabaseUrl,
  rawSupabaseAnonKey || 'placeholder-anon-key'
);

/**
 * Formats a numeric price into Indonesian Rupiah (Rp) presentation.
 * Supports both seed database values (e.g. 25.00 -> Rp 25.000)
 * and direct user-entered values (e.g. 25000 -> Rp 25.000).
 */
export function formatRupiah(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return 'Rp 0';
  
  // If price is small (e.g. < 1000 like 25.00), multiply by 1000.
  const amount = num < 1000 ? num * 1000 : num;
  
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  return `Rp ${formatted}`;
}

