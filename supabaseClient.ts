
import { createClient } from '@supabase/supabase-js'
import type { Agent, Lead, Notification, Property, Visit } from './types'

// By making the Insert and Update types explicit with type aliases, we help the
// TypeScript compiler avoid "Type instantiation is excessively deep" errors that
// can occur with complex nested generic types like Partial<Omit<...>>.

// --- Type Aliases for Table Operations ---

type AgentInsert = Omit<Agent, 'id' | 'email'>;
type AgentUpdate = Partial<Omit<Agent, 'id' | 'email'>>;

type PropertyInsert = Omit<Property, 'id' | 'created_at'>;
type PropertyUpdate = Partial<Omit<Property, 'id' | 'created_at'>>;

type LeadInsert = Omit<Lead, 'id' | 'created_at'>;
type LeadUpdate = Partial<Omit<Lead, 'id' | 'created_at'>>;

type VisitInsert = Omit<Visit, 'id' | 'created_at'>;
type VisitUpdate = Partial<Omit<Visit, 'id' | 'created_at'>>;

type NotificationInsert = Omit<Notification, 'id' | 'created_at'>;
type NotificationUpdate = Partial<Omit<Notification, 'id' | 'created_at'>>;


export interface Database {
  public: {
    Tables: {
      agents: {
        Row: Agent
        Insert: AgentInsert
        Update: AgentUpdate
      }
      properties: {
        Row: Property
        Insert: PropertyInsert
        Update: PropertyUpdate
      }
      leads: {
        Row: Lead
        Insert: LeadInsert
        Update: LeadUpdate
      }
      visits: {
        Row: Visit
        Insert: VisitInsert
        Update: VisitUpdate
      }
      notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: NotificationUpdate
      }
    }
    Views: {
      [_: string]: never
    }
    Functions: {
      [_: string]: never
    }
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
