import React from 'react';
import { LayoutDashboard, Clock, Coffee, QrCode, TrendingUp, LogOut } from 'lucide-react';

export type AdminTab = 'overview' | 'orders' | 'menus' | 'qr' | 'reports';

interface SidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'overview' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders' as AdminTab, label: 'Real-time Orders', icon: Clock, showBadge: true },
    { id: 'menus' as AdminTab, label: 'Menu Management', icon: Coffee },
    { id: 'qr' as AdminTab, label: 'QR Generator', icon: QrCode },
    { id: 'reports' as AdminTab, label: 'Sales Reports', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] text-gray-400 flex flex-col border-r border-[#1E293B] shrink-0 h-screen sticky top-0">
      
      {/* Sidebar Header Branding */}
      <div className="p-6 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="bg-[#10B981] text-gray-950 p-2 rounded-xl font-black text-xs shadow-md shadow-[#10B981]/25 tracking-widest animate-pulse">
            EC
          </div>
          <div>
            <h2 className="text-white font-extrabold text-sm tracking-tight leading-none">English Cafe</h2>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Admin Center</span>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-grow p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group focus:outline-none ${
                isActive
                  ? 'bg-[#10B981]/10 text-[#10B981] border-l-4 border-[#10B981]'
                  : 'hover:bg-[#1E293B] hover:text-white border-l-4 border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-[#10B981]' : 'text-gray-400 group-hover:text-white'}`} />
              <span className="flex-grow text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Admin Profile & Logout section */}
      <div className="p-4 border-t border-[#1E293B] space-y-3 bg-[#080B13]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#10B981] to-emerald-400 text-gray-950 font-extrabold flex items-center justify-center text-sm">
            AD
          </div>
          <div className="flex-grow min-w-0">
            <h4 className="text-white font-bold text-xs truncate leading-tight">Adam Bajaber</h4>
            <span className="text-[9px] text-[#10B981] font-semibold uppercase tracking-wider">Noms Head Chef</span>
          </div>
        </div>

        <button
          onClick={() => {
            // Visual feedback of logout
            if (confirm('Apakah Anda yakin ingin keluar dari Admin Center?')) {
              window.location.href = '/menu';
            }
          }}
          className="w-full flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-red-950/40 hover:text-red-400 border border-transparent hover:border-red-900/30 text-gray-400 py-2.5 rounded-xl text-xs font-bold transition-all"
        >
          <LogOut className="w-4 h-4" />
          Keluar Admin
        </button>
      </div>

    </aside>
  );
};
export default Sidebar;
