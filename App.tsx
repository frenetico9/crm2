





import React, { useState, useMemo, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { Routes, Route, Link, useParams, useNavigate, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import {
    format,
    getDay,
    addDays,
    addWeeks,
    endOfWeek,
    eachDayOfInterval,
    isToday,
    isSameDay,
    isYesterday,
    isThisYear,
    formatDistanceToNow,
    startOfWeek,
} from 'https://esm.sh/date-fns@^3.6.0';
import { ptBR } from 'https://esm.sh/date-fns@^3.6.0/locale/pt-BR';
import type { Lead, Property, Agent, Visit, WhatsappMessage, Notification } from './types';
import { LeadStatus, PropertyStatus, PropertyType } from './types';
import { getPropertySuggestions, getPropertyDescription, getWhatsappSuggestion } from './geminiService';
import { createSupabaseClient } from './supabaseClient';
import type { Session, User, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabaseClient';


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
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L14.5 9.5 22 12 14.5 14.5 12 22 9.5 14.5 2 12 9.5 9.5 12 2z"/><path d="M5 5L6 7"/><path d="M17 17L18 19"/></svg>);
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
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const DoubleCheckIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"/> <path d="M7 12l5 5l10 -10" /> <path d="M2 12l5 5m5 -5l5 -5" /> </svg> );
const BellIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const ListIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
const LayoutGridIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>;


// --- AUTHENTICATION ---
interface AuthContextType {
    session: Session | null;
    profile: Agent | null;
    loading: boolean;
    logout: () => void;
    client: SupabaseClient<Database> | null;
}
const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Agent | null>(null);
    const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            const supabaseClient = await createSupabaseClient();
            if (!supabaseClient) {
                 console.error("Falha crítica: Cliente Supabase não pôde ser criado.");
                 setLoading(false);
                 return;
            }
            setClient(supabaseClient);

            const { data: { session } } = await supabaseClient.auth.getSession();
            setSession(session);
             if (session?.user) {
                const { data: agentProfile } = await supabaseClient
                    .from('agents')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setProfile(agentProfile as Agent | null);
            }
            setLoading(false);

            const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
                setSession(session);
                 if (session?.user) {
                    setLoading(true);
                    const { data: agentProfile } = await supabaseClient
                        .from('agents')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    setProfile(agentProfile as Agent | null);
                    setLoading(false);
                } else {
                    setProfile(null);
                }
            });

            return () => subscription.unsubscribe();
        };
        
        const unsubscribePromise = initialize();
        
        return () => {
            unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
        }
    }, []);

    const logout = async () => {
        if(client) {
            await client.auth.signOut();
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-brand-secondary text-brand-text">Conectando...</div>;
    }

    if (!client) {
        return <div className="flex justify-center items-center h-screen bg-red-100 text-red-700">Erro: Não foi possível conectar ao servidor. Verifique a configuração e a conexão.</div>;
    }
    
    const value = { session, profile, loading, logout, client };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    if (!context.client) throw new Error('Supabase client not available. This should not happen.');
    return context;
};

// --- REUSABLE & UI COMPONENTS ---

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler();
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

const GlobalSearch: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<{ leads: Lead[], properties: Property[] }>({ leads: [], properties: [] });
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { profile, client } = useAuth();


    useClickOutside(searchRef, () => setIsOpen(false));

    useEffect(() => {
        const performSearch = async () => {
            if (searchTerm.length > 1 && profile) {
                const [leadsRes, propertiesRes] = await Promise.all([
                    client.from('leads').select('*').eq('agent_id', profile.id).ilike('name', `%${searchTerm}%`),
                    client.from('properties').select('*').ilike('title', `%${searchTerm}%`)
                ]);
                
                setResults({ leads: (leadsRes.data as Lead[]) || [], properties: (propertiesRes.data as Property[]) || [] });
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        const debounce = setTimeout(() => {
            performSearch();
        }, 300);

        return () => clearTimeout(debounce);

    }, [searchTerm, profile, client]);
    
    const handleSelect = (path: string) => {
        setSearchTerm('');
        setIsOpen(false);
        navigate(path);
    };

    return (
        <div className="relative w-full max-w-xs" ref={searchRef}>
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar leads, imóveis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => searchTerm.length > 1 && setIsOpen(true)}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-blue-700 text-white placeholder-gray-300 focus:bg-white focus:text-brand-text focus:outline-none"
                />
            </div>
            {isOpen && (results.leads.length > 0 || results.properties.length > 0) && (
                 <div className="absolute mt-2 w-full max-h-96 overflow-y-auto bg-white rounded-md shadow-lg z-50 text-brand-text">
                    {results.leads.length > 0 && (
                        <div>
                            <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Leads</h3>
                            <ul>
                                {results.leads.slice(0, 5).map(lead => (
                                    <li key={lead.id} onClick={() => handleSelect(`/leads/${lead.id}`)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{lead.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {results.properties.length > 0 && (
                        <div>
                            <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase border-t">Imóveis</h3>
                            <ul>
                                {results.properties.slice(0, 5).map(prop => (
                                    <li key={prop.id} onClick={() => handleSelect(`/properties/${prop.id}`)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{prop.title}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const NotificationsPanel: React.FC = () => {
    const { profile, client } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const panelRef = useRef<HTMLDivElement>(null);

    useClickOutside(panelRef, () => setIsOpen(false));
    
    useEffect(() => {
        if (!profile) return;
        
        const fetchNotifications = async () => {
            const { data } = await client
                .from('notifications')
                .select('*')
                .eq('user_id', profile.id)
                .order('timestamp', { ascending: false });
            setNotifications(data || []);
        };

        fetchNotifications();
        
        const channel = client.channel('notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` }, (payload) => {
                setNotifications(current => [payload.new as Notification, ...current]);
            })
            .subscribe();
            
        return () => {
            client.removeChannel(channel);
        };

    }, [profile, client]);


    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = async (notification: Notification) => {
        if (notification.link) navigate(notification.link);
        if (!notification.read) {
            const { data } = await client
                .from('notifications')
                .update({ read: true })
                .eq('id', notification.id)
                .select()
                .single();
            if(data) {
                setNotifications(prev => prev.map(n => n.id === notification.id ? (data as Notification) : n));
            }
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={panelRef}>
            <button onClick={() => setIsOpen(p => !p)} className="relative p-2 rounded-full hover:bg-blue-700 transition-colors">
                <BellIcon className="h-6 w-6 text-white"/>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-brand-primary"></span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 text-brand-text">
                    <div className="p-3 font-bold border-b">Notificações</div>
                    <ul className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(n => (
                            <li key={n.id} onClick={() => handleNotificationClick(n)} className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}>
                                <p className="font-semibold">{n.title}</p>
                                <p className="text-sm text-gray-600">{n.content}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(n.timestamp), { addSuffix: true, locale: ptBR })}</p>
                            </li>
                        )) : (
                            <li className="p-4 text-center text-gray-500">Nenhuma notificação.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};


const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { profile, logout } = useAuth();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickOutside(menuRef, () => setIsProfileMenuOpen(false));
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/', label: 'Dashboard', icon: HomeIcon },
        { path: '/leads', label: 'Leads', icon: UsersIcon },
        { path: '/properties', label: 'Imóveis', icon: BuildingIcon },
        { path: '/agenda', label: 'Agenda', icon: CalendarIcon },
        { path: '/whatsapp', label: 'WhatsApp', icon: MessageCircleIcon },
    ];

    const NavLinkItem: React.FC<{ path: string, label: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }> = ({ path, label, icon: Icon }) => (
        <Link
            to={path}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
                    ? 'bg-brand-accent text-white'
                    : 'text-gray-300 hover:bg-blue-700 hover:text-white'
            }`}
        >
            <Icon className="h-5 w-5" />
            <span className="hidden md:inline">{label}</span>
        </Link>
    );

    const BottomNavItem: React.FC<{ path: string, label: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }> = ({ path, label, icon: Icon }) => (
        <Link
            to={path}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors ${
                location.pathname === path || (path !== '/' && location.pathname.startsWith(path)) ? 'text-brand-primary' : 'text-gray-500'
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
                <div className="container mx-auto flex items-center justify-between p-4 gap-4">
                    <Link to="/" className="text-xl font-bold flex items-center gap-2 flex-shrink-0">
                       <PieChartIcon className="h-7 w-7"/> 
                       <span>Corretor AI</span>
                    </Link>
                     <div className="flex-grow flex justify-center">
                        <GlobalSearch />
                    </div>
                    <nav className="flex items-center space-x-1 flex-shrink-0">
                        {navLinks.map(link => <NavLinkItem key={link.path} {...link} />)}
                         <NotificationsPanel />
                        {profile && (
                             <div className="relative" ref={menuRef}>
                                <button onClick={() => setIsProfileMenuOpen(p => !p)} className="flex items-center gap-2 ml-2 p-1 rounded-md hover:bg-blue-700 transition-colors">
                                    <img src={profile.avatar_url} alt={profile.name} className="h-9 w-9 rounded-full border-2 border-brand-accent object-cover" />
                                     <span className="text-white font-medium hidden lg:inline">{profile.name.split(' ')[0]}</span>
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

const LeadCard: React.FC<{ lead: Lead; isDragging?: boolean; draggableProps?: any; agent?: Agent }> = ({ lead, isDragging, draggableProps, agent }) => {
    const navigate = useNavigate();
    return (
        <div 
             {...draggableProps}
            onClick={() => navigate(`/leads/${lead.id}`)} 
            className={`bg-white rounded-lg shadow-md p-4 flex flex-col cursor-pointer transition-shadow hover:shadow-lg ${isDragging ? 'opacity-50 shadow-2xl' : ''}`}
        >
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
                <span>Contato: {format(new Date(lead.last_contact), 'dd/MM/yy', { locale: ptBR })}</span>
            </div>
            <div className="border-t pt-3 mt-auto flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    {agent && <img src={agent.avatar_url} alt={agent.name} className="h-8 w-8 rounded-full object-cover" />}
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
    const navigate = useNavigate();
    const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

    return (
        <div onClick={() => navigate(`/properties/${property.id}`)} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col cursor-pointer">
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
                        <span>{property.garage_spaces} {property.garage_spaces !== 1 ? 'vagas' : 'vaga'}</span>
                        <span>{property.area} m²</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
const FilterButton: React.FC<{ label: string; active?: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${active ? 'bg-brand-primary text-white' : 'bg-white text-brand-text-light hover:bg-gray-100'}`}>
        {label}
    </button>
);


// --- AUTH PAGES & LAYOUT ---
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
    const { client } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const { error } = await client.auth.signInWithPassword({ email, password });
            if (error) throw error;
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
    const { client } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const { error } = await client.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin,
                    data: {
                        name: name,
                        avatar_url: `https://i.pravatar.cc/150?u=${email}`,
                    }
                }
            });
            if (error) throw error;
            setMessage('Cadastro realizado! Verifique seu e-mail para confirmar sua conta.');
        } catch (err: any) {
            setError(err.message || 'Não foi possível realizar o cadastro.');
        }
    };

    return (
        <AuthLayout title="Crie sua conta de corretor">
            <form onSubmit={handleSubmit} className="space-y-4">
                {message && <p className="bg-green-100 text-green-700 p-3 rounded-md text-sm">{message}</p>}
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
    const { client } = useAuth();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const { error } = await client.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });
            if (error) throw error;
            setMessage(`Se um usuário com o email ${email} existir, um link de redefinição de senha foi enviado.`);
        } catch(err: any) {
            setError(err.message);
        }
    };

    return (
        <AuthLayout title="Recuperar Senha">
            <form onSubmit={handleSubmit} className="space-y-6">
                {message && <p className="bg-green-100 text-green-700 p-3 rounded-md text-sm">{message}</p>}
                 {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
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

// --- PAGES & MAIN LOGIC ---

const ProfilePage = () => {
    const { profile, session, client } = useAuth();
    const [name, setName] = useState(profile?.name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if(profile) {
            setName(profile.name);
            setPhone(profile.phone || '');
            setAvatarUrl(profile.avatar_url);
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        if (!session?.user) {
            setMessage('Usuário não autenticado.');
            return;
        }

        try {
            const { error } = await client
                .from('agents')
                .update({ name, phone, avatar_url: avatarUrl })
                .eq('id', session.user.id);
            
            if(error) throw error;

            setMessage('Perfil atualizado com sucesso!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage('Falha ao atualizar o perfil: ' + error.message);
        }
    };

    if (!profile) return null;

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
                        <input type="email" id="email" value={profile.email} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
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

const LeadsKanbanView: React.FC<{ leads: Lead[], agents: Agent[] }> = ({ leads, agents }) => {
    const { client } = useAuth();
    const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, leadId: string) => {
        e.dataTransfer.setData('leadId', leadId);
        setDraggingLeadId(leadId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: LeadStatus) => {
        const leadId = e.dataTransfer.getData('leadId');
        // Optimistic update can be added here
        const { error } = await client
            .from('leads')
            .update({ status: status })
            .eq('id', leadId);

        if (error) {
            console.error("Failed to update lead status", error);
            // Revert optimistic update if it failed
        }
        setDraggingLeadId(null);
    };
    
    const columns: LeadStatus[] = [LeadStatus.Novo, LeadStatus.EmNegociacao, LeadStatus.Visitou, LeadStatus.Fechado, LeadStatus.Perdido];
    const leadsByStatus = useMemo(() => {
        const grouped: { [key in LeadStatus]?: Lead[] } = {};
        for (const lead of leads) {
            if (!grouped[lead.status]) {
                grouped[lead.status] = [];
            }
            grouped[lead.status]!.push(lead);
        }
        return grouped;
    }, [leads]);

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(status => (
                <div 
                    key={status} 
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                    className="w-72 md:w-80 lg:w-96 flex-shrink-0 bg-gray-100 rounded-lg"
                >
                    <div className="p-3 font-bold text-brand-text border-b sticky top-0 bg-gray-100 rounded-t-lg">
                        {status} <span className="text-sm font-normal text-gray-500">{leadsByStatus[status]?.length || 0}</span>
                    </div>
                    <div className="p-2 space-y-3 h-full">
                        {(leadsByStatus[status] || []).map(lead => (
                            <LeadCard 
                                key={lead.id} 
                                lead={lead}
                                agent={agents.find(a => a.id === lead.agent_id)}
                                isDragging={draggingLeadId === lead.id}
                                draggableProps={{
                                    draggable: true,
                                    onDragStart: (e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, lead.id)
                                }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};


const LeadsListPage = () => {
    const navigate = useNavigate();
    const { profile, client } = useAuth();
    const [searchParams] = useSearchParams();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [activeFilter, setActiveFilter] = useState<LeadStatus | 'Todos'>(searchParams.get('status') as LeadStatus || 'Todos');
    
    useEffect(() => {
        const status = searchParams.get('status');
        if (status) {
            setActiveFilter(status as LeadStatus);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchLeadsAndAgents = async () => {
            if (!profile) return;
            setLoading(true);
            const { data: agentsData } = await client.from('agents').select('*');
            setAgents(agentsData || []);

            let query = client.from('leads').select('*').eq('agent_id', profile.id);
            if (activeFilter !== 'Todos') {
                query = query.eq('status', activeFilter);
            }
            if(searchTerm) {
                query = query.ilike('name', `%${searchTerm}%`);
            }
            const { data: leadsData } = await query.order('created_at', { ascending: false });
            setLeads(leadsData || []);
            setLoading(false);
        };
        
        fetchLeadsAndAgents();
        
        const channel = client.channel('leads-page-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeadsAndAgents)
            .subscribe();
            
        return () => {
            client.removeChannel(channel);
        }

    }, [profile, activeFilter, searchTerm, client]);


    const filters: (LeadStatus | 'Todos')[] = ['Todos', LeadStatus.Novo, LeadStatus.EmNegociacao, LeadStatus.Visitou, LeadStatus.Fechado, LeadStatus.Perdido];

    return (
        <PageContainer title="Leads" actions={
            <div className="flex items-center gap-2 sm:gap-4">
                 <div className="bg-white rounded-full p-1 border flex items-center">
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-full ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'text-gray-500'}`}><ListIcon className="h-5 w-5"/></button>
                    <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-full ${viewMode === 'kanban' ? 'bg-brand-primary text-white' : 'text-gray-500'}`}><LayoutGridIcon className="h-5 w-5"/></button>
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
            <div className="flex items-center justify-between gap-2 mb-6 pb-2">
                 <div className="flex items-center gap-2 overflow-x-auto">
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
                <div className="relative flex-shrink-0">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-brand-primary focus:outline-none w-32 sm:w-auto"
                    />
                </div>
            </div>
            
            {loading ? <p>Carregando leads...</p> : (
                viewMode === 'list' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leads.map(lead => (
                            <LeadCard key={lead.id} lead={lead} agent={agents.find(a => a.id === lead.agent_id)} />
                        ))}
                    </div>
                ) : (
                    <LeadsKanbanView leads={leads} agents={agents} />
                )
            )}
        </PageContainer>
    );
};

const NewLeadPage = () => {
    const navigate = useNavigate();
    const { profile, client } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        
        const newLeadData: Omit<Lead, 'id' | 'created_at'> = {
            name,
            email,
            phone,
            agent_id: profile.id,
            status: LeadStatus.Novo,
            score: Math.floor(Math.random() * 30) + 50,
            last_contact: new Date().toISOString(),
            interest: {
                type: [],
                bairro: [],
                priceRange: [0, 0],
            },
        };

        const { error } = await client.from('leads').insert(newLeadData);

        if (error) {
            alert("Erro ao criar lead: " + error.message);
        } else {
            navigate('/leads');
        }
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
    const { client } = useAuth();
    const [suggestedIds, setSuggestedIds] = useState<string[]>([]);
    const [suggestedProperties, setSuggestedProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSuggestions = async () => {
            setLoading(true);
            setError('');
            try {
                // The API route will now fetch properties itself
                const ids = await getPropertySuggestions(lead);
                setSuggestedIds(ids);
            } catch (err) {
                setError('Falha ao buscar sugestões da IA.');
                console.error(err);
            }
        };

        fetchSuggestions();
    }, [lead]);

    useEffect(() => {
        if (suggestedIds.length === 0) {
            setLoading(false);
            return;
        }

        const fetchProperties = async () => {
            const { data, error } = await client
                .from('properties')
                .select('*')
                .in('id', suggestedIds);
            
            if (error) {
                setError('Falha ao carregar detalhes das propriedades sugeridas.');
            } else {
                // Keep the order from AI
                const orderedProperties = suggestedIds.map(id => data.find(p => p.id === id)).filter(Boolean) as Property[];
                setSuggestedProperties(orderedProperties);
            }
            setLoading(false);
        }
        fetchProperties();

    }, [suggestedIds, client]);


    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h3 className="text-lg font-bold text-brand-text mb-4 flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-brand-primary"/>
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

const AIWhatsappSuggester: React.FC<{ lead: Lead }> = ({ lead }) => {
    const [suggestion, setSuggestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        setSuggestion('');
        try {
            const message = await getWhatsappSuggestion(lead);
            setSuggestion(message);
        } catch (err) {
            setError('Falha ao gerar mensagem.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(suggestion);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-brand-text mb-4">Ações Rápidas com IA</h3>
            <button onClick={handleGenerate} disabled={loading} className="w-full bg-brand-primary text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
                <SparklesIcon className="h-5 w-5"/>
                {loading ? 'Gerando mensagem...' : 'Gerar Follow-up para WhatsApp'}
            </button>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            {suggestion && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md border">
                    <p className="text-brand-text-light text-sm whitespace-pre-wrap">{suggestion}</p>
                    <div className="flex justify-end mt-2">
                        <button onClick={handleCopy} className="text-sm text-brand-primary font-semibold flex items-center gap-1">
                           <CopyIcon className="h-4 w-4"/> {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const LeadDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { client } = useAuth();
    const [lead, setLead] = useState<Lead | null>(null);
    const [agent, setAgent] = useState<Agent | null>(null);

    useEffect(() => {
        const fetchLeadDetails = async () => {
            if (!id) return;
            const { data: leadData, error } = await client
                .from('leads')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) {
                console.error("Error fetching lead", error);
            } else if (leadData) {
                setLead(leadData);
                const { data: agentData } = await client
                    .from('agents')
                    .select('*')
                    .eq('id', leadData.agent_id)
                    .single();
                setAgent(agentData);
            }
        };
        fetchLeadDetails();
    }, [id, client]);
    
    if (!lead) {
        return <PageContainer title="Carregando..." showBackButton>Carregando dados do lead...</PageContainer>;
    }

    const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

    return (
        <PageContainer title={lead.name} showBackButton>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Lead Details & AI Actions */}
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
                    {/* AI Actions */}
                    <AIWhatsappSuggester lead={lead} />
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
    const navigate = useNavigate();
    const { client } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<PropertyStatus | 'Todos'>('Todos');

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            let query = client.from('properties').select('*');
            if(activeFilter !== 'Todos') {
                query = query.eq('status', activeFilter);
            }
             if(searchTerm) {
                query = query.ilike('title', `%${searchTerm}%`);
            }
            const { data, error } = await query.order('created_at', { ascending: false });
            if(data) setProperties(data);
            setLoading(false);
        };
        fetchProperties();
    }, [searchTerm, activeFilter, client]);

    const filters: (PropertyStatus | 'Todos')[] = ['Todos', PropertyStatus.Disponivel, PropertyStatus.EmNegociacao, PropertyStatus.Vendido];

    return (
        <PageContainer title="Imóveis" actions={
            <button
                onClick={() => navigate('/properties/new')}
                className="bg-brand-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors"
            >
                <PlusIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Novo Imóvel</span>
            </button>
        }>
            <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
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
                 <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar imóvel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-brand-primary focus:outline-none w-40 sm:w-auto"
                    />
                </div>
            </div>
            {loading ? <p>Carregando imóveis...</p> : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map(property => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            )}
        </PageContainer>
    );
};

// ... (Other page components like WhatsappPage, DashboardPage etc will be added here)
const WhatsappPage = () => {
    const { profile, client } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!profile) return;
        
        const fetchData = async () => {
            const { data: agentsData } = await client.from('agents').select('*');
            setAgents(agentsData || []);
            
            const { data: leadsData } = await client
                .from('leads')
                .select('*')
                .eq('agent_id', profile.id)
                .order('last_contact', { ascending: false });
            setLeads(leadsData || []);
        };
        
        fetchData();

        const channel = client.channel('whatsapp-leads-channel')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads', filter: `agent_id=eq.${profile.id}` }, (payload) => {
                 setLeads(currentLeads => currentLeads.map(l => l.id === payload.new.id ? payload.new as Lead : l));
            })
            .subscribe();

        return () => {
            client.removeChannel(channel);
        };
    }, [profile, client]);


    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [selectedLeadId, leads]);

    const filteredLeads = useMemo(() => {
        return leads
            .filter(lead => lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || lead.phone.includes(searchTerm))
            .sort((a, b) => {
                const lastMessageA = a.whatsapp_history?.[a.whatsapp_history.length - 1];
                const lastMessageB = b.whatsapp_history?.[b.whatsapp_history.length - 1];
                if (!lastMessageA) return 1;
                if (!lastMessageB) return -1;
                return new Date(lastMessageB.timestamp).getTime() - new Date(lastMessageA.timestamp).getTime();
            });
    }, [searchTerm, leads]);

    const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId), [leads, selectedLeadId]);

    const openWhatsApp = (lead: Lead, text?: string) => {
        const phone = lead.phone.replace(/\D/g, '');
        const fullPhone = phone.length > 11 ? phone : `55${phone}`;
        let url = `https://wa.me/${fullPhone}`;
        if (text) {
            url += `?text=${encodeURIComponent(text)}`;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedLead) return;

        const newMsg: WhatsappMessage = {
            id: `msg-${Date.now()}`,
            content: newMessage,
            sender: 'agent',
            status: 'sent',
            timestamp: new Date().toISOString(),
        };
        
        const updatedHistory = [...(selectedLead.whatsapp_history || []), newMsg];
        const { error } = await client
            .from('leads')
            .update({ whatsapp_history: updatedHistory, last_contact: new Date().toISOString() })
            .eq('id', selectedLead.id);
            
        if(error) {
            alert('Falha ao enviar mensagem.');
        } else {
            openWhatsApp(selectedLead, newMessage);
            setNewMessage('');
        }
    };
    
    const formatMessageTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        if (isToday(date)) return format(date, 'HH:mm');
        if (isYesterday(date)) return 'Ontem';
        if (isThisYear(date)) return format(date, 'dd/MM');
        return format(date, 'dd/MM/yy');
    };

    const MessageStatusIndicator: React.FC<{ status: 'sent' | 'delivered' | 'read' }> = ({ status }) => {
        if (status === 'read') return <DoubleCheckIcon className="text-blue-500" />;
        if (status === 'delivered') return <DoubleCheckIcon className="text-gray-500" />;
        return <CheckIcon className="text-gray-500" />;
    };

    const isMobile = window.innerWidth < 768;
    const showChatList = !isMobile || (isMobile && !selectedLeadId);
    const showChatWindow = !isMobile || (isMobile && selectedLeadId);

    return (
        <PageContainer title="WhatsApp" noPadding>
            <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
                {/* Left Panel: Conversation List */}
                <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col bg-white ${showChatList ? 'flex' : 'hidden md:flex'}`}>
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar conversa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full rounded-full border bg-gray-100 border-gray-200 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        <ul className="divide-y divide-gray-200">
                            {filteredLeads.map(lead => {
                                const lastMessage = lead.whatsapp_history?.[lead.whatsapp_history.length - 1];
                                const agent = agents.find(a => a.id === lead.agent_id);
                                return (
                                <li key={lead.id} onClick={() => setSelectedLeadId(lead.id)} className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${selectedLeadId === lead.id ? 'bg-brand-secondary' : 'hover:bg-gray-50'}`}>
                                    <img src={agent?.avatar_url} alt={lead.name} className="h-12 w-12 rounded-full object-cover"/>
                                    <div className="flex-grow overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-brand-text truncate">{lead.name}</p>
                                            {lastMessage && <p className="text-xs text-brand-text-light flex-shrink-0 ml-2">{formatMessageTimestamp(lastMessage.timestamp)}</p>}
                                        </div>
                                        <p className="text-sm text-brand-text-light truncate">{lastMessage?.content || 'Nenhuma mensagem ainda'}</p>
                                    </div>
                                </li>
                            )})}
                        </ul>
                    </div>
                </div>

                {/* Right Panel: Chat Window */}
                 <div className={`w-full md:w-2/3 lg:w-3/4 flex flex-col bg-gray-100 ${showChatWindow ? 'flex' : 'hidden md:flex'}`}>
                    {selectedLead ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white shadow-sm">
                                <div className="flex items-center gap-3">
                                    {isMobile && (
                                        <button onClick={() => setSelectedLeadId(null)} className="p-2 rounded-full hover:bg-gray-100">
                                            <ChevronLeftIcon className="h-6 w-6 text-brand-text" />
                                        </button>
                                    )}
                                    <img src={agents.find(a => a.id === selectedLead.agent_id)?.avatar_url} alt={selectedLead.name} className="h-10 w-10 rounded-full object-cover" />
                                    <div>
                                        <p className="font-bold text-brand-text">{selectedLead.name}</p>
                                        <p className="text-xs text-green-500">Online</p>
                                    </div>
                                </div>
                                <button onClick={() => openWhatsApp(selectedLead)} className="p-2 rounded-full text-green-500 hover:bg-green-50 transition-colors">
                                    <WhatsappIcon className="h-7 w-7"/>
                                </button>
                            </div>

                            {/* Messages */}
                            <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-repeat" style={{backgroundImage: 'url(https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg)', backgroundSize: '20%'}}>
                                {(selectedLead.whatsapp_history || []).map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${msg.sender === 'agent' ? 'bg-[#dcf8c6] text-brand-text' : 'bg-white text-brand-text shadow-sm'}`}>
                                            <p className="text-sm break-words">{msg.content}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <p className="text-xs text-gray-400">{format(new Date(msg.timestamp), 'HH:mm')}</p>
                                                {msg.sender === 'agent' && <MessageStatusIndicator status={msg.status} />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message Composer */}
                            <div className="bg-white p-3 border-t border-gray-200 flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Digite uma mensagem"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="flex-grow px-4 py-2 bg-gray-100 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                                <button onClick={handleSendMessage} className="bg-brand-primary text-white rounded-full p-3 hover:bg-opacity-90 transition-colors disabled:bg-gray-300" disabled={!newMessage.trim()}>
                                    <SendIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col justify-center items-center h-full text-center text-brand-text-light">
                            <MessageCircleIcon className="h-24 w-24 mb-4 text-gray-300" />
                            <h3 className="text-2xl font-semibold">Selecione uma conversa</h3>
                            <p>Escolha um lead na lista ao lado para começar a conversar.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

// --- PROPERTY CRUD PAGES ---
const PropertyDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { client } = useAuth();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [agent, setAgent] = useState<Agent | null>(null);
    const [mainImage, setMainImage] = useState('');

     useEffect(() => {
        const fetchPropertyDetails = async () => {
            if (!id) return;
            const { data: propertyData } = await client.from('properties').select('*').eq('id', id).single();
            if (propertyData) {
                setProperty(propertyData);
                setMainImage(propertyData.images[0]);
                const { data: agentData } = await client.from('agents').select('*').eq('id', propertyData.agent_id).single();
                setAgent(agentData);
            }
        };
        fetchPropertyDetails();
    }, [id, client]);


    if (!property) {
        return <PageContainer title="Carregando..." showBackButton>Carregando dados do imóvel...</PageContainer>;
    }
    
    const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

    return (
        <PageContainer title={property.title} showBackButton actions={
             <button onClick={() => navigate(`/properties/${id}/edit`)} className="bg-brand-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors">
                <PlusIcon className="h-5 w-5"/> Editar
             </button>
        }>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                    <div className="md:col-span-3">
                        <img src={mainImage} alt={property.title} className="w-full h-96 object-cover" />
                         <div className="flex gap-2 p-2 bg-gray-100 overflow-x-auto">
                            {property.images.map((img, idx) => (
                                <img 
                                    key={idx} 
                                    src={img} 
                                    onClick={() => setMainImage(img)}
                                    className={`h-20 w-20 object-cover rounded-md cursor-pointer border-2 ${mainImage === img ? 'border-brand-primary' : 'border-transparent'}`} 
                                    alt={`Thumbnail ${idx+1}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2 p-6 flex flex-col">
                        <StatusPill status={property.status} />
                        <h1 className="text-2xl font-bold text-brand-text mt-2">{property.title}</h1>
                        <p className="text-brand-text-light mt-1 flex items-center gap-2"><MapPinIcon className="h-5 w-5"/>{property.location.bairro}, {property.location.cidade}</p>
                        <p className="text-4xl font-extrabold text-brand-primary my-4">{formatPrice(property.price)}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm my-4">
                            <div className="flex items-center gap-2"><BuildingIcon className="h-5 w-5 text-brand-text-light"/>Área: {property.area} m²</div>
                            <div className="flex items-center gap-2"><UsersIcon className="h-5 w-5 text-brand-text-light"/>Quartos: {property.bedrooms}</div>
                            <div className="flex items-center gap-2"><UsersIcon className="h-5 w-5 text-brand-text-light"/>Banheiros: {property.bathrooms}</div>
                            <div className="flex items-center gap-2"><UsersIcon className="h-5 w-5 text-brand-text-light"/>Vagas: {property.garage_spaces}</div>
                        </div>
                        
                        <div className="text-brand-text-light text-sm my-4 border-t pt-4">
                            <h3 className="font-semibold text-brand-text mb-2">Descrição</h3>
                            <p className="whitespace-pre-wrap">{property.description}</p>
                        </div>

                        {agent && (
                             <div className="border-t pt-4 mt-auto">
                                <h3 className="font-semibold text-brand-text mb-2">Corretor Responsável</h3>
                                <div className="flex items-center gap-3">
                                    <img src={agent.avatar_url} alt={agent.name} className="h-12 w-12 rounded-full object-cover"/>
                                    <div>
                                        <p className="font-bold text-brand-text">{agent.name}</p>
                                        <p className="text-sm text-brand-text-light">{agent.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

const PropertyFormPage = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { profile, client } = useAuth();
    
    const [property, setProperty] = useState<Omit<Property, 'id' | 'created_at'>>({
        title: '', type: PropertyType.Apartamento, description: '', location: { bairro: '', cidade: 'São Paulo' },
        price: 0, area: 0, bedrooms: 0, bathrooms: 0, garage_spaces: 0,
        agent_id: profile?.id || '', images: [''], status: PropertyStatus.Disponivel,
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);

    const isEditing = Boolean(id);

    useEffect(() => {
        const fetchAgents = async () => {
            const { data } = await client.from('agents').select('*');
            setAgents(data || []);
        };
        fetchAgents();

        if (isEditing) {
            const fetchProperty = async () => {
                const { data } = await client.from('properties').select('*').eq('id', id).single();
                if (data) {
                    const { id: propId, created_at, ...rest } = data;
                    setProperty(rest);
                }
            }
            fetchProperty();
        }
    }, [id, isEditing, client]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numValue = ['price', 'area', 'bedrooms', 'bathrooms', 'garage_spaces'].includes(name) ? parseFloat(value) : value;

        if (name === 'bairro' || name === 'cidade') {
            setProperty(prev => ({ ...prev, location: { ...prev.location, [name]: value } }));
        } else {
            setProperty(prev => ({ ...prev, [name]: numValue }));
        }
    };
    
    const handleImageChange = (index: number, value: string) => {
        const newImages = [...property.images];
        newImages[index] = value;
        setProperty(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        setProperty(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const removeImageField = (index: number) => {
        setProperty(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleGenerateDescription = async () => {
        setIsGenerating(true);
        const { agent_id, status, ...details } = property;
        const description = await getPropertyDescription(details as any); // cast because of partial type
        setProperty(prev => ({ ...prev, description }));
        setIsGenerating(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const { error } = isEditing
            ? await client.from('properties').update(property).eq('id', id!)
            : await client.from('properties').insert({ ...property, agent_id: profile!.id });

        if (error) {
            alert('Erro ao salvar imóvel: ' + error.message);
        } else {
            navigate('/properties');
        }
    };

    return (
        <PageContainer title={isEditing ? 'Editar Imóvel' : 'Novo Imóvel'} showBackButton>
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6">
                 <div>
                    <label htmlFor="title" className="block text-sm font-medium text-brand-text-light">Título do Anúncio</label>
                    <input type="text" name="title" value={property.title} onChange={handleChange} required className="input-style" />
                </div>
                
                <div className="relative">
                    <label htmlFor="description" className="block text-sm font-medium text-brand-text-light">Descrição</label>
                    <textarea name="description" value={property.description} onChange={handleChange} rows={6} className="input-style"></textarea>
                    <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="absolute bottom-3 right-3 bg-brand-primary text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1 hover:bg-opacity-80 disabled:bg-gray-400">
                        <SparklesIcon className="h-4 w-4"/>
                        {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="price" className="block text-sm font-medium text-brand-text-light">Preço (R$)</label>
                        <input type="number" name="price" value={property.price} onChange={handleChange} required className="input-style" />
                    </div>
                     <div>
                        <label htmlFor="type" className="block text-sm font-medium text-brand-text-light">Tipo</label>
                        <select name="type" value={property.type} onChange={handleChange} className="input-style">
                            {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-brand-text-light">Status</label>
                        <select name="status" value={property.status} onChange={handleChange} className="input-style">
                            {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bairro" className="block text-sm font-medium text-brand-text-light">Bairro</label>
                        <input type="text" name="bairro" value={property.location.bairro} onChange={handleChange} required className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="cidade" className="block text-sm font-medium text-brand-text-light">Cidade</label>
                        <input type="text" name="cidade" value={property.location.cidade} onChange={handleChange} required className="input-style" />
                    </div>
                     <div>
                        <label htmlFor="area" className="block text-sm font-medium text-brand-text-light">Área (m²)</label>
                        <input type="number" name="area" value={property.area} onChange={handleChange} required className="input-style" />
                    </div>
                     <div>
                        <label htmlFor="bedrooms" className="block text-sm font-medium text-brand-text-light">Quartos</label>
                        <input type="number" name="bedrooms" value={property.bedrooms} onChange={handleChange} required className="input-style" />
                    </div>
                     <div>
                        <label htmlFor="bathrooms" className="block text-sm font-medium text-brand-text-light">Banheiros</label>
                        <input type="number" name="bathrooms" value={property.bathrooms} onChange={handleChange} required className="input-style" />
                    </div>
                     <div>
                        <label htmlFor="garage_spaces" className="block text-sm font-medium text-brand-text-light">Vagas</label>
                        <input type="number" name="garage_spaces" value={property.garage_spaces} onChange={handleChange} required className="input-style" />
                    </div>
                </div>
                
                <div>
                     <label className="block text-sm font-medium text-brand-text-light mb-2">Imagens (URLs)</label>
                     <div className="space-y-2">
                        {property.images.map((url, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" value={url} onChange={e => handleImageChange(index, e.target.value)} placeholder="https://example.com/image.jpg" required className="input-style flex-grow"/>
                                <button type="button" onClick={() => removeImageField(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                    <XIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        ))}
                     </div>
                     <button type="button" onClick={addImageField} className="mt-2 text-sm font-semibold text-brand-primary hover:underline">Adicionar outra imagem</button>
                </div>

                <div>
                    <label htmlFor="agent_id" className="block text-sm font-medium text-brand-text-light">Corretor Responsável</label>
                    <select name="agent_id" value={property.agent_id} onChange={handleChange} className="input-style">
                        {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>
                
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 text-sm font-medium text-brand-text bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="bg-brand-primary text-white px-6 py-2 text-sm font-medium rounded-lg">{isEditing ? 'Salvar Alterações' : 'Criar Imóvel'}</button>
                </div>
            </form>
             <style>{`.input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline-offset: 2px; } .input-style:focus { outline: 2px solid transparent; --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); --tw-ring-color: #0052CC; }`}</style>
        </PageContainer>
    );
};

// --- DASHBOARD COMPONENTS ---
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
    const navigate = useNavigate();
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
                    <div key={item.stage} className="flex flex-col items-center cursor-pointer group" onClick={() => navigate(`/leads?status=${item.stage}`)}>
                        <div className="text-sm font-semibold text-brand-text">{item.stage} ({item.value})</div>
                        <div className="relative" style={{ width: `${20 + (item.value / maxValue * 80)}%`, minWidth: '80px'}}>
                            <div style={{ backgroundColor: colors[index % colors.length] }} className="h-10 rounded-sm flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-105">
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
    const navigate = useNavigate();
    const colors = ['#0052CC', '#4C9AFF', '#00B8D9', '#B3D4FF'];
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
        <div className="h-80 flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="relative w-48 h-48">
                 <svg viewBox="0 0 36 36" className="w-full h-full">
                    {data.reduce((acc, item, index) => {
                        const percentage = total > 0 ? (item.value / total) * 100 : 0;
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
    const { profile, client } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        if (!profile) return;
        
        const fetchData = async () => {
            const [leadsRes, propertiesRes, visitsRes] = await Promise.all([
                client.from('leads').select('status', { count: 'exact' }).eq('agent_id', profile.id),
                client.from('properties').select('type, status', { count: 'exact' }),
                client.from('visits').select('start', { count: 'exact' }).eq('agent_id', profile.id)
            ]);

            const leads = leadsRes.data || [];
            const properties = propertiesRes.data || [];
            const visits = visitsRes.data || [];

            const totalLeads = leadsRes.count;
            const availableProperties = (await client.from('properties').select('status', { count: 'exact' }).eq('status', PropertyStatus.Disponivel)).count;
            
            const totalVisitsThisWeek = visits.filter(v => new Date(v.start) >= startOfWeek(new Date(), { weekStartsOn: 1 })).length;
            
            const closedLeadsCount = leads.filter(l => l.status === LeadStatus.Fechado).length;
            const activeLeadsCount = leads.filter(l => l.status === LeadStatus.EmNegociacao || l.status === LeadStatus.Visitou).length;
            const conversionRate = (activeLeadsCount + closedLeadsCount) > 0 ? (closedLeadsCount / (activeLeadsCount + closedLeadsCount)) * 100 : 0;

            const leadsByStatus = leads.reduce((acc, lead) => {
                acc[lead.status] = (acc[lead.status] || 0) + 1;
                return acc;
            }, {} as { [key: string]: number });

            const conversionFunnelData = [
                { stage: LeadStatus.Novo, value: leadsByStatus[LeadStatus.Novo] || 0 },
                { stage: LeadStatus.EmNegociacao, value: leadsByStatus[LeadStatus.EmNegociacao] || 0 },
                { stage: LeadStatus.Visitou, value: leadsByStatus[LeadStatus.Visitou] || 0 },
                { stage: LeadStatus.Fechado, value: leadsByStatus[LeadStatus.Fechado] || 0 },
            ];
            
            const today = new Date();
            const startOfTodayWeek = startOfWeek(today, { weekStartsOn: 1 });
            const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
            const visitsTrendData = weekDays.map((day, index) => {
                const date = addDays(startOfTodayWeek, index);
                const dailyVisits = visits.filter(v => isSameDay(new Date(v.start), date)).length;
                return { day, visits: dailyVisits };
            });

            const { data: allProperties } = await client.from('properties').select('type');
            const propertiesByType = Object.values(PropertyType).map(type => ({
                type,
                value: (allProperties || []).filter(p => p.type === type).length,
            })).filter(item => item.value > 0);

            setDashboardData({ totalLeads, availableProperties, conversionRate, totalVisits: totalVisitsThisWeek, conversionFunnelData, visitsTrendData, propertiesByType });
        };

        fetchData();
    }, [profile, client]);
    
    if(!dashboardData) return <PageContainer title={`Olá, ${profile?.name.split(' ')[0]}!`}>Carregando dados...</PageContainer>

    return (
        <PageContainer title={`Olá, ${profile?.name.split(' ')[0]}!`}>
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
interface NewVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (visit: Omit<Visit, 'id' | 'created_at'>) => void;
    profile: Agent;
}
const NewVisitModal: React.FC<NewVisitModalProps> = ({ isOpen, onClose, onSave, profile }) => {
    const { client } = useAuth();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [title, setTitle] = useState('');
    const [leadId, setLeadId] = useState('');
    const [propertyId, setPropertyId] = useState('');
    const [agentId, setAgentId] = useState(profile.id);
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState(format(new Date(), 'HH:mm'));
    
    useEffect(() => {
        const fetchData = async () => {
            const [agentsRes, leadsRes, propertiesRes] = await Promise.all([
                client.from('agents').select('*'),
                client.from('leads').select('id, name').eq('agent_id', profile.id),
                client.from('properties').select('id, title').eq('status', 'Disponível')
            ]);
            setAgents(agentsRes.data || []);
            setLeads(leadsRes.data || []);
            setProperties(propertiesRes.data || []);
        };
        fetchData();
    }, [profile, client]);

    useEffect(() => {
        if(leadId) {
            const lead = leads.find(l => l.id === leadId);
            if(lead) setTitle(`Visita com ${lead.name}`);
        }
    }, [leadId, leads]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // Add 1 hour
        if (!title || !leadId || !propertyId || !agentId || isNaN(start.getTime())) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }
        
        onSave({ title, start: start.toISOString(), end: end.toISOString(), agent_id: agentId, lead_id: leadId, property_id: propertyId });
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
                               {properties.map(prop => <option key={prop.id} value={prop.id}>{prop.title}</option>)}
                           </select>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-brand-text-light">Data da Visita</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full input-style" />
                        </div>
                         <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-brand-text-light">Hora da Visita</label>
                            <input type="time" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} required className="mt-1 block w-full input-style" />
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
    const { profile, client } = useAuth();
    const [visits, setVisits] = useState<Visit[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Visit | undefined>(undefined);
    const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if(!profile) return;
        const fetchAllData = async () => {
            const [agentsRes, leadsRes, propertiesRes, visitsRes] = await Promise.all([
                 client.from('agents').select('*'),
                 client.from('leads').select('id, name'),
                 client.from('properties').select('id, title'),
                 client.from('visits').select('*').eq('agent_id', profile.id)
            ]);
            setAgents(agentsRes.data || []);
            setLeads(leadsRes.data || []);
            setProperties(propertiesRes.data || []);
            setVisits(visitsRes.data || []);
        };
        fetchAllData();

         const channel = client.channel('agenda-visits-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'visits' }, fetchAllData)
            .subscribe();

        return () => { client.removeChannel(channel); };
    }, [profile, client]);


    const weekStart = useMemo(() => startOfWeek(currentDate, { locale: ptBR, weekStartsOn: 1 }), [currentDate]);
    const weekEnd = useMemo(() => endOfWeek(currentDate, { locale: ptBR, weekStartsOn: 1 }), [currentDate]);
    const days = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

    const eventsByDay = useMemo(() => {
        const grouped: { [key: string]: Visit[] } = {};
        days.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            grouped[dayKey] = visits
                .filter(visit => isSameDay(new Date(visit.start), day))
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        });
        return grouped;
    }, [days, visits]);

    const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const goToPrevWeek = () => setCurrentDate(addWeeks(currentDate, -1));
    const goToToday = () => setCurrentDate(new Date());

    const handleCloseModal = () => setSelectedEvent(undefined);
    
    const handleSaveNewVisit = async (newVisit: Omit<Visit, 'id' | 'created_at'>) => {
        const { error } = await client.from('visits').insert(newVisit);
        if (error) {
            alert("Erro ao salvar visita: " + error.message);
        } else {
            setIsNewEventModalOpen(false);
        }
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
                                        className={`p-2 rounded-md cursor-pointer text-white text-left transition-colors ${agentColors[event.agent_id] || 'bg-gray-500'}`}
                                        role="button"
                                        aria-label={`Ver detalhes de ${event.title}`}
                                    >
                                        <p className="font-semibold text-xs truncate">{event.title}</p>
                                        <p className="text-xs opacity-90">{format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}</p>
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
                            <div className="flex items-center gap-3"><ClockIcon className="h-5 w-5"/><span>{format(new Date(selectedEvent.start), 'dd/MM/yyyy HH:mm', { locale: ptBR })} - {format(new Date(selectedEvent.end), 'HH:mm', { locale: ptBR })}</span></div>
                            <div className="flex items-center gap-3"><UsersIcon className="h-5 w-5"/><span>Lead: {leads.find(l => l.id === selectedEvent.lead_id)?.name}</span></div>
                            <div className="flex items-center gap-3"><BuildingIcon className="h-5 w-5"/><span>Imóvel: {properties.find(p => p.id === selectedEvent.property_id)?.title}</span></div>
                            <div className="flex items-center gap-3"><StarIcon className="h-5 w-5"/><span>Corretor: {agents.find(a => a.id === selectedEvent.agent_id)?.name}</span></div>
                        </div>
                    </div>
                </div>
            )}
            
            {profile && <NewVisitModal 
                isOpen={isNewEventModalOpen}
                onClose={() => setIsNewEventModalOpen(false)}
                onSave={handleSaveNewVisit}
                profile={profile}
            />}
        </PageContainer>
    );
};

// --- LAYOUT FOR AUTHENTICATED APP ---
const MainLayout = () => {
    const { session, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-brand-secondary text-brand-text">Carregando...</div>;
    }

    if (!session) {
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
                <Route path="/properties/new" element={<PropertyFormPage />} />
                <Route path="/properties/:id" element={<PropertyDetailPage />} />
                <Route path="/properties/:id/edit" element={<PropertyFormPage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/whatsapp" element={<WhatsappPage />} />
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
