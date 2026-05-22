-- Smart Restaurant QR Order - Supabase Schema Initialization
-- Paste this script directly in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. DROP EXISTING TABLES IF THEY EXIST (FOR RESET/CLEANUP)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.menus CASCADE;

-- 2. CREATE MENUS TABLE
CREATE TABLE public.menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT NOT NULL, -- 'Breakfast', 'Lunch', 'Treats', 'Dessert', 'Drinks'
    is_available BOOLEAN DEFAULT true,
    estimated_time TEXT DEFAULT '15 min',
    rating NUMERIC(2, 1) DEFAULT 4.5,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CREATE ORDERS TABLE
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'completed', 'cancelled'
    payment_method TEXT NOT NULL, -- 'cash', 'qris'
    payment_status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'paid'
    total_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CREATE ORDER ITEMS TABLE
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_id UUID REFERENCES public.menus(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    spice_level INTEGER DEFAULT 0 CHECK (spice_level >= 0 AND spice_level <= 5),
    notes TEXT,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ENABLE REALTIME FOR ALL TABLES IN SUPABASE
-- Note: You can also enable this in the Supabase UI under: Database -> Replication
alter publication supabase_realtime add table public.menus;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;

-- 6. SEED STARTER MENU ITEMS
INSERT INTO public.menus (name, price, description, image_url, category, is_available, estimated_time, rating) VALUES
('Pear & Orange', 25.00, 'Freshly baked warm pear tarts topped with sliced sweet oranges and organic honey glaze.', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600', 'Breakfast', true, '20 min', 4.8),
('Meat & Mashrooms', 37.00, 'Grilled premium beef sirloin medallions served with sautéed portobello mushrooms and microgreens on rustic sourdough toast.', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600', 'Breakfast', true, '30 min', 5.0),
('Egg & Bread', 25.00, 'Soft boiled free-range organic egg served on butter-toasted thick brioche bread with sliced avocado.', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600', 'Breakfast', true, '10 min', 4.7),
('Sweet pancake', 13.00, 'Fluffy buttermilk pancakes topped with glazed nuts, rich maple syrup, and whipped vanilla mascarpone.', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=600', 'Dessert', true, '10 min', 4.9),
('Iced Matcha Latte', 18.00, 'Ceremonial grade Japanese Uji matcha whisked with oat milk and served iced with a touch of vanilla syrup.', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600', 'Drinks', true, '5 min', 4.8),
('Creamy Cappuccino', 16.00, 'Double shot espresso pulled from our premium house blend with steamed silky milk and dark cocoa dusting.', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=600', 'Drinks', true, '5 min', 4.6),
('Caramel Croissant', 14.00, 'Flaky, multi-layered French butter croissant drizzled with decadent homemade salted caramel sauce.', 'file:///C:/Users/Adam%20Bajaber/.gemini/antigravity/brain/9a926ab1-ebdf-4c7f-9aa6-0e4d2db54324/treats_mock.png', 'Treats', true, '8 min', 4.5);
-- Note: Replace with custom images or Unsplash URLs as preferred!
