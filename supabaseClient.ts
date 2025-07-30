import { createClient } from '@supabase/supabase-js'
import type { Agent, Lead, Notification, Property, Visit, PropertyType, PropertyStatus, LeadStatus, WhatsappMessage } from './types'

// By creating fully explicit types for database operations, we avoid complex
// generics like Partial<Omit<T, K>> which can cause the TypeScript compiler
// to fail with "Type instantiation is excessively deep" errors.

type AgentInsertPayload = {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  phone?: string | null;
};

type AgentUpdatePayload = {
  name?: string;
  avatar_url?: string;
  phone?: string | null;
};

type PropertyInsertPayload = {
  title: string;
  type: PropertyType;
  description: string;
  location: { bairro: string; cidade: string; };
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  garage_spaces: number;
  agent_id: string;
  images: string[];
  status: PropertyStatus;
};

type PropertyUpdatePayload = {
    title?: string;
    type?: PropertyType;
    description?: string;
    location?: { bairro: string; cidade: string; };
    price?: number;
    area?: number;
    bedrooms?: number;
    bathrooms?: number;
    garage_spaces?: number;
    agent_id?: string;
    images?: string[];
    status?: PropertyStatus;
};

type LeadInsertPayload = {
    name: string;
    email: string;
    phone: string;
    agent_id: string;
    status: LeadStatus;
    score: number;
    last_contact: string;
    interest: { type: PropertyType[]; bairro: string[]; priceRange: [number, number]; };
    whatsapp_history?: WhatsappMessage[];
};

type LeadUpdatePayload = {
    name?: string;
    email?: string;
    phone?: string;
    agent_id?: string;
    status?: LeadStatus;
    score?: number;
    last_contact?: string;
    interest?: { type: PropertyType[]; bairro: string[]; priceRange: [number, number]; };
    whatsapp_history?: WhatsappMessage[];
};

type VisitInsertPayload = {
    title: string;
    start: string;
    end: string;
    agent_id: string;
    lead_id: string;
    property_id: string;
};

type VisitUpdatePayload = {
    title?: string;
    start?: string;
    end?: string;
    agent_id?: string;
    lead_id?: string;
    property_id?: string;
};


type NotificationInsertPayload = {
    user_id: string;
    type: 'new_lead' | 'visit_reminder' | 'message';
    title: string;
    content: string;
    timestamp: string;
    read: boolean;
    link?: string;
};

type NotificationUpdatePayload = {
    user_id?: string;
    type?: 'new_lead' | 'visit_reminder' | 'message';
    title?: string;
    content?: string;
    timestamp?: string;
    read?: boolean;
    link?: string;
};


export interface Database {
  public: {
    Tables: {
      agents: {
        Row: Agent;
        Insert: AgentInsertPayload;
        Update: AgentUpdatePayload;
      };
      properties: {
        Row: Property;
        Insert: PropertyInsertPayload;
        Update: PropertyUpdatePayload;
      };
      leads: {
        Row: Lead;
        Insert: LeadInsertPayload;
        Update: LeadUpdatePayload;
      };
      visits: {
        Row: Visit;
        Insert: VisitInsertPayload;
        Update: VisitUpdatePayload;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsertPayload;
        Update: NotificationUpdatePayload;
      };
    };
    Views: {
      [_: string]: never;
    };
    Functions: {
      [_: string]: never;
    };
  }
}

// O CLIENTE NÃO É MAIS CRIADO DIRETAMENTE AQUI.
// EM VEZ DISSO, EXPORTAMOS UMA FUNÇÃO QUE FAZ ISSO DE FORMA ASSÍNCRONA.
export const createSupabaseClient = async () => {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
        throw new Error(`Falha ao buscar configuração do servidor: ${response.statusText}`);
    }
    const config = await response.json();

    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error("As variáveis de ambiente do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) não foram encontradas no backend. Verifique o painel da Vercel.");
    }
    
    // Agora, com a certeza de ter as chaves, criamos e retornamos o cliente.
    return createClient<Database>(config.supabaseUrl, config.supabaseAnonKey);

  } catch (error) {
    console.error("Erro Crítico: Não foi possível inicializar o Supabase.", error);
    // Retorna null ou lança o erro para que a aplicação possa lidar com isso.
    return null;
  }
};
