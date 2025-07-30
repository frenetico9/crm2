import { Agent, Property, Lead, LeadStatus, PropertyStatus, PropertyType, Interaction, Visit, Notification } from './types';
import { addDays, formatISO } from 'date-fns';

const _startOfWeek = (date: Date, options?: { weekStartsOn?: number }): Date => {
    const d = new Date(date);
    const weekStartsOn = options?.weekStartsOn ?? 0;
    const day = d.getDay();
    const diff = (day - weekStartsOn + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const _setHours = (date: Date | number, value: number): Date => {
  const d = new Date(date);
  d.setHours(value);
  return d;
};

const _setMinutes = (date: Date | number, value: number): Date => {
  const d = new Date(date);
  d.setMinutes(value);
  return d;
};

export const initialAgents: Agent[] = [
  { id: 'agent-1', name: 'Carlos Ferreira', email: 'carlos@corretor.ai', password: 'password123', avatarUrl: 'https://i.pravatar.cc/150?u=agent-1', phone: '(11) 99999-1111' },
  { id: 'agent-2', name: 'Ana Souza', email: 'ana@corretor.ai', password: 'password123', avatarUrl: 'https://i.pravatar.cc/150?u=agent-2', phone: '(11) 99999-2222' },
  { id: 'agent-3', name: 'Ricardo Lima', email: 'ricardo@corretor.ai', password: 'password123', avatarUrl: 'https://i.pravatar.cc/150?u=agent-3', phone: '(11) 99999-3333' },
];

export const initialProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'Apartamento Moderno no Centro',
    description: 'Este apartamento moderno de 2 quartos no coração do centro da cidade oferece vistas deslumbrantes e acabamentos de alta qualidade. A poucos passos de restaurantes, lojas e transportes públicos. Ideal para quem busca um estilo de vida urbano e sofisticado.',
    type: PropertyType.Apartamento,
    location: { bairro: 'Centro', cidade: 'São Paulo' },
    price: 850000,
    area: 90,
    bedrooms: 2,
    bathrooms: 2,
    garageSpaces: 1,
    agentId: 'agent-1',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop'],
    status: PropertyStatus.Disponivel,
  },
  {
    id: 'prop-2',
    title: 'Casa Espaçosa com Quintal',
    description: 'Uma casa de família excepcional com 4 suítes, piscina privativa e um vasto quintal. Localizada no prestigiado bairro dos Jardins, esta propriedade combina luxo, conforto e segurança. Perfeita para entretenimento e vida em família.',
    type: PropertyType.Casa,
    location: { bairro: 'Jardins', cidade: 'São Paulo' },
    price: 2500000,
    area: 350,
    bedrooms: 4,
    bathrooms: 5,
    garageSpaces: 4,
    agentId: 'agent-2',
    images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop'],
    status: PropertyStatus.Disponivel,
  },
  {
    id: 'prop-3',
    title: 'Sala Comercial na Av. Paulista',
    description: 'Escritório comercial premium em um dos endereços mais cobiçados de São Paulo. Com 120m² de espaço flexível, duas salas de reunião e vistas para a Avenida Paulista, é a localização ideal para sua empresa prosperar.',
    type: PropertyType.SalaComercial,
    location: { bairro: 'Bela Vista', cidade: 'São Paulo' },
    price: 1200000,
    area: 120,
    bedrooms: 0,
    bathrooms: 2,
    garageSpaces: 2,
    agentId: 'agent-1',
    images: ['https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1784&auto=format&fit=crop'],
    status: PropertyStatus.EmNegociacao,
  },
  {
    id: 'prop-4',
    title: 'Apartamento Aconchegante em Pinheiros',
    description: 'Charmoso apartamento de 3 quartos no vibrante bairro de Pinheiros. Possui uma varanda gourmet e áreas comuns completas, incluindo academia e piscina. A vida que você sempre sonhou, perto de tudo que importa.',
    type: PropertyType.Apartamento,
    location: { bairro: 'Pinheiros', cidade: 'São Paulo' },
    price: 1100000,
    area: 110,
    bedrooms: 3,
    bathrooms: 2,
    garageSpaces: 2,
    agentId: 'agent-3',
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop'],
    status: PropertyStatus.Disponivel,
  },
   {
    id: 'prop-5',
    title: 'Casa Térrea em Moema',
    description: 'Linda casa térrea totalmente reformada em Moema. Com 3 suítes e um design de interiores impecável, esta casa oferece praticidade e elegância. O espaço gourmet integrado ao jardim é um convite para momentos inesquecíveis.',
    type: PropertyType.Casa,
    location: { bairro: 'Moema', cidade: 'São Paulo' },
    price: 3200000,
    area: 400,
    bedrooms: 3,
    bathrooms: 4,
    garageSpaces: 3,
    agentId: 'agent-2',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'],
    status: PropertyStatus.Vendido,
  },
  {
    id: 'prop-6',
    title: 'Terreno Plano em Interlagos',
    description: 'Excelente oportunidade de investimento. Terreno plano de 500m² em localização estratégica em Interlagos, próximo ao autódromo. Perfeito para construir a casa dos seus sonhos ou para empreendimentos comerciais.',
    type: PropertyType.Terreno,
    location: { bairro: 'Interlagos', cidade: 'São Paulo' },
    price: 950000,
    area: 500,
    bedrooms: 0,
    bathrooms: 0,
    garageSpaces: 0,
    agentId: 'agent-3',
    images: ['https://images.unsplash.com/photo-1599736377313-de123f413345?q=80&w=1932&auto=format&fit=crop'],
    status: PropertyStatus.Disponivel,
  },
];

export const initialLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Mariana Costa',
    email: 'mariana.c@example.com',
    phone: '(11) 98765-4321',
    agentId: 'agent-1',
    status: LeadStatus.Novo,
    score: 85,
    lastContact: '2024-07-28',
    interest: {
      type: [PropertyType.Apartamento],
      bairro: ['Centro', 'Pinheiros'],
      priceRange: [800000, 1200000],
    },
    whatsappHistory: [
        { id: 'msg-1-1', content: 'Olá Mariana, sou o Carlos, seu corretor. Vi seu interesse no apartamento do Centro.', sender: 'agent', timestamp: addDays(new Date(), -2).toISOString(), status: 'read' },
        { id: 'msg-1-2', content: 'Oi, Carlos! Tudo bem? Sim, gostei bastante dele.', sender: 'lead', timestamp: addDays(new Date(), -2).toISOString(), status: 'delivered' },
        { id: 'msg-1-3', content: 'Que ótimo! Ele está disponível para visita. Gostaria de agendar um horário para conhecê-lo esta semana?', sender: 'agent', timestamp: addDays(new Date(), -1).toISOString(), status: 'delivered' },
      ]
  },
  {
    id: 'lead-2',
    name: 'João Pedro Alves',
    email: 'joaopedro@example.com',
    phone: '(11) 91234-5678',
    agentId: 'agent-2',
    status: LeadStatus.EmNegociacao,
    score: 92,
    lastContact: '2024-07-27',
    interest: {
      type: [PropertyType.Casa],
      bairro: ['Jardins', 'Moema'],
      priceRange: [2000000, 3500000],
    },
     whatsappHistory: [
        { id: 'msg-2-1', content: 'Olá João Pedro, aqui é a Ana. Recebi seu contato sobre a casa nos Jardins.', sender: 'agent', timestamp: addDays(new Date(), -3).toISOString(), status: 'read' },
        { id: 'msg-2-2', content: 'Olá Ana, obrigado por retornar. Tenho muito interesse, parece incrível!', sender: 'lead', timestamp: addDays(new Date(), -3).toISOString(), status: 'delivered' },
    ]
  },
  {
    id: 'lead-3',
    name: 'Beatriz Martins',
    email: 'beatriz.m@example.com',
    phone: '(11) 99999-8888',
    agentId: 'agent-1',
    status: LeadStatus.Visitou,
    score: 78,
    lastContact: '2024-07-25',
    interest: {
      type: [PropertyType.SalaComercial],
      bairro: ['Bela Vista', 'Av. Paulista'],
      priceRange: [1000000, 1500000],
    },
    whatsappHistory: [
        { id: 'msg-3-1', content: 'Beatriz, passando para agradecer a visita à sala comercial hoje. O que achou?', sender: 'agent', timestamp: addDays(new Date(), -5).toISOString(), status: 'sent' },
    ]
  },
    {
    id: 'lead-4',
    name: 'Lucas Gonçalves',
    email: 'lucas.g@example.com',
    phone: '(11) 98888-7777',
    agentId: 'agent-3',
    status: LeadStatus.Perdido,
    score: 45,
    lastContact: '2024-07-15',
    interest: {
      type: [PropertyType.Apartamento],
      bairro: ['Vila Madalena'],
      priceRange: [700000, 900000],
    },
  },
  {
    id: 'lead-5',
    name: 'Fernanda Lima',
    email: 'fernanda.l@example.com',
    phone: '(11) 97777-6666',
    agentId: 'agent-2',
    status: LeadStatus.Fechado,
    score: 95,
    lastContact: '2024-07-20',
    interest: {
      type: [PropertyType.Casa],
      bairro: ['Moema'],
      priceRange: [3000000, 3500000],
    },
  }
];

export const initialInteractions: Interaction[] = [
    { id: 'int-1', type: 'WhatsApp', date: '2024-07-28', content: 'Olá Mariana, recebi seu contato. Gostaria de agendar uma conversa?' },
    { id: 'int-2', type: 'Email', date: '2024-07-27', content: 'Envio de catálogo de imóveis na região dos Jardins.'},
    { id: 'int-3', type: 'Ligação', date: '2024-07-25', content: 'Conversamos sobre a proposta da sala comercial. Lead ficou de pensar.'},
];

const today = new Date();
const weekStart = _startOfWeek(today, { weekStartsOn: 1 });

export const initialVisits: Visit[] = [
    {
        id: 'visit-1',
        title: 'Visita com Mariana Costa',
        start: _setMinutes(_setHours(addDays(weekStart, 1), 10), 0), // Terça às 10:00
        end: _setMinutes(_setHours(addDays(weekStart, 1), 11), 0),
        agentId: 'agent-1',
        leadId: 'lead-1',
        propertyId: 'prop-1'
    },
    {
        id: 'visit-2',
        title: 'Reunião com João Pedro',
        start: _setMinutes(_setHours(addDays(weekStart, 2), 14), 30), // Quarta às 14:30
        end: _setMinutes(_setHours(addDays(weekStart, 2), 15), 30),
        agentId: 'agent-2',
        leadId: 'lead-2',
        propertyId: 'prop-2'
    },
    {
        id: 'visit-3',
        title: 'Visita com Beatriz Martins',
        start: _setMinutes(_setHours(addDays(weekStart, 4), 16), 0), // Sexta às 16:00
        end: _setMinutes(_setHours(addDays(weekStart, 4), 17), 0),
        agentId: 'agent-1',
        leadId: 'lead-3',
        propertyId: 'prop-3'
    },
     {
        id: 'visit-4',
        title: 'Alinhamento com Ricardo',
        start: _setMinutes(_setHours(addDays(weekStart, 0), 9), 0), // Segunda às 09:00
        end: _setMinutes(_setHours(addDays(weekStart, 0), 9), 30),
        agentId: 'agent-3',
        leadId: 'lead-4',
        propertyId: 'prop-4'
    },
];

export const initialNotifications: Notification[] = [
    {
        id: 'notif-1',
        type: 'new_lead',
        title: 'Novo Lead Atribuído',
        content: 'O lead "Mariana Costa" foi atribuído a você.',
        timestamp: formatISO(addDays(new Date(), -1)),
        read: false,
        link: '/leads/lead-1'
    },
    {
        id: 'notif-2',
        type: 'visit_reminder',
        title: 'Lembrete de Visita',
        content: 'Você tem uma visita agendada com "João Pedro Alves" amanhã às 14:30.',
        timestamp: formatISO(new Date()),
        read: false,
        link: '/agenda'
    },
    {
        id: 'notif-3',
        type: 'message',
        title: 'Nova Mensagem de WhatsApp',
        content: '"Beatriz Martins" respondeu à sua mensagem.',
        timestamp: formatISO(new Date()),
        read: true,
        link: '/whatsapp'
    }
];
