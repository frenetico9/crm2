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
}
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// REUSABLE COMPONENTS
const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/', label: 'Dashboard', icon: HomeIcon },
        { path: '/leads', label: 'Leads', icon: UsersIcon },
        { path: '/properties', label: 'Imóveis', icon: BuildingIcon },
        { path: '/agenda', label: 'Agenda', icon: CalendarIcon },
    ];

    const NavLinkItem: React.FC<{ path: string, label: string, icon: React.FC<any> }> = ({ path, label, icon: Icon }) => (
        <Link
            to={path}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === path
                    ? 'bg-brand-accent text-white'
                    : 'text-gray-300 hover:bg-blue-700 hover:text-white'
            }`}
        >
            <Icon className="h-5 w-5" />
            <span className="hidden md:inline">{label}</span>
        </Link>
    );

    const BottomNavItem: React.FC<{ path: string, label: string, icon: React.FC<any> }> = ({ path, label, icon: Icon }) => (
        <Link
            to={path}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors ${
                location.pathname === path ? 'text-brand-primary' : 'text-gray-500'
            }`}
        >
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-xs">{label}</span>
        </Link>
    );

    return (
        <>
            {/* Desktop Header */}
            <header className="hidden md:flex bg-brand-primary text-white shadow-lg sticky top-0 z-40">
                <div className="container mx-auto flex items-center justify-between p-4">
                    <Link to="/" className="text-xl font-bold flex items-center gap-2">
                       <PieChartIcon className="h-7 w-7"/> 
                       <span>Corretor AI</span>
                    </Link>
                    <nav className="flex items-center space-x-1">
                        {navLinks.map(link => <NavLinkItem key={link.path} {...link} />)}
                        {currentUser && (
                             <div className="relative" ref={menuRef}>
                                <button onClick={() => setIsProfileMenuOpen(p => !p)} className="flex items-center gap-2 ml-4 p-1 rounded-md hover:bg-blue-700 transition-colors">
                                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-9 w-9 rounded-full border-2 border-brand-accent" />
                                     <span className="text-white font-medium hidden lg:inline">{currentUser.name}</span>
                                     <ChevronDownIcon className={`h-5 w-5 text-white hidden lg:inline transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-brand-text">
                                        <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100">
                                            <UsersIcon className="h-4 w-4"/> Meu Perfil
                                        </Link>
                                        <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                                            <LogOutIcon className="h-4 w-4"/> Sair
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* Mobile Bottom Nav */}
             <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg z-40 flex justify-around">
                 {navLinks.map(link => <BottomNavItem key={link.path} {...link} />)}
             </nav>
        </>
    );
};
const PageContainer: React.FC<{ title: string; children: React.ReactNode; showBackButton?: boolean; actions?: React.ReactNode; noPadding?: boolean }> = ({ title, children, showBackButton = false, actions, noPadding = false }) => {
    const navigate = useNavigate();
    return (
        <main className={`container mx-auto mb-16 md:mb-0 ${noPadding ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
            <div className={`${noPadding ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {showBackButton && (
                            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                                <ChevronLeftIcon className="h-6 w-6 text-brand-text" />
                            </button>
                        )}
                        <h1 className="text-2xl sm:text-3xl font-bold text-brand-text">{title}</h1>
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            </div>
            {children}
        </main>
    );
};
const StatusPill: React.FC<{ status: LeadStatus | PropertyStatus }> = ({ status }) => {
    const colorMap: Record<string, string> = {
        [LeadStatus.Novo]: 'bg-blue-100 text-blue-800',
        [LeadStatus.EmNegociacao]: 'bg-yellow-100 text-yellow-800',
        [LeadStatus.Visitou]: 'bg-purple-100 text-purple-800',
        [LeadStatus.Fechado]: 'bg-green-100 text-green-800',
        [LeadStatus.Perdido]: 'bg-red-100 text-red-800',
        [PropertyStatus.Disponivel]: 'bg-green-100 text-green-800',
        [PropertyStatus.Vendido]: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${colorMap[status]}`}>{status}</span>;
};
const LeadCard: React.FC<{ lead: Lead; }> = ({ lead }) => {
    const { agents } = useAuth();
    const agent = agents.find(a => a.id === lead.agentId);
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/leads/${lead.id}`)} className="bg-white rounded-lg shadow-md p-4 flex flex-col cursor-pointer transition-shadow hover:shadow-lg">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-bold text-brand-text text-lg">{lead.name}</h3>
                    <p className="text-sm text-brand-text-light">{lead.email}</p>
                </div>
                <StatusPill status={lead.status}/>
            </div>
            <div className="flex items-center justify-between text-sm text-brand-text-light mb-3">
                <div className="flex items-center gap-1 font-semibold text-yellow-500">
                    <StarIcon className="h-4 w-4 fill-current"/>
                    <span>{lead.score} Pontos</span>
                </div>
                <span>Último Contato: {format(new Date(lead.lastContact), 'dd/MM/yy', { locale: ptBR })}</span>
            </div>
            <div className="border-t pt-3 mt-auto flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    {agent && <img src={agent.avatarUrl} alt={agent.name} className="h-8 w-8 rounded-full" />}
                    <span className="text-sm font-medium text-brand-text">{agent?.name}</span>
                </div>
                <button className="text-brand-primary font-semibold text-sm">
                    Ver Detalhes
                </button>
            </div>
        </div>
    );
};
const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
    const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
            <img src={property.images[0]} alt={property.title} className="w-full h-48 object-cover"/>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-brand-text text-lg leading-tight">{property.title}</h3>
                    <StatusPill status={property.status} />
                </div>
                <p className="text-sm text-brand-text-light mb-4 flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4"/>
                    {property.location.bairro}, {property.location.cidade}
                </p>
                <div className="mt-auto space-y-3">
                     <p className="text-2xl font-extrabold text-brand-primary">{formatPrice(property.price)}</p>
                    <div className="flex justify-between text-sm text-brand-text-light border-t pt-3">
                        <span>{property.bedrooms} {property.bedrooms !== 1 ? 'quartos' : 'quarto'}</span>
                        <span>{property.bathrooms} {property.bathrooms !== 1 ? 'banheiros' : 'banheiro'}</span>
                        <span>{property.garageSpaces} {property.garageSpaces !== 1 ? 'vagas' : 'vaga'}</span>
                        <span>{property.area} m²</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
const FilterButton: React.FC<{ label: string; active?: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${active ? 'bg-brand-primary text-white' : 'bg-white text-brand-text-light hover:bg-gray-100'}`}>
        {label}
    </button>
);


// AUTH PAGES & LAYOUT
const AuthLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
            <div className="text-center mb-8">
                <PieChartIcon className="h-12 w-12 mx-auto text-brand-primary" />
                <h1 className="text-3xl font-bold text-brand-text mt-2">Corretor AI</h1>
                <p className="text-brand-text-light">{title}</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                {children}
            </div>
        </div>
    </div>
);

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'Falha no login. Verifique suas credenciais.');
        }
    };

    return (
        <AuthLayout title="Acesse sua conta">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brand-text-light">Email</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div>
                    <label htmlFor="password_login" className="block text-sm font-medium text-brand-text-light">Senha</label>
                    <input type="password" id="password_login" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div className="flex items-center justify-between">
                    <Link to="/forgot-password"className="text-sm text-brand-primary hover:underline">Esqueceu a senha?</Link>
                </div>
                <div>
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent">Entrar</button>
                </div>
            </form>
            <p className="mt-6 text-center text-sm text-brand-text-light">
                Não tem uma conta?{' '}
                <Link to="/register" className="font-medium text-brand-primary hover:underline">Cadastre-se</Link>
            </p>
        </AuthLayout>
    );
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await register(name, email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Não foi possível realizar o cadastro.');
        }
    };

    return (
        <AuthLayout title="Crie sua conta de corretor">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-brand-text-light">Nome Completo</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div>
                    <label htmlFor="email_register" className="block text-sm font-medium text-brand-text-light">Email</label>
                    <input type="email" id="email_register" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div>
                    <label htmlFor="password_register" className="block text-sm font-medium text-brand-text-light">Senha</label>
                    <input type="password" id="password_register" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div>
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent">Criar Conta</button>
                </div>
            </form>
            <p className="mt-6 text-center text-sm text-brand-text-light">
                Já possui uma conta?{' '}
                <Link to="/login" className="font-medium text-brand-primary hover:underline">Acesse aqui</Link>
            </p>
        </AuthLayout>
    );
};

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(`Se um usuário com o email ${email} existir, um link de redefinição de senha foi enviado.`);
    };

    return (
        <AuthLayout title="Recuperar Senha">
            <form onSubmit={handleSubmit} className="space-y-6">
                {message && <p className="bg-green-100 text-green-700 p-3 rounded-md text-sm">{message}</p>}
                <div>
                    <label htmlFor="email_forgot" className="block text-sm font-medium text-brand-text-light">Email</label>
                    <input type="email" id="email_forgot" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div>
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent">Enviar Link</button>
                </div>
            </form>
            <p className="mt-6 text-center text-sm text-brand-text-light">
                Lembrou a senha?{' '}
                <Link to="/login" className="font-medium text-brand-primary hover:underline">Voltar para o login</Link>
            </p>
        </AuthLayout>
    );
};

// PAGES & MAIN LOGIC

const ProfilePage = () => {
    const { currentUser, updateCurrentUser } = useAuth();
    const [name, setName] = useState(currentUser?.name || '');
    const [phone, setPhone] = useState(currentUser?.phone || '');
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if(currentUser) {
            setName(currentUser.name);
            setPhone(currentUser.phone || '');
            setAvatarUrl(currentUser.avatarUrl);
        }
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            await updateCurrentUser({ name, phone, avatarUrl });
            setMessage('Perfil atualizado com sucesso!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Falha ao atualizar o perfil.');
        }
    };

    if (!currentUser) return null;

    return (
        <PageContainer title="Meu Perfil" showBackButton>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {message && <p className="bg-green-100 text-green-700 p-3 rounded-md text-sm">{message}</p>}
                    <div className="flex items-center space-x-6">
                        <img src={avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
                        <div className="flex-grow">
                            <label htmlFor="avatarUrl" className="block text-sm font-medium text-brand-text-light">URL da Foto de Perfil</label>
                            <input type="text" id="avatarUrl" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-brand-text-light">Nome Completo</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-brand-text-light">Email</label>
                        <input type="email" id="email" value={currentUser.email} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-brand-text-light">Telefone</label>
                        <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                        <button type="submit" className="bg-brand-primary text-white px-6 py-2 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </PageContainer>
    );
};

const LeadsListPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<LeadStatus | 'Todos'>('Todos');

    const filteredLeads = useMemo(() => {
        return mockLeads
            .filter(lead => activeFilter === 'Todos' || lead.status === activeFilter)
            .filter(lead => lead.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, activeFilter]);

    const filters: (LeadStatus | 'Todos')[] = ['Todos', LeadStatus.Novo, LeadStatus.EmNegociacao, LeadStatus.Visitou, LeadStatus.Fechado, LeadStatus.Perdido];

    return (
        <PageContainer title="Leads" actions={
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar lead..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-brand-primary focus:outline-none w-40 sm:w-auto"
                    />
                </div>
                <button
                    onClick={() => navigate('/leads/new')}
                    className="bg-brand-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Novo Lead</span>
                </button>
            </div>
        }>
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                 <FilterIcon className="h-5 w-5 text-brand-text-light flex-shrink-0"/>
                {filters.map(filter => (
                    <FilterButton
                        key={filter}
                        label={filter}
                        active={activeFilter === filter}
                        onClick={() => setActiveFilter(filter)}
                    />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} />
                ))}
            </div>
        </PageContainer>
    );
};

const NewLeadPage = () => {
    const navigate = useNavigate();
    const { agents, currentUser } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [agentId, setAgentId] = useState(currentUser?.id || agents[0]?.id || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newLead: Lead = {
            id: `lead-${Date.now()}`,
            name,
            email,
            phone,
            agentId,
            status: LeadStatus.Novo,
            score: Math.floor(Math.random() * 30) + 50,
            lastContact: new Date().toISOString().split('T')[0],
            interest: {
                type: [],
                bairro: [],
                priceRange: [0, 0],
            },
        };

        mockLeads.unshift(newLead);
        navigate('/leads');
    };

    return (
        <PageContainer title="Adicionar Novo Lead" showBackButton>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-brand-text-light">Nome Completo</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-brand-text-light">Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-brand-text-light">Telefone</label>
                        <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="agent" className="block text-sm font-medium text-brand-text-light">Corretor Responsável</label>
                        <select id="agent" value={agentId} onChange={e => setAgentId(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                            <option value="" disabled>Selecione um corretor</option>
                            {agents.map(agent => (
                                <option key={agent.id} value={agent.id}>{agent.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button type="button" onClick={() => navigate('/leads')} className="px-6 py-2 text-sm font-medium text-brand-text bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-brand-primary text-white px-6 py-2 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors">
                            Salvar Lead
                        </button>
                    </div>
                </form>
            </div>
        </PageContainer>
    );
};

const AISuggestions: React.FC<{ lead: Lead }> = ({ lead }) => {
    const [suggestedIds, setSuggestedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSuggestions = async () => {
            setLoading(true);
            setError('');
            try {
                const ids = await getPropertySuggestions(lead, mockProperties);
                setSuggestedIds(ids);
            } catch (err) {
                setError('Falha ao buscar sugestões da IA.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [lead]);

    const suggestedProperties = useMemo(() => {
        return mockProperties.filter(p => suggestedIds.includes(p.id));
    }, [suggestedIds]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h3 className="text-lg font-bold text-brand-text mb-4 flex items-center gap-2">
                <BotIcon className="h-6 w-6 text-brand-primary"/>
                Sugestões da IA para {lead.name}
            </h3>
            {loading && <div className="flex justify-center items-center h-48"><p>Analisando perfil...</p></div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && (
                <div className="space-y-4">
                    {suggestedProperties.length > 0 ? (
                        suggestedProperties.map(prop => (
                            <div key={prop.id} className="flex gap-4 p-2 rounded-lg hover:bg-gray-50">
                                <img src={prop.images[0]} alt={prop.title} className="w-24 h-24 object-cover rounded-md"/>
                                <div>
                                    <p className="font-semibold text-brand-text">{prop.title}</p>
                                    <p className="text-sm text-brand-text-light">{prop.location.bairro}</p>
                                    <p className="text-sm font-bold text-brand-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.price)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-brand-text-light">Nenhum imóvel compatível encontrado.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const WhatsappComposer: React.FC<{ lead: Lead }> = ({ lead }) => {
    const templates = useMemo(() => [
        { name: "Saudação", text: `Olá, ${lead.name.split(' ')[0]}! Tudo bem? Vi que demonstrou interesse em nossos imóveis e gostaria de ajudar.` },
        { name: "Follow-up", text: `Olá, ${lead.name.split(' ')[0]}. Passando para saber se conseguiu avaliar as opções de imóveis que enviei.` },
        { name: "Agendar Visita", text: `Olá, ${lead.name.split(' ')[0]}. Qual seria o melhor dia e horário para agendarmos uma visita?` }
    ], [lead.name]);

    const [message, setMessage] = useState(templates[0].text);

    useEffect(() => {
        setMessage(templates[0].text);
    }, [lead, templates]);

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMessage(e.target.value);
    };

    const openWhatsApp = () => {
        const phone = lead.phone.replace(/\D/g, '');
        const fullPhone = phone.length > 11 ? phone : `55${phone}`;
        const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-brand-text mb-4 flex items-center gap-2">
                <WhatsappIcon className="h-6 w-6 text-green-500"/>
                Enviar WhatsApp
            </h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="template" className="block text-sm font-medium text-brand-text-light mb-1">Usar modelo</label>
                    <select id="template" onChange={handleTemplateChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary">
                        {templates.map(t => <option key={t.name} value={t.text}>{t.name}</option>)}
                    </select>
                </div>
                <div className="flex-grow flex flex-col">
                    <label htmlFor="message" className="block text-sm font-medium text-brand-text-light mb-1">Mensagem</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md flex-grow focus:ring-brand-primary focus:border-brand-primary"
                        rows={6}
                    />
                </div>
                <div className="flex justify-end">
                    <button onClick={openWhatsApp} className="bg-green-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors">
                        <WhatsappIcon className="h-5 w-5" />
                        Enviar via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

const LeadDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { agents } = useAuth();
    const lead = mockLeads.find(l => l.id === id);
    const agent = agents.find(a => a.id === lead?.agentId);
    const leadInteractions = mockInteractions.slice(0, 2); // Mock: just show some interactions

    if (!lead) {
        return <PageContainer title="Lead não encontrado" showBackButton>Lead não encontrado.</PageContainer>;
    }

    const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

    return (
        <PageContainer title={lead.name} showBackButton>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Lead Details & Interactions */}
                <div className="lg:col-span-2 space-y-6">
                     {/* Details Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                         <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-brand-text">{lead.name}</h2>
                                <p className="text-brand-text-light">{lead.email} &bull; {lead.phone}</p>
                            </div>
                            <StatusPill status={lead.status} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-brand-text-light">Pontuação</p>
                                <p className="font-bold text-lg text-brand-primary">{lead.score}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-brand-text-light">Corretor</p>
                                <p className="font-bold text-lg text-brand-text">{agent?.name}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                                <p className="text-sm text-brand-text-light">Orçamento</p>
                                <p className="font-bold text-lg text-brand-text">{formatPrice(lead.interest.priceRange[0])} - {formatPrice(lead.interest.priceRange[1])}</p>
                            </div>
                        </div>
                        <div className="mt-4 border-t pt-4">
                            <h4 className="font-semibold text-brand-text mb-2">Interesses</h4>
                            <div className="flex flex-wrap gap-2">
                                {lead.interest.type.map(t => <span key={t} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{t}</span>)}
                                {lead.interest.bairro.map(b => <span key={b} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{b}</span>)}
                            </div>
                        </div>
                    </div>

                     {/* Interactions Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold text-brand-text mb-4">Últimas Interações</h3>
                        <ul className="space-y-4">
                            {leadInteractions.map(interaction => (
                                <li key={interaction.id} className="flex gap-4">
                                    <div className="flex-shrink-0 bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center">
                                        {interaction.type === 'WhatsApp' && <MessageCircleIcon className="h-5 w-5 text-green-500" />}
                                        {interaction.type === 'Email' && <MailIcon className="h-5 w-5 text-red-500" />}
                                        {interaction.type === 'Ligação' && <PhoneIcon className="h-5 w-5 text-blue-500" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-brand-text">{interaction.type} - <span className="font-normal text-brand-text-light">{format(new Date(interaction.date), 'dd/MM/yyyy', { locale: ptBR })}</span></p>
                                        <p className="text-brand-text-light">{interaction.content}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* WhatsApp Composer */}
                    <WhatsappComposer lead={lead} />
                </div>

                {/* Right Column: AI Suggestions */}
                <div className="lg:col-span-1">
                    <AISuggestions lead={lead} />
                </div>
            </div>
        </PageContainer>
    );
};
const PropertiesListPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<PropertyStatus | 'Todos'>('Todos');

    const filteredProperties = useMemo(() => {
        return mockProperties
            .filter(p => activeFilter === 'Todos' || p.status === activeFilter)
            .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, activeFilter]);

    const filters: (PropertyStatus | 'Todos')[] = ['Todos', PropertyStatus.Disponivel, PropertyStatus.EmNegociacao, PropertyStatus.Vendido];

    return (
        <PageContainer title="Imóveis" actions={
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar imóvel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
            </div>
        }>
            <div className="flex items-center gap-2 mb-6">
                <FilterIcon className="h-5 w-5 text-brand-text-light"/>
                {filters.map(filter => (
                    <FilterButton
                        key={filter}
                        label={filter}
                        active={activeFilter === filter}
                        onClick={() => setActiveFilter(filter)}
                    />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </div>
        </PageContainer>
    );
};

// DASHBOARD COMPONENTS
const KpiCard: React.FC<{ title: string; value: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; description: string }> = ({ title, value, icon: Icon, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-brand-accent/20 p-3 rounded-full">
            <Icon className="h-6 w-6 text-brand-primary" />
        </div>
        <div>
            <p className="text-sm text-brand-text-light">{title}</p>
            <p className="text-2xl font-bold text-brand-text">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    </div>
);
const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
        <h3 className="text-lg font-bold text-brand-text mb-4">{title}</h3>
        {children}
    </div>
);
const ConversionFunnelChart: React.FC<{ data: { stage: string; value: number }[] }> = ({ data }) => {
    if (!data.length) return null;
    const maxValue = data[0].value;
    const colors = ['#0052CC', '#4C9AFF', '#B3D4FF', '#EBF5FF'];

    return (
        <div className="flex flex-col items-center space-y-1 w-full h-80 justify-center">
            {data.map((item, index) => {
                const prevValue = index > 0 ? data[index - 1].value : maxValue;
                const percentage = maxValue > 0 ? (item.value / maxValue * 100).toFixed(1) : 0;
                const dropOff = prevValue > 0 ? ((prevValue - item.value) / prevValue * 100).toFixed(1) : 0;

                return (
                    <div key={item.stage} className="flex flex-col items-center">
                        <div className="text-sm font-semibold text-brand-text">{item.stage} ({item.value})</div>
                        <div className="relative" style={{ width: `${20 + (item.value / maxValue * 80)}%`, minWidth: '80px'}}>
                            <div style={{ backgroundColor: colors[index % colors.length] }} className="h-10 rounded-sm flex items-center justify-center text-white font-bold text-sm">
                                {percentage}%
                            </div>
                        </div>
                        {index > 0 && (
                            <div className="text-xs text-red-500 mt-1">
                                <span>▼</span> {dropOff}% drop-off
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
const VisitsTrendChart: React.FC<{ data: { day: string; visits: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.visits), 0) || 1;
    return (
        <div className="h-80 flex items-end space-x-2 px-4 pt-4">
             {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className="w-full h-full flex items-end">
                        <div 
                            className="w-3/4 mx-auto bg-brand-primary rounded-t-md hover:bg-brand-accent transition-all duration-300" 
                            style={{ height: `${(d.visits / maxValue) * 90}%` }}
                            title={`${d.visits} visitas`}
                        >
                            <div className="text-center text-xs text-white opacity-0 hover:opacity-100 font-bold">{d.visits}</div>
                        </div>
                    </div>
                    <div className="text-xs text-brand-text-light mt-2">{d.day}</div>
                </div>
             ))}
        </div>
    );
};
const PropertyTypePieChart: React.FC<{ data: { type: string; value: number }[] }> = ({ data }) => {
    const colors = ['#0052CC', '#4C9AFF', '#00B8D9', '#B3D4FF'];
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
        <div className="h-80 flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="relative w-48 h-48">
                 <svg viewBox="0 0 36 36" className="w-full h-full">
                    {data.reduce((acc, item, index) => {
                        const percentage = (item.value / total) * 100;
                        const offset = acc.offset;
                        acc.offset += percentage;
                        return {
                            ...acc,
                            paths: [
                                ...acc.paths,
                                <circle
                                    key={item.type}
                                    cx="18" cy="18" r="15.9155"
                                    fill="transparent"
                                    stroke={colors[index % colors.length]}
                                    strokeWidth="3.8"
                                    strokeDasharray={`${percentage} ${100 - percentage}`}
                                    strokeDashoffset={`-${offset}`}
                                />
                            ]
                        }
                    }, { offset: 0, paths: [] }).paths}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-brand-text font-bold text-2xl">{total}</div>
            </div>
            <div className="flex flex-col space-y-2">
                 {data.map((item, index) => (
                    <div key={item.type} className="flex items-center text-sm">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
                        <span className="text-brand-text-light">{item.type}:</span>
                        <span className="font-semibold text-brand-text ml-1">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
const DashboardPage = () => {
    const { currentUser } = useAuth();
    const dashboardData = useMemo(() => {
        const totalLeads = mockLeads.length;
        const availableProperties = mockProperties.filter(p => p.status === PropertyStatus.Disponivel).length;
        const totalVisits = mockVisits.length;
        
        const closedLeadsCount = mockLeads.filter(l => l.status === LeadStatus.Fechado).length;
        const activeLeadsCount = mockLeads.filter(l => l.status !== LeadStatus.Novo && l.status !== LeadStatus.Perdido).length;
        const conversionRate = activeLeadsCount > 0 ? (closedLeadsCount / activeLeadsCount) * 100 : 0;

        const leadsByStatus = mockLeads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {} as { [key in LeadStatus]: number });

        const conversionFunnelData = [
            { stage: LeadStatus.Novo, value: leadsByStatus[LeadStatus.Novo] || 0 },
            { stage: LeadStatus.EmNegociacao, value: leadsByStatus[LeadStatus.EmNegociacao] || 0 },
            { stage: LeadStatus.Visitou, value: leadsByStatus[LeadStatus.Visitou] || 0 },
            { stage: LeadStatus.Fechado, value: leadsByStatus[LeadStatus.Fechado] || 0 },
        ];
        
        const today = new Date();
        const startOfTodayWeek = _startOfWeek(today, { weekStartsOn: 1 });
        const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        const visitsTrendData = weekDays.map((day, index) => {
            const date = addDays(startOfTodayWeek, index);
            const visits = mockVisits.filter(v => getDay(v.start) === getDay(date)).length;
            return { day, visits };
        });

        const propertiesByType = Object.values(PropertyType).map(type => ({
            type,
            value: mockProperties.filter(p => p.type === type).length,
        })).filter(item => item.value > 0);

        return { totalLeads, availableProperties, conversionRate, totalVisits, conversionFunnelData, visitsTrendData, propertiesByType };
    }, []);

    return (
        <PageContainer title={`Olá, ${currentUser?.name.split(' ')[0]}!`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <KpiCard title="Total de Leads" value={String(dashboardData.totalLeads)} icon={UsersIcon} description="Leads no funil" />
                <KpiCard title="Imóveis Disponíveis" value={String(dashboardData.availableProperties)} icon={BuildingIcon} description="Prontos para venda" />
                <KpiCard title="Taxa de Conversão" value={`${dashboardData.conversionRate.toFixed(1)}%`} icon={TrendingUpIcon} description="De negociação para fechado" />
                <KpiCard title="Visitas na Semana" value={String(dashboardData.totalVisits)} icon={CalendarIcon} description="Agendamentos da semana" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Funil de Conversão de Leads">
                    <ConversionFunnelChart data={dashboardData.conversionFunnelData} />
                </ChartContainer>
                <ChartContainer title="Visitas na Semana">
                    <VisitsTrendChart data={dashboardData.visitsTrendData} />
                </ChartContainer>
                 <div className="lg:col-span-2">
                    <ChartContainer title="Imóveis por Tipo">
                        <PropertyTypePieChart data={dashboardData.propertiesByType} />
                    </ChartContainer>
                </div>
            </div>
        </PageContainer>
    );
};
const _startOfWeek = (date: Date, options?: { weekStartsOn?: number; locale?: object }): Date => {
    const d = new Date(date);
    // locale is ignored but included in signature to match usage
    const weekStartsOn = options?.weekStartsOn ?? 0;
    const day = d.getDay();
    const diff = (day - weekStartsOn + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

interface NewVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (visit: Visit) => void;
    agents: Agent[];
    leads: Lead[];
    properties: Property[];
    currentUser: Agent;
}
const NewVisitModal: React.FC<NewVisitModalProps> = ({ isOpen, onClose, onSave, agents, leads, properties, currentUser }) => {
    const [title, setTitle] = useState('');
    const [leadId, setLeadId] = useState('');
    const [propertyId, setPropertyId] = useState('');
    const [agentId, setAgentId] = useState(currentUser.id);
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState(format(new Date(), 'HH:mm'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endTime, setEndTime] = useState(format(addDays(new Date(), 1), 'HH:mm'));

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);
        if (!title || !leadId || !propertyId || !agentId || isNaN(start.getTime()) || isNaN(end.getTime())) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }
        if (end <= start) {
            alert("A data/hora final deve ser posterior à data/hora inicial.");
            return;
        }

        onSave({
            id: `visit-${Date.now()}`,
            title,
            start,
            end,
            agentId,
            leadId,
            propertyId,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h2 className="text-2xl font-bold text-brand-text">Agendar Nova Visita</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="h-6 w-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-brand-text-light">Título do Evento</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full input-style" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="leadId" className="block text-sm font-medium text-brand-text-light">Lead</label>
                           <select id="leadId" value={leadId} onChange={e => setLeadId(e.target.value)} required className="mt-1 block w-full input-style">
                               <option value="" disabled>Selecione o lead</option>
                               {leads.map(lead => <option key={lead.id} value={lead.id}>{lead.name}</option>)}
                           </select>
                        </div>
                        <div>
                           <label htmlFor="propertyId" className="block text-sm font-medium text-brand-text-light">Imóvel</label>
                           <select id="propertyId" value={propertyId} onChange={e => setPropertyId(e.target.value)} required className="mt-1 block w-full input-style">
                               <option value="" disabled>Selecione o imóvel</option>
                               {properties.filter(p=>p.status === PropertyStatus.Disponivel).map(prop => <option key={prop.id} value={prop.id}>{prop.title}</option>)}
                           </select>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-brand-text-light">Data de Início</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full input-style" />
                        </div>
                         <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-brand-text-light">Hora de Início</label>
                            <input type="time" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} required className="mt-1 block w-full input-style" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-brand-text-light">Data de Fim</label>
                            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1 block w-full input-style" />
                        </div>
                         <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-brand-text-light">Hora de Fim</label>
                            <input type="time" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} required className="mt-1 block w-full input-style" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="agentId" className="block text-sm font-medium text-brand-text-light">Corretor</label>
                        <select id="agentId" value={agentId} onChange={e => setAgentId(e.target.value)} required className="mt-1 block w-full input-style">
                           {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                       </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 mt-6 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-brand-text bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-brand-primary text-white px-6 py-2 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors">
                            Salvar Visita
                        </button>
                    </div>
                </form>
            </div>
            <style>{`.input-style { padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline-offset: 2px; } .input-style:focus { outline: 2px solid transparent; --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); --tw-ring-color: #0052CC; }`}</style>
        </div>
    );
};

const AgendaPage = () => {
    const { agents, currentUser } = useAuth();
    const [visits, setVisits] = useState<Visit[]>(mockVisits);
    const [selectedEvent, setSelectedEvent] = useState<Visit | undefined>(undefined);
    const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    const weekStart = useMemo(() => _startOfWeek(currentDate, { locale: ptBR, weekStartsOn: 1 }), [currentDate]);
    const weekEnd = useMemo(() => endOfWeek(currentDate, { locale: ptBR, weekStartsOn: 1 }), [currentDate]);
    const days = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

    const eventsByDay = useMemo(() => {
        const grouped: { [key: string]: Visit[] } = {};
        days.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            grouped[dayKey] = visits
                .filter(visit => isSameDay(visit.start, day))
                .sort((a, b) => a.start.getTime() - b.start.getTime());
        });
        return grouped;
    }, [days, visits]);

    const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const goToPrevWeek = () => setCurrentDate(addWeeks(currentDate, -1));
    const goToToday = () => setCurrentDate(new Date());

    const handleCloseModal = () => setSelectedEvent(undefined);
    
    const handleSaveNewVisit = (newVisit: Visit) => {
        setVisits(prev => [...prev, newVisit]);
        setIsNewEventModalOpen(false);
    };

    const agentColors: { [key: string]: string } = {
        'agent-1': 'bg-blue-500 hover:bg-blue-600',
        'agent-2': 'bg-green-500 hover:bg-green-600',
        'agent-3': 'bg-purple-500 hover:bg-purple-600',
    };
    
    const weekHeader = useMemo(() => {
        const startMonth = format(weekStart, 'MMMM', { locale: ptBR });
        const endMonth = format(weekEnd, 'MMMM', { locale: ptBR });
        if (startMonth === endMonth) {
            return `${format(weekStart, 'd', { locale: ptBR })} - ${format(weekEnd, 'd', { locale: ptBR })} de ${endMonth} de ${format(weekEnd, 'yyyy', { locale: ptBR })}`;
        }
        return `${format(weekStart, 'd', { locale: ptBR })} de ${startMonth} - ${format(weekEnd, 'd', { locale: ptBR })} de ${endMonth} de ${format(weekEnd, 'yyyy', { locale: ptBR })}`;
    }, [weekStart, weekEnd]);

    return (
        <PageContainer title="Agenda" actions={
             <button onClick={() => setIsNewEventModalOpen(true)} className="bg-brand-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition">
                <PlusIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Nova Visita</span>
            </button>
        }>
            <div className="bg-white p-4 rounded-lg shadow-md">
                {/* Week Navigation */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button onClick={goToPrevWeek} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Semana anterior">
                            <ChevronLeftIcon className="h-5 w-5 text-brand-text-light" />
                        </button>
                        <button onClick={goToNextWeek} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Próxima semana">
                            <ChevronRightIcon className="h-5 w-5 text-brand-text-light" />
                        </button>
                        <button onClick={goToToday} className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-100 transition-colors">
                            Hoje
                        </button>
                    </div>
                    <h2 className="font-bold text-brand-text text-center text-sm sm:text-lg">{weekHeader}</h2>
                    <div className="w-24 hidden sm:block"></div> {/* Spacer */}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {days.map(day => (
                        <div key={day.toString()} className="bg-brand-secondary rounded-lg p-2 min-h-[200px]">
                            <div className={`text-center mb-2 font-semibold ${isToday(day) ? 'text-brand-primary' : 'text-brand-text-light'}`}>
                                <p className="text-xs">{format(day, 'EEE', { locale: ptBR }).toUpperCase()}</p>
                                <p className={`text-2xl mt-1 ${isToday(day) ? 'bg-brand-primary text-white rounded-full w-8 h-8 mx-auto flex items-center justify-center' : ''}`}>
                                    {format(day, 'd', { locale: ptBR })}
                                </p>
                            </div>
                            <div className="space-y-2">
                                {eventsByDay[format(day, 'yyyy-MM-dd')].map(event => (
                                    <div 
                                        key={event.id} 
                                        onClick={() => setSelectedEvent(event)}
                                        className={`p-2 rounded-md cursor-pointer text-white text-left transition-colors ${agentColors[event.agentId] || 'bg-gray-500'}`}
                                        role="button"
                                        aria-label={`Ver detalhes de ${event.title}`}
                                    >
                                        <p className="font-semibold text-xs truncate">{event.title}</p>
                                        <p className="text-xs opacity-90">{format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleCloseModal}>
                     <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-brand-text">{selectedEvent.title}</h2>
                             <button onClick={handleCloseModal} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="h-5 w-5"/></button>
                        </div>
                        <div className="space-y-4 text-brand-text-light">
                            <div className="flex items-center gap-3"><ClockIcon className="h-5 w-5"/><span>{format(selectedEvent.start, 'dd/MM/yyyy HH:mm', { locale: ptBR })} - {format(selectedEvent.end, 'HH:mm', { locale: ptBR })}</span></div>
                            <div className="flex items-center gap-3"><UsersIcon className="h-5 w-5"/><span>Lead: {mockLeads.find(l => l.id === selectedEvent.leadId)?.name}</span></div>
                            <div className="flex items-center gap-3"><BuildingIcon className="h-5 w-5"/><span>Imóvel: {mockProperties.find(p => p.id === selectedEvent.propertyId)?.title}</span></div>
                            <div className="flex items-center gap-3"><StarIcon className="h-5 w-5"/><span>Corretor: {agents.find(a => a.id === selectedEvent.agentId)?.name}</span></div>
                        </div>
                    </div>
                </div>
            )}
            
            {currentUser && <NewVisitModal 
                isOpen={isNewEventModalOpen}
                onClose={() => setIsNewEventModalOpen(false)}
                onSave={handleSaveNewVisit}
                agents={agents}
                leads={mockLeads}
                properties={mockProperties}
                currentUser={currentUser}
            />}
        </PageContainer>
    );
};

// LAYOUT FOR AUTHENTICATED APP
const MainLayout = () => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-brand-secondary text-brand-text">Carregando...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <div className="min-h-screen bg-brand-secondary">
            <Header />
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/leads" element={<LeadsListPage />} />
                <Route path="/leads/new" element={<NewLeadPage />} />
                <Route path="/leads/:id" element={<LeadDetailPage />} />
                <Route path="/properties" element={<PropertiesListPage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/*" element={<MainLayout />} />
            </Routes>
        </AuthProvider>
    );
}
