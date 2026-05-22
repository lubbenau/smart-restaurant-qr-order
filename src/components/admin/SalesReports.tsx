import React, { useState } from 'react';
import { TrendingUp, Award, DollarSign, Calendar, BarChart2, ShoppingCart } from 'lucide-react';
import { Order } from '@/lib/supabase';

interface SalesReportsProps {
  orders: Order[];
}

export const SalesReports: React.FC<SalesReportsProps> = ({ orders }) => {
  const [period, setPeriod] = useState<'harian' | 'mingguan' | 'bulanan'>('harian');

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const grossSales = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalOrders = completedOrders.length;
  
  // Average Order Value (AOV)
  const aov = totalOrders > 0 ? grossSales / totalOrders : 0;

  // Periods modifiers multiplier (mock representation of time spans)
  const multiplier = period === 'harian' ? 1 : period === 'mingguan' ? 6.8 : 28.5;

  const activeGross = grossSales * multiplier;
  const activeOrdersCount = Math.round(totalOrders * multiplier);
  const activeAov = aov;

  // Category sales share
  const categoriesShare = [
    { label: 'Breakfast', count: Math.round(34 * multiplier), percentage: '45%', val: `$${(activeGross * 0.45).toFixed(2)}`, color: 'bg-emerald-500' },
    { label: 'Drinks', count: Math.round(28 * multiplier), percentage: '30%', val: `$${(activeGross * 0.30).toFixed(2)}`, color: 'bg-blue-500' },
    { label: 'Dessert', count: Math.round(15 * multiplier), percentage: '15%', val: `$${(activeGross * 0.15).toFixed(2)}`, color: 'bg-amber-500' },
    { label: 'Treats', count: Math.round(10 * multiplier), percentage: '10%', val: `$${(activeGross * 0.10).toFixed(2)}`, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">Business Intelligence Reports</h3>
          <p className="text-[10px] text-gray-500 font-medium">Reconcile revenue ledgers and analyze consumer favorites.</p>
        </div>

        <div className="flex bg-[#0B0F19] p-1 rounded-xl border border-[#1E293B]">
          {(['harian', 'mingguan', 'bulanan'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all focus:outline-none ${
                period === p
                  ? 'bg-[#10B981] text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Gross Sales */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-gray-400 font-bold text-xs uppercase tracking-wider block">Estimated Gross Sales</span>
            <h3 className="text-white text-3xl font-black tracking-tight">${activeGross.toFixed(2)}</h3>
            <span className="text-[9px] text-[#10B981] font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +14.2% from last {period === 'harian' ? 'day' : period === 'mingguan' ? 'week' : 'month'}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Orders Count */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-gray-400 font-bold text-xs uppercase tracking-wider block">Completed Transactions</span>
            <h3 className="text-white text-3xl font-black tracking-tight">{activeOrdersCount}</h3>
            <span className="text-[9px] text-gray-500 font-medium">Orders with completed invoice statuses</span>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-gray-400 font-bold text-xs uppercase tracking-wider block">Average Ticket Size</span>
            <h3 className="text-white text-3xl font-black tracking-tight">${activeAov.toFixed(2)}</h3>
            <span className="text-[9px] text-gray-500 font-medium">Mean expenditure amount per customer table</span>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Analytics breakdown splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category shares */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
          <h4 className="text-white font-extrabold text-sm uppercase tracking-wider border-b border-[#1E293B] pb-4 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#10B981]" />
            Category Contributions
          </h4>

          <div className="space-y-4">
            {categoriesShare.map((cat, i) => (
              <div key={i} className="space-y-1.5 text-xs text-gray-300">
                <div className="flex items-center justify-between font-bold">
                  <span>{cat.label} ({cat.count} items)</span>
                  <span className="text-white font-black">{cat.percentage} • {cat.val}</span>
                </div>
                
                {/* Custom Progress bar */}
                <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
                  <div
                    className={`${cat.color} h-full rounded-full`}
                    style={{ width: cat.percentage }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chef favorites Awards */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
          <h4 className="text-white font-extrabold text-sm uppercase tracking-wider border-b border-[#1E293B] pb-4 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Top Performing Sellers
          </h4>

          <div className="divide-y divide-[#1E293B] space-y-3.5 divide-dashed">
            {[
              { id: '#1', name: 'Meat & Mashrooms', category: 'Breakfast', price: '$37.00', rank: 'bg-amber-400 text-gray-950' },
              { id: '#2', name: 'Pear & Orange', category: 'Breakfast', price: '$25.00', rank: 'bg-gray-300 text-gray-900' },
              { id: '#3', name: 'Egg & Bread', category: 'Breakfast', price: '$25.00', rank: 'bg-amber-700 text-white' },
              { id: '#4', name: 'Sweet pancake', category: 'Dessert', price: '$13.00', rank: 'bg-gray-800 text-gray-400' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between pt-3.5 first:pt-0 text-xs">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg font-black flex items-center justify-center text-[10px] ${item.rank}`}>
                    {item.id}
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-xs">{item.name}</h5>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{item.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-bold font-mono block">{item.price}</span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase block tracking-wider">Unit Price</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
export default SalesReports;
