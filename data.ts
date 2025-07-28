
import { Agent, Property, Lead, LeadStatus, PropertyStatus, PropertyType, Interaction, Visit, ChatMessage } from './types';
import { addDays } from 'date-fns';

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

export const agents: Agent[] = [
  { id: 'agent-1', name: 'Carlos Ferreira', email: 'carlos@corretor.ai', password: 'password123', avatarUrl: 'https://i.pravatar.cc/150?u=agent-1', phone: '(11) 99999-1111' },
  { id: 'agent-2', name: 'Ana Souza', email: 'ana@corretor.ai', password: 'password123', avatarUrl: 'https://i.pravatar.cc/150?u=agent-2', phone: '(11) 99999-2222' },
  { id: 'agent-3', name: 'Ricardo Lima', email: 'ricardo@corretor.ai', password: 'password123', avatarUrl: 'https://i.pravatar.cc/150?u=agent-3', phone: '(11) 99999-3333' },
];

export const properties: Property[] = [
  {
    id: 'prop-1',
    title: 'Apartamento Moderno no Centro',
    type: PropertyType.Apartamento,
    location: { bairro: 'Centro', cidade: 'São Paulo' },
    price: 850000,
    area: 90,
    bedrooms: 2,
    bathrooms: 2,
    garageSpaces: 1,
    agentId: 'agent-1',
    images: ['https://picsum.photos/seed/prop1/800/600', 'https://picsum.photos/seed/prop1-2/800/600'],
    status: PropertyStatus.Disponivel,
  },
  {
    id: 'prop-2',
    title: 'Casa Espaçosa com Quintal',
    type: PropertyType.Casa,
    location: { bairro: 'Jardins', cidade: 'São Paulo' },
    price: 2500000,
    area: 350,
    bedrooms: 4,
    bathrooms: 5,
    garageSpaces: 4,
    agentId: 'agent-2',
    images: ['https://picsum.photos/seed/prop2/800/600', 'https://picsum.photos/seed/prop2-2/800/600'],
    status: PropertyStatus.Disponivel,
  },
  {
    id: 'prop-3',
    title: 'Sala Comercial na Av. Paulista',
    type: PropertyType.SalaComercial,
    location: { bairro: 'Bela Vista', cidade: 'São Paulo' },
    price: 1200000,
    area: 120,
    bedrooms: 0,
    bathrooms: 2,
    garageSpaces: 2,
    agentId: 'agent-1',
    images: ['https://picsum.photos/seed/prop3/800/600'],
    status: PropertyStatus.EmNegociacao,
  },
  {
    id: 'prop-4',
    title: 'Apartamento Aconchegante em Pinheiros',
    type: PropertyType.Apartamento,
    location: { bairro: 'Pinheiros', cidade: 'São Paulo' },
    price: 1100000,
    area: 110,
    bedrooms: 3,
    bathrooms: 2,
    garageSpaces: 2,
    agentId: 'agent-3',
    images: ['https://picsum.photos/seed/prop4/800/600'],
    status: PropertyStatus.Disponivel,
  },
   {
    id: 'prop-5',
    title: 'Casa Térrea em Moema',
    type: PropertyType.Casa,
    location: { bairro: 'Moema', cidade: 'São Paulo' },
    price: 3200000,
    area: 400,
    bedrooms: 3,
    bathrooms: 4,
    garageSpaces: 3,
    agentId: 'agent-2',
    images: ['https://picsum.photos/seed/prop5/800/600'],
    status: PropertyStatus.Vendido,
  },
  {
    id: 'prop-6',
    title: 'Terreno Plano em Interlagos',
    type: PropertyType.Terreno,
    location: { bairro: 'Interlagos', cidade: 'São Paulo' },
    price: 950000,
    area: 500,
    bedrooms: 0,
    bathrooms: 0,
    garageSpaces: 0,
    agentId: 'agent-3',
    images: ['https://picsum.photos/seed/prop6/800/600'],
    status: PropertyStatus.Disponivel,
  },
];

export const leads: Lead[] = [
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

export const interactions: Interaction[] = [
    { id: 'int-1', type: 'WhatsApp', date: '2024-07-28', content: 'Olá Mariana, recebi seu contato. Gostaria de agendar uma conversa?' },
    { id: 'int-2', type: 'Email', date: '2024-07-27', content: 'Envio de catálogo de imóveis na região dos Jardins.'},
    { id: 'int-3', type: 'Ligação', date: '2024-07-25', content: 'Conversamos sobre a proposta da sala comercial. Lead ficou de pensar.'},
];

const today = new Date();
const weekStart = _startOfWeek(today, { weekStartsOn: 1 });

export const visits: Visit[] = [
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

export const chatMessages: ChatMessage[] = [
    { id: 'msg-1', leadId: 'lead-1', content: 'Olá Mariana, tudo bem? Vi seu interesse em apartamentos no Centro. Tenho algumas opções ótimas para te mostrar!', timestamp: '2024-07-29T10:00:00Z', sender: 'agent', status: 'read' },
    { id: 'msg-2', leadId: 'lead-1', content: 'Olá! Tudo bem sim. Que legal! Tenho interesse sim, pode me mandar.', timestamp: '2024-07-29T10:01:00Z', sender: 'lead', status: 'read' },
    { id: 'msg-3', leadId: 'lead-1', content: 'Claro! O que acha deste? (Ref: prop-1)', timestamp: '2024-07-29T10:02:00Z', sender: 'agent', status: 'read' },
    { id: 'msg-4', leadId: 'lead-2', content: 'João, boa tarde. Alguma novidade sobre a proposta da casa nos Jardins?', timestamp: '2024-07-29T14:30:00Z', sender: 'agent', status: 'delivered' },
];