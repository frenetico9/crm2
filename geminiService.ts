
import { GoogleGenAI, Type } from "@google/genai";
import type { Lead, Property } from './types';

const API_KEY = "AIzaSyDvl2fmUZ-H10AJ0BmLGRVfX98tOW8PDdY";

if (!API_KEY) {
  console.error("API key not provided. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const propertySuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "Array com os IDs dos 3 imóveis mais recomendados para o cliente.",
            items: {
                type: Type.STRING
            }
        }
    },
    required: ['suggestions']
};


export const getPropertySuggestions = async (lead: Lead, properties: Property[]): Promise<string[]> => {
    if (!API_KEY) {
        console.error("Cannot get property suggestions because API key is missing.");
        return [];
    }
    
    try {
        const relevantProperties = properties.filter(p => p.status === 'Disponível');

        const prompt = `
            Analise o seguinte perfil de cliente e a lista de imóveis disponíveis.
            
            Perfil do Cliente:
            - Interesses de tipo de imóvel: ${lead.interest.type.join(', ')}
            - Bairros de interesse: ${lead.interest.bairro.join(', ')}
            - Faixa de preço: R$${lead.interest.priceRange[0].toLocaleString('pt-BR')} a R$${lead.interest.priceRange[1].toLocaleString('pt-BR')}

            Imóveis Disponíveis (JSON):
            ${JSON.stringify(relevantProperties.map(p => ({id: p.id, title: p.title, type: p.type, location: p.location, price: p.price, area: p.area, bedrooms: p.bedrooms})))}

            Com base na análise, retorne um objeto JSON com uma chave "suggestions" contendo um array com os IDs dos 3 imóveis que melhor correspondem aos interesses do cliente, em ordem de relevância.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: propertySuggestionSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        if (parsedJson && parsedJson.suggestions && Array.isArray(parsedJson.suggestions)) {
            return parsedJson.suggestions;
        }
        
        return [];

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return [];
    }
};
