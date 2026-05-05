import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { Part, ServiceOrder } from '../types';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function Dashboard() {
  const [partsCount, setPartsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [activeOSCount, setActiveOSCount] = useState(0);
  const [recentMovements, setRecentMovements] = useState<any[]>([]);

  useEffect(() => {
    // Real-time stock counts
    const unsubscribeParts = onSnapshot(collection(db, 'parts'), (snapshot) => {
      setPartsCount(snapshot.size);
      const lowStock = snapshot.docs.filter(doc => (doc.data() as Part).quantity <= (doc.data() as Part).minQuantity).length;
      setLowStockCount(lowStock);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'parts'));

    // Real-time OS counts
    const unsubscribeOS = onSnapshot(collection(db, 'serviceOrders'), (snapshot) => {
      const active = snapshot.docs.filter(doc => ['open', 'in-progress'].includes((doc.data() as ServiceOrder).status)).length;
      setActiveOSCount(active);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'serviceOrders'));

    // Recent movements
    const q = query(collection(db, 'movements'), orderBy('timestamp', 'desc'), limit(5));
    const unsubscribeMovements = onSnapshot(q, (snapshot) => {
      setRecentMovements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'movements'));

    return () => {
      unsubscribeParts();
      unsubscribeOS();
      unsubscribeMovements();
    };
  }, []);

  const chartData = [
    { name: 'Seg', val: 12 },
    { name: 'Ter', val: 18 },
    { name: 'Qua', val: 15 },
    { name: 'Qui', val: 25 },
    { name: 'Sex', val: 32 },
    { name: 'Sáb', val: 10 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-black text-white p-8 rounded-[32px] overflow-hidden relative border border-[#141414]">
         <div className="relative z-10">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Painel de Controle</h1>
            <p className="text-white/60 font-medium max-w-lg">Bem-vindo ao AutoStock. Aqui está um resumo do que está acontecendo na sua oficina hoje.</p>
         </div>
         <div className="absolute top-0 right-0 p-8 h-full flex items-center opacity-10">
            <TrendingUp size={120} />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Peças" 
          value={partsCount} 
          icon={<Package className="text-blue-500" />} 
          color="blue"
        />
        <StatCard 
          title="Estoque Baixo" 
          value={lowStockCount} 
          icon={<AlertTriangle className="text-amber-500" />} 
          color="amber"
          warning={lowStockCount > 0}
        />
        <StatCard 
          title="O.S. Ativas" 
          value={activeOSCount} 
          icon={<Clock className="text-green-500" />} 
          color="green"
        />
        <StatCard 
          title="Produtividade" 
          value="+15%" 
          icon={<TrendingUp className="text-purple-500" />} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-[#141414]/10 p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-black uppercase tracking-tight">Atividade Semanal</h3>
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-black"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Movimentações</span>
                 </div>
              </div>
           </div>
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#141414" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#9CA3AF'}} dy={10} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="val" stroke="#141414" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Recent Movements */}
        <div className="bg-white rounded-[32px] border border-[#141414]/10 overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-[#141414]/5 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-black uppercase tracking-tight text-sm">Movimentações</h3>
            <button className="p-2 hover:bg-black hover:text-white rounded-full transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {recentMovements.length === 0 ? (
              <div className="p-8 text-center text-[#141414]/40 italic text-sm">Sem dados.</div>
            ) : (
              recentMovements.map(m => (
                <div key={m.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${m.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {m.type === 'in' ? <ArrowUpRight size={16} /> : <ArrowUpRight size={16} className="rotate-180" />}
                    </div>
                    <div>
                      <p className="font-bold text-xs uppercase">Unidades {m.quantity}</p>
                      <p className="text-[10px] text-[#141414]/40 font-bold">{new Date(m.timestamp?.toDate()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${m.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {m.type === 'in' ? 'IN' : 'OUT'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, warning }: { title: string, value: string | number, icon: React.ReactNode, color: string, warning?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`bg-white p-6 rounded-[32px] border ${warning ? 'border-red-200 bg-red-50/10' : 'border-[#141414]/10'} shadow-sm`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`p-3 rounded-2xl bg-${color}-50`}>{icon}</div>
        {warning && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
      </div>
      <p className="text-[#141414]/40 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </motion.div>
  );
}

