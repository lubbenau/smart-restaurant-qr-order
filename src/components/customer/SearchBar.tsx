import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white text-gray-800 placeholder-gray-400 text-sm pl-12 pr-6 py-3.5 rounded-full border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#046A55]/20 focus:border-[#046A55] transition-all"
      />
    </div>
  );
};
