import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, serverTimestamp, doc, updateDoc, setDoc } from 'firebase/firestore';
import { Part } from '../types';
import { 
  Plus, 
  Search, 
  Camera, 
  Filter, 
  MoreVertical, 
  AlertCircle,
  Package,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import AIVisionModal from './AIVisionModal';

export default function Inventory() {
  const [parts, setParts] = useState<Part[]>([]);
  const [search, setSearch] = useState('');
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [isRefreshingMarket, setIsRefreshingMarket] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'parts'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setParts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Part)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'parts'));

    return () => unsubscribe();
  }, []);

  const handleAISuccess = async (aiData: any) => {
    setIsVisionOpen(false);
    try {
      // Create part document
      const newPart: any = {
        name: aiData.name,
        sku: `AUTO-${Math.random().toString(36).substr(2, 5).toUpperCase()}`, // Auto-generate SKU for now
        category: aiData.category,
        brand: 'N/A', // AI could get this, but let's default
        compatibility: aiData.compatibility,
        quantity: 0,
        minQuantity: 2,
        price: aiData.marketPrices.avg,
        marketPrices: {
          min: aiData.marketPrices.min,
          avg: aiData.marketPrices.avg,
          max: aiData.marketPrices.max,
          bestProvider: aiData.marketPrices.bestProvider,
          lastUpdated: new Date().toISOString()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'parts'), newPart);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'parts');
    }
  };

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, SKU ou categoria..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#141414]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm transition-all text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsVisionOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Camera size={20} />
            SCANNER AI
          </button>
          <button className="flex items-center justify-center p-3 bg-white border border-[#141414]/10 rounded-xl hover:bg-gray-50">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-[#141414]/10">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhuma peça encontrada.</p>
            <button onClick={() => setIsVisionOpen(true)} className="mt-4 text-blue-600 font-bold hover:underline">Identificar uma peça agora</button>
          </div>
        ) : (
          filteredParts.map(part => (
            <PartCard key={part.id} part={part} />
          ))
        )}
      </div>

      <AIVisionModal 
        isOpen={isVisionOpen} 
        onClose={() => setIsVisionOpen(false)} 
        onFinish={handleAISuccess}
      />
    </div>
  );
}

function PartCard({ part }: { part: Part, key?: string }) {
  const isLowStock = part.quantity <= part.minQuantity;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl border border-[#141414]/10 shadow-sm overflow-hidden flex flex-col hover:border-black transition-colors group cursor-pointer"
    >
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 uppercase tracking-tighter">{part.sku}</span>
            {isLowStock && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full flex items-center gap-1 uppercase tracking-tighter">
                <AlertCircle size={10} /> ESTOQUE BAIXO
              </span>
            )}
          </div>
          <button className="p-1 hover:bg-gray-100 rounded-full"><MoreVertical size={18} /></button>
        </div>
        
        <h4 className="font-bold text-lg mb-1 leading-tight uppercase">{part.name}</h4>
        <p className="text-sm text-gray-500 mb-4">{part.category}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Quantidade</p>
            <p className={`text-xl font-black ${isLowStock ? 'text-red-600' : 'text-[#141414]'}`}>{part.quantity}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Preço Un.</p>
            <p className="text-xl font-black">R$ {part.price}</p>
          </div>
        </div>

        {part.marketPrices && (
          <div className="pt-4 border-t border-dashed border-[#141414]/10">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400 font-medium">Comparativo Web:</span>
              <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">{part.marketPrices.bestProvider}</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown size={14} className="text-green-600" />
              <p className="text-xs font-bold text-green-600">Melhor oferta: R$ {part.marketPrices.min}</p>
            </div>
            <p className="text-[10px] text-gray-300 italic">Atualizado em 03/05/2026</p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-[#141414]/5 flex items-center justify-between group-hover:bg-[#141414] group-hover:text-white transition-colors">
        <span className="text-xs font-bold uppercase tracking-widest">Detalhes do Item</span>
        <ChevronRight size={16} />
      </div>
    </motion.div>
  );
}
