import type { Lead, Property } from './types';

// O frontend NÃO tem mais acesso direto à API do Gemini.
// As funções agora atuam como clientes para o nosso próprio backend (serverless functions).

export const getPropertySuggestions = async (lead: Lead, properties: Property[]): Promise<string[]> => {
    try {
        const response = await fetch('/api/propertySuggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lead, properties }),
        });

        if (!response.ok) {
            console.error("Error from backend:", await response.text());
            return [];
        }

        const data = await response.json();
        return data.suggestions || [];

    } catch (error) {
        console.error("Error calling /api/propertySuggestions:", error);
        return [];
    }
};

export const getPropertyDescription = async (property: Omit<Property, 'images' | 'agentId' | 'status' | 'id'>): Promise<string> => {
    try {
        const response = await fetch('/api/generateDescription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ property }),
        });

        if (!response.ok) {
             console.error("Error from backend:", await response.text());
            return "Erro ao contatar a IA para gerar a descrição.";
        }

        const data = await response.json();
        return data.description || "Não foi possível gerar uma descrição.";

    } catch (error) {
        console.error("Error calling /api/generateDescription:", error);
        return "Erro ao contatar a IA para gerar a descrição.";
    }
};


export const getWhatsappSuggestion = async (lead: Lead): Promise<string> => {
    try {
        const response = await fetch('/api/whatsappSuggestion', {
             method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lead }),
        });
        
        if (!response.ok) {
            console.error("Error from backend:", await response.text());
            return "Erro ao contatar a IA para gerar a sugestão.";
        }
        
        const data = await response.json();
        return data.message || "Não foi possível gerar uma sugestão.";

    } catch (error) {
        console.error("Error calling /api/whatsappSuggestion:", error);
        return "Erro ao contatar a IA para gerar a sugestão.";
    }
};
