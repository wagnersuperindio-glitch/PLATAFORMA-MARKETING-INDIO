'use client'
// M9 — Calendário Editorial: planejamento mensal de conteúdo por canal/loja
import { useState } from 'react'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const TIPO_COLOR: Record<string, string> = {
  ENCARTE:      'bg-blue-500',
  POST:         'bg-green-500',
  STORY:        'bg-purple-500',
  REELS:        'bg-pink-500',
  WHATSAPP:     'bg-emerald-500',
  CARRO_DE_SOM: 'bg-orange-500',
  SAZONAL:      'bg-red-500',
}

const EVENTOS_MOCK: Record<number, Array<{tipo: string; label: string}>> = {
  1:  [{ tipo: 'ENCARTE', label: 'Encarte Quinzenal' }],
  5:  [{ tipo: 'POST', label: 'Sexta das Carnes' }, { tipo: 'CARRO_DE_SOM', label: 'OP1 Rota A' }],
  7:  [{ tipo: 'STORY', label: 'Domingo em família' }],
  8:  [{ tipo: 'WHATSAPP', label: 'Encarte WhatsApp' }],
  9:  [{ tipo: 'REELS', label: 'Reels Padaria' }],
  11: [{ tipo: 'CARRO_DE_SOM', label: 'OP1 Rota B' }],
  12: [{ tipo: 'POST', label: 'Sexta das Carnes' }],
  13: [{ tipo: 'STORY', label: 'Oferta FLV' }],
  14: [{ tipo: 'SAZONAL', label: '🌸 Dia das Mães' }],
  15: [{ tipo: 'ENCARTE', label: 'Encarte #2' }, { tipo: 'WHATSAPP', label: 'Disparo Clube' }],
  16: [{ tipo: 'CARRO_DE_SOM', label: 'OP2 Carbonífera' }],
  19: [{ tipo: 'POST', label: 'Sexta das Carnes' }, { tipo: 'REELS', label: 'Bastidores' }],
  21: [{ tipo: 'WHATSAPP', label: 'Aviso Encarte' }],
  22: [{ tipo: 'CARRO_DE_SOM', label: 'OP1+OP2' }],
  23: [{ tipo: 'STORY', label: 'Sábado ofertas' }],
  26: [{ tipo: 'POST', label: 'Sexta das Carnes' }],
  28: [{ tipo: 'WHATSAPP', label: 'Clube Mais' }],
  29: [{ tipo: 'CARRO_DE_SOM', label: 'OP1 Rota A' }],
}

function getDiasDoMes(ano: number, mes: number) {
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const totalDias = new Date(ano, mes + 1, 0).getDate()
  return { primeiroDia, totalDias }
}

export default function CalendarioPage() {
  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(hoje.getMonth())
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear())
  const [diaSelected, setDiaSelected] = useState<number | null>(null)

  const { primeiroDia, totalDias } = getDiasDoMes(anoAtual, mesAtual)

  const nomeMes = new Date(anoAtual, mesAtual).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  function prev() {
    if (mesAtual === 0) { setMesAtual(11); setAnoAtual(a => a - 1) }
    else setMesAtual(m => m - 1)
  }
  function next() {
    if (mesAtual === 11) { setMesAtual(0); setAnoAtual(a => a + 1) }
    else setMesAtual(m => m + 1)
  }

  const totalEventos = Object.values(EVENTOS_MOCK).flat().length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Calendário Editorial</h1>
          <p className="text-sm text-gray-500 mt-0.5">Planejamento de conteúdo — {totalEventos} publicações programadas</p>
        </div>
        <button className="px-4 py-2.5 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0052A3] transition-colors">
          + Agendar
        </button>
      </div>

      {/* Legenda */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(TIPO_COLOR).map(([tipo, color]) => (
          <div key={tipo} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-xs text-gray-500">{tipo.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Calendário */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Nav mês */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">←</button>
            <h2 className="font-semibold text-gray-900 capitalize">{nomeMes}</h2>
            <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">→</button>
          </div>

          {/* Grid dias semana */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
            ))}
          </div>

          {/* Grid dias */}
          <div className="grid grid-cols-7">
            {/* Espaços vazios antes do primeiro dia */}
            {Array.from({ length: primeiroDia }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-100 bg-gray-50/50" />
            ))}

            {Array.from({ length: totalDias }).map((_, i) => {
              const dia = i + 1
              const eventos = EVENTOS_MOCK[dia] || []
              const isHoje = dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear()
              const isSelected = dia === diaSelected

              return (
                <div
                  key={dia}
                  onClick={() => setDiaSelected(dia === diaSelected ? null : dia)}
                  className={`min-h-[80px] border-b border-r border-gray-100 p-1.5 cursor-pointer hover:bg-blue-50/30 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1 ${
                    isHoje ? 'bg-[#0066CC] text-white' : 'text-gray-700'
                  }`}>{dia}</span>
                  <div className="space-y-0.5">
                    {eventos.slice(0, 2).map((ev, ei) => (
                      <div key={ei} className={`${TIPO_COLOR[ev.tipo]} text-white text-[9px] rounded px-1 py-0.5 truncate`}>
                        {ev.label}
                      </div>
                    ))}
                    {eventos.length > 2 && (
                      <div className="text-[9px] text-gray-400">+{eventos.length - 2} mais</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Painel lateral */}
        <div className="space-y-4">
          {/* Próximas publicações */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">📆 Próximas Publicações</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { dia: '07 Mai', tipo: 'POST', label: 'Sexta das Carnes', canal: 'Instagram' },
                { dia: '08 Mai', tipo: 'SAZONAL', label: 'Dia das Mães', canal: 'Todos' },
                { dia: '09 Mai', tipo: 'REELS', label: 'Bastidores Padaria', canal: 'TikTok' },
                { dia: '12 Mai', tipo: 'POST', label: 'Sexta das Carnes', canal: 'Instagram' },
                { dia: '14 Mai', tipo: 'WHATSAPP', label: 'Encarte Quinzenal', canal: 'WhatsApp' },
              ].map((ev, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-1.5 h-8 rounded-full ${TIPO_COLOR[ev.tipo]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{ev.label}</p>
                    <p className="text-xs text-gray-400">{ev.dia} · {ev.canal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo do mês */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">📊 Resumo do Mês</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Posts Feed', count: 4, color: 'bg-green-500' },
                { label: 'Stories', count: 3, color: 'bg-purple-500' },
                { label: 'Reels', count: 2, color: 'bg-pink-500' },
                { label: 'WhatsApp', count: 4, color: 'bg-emerald-500' },
                { label: 'Carro de Som', count: 5, color: 'bg-orange-500' },
                { label: 'Encartes', count: 2, color: 'bg-blue-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-xs text-gray-600 flex-1">{item.label}</span>
                  <span className="text-xs font-semibold text-gray-800">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total publicações</span>
                <span className="font-bold text-[#0066CC]">20</span>
              </div>
            </div>
          </div>

          {/* Datas comemorativas */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">🗓️ Datas Importantes — Mai</h3>
            <div className="space-y-2">
              {[
                { data: '01/05', label: 'Dia do Trabalho' },
                { data: '11/05', label: 'Dia das Mães' },
                { data: '12/05', label: 'Dia das Mães (celebração)' },
                { data: '29/05', label: 'Corpus Christi (véspera)' },
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#0066CC] w-12">{d.data}</span>
                  <span className="text-xs text-gray-600">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
