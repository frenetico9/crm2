export enum LeadStatus {
  Novo = 'Novo',
  EmNegociacao = 'Em Negociação',
  Visitou = 'Visitou',
  Fechado = 'Fechado',
  Perdido = 'Perdido',
}

export enum PropertyStatus {
  Disponivel = 'Disponível',
  Vendido = 'Vendido',
  EmNegociacao = 'Em Negociação',
}

export enum PropertyType {
    Apartamento = 'Apartamento',
    Casa = 'Casa',
    SalaComercial = 'Sala Comercial',
    Terreno = 'Terreno'
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl: string;
  phone?: string;
}

export interface Property {
  id:string;
  title: string;
  type: PropertyType;
  description: string;
  location: {
    bairro: string;
    cidade: string;
  };
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  garageSpaces: number;
  agentId: string;
  images: string[];
  status: PropertyStatus;
}

export interface WhatsappMessage {
  id: string;
  content: string;
  timestamp: string; // ISO string
  sender: 'agent' | 'lead';
  status: 'sent' | 'delivered' | 'read';
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  agentId: string;
  status: LeadStatus;
  score: number;
  lastContact: string;
  interest: {
    type: PropertyType[];
    bairro: string[];
    priceRange: [number, number];
  };
  whatsappHistory?: WhatsappMessage[];
}

export interface Interaction {
  id: string;
  type: 'WhatsApp' | 'Email' | 'Ligação';
  date: string;
  content: string;
}

export interface Visit {
  id: string;
  title: string;
  start: Date;
  end: Date;
  agentId: string;
  leadId: string;
  propertyId: string;
}

export interface Notification {
  id: string;
  type: 'new_lead' | 'visit_reminder' | 'message';
  title: string;
  content: string;
  timestamp: string; // ISO string
  read: boolean;
  link?: string;
}
