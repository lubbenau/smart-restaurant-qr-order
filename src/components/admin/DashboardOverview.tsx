import React from 'react';
import { DollarSign, FileText, Users, TrendingUp } from 'lucide-react';
import { Order } from '@/lib/supabase';

interface DashboardOverviewProps {
  orders: Order[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ orders }) => {
  // 1. Calculate dashboard metrics
  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  
  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalOrdersCount = orders.length;
  
  // Calculate active tables
  const activeTablesCount = new Set(activeOrders.map((o) => o.table_number)).size;

  // 2. Prepare sales data for custom SVG Area Chart
  // Days of the week (last 7 days) mock representation
  const weeklyData = [
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: 210 },
    { label: 'Wed', value: 180 },
    { label: 'Thu', value: 340 },
    { label: 'Fri', value: 280 },
    { label: 'Sat', value: 450 },
    { label: 'Sun', value: 390 },
  ];

  const maxChartValue = Math.max(...weeklyData.map((d) => d.value));
  
  // SVG Area Chart points builder helper
  const width = 500;
  const height = 150;
  const padding = 20;

  // Calculate coordinates for points
  const points = weeklyData.map((data, index) => {
    const x = padding + (index * (width - padding * 2)) / (weeklyData.length - 1);
    const y = height - padding - (data.value * (height - padding * 2)) / maxChartValue;
    return { x, y };
  });

  // Convert points to SVG Line and Area paths
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      desc: 'All-time completed sales',
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Total Orders',
      value: totalOrdersCount.toString(),
      desc: 'Overall transactions',
      icon: FileText,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Active Tables',
      value: activeTablesCount.toString(),
      desc: 'Tables ordering right now',
      icon: Users,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1.5">
                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider block">
                  {stat.label}
                </span>
                <h3 className="text-white text-3xl font-black tracking-tight">{stat.value}</h3>
                <span className="text-[10px] text-gray-500 font-medium block">{stat.desc}</span>
              </div>
              
              <div className={`p-4 rounded-xl border ${stat.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Chart & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Chart Panel */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#1E293B] rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 mb-4">
            <div>
              <h3 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Revenue Summary
              </h3>
              <p className="text-[10px] text-gray-500 font-medium">Daily transaction volumes over the last 7 days</p>
            </div>
            <span className="bg-[#10B981]/15 text-[#10B981] text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
              Weekly view
            </span>
          </div>

          {/* SVG Vector Area Chart */}
          <div className="w-full relative h-[160px] select-none">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1E293B" strokeDasharray="3 3" />
              <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1E293B" strokeDasharray="3 3" />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1E293B" />

              {/* Area Under Line */}
              <path d={areaPath} fill="url(#chartGrad)" />

              {/* Vector Line */}
              <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

              {/* Plot points circles */}
              {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="4" fill="#0B0F19" stroke="#10B981" strokeWidth="2" />
                  <circle cx={p.x} cy={p.y} r="8" fill="#10B981" opacity="0" className="hover:opacity-20 transition-opacity" />
                </g>
              ))}
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between px-2 text-[10px] text-gray-500 font-bold uppercase mt-2 pt-2 border-t border-[#1E293B]/60">
            {weeklyData.map((d, i) => (
              <span key={i}>{d.label}</span>
            ))}
          </div>
        </div>

        {/* Quick Trends - Most Ordered panel */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
          <h3 className="text-white font-extrabold text-sm uppercase tracking-wider border-b border-[#1E293B] pb-4 mb-4">
            Most Ordered Items
          </h3>
          
          <div className="space-y-4">
            {[
              { name: 'Meat & Mashrooms', count: 48, pct: '100%', val: '$1,776.00' },
              { name: 'Pear & Orange', count: 32, pct: '66%', val: '$800.00' },
              { name: 'Egg & Bread', count: 24, pct: '50%', val: '$600.00' },
              { name: 'Sweet pancake', count: 18, pct: '37%', val: '$234.00' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                  <span className="truncate">{item.name}</span>
                  <span className="text-emerald-400 font-mono text-[10px]">{item.val}</span>
                </div>
                
                {/* Custom Progress Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-grow h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full"
                      style={{ width: item.pct }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-500 font-bold min-w-[32px] text-right">
                    {item.count} ord
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
export default DashboardOverview;
