import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import { useAuth } from './lib/AuthContext';
import { Loader2 } from 'lucide-react';

// Lazy load pages for performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Inventory = React.lazy(() => import('./pages/Inventory'));
const Production = React.lazy(() => import('./pages/Production'));
const Sales = React.lazy(() => import('./pages/Sales'));
const Admin = React.lazy(() => import('./pages/Admin'));

function App() {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#E4E3E0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#141414]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#141414] text-[#E4E3E0] p-4 text-center">
        <h1 className="font-serif italic text-6xl mb-4 tracking-tighter">Timber & Trade</h1>
        <p className="font-mono text-xs uppercase opacity-50 tracking-[0.2em] mb-12">Manufacturing & Retail Intelligence</p>
        
        <div className="w-full max-w-sm p-8 border border-white/10 bg-white/5 backdrop-blur-sm">
          <button
            onClick={signIn}
            className="w-full bg-[#E4E3E0] text-[#141414] py-4 font-mono font-bold uppercase tracking-widest hover:bg-white transition-all transform active:scale-[0.98]"
          >
            Access Core Terminal
          </button>
          <p className="mt-8 text-[10px] font-mono opacity-30 leading-relaxed">
            Authorized Personnel Only. All access is logged and monitored. 
            Timber & Trade Systems v1.02.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414]">
      <Sidebar />
      <main className="ml-64 p-8 min-h-screen transition-all duration-300 overflow-x-hidden">
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-full pt-20">
             <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/production" element={<Production />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </main>
    </div>
  );
}

export default App;
