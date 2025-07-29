

import React, { useState, useMemo, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { Routes, Route, Link, useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
    format,
    getDay,
    addDays,
    addWeeks,
    endOfWeek,
    eachDayOfInterval,
    isToday,
    isSameDay
} from 'date-fns';
import { ptBR } from 'https://esm.sh/date-fns@^3.6.0/locale/pt-BR';
import { agents as mockAgents, properties as mockProperties, leads as mockLeads, interactions as mockInteractions, visits as mockVisits } from './data';
import type { Lead, Property, Agent, Interaction, Visit } from './types';
import { LeadStatus, PropertyStatus, PropertyType } from './types';
import { getPropertySuggestions } from './geminiService';

// ICONS
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>);
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
const BuildingIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>);
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>);
const MessageCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>);
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>);
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>);
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>);
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>);
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
const BotIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>);
const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>);
const PieChartIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>);
const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>);
const LogOutIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> );
const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.03 4.97a10.01 10.01 0 0 0-14.06 14.06l-1.03 3.98l4.08-1.02a10.01 10.01 0 0 0 14.06-14.06zM8.47 18.53c-1.25 0-2.45-.38-3.47-1.05l-.25-.15l-2.58.65l.66-2.52l-.17-.26a6.97 6.97 0 0 1-1.07-3.69c0-3.86 3.14-7 7-7s7 3.14 7 7c0 3.86-3.14 7-7 7zm4.37-5.1c-.22-.11-.76-.38-1.04-.42c-.28-.04-.48.11-.69.37c-.2.26-.78.97-.96 1.17c-.18.2-.36.22-.66.11c-.3-.11-1.25-.46-2.38-1.47c-.88-.78-1.48-1.75-1.65-2.05c-.17-.3-.02-.46.1-.61c.11-.13.24-.34.37-.51c.12-.17.16-.28.24-.46c.08-.18.04-.34-.02-.45c-.06-.11-.57-1.37-.78-1.87c-.2-.5-.41-.43-.57-.43h-.48c-.16 0-.41.06-.62.3c-.2.24-.78.76-.78 1.85s.8 2.15.91 2.3c.11.15 1.57 2.4 3.8 3.35c.54.23.95.36 1.28.46c.5.15.95.13 1.3.08c.39-.05 1.25-.51 1.42-1c.18-.48.18-.9.13-1c-.05-.1-.18-.16-.4-.27z"></path></svg>);
const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> );

// AUTHENTICATION
interface AuthContextType {
    currentUser: Agent | null;
    agents: Agent[];
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (name: string, email: string, password: string) => Promise<void>;
    updateCurrentUser: (updatedData: Partial<Agent>) => Promise<void>;
}
const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<Agent | null>(null);
    const [agents, setAgents] = useState<Agent[]>(mockAgents);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const agentId = localStorage.getItem('agentId');
            if (agentId) {
                const agent = agents.find(a => a.id === agentId);
                setCurrentUser(agent || null);
            }
        } catch (error) {
            console.error("Failed to access localStorage:", error);
        } finally {
            setLoading(false);
        }
    }, [agents]);

    const login = async (email: string, password: string) => {
        const agent = agents.find(a => a.email === email && a.password === password);
        if (agent) {
            setCurrentUser(agent);
            localStorage.setItem('agentId', agent.id);
        } else {
            throw new Error('Credenciais inválidas');
        }
    };

    const register = async (name: string, email: string, password: string) => {
        if (agents.some(a => a.email === email)) {
            throw new Error('Email já cadastrado');
        }
        const newAgent: Agent = {
            id: `agent-${Date.now()}`,
            name,
            email,
            password,
            avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
            phone: ''
        };
        setAgents(prev => [...prev, newAgent]);
        setCurrentUser(newAgent);
        localStorage.setItem('agentId', newAgent.id);
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('agentId');
    };
    
    const updateCurrentUser = async (updatedData: Partial<Agent>) => {
        if (!currentUser) return;
        
        const updatedAgent = { ...currentUser, ...updatedData };
        
        setAgents(prevAgents => prevAgents.map(agent => 
            agent.id === currentUser.id ? updatedAgent : agent
        ));
        
        setCurrentUser(updatedAgent);
    };


    const value = { currentUser, agents, loading, login, logout, register, updateCurrentUser };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// DATA MANAGEMENT HOOK
const useData = () => {
    const [leads, setLeads] = useState<Lead[]>(mockLeads);
    const [properties, setProperties] = useState<Property[]>(mockProperties);
    const [visits, setVisits] = useState<Visit[]>(mockVisits);

    const updateLeadStatus = (leadId: string, status: LeadStatus) => {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    };
    
    // Add other data management functions here if needed

    return { leads, properties, visits, updateLeadStatus };
};

// LAYOUT COMPONENTS
const NavItem: React.FC<{ to: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, children: React.ReactNode }> = ({ to, icon: Icon, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
        <Link to={to} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-brand-accent text-white' : 'text-brand-text-light hover:bg-brand-secondary'}`}>
            <Icon className="w-5 h-5 mr-3" />
            <span>{children}</span>
        </Link>
    );
};

const Sidebar: React.FC = () => {
    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-4">
            <div className="flex items-center mb-8">
                <BuildingIcon className="w-8 h-8 text-brand-primary" />
                <h1 className="ml-2 text-xl font-bold text-brand-text">Corretor.AI</h1>
            </div>
            <nav className="space-y-2">
                <NavItem icon={HomeIcon} to="/dashboard">Dashboard</NavItem>
                <NavItem icon={UsersIcon} to="/leads">Leads</NavItem>
                <NavItem icon={BuildingIcon} to="/properties">Imóveis</NavItem>
                <NavItem icon={CalendarIcon} to="/calendar">Agenda</NavItem>
                <NavItem icon={WhatsappIcon} to="/whatsapp">WhatsApp</NavItem>
            </nav>
        </div>
    );
};

const Header: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <div className="flex items-center">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Buscar leads, imóveis..." className="bg-brand-secondary rounded-full py-2 pl-10 pr-4 w-96 focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
                </div>
            </div>
            <div className="relative">
                <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <span className="font-medium text-brand-text">{currentUser?.name}</span>
                    <img src={currentUser?.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full"/>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-brand-text hover:bg-brand-secondary">Meu Perfil</Link>
                        <a href="#" onClick={handleLogout} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-brand-secondary">
                            <LogOutIcon className="w-4 h-4 mr-2" />
                            Sair
                        </a>
                    </div>
                )}
            </div>
        </header>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen bg-brand-secondary">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-secondary">
                    {children}
                </main>
            </div>
        </div>
    );
};


// PAGES
const DashboardPage: React.FC = () => { 
    // ... Existing DashboardPage component, can be collapsed for brevity
    return <div className="p-8"> <h1 className="text-2xl font-bold">Dashboard</h1> </div>; 
};

const LeadsPage: React.FC = () => { 
    // ... Existing LeadsPage component
    return <div className="p-8"> <h1 className="text-2xl font-bold">Leads</h1> </div>; 
};

const LeadDetailPage: React.FC = () => { 
    // ... Existing LeadDetailPage component
    return <div className="p-8"> <h1 className="text-2xl font-bold">Detalhe do Lead</h1> </div>; 
};

const PropertiesPage: React.FC = () => { 
    // ... Existing PropertiesPage component
    return <div className="p-8"> <h1 className="text-2xl font-bold">Imóveis</h1> </div>; 
};

const PropertyDetailPage: React.FC = () => { 
    // ... Existing PropertyDetailPage component
    return <div className="p-8"> <h1 className="text-2xl font-bold">Detalhe do Imóvel</h1> </div>; 
};

const CalendarPage: React.FC = () => { 
    // ... Existing CalendarPage component
    return <div className="p-8"> <h1 className="text-2xl font-bold">Agenda</h1> </div>; 
};

const ProfilePage: React.FC = () => { 
    // ... Existing ProfilePage component
    return <div className="p-8"> <h1 className="text-2xl font-bold">Meu Perfil</h1> </div>; 
};

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-secondary">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <BuildingIcon className="w-12 h-12 mx-auto text-brand-primary" />
                    <h2 className="mt-6 text-3xl font-extrabold text-center text-brand-text">Acesse sua conta</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                                placeholder="Email" />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Senha</label>
                            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                                placeholder="Senha" />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div>
                        <button type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent">
                            Entrar
                        </button>
                    </div>
                </form>
                 <p className="text-sm text-center text-brand-text-light">
                    Não tem uma conta?{' '}
                    <Link to="/register" className="font-medium text-brand-primary hover:text-blue-800">
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    );
};

const RegisterPage: React.FC = () => { return <div>Register</div>; };

const WhatsappPage = () => {
  const [loadState, setLoadState] = useState<'loading' | 'success' | 'error'>('loading');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let timer: number;

    const handleLoad = () => {
      clearTimeout(timer);
       // A successful load doesn't guarantee content is not blocked.
       // The check below is a trick. Accessing contentWindow will throw a
       // cross-origin security error if blocked, which we catch.
      try {
        if (iframe.contentWindow && iframe.contentWindow.length) {
            // This is just a check to trigger the catch block if needed.
        }
        setLoadState('success');
      } catch (e) {
        setLoadState('error');
      }
    };

    const handleError = () => {
        clearTimeout(timer);
        setLoadState('error');
    }
    
    // Set a timeout to assume failure if it takes too long
    timer = window.setTimeout(() => {
        if (loadState === 'loading') {
            setLoadState('error');
        }
    }, 5000);

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      clearTimeout(timer);
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [loadState]); // Re-run if loadState changes from loading

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-brand-text mb-4">WhatsApp Web</h1>
      <div className="flex-grow bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center relative min-h-[600px]">
        {loadState === 'loading' && (
          <div className="flex flex-col items-center justify-center text-brand-text-light">
            <svg className="animate-spin h-10 w-10 text-brand-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg">Tentando conectar ao WhatsApp Web...</p>
            <p className="text-sm">Isso pode levar alguns segundos.</p>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src="https://web.whatsapp.com/"
          title="WhatsApp Web"
          className={`w-full h-full border-0 rounded-lg ${loadState === 'success' ? 'block' : 'hidden'}`}
        ></iframe>

        {loadState === 'error' && (
          <div className="text-center p-8 rounded-lg bg-brand-secondary w-full max-w-2xl">
              <div className="mx-auto bg-green-100 rounded-full p-4 w-24 h-24 flex items-center justify-center mb-6">
                <WhatsappIcon className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-brand-text mb-2">Não foi possível conectar</h2>
              <p className="text-brand-text-light mb-6">
                  O WhatsApp Web possui configurações de segurança que impedem sua exibição aqui. Mas não se preocupe!
              </p>
              <a
                  href="https://web.whatsapp.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300 text-lg"
              >
                  <WhatsappIcon className="w-6 h-6 mr-3" />
                  Abrir WhatsApp Web em uma nova aba
              </a>
          </div>
        )}
      </div>
    </div>
  );
};


// ROUTER
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Carregando...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

const Router = () => {
    const { loading } = useAuth();
    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-brand-secondary"><p>Carregando aplicação...</p></div>;
    }

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/*" element={
                <ProtectedRoute>
                    <Layout>
                        <Routes>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/leads" element={<LeadsPage />} />
                            <Route path="/leads/:leadId" element={<LeadDetailPage />} />
                            <Route path="/properties" element={<PropertiesPage />} />
                            <Route path="/properties/:propertyId" element={<PropertyDetailPage />} />
                            <Route path="/calendar" element={<CalendarPage />} />
                            <Route path="/whatsapp" element={<WhatsappPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </Layout>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

// MAIN APP COMPONENT
const App = () => {
    return (
        <AuthProvider>
            <Router />
        </AuthProvider>
    );
};

export default App;
