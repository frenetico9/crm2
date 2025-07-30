import { GoogleGenAI, Type } from "@google/genai";
import type { Lead } from '../types';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { lead } = req.body;
    if (!lead) {
      return res.status(400).json({ error: 'Dados do lead não fornecidos.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const whatsappSuggestionSchema = {
        type: Type.OBJECT,
        properties: {
            message: {
                type: Type.STRING,
                description: "A mensagem de WhatsApp sugerida."
            }
        },
        required: ['message']
    };

    const lastAgentMessage = lead.whatsappHistory?.filter(m => m.sender === 'agent').pop();
    const prompt = `
        Você é um corretor de imóveis proativo e amigável. Seu objetivo é reengajar um cliente (lead) de forma natural e eficaz.
        Analise o perfil do lead e, se houver, a última mensagem que você enviou.
        Crie uma mensagem de acompanhamento curta e personalizada para o WhatsApp. A mensagem não deve parecer automática.
        Seja criativo: sugira um novo imóvel, pergunte sobre a busca, ou ofereça ajuda.
        Perfil do Lead:
        - Nome: ${lead.name}
        - Interesses: ${lead.interest.type.join(', ')} nos bairros ${lead.interest.bairro.join(', ')}
        - Orçamento: ${lead.interest.priceRange[0].toLocaleString('pt-BR')} a ${lead.interest.priceRange[1].toLocaleString('pt-BR')}
        Sua última mensagem enviada (se houver):
        - Conteúdo: ${lastAgentMessage?.content || 'Nenhuma mensagem anterior registrada.'}
        - Data: ${lastAgentMessage?.timestamp ? new Date(lastAgentMessage.timestamp).toLocaleDateString('pt-BR') : 'N/A'}
        Gere uma nova mensagem para enviar hoje. Retorne um objeto JSON com uma chave "message".
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: whatsappSuggestionSchema
        }
    });
    
    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    return res.status(200).json({ message: parsedJson.message || "Não foi possível gerar uma sugestão." });

  } catch (error) {
    console.error("Error calling Gemini API for whatsapp suggestion:", error);
    return res.status(500).json({ error: "Erro ao contatar a IA para gerar a sugestão." });
  }
}
