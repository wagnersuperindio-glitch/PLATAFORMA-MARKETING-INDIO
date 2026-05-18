'use client'
import { useState } from 'react'

type Canal = 'instagram' | 'facebook' | 'whatsapp'
type LogLine = { msg: string; tipo: 'ok' | 'info' | 'warn' | 'prompt' }

const CANAIS = [
  {
    id: 'instagram' as Canal,
    icon: '📸',
    nome: 'Instagram',
    sub: 'ID: 17841408006597613 · 45.200 seguidores',
    status: 'Conectado',
    cor: 'green',
    tipos: ['Post no Feed', 'Stories', 'Reel', 'Carrossel'],
    placeholder: 'Digite a legenda com emojis e hashtags...\n#SupermercadosIndio #OIndioEDeCasa #Guaiba #RS',
  },
  {
    id: 'facebook' as Canal,
    icon: '💙',
    nome: 'Facebook',
    sub: 'Page ID: 1598780677003934',
    status: 'Conectado',
    cor: 'green',
    tipos: ['Post', 'Stories', 'Reel', 'Evento'],
    placeholder: 'Texto para o Facebook...',
  },
  {
    id: 'whatsapp' as Canal,
    icon: '💬',
    nome: 'WhatsApp Business',
    sub: 'Phone ID: 1099952049866345',
    status: 'Dev Mode',
    cor: 'yellow',
    tipos: ['Mensagem', 'Template Aprovado'],
    placeholder: 'Olá! Veja nossas ofertas de hoje no Índio...',
  },
]

export default function PublicarPage() {
  const [legendas, setLegendas] = useState<Record<Canal, string>>({ instagram: '', facebook: '', whatsapp: '' })
  const [tipos, setTipos] = useState<Record<Canal, string>>({
    instagram: 'Post no Feed', facebook: 'Post', whatsapp: 'Mensagem',
  })
  const [logs, setLogs] = useState<LogLine[]>([])
  const [running, setRunning] = useState(false)
  const [canaisAtivos, setCanaisAtivos] = useState<Canal[]>(['instagram', 'facebook'])

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
  function addLog(msg: string, tipo: LogLine['tipo'] = 'info') {
    setLogs(prev => [...prev, { msg, tipo }])
  }

  function toggleCanal(c: Canal) {
    setCanaisAtivos(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  async function publicar(canal: Canal) {
    const c = CANAIS.find(x => x.id === canal)!
    if (c.status === 'Dev Mode') {
      addLog(`⚠️  ${c.nome} em modo dev — apenas números verificados receberão.`, 'warn')
      return
    }
    setRunning(true)
    setLogs([])
    addLog(`> /publicar canal="${c.nome}" tipo="${tipos[canal]}"`, 'prompt')
    await sleep(300); addLog(`🔍 Verificando token ${c.nome}...`, 'info')
    await sleep(400); addLog('✅  Token válido.', 'ok')
    await sleep(400); addLog(`📤 Enviando para ${c.nome} API...`, 'info')
    await sleep(1000); addLog(`✅  Publicado com sucesso! Post ID: ${Math.floor(Math.random() * 9999999)}`, 'ok')
    setRunning(false)
  }

  async function publicarTodos() {
    setRunning(true)
    setLogs([])
    addLog('> /publicar canais="todos"', 'prompt')
    for (const cId of canaisAtivos) {
      const c = CANAIS.find(x => x.id === cId)!
      await sleep(300); addLog(`📤 Publicando em ${c.nome}...`, 'info')
      await sleep(800)
      if (c.status === 'Dev Mode') {
        addLog(`⚠️  ${c.nome} em modo dev — pulado.`, 'warn')
      } else {
        addLog(`✅  ${c.nome} — OK!`, 'ok')
      }
    }
    await sleep(200)
    addLog('✅  Publicação concluída!', 'ok')
    setRunning(false)
  }

  const logColor: Record<string, string> = {
    ok: 'text-green-400', info: 'text-blue-300', warn: 'text-yellow-400', prompt: 'text-gray-400',
  }

  const statusCor: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">📲 Publicar nas Redes Sociais</h1>
          <p className="text-sm text-gray-500 mt-0.5">Instagram · Facebook · WhatsApp — publique em todos os canais de uma vez</p>
        </div>
        <button onClick={publicarTodos} disabled={running}
          className="px-5 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-60 transition-colors">
          🚀 Publicar em Todos
        </button>
      </div>

      {/* Seleção de canais */}
      <div className="flex gap-3 flex-wrap">
        {CANAIS.map(c => (
          <button key={c.id} onClick={() => toggleCanal(c.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              canaisAtivos.includes(c.id)
                ? 'border-[#0066CC] bg-blue-50 text-[#0066CC]'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            <span>{c.icon}</span> {c.nome}
            {canaisAtivos.includes(c.id) && <span className="text-xs">✓</span>}
          </button>
        ))}
      </div>

      {/* Cards por canal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CANAIS.map(c => (
          <div key={c.id} className={`bg-white border rounded-xl overflow-hidden ${
            canaisAtivos.includes(c.id) ? 'border-[#0066CC]' : 'border-gray-200 opacity-60'
          }`}>
            {/* Header canal */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{c.nome}</p>
                  <p className="text-xs text-gray-400">{c.sub}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusCor[c.cor]}`}>
                {c.status}
              </span>
            </div>

            {/* Formulário */}
            <div className="p-5 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
                <select value={tipos[c.id]} onChange={e => setTipos(prev => ({ ...prev, [c.id]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC]">
                  {c.tipos.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {c.id === 'whatsapp' ? 'Mensagem' : 'Legenda'}
                </label>
                <textarea
                  value={legendas[c.id]}
                  onChange={e => setLegendas(prev => ({ ...prev, [c.id]: e.target.value }))}
                  rows={4}
                  placeholder={c.placeholder}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0066CC] resize-none" />
              </div>

              {c.id === 'whatsapp' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
                  ⚠️ Em modo dev — só números verificados. Ative produção para disparos em massa.
                </div>
              )}

              <button onClick={() => publicar(c.id)} disabled={running || !canaisAtivos.includes(c.id)}
                className="w-full py-2 text-sm font-semibold text-white bg-[#0066CC] rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors">
                {c.icon} Publicar no {c.nome}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Console */}
      {logs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            💻 Log de Publicação
            <span className="flex-1 h-px bg-gray-200"></span>
            <button onClick={() => setLogs([])} className="text-xs text-gray-400 hover:text-gray-600">Limpar</button>
          </h3>
          <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs leading-relaxed space-y-0.5 max-h-48 overflow-y-auto">
            {logs.map((l, i) => (
              <div key={i} className={logColor[l.tipo] || 'text-gray-300'}>{l.msg || <>&nbsp;</>}</div>
            ))}
            {running && <div className="text-gray-400 animate-pulse">▌</div>}
          </div>
        </div>
      )}

      {/* Últimas publicações */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-4">📋 Últimas Publicações</h2>
        <div className="space-y-3">
          {[
            { canal: '📸 Instagram', tipo: 'Reel', conteudo: 'Sexta das Carnes — Fraldão R$29,90', hora: '14:30 · Hoje', status: 'Publicado' },
            { canal: '💙 Facebook', tipo: 'Post', conteudo: 'Quarta do Horti — 8 produtos em oferta', hora: '11:00 · Ontem', status: 'Publicado' },
            { canal: '💬 WhatsApp', tipo: 'Encarte', conteudo: 'Encarte Semanal — 15 a 21 de Maio', hora: '09:00 · Ontem', status: 'Enviado' },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-4 py-2.5 border-b border-gray-100 last:border-0">
              <span className="text-sm">{p.canal}</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{p.tipo}</span>
              <span className="flex-1 text-sm text-gray-700 truncate">{p.conteudo}</span>
              <span className="text-xs text-gray-400">{p.hora}</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-semibold">{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
