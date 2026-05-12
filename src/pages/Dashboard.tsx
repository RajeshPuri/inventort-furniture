import React, { useEffect, useState } from 'react';
import { collection, query, limit, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Material, Product, ProductionOrder, Invoice } from '../types';
import { 
  TrendingUp, 
  Package, 
  Hammer, 
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState({
    stockValue: 0,
    wipOrders: 0,
    monthlySales: 0,
    lowStockItems: 0
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    // Basic stats aggregation (In a real app, this might be a cloud function or cached)
    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snap) => {
      const invoices = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      const monthTotal = invoices.reduce((acc, inv) => acc + inv.total, 0);
      setRecentInvoices(invoices.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5));
      setStats(prev => ({ ...prev, monthlySales: monthTotal }));
    });

    const unsubProduction = onSnapshot(collection(db, 'productionOrders'), (snap) => {
      const wipCount = snap.docs.filter(doc => doc.data().status !== 'finished').length;
      setStats(prev => ({ ...prev, wipOrders: wipCount }));
    });

    const unsubMaterials = onSnapshot(collection(db, 'materials'), (snap) => {
      const lowStock = snap.docs.filter(doc => doc.data().stockLevel < 10).length;
      setStats(prev => ({ ...prev, lowStockItems: lowStock }));
    });

    return () => {
      unsubInvoices();
      unsubProduction();
      unsubMaterials();
    };
  }, []);

  return (
    <div className="space-y-12 max-w-[1400px] mx-auto pb-12">
      <div>
        <h1 className="font-serif italic text-4xl mb-2">Systems Overview</h1>
        <p className="font-mono text-zinc-500 uppercase text-[10px] tracking-widest font-bold">Node: Factory_Showroom_Integrated</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Cumulative Monthly Revenue" 
          value={`$${stats.monthlySales.toLocaleString()}`} 
          trend="+12.4%" 
          positive={true}
          icon={TrendingUp}
        />
        <StatCard 
          label="Active WIP Units" 
          value={stats.wipOrders.toString()} 
          trend="Showroom Pull" 
          icon={Hammer}
        />
        <StatCard 
          label="Material Vulnerabilities" 
          value={stats.lowStockItems.toString()} 
          trend={stats.lowStockItems > 0 ? "Critical Restock" : "Nominal"}
          positive={stats.lowStockItems === 0}
          icon={AlertTriangle}
        />
        <StatCard 
          label="Inventory Liquidity" 
          value="92.4%" 
          trend="-0.5%" 
          positive={false}
          icon={Package}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#141414]/10 pb-4">
            <h2 className="font-serif italic text-2xl">Recent Transmissions</h2>
            <button className="font-mono text-[10px] uppercase font-bold text-zinc-500 hover:text-[#141414] transition-colors">View All Archive</button>
          </div>
          
          <div className="bg-white/40 border border-white/60 divide-y divide-[#141414]/5">
            {recentInvoices.map((inv, idx) => (
              <div key={inv.id} className="p-6 flex items-center hover:bg-white/60 transition-colors cursor-pointer group">
                <div className="font-mono text-[10px] font-bold opacity-30 mr-6 w-8">{String(idx + 1).padStart(2, '0')}</div>
                <div className="flex-1">
                  <div className="font-bold text-sm tracking-tight">{inv.customerName}</div>
                  <div className="font-mono text-[10px] opacity-40 uppercase tracking-wider">{inv.id.slice(0, 8)} • {format(new Date(inv.createdAt), 'MMM dd, HH:mm')}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm">${inv.total.toLocaleString()}</div>
                  <div className={cn(
                    "text-[9px] font-mono uppercase font-black px-1.5 py-0.5 inline-block mt-1",
                    inv.status === 'paid' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  )}>
                    {inv.status}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 ml-4 opacity-0 group-hover:opacity-30 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            ))}
            {recentInvoices.length === 0 && (
              <div className="p-12 text-center text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
                No recent activity detected
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
           <h2 className="font-serif italic text-2xl border-b border-[#141414]/10 pb-4">Artisan Load</h2>
           <div className="space-y-3">
              <ArtistLoadItem name="Liam Chen" workload={85} status="Active" />
              <ArtistLoadItem name="Sarah Miller" workload={42} status="Idle" />
              <ArtistLoadItem name="Akio Tanaka" workload={12} status="Available" />
              <ArtistLoadItem name="Elena Rossi" workload={95} status="Overload" />
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, positive, icon: Icon }: any) {
  return (
    <div className="bg-white/40 border border-white/60 p-6 space-y-4 relative overflow-hidden group hover:border-[#141414]/20 transition-all">
      <div className="flex items-start justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 font-bold max-w-[80px] leading-tight">{label}</p>
        <Icon className="w-4 h-4 opacity-20" />
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold tracking-tighter">{value}</h3>
        {trend && (
           <span className={cn(
             "font-mono text-[9px] font-black tracking-tighter",
             positive === undefined ? "text-zinc-400" : positive ? "text-green-600" : "text-red-600"
           )}>
             {trend}
           </span>
        )}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#141414]/5 group-hover:bg-[#141414]/10 transition-all" />
    </div>
  );
}

function ArtistLoadItem({ name, workload, status }: any) {
    return (
        <div className="p-4 border border-[#141414]/5 bg-white/20">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold leading-none">{name}</span>
                <span className={cn(
                    "text-[9px] font-mono uppercase font-black px-1",
                    status === 'Overload' ? "text-red-500" : status === 'Available' ? "text-green-500" : "text-zinc-500"
                )}>{status}</span>
            </div>
            <div className="h-1 bg-[#141414]/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${workload}%` }}
                    className={cn(
                        "h-full",
                        workload > 80 ? "bg-red-500" : workload > 50 ? "bg-orange-500" : "bg-zinc-500"
                    )}
                />
            </div>
        </div>
    )
}
