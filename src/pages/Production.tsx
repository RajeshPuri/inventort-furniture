import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductionOrder, Product, OrderStatus } from '../types';
import { Plus, Hammer, Clock, CheckCircle2, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Production() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const unsubOrders = onSnapshot(query(collection(db, 'productionOrders'), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductionOrder)));
    });
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
    return () => { unsubOrders(); unsubProducts(); };
  }, []);

  const getProduct = (id: string) => products.find(p => p.id === id);

  const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    cutting: 'bg-blue-50 text-blue-600 border-blue-100',
    assembly: 'bg-orange-50 text-orange-600 border-orange-100',
    finished: 'bg-green-50 text-green-600 border-green-100'
  };

  const updateStatus = async (id: string, currentStatus: OrderStatus) => {
    const statuses: OrderStatus[] = ['pending', 'cutting', 'assembly', 'finished'];
    const nextIndex = statuses.indexOf(currentStatus) + 1;
    if (nextIndex < statuses.length) {
      await updateDoc(doc(db, 'productionOrders', id), {
        status: statuses[nextIndex],
        updatedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif italic text-4xl mb-2">Production Queue</h1>
          <p className="font-mono text-zinc-500 uppercase text-[10px] tracking-widest font-bold">Node: Factory_Floor_Operations</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#141414] text-white px-6 py-2 flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Initiate Order
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => {
          const product = getProduct(order.productId);
          return (
            <div key={order.id} className="bg-white/40 border border-white/60 p-6 flex items-center gap-8 hover:border-[#141414]/20 transition-all group">
              <div className="w-12 h-12 bg-[#141414]/5 rounded-none flex items-center justify-center">
                 <Hammer className={cn("w-5 h-5", order.status === 'finished' ? "text-green-500" : "text-[#141414] animate-pulse")} />
              </div>
              
              <div className="flex-1 min-w-0">
                 <h3 className="font-bold text-lg tracking-tight mb-1">{product?.name || 'Unknown Product'}</h3>
                 <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest opacity-50">
                    <span>UNIT_QTY: {order.quantity}</span>
                    <span>SKU: {product?.sku || 'N/A'}</span>
                    <span>START: {format(new Date(order.createdAt), 'MMM dd')}</span>
                 </div>
              </div>

              <div className="flex items-center gap-12">
                 <div className="text-center">
                    <p className="font-mono text-[9px] uppercase opacity-40 mb-1">Target_Date</p>
                    <p className="text-xs font-bold">{format(new Date(order.estimatedCompletion), 'MMM dd')}</p>
                 </div>

                 <div className="min-w-[120px]">
                    <span className={cn(
                      "px-3 py-1 rounded-none border text-[10px] font-mono font-black uppercase tracking-tighter block text-center",
                      statusColors[order.status]
                    )}>
                      {order.status}
                    </span>
                 </div>

                 <button 
                  onClick={() => updateStatus(order.id, order.status)}
                  disabled={order.status === 'finished'}
                  className={cn(
                    "p-3 border transition-all h-10 w-10 flex items-center justify-center",
                    order.status === 'finished' 
                      ? "bg-green-100 border-green-200 text-green-600" 
                      : "bg-[#141414] text-white border-transparent hover:bg-zinc-800"
                  )}
                 >
                   {order.status === 'finished' ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                 </button>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
           <div className="p-20 text-center bg-white/20 border border-dashed border-[#141414]/10 rounded-none">
              <Hammer className="w-8 h-8 opacity-10 mx-auto mb-4" />
              <p className="font-serif italic text-xl text-zinc-400">No active production cycles</p>
           </div>
        )}
      </div>

      {showAddModal && (
        <OrderModal 
          products={products} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
    </div>
  );
}

function OrderModal({ products, onClose }: { products: Product[], onClose: () => void }) {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    estimatedDays: 7
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) return;

    const completion = new Date();
    completion.setDate(completion.getDate() + formData.estimatedDays);

    await addDoc(collection(db, 'productionOrders'), {
      productId: formData.productId,
      quantity: formData.quantity,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedCompletion: completion.toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#141414]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#E4E3E0] w-full max-w-sm p-10 border border-white/20">
        <h2 className="font-serif italic text-3xl mb-8">Initiate Production</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-[10px] uppercase font-bold text-zinc-500 mb-2">Target Product</label>
            <select 
              required
              value={formData.productId}
              onChange={e => setFormData({...formData, productId: e.target.value})}
              className="w-full bg-white border border-[#141414]/10 p-4 font-mono text-xs"
            >
              <option value="">Select Item...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase font-bold text-zinc-500 mb-2">Quantity</label>
              <input 
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                className="w-full bg-white border border-[#141414]/10 p-4 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase font-bold text-zinc-500 mb-2">Lead Days</label>
              <input 
                type="number"
                min="1"
                required
                value={formData.estimatedDays}
                onChange={e => setFormData({...formData, estimatedDays: Number(e.target.value)})}
                className="w-full bg-white border border-[#141414]/10 p-4 font-mono text-xs"
              />
            </div>
          </div>
          <button className="w-full bg-[#141414] text-white py-4 font-mono text-[10px] uppercase font-bold tracking-widest">
            Execute Cycle
          </button>
        </form>
      </div>
    </div>
  );
}
