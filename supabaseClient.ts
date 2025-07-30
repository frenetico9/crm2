

import { createClient } from '@supabase/supabase-js'
import type { Agent, Lead, Notification, Property, Visit, PropertyType, PropertyStatus, LeadStatus, WhatsappMessage } from './types'

// By making the Insert and Update types explicit, we resolve the
// "Type instantiation is excessively deep" error that was occurring due to
// the complexity of nested generic types like Partial<Omit<...>>.
export interface Database {
  public: {
    Tables: {
      agents: {
        Row: Agent
        Insert: {
          name: string;
          avatar_url: string;
          phone?: string;
        }
        Update: {
          name?: string;
          avatar_url?: string;
          phone?: string;
        }
      }
      properties: {
        Row: Property
        Insert: {
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
        Update: {
          title?: string;
          type?: PropertyType;
          description?: string;
          location?: {
            bairro: string;
            cidade: string;
          };
          price?: number;
          area?: number;
          bedrooms?: number;
          bathrooms?: number;
          garage_spaces?: number;
          agent_id?: string;
          images?: string[];
          status?: PropertyStatus;
        }
      }
      leads: {
        Row: Lead
        Insert: {
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
        Update: {
          name?: string;
          email?: string;
          phone?: string;
          agent_id?: string;
          status?: LeadStatus;
          score?: number;
          last_contact?: string;
          interest?: {
            type: PropertyType[];
            bairro: string[];
            priceRange: [number, number];
          };
          whatsapp_history?: WhatsappMessage[];
        }
      }
      visits: {
        Row: Visit
        Insert: {
          title: string;
          start: string;
          end: string;
          agent_id: string;
          lead_id: string;
          property_id: string;
        }
        Update: {
          title?: string;
          start?: string;
          end?: string;
          agent_id?: string;
          lead_id?: string;
          property_id?: string;
        }
      }
      notifications: {
        Row: Notification
        Insert: {
          user_id: string;
          type: 'new_lead' | 'visit_reminder' | 'message';
          title: string;
          content: string;
          timestamp: string;
          read: boolean;
          link?: string;
        }
        Update: {
          user_id?: string;
          type?: 'new_lead' | 'visit_reminder' | 'message';
          title?: string;
          content?: string;
          timestamp?: string;
          read?: boolean;
          link?: string;
        }
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
