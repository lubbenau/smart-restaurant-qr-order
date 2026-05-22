import React, { useState, useEffect } from 'react';
import { X, Flame, Minus, Plus } from 'lucide-react';
import { Menu, formatRupiah } from '@/lib/supabase';

interface CustomizeModalProps {
  item: Menu | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Menu, quantity: number, spiceLevel: number, notes: string) => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  item,
  isOpen,
  onClose,
  onAdd,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [spiceLevel, setSpiceLevel] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSpiceLevel(0);
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const spiceLabels = [
    'Tidak Pedas (Level 0)',
    'Pedas Sedikit (Level 1)',
    'Pedas Sedang (Level 2)',
    'Pedas Mantap (Level 3)',
    'Pedas Gila (Level 4)',
    'Pedas Mampus! (Level 5)',
  ];

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const subtotal = Number(item.price) * quantity;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Background click handler */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Content card */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[24px] sm:rounded-[24px] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] sm:max-h-[90vh] transition-transform duration-300 transform translate-y-0">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-950 text-lg leading-tight">Customize</h2>
            <p className="text-xs text-gray-500 line-clamp-1">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow scrollbar-none">
          {/* Item details */}
          <div className="flex gap-4">
            <img
              src={item.image_url || ''}
              alt={item.name}
              className="w-20 h-20 rounded-xl object-cover bg-gray-50 border border-gray-100"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
              }}
            />
            <div className="flex flex-col justify-center">
              <span className="bg-[#046A55]/10 text-[#046A55] font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md self-start mb-1">
                {item.category}
              </span>
              <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
              <p className="text-sm font-extrabold text-[#046A55] mt-1">{formatRupiah(item.price)}</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Spice Level Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <Flame className={`w-4 h-4 transition-colors duration-300 ${spiceLevel > 0 ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                Spice Level
              </label>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                spiceLevel === 0 ? 'bg-gray-100 text-gray-600' :
                spiceLevel <= 2 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700 animate-pulse'
              }`}>
                {spiceLabels[spiceLevel]}
              </span>
            </div>

            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSpiceLevel(level)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-bold transition-all ${
                    spiceLevel === level
                      ? level === 0
                        ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                        : level <= 2
                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/25'
                        : 'bg-red-600 border-red-600 text-white shadow-sm shadow-red-600/25 scale-105'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Cooking Instructions / Notes */}
          <div className="space-y-2">
            <label className="font-bold text-gray-900 text-sm block">Special Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. No ice, Separate sauce, Extra sugar, Less spicy..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 rounded-xl border border-gray-200 p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#046A55]/20 focus:border-[#046A55] transition-all resize-none"
            />
          </div>
          
          {/* Quantity Selector */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
            <span className="font-bold text-gray-800 text-sm">Quantity</span>
            <div className="flex items-center gap-4 bg-white rounded-full p-1.5 border border-gray-200">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors focus:outline-none"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-gray-900 text-base min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors focus:outline-none"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-gray-100 bg-white flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Subtotal</span>
            <span className="font-black text-gray-900 text-xl">{formatRupiah(subtotal)}</span>
          </div>
          
          <button
            onClick={() => {
              onAdd(item, quantity, spiceLevel, notes);
              onClose();
            }}
            className="flex-1 bg-[#046A55] hover:bg-[#035242] text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-[#046A55]/20 active:scale-[0.98] transition-all text-center"
          >
            Add to Cart
          </button>
        </div>

      </div>
    </div>
  );
};
export default CustomizeModal;
