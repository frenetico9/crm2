
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
  id: string; // This will be a UUID from Supabase Auth
  name: string;
  email: string;
  avatar_url: string;
  phone?: string | null;
}

export interface Property {
  id:string;
  created_at: string;
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
  garage_spaces: number;
  agent_id: string;
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
  created_at: string;
  name: string;
  email: string;
  phone: string;
  agent_id: string;
  status: LeadStatus;
  score: number;
  last_contact: string;
  interest: {
    type: PropertyType[];
    bairro: string[];
    priceRange: [number, number];
  };
  whatsapp_history?: WhatsappMessage[];
}

export interface Visit {
  id: string;
  created_at: string;
  title: string;
  start: string; // ISO String
  end: string;   // ISO String
  agent_id: string;
  lead_id: string;
  property_id: string;
}

export interface Notification {
  id: string;
  created_at: string;
  user_id: string;
  type: 'new_lead' | 'visit_reminder' | 'message';
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
  link?: string;
}
