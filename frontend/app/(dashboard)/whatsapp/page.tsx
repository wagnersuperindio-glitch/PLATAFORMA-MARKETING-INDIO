'use client'
// M10 — WhatsApp Business: disparos, listas de transmissão, encarte automático
import { useState } from 'react'

const LISTAS_MOCK = [
  { id: '1', nome: 'Clube Mais — Guaíba',        contatos: 1840, status: 'ATIVA',   ultima: '05/05/2026', taxa: 78 },
  { id: '2', nome: 'Clube Mais — Charqueadas',   contatos: 920,  status: 'ATIVA',   ultima: '05/05/2026', taxa: 74 },
  { id: '3', nome: 'Clube Mais — Eldorado',      contatos: 612,  status: 'ATIVA',   ultima: '03/05/2026', taxa: 81 },
  { id: '4', nome: 'Clube Mais — São Jerônimo',  contatos: 310,  status: 'ATIVA',   ultima: '02/05/2026', taxa: 69 },
  { id: '5', nome: 'Clube Mais — Arroio Ratos',  contatos: 275,  status: 'PAUSADA', ultima: '28/04/2026', taxa: 65 },
  { id: '6', nome: 'Fornecedores Parceiros',     contatos: 87,   status: 'ATIVA',   ultima: '01/05/2026', taxa: 92 },
]

const HISTORICO_MOCK = [
  { id: '1', titulo: 'Encarte Quinzenal #22 — 1-15 Mai', lista: 'Todas as listas', enviados: 4059, lidos: 3086, data: '01/05/2026' },
  { id: '2', titulo: 'Sexta das Carnes — 01/05',        lista: 'Clube Mais Guaíba', enviados: 1840, lidos: 1489, data: '30/04/2026' },
  { id: '3', titulo: 'Feriado: Loja aberta!',            lista: 'Todas as listas', enviados: 4059, lidos: 2870, data: '29/04/2026' },
  { id: '4', titulo: 'Encarte Quinzenal #21',            lista: 'Todas as listas', enviados: 3982, lidos: 3021, data: '16/04/2026' },
]

export default function WhatsappPage() {
  const [aba, setAba] = useState<'disparos'|'listas'|'templates'>('disparos')
  const [showDisparo, setShowDisparo] = useState(false)

  const totalContatos = LISTAS_MOCK.filter(l => l.status === 'ATIVA').reduce((a,l) => a+l.contatos, 0)
  const taxaMedia = Math.round(LISTAS_MOCK.reduce((a,l) => a+l.taxa, 0) / LISTAS_MOCK.length)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">WhatsApp Business</h1>
          <p className="text-sm text-gray-500 mt-0.5">Disparos, transmissões e Clube Mais</p>
        </div>
        <button
          onClick={() => setShowDisparo(true)}
          className="px-4 py-2.5 bg-[#25D366] text-white text-sm font-medium rounded-lg hover:bg-[#1ebe5a] transition-colors flex items-center gap-2"
        >
          💬 Novo Disparo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Contatos Ativos',  value: totalContatos.toLocaleString('pt-BR'), icon: '👥', color: 'text-green-600' },
          { label: 'Listas Ativas',    value: LISTAS_MOCK.filter(l=>l.status==='ATIVA').length, icon: '📋', color: 'text-blue-600' },
          { label: 'Taxa Leitura Méd.', value: taxaMedia+'%', icon: '👁️', color: 'text-purple-600' },
          { label: 'Disparos/Mês',     value: '8', icon: '📤', color: 'text-orange-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([['disparos','📤 Disparos'],['listas','📋 Listas'],['templates','📝 Templates']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setAba(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aba === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      {aba === 'disparos' && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700 text-sm">Histórico de Disparos</h2>
          {HISTORICO_MOCK.map(h => {
            const taxaLeitura = Math.round((h.lidos / h.enviados) * 100)
            return (
              <div key={h.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{h.titulo}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{h.lista} · {h.data}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">
                    ✓ Enviado
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>📤 {h.enviados.toLocaleString('pt-BR')} enviados</span>
                  <span>👁️ {h.lidos.toLocaleString('pt-BR')} lidos</span>
                  <span className="font-semibold text-emerald-600">{taxaLeitura}% leitura</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${taxaLeitura}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {aba === 'listas' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 text-sm">Listas de Transmissão</h2>
            <button className="text-sm text-[#0066CC] hover:underline">+ Nova Lista</button>
          </div>
          {LISTAS_MOCK.map(lista => (
            <div key={lista.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{lista.contatos > 1000 ? '1k+' : lista.contatos}</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">{lista.nome}</p>
                  <p className="text-xs text-gray-400">{lista.contatos.toLocaleString('pt-BR')} contatos · Último: {lista.ultima}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{lista.taxa}%</p>
                  <p className="text-xs text-gray-400">leitura</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${lista.status === 'ATIVA' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {lista.status}
                </span>
                <button className="text-xs text-[#0066CC] hover:underline whitespace-nowrap">Disparar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {aba === 'templates' && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700 text-sm">Templates de Mensagem</h2>
          {[
            { nome: 'Encarte Quinzenal', preview: '🛒 *Olá {{nome}}!* Confira o encarte da quinzena no Índio. Clique para ver as ofertas exclusivas! 👇', categoria: 'ENCARTE' },
            { nome: 'Sexta das Carnes',  preview: '🥩 *Sexta das Carnes no Índio!* Carnes selecionadas com preço especial hoje. {{loja}} aguarda você!', categoria: 'OFERTA' },
            { nome: 'Clube Mais',        preview: '⭐ *{{nome}}, você tem pontos no Clube Mais!* Venha resgatar seus benefícios na loja mais próxima.', categoria: 'FIDELIDADE' },
            { nome: 'Feriado — Aviso',   preview: '📢 Informamos que neste {{feriado}} nossas lojas funcionarão das {{horario}}. Índio sempre perto de você!', categoria: 'INFORMATIVO' },
          ].map((tmpl, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 text-sm">{tmpl.nome}</h3>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{tmpl.categoria}</span>
              </div>
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 leading-relaxed">{tmpl.preview}</p>
              <div className="flex gap-2 mt-3">
                <button className="text-xs text-[#0066CC] hover:underline">Usar Template</button>
                <span className="text-gray-300">|</span>
                <button className="text-xs text-gray-400 hover:text-gray-600">Editar</button>
              </div>
            </div>
          ))}
          <button className="w-full py-3 border-2 border-dashed border-gray-300 text-sm text-gray-400 hover:border-[#0066CC] hover:text-[#0066CC] rounded-xl transition-colors">
            + Criar novo template
          </button>
        </div>
      )}

      {/* Modal Novo Disparo */}
      {showDisparo && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Novo Disparo WhatsApp</h2>
              <button onClick={() => setShowDisparo(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto / Título *</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#25D366] outline-none" placeholder="Ex: Encarte Quinzenal #23" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listas de Destino *</label>
                <div className="space-y-2">
                  {LISTAS_MOCK.filter(l => l.status === 'ATIVA').map(l => (
                    <label key={l.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      {l.nome} <span className="text-gray-400 text-xs">({l.contatos.toLocaleString('pt-BR')} contatos)</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conteúdo</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#25D366] outline-none bg-white">
                  <option>Template existente</option>
                  <option>Imagem + texto</option>
                  <option>PDF (encarte)</option>
                  <option>Só texto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agendamento</label>
                <div className="flex gap-2">
                  <input type="date" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#25D366] outline-none" />
                  <input type="time" className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#25D366] outline-none" defaultValue="08:00" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDisparo(false)}
                className="flex-1 py-2.5 border border-gray-300 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button className="flex-1 py-2.5 bg-[#25D366] text-white text-sm font-medium rounded-lg hover:bg-[#1ebe5a] transition-colors">
                💬 Agendar Disparo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
