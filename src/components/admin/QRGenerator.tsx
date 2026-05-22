import React, { useState, useEffect } from 'react';
import { QrCode, Printer, Settings, Plus, RefreshCw, Layers } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const QRGenerator: React.FC = () => {
  const [tableInput, setTableInput] = useState('1,2,3,4,5,6,7,8,9,10');
  const [tableList, setTableList] = useState<string[]>([]);
  const [baseUrl, setBaseUrl] = useState('');

  // 1. Detect environment origin on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(`${window.location.origin}/menu`);
    }
  }, []);

  // 2. Generate table arrays
  const handleGenerateQRs = () => {
    const list = tableInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    
    // Format to 2 digit strings if numeric (e.g. '1' -> '01')
    const formatted = list.map((item) => {
      const num = parseInt(item, 10);
      if (!isNaN(num) && num < 10 && !item.startsWith('0')) {
        return `0${num}`;
      }
      return item;
    });

    setTableList(formatted);
  };

  useEffect(() => {
    if (baseUrl) {
      handleGenerateQRs();
    }
  }, [baseUrl]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic CSS styles injected specifically for window.print() isolated templates */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide all dashboard panels and sidebars */
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          /* Show ONLY the stickers grid wrapper */
          #print-stickers-grid, #print-stickers-grid * {
            visibility: visible;
          }
          #print-stickers-grid {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: grid !important;
            grid-template-cols: repeat(2, 1fr) !important;
            gap: 20px !important;
            padding: 0 !important;
          }
          .printable-card {
            border: 2px solid #000000 !important;
            border-radius: 16px !important;
            padding: 24px !important;
            page-break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            background: white !important;
          }
          .print-hidden-button {
            display: none !important;
          }
        }
      `}} />

      {/* Configuration Control Panel */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 print-hidden-button space-y-4">
        
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#10B981]/15 text-[#10B981] p-2.5 rounded-xl border border-[#10B981]/10">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">Mass QR Sticker Generator</h3>
              <p className="text-[10px] text-gray-500 font-medium">Configure table labels and print high-contrast, scan-ready stickers.</p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            disabled={tableList.length === 0}
            className="flex items-center gap-1.5 bg-[#10B981] hover:bg-emerald-500 text-gray-950 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#10B981]/15 disabled:opacity-50 disabled:shadow-none focus:outline-none"
          >
            <Printer className="w-4 h-4 stroke-[3]" />
            Print Stickers
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Base URL Domain inputs */}
          <div className="space-y-1">
            <label className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              Target Customer URL (Base)
            </label>
            <input
              type="text"
              placeholder="e.g. https://noms-coffee.vercel.app/menu"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-[#0B0F19] text-white placeholder-gray-600 rounded-xl border border-[#1E293B] p-3 focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all"
            />
          </div>

          {/* Tables config list */}
          <div className="space-y-1">
            <label className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Table Numbers (Comma Separated)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="1, 2, 3, 4, VIP-1"
                value={tableInput}
                onChange={(e) => setTableInput(e.target.value)}
                className="w-full bg-[#0B0F19] text-white placeholder-gray-600 rounded-xl border border-[#1E293B] p-3 focus:outline-none focus:ring-1 focus:ring-[#10B981] transition-all"
              />
              <button
                onClick={handleGenerateQRs}
                className="bg-[#1E293B] hover:bg-[#2A3B54] text-white p-3 rounded-xl border border-transparent transition-colors focus:outline-none shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Printable stickers grid display */}
      <div id="print-stickers-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
        {tableList.map((tableNum) => {
          const qrLinkUrl = `${baseUrl}?meja=${tableNum}`;

          return (
            <div
              key={tableNum}
              className="printable-card bg-white rounded-2xl p-5 border border-gray-200 text-center flex flex-col items-center justify-between min-h-[300px] shadow-sm relative group hover:border-[#10B981]/40 transition-all"
            >
              {/* Sticker header logo */}
              <div className="flex flex-col items-center">
                <span className="text-[#046A55] font-black text-xs tracking-widest uppercase leading-none mb-1">
                  NOMS COFFEE
                </span>
                <span className="text-[7px] text-gray-400 font-bold tracking-widest uppercase mb-4 block">
                  English Cafe Cabang
                </span>
              </div>

              {/* QR Render block */}
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center">
                <QRCodeSVG
                  value={qrLinkUrl}
                  size={120}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=60&h=60',
                    x: undefined,
                    y: undefined,
                    height: 24,
                    width: 24,
                    excavate: true,
                  }}
                />
              </div>

              {/* Table labels */}
              <div className="mt-4 flex flex-col items-center">
                <span className="text-[8px] text-gray-400 font-bold tracking-widest uppercase">MEJA</span>
                <h4 className="text-gray-950 font-black text-2xl tracking-tighter leading-none mt-0.5">
                  {tableNum}
                </h4>
              </div>

              {/* Quick instructions footnotes */}
              <div className="mt-4 pt-3 border-t border-dashed border-gray-100 w-full text-[8px] text-gray-400 font-semibold space-y-0.5 leading-none">
                <p>1. Scan QR Code</p>
                <p>2. Pilih Menu Makanan</p>
                <p>3. Pesan Dari Meja</p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
export default QRGenerator;
