'use client'
// M4 — Monitor de Concorrentes — pré-cadastrados por cidade do Índio
const CONCORRENTES_PREDEFINIDOS = [
  { cidade: 'Guaíba',          nome: 'Ecoatacarejo',      instagram: '@ecoatacarejo',    ameaca: 'ALTA' },
  { cidade: 'Guaíba',          nome: 'Sup. do Paulinho',  instagram: '@paulinhomercado', ameaca: 'MEDIA' },
  { cidade: 'Guaíba',          nome: 'Sup. Atual',        instagram: '@superatual',      ameaca: 'MEDIA' },
  { cidade: 'Charqueadas',     nome: 'Bonato',            instagram: '@bonatosupermercado', ameaca: 'CRITICA' },
  { cidade: 'Charqueadas',     nome: 'Macropan',          instagram: '@macropan',        ameaca: 'CRITICA' },
  { cidade: 'Charqueadas',     nome: 'Santos',            instagram: '@supermarketosantos', ameaca: 'CRITICA' },
  { cidade: 'Charqueadas',     nome: 'Desco',             instagram: '@descosupermercado', ameaca: 'ALTA' },
  { cidade: 'São Jerônimo',    nome: 'Merc. Bandeira',    instagram: '@mercadobandeira', ameaca: 'MEDIA' },
  { cidade: 'Arroio dos Ratos',nome: 'Supermercados locais', instagram: '(múltiplos)',  ameaca: 'BAIXA' },
]

const AMEACA_COLOR: Record<string, string> = {
  CRITICA: 'bg-red-100 text-red-700',
  ALTA:    'bg-orange-100 text-orange-700',
  MEDIA:   'bg-yellow-100 text-yellow-700',
  BAIXA:   'bg-green-100 text-green-700',
}

export default function ConcorrentesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Monitor de Concorrentes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Alerta automático quando publicarem ofertas</p>
        </div>
        <button className="px-4 py-2.5 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0052A3] transition-colors">
          + Adicionar
        </button>
      </div>

      {/* Alerta Charqueadas */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-800 text-sm">Charqueadas — Av. Primeiro de Maio</p>
            <p className="text-red-600 text-xs mt-1">
              3 concorrentes na mesma rua da sua loja: Bonato (nº490), Macropan (nº660), Santos (nº733).
              Sua loja está no nº1035. Monitore com máxima prioridade.
            </p>
          </div>
        </div>
      </div>

      {/* Lista por cidade */}
      {['Charqueadas', 'Guaíba', 'São Jerônimo', 'Arroio dos Ratos'].map(cidade => {
        const lista = CONCORRENTES_PREDEFINIDOS.filter(c => c.cidade === cidade)
        return (
          <div key={cidade} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="font-semibold text-gray-700 text-sm">📍 {cidade}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {lista.map((c, i) => (
                <div key={i} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                      {c.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{c.nome}</p>
                      <p className="text-xs text-gray-400">{c.instagram}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${AMEACA_COLOR[c.ameaca]}`}>
                      {c.ameaca}
                    </span>
                    <button className="text-xs text-[#0066CC] hover:underline whitespace-nowrap">
                      Ativar monitor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Status do monitor */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">⚙️ Configuração de Alertas</h2>
        <div className="space-y-3">
          {[
            { label: 'Alertar quando concorrente publicar oferta de carnes', active: true },
            { label: 'Alertar quando concorrente publicar oferta de padaria', active: true },
            { label: 'Alertar quando concorrente publicar oferta de FLV', active: true },
            { label: 'Alertar qualquer publicação do concorrente', active: false },
            { label: 'Comparativo automático de preços (SCANNTECH)', active: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{item.label}</p>
              <div className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${item.active ? 'bg-[#0066CC]' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${item.active ? 'translate-x-5' : ''}`} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Número WhatsApp para receber alertas:</p>
          <input type="text" placeholder="(51) 9XXXX-XXXX" defaultValue="(51) 99999-0000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none" />
        </div>
      </div>
    </div>
  )
}
