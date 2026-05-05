import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Part, ServiceOrder } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Package, 
  FileText,
  Download,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';

const COLORS = ['#141414', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Reports() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'serviceOrders'), (s) => {
      setOrders(s.docs.map(d => ({ id: d.id, ...d.data() } as ServiceOrder)));
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'serviceOrders'));

    const unsubParts = onSnapshot(collection(db, 'parts'), (s) => {
      setParts(s.docs.map(d => ({ id: d.id, ...d.data() } as Part)));
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'parts'));

    return () => {
      unsubOrders();
      unsubParts();
    };
  }, []);

  // Aggregations
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
  const partsRevenue = orders.reduce((acc, curr) => acc + (curr.parts?.reduce((pa, pc) => pa + (pc.unitPrice * pc.quantity), 0) || 0), 0);
  const laborRevenue = orders.reduce((acc, curr) => acc + (curr.laborCost || 0), 0);

  const statusData = [
    { name: 'Abertas', value: orders.filter(o => o.status === 'open').length },
    { name: 'Em Curso', value: orders.filter(o => o.status === 'in-progress').length },
    { name: 'Concluídas', value: orders.filter(o => o.status === 'completed').length },
  ];

  // Mock revenue by month for chart
  const revenueHistory = [
    { month: 'Jan', revenue: 4500, parts: 2100 },
    { month: 'Fev', revenue: 5200, parts: 2800 },
    { month: 'Mar', revenue: 4800, parts: 2400 },
    { month: 'Abr', revenue: 6100, parts: 3200 },
    { month: 'Mai', revenue: 7800, parts: 4100 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Filters */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#141414]/10 shadow-sm">
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-xs font-bold uppercase transition-colors hover:bg-gray-200">
             <Calendar size={14} /> Últimos 30 dias
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-xs font-bold uppercase transition-colors hover:bg-gray-200">
             <Filter size={14} /> Todos os Serviços
          </button>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-[#141414] text-white rounded-lg text-xs font-bold uppercase transition-transform active:scale-95 shadow-sm">
           <Download size={14} /> Exportar Relatório
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportStatCard 
          label="Receita Total" 
          value={`R$ ${totalRevenue.toLocaleString()}`} 
          icon={<DollarSign className="text-green-600" />} 
          change="+15.2%"
          positive
        />
        <ReportStatCard 
          label="Custo de Peças" 
          value={`R$ ${partsRevenue.toLocaleString()}`} 
          icon={<Package className="text-blue-600" />} 
          change="+8.4%"
          positive
        />
        <ReportStatCard 
          label="Mão de Obra" 
          value={`R$ ${laborRevenue.toLocaleString()}`} 
          icon={<FileText className="text-amber-600" />} 
          change="+12.1%"
          positive
        />
        <ReportStatCard 
          label="Serviços Concluídos" 
          value={orders.filter(o => o.status === 'completed').length} 
          icon={<TrendingUp className="text-purple-600" />} 
          change="+5%"
          positive
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#141414]/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black uppercase tracking-tight text-lg">Evolução de Receita</h3>
            <p className="text-xs text-gray-400 font-bold uppercase">Jan - Mai 2026</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#141414" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                   dataKey="month" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} 
                   dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#141414" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="parts" stroke="#3B82F6" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-8 rounded-3xl border border-[#141414]/10 shadow-sm">
          <h3 className="font-black uppercase tracking-tight text-lg mb-8">Status de Serviços</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
             {statusData.map((s, i) => (
               <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                    <span className="text-xs font-bold text-gray-500 uppercase">{s.name}</span>
                  </div>
                  <span className="text-sm font-black">{s.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Most Sold Parts */}
         <div className="bg-white p-8 rounded-3xl border border-[#141414]/10 shadow-sm">
            <h3 className="font-black uppercase tracking-tight text-lg mb-8">Giro de Peças Frequentes</h3>
            <div className="space-y-4">
               {parts.slice(0, 4).map(p => (
                 <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                          <Package size={20} className="text-gray-400" />
                       </div>
                       <div>
                          <p className="text-sm font-bold uppercase">{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold tracking-widest">{p.sku}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black">12 Saídas</p>
                       <p className="text-xs text-green-600 font-bold">+R$ 450,00</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* OS By Day Bar Chart */}
         <div className="bg-white p-8 rounded-3xl border border-[#141414]/10 shadow-sm">
            <h3 className="font-black uppercase tracking-tight text-lg mb-8">O.S. por Dia da Semana</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { day: 'Seg', count: 4 },
                    { day: 'Ter', count: 7 },
                    { day: 'Qua', count: 5 },
                    { day: 'Qui', count: 9 },
                    { day: 'Sex', count: 12 },
                    { day: 'Sáb', count: 3 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#141414" radius={[6, 6, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}

function ReportStatCard({ label, value, icon, change, positive }: { label: string, value: string | number, icon: React.ReactNode, change: string, positive?: boolean }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-[#141414]/10 shadow-sm">
       <div className="flex items-center justify-between mb-6">
          <div className="p-3 bg-gray-50 rounded-2xl">{icon}</div>
          <span className={`text-[10px] font-black px-2 py-1 rounded ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
             {change}
          </span>
       </div>
       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
       <p className="text-2xl font-black">{value}</p>
    </div>
  );
}
