'use client'
import { useState, useEffect, useRef } from 'react'
import { API_URL } from '@/lib/api'

// ─── tipos ────────────────────────────────────────────────────────────────────

type Template = {
  id: string; nome: string; descricao: string; categoria: string
  language: string; params: string[]; preview: string; emoji: string
}

type Broadcast = {
  id: string; title: string; message: string; status: string
  contactCount: number; sentCount: number; failedCount: number
  createdAt: string; sentAt: string | null
  store?: { name: string; city: string }
}

type Stats = {
  total: number; enviados: number; agendados: number
  pendentes: number; enviando: number
  totalMensagens: number; totalFalhas: number
}

type LogLine = { msg: string; tipo: 'ok' | 'info' | 'warn' | 'error' }

// ─── listas demo Clube Mais (enquanto não há backend de contatos) ─────────────

const LISTAS_DEMO = [
  { id: 'guaiba',     nome: 'Clube Mais — Guaíba',        contatos: 1840 },
  { id: 'charqueadas',nome: 'Clube Mais — Charqueadas',   contatos:  920 },
  { id: 'eldorado',   nome: 'Clube Mais — Eldorado',      contatos:  612 },
  { id: 'saojeroni',  nome: 'Clube Mais — São Jerônimo',  contatos:  310 },
  { id: 'arroio',     nome: 'Clube Mais — Arroio dos Ratos', contatos: 275 },
  { id: 'fornecedores',nome:'Fornecedores Parceiros',     contatos:   87 },
]

// ─── componente principal ─────────────────────────────────────────────────────

export default function WhatsappPage() {
  const [aba, setAba]                 = useState<'disparos'|'templates'|'novo'>('disparos')
  const [templates, setTemplates]     = useState<Template[]>([])
  const [broadcasts, setBroadcasts]   = useState<Broadcast[]>([])
  const [stats, setStats]             = useState<Stats | null>(null)
  const [loading, setLoading]         = useState(true)

  // form disparo único
  const [tmplSel, setTmplSel]         = useState<Template | null>(null)
  const [tmplParams, setTmplParams]   = useState<string[]>([])
  const [phoneOne, setPhoneOne]       = useState('')
  const [sendingOne, setSendingOne]   = useState(false)
  const [logOne, setLogOne]           = useState<LogLine[]>([])

  // form disparo em massa
  const [massTitle, setMassTitle]     = useState('')
  const [massTmpl, setMassTmpl]       = useState<Template | null>(null)
  const [massParams, setMassParams]   = useState<string[]>([])
  const [massPhones, setMassPhones]   = useState('')   // textarea — um número por linha
  const [massType, setMassType]       = useState<'template'|'text'>('template')
  const [massText, setMassText]       = useState('')
  const [sending, setSending]         = useState(false)
  const [logMass, setLogMass]         = useState<LogLine[]>([])
  const logEndRef                     = useRef<HTMLDivElement>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  // ─── fetch inicial ──────────────────────────────────────────────────────────

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [rTmpl, rBroad, rStats] = await Promise.all([
        fetch(`${API_URL}/api/whatsapp/templates`,  { headers }),
        fetch(`${API_URL}/api/whatsapp/broadcasts`, { headers }),
        fetch(`${API_URL}/api/whatsapp/stats`,      { headers }),
      ])
      if (rTmpl.ok)  setTemplates(await rTmpl.json())
      if (rBroad.ok) setBroadcasts(await rBroad.json())
      if (rStats.ok) setStats(await rStats.json())
    } catch {}
    setLoading(false)
  }

  // ─── log helpers ───────────────────────────────────────────────────────────

  function addLog(set: typeof setLogOne, msg: string, tipo: LogLine['tipo'] = 'info') {
    set(p => [...p, { msg, tipo }])
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  // ─── envio único ───────────────────────────────────────────────────────────

  async function enviarUnico() {
    if (!tmplSel || !phoneOne.trim()) return
    setSendingOne(true); setLogOne([])
    addLog(setLogOne, `> /whatsapp send template="${tmplSel.id}" to="${phoneOne}"`, 'info')
    addLog(setLogOne, '📡 Conectando à Meta API v25.0...', 'info')

    try {
      const res = await fetch(`${API_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to:           phoneOne.replace(/\D/g,''),
          type:         'template',
          templateName: tmplSel.id,
          language:     tmplSel.language,
          params:       tmplParams.filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro na API')
      addLog(setLogOne, `✅ Mensagem enviada! ID: ${data.messageId}`, 'ok')
      addLog(setLogOne, `📤 Template "${tmplSel.nome}" → ${phoneOne}`, 'ok')
    } catch (e: any) {
      addLog(setLogOne, `❌ Erro: ${e.message}`, 'error')
    }
    setSendingOne(false)
  }

  // ─── disparo em massa ──────────────────────────────────────────────────────

  async function dispararMassa() {
    const phones = massPhones.split('\n').map(p => p.trim().replace(/\D/g,'')).filter(p => p.length >= 10)
    if (!massTitle.trim() || phones.length === 0) return
    if (massType === 'template' && !massTmpl) return
    if (massType === 'text' && !massText.trim()) return

    setSending(true); setLogMass([])
    addLog(setLogMass, `> /whatsapp dispatch total="${phones.length}" tipo="${massType}"`, 'info')
    addLog(setLogMass, `📋 ${phones.length} números validados`, 'info')
    addLog(setLogMass, '📡 Registrando broadcast no banco...', 'info')

    try {
      const body: any = {
        title:  massTitle,
        phones,
        type:   massType,
        params: massParams.filter(Boolean),
      }
      if (massType === 'template') {
        body.templateName = massTmpl!.id
        body.language     = massTmpl!.language
      } else {
        body.text = massText
      }

      const res = await fetch(`${API_URL}/api/whatsapp/dispatch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro no dispatch')

      addLog(setLogMass, `✅ Disparo iniciado! ID: ${data.broadcastId}`, 'ok')
      addLog(setLogMass, `📤 ${phones.length} mensagens em fila (1/seg — regra Meta)`, 'ok')
      addLog(setLogMass, `⏱️ Estimativa: ~${Math.ceil(phones.length/60)} min para conclusão`, 'info')
      addLog(setLogMass, '🔄 Atualizando histórico...', 'info')

      await loadAll()
      addLog(setLogMass, '✅ Histórico atualizado.', 'ok')
      setAba('disparos')
    } catch (e: any) {
      addLog(setLogMass, `❌ Erro: ${e.message}`, 'error')
    }
    setSending(false)
  }

  // ─── ao selecionar template, reset params ──────────────────────────────────
  function selecionarTemplateUnico(t: Template) {
    setTmplSel(t); setTmplParams(new Array(t.params.length).fill(''))
  }
  function selecionarTemplateMassa(t: Template) {
    setMassTmpl(t); setMassParams(new Array(t.params.length).fill(''))
  }

  // ─── preview com params preenchidos ────────────────────────────────────────
  function renderPreview(tmpl: Template, params: string[]) {
    let text = tmpl.preview
    params.forEach((p, i) => { text = text.replace(`{{${i+1}}}`, p || `{{${i+1}}}`) })
    return text
  }

  const logColor: Record<string, string> = {
    ok: 'text-green-400', info: 'text-blue-300', warn: 'text-yellow-400',
    error: 'text-red-400',
  }

  const statusColor: Record<string, string> = {
    ENVIADO:  'bg-green-100 text-green-700',
    ENVIANDO: 'bg-blue-100 text-blue-700',
    AGENDADO: 'bg-yellow-100 text-yellow-700',
    PENDENTE: 'bg-gray-100 text-gray-600',
    ERRO:     'bg-red-100 text-red-700',
  }

  // ─── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">💬 WhatsApp Business</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Disparos em produção · Meta API v25.0 · Phone ID {' '}
            <span className="font-mono text-[10px] text-gray-400">1099952049866345</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-semibold text-green-700">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            API Ativa
          </span>
          <button onClick={() => setAba('novo')}
            className="px-4 py-2.5 bg-[#25D366] text-white text-sm font-semibold rounded-lg hover:bg-[#1ebe5a] transition-colors flex items-center gap-2">
            📤 Novo Disparo
          </button>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-20 animate-pulse bg-gray-50" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Mensagens Enviadas', value: (stats?.totalMensagens || 0).toLocaleString('pt-BR'), icon: '📤', color: 'text-green-600' },
            { label: 'Broadcasts Totais',  value: stats?.total || 0, icon: '📋', color: 'text-blue-600' },
            { label: 'Em Andamento',       value: stats?.enviando || 0, icon: '🔄', color: 'text-orange-500' },
            { label: 'Templates Aprovados',value: templates.length || 5, icon: '✅', color: 'text-purple-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([
          ['disparos',  '📜 Histórico'],
          ['templates', '📝 Templates Aprovados'],
          ['novo',      '🚀 Disparar em Massa'],
        ] as const).map(([id, label]) => (
          <button key={id} onClick={() => setAba(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              aba === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ─── ABA: HISTÓRICO ─── */}
      {aba === 'disparos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 text-sm">Broadcasts Recentes</h2>
            <button onClick={loadAll} className="text-xs text-[#0066CC] hover:underline">↻ Atualizar</button>
          </div>

          {loading && <div className="text-center py-10 text-gray-400 text-sm">Carregando...</div>}

          {!loading && broadcasts.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-gray-500 text-sm">Nenhum disparo realizado ainda.</p>
              <button onClick={() => setAba('novo')}
                className="mt-3 px-4 py-2 bg-[#25D366] text-white text-sm font-medium rounded-lg hover:bg-[#1ebe5a]">
                Criar primeiro disparo
              </button>
            </div>
          )}

          {broadcasts.map(b => {
            const taxa = b.contactCount > 0 ? Math.round((b.sentCount / b.contactCount) * 100) : 0
            return (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{b.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {b.store?.name || 'Todas as lojas'} ·{' '}
                      {new Date(b.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[b.status] || 'bg-gray-100 text-gray-500'}`}>
                    {b.status}
                  </span>
                </div>
                <div className="flex items-center gap-5 text-xs text-gray-500 mb-2">
                  <span>👥 {b.contactCount.toLocaleString('pt-BR')} destinatários</span>
                  <span>📤 {b.sentCount.toLocaleString('pt-BR')} enviados</span>
                  {b.failedCount > 0 && <span className="text-red-500">❌ {b.failedCount} falhas</span>}
                  {b.sentCount > 0 && <span className="font-semibold text-emerald-600">{taxa}% entrega</span>}
                </div>
                {b.contactCount > 0 && (
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${taxa}%` }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ─── ABA: TEMPLATES APROVADOS ─── */}
      {aba === 'templates' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800">
            <strong>✅ Templates aprovados pela Meta</strong> — Esses templates passaram pela revisão do WhatsApp Business e podem ser enviados imediatamente para qualquer número.
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {(templates.length ? templates : []).map(tmpl => (
              <div key={tmpl.id} className={`bg-white rounded-xl border-2 transition-all ${tmplSel?.id === tmpl.id ? 'border-[#25D366]' : 'border-gray-200'}`}>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl">{tmpl.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{tmpl.nome}</p>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">APROVADO</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{tmpl.descricao}</p>
                    </div>
                  </div>

                  {/* preview */}
                  <div className="bg-[#dcf8c6] rounded-xl rounded-tl-sm p-3 text-xs text-gray-800 mb-3 leading-relaxed font-[system-ui]">
                    {renderPreview(tmpl, tmplSel?.id === tmpl.id ? tmplParams : [])}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <span>🌐 {tmpl.language}</span>
                    <span>·</span>
                    <span>📌 {tmpl.params.length} parâmetro{tmpl.params.length !== 1 ? 's' : ''}</span>
                  </div>

                  <button onClick={() => { selecionarTemplateUnico(tmpl); setAba('templates') }}
                    className={`w-full py-2 text-sm font-semibold rounded-lg transition-colors ${
                      tmplSel?.id === tmpl.id
                        ? 'bg-[#25D366] text-white'
                        : 'border border-[#25D366] text-[#25D366] hover:bg-green-50'
                    }`}>
                    {tmplSel?.id === tmpl.id ? '✓ Selecionado' : 'Usar Template'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* form envio único com template selecionado */}
          {tmplSel && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                {tmplSel.emoji} Enviar "{tmplSel.nome}" — Teste/Unitário
              </h3>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Número destinatário (com DDI)
                </label>
                <input value={phoneOne} onChange={e => setPhoneOne(e.target.value)}
                  placeholder="Ex: 5551999999999"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-[#25D366]" />
              </div>

              {tmplSel.params.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tmplSel.params.map((p, i) => (
                    <div key={i}>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">{`{{${i+1}}} ${p}`}</label>
                      <input value={tmplParams[i] || ''} onChange={e => {
                        const np = [...tmplParams]; np[i] = e.target.value; setTmplParams(np)
                      }}
                        placeholder={p}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#25D366]" />
                    </div>
                  ))}
                </div>
              )}

              {tmplParams.some(Boolean) && (
                <div className="bg-[#dcf8c6] rounded-xl rounded-tl-sm p-3 text-xs text-gray-800 leading-relaxed font-[system-ui]">
                  <p className="text-[10px] text-gray-400 mb-1 font-sans uppercase tracking-wide">Preview</p>
                  {renderPreview(tmplSel, tmplParams)}
                </div>
              )}

              <button onClick={enviarUnico} disabled={sendingOne || !phoneOne.trim()}
                className="px-6 py-2.5 bg-[#25D366] text-white text-sm font-bold rounded-lg hover:bg-[#1ebe5a] disabled:opacity-50 transition-colors">
                {sendingOne ? '⏳ Enviando...' : '📤 Enviar Mensagem'}
              </button>

              {logOne.length > 0 && (
                <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs space-y-0.5 max-h-32 overflow-y-auto">
                  {logOne.map((l, i) => <div key={i} className={logColor[l.tipo]}>{l.msg}</div>)}
                  {sendingOne && <div className="text-gray-400 animate-pulse">▌</div>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── ABA: DISPARAR EM MASSA ─── */}
      {aba === 'novo' && (
        <div className="space-y-5">

          {/* Aviso Clube Mais */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-1">
            <p className="font-bold">⚠️ Como usar o disparo em massa</p>
            <p>• <strong>Templates B2B aprovados</strong> (cotação): envie para fornecedores sem restrição.</p>
            <p>• <strong>Texto livre</strong>: só funciona para números que já enviaram mensagem ao Índio nas últimas 24h.</p>
            <p>• Para campanhas Clube Mais (B2C), crie templates no Meta Business Manager e solicite aprovação.</p>
          </div>

          {/* Listas disponíveis */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">📋 Listas Clube Mais disponíveis</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {LISTAS_DEMO.map(l => (
                <div key={l.id} className="bg-gray-50 rounded-lg p-3 text-xs">
                  <p className="font-semibold text-gray-800">{l.nome}</p>
                  <p className="text-gray-400 mt-0.5">{l.contatos.toLocaleString('pt-BR')} contatos</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">* Cole os números manualmente no campo abaixo ou integre via exportação do ERP.</p>
          </div>

          {/* Formulário */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm">🚀 Configurar Disparo</h3>

            {/* Título */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Título do broadcast *</label>
              <input value={massTitle} onChange={e => setMassTitle(e.target.value)}
                placeholder="Ex: Cotação Quinzenal #23 — Fornecedores"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#25D366]" />
            </div>

            {/* Tipo */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Tipo de mensagem</label>
              <div className="flex gap-2">
                {(['template','text'] as const).map(t => (
                  <button key={t} onClick={() => setMassType(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      massType === t ? 'bg-[#25D366] text-white border-[#25D366]' : 'border-gray-300 text-gray-600 hover:border-[#25D366]'
                    }`}>
                    {t === 'template' ? '📝 Template Aprovado' : '✍️ Texto Livre'}
                  </button>
                ))}
              </div>
            </div>

            {/* Template selector */}
            {massType === 'template' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Template *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {templates.map(t => (
                    <button key={t.id} onClick={() => selecionarTemplateMassa(t)}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        massTmpl?.id === t.id ? 'border-[#25D366] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{t.emoji}</span>
                        <p className="text-sm font-semibold text-gray-900">{t.nome}</p>
                      </div>
                      <p className="text-xs text-gray-400">{t.params.length} parâmetro{t.params.length !== 1 ? 's' : ''}</p>
                    </button>
                  ))}
                </div>

                {massTmpl && massTmpl.params.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {massTmpl.params.map((p, i) => (
                      <div key={i}>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">{`{{${i+1}}} ${p}`}</label>
                        <input value={massParams[i] || ''} onChange={e => {
                          const np = [...massParams]; np[i] = e.target.value; setMassParams(np)
                        }}
                          placeholder={p}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#25D366]" />
                      </div>
                    ))}
                  </div>
                )}

                {massTmpl && (
                  <div className="bg-[#dcf8c6] rounded-xl rounded-tl-sm p-3 text-xs text-gray-800 leading-relaxed font-[system-ui]">
                    <p className="text-[10px] text-gray-400 mb-1 font-sans uppercase tracking-wide">Preview do template</p>
                    {renderPreview(massTmpl, massParams)}
                  </div>
                )}
              </div>
            )}

            {/* Texto livre */}
            {massType === 'text' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Mensagem *</label>
                <textarea value={massText} onChange={e => setMassText(e.target.value)} rows={4}
                  placeholder="Digite a mensagem que será enviada para todos os números..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-[#25D366]" />
              </div>
            )}

            {/* Lista de números */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Lista de números * <span className="text-gray-400 font-normal normal-case">(um por linha, com DDI — ex: 5551999999999)</span>
              </label>
              <textarea value={massPhones} onChange={e => setMassPhones(e.target.value)} rows={6}
                placeholder={"5551999999999\n5551988888888\n5553977777777"}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono resize-none focus:outline-none focus:border-[#25D366]" />
              <p className="text-xs text-gray-400 mt-1">
                {massPhones.split('\n').filter(p => p.trim().replace(/\D/g,'').length >= 10).length} números válidos detectados
              </p>
            </div>

            {/* Botão disparar */}
            <button onClick={dispararMassa} disabled={sending}
              className="w-full py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1ebe5a] disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2">
              {sending ? '⏳ Processando...' : '🚀 Iniciar Disparo em Massa'}
            </button>
          </div>

          {/* Console disparo em massa */}
          {logMass.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                💻 Log do Disparo
                <span className="flex-1 h-px bg-gray-200" />
                <button onClick={() => setLogMass([])} className="text-xs text-gray-400">Limpar</button>
              </h3>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs space-y-0.5 max-h-48 overflow-y-auto">
                {logMass.map((l, i) => <div key={i} className={logColor[l.tipo]}>{l.msg}</div>)}
                {sending && <div className="text-gray-400 animate-pulse">▌</div>}
                <div ref={logEndRef} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
