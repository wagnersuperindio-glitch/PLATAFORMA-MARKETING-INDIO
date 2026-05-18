'use client'
import { useState } from 'react'

const TEMPLATES = [
  // ─── SEMANAIS ─────────────────────────────────────────────
  { id: 'sexta-carnes',     nome: 'Sexta das Carnes',        formato: 'Feed 1080×1080',  categoria: 'SEMANAL', canal: 'Instagram · Facebook', descricao: 'Post semanal para promoção de carnes às sextas-feiras. 3 produtos em destaque.', emoji: '🥩', bgFrom: '#8B0000', bgTo: '#0A0A0A', arquivo: '/templates/sexta-carnes-feed.html',      produtos: 3  },
  { id: 'quarta-horti',     nome: 'Quarta do Horti',         formato: 'Feed 1080×1080',  categoria: 'SEMANAL', canal: 'Instagram · Facebook', descricao: 'Post semanal para promoções de hortifruti às quartas-feiras. 8 produtos em grade.', emoji: '🥦', bgFrom: '#1a5c1a', bgTo: '#060e06', arquivo: '/templates/quarta-horti-feed.html',      produtos: 8  },
  // ─── ENCARTES ─────────────────────────────────────────────
  { id: 'encarte-quinzenal',nome: 'Encarte Quinzenal',        formato: 'A4 (794×1123px)', categoria: 'ENCARTE', canal: 'WhatsApp + PDF',        descricao: 'Encarte completo quinzenal com destaque, açougue, FLV, mercearia e Clube Mais.', emoji: '📄', bgFrom: '#0066CC', bgTo: '#004099', arquivo: '/templates/encarte-quinzenal-a4.html',   produtos: 10 },
  { id: 'esmaga-1',         nome: 'Esmaga Preços — Mercearia',formato: 'Feed 1080×1080',  categoria: 'ENCARTE', canal: 'Instagram · Facebook', descricao: 'Campanha Final de Semana — Mercearia e Laticínios.', emoji: '🛒', bgFrom: '#1e3a5f', bgTo: '#0a1a2e', arquivo: '/templates/esmaga-precos-1-mercearia.html', produtos: 12 },
  { id: 'esmaga-2',         nome: 'Esmaga Preços — Açougue', formato: 'Feed 1080×1080',  categoria: 'ENCARTE', canal: 'Instagram · Facebook', descricao: 'Campanha Final de Semana — Açougue e Bebidas.', emoji: '🥩', bgFrom: '#5c0a0a', bgTo: '#1a0000', arquivo: '/templates/esmaga-precos-2-acougue.html',  produtos: 15 },
  { id: 'esmaga-3',         nome: 'Esmaga Preços — FLV',     formato: 'Feed 1080×1080',  categoria: 'ENCARTE', canal: 'Instagram · Facebook', descricao: 'Campanha Final de Semana — Hortifruti, Congelados e Frios.', emoji: '🥦', bgFrom: '#1a4a1a', bgTo: '#050e05', arquivo: '/templates/esmaga-precos-3-flv-congelados.html', produtos: 15 },
  { id: 'story-oferta',     nome: 'Story Oferta Relâmpago',  formato: 'Story 1080×1920', categoria: 'STORY',   canal: 'Instagram Stories',   descricao: 'Story de urgência para uma oferta relâmpago com um produto em destaque.', emoji: '⚡', bgFrom: '#1a0050', bgTo: '#05001a', arquivo: '/templates/story-oferta.html',           produtos: 1  },
  // ─── SAZONAIS ─────────────────────────────────────────────
  { id: 'natal',            nome: 'Natal da Economia',       formato: 'Feed 1080×1080',  categoria: 'SAZONAL', canal: 'Instagram · Facebook · WhatsApp', descricao: 'Natal especial com ofertas de fim de ano: Peru, Espumante, Panetone.', emoji: '🎄', bgFrom: '#1a4a1a', bgTo: '#050e05', arquivo: '/templates/natal-economia.html',         produtos: 3  },
  { id: 'pascoa',           nome: 'Páscoa em Oferta',        formato: 'Feed 1080×1080',  categoria: 'SAZONAL', canal: 'Instagram · Facebook · WhatsApp', descricao: 'Semana Santa — Ovos de Páscoa, Bacalhau, Salmão.', emoji: '🐣', bgFrom: '#3a0a6e', bgTo: '#1a0a3e', arquivo: '/templates/pascoa-oferta.html',          produtos: 4  },
  { id: 'maes',             nome: 'Dia das Mães',            formato: 'Feed 1080×1080',  categoria: 'SAZONAL', canal: 'Instagram · Facebook · WhatsApp', descricao: 'Homenagem com ofertas especiais — Tortas, Vinho, Chocolates.', emoji: '💐', bgFrom: '#5c0a30', bgTo: '#1a040e', arquivo: '/templates/dia-das-maes.html',           produtos: 4  },
  { id: 'junina',           nome: 'Festa Junina',            formato: 'Feed 1080×1080',  categoria: 'SAZONAL', canal: 'Instagram · Facebook · WhatsApp', descricao: 'Arraial do Índio — Milho, Canjica, Amendoim, Mandioca.', emoji: '🎪', bgFrom: '#3d1a00', bgTo: '#0a0500', arquivo: '/templates/festa-junina.html',           produtos: 4  },
  { id: 'black-friday',     nome: 'Black Friday',            formato: 'Feed 1080×1080',  categoria: 'SAZONAL', canal: 'Instagram · Facebook · WhatsApp', descricao: 'Black Friday Índio com preços arrasadores e % de desconto em destaque.', emoji: '🔥', bgFrom: '#1a0000', bgTo: '#000000', arquivo: '/templates/black-friday.html',           produtos: 3  },
  { id: 'farroupilha',      nome: 'Semana Farroupilha',      formato: 'Feed 1080×1080',  categoria: 'SAZONAL', canal: 'Instagram · Facebook · WhatsApp', descricao: 'Gaúcho de coração — 20 de Setembro com Costela, Chimarrão, Cerveja.', emoji: '🐎', bgFrom: '#1a0a00', bgTo: '#050200', arquivo: '/templates/farroupilha.html',            produtos: 4  },
  { id: 'criancas',         nome: 'Dia das Crianças',        formato: 'Feed 1080×1080',  categoria: 'SAZONAL', canal: 'Instagram · Facebook · WhatsApp', descricao: '12 de Outubro — Doces, Sorvete, Suquinho, Bolo.', emoji: '🎉', bgFrom: '#1a0050', bgTo: '#050015', arquivo: '/templates/dia-das-criancas.html',       produtos: 4  },
]

const CATS = ['TODOS', 'SEMANAL', 'ENCARTE', 'STORY', 'SAZONAL']

const CAT_COR: Record<string, string> = {
  SEMANAL:  'bg-blue-100 text-blue-700',
  ENCARTE:  'bg-indigo-100 text-indigo-700',
  STORY:    'bg-purple-100 text-purple-700',
  SAZONAL:  'bg-orange-100 text-orange-700',
}

export default function TemplatesPage() {
  const [preview, setPreview] = useState<typeof TEMPLATES[0] | null>(null)
  const [filtro, setFiltro] = useState('TODOS')

  const filtrados = filtro === 'TODOS' ? TEMPLATES : TEMPLATES.filter(t => t.categoria === filtro)
  const prontos = TEMPLATES.filter(t => t.arquivo).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🗂️ Templates de Arte</h1>
          <p className="text-sm text-gray-500 mt-0.5">{prontos} templates prontos — semanais, encartes e <strong>7 sazonais</strong></p>
        </div>
        <a href="/pedidos/novo"
          className="px-4 py-2.5 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0052A3] transition-colors">
          + Pedido com Template
        </a>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {CATS.map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filtro === f ? 'bg-[#0066CC] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f === 'TODOS' ? `Todos (${TEMPLATES.length})` : `${f === 'SAZONAL' ? '🎉 ' : ''}${f} (${TEMPLATES.filter(t => t.categoria === f).length})`}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtrados.map(tmpl => (
          <div key={tmpl.id} className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Visual preview */}
            <div className="h-32 relative flex flex-col items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${tmpl.bgFrom}, ${tmpl.bgTo})` }}>
              <span className="text-5xl drop-shadow-lg">{tmpl.emoji}</span>
              <span className="text-white text-xs font-semibold mt-1 opacity-70">{tmpl.formato}</span>
              <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold ${CAT_COR[tmpl.categoria]}`}>
                {tmpl.categoria}
              </span>
            </div>

            {/* Info */}
            <div className="bg-white p-3">
              <p className="font-semibold text-gray-900 text-sm mb-1 leading-tight">{tmpl.nome}</p>
              <p className="text-xs text-gray-400 mb-2 leading-relaxed line-clamp-2">{tmpl.descricao}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <span>📱 {tmpl.canal}</span>
                <span>·</span>
                <span>🛒 {tmpl.produtos} prod.</span>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setPreview(tmpl)}
                  className="flex-1 py-1.5 text-xs font-semibold text-[#0066CC] border border-[#0066CC] rounded-lg hover:bg-blue-50 transition-colors">
                  👁️ Ver
                </button>
                <a href={tmpl.arquivo} target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-1.5 text-xs font-semibold text-white bg-[#0066CC] rounded-lg hover:bg-[#0052A3] transition-colors text-center">
                  📥 Abrir
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Como usar */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-900 text-sm mb-3">💡 Como usar os templates</h3>
        <div className="grid md:grid-cols-3 gap-4 text-xs text-blue-800">
          <div><p className="font-semibold mb-1">1. Abre o template</p><p>Clique em "Abrir" — o arquivo HTML abre no tamanho certo para a rede social.</p></div>
          <div><p className="font-semibold mb-1">2. Edita os preços</p><p>Botão direito → "Inspecionar" → edite os valores no HTML diretamente. Instantâneo.</p></div>
          <div><p className="font-semibold mb-1">3. Captura a tela</p><p>Ctrl+Shift+S ou DevTools → "Capture screenshot" para salvar em PNG pronto para postar.</p></div>
        </div>
      </div>

      {/* Modal preview */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">{preview.nome}</h3>
                <p className="text-xs text-gray-400">{preview.formato} · {preview.canal}</p>
              </div>
              <div className="flex gap-2">
                <a href={preview.arquivo} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0052A3]">
                  Abrir em tela cheia
                </a>
                <button onClick={() => setPreview(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 text-xl">✕</button>
              </div>
            </div>
            <div className="p-4 bg-gray-100 flex items-center justify-center min-h-[400px]">
              <iframe src={preview.arquivo} className="rounded-lg shadow-xl"
                style={{ width: preview.formato.includes('1920') ? '270px' : '480px', height: preview.formato.includes('1920') ? '480px' : '480px' }}
                title={preview.nome} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
