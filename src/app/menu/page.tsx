import { Suspense } from 'react';
import CustomerMenuContent from './CustomerMenuContent';

export default function CustomerMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#D7EFEA] flex flex-col items-center justify-center font-sans">
          <div className="bg-white p-6 rounded-full shadow-sm mb-4 animate-bounce">
            <div className="w-8 h-8 border-4 border-[#046A55] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[#046A55] font-bold text-xs uppercase tracking-widest animate-pulse">
            English Cafe Imersa...
          </p>
        </div>
      }
    >
      <CustomerMenuContent />
    </Suspense>
  );
}
export const dynamic = 'force-dynamic';
export const revalidate = 0;
