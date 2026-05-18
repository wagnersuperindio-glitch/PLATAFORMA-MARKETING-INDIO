'use client'
import { useState } from 'react'

const APIS = [
  {
    id: 'gpt',
    icon: '🖼️',
    nome: 'GPT Image 2 — OpenAI',
    desc: 'Imagens fotorrealistas únicas para encartes e posts',
    status: 'Ativo',
    statusCor: 'green',
    campos: [
      { label: 'Chave', valor: 'OPENAI_API_KEY (variável de ambiente)' },
      { label: 'Script', valor: 'gerar_imagem_openai.py' },
      { label: 'Saída', valor: 'IMAGENS_GPT/' },
    ],
    cor: 'bg-orange-50',
  },
  {
    id: 'elevenlabs',
    icon: '🎙️',
    nome: 'ElevenLabs',
    desc: 'Voz Brian · Carro de Som · Anúncio interno · Spot rádio',
    status: 'Ativo',
    statusCor: 'green',
    campos: [
      { label: 'Chave', valor: 'ELEVENLABS_API_KEY (env)' },
      { label: 'Voice ID', valor: 'nPczCjzI2devNBz1zQrb (Brian)' },
      { label: 'Modelo', valor: 'eleven_multilingual_v2' },
    ],
    cor: 'bg-green-50',
  },
  {
    id: 'heygen',
    icon: '🎬',
    nome: 'HeyGen',
    desc: 'Avatares IA — Beto, Seu Neri, Dona Lurdes, Gabi, Gui',
    status: 'Ativo',
    statusCor: 'green',
    campos: [
      { label: 'API Key', valor: 'sk_V2_hgu_k02A6ukY405_... (env)' },
      { label: 'Voz', valor: 'Brazilian Sage — DSO7IzRInxN0WAxVa7ZY' },
      { label: 'MCP', valor: 'mcp__heygen__create_video_from_avatar' },
    ],
    cor: 'bg-blue-50',
  },
  {
    id: 'canva',
    icon: '🎨',
    nome: 'Canva MCP',
    desc: 'Brand Kit configurado · Encartes · Carrossel · Cardápio',
    status: 'Ativo',
    statusCor: 'green',
    campos: [
      { label: 'Brand Kit ID', valor: 'kAGIHh2J5xo' },
      { label: 'MCP Tool', valor: 'mcp__canva__generate-design' },
      { label: 'Cores', valor: '#0066CC + #FF6B00' },
    ],
    cor: 'bg-purple-50',
  },
  {
    id: 'meta',
    icon: '📲',
    nome: 'Meta API — Instagram + Facebook',
    desc: 'Publicação direta · Posts · Stories · Insights',
    status: 'Ativo',
    statusCor: 'green',
    campos: [
      { label: 'Token', valor: 'META_ACCESS_TOKEN — renovado 17/05/2026' },
      { label: 'Instagram ID', valor: '17841408006597613' },
      { label: 'Page ID', valor: '1598780677003934' },
    ],
    cor: 'bg-blue-50',
  },
  {
    id: 'whatsapp',
    icon: '💬',
    nome: 'WhatsApp Business API',
    desc: 'Disparos em massa · Campanhas · Templates aprovados',
    status: 'Dev Mode',
    statusCor: 'yellow',
    campos: [
      { label: 'Token', valor: 'WHATSAPP_TOKEN — Renovado 03/05/2026' },
      { label: 'Phone ID', valor: '1099952049866345' },
      { label: 'WABA ID', valor: '1499702754991827' },
    ],
    cor: 'bg-yellow-50',
    alerta: 'Em modo desenvolvimento — ative produção para disparos em massa.',
  },
  {
    id: 'capcut',
    icon: '🎵',
    nome: 'CapCut + Seedance 2.0',
    desc: 'Reels · TikTok · Vídeos curtos com IA',
    status: 'Disponível',
    statusCor: 'green',
    campos: [
      { label: 'User ID', valor: '7611692021371732993' },
      { label: 'Device ID', valor: '7611903508798932496' },
      { label: 'Fluxo', valor: 'CapCut → AI Video → TikTok' },
    ],
    cor: 'bg-pink-50',
  },
  {
    id: 'anthropic',
    icon: '🤖',
    nome: 'Anthropic Claude',
    desc: 'Geração de copy · Análise de concorrentes · Insights IA',
    status: 'Ativo',
    statusCor: 'green',
    campos: [
      { label: 'Chave', valor: 'ANTHROPIC_API_KEY (env)' },
      { label: 'Modelo copy', valor: 'claude-opus-4-5' },
      { label: 'Modelo rápido', valor: 'claude-haiku-4-5' },
    ],
    cor: 'bg-indigo-50',
  },
  {
    id: 'powerbi',
    icon: '📊',
    nome: 'Power BI',
    desc: 'Analytics & KPIs das 10 lojas',
    status: 'Ativo',
    statusCor: 'green',
    campos: [
      { label: 'Conta', valor: 'bi.indio@teleconsistemas.com.br' },
      { label: 'Dataset Gerencial', valor: '586615c6-7d19-44ce-af2d-359b40d9f4bf' },
      { label: 'Drive ENCARTES', valor: 'ID: 1zf02B3aBsWlh7P12GnR6kCeSXfkcTVxW' },
    ],
    cor: 'bg-blue-50',
  },
  {
    id: 'gemini',
    icon: '💡',
    nome: 'Google Gemini + Imagen 4',
    desc: 'IA alternativa · Geração de imagens · Análise visual',
    status: 'Ativo',
    statusCor: 'green',
    campos: [
      { label: 'Chave', valor: 'GEMINI_API_KEY (env)' },
      { label: 'Modelo', valor: 'gemini-2.0-flash' },
      { label: 'Imagens', valor: 'imagen-4' },
    ],
    cor: 'bg-yellow-50',
  },
  {
    id: 'r2',
    icon: '☁️',
    nome: 'Cloudflare R2',
    desc: 'Storage de imagens · Artes · Áudios · Encartes',
    status: 'Configurado',
    statusCor: 'green',
    campos: [
      { label: 'Bucket', valor: 'indio-marketing-assets' },
      { label: 'Provider', valor: 'r2 (S3-compatible)' },
      { label: 'Acesso', valor: 'STORAGE_* vars (env)' },
    ],
    cor: 'bg-orange-50',
  },
]

const STATUS_COR: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
}

export default function ApisPage() {
  const [busca, setBusca] = useState('')

  const filtradas = busca
    ? APIS.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase()) || a.desc.toLowerCase().includes(busca.toLowerCase()))
    : APIS

  const ativos = APIS.filter(a => a.statusCor === 'green').length
  const alertas = APIS.filter(a => a.statusCor === 'red' || a.statusCor === 'yellow').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">🔑 Conexões & APIs</h1>
        <p className="text-sm text-gray-500 mt-0.5">Todas as integrações configuradas — não reconfigurar sem necessidade</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{ativos}</p>
          <p className="text-xs text-green-600 font-medium">Ativos</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{alertas}</p>
          <p className="text-xs text-yellow-600 font-medium">Requerem atenção</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{APIS.length}</p>
          <p className="text-xs text-blue-600 font-medium">Total de integrações</p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-xl">✅</span>
        <div>
          <p className="font-bold text-green-800 text-sm">Meta API ativa</p>
          <p className="text-xs text-green-600 mt-1">Token renovado em 17/05/2026 — Instagram + Facebook funcionando. Próxima renovação: ~60 dias.</p>
        </div>
      </div>

      {/* Busca */}
      <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
        placeholder="Buscar integração..."
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]" />

      {/* Grid de APIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtradas.map(api => (
          <div key={api.id} className={`border rounded-xl overflow-hidden ${api.statusCor === 'red' ? 'border-red-200' : api.statusCor === 'yellow' ? 'border-yellow-200' : 'border-gray-200'}`}>
            {/* Header */}
            <div className={`${api.cor} px-5 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{api.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{api.nome}</p>
                  <p className="text-xs text-gray-500">{api.desc}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${STATUS_COR[api.statusCor]}`}>
                {api.status}
              </span>
            </div>

            {/* Campos */}
            <div className="bg-white px-5 py-3 divide-y divide-gray-50">
              {api.campos.map(c => (
                <div key={c.label} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-500 text-xs">{c.label}</span>
                  <span className="font-mono text-xs text-[#0066CC] font-semibold truncate max-w-[60%] text-right">{c.valor}</span>
                </div>
              ))}
            </div>

            {/* Alerta */}
            {api.alerta && (
              <div className="px-5 py-3 bg-yellow-50 border-t border-yellow-100 text-xs text-yellow-700">
                ⚠️ {api.alerta}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nota de segurança */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
        🔒 <strong>Segurança:</strong> Todas as chaves de API estão armazenadas como variáveis de ambiente no Railway/Vercel. Nunca commit chaves no código. As chaves visíveis acima são apenas IDs públicos ou referências.
      </div>
    </div>
  )
}
