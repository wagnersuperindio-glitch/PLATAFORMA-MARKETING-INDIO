'use client'
// M3 — Templates de Encarte e Post — prévia + geração com IA
import { useState } from 'react'
import Link from 'next/link'

const TEMPLATES = [
  {
    id: 'esmaga-precos-1',
    nome: 'Esmaga Preços — Mercearia',
    formato: 'Feed 1080×1080',
    categoria: 'ENCARTE',
    canal: 'Instagram · Facebook',
    descricao: 'Campanha Final de Semana — Pág 1/3. Mercearia e Laticínios com espaços editáveis para preços.',
    emoji: '🛒',
    cor: 'bg-blue-900',
    arquivo: '/templates/esmaga-precos-1-mercearia.html',
    produtos: 12,
  },
  {
    id: 'esmaga-precos-2',
    nome: 'Esmaga Preços — Açougue',
    formato: 'Feed 1080×1080',
    categoria: 'CARNE',
    canal: 'Instagram · Facebook',
    descricao: 'Campanha Final de Semana — Pág 2/3. Açougue e Bebidas com espaços editáveis para preços.',
    emoji: '🥩',
    cor: 'bg-red-900',
    arquivo: '/templates/esmaga-precos-2-acougue.html',
    produtos: 15,
  },
  {
    id: 'esmaga-precos-3',
    nome: 'Esmaga Preços — FLV & Frios',
    formato: 'Feed 1080×1080',
    categoria: 'FLV',
    canal: 'Instagram · Facebook',
    descricao: 'Campanha Final de Semana — Pág 3/3. Hortifruti, Congelados e Frios com espaços para preços.',
    emoji: '🥦',
    cor: 'bg-green-900',
    arquivo: '/templates/esmaga-precos-3-flv-congelados.html',
    produtos: 15,
  },
  {
    id: 'sexta-carnes-feed',
    nome: 'Sexta das Carnes',
    formato: 'Feed 1080×1080',
    categoria: 'CARNE',
    canal: 'Instagram',
    descricao: 'Post semanal para promoção de carnes às sextas-feiras. 3 produtos em destaque.',
    emoji: '🥩',
    cor: 'bg-red-900',
    arquivo: '/templates/sexta-carnes-feed.html',
    produtos: 3,
  },
  {
    id: 'quarta-horti-feed',
    nome: 'Quarta do Horti',
    formato: 'Feed 1080×1080',
    categoria: 'FLV',
    canal: 'Instagram',
    descricao: 'Post semanal para promoções de hortifruti às quartas-feiras. 8 produtos em grade.',
    emoji: '🥦',
    cor: 'bg-green-900',
    arquivo: '/templates/quarta-horti-feed.html',
    produtos: 8,
  },
  {
    id: 'encarte-quinzenal-a4',
    nome: 'Encarte Quinzenal',
    formato: 'A4 (794×1123px)',
    categoria: 'ENCARTE',
    canal: 'WhatsApp + PDF',
    descricao: 'Encarte completo quinzenal com destaque, açougue, FLV, mercearia e Clube Mais.',
    emoji: '📄',
    cor: 'bg-blue-900',
    arquivo: '/templates/encarte-quinzenal-a4.html',
    produtos: 10,
  },
  {
    id: 'story-oferta',
    nome: 'Story Oferta Relâmpago',
    formato: 'Story 1080×1920',
    categoria: 'OFERTA',
    canal: 'Instagram Stories',
    descricao: 'Story de urgência para uma oferta relâmpago com um produto em destaque máximo.',
    emoji: '⚡',
    cor: 'bg-indigo-900',
    arquivo: '/templates/story-oferta.html',
    produtos: 1,
  },
  {
    id: 'coming-soon-1',
    nome: 'Post Padaria',
    formato: 'Feed 1080×1080',
    categoria: 'PADARIA',
    canal: 'Instagram',
    descricao: 'Template para promoções da padaria — pães, bolos e confeitaria.',
    emoji: '🥐',
    cor: 'bg-amber-900',
    arquivo: null,
    produtos: 4,
  },
  {
    id: 'coming-soon-2',
    nome: 'Clube Mais',
    formato: 'Feed 1080×1080',
    categoria: 'FIDELIDADE',
    canal: 'Instagram',
    descricao: 'Post para comunicação de benefícios e pontos do Clube Mais.',
    emoji: '⭐',
    cor: 'bg-orange-900',
    arquivo: null,
    produtos: 0,
  },
]

const CAT_COLOR: Record<string, string> = {
  CARNE:    'bg-red-100 text-red-700',
  FLV:      'bg-green-100 text-green-700',
  ENCARTE:  'bg-blue-100 text-blue-700',
  OFERTA:   'bg-purple-100 text-purple-700',
  PADARIA:  'bg-amber-100 text-amber-700',
  FIDELIDADE:'bg-orange-100 text-orange-700',
}

export default function TemplatesPage() {
  const [preview, setPreview] = useState<typeof TEMPLATES[0] | null>(null)
  const [filtro, setFiltro] = useState('TODOS')

  const filtrados = filtro === 'TODOS' ? TEMPLATES : TEMPLATES.filter(t => t.categoria === filtro)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Templates de Arte</h1>
          <p className="text-sm text-gray-500 mt-0.5">{TEMPLATES.filter(t => t.arquivo).length} templates prontos — edite os preços e gere a arte</p>
        </div>
        <Link href="/pedidos/novo"
          className="px-4 py-2.5 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0052A3] transition-colors">
          + Novo Pedido com Template
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['TODOS','ENCARTE','CARNE','FLV','OFERTA','PADARIA','FIDELIDADE'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filtro === f ? 'bg-[#0066CC] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f === 'TODOS' ? 'Todos' : f}
          </button>
        ))}
      </div>

      {/* Grid de templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtrados.map(tmpl => (
          <div key={tmpl.id} className={`rounded-xl overflow-hidden border ${tmpl.arquivo ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-60'}`}>
            {/* Preview colorido */}
            <div className={`${tmpl.cor} h-36 flex flex-col items-center justify-center gap-2 relative`}>
              <span className="text-5xl">{tmpl.emoji}</span>
              <span className="text-white font-bold text-sm">{tmpl.formato}</span>
              {!tmpl.arquivo && (
                <div className="absolute top-2 right-2 bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded">Em breve</div>
              )}
            </div>

            {/* Info */}
            <div className="bg-white p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">{tmpl.nome}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${CAT_COLOR[tmpl.categoria]}`}>{tmpl.categoria}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">{tmpl.descricao}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span>📱 {tmpl.canal}</span>
                <span>•</span>
                <span>🛒 {tmpl.produtos} produto{tmpl.produtos !== 1 ? 's' : ''}</span>
              </div>

              {tmpl.arquivo ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreview(tmpl)}
                    className="flex-1 py-2 text-xs font-medium text-[#0066CC] border border-[#0066CC] rounded-lg hover:bg-blue-50 transition-colors">
                    👁️ Visualizar
                  </button>
                  <a href={tmpl.arquivo} target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-2 text-xs font-medium text-white bg-[#0066CC] rounded-lg hover:bg-[#0052A3] transition-colors text-center">
                    📥 Abrir
                  </a>
                </div>
              ) : (
                <button disabled className="w-full py-2 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed">
                  Em desenvolvimento
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Como usar */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-900 text-sm mb-3">💡 Como usar os templates</h3>
        <div className="grid md:grid-cols-3 gap-4 text-xs text-blue-800">
          <div>
            <p className="font-semibold mb-1">1. Abre o template</p>
            <p>Clique em "Abrir" — o arquivo HTML abre no navegador exatamente no tamanho certo para a rede social.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">2. Edita os preços</p>
            <p>Botão direito → "Inspecionar" → edite os valores diretamente no código HTML. Os preços ficam instantâneos.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">3. Captura a tela</p>
            <p>Use Ctrl+Shift+S (screenshot completo) ou o DevTools → "Capture screenshot" para salvar em PNG.</p>
          </div>
        </div>
      </div>

      {/* Modal preview */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">{preview.nome}</h3>
                <p className="text-xs text-gray-400">{preview.formato}</p>
              </div>
              <div className="flex gap-2">
                <a href={preview.arquivo!} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0052A3]">
                  Abrir em tela cheia
                </a>
                <button onClick={() => setPreview(null)} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-xl">✕</button>
              </div>
            </div>
            <div className="p-4 bg-gray-100 flex items-center justify-center min-h-[400px]">
              <iframe
                src={preview.arquivo!}
                className="rounded-lg shadow-xl"
                style={{ width: '540px', height: '540px', transform: 'scale(1)', transformOrigin: 'center' }}
                title={preview.nome}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
