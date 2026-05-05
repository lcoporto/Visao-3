import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Appointment } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Car, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Scheduling() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('dateTime', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'appointments'));

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Calendar View Mock */}
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-3xl border border-[#141414]/10 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase">Maio 2026</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
              <button className="px-4 py-2 bg-gray-100 text-sm font-bold rounded-lg uppercase">Hoje</button>
              <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden shadow-inner font-mono text-xs">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="bg-gray-50 p-3 text-center font-bold text-gray-400">{day}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className={`bg-white p-4 h-24 transition-colors hover:bg-gray-50 cursor-pointer relative ${i + 1 === 3 ? 'ring-2 ring-inset ring-black' : ''}`}>
                <span className={`font-bold ${i + 1 === 3 ? 'text-black' : 'text-gray-300'}`}>{i + 1}</span>
                {i + 1 === 3 && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-blue-500 rounded-full"></div>
                    <div className="h-1.5 w-2/3 bg-amber-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agenda Side */}
      <div className="w-full lg:w-96 space-y-6">
        <div className="flex items-center justify-between px-2">
          <h4 className="font-bold uppercase flex items-center gap-2">
            <Clock size={18} /> Próximos de Hoje
          </h4>
          <button className="text-blue-600 border-none bg-transparent hover:underline"><Plus size={18} /></button>
        </div>
        
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-[#141414]/10 text-center">
              <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-medium">Sem agendamentos para hoje.</p>
            </div>
          ) : (
            appointments.map(app => (
              <motion.div 
                key={app.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-5 rounded-2xl border border-[#141414]/10 shadow-sm flex gap-4"
              >
                <div className="flex flex-col items-center justify-center bg-gray-100 rounded-xl px-3 py-2 min-w-[60px]">
                  <p className="text-[10px] font-black uppercase text-gray-400">08:30</p>
                  <p className="text-sm font-black">AM</p>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h5 className="font-bold text-sm truncate uppercase">{app.customerName}</h5>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                    <Car size={10} /> {app.vehicleInfo}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded uppercase">{app.serviceType}</span>
                    <button className="text-[10px] font-bold text-gray-400 hover:text-black">EDITAR</button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="p-6 bg-black text-white rounded-2xl shadow-xl space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-widest text-white/50">Lembrete de Hoje</h4>
          <p className="text-sm font-medium">Você tem 4 serviços críticos agendados para este período da manhã. Verifique o estoque de óleos.</p>
          <button className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors uppercase">
            Verificar Inventário
          </button>
        </div>
      </div>
    </div>
  );
}
