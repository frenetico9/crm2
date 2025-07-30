import { GoogleGenAI, Type } from "@google/genai";
import type { Lead, Property } from '../types';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  try {
    const { lead, properties } = req.body;

    if (!lead || !properties) {
        return res.status(400).json({ error: 'Lead ou propriedades não fornecidos.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const propertySuggestionSchema = {
        type: Type.OBJECT,
        properties: {
            suggestions: {
                type: Type.ARRAY,
                description: "Array com os IDs dos 3 imóveis mais recomendados para o cliente.",
                items: { type: Type.STRING }
            }
        },
        required: ['suggestions']
    };

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
    
    return res.status(200).json({ suggestions: parsedJson.suggestions || [] });

  } catch (error) {
    console.error("Error calling Gemini API for property suggestions:", error);
    return res.status(500).json({ error: "Erro ao buscar sugestões da IA." });
  }
}
