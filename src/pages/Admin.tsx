import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc, addDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Role } from '../types';
import { Users, Shield, Database, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Admin() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    return onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile)));
    });
  }, []);

  const seedDummyData = async () => {
    if (!confirm('This will insert sample materials, products, and orders. Continue?')) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);

      // 1. Materials
      const materials = [
        { name: 'A-Grade Teak Wood', unit: 'sq ft', stockLevel: 450, costPerUnit: 24.50 },
        { name: 'Industrial Steel Frame', unit: 'pcs', stockLevel: 42, costPerUnit: 85.00 },
        { name: 'Italian Cognac Leather', unit: 'm', stockLevel: 120, costPerUnit: 45.00 },
        { name: 'Memory Foam High-Density', unit: 'kg', stockLevel: 85, costPerUnit: 12.00 },
        { name: 'Brushed Brass Hinges', unit: 'pcs', stockLevel: 200, costPerUnit: 4.25 },
      ];

      const matRefs: any[] = [];
      for (const mat of materials) {
        const ref = doc(collection(db, 'materials'));
        batch.set(ref, { ...mat, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        matRefs.push({ id: ref.id, name: mat.name });
      }

      // 2. Products
      const products = [
        { 
          name: 'The Heritage Sofa', 
          category: 'Living Room', 
          sku: 'SOF-001-HEA', 
          price: 2450, 
          stockLevel: 4,
          recipe: [
            { materialId: '', name: 'Italian Cognac Leather', quantity: 12 },
            { materialId: '', name: 'Memory Foam High-Density', quantity: 15 }
          ] 
        },
        { 
          name: 'Nordic Dining Table', 
          category: 'Dining', 
          sku: 'TAB-042-NOR', 
          price: 1850, 
          stockLevel: 2,
          recipe: [{ materialId: '', name: 'A-Grade Teak Wood', quantity: 45 }]
        }
      ];

      // Note: In a real batch we'd need the IDs first, for dummy data we'll just link by name or leave IDs empty for now
      for (const prod of products) {
        const ref = doc(collection(db, 'products'));
        batch.set(ref, { ...prod, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }

      // 3. Some Production Orders
      const orderRef = doc(collection(db, 'productionOrders'));
      batch.set(orderRef, {
        productId: 'sample-id',
        quantity: 5,
        status: 'assembly',
        estimatedCompletion: new Date(Date.now() + 604800000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await batch.commit();
      alert('Database seeded successfully.');
    } catch (err) {
      console.error(err);
      alert('Seeding failed. Check console.');
    } finally {
      setIsSeeding(false);
    }
  };

  const updateRole = async (userId: string, newRole: Role) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif italic text-4xl mb-2">Staff Control</h1>
          <p className="font-mono text-zinc-500 uppercase text-[10px] tracking-widest font-bold">Node: Access_Management_Level_Alpha</p>
        </div>
        <button 
          onClick={seedDummyData}
          disabled={isSeeding}
          className="flex items-center gap-2 border border-[#141414]/20 px-6 py-2 font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-[#141414] hover:text-white transition-all disabled:opacity-50"
        >
          {isSeeding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
          Seed System Data
        </button>
      </div>

      <div className="bg-white/40 border border-white/60 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#141414]/10">
              <th className="font-mono text-[10px] uppercase text-zinc-500 text-left p-6 font-bold tracking-widest">Employee</th>
              <th className="font-mono text-[10px] uppercase text-zinc-500 text-left p-6 font-bold tracking-widest">System Email</th>
              <th className="font-mono text-[10px] uppercase text-zinc-500 text-left p-6 font-bold tracking-widest">Privilege Level</th>
              <th className="font-mono text-[10px] uppercase text-zinc-500 text-left p-6 font-bold tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/60 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#141414]/5 rounded-none flex items-center justify-center font-mono font-bold text-xs uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-bold tracking-tight">{user.name}</span>
                  </div>
                </td>
                <td className="p-6 font-mono text-xs opacity-60 lowercase">{user.email}</td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    {user.role === 'admin' ? <ShieldCheck className="w-3 h-3 text-red-500" /> : <Shield className="w-3 h-3 text-zinc-400" />}
                    <span className={cn(
                      "font-mono text-[10px] font-black uppercase px-2 py-0.5",
                      user.role === 'admin' ? "bg-red-50 text-red-600" : 
                      user.role === 'artisan' ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-500"
                    )}>
                      {user.role}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex gap-2">
                    <select 
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value as Role)}
                      className="bg-white border border-[#141414]/10 p-2 font-mono text-[9px] uppercase font-bold focus:outline-none"
                    >
                      <option value="showroom">Showroom</option>
                      <option value="artisan">Artisan</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
