import { GoogleGenAI, Type } from "@google/genai";
import type { Property } from '../types';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const propertyDetails = req.body.property;
    if (!propertyDetails) {
      return res.status(400).json({ error: 'Detalhes do imóvel não fornecidos.' });
    }
    
    // A chave de API é lida das variáveis de ambiente do servidor, com segurança.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const propertyDescriptionSchema = {
      type: Type.OBJECT,
      properties: {
        description: {
          type: Type.STRING,
          description: "A descrição de marketing gerada para o imóvel."
        }
      },
      required: ['description']
    };

    const prompt = `
        Você é um especialista em marketing imobiliário. Crie uma descrição de venda cativante e profissional para o seguinte imóvel.
        Destaque os pontos fortes, o estilo de vida que ele proporciona e os principais atrativos da localização. Seja eloquente e persuasivo.

        Detalhes do Imóvel:
        - Título: ${propertyDetails.title}
        - Tipo: ${propertyDetails.type}
        - Bairro: ${propertyDetails.location.bairro}, ${propertyDetails.location.cidade}
        - Preço: R$ ${propertyDetails.price.toLocaleString('pt-BR')}
        - Área: ${propertyDetails.area} m²
        - Quartos: ${propertyDetails.bedrooms}
        - Banheiros: ${propertyDetails.bathrooms}
        - Vagas de Garagem: ${propertyDetails.garageSpaces}

        Retorne um objeto JSON com uma chave "description" contendo o texto gerado.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: propertyDescriptionSchema
        }
    });
    
    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    return res.status(200).json({ description: parsedJson.description || "Não foi possível gerar uma descrição." });

  } catch (error) {
    console.error("Erro na API /api/generateDescription:", error);
    return res.status(500).json({ error: "Erro ao contatar a IA." });
  }
}
