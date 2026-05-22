import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Power, Eye, EyeOff, X, Image as ImageIcon } from 'lucide-react';
import { supabase, isMockMode, Menu } from '@/lib/supabase';

interface MenuManagementProps {
  menus: Menu[];
  setMenus: React.Dispatch<React.SetStateAction<Menu[]>>;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({ menus, setMenus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Menu | null>(null);

  // Form Fields state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'Breakfast' | 'Lunch' | 'Treats' | 'Dessert' | 'Drinks'>('Breakfast');
  const [description, setDescription] = useState('');
  const [image_url, setImageUrl] = useState('');
  const [estimated_time, setEstimatedTime] = useState('15 min');
  const [rating, setRating] = useState('4.5');

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setPrice('');
    setCategory('Breakfast');
    setDescription('');
    setImageUrl('');
    setEstimatedTime('15 min');
    setRating('4.5');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Menu) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category);
    setDescription(item.description || '');
    setImageUrl(item.image_url || '');
    setEstimatedTime(item.estimated_time);
    setRating(item.rating.toString());
    setIsModalOpen(true);
  };

  // 1. Toggle item availability switch (is_available)
  const handleToggleAvailable = async (item: Menu) => {
    const nextVal = !item.is_available;
    try {
      if (isMockMode) {
        setMenus((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, is_available: nextVal } : m))
        );
      } else {
        const { error } = await supabase
          .from('menus')
          .update({ is_available: nextVal })
          .eq('id', item.id);

        if (error) throw error;

        setMenus((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, is_available: nextVal } : m))
        );
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  // 2. Submit Add / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const parsedPrice = Number(price);
    const parsedRating = Number(rating) || 4.5;

    const payload = {
      name,
      price: parsedPrice,
      category,
      description: description || null,
      image_url: image_url || null,
      estimated_time,
      rating: parsedRating,
      is_available: editingItem ? editingItem.is_available : true,
    };

    try {
      if (isMockMode) {
        if (editingItem) {
          // Edit operation
          setMenus((prev) =>
            prev.map((m) => (m.id === editingItem.id ? { ...m, ...payload } : m))
          );
        } else {
          // Add operation
          const newItem: Menu = {
            id: `mock-menu-${Math.floor(1000 + Math.random() * 9000)}`,
            ...payload,
            created_at: new Date().toISOString(),
          };
          setMenus((prev) => [...prev, newItem]);
        }
      } else {
        if (editingItem) {
          const { error } = await supabase
            .from('menus')
            .update(payload)
            .eq('id', editingItem.id);

          if (error) throw error;

          setMenus((prev) =>
            prev.map((m) => (m.id === editingItem.id ? { ...m, ...payload } : m))
          );
        } else {
          const { data, error } = await supabase
            .from('menus')
            .insert(payload)
            .select()
            .single();

          if (error) throw error;
          setMenus((prev) => [...prev, data]);
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Form submission failed:', err);
    }
  };

  // 3. Delete Item Action
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini dari daftar?')) return;

    try {
      if (isMockMode) {
        setMenus((prev) => prev.filter((m) => m.id !== itemId));
      } else {
        const { error } = await supabase.from('menus').delete().eq('id', itemId);
        if (error) throw error;
        setMenus((prev) => prev.filter((m) => m.id !== itemId));
      }
    } catch (err) {
      console.error('Failed to delete menu item:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">Kitchen Menu & Stocks</h3>
          <p className="text-[10px] text-gray-500 font-medium">Create menu entries, update prices, and control real-time customer stocks.</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-[#10B981] hover:bg-emerald-500 text-gray-900 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#10B981]/15 focus:outline-none cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Tambah Menu Baru
        </button>
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {menus.map((item) => (
          <div
            key={item.id}
            className={`bg-[#111827] border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
              item.is_available ? 'border-[#1E293B]' : 'border-red-900/30 opacity-70'
            }`}
          >
            {/* Image banner with overlay info */}
            <div className="relative aspect-[4/3] w-full bg-gray-900 overflow-hidden">
              <img
                src={item.image_url || ''}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
                }}
              />
              <span className="absolute top-3 left-3 bg-[#0B0F19]/80 backdrop-blur-md text-gray-300 text-[9px] font-bold px-2 py-0.5 rounded border border-[#1E293B] uppercase tracking-wider">
                {item.category}
              </span>
              
              {!item.is_available && (
                <div className="absolute inset-0 bg-red-950/45 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="bg-red-500 text-white font-extrabold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                    STOCK KOSONG
                  </span>
                </div>
              )}
            </div>

            {/* Core Details content */}
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-white font-extrabold text-sm leading-tight line-clamp-1">{item.name}</h4>
                  <span className="text-[#10B981] font-bold text-sm shrink-0">${Number(item.price).toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal line-clamp-2">{item.description || 'No description supplied.'}</p>
              </div>

              {/* Action grid button triggers */}
              <div className="flex items-center gap-2 border-t border-[#1E293B] pt-3 mt-4">
                {/* Available Stock Toggle Switch */}
                <button
                  onClick={() => handleToggleAvailable(item)}
                  className={`flex-grow flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold transition-all focus:outline-none ${
                    item.is_available
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10B981] border border-emerald-500/15'
                      : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {item.is_available ? 'Set Kosong' : 'Set Ready'}
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEditModal(item)}
                  className="bg-[#1E293B] hover:bg-[#2A3B54] text-gray-300 p-2 rounded-xl border border-transparent hover:border-[#2A3B54] transition-colors focus:outline-none"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="bg-red-950/20 hover:bg-red-900/30 text-red-400 p-2 rounded-xl border border-[#red-900/10] hover:border-red-900/30 transition-colors focus:outline-none"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CRUD Add/Edit Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-[#1E293B] flex items-center justify-between">
              <div>
                <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">
                  {editingItem ? 'Edit Menu Item' : 'Tambah Menu Baru'}
                </h3>
                <p className="text-[10px] text-gray-500">Configure parameters for customer ordering dashboard.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full bg-[#1E293B] hover:bg-[#2A3B54] text-gray-400 hover:text-white transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4 flex-grow scrollbar-none text-xs">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="text-gray-400 font-bold uppercase tracking-wider block">Menu Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Avocado Toast"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0B0F19] text-white placeholder-gray-600 rounded-xl border border-[#1E293B] p-3 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase tracking-wider block">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#0B0F19] text-white placeholder-gray-600 rounded-xl border border-[#1E293B] p-3 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase tracking-wider block">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#0B0F19] text-white rounded-xl border border-[#1E293B] p-3 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Treats">Treats</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Estimated Time */}
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase tracking-wider block">Est. Prepare Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 min"
                    value={estimated_time}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className="w-full bg-[#0B0F19] text-white placeholder-gray-600 rounded-xl border border-[#1E293B] p-3 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all"
                  />
                </div>

                {/* Rating */}
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold uppercase tracking-wider block">Rating Score (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="4.8"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full bg-[#0B0F19] text-white placeholder-gray-600 rounded-xl border border-[#1E293B] p-3 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-gray-400 font-bold uppercase tracking-wider block">Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={image_url}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#0B0F19] text-white placeholder-gray-600 rounded-xl border border-[#1E293B] p-3 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-gray-400 font-bold uppercase tracking-wider block">Description</label>
                <textarea
                  rows={3}
                  placeholder="Write a brief composition of ingredients..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0B0F19] text-white placeholder-gray-600 rounded-xl border border-[#1E293B] p-3 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all resize-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-[#1E293B] flex items-center justify-end gap-3 bg-[#111827]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-[#1E293B] hover:bg-[#2A3B54] text-gray-300 px-5 py-2.5 rounded-xl font-bold transition-all focus:outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#10B981] hover:bg-emerald-500 text-gray-950 px-6 py-2.5 rounded-xl font-black transition-all shadow-md shadow-[#10B981]/15 focus:outline-none"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Publish Menu'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default MenuManagement;
