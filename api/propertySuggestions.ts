import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js'
import type { Lead } from '../types';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  try {
    const { lead } = req.body;

    if (!lead) {
        return res.status(400).json({ error: 'Lead não fornecido.' });
    }
    
    // Inicializa o cliente Supabase com a chave de serviço para acesso de administrador no backend.
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Busca as propriedades disponíveis diretamente do banco de dados.
    const { data: properties, error: dbError } = await supabaseAdmin
        .from('properties')
        .select('id, title, type, location, price, area, bedrooms')
        .eq('status', 'Disponível');

    if (dbError) throw dbError;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
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

    const prompt = `
        Analise o seguinte perfil de cliente e a lista de imóveis disponíveis.
        Perfil do Cliente:
        - Interesses de tipo de imóvel: ${lead.interest.type.join(', ')}
        - Bairros de interesse: ${lead.interest.bairro.join(', ')}
        - Faixa de preço: R$${lead.interest.priceRange[0].toLocaleString('pt-BR')} a R$${lead.interest.priceRange[1].toLocaleString('pt-BR')}
        
        Imóveis Disponíveis (JSON):
        ${JSON.stringify(properties)}

        Com base na análise, retorne um objeto JSON com uma chave "suggestions" contendo um array com os IDs dos 3 imóveis que melhor correspondem aos interesses do cliente, em ordem de relevância. Se nenhum for compatível, retorne um array vazio.
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
    console.error("Error calling API for property suggestions:", error);
    return res.status(500).json({ error: "Erro ao buscar sugestões da IA." });
  }
}