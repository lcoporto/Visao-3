import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Customer } from '../types';
import { 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight,
  User,
  History,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'customers'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCustomers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Customer)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'customers'));

    return () => unsubscribe();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, telefone ou email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#141414]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black shadow-sm text-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#141414] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <UserPlus size={20} />
          NOVO CLIENTE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-[#141414]/10">
            <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhum cliente cadastrado.</p>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <motion.div 
              key={customer.id}
              layout
              className="bg-white rounded-3xl border border-[#141414]/10 p-6 shadow-sm hover:border-black transition-colors cursor-pointer group"
              onClick={() => setSelectedCustomer(customer)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight uppercase">{customer.name}</h4>
                  <p className="text-xs text-gray-400 font-medium">Deste {new Date(customer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone size={14} className="text-gray-400" />
                  <span>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-gray-100 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#141414]/40 group-hover:text-black transition-colors">
                <span>Ver Histórico</span>
                <ChevronRight size={16} />
              </div>
            </motion.div>
          ))
        )}
      </div>

      <CustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDetailView 
            customer={selectedCustomer} 
            onClose={() => setSelectedCustomer(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomerModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'customers'), {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      onClose();
      setFormData({ name: '', phone: '', email: '', address: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'customers');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b flex justify-between items-center bg-[#141414] text-white">
          <h3 className="font-bold text-xl uppercase tracking-tight">Novo Cliente</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Nome Completo</label>
              <input 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Telefone</label>
                <input 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Email</label>
                <input 
                  type="email"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2">Endereço</label>
              <textarea 
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>
          <button 
            disabled={isSubmitting}
            className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold hover:bg-black transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'CADASTRAR CLIENTE'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function CustomerDetailView({ customer, onClose }: { customer: Customer, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[60] flex flex-col border-l border-[#141414]/10"
    >
      <div className="p-6 border-b flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-xl uppercase tracking-tighter">Detalhes do Cliente</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-3xl bg-black text-white flex items-center justify-center text-4xl font-bold">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight leading-none mb-2">{customer.name}</h2>
            <div className="flex items-center gap-2 text-gray-500">
               <MapPin size={14} />
               <span className="text-sm font-medium">{customer.address || 'Endereço não informado'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Telefone</p>
            <p className="font-bold">{customer.phone}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Email</p>
            <p className="font-bold truncate">{customer.email || '-'}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-black uppercase flex items-center gap-2">
              <History size={18} /> Histórico de Serviços
            </h4>
          </div>
          <div className="space-y-4">
             <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm font-medium italic">Nenhum serviço anterior encontrado.</p>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
