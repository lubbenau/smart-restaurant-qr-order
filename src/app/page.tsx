'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, QrCode, ArrowRight, LayoutDashboard, Sparkles } from 'lucide-react';

export default function LandingSplashPage() {
  const router = useRouter();
  const [selectedTable, setSelectedTable] = useState('01');

  const handleEnterMenu = () => {
    router.push(`/menu?meja=${selectedTable}`);
  };

  const tables = ['01', '02', '03', '04', '05', '06'];

  return (
    <div className="min-h-screen bg-[#D7EFEA] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Visual Splash Container */}
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-gray-100 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D7EFEA]/30 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#046A55]/5 rounded-full blur-2xl -ml-10 -mb-10" />

        {/* Cafe branding header */}
        <div className="space-y-2">
          <div className="w-16 h-16 bg-[#046A55] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#046A55]/20 mx-auto transform hover:rotate-12 transition-transform">
            <Coffee className="w-8 h-8" />
          </div>
          
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black text-gray-950 tracking-tight leading-tight">English Cafe Imersa</h1>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Noms Coffee Cabang</span>
          </div>
        </div>

        {/* Intro */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4.5 text-xs text-gray-500 leading-relaxed max-w-[280px]">
          Selamat datang! Kami telah mendigitalisasi proses pemesanan. Cukup pilih meja Anda di bawah ini untuk mensimulasikan pemindaian QR code meja Anda.
        </div>

        {/* Simulated Table select controls */}
        <div className="w-full space-y-3">
          <label className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block text-left pl-1">
            Simulasikan Nomor Meja Anda
          </label>
          <div className="grid grid-cols-3 gap-2">
            {tables.map((t) => {
              const isSelected = selectedTable === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTable(t)}
                  className={`py-3 rounded-xl font-bold text-xs transition-all border ${
                    isSelected
                      ? 'bg-[#046A55] border-[#046A55] text-white shadow-md shadow-[#046A55]/15'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Meja {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Pathways buttons */}
        <div className="w-full space-y-3.5 pt-2">
          {/* Enter Customer View */}
          <button
            onClick={handleEnterMenu}
            className="w-full bg-[#046A55] hover:bg-[#035242] text-white py-4 rounded-2xl font-extrabold text-sm shadow-lg shadow-[#046A55]/15 hover:shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 group"
          >
            <QrCode className="w-4 h-4" />
            Pesan dari Meja {selectedTable}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Enter Admin Dashboard View */}
          <button
            onClick={() => router.push('/admin')}
            className="w-full bg-gray-900 hover:bg-gray-950 text-white py-3.5 rounded-2xl font-extrabold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 border border-gray-800"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400 animate-pulse" />
            Buka Admin Dashboard (Dark Theme)
          </button>
        </div>

        {/* Footer branding */}
        <div className="flex items-center gap-1 text-[9px] text-[#046A55]/50 font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-[#046A55]/40" />
          Smart Restaurant order app
        </div>

      </div>

    </div>
  );
}
