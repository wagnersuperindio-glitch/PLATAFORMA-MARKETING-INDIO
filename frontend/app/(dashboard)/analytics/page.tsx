'use client'
// M12 — Analytics: métricas de redes sociais, alcance, engajamento por loja
import { useState } from 'react'

const LOJAS_PERF = [
  { nome: 'Matriz',           seguidores: 8420, alcance: 14200, engajamento: 4.2, posts: 18, crescimento: +3.1 },
  { nome: 'Nestor',           seguidores: 5130, alcance: 8700,  engajamento: 3.8, posts: 14, crescimento: +2.4 },
  { nome: 'Centro',           seguidores: 4870, alcance: 7900,  engajamento: 3.5, posts: 12, crescimento: +1.9 },
  { nome: 'Passo Fundo',      seguidores: 3210, alcance: 5400,  engajamento: 4.7, posts: 16, crescimento: +5.2 },
  { nome: 'Eldorado Cidade Verde', seguidores: 2840, alcance: 4200, engajamento: 3.1, posts: 10, crescimento: +1.2 },
  { nome: 'Eldorado Centro',  seguidores: 2350, alcance: 3800,  engajamento: 3.3, posts: 11, crescimento: +2.7 },
  { nome: 'São Jerônimo',     seguidores: 1980, alcance: 3200,  engajamento: 5.1, posts: 9,  crescimento: +4.8 },
  { nome: 'Arroio dos Ratos', seguidores: 1640, alcance: 2700,  engajamento: 4.9, posts: 8,  crescimento: +3.6 },
  { nome: 'Charqueadas 1º Maio', seguidores: 3680, alcance: 6100, engajamento: 4.3, posts: 15, crescimento: +3.9 },
  { nome: 'Charqueadas S.Filho', seguidores: 3120, alcance: 5200, engajamento: 4.0, posts: 13, crescimento: +2.1 },
]

const CANAIS = [
  { nome: 'Instagram', icon: '📸', seguidores: 45240, crescimento: +3.2, alcance: 68400, engajamento: 4.1, cor: 'bg-pink-500' },
  { nome: 'Facebook',  icon: '👤', seguidores: 58100, crescimento: +0.8, alcance: 41200, engajamento: 1.9, cor: 'bg-blue-600' },
  { nome: 'TikTok',    icon: '🎵', seguidores: 2700,  crescimento: +12.4, alcance: 18900, engajamento: 8.7, cor: 'bg-gray-900' },
  { nome: 'WhatsApp',  icon: '💬', seguidores: 4059,  crescimento: +1.1, alcance: 4059,  engajamento: 76,  cor: 'bg-green-500' },
]

const TOP_POSTS = [
  { id: '1', tipo: 'REELS', titulo: 'Bastidores do Açougue — Corte Especial', canal: 'TikTok',    alcance: 42300, likes: 3840, comments: 214, data: '28/04/2026' },
  { id: '2', tipo: 'POST',  titulo: 'Sexta das Carnes — Alcatra R$29,90/kg',  canal: 'Instagram', alcance: 18700, likes: 2140, comments: 87,  data: '01/05/2026' },
  { id: '3', tipo: 'STORY', titulo: 'Promoção relâmpago FLV 40% off',        canal: 'Instagram', alcance: 14200, likes: 980,  comments: 41,  data: '29/04/2026' },
  { id: '4', tipo: 'POST',  titulo: 'Encarte Quinzenal #22 completo',         canal: 'Facebook',  alcance: 12800, likes: 420,  comments: 28,  data: '01/05/2026' },
  { id: '5', tipo: 'REELS', titulo: 'Tour pela Padaria do Índio',             canal: 'Instagram', alcance: 11400, likes: 1320, comments: 96,  data: '26/04/2026' },
]

const TIPO_COLOR: Record<string, string> = {
  REELS: 'bg-pink-100 text-pink-700',
  POST:  'bg-blue-100 text-blue-700',
  STORY: 'bg-purple-100 text-purple-700',
}

export default function AnalyticsPage() {
  const [periodo, setPeriodo] = useState('30d')
  const [viewLojas, setViewLojas] = useState(false)

  const totalAlcance = CANAIS.reduce((a, c) => a + c.alcance, 0)
  const totalSeguidores = CANAIS.slice(0, 3).reduce((a, c) => a + c.seguidores, 0) // IG+FB+TT

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Desempenho de redes sociais — todas as lojas</p>
        </div>
        <div className="flex gap-2">
          {['7d','30d','90d'].map(p => (
            <button key={p} onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                periodo === p ? 'bg-[#0066CC] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#0066CC]'
              }`}>
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Seguidores Totais',  value: totalSeguidores.toLocaleString('pt-BR'), delta: '+2.8%', icon: '👥', color: 'text-[#0066CC]' },
          { label: 'Alcance Total',      value: totalAlcance.toLocaleString('pt-BR'),    delta: '+5.1%', icon: '📡', color: 'text-purple-600' },
          { label: 'Posts Publicados',   value: '47',    delta: '+12 vs ant.', icon: '📸', color: 'text-green-600' },
          { label: 'Eng. Médio Instagram', value: '4.1%', delta: '+0.3pp',   icon: '❤️', color: 'text-orange-600' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl mb-1">{kpi.icon}</p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-green-600 mt-1 font-medium">↑ {kpi.delta}</p>
          </div>
        ))}
      </div>

      {/* Canais */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">📊 Desempenho por Canal</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {CANAIS.map((canal, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full ${canal.cor} flex items-center justify-center text-white text-lg`}>
                {canal.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-medium text-sm text-gray-800">{canal.nome}</p>
                  <span className="text-xs text-green-600 font-medium">↑ {canal.crescimento}%</span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>👥 {canal.seguidores.toLocaleString('pt-BR')}</span>
                  <span>📡 {canal.alcance.toLocaleString('pt-BR')}</span>
                  <span>❤️ {canal.engajamento}{canal.nome === 'WhatsApp' ? '%' : '%'} eng.</span>
                </div>
              </div>
              {/* Barra de alcance relativa */}
              <div className="w-24 hidden md:block">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${canal.cor} rounded-full`}
                    style={{ width: `${Math.round((canal.alcance / 70000) * 100)}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5 text-right">alcance</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Posts + Performance por Loja */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Top Posts */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">🏆 Top 5 Posts ({periodo})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {TOP_POSTS.map((post, i) => (
              <div key={post.id} className="px-4 py-3 flex items-start gap-3">
                <span className="text-sm font-bold text-gray-300 w-4 mt-0.5">#{i+1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TIPO_COLOR[post.tipo]}`}>{post.tipo}</span>
                    <span className="text-xs text-gray-400">{post.canal}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-800 leading-tight truncate">{post.titulo}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>📡 {post.alcance.toLocaleString('pt-BR')}</span>
                    <span>❤️ {post.likes.toLocaleString('pt-BR')}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance por Loja */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">🏪 Performance por Loja</h2>
            <button onClick={() => setViewLojas(v => !v)}
              className="text-xs text-[#0066CC] hover:underline">
              {viewLojas ? 'Menos' : 'Ver todas'}
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {(viewLojas ? LOJAS_PERF : LOJAS_PERF.slice(0,5)).map((loja, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300 w-4">#{i+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">Índio {loja.nome}</p>
                  <div className="flex gap-3 mt-0.5 text-xs text-gray-400">
                    <span>👥 {loja.seguidores.toLocaleString('pt-BR')}</span>
                    <span>❤️ {loja.engajamento}%</span>
                    <span>📝 {loja.posts} posts</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold ${loja.crescimento >= 4 ? 'text-green-600' : loja.crescimento >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  ↑{loja.crescimento}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights IA */}
      <div className="bg-gradient-to-r from-[#0066CC] to-[#0052A3] rounded-xl p-5 text-white">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="font-semibold text-sm mb-2">Insights Automáticos — IA</p>
            <ul className="space-y-1.5 text-blue-100 text-xs">
              <li>• <strong className="text-white">TikTok</strong> tem o maior crescimento (+12.4%) com menor investimento — dobrar frequência de Reels pode triplicar alcance</li>
              <li>• <strong className="text-white">São Jerônimo e Arroio dos Ratos</strong> lideram engajamento (5.1% e 4.9%) — conteúdo mais autêntico/local ressoa melhor</li>
              <li>• <strong className="text-white">Posts de Sexta das Carnes</strong> geram 2.3x mais alcance que posts genéricos — aumentar frequência de ofertas de carnes</li>
              <li>• <strong className="text-white">Horário ideal:</strong> Instagram 18h-20h seg-sex, TikTok 12h-14h e 19h-21h, Facebook 09h-11h</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
