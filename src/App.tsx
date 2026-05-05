import React, { useState, useEffect } from 'react';
import { auth } from './lib/firebase.ts';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Calendar, 
  Users,
  BarChart3,
  LogOut, 
  LogIn,
  Settings,
  Bell,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ServiceOrders from './components/ServiceOrders';
import Scheduling from './components/Scheduling';
import Customers from './components/Customers';
import Reports from './components/Reports';

type Tab = 'dashboard' | 'inventory' | 'orders' | 'scheduling' | 'customers' | 'reports';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#E4E3E0]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#141414]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-screen bg-[#E4E3E0] flex flex-col font-sans overflow-x-hidden">
        {/* Improved Navigation for Landing */}
        <header className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-50">
           <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
              <div className="w-8 h-8 bg-[#141414] rounded flex items-center justify-center">
                <Package size={18} className="text-white" />
              </div>
              AUTOSTOCK
           </div>
           <button 
             onClick={handleLogin}
             className="bg-[#141414] text-white px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform"
           >
              Entrar
           </button>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-20 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
             <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl relative z-10"
          >
            <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white mb-8 shadow-sm">
               <Sparkles size={16} className="text-[#141414]/60" />
               <span className="text-[10px] font-black uppercase tracking-widest">Plataforma Inventário 4.0</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.85] uppercase">
              Gerencie sua oficina com <span className="text-blue-600">inteligência</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#141414]/60 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Identificação de peças por IA, controle de estoque em tempo real e cotação automatizada em uma única plataforma.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleLogin}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#141414] text-white py-5 px-10 rounded-2xl font-black text-lg hover:bg-black transition-all active:scale-95 shadow-2xl shadow-black/20"
              >
                <Zap size={20} />
                COMEÇAR AGORA
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-[#141414] py-5 px-10 rounded-2xl font-black text-lg border border-[#141414]/10 hover:bg-gray-50 transition-all">
                SOLICITAR DEMO
              </button>
            </div>
          </motion.div>

          {/* Feature Grid for Landing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl w-full">
             <LandingFeature 
               icon={<Camera size={32} className="text-blue-600" />} 
               title="Visão Computacional" 
               desc="Identifique peças instantaneamente usando a câmera do seu celular."
             />
             <LandingFeature 
               icon={<BarChart3 size={32} className="text-purple-600" />} 
               title="Cotação em Tempo Real" 
               desc="Pesquise os melhores preços do mercado web automaticamente."
             />
             <LandingFeature 
               icon={<ShieldCheck size={32} className="text-green-600" />} 
               title="Gestão Segura" 
               desc="Acompanhe todas as movimentações de estoque e ordens de serviço."
             />
          </div>
        </main>
        
        <footer className="p-12 text-center text-[#141414]/30 text-xs font-bold uppercase tracking-[0.2em] border-t border-[#141414]/5 space-y-4">
           <div>&copy; 2026 AUTOSTOCK SOLUTIONS. TODOS OS DIREITOS RESERVADOS.</div>
           <div className="flex items-center justify-center gap-6">
              <a href="#" className="hover:text-black">Privacidade</a>
              <a href="#" className="hover:text-black">Termos</a>
              <a href="#" className="hover:text-black">Ajuda</a>
           </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#E4E3E0] text-[#141414] font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-[#141414]/10 flex flex-col z-20 relative shrink-0"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tighter flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-[#141414] rounded flex items-center justify-center">
                <Package size={18} className="text-white" />
              </div>
              AUTOSTOCK
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:bg-[#141414]/5 p-2 rounded-lg"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto no-scrollbar">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Package size={20} />} 
            label="Estoque" 
            active={activeTab === 'inventory'} 
            onClick={() => setActiveTab('inventory')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<ClipboardList size={20} />} 
            label="Ordens de Serviço" 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Clientes" 
            active={activeTab === 'customers'} 
            onClick={() => setActiveTab('customers')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Calendar size={20} />} 
            label="Agendamentos" 
            active={activeTab === 'scheduling'} 
            onClick={() => setActiveTab('scheduling')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<BarChart3 size={20} />} 
            label="Relatórios" 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')} 
            collapsed={!isSidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-[#141414]/10 space-y-2">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 mb-4">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                className="w-10 h-10 rounded-full border border-[#141414]/10" 
                alt="Profile"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.displayName}</p>
                <p className="text-xs text-[#141414]/50 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-[#141414]/10 px-8 flex items-center justify-between shadow-sm relative z-10 shrink-0">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 border-l-4 border-black pl-4 uppercase">
            {activeTab === 'dashboard' && 'Visão Geral'}
            {activeTab === 'inventory' && 'Controle de Estoque'}
            {activeTab === 'orders' && 'Gerenciamento de O.S.'}
            {activeTab === 'scheduling' && 'Agendamentos'}
            {activeTab === 'customers' && 'Gestão de Clientes'}
            {activeTab === 'reports' && 'Analytics & Performance'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#141414]/5 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 hover:bg-[#141414]/5 rounded-full">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative bg-[#f5f5f5]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'inventory' && <Inventory />}
              {activeTab === 'orders' && <ServiceOrders />}
              {activeTab === 'scheduling' && <Scheduling />}
              {activeTab === 'customers' && <Customers />}
              {activeTab === 'reports' && <Reports />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, collapsed: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-[#141414] text-white shadow-lg shadow-[#141414]/20' 
          : 'text-[#141414]/60 hover:bg-[#141414]/5 hover:text-[#141414]'
      }`}
    >
      <div className={active ? 'text-white' : 'text-inherit'}>{icon}</div>
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}

function LandingFeature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-[#141414]/5 shadow-sm hover:shadow-xl hover:scale-105 transition-all">
       <div className="mb-6">{icon}</div>
       <h4 className="text-xl font-black uppercase mb-4 tracking-tighter">{title}</h4>
       <p className="text-[#141414]/50 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function Camera(props: any) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
      <circle cx="12" cy="13" r="3"></circle>
    </svg>
  );
}
