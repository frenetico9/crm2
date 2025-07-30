
// Este é um endpoint que roda no servidor (serverless function).
// Ele tem acesso seguro às variáveis de ambiente.

export default async function handler(req, res) {
  // Garante que só aceitamos requisições GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Envia APENAS as chaves PÚBLICAS para o frontend.
  // As chaves secretas (service_role, gemini) NUNCA devem ser enviadas.
  // Os nomes aqui devem corresponder EXATAMENTE aos definidos no painel da Vercel.
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  });
}
