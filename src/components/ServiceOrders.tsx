import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, serverTimestamp, orderBy } from 'firebase/firestore';
import { ServiceOrder, OSStatus } from '../types';
import { 
  Plus, 
  ClipboardList, 
  ChevronRight, 
  User, 
  Car, 
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ServiceOrders() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'serviceOrders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ServiceOrder)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'serviceOrders'));

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <StatusTab label="Todas" count={orders.length} active />
          <StatusTab label="Abertas" count={orders.filter(o => o.status === 'open').length} />
          <StatusTab label="Em Curso" count={orders.filter(o => o.status === 'in-progress').length} />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white rounded-xl font-bold hover:bg-black shadow-lg transition-all"
        >
          <Plus size={20} />
          NOVA O.S.
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#141414]/10 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-[#141414]/5">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente / Veículo</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data Abertura</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]/5">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">Nenhuma ordem de serviço registrada.</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        {order.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{order.customerName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 uppercase">
                          <Car size={10} /> {order.vehicleInfo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {new Date(order.createdAt as any).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-black text-sm">
                    R$ {order.totalCost || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-[#141414]/5 rounded-lg text-gray-400 group-hover:text-black">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusTab({ label, count, active }: { label: string, count: number, active?: boolean }) {
  return (
    <button className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${active ? 'bg-[#141414] text-white shadow-md' : 'bg-white border border-[#141414]/5 text-gray-500 hover:bg-gray-50'}`}>
      {label} <span className={`ml-1 ${active ? 'text-white/60' : 'text-gray-300'}`}>{count}</span>
    </button>
  );
}

function StatusBadge({ status }: { status: OSStatus }) {
  const configs = {
    'open': { icon: <AlertCircle size={12} />, label: 'ABERTA', color: 'bg-blue-100 text-blue-700' },
    'in-progress': { icon: <Clock size={12} />, label: 'EM CURSO', color: 'bg-amber-100 text-amber-700' },
    'completed': { icon: <CheckCircle2 size={12} />, label: 'CONCLUÍDA', color: 'bg-green-100 text-green-700' },
    'cancelled': { icon: <ClipboardList size={12} />, label: 'CANCELADA', color: 'bg-gray-100 text-gray-700' }
  };
  const config = configs[status];
  return (
    <span className={`flex items-center gap-1.5 w-fit px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${config.color}`}>
      {config.icon} {config.label}
    </span>
  );
}
