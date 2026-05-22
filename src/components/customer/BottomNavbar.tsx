import React from 'react';
import { Coffee, Heart, ReceiptText, User } from 'lucide-react';

export type CustomerTab = 'menu' | 'favorites' | 'orders' | 'profile';

interface BottomNavbarProps {
  activeTab: CustomerTab;
  setActiveTab: (tab: CustomerTab) => void;
  orderCount: number; // Shows a badge on the orders tab if they have active orders
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  activeTab,
  setActiveTab,
  orderCount,
}) => {
  const tabs = [
    { id: 'menu' as CustomerTab, label: 'Menu', icon: Coffee },
    { id: 'favorites' as CustomerTab, label: 'Favorites', icon: Heart },
    { id: 'orders' as CustomerTab, label: 'Orders', icon: ReceiptText, badge: orderCount > 0 ? orderCount : undefined },
    { id: 'profile' as CustomerTab, label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100 py-3 px-6 z-40 flex items-center justify-between transition-all duration-300">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full transition-all duration-300 relative focus:outline-none ${
              isActive
                ? 'bg-[#046A55]/10 text-[#046A55] font-semibold scale-105'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              {tab.badge !== undefined && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-sm">
                  {tab.badge}
                </span>
              )}
            </div>
            
            {isActive && (
              <span className="text-xs transition-opacity duration-300 whitespace-nowrap">
                {tab.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
export default BottomNavbar;
