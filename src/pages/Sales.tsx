import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Invoice, InvoiceItem } from '../types';
import { Plus, Search, ShoppingCart, Trash2, Printer, CreditCard, User, Mail, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState({ name: '', email: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { productId: product.id, quantity: 1, price: product.price }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.productId !== id));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.13; // 13% tax as requested
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart]);

  const finalizeSale = async () => {
    if (cart.length === 0 || !customer.name) return;
    setIsProcessing(true);
    try {
      // 1. Create Invoice
      const invoiceData = {
        customerName: customer.name,
        customerEmail: customer.email,
        items: cart,
        ...totals,
        status: 'paid',
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'invoices'), invoiceData);

      // 2. Adjust Stock (Ideally in a transaction/batch)
      for (const item of cart) {
        await updateDoc(doc(db, 'products', item.productId), {
          stockLevel: increment(-item.quantity)
        });
      }

      setCart([]);
      setCustomer({ name: '', email: '' });
      alert('Transaction Successful. Invoice Generated.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
      {/* Product Selection */}
      <div className="lg:col-span-8 flex flex-col space-y-6 overflow-hidden">
        <div>
          <h1 className="font-serif italic text-4xl mb-2">Showroom POS</h1>
          <p className="font-mono text-zinc-500 uppercase text-[10px] tracking-widest font-bold">Node: Retail_Terminal_Prime</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="SEARCH PRODUCTS OR SCAN BARCODE..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/40 border border-white/60 pl-12 pr-4 py-4 font-mono text-xs uppercase tracking-widest focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white/40 border border-white/60 p-6 flex flex-col justify-between hover:border-[#141414]/30 cursor-pointer transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-[9px] uppercase opacity-40 tracking-widest">{product.sku}</span>
                  <div className={cn(
                    "text-[9px] font-mono font-black uppercase px-1.5",
                    product.stockLevel > 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                  )}>
                    {product.stockLevel > 0 ? `${product.stockLevel} IN STOCK` : 'OUT OF STOCK'}
                  </div>
                </div>
                <h3 className="font-bold text-base leading-tight mb-2">{product.name}</h3>
                <p className="font-mono text-[10px] opacity-50 uppercase">{product.category}</p>
              </div>
              <div className="mt-6 flex justify-between items-end">
                <span className="text-xl font-bold font-mono tracking-tighter">${product.price.toLocaleString()}</span>
                <div className="bg-[#141414] text-white p-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="lg:col-span-4 bg-white/60 border border-white/80 flex flex-col h-full overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#141414]/10 bg-white/20">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart className="w-4 h-4" />
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest">Active Transaction</h2>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
              <input 
                placeholder="CUSTOMER NAME"
                value={customer.name}
                onChange={e => setCustomer({...customer, name: e.target.value})}
                className="w-full bg-white border border-[#141414]/5 pl-9 pr-4 py-3 font-mono text-[10px] uppercase focus:outline-none focus:border-[#141414]/20"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
              <input 
                placeholder="EMAIL (OPTIONAL)"
                value={customer.email}
                onChange={e => setCustomer({...customer, email: e.target.value})}
                className="w-full bg-white border border-[#141414]/5 pl-9 pr-4 py-3 font-mono text-[10px] uppercase focus:outline-none focus:border-[#141414]/20"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#141414]/5">
          {cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            return (
              <div key={item.productId} className="p-4 flex items-center gap-4 group">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs truncate">{product?.name}</p>
                  <p className="font-mono text-[9px] opacity-40 uppercase tracking-wider">{item.quantity} x ${item.price.toLocaleString()}</p>
                </div>
                <div className="font-mono font-bold text-xs">
                  ${(item.price * item.quantity).toLocaleString()}
                </div>
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 transition-all rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
          {cart.length === 0 && (
            <div className="p-12 text-center text-zinc-400 font-mono text-[10px] uppercase tracking-widest opacity-40">
              Cart is currently empty 
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-[#141414]/10 space-y-3">
          <div className="flex justify-between font-mono text-[10px] uppercase font-bold text-zinc-500">
            <span>Subtotal</span>
            <span>${totals.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-mono text-[10px] uppercase font-bold text-zinc-500">
            <span>Sales Tax (13%)</span>
            <span>${totals.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-end pt-2">
            <span className="font-mono text-[10px] uppercase font-black tracking-widest text-[#141414]">Total Amount</span>
            <span className="text-2xl font-bold font-mono tracking-tighter text-[#141414]">${totals.total.toLocaleString()}</span>
          </div>
          
          <div className="pt-6 grid grid-cols-2 gap-3">
            <button className="border border-[#141414]/10 py-3 flex items-center justify-center gap-2 font-mono text-[10px] uppercase font-bold hover:bg-[#141414]/5 transition-colors">
              <Printer className="w-3 h-3" />
              Quote
            </button>
            <button 
              disabled={cart.length === 0 || !customer.name || isProcessing}
              onClick={finalizeSale}
              className="bg-[#141414] text-white py-3 flex items-center justify-center gap-2 font-mono text-[10px] uppercase font-bold hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-3 h-3" />
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
