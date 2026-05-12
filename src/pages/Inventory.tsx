import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Material, Product } from '../types';
import { Plus, Package, Ruler, DollarSign, Search, MoreVertical, Edit2, Trash2, Box } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<'materials' | 'products'>('materials');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubM = onSnapshot(collection(db, 'materials'), (snap) => {
      setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() } as Material)));
    });
    const unsubP = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
    return () => { unsubM(); unsubP(); };
  }, []);

  const filteredMaterials = materials.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif italic text-4xl mb-2">Central Inventory</h1>
          <p className="font-mono text-zinc-500 uppercase text-[10px] tracking-widest font-bold">Node: Global_Stock_Matrix</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-white/40 border border-white/60 p-1">
             <button 
              onClick={() => setActiveTab('materials')}
              className={cn(
                "px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-widest transition-all",
                activeTab === 'materials' ? "bg-[#141414] text-white" : "text-zinc-500 hover:text-[#141414]"
              )}
             >
               Raw Materials
             </button>
             <button 
              onClick={() => setActiveTab('products')}
              className={cn(
                "px-4 py-2 font-mono text-[10px] uppercase font-bold tracking-widest transition-all",
                activeTab === 'products' ? "bg-[#141414] text-white" : "text-zinc-500 hover:text-[#141414]"
              )}
             >
               Finished Goods
             </button>
           </div>
           <button 
            onClick={() => setShowAddModal(true)}
            className="bg-[#141414] text-white px-6 py-2 flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-800 transition-colors"
           >
             <Plus className="w-3 h-3" />
             Register Asset
           </button>
        </div>
      </div>

      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
         <input 
          type="text"
          placeholder={`SEARCH ${activeTab.toUpperCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/40 border border-white/60 pl-12 pr-4 py-4 font-mono text-xs uppercase tracking-widest focus:outline-none focus:border-[#141414]/20 transition-all"
         />
      </div>

      <div className="bg-white/40 border border-white/60 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#141414]/10">
              <th className="font-mono text-[10px] uppercase text-zinc-500 text-left p-6 font-bold tracking-widest">ID</th>
              <th className="font-mono text-[10px] uppercase text-zinc-500 text-left p-6 font-bold tracking-widest">Description</th>
              <th className="font-mono text-[10px] uppercase text-zinc-500 text-left p-6 font-bold tracking-widest">{activeTab === 'materials' ? 'Metric' : 'Category'}</th>
              <th className="font-mono text-[10px] uppercase text-zinc-500 text-left p-6 font-bold tracking-widest">Stock Level</th>
              <th className="font-mono text-[10px] uppercase text-zinc-500 text-left p-6 font-bold tracking-widest">Unit Cost</th>
              <th className="p-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]/5">
            {activeTab === 'materials' ? (
              filteredMaterials.map((m, idx) => (
                <tr key={m.id} className="hover:bg-white/60 transition-colors">
                  <td className="p-6 font-mono text-[10px] opacity-30">{String(idx + 1).padStart(3, '0')}</td>
                  <td className="p-6">
                    <div className="font-bold text-sm tracking-tight">{m.name}</div>
                    <div className="font-mono text-[10px] opacity-40 uppercase tracking-widest">{m.id.slice(0, 8)}</div>
                  </td>
                  <td className="p-6 text-xs font-mono opacity-60 uppercase">{m.unit}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         m.stockLevel < 10 ? "bg-red-500 animate-pulse" : "bg-green-500"
                       )} />
                       <span className="font-mono font-bold text-sm">{m.stockLevel}</span>
                    </div>
                  </td>
                  <td className="p-6 font-mono font-bold text-sm">${m.costPerUnit.toFixed(2)}</td>
                  <td className="p-6 text-right">
                    <button className="p-2 hover:bg-[#141414]/5 transition-colors text-zinc-400">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              filteredProducts.map((p, idx) => (
                <tr key={p.id} className="hover:bg-white/60 transition-colors">
                  <td className="p-6 font-mono text-[10px] opacity-30">{String(idx + 1).padStart(3, '0')}</td>
                  <td className="p-6">
                    <div className="font-bold text-sm tracking-tight">{p.name}</div>
                    <div className="font-mono text-[10px] opacity-40 uppercase tracking-widest">{p.sku}</div>
                  </td>
                  <td className="p-6 text-xs font-mono opacity-60 uppercase">{p.category}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         p.stockLevel < 5 ? "bg-orange-500 animate-pulse" : "bg-blue-500"
                       )} />
                       <span className="font-mono font-bold text-sm">{p.stockLevel}</span>
                    </div>
                  </td>
                  <td className="p-6 font-mono font-bold text-sm">${p.price.toLocaleString()}</td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => { setSelectedProduct(p); setShowRecipeModal(true); }}
                      className="px-3 py-1 font-mono text-[9px] uppercase font-bold border border-[#141414]/10 hover:bg-[#141414] hover:text-white transition-all mr-2"
                    >
                      Recipe
                    </button>
                    <button className="p-2 hover:bg-[#141414]/5 transition-colors text-zinc-400">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
            {(activeTab === 'materials' ? filteredMaterials : filteredProducts).length === 0 && (
              <tr>
                <td colSpan={6} className="p-20 text-center font-mono text-[10px] uppercase tracking-[0.2em] opacity-40">
                  Zero results found in database
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAddModal && <AddModal type={activeTab} onClose={() => setShowAddModal(false)} />}
        {showRecipeModal && selectedProduct && (
          <RecipeModal 
            product={selectedProduct} 
            materials={materials} 
            onClose={() => { setShowRecipeModal(false); setSelectedProduct(null); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RecipeModal({ product, materials, onClose }: { product: Product, materials: Material[], onClose: () => void }) {
  const [recipe, setRecipe] = useState(product.recipe || []);
  const [newMaterialId, setNewMaterialId] = useState('');
  const [newQty, setNewQty] = useState(1);

  const addIngredient = () => {
    if (!newMaterialId) return;
    setRecipe([...recipe, { materialId: newMaterialId, quantity: newQty }]);
    setNewMaterialId('');
    setNewQty(1);
  };

  const removeIngredient = (idx: number) => {
    setRecipe(recipe.filter((_, i) => i !== idx));
  };

  const saveRecipe = async () => {
    await updateDoc(doc(db, 'products', product.id), {
      recipe,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#141414]/90 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#E4E3E0] w-full max-w-xl p-10 border border-white/20">
        <h2 className="font-serif italic text-3xl mb-2">Production Recipe</h2>
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-8">{product.name} // {product.sku}</p>

        <div className="space-y-6">
           <div className="flex gap-2">
              <select 
                value={newMaterialId}
                onChange={e => setNewMaterialId(e.target.value)}
                className="flex-1 bg-white border border-[#141414]/10 p-3 font-mono text-[10px] uppercase"
              >
                <option value="">Select Material...</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.name} (${m.costPerUnit}/{m.unit})</option>
                ))}
              </select>
              <input 
                type="number"
                value={newQty}
                onChange={e => setNewQty(Number(e.target.value))}
                className="w-20 bg-white border border-[#141414]/10 p-3 font-mono text-xs"
              />
              <button 
                onClick={addIngredient}
                className="bg-[#141414] text-white px-4 font-mono text-[10px] uppercase font-bold"
              >
                Add
              </button>
           </div>

           <div className="border border-[#141414]/10 bg-white/40 divide-y divide-[#141414]/5 min-h-[200px]">
              {recipe.map((item, idx) => {
                const mat = materials.find(m => m.id === item.materialId);
                return (
                  <div key={idx} className="p-3 flex items-center justify-between group">
                    <div className="flex-1">
                       <p className="font-bold text-xs">{mat?.name || 'Unknown Material'}</p>
                       <p className="font-mono text-[9px] opacity-40 uppercase">{item.quantity} {mat?.unit}</p>
                    </div>
                    <div className="font-mono font-bold text-xs mr-4">${((mat?.costPerUnit || 0) * item.quantity).toFixed(2)}</div>
                    <button onClick={() => removeIngredient(idx)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              {recipe.length === 0 && (
                <div className="p-12 text-center font-mono text-[10px] opacity-30 uppercase tracking-widest">
                  No ingredients defined
                </div>
              )}
           </div>

           <div className="flex justify-between items-center pt-4 border-t border-[#141414]/10">
              <div>
                <p className="font-mono text-[9px] uppercase opacity-50">Total Manifest Cost</p>
                <p className="text-2xl font-bold font-mono tracking-tighter">
                  ${recipe.reduce((acc, item) => {
                    const mat = materials.find(m => m.id === item.materialId);
                    return acc + ((mat?.costPerUnit || 0) * item.quantity);
                  }, 0).toFixed(2)}
                </p>
              </div>
              <button 
                onClick={saveRecipe}
                className="bg-[#141414] text-white px-8 py-4 font-mono text-[10px] uppercase font-bold tracking-widest"
              >
                Confirm Specification
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

function AddModal({ type, onClose }: { type: 'materials' | 'products', onClose: () => void }) {
  const [formData, setFormData] = useState<any>({
    name: '',
    unit: 'pcs',
    stockLevel: 0,
    costPerUnit: 0,
    sku: '',
    category: '',
    price: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (type === 'materials') {
        await addDoc(collection(db, 'materials'), {
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...formData,
          recipe: [], // Simple start
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#141414]/90 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="relative bg-[#E4E3E0] w-full max-w-lg p-10 border border-white/20 shadow-2xl"
      >
        <h2 className="font-serif italic text-3xl mb-8">Register New {type === 'materials' ? 'Material' : 'Product'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Display Name</label>
              <input 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white border border-[#141414]/10 p-4 font-mono text-xs focus:outline-none focus:border-[#141414]"
              />
            </div>
            {type === 'materials' ? (
               <>
                 <div>
                    <label className="block font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Unit Type</label>
                    <select 
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                      className="w-full bg-white border border-[#141414]/10 p-4 font-mono text-xs focus:outline-none focus:border-[#141414]"
                    >
                      <option value="sq ft">SQ FT</option>
                      <option value="kg">KG</option>
                      <option value="m">METER</option>
                      <option value="pcs">PIECES</option>
                    </select>
                 </div>
                 <div>
                    <label className="block font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Cost/Unit ($)</label>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      value={formData.costPerUnit}
                      onChange={e => setFormData({...formData, costPerUnit: Number(e.target.value)})}
                      className="w-full bg-white border border-[#141414]/10 p-4 font-mono text-xs focus:outline-none focus:border-[#141414]"
                    />
                 </div>
               </>
            ) : (
               <>
                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Internal SKU</label>
                    <input 
                      required
                      value={formData.sku}
                      onChange={e => setFormData({...formData, sku: e.target.value})}
                      className="w-full bg-white border border-[#141414]/10 p-4 font-mono text-xs focus:outline-none focus:border-[#141414]"
                    />
                 </div>
                 <div>
                    <label className="block font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Market Price ($)</label>
                    <input 
                      type="number"
                      required
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full bg-white border border-[#141414]/10 p-4 font-mono text-xs focus:outline-none focus:border-[#141414]"
                    />
                 </div>
               </>
            )}
            <div>
                <label className="block font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Initial Stock</label>
                <input 
                  type="number"
                  required
                  value={formData.stockLevel}
                  onChange={e => setFormData({...formData, stockLevel: Number(e.target.value)})}
                  className="w-full bg-white border border-[#141414]/10 p-4 font-mono text-xs focus:outline-none focus:border-[#141414]"
                />
            </div>
            {type === 'products' && (
               <div>
                  <label className="block font-mono text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Category</label>
                  <input 
                    required
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white border border-[#141414]/10 p-4 font-mono text-xs focus:outline-none focus:border-[#141414]"
                  />
               </div>
            )}
          </div>
          
          <div className="pt-6 flex gap-4">
             <button 
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#141414]/10 py-4 font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-[#141414]/5 transition-colors"
             >
               Cancel
             </button>
             <button 
              type="submit"
              className="flex-1 bg-[#141414] text-white py-4 font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-800 transition-colors"
             >
               Write to Database
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
