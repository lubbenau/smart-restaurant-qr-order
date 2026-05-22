import React from 'react';
import { Clock, Star, Plus } from 'lucide-react';
import { Menu, formatRupiah } from '@/lib/supabase';

interface MenuCardProps {
  item: Menu;
  onSelect: (item: Menu) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onSelect }) => {
  const { name, price, image_url, estimated_time, rating, is_available } = item;

  return (
    <div
      onClick={() => is_available && onSelect(item)}
      className={`bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full relative group cursor-pointer border border-gray-50 ${
        !is_available ? 'select-none' : 'hover:-translate-y-1'
      }`}
    >
      {/* Stock Blur Overlay */}
      {!is_available && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-red-500/90 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full shadow-sm">
            Stok Habis
          </div>
        </div>
      )}

      {/* Food Image */}
      <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
        {image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-[#1E293B] text-sm md:text-base line-clamp-1 mb-1 group-hover:text-[#046A55] transition-colors">
          {name}
        </h3>

        {/* Time and Rating Info */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3 mt-auto">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#046A55]" />
            <span>{estimated_time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-gray-700">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Price and Add Button */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <span className="font-extrabold text-[#1E293B] text-sm md:text-base">
            {formatRupiah(price)}
          </span>

          {is_available && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item);
              }}
              className="bg-[#046A55] hover:bg-[#035242] text-white p-2 rounded-full shadow-sm shadow-[#046A55]/20 hover:scale-110 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default MenuCard;
