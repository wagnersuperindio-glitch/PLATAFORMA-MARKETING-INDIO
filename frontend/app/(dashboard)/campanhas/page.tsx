'use client'
// M5 — Campanhas: crie, gerencie e acompanhe campanhas de marketing
import { useEffect, useState } from 'react'

const TIPO_COLOR: Record<string, string> = {
  ENCARTE:   'bg-blue-100 text-blue-700',
  SAZONAL:   'bg-purple-100 text-purple-700',
  OFERTA:    'bg-orange-100 text-orange-700',
  LANCAMENTO:'bg-green-100 text-green-700',
  FIDELIDADE:'bg-pink-100 text-pink-700',
}

const STATUS_COLOR: Record<string, string> = {
  ATIVA:     'bg-green-100 text-green-700',
  RASCUNHO:  'bg-gray-100 text-gray-600',
  PAUSADA:   'bg-yellow-100 text-yellow-700',
  ENCERRADA: 'bg-red-100 text-red-700',
}

// Campanhas de exemplo / mock
const CAMPANHAS_MOCK = [
  {
    id: '1', nome: 'Sexta das Carnes — Maio 2026', tipo: 'OFERTA', status: 'ATIVA',
    lojas: ['Matriz', 'Nestor', 'Centro'], canais: ['Instagram', 'WhatsApp', 'Facebook'],
    inicio: '2026-05-01', fim: '2026-05-30', artes: 8, alcance: 12400, engajamento: 3.2,
  },
  {
    id: '2', nome: 'Quarta do Horti — Semanal', tipo: 'OFERTA', status: 'ATIVA',
    lojas: ['Todas'], canais: ['Instagram', 'TikTok'],
    inicio: '2026-04-01', fim: '2026-12-31', artes: 12, alcance: 8700, engajamento: 4.1,
  },
  {
    id: '3', nome: 'Dia das Mães 2026', tipo: 'SAZONAL', status: 'RASCUNHO',
    lojas: ['Todas'], canais: ['Instagram', 'Facebook', 'WhatsApp', 'TikTok'],
    inicio: '2026-05-08', fim: '2026-05-11', artes: 0, alcance: 0, engajamento: 0,
  },
  {
    id: '4', nome: 'Encarte Quinzenal #22', tipo: 'ENCARTE', status: 'ATIVA',
    lojas: ['Todas'], canais: ['WhatsApp', 'Instagram'],
    inicio: '2026-05-01', fim: '2026-05-15', artes: 3, alcance: 21500, engajamento: 2.8,
  },
  {
    id: '5', nome: 'Lançamento App Clube Mais', tipo: 'LANCAMENTO', status: 'ENCERRADA',
    lojas: ['Todas'], canais: ['Instagram', 'Facebook'],
    inicio: '2026-03-01', fim: '2026-03-31', artes: 15, alcance: 38200, engajamento: 5.7,
  },
]

export default function CampanhasPage() {
  const [campanhas] = useState(CAMPANHAS_MOCK)
  const [filtro, setFiltro] = useState('TODAS')
  const [showNew, setShowNew] = useState(false)

  const filtradas = filtro === 'TODAS' ? campanhas : campanhas.filter(c => c.status === filtro)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Organize e acompanhe todas as campanhas de marketing</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2.5 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0052A3] transition-colors"
        >
          + Nova Campanha
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Campanhas Ativas',    value: campanhas.filter(c=>c.status==='ATIVA').length,    icon: '📣', color: 'text-green-600' },
          { label: 'Artes Geradas',       value: campanhas.reduce((a,c)=>a+c.artes,0),              icon: '🎨', color: 'text-blue-600' },
          { label: 'Alcance Total',       value: campanhas.reduce((a,c)=>a+c.alcance,0).toLocaleString('pt-BR'), icon: '👥', color: 'text-purple-600' },
          { label: 'Eng. Médio',          value: (campanhas.filter(c=>c.engajamento>0).reduce((a,c)=>a+c.engajamento,0)/campanhas.filter(c=>c.engajamento>0).length).toFixed(1)+'%', icon: '❤️', color: 'text-orange-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['TODAS', 'ATIVA', 'RASCUNHO', 'PAUSADA', 'ENCERRADA'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filtro === f ? 'bg-[#0066CC] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f === 'TODAS' ? 'Todas' : f.charAt(0)+f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtradas.map(camp => (
          <div key={camp.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${TIPO_COLOR[camp.tipo]}`}>{camp.tipo}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[camp.status]}`}>{camp.status}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{camp.nome}</h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>📅 {new Date(camp.inicio).toLocaleDateString('pt-BR')} → {new Date(camp.fim).toLocaleDateString('pt-BR')}</span>
                  <span>🏪 {camp.lojas[0] === 'Todas' ? 'Todas as lojas' : camp.lojas.join(', ')}</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {camp.canais.map(c => (
                    <span key={c} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{c}</span>
                  ))}
                </div>
              </div>

              {camp.artes > 0 && (
                <div className="grid grid-cols-3 gap-4 text-center shrink-0">
                  <div>
                    <p className="text-lg font-bold text-[#0066CC]">{camp.artes}</p>
                    <p className="text-xs text-gray-400">Artes</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">{camp.alcance.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-gray-400">Alcance</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-600">{camp.engajamento}%</p>
                    <p className="text-xs text-gray-400">Eng.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
              <button className="text-xs text-[#0066CC] hover:underline font-medium">Ver detalhes</button>
              <span className="text-gray-300">|</span>
              <button className="text-xs text-[#0066CC] hover:underline">+ Adicionar Arte</button>
              {camp.status === 'RASCUNHO' && <>
                <span className="text-gray-300">|</span>
                <button className="text-xs text-green-600 hover:underline font-medium">▶ Ativar</button>
              </>}
              {camp.status === 'ATIVA' && <>
                <span className="text-gray-300">|</span>
                <button className="text-xs text-yellow-600 hover:underline">⏸ Pausar</button>
              </>}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Campanha */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Nova Campanha</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da campanha *</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none" placeholder="Ex: Dia das Mães 2026" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none bg-white">
                    {['ENCARTE','SAZONAL','OFERTA','LANCAMENTO','FIDELIDADE'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lojas</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none bg-white">
                    <option>Todas as lojas</option>
                    <option>Guaíba</option>
                    <option>Charqueadas</option>
                    <option>Eldorado do Sul</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Término</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0066CC] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Canais</label>
                <div className="flex gap-2 flex-wrap">
                  {['Instagram','Facebook','WhatsApp','TikTok','Carro de Som'].map(c => (
                    <label key={c} className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNew(false)}
                className="flex-1 py-2.5 border border-gray-300 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                className="flex-1 py-2.5 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0052A3] transition-colors">
                Criar Campanha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
