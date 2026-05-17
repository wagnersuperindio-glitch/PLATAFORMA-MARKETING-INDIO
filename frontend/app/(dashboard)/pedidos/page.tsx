'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { API_URL } from '@/lib/api'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDENTE:           { label: 'Pendente',        color: 'bg-yellow-100 text-yellow-700' },
  PROCESSANDO:        { label: 'IA Processando',  color: 'bg-blue-100 text-blue-700 animate-pulse' },
  AGUARDANDO_REVISAO: { label: 'Para Revisão',    color: 'bg-purple-100 text-purple-700' },
  APROVADO:           { label: 'Aprovado',        color: 'bg-green-100 text-green-700' },
  REJEITADO:          { label: 'Rejeitado',       color: 'bg-red-100 text-red-700' },
  PUBLICADO:          { label: 'Publicado',       color: 'bg-gray-100 text-gray-600' },
}

const PRIORITY_ICON: Record<string, string> = {
  URGENTE: '🔴', ALTA: '🟠', NORMAL: '🟡', BAIXA: '🟢',
}

type Copy = {
  headline: string
  subheadline: string
  cta: string
  caption_instagram: string
  caption_whatsapp: string
  hashtags: string[]
  design_tip: string
}

type Request = {
  id: string
  title: string
  type: string
  status: string
  priority: string
  description?: string
  resultArtUrl?: string
  createdAt: string
  store?: { name: string; city: string }
}

function CopyPanel({ requestId, status }: { requestId: string; status: string }) {
  const [copy, setCopy] = useState<Copy | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'AGUARDANDO_REVISAO' || status === 'APROVADO') {
      fetchCopy()
    }
  }, [requestId, status])

  async function fetchCopy() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${API_URL}/api/requests/${requestId}/copy`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (data.copy) setCopy(data.copy)
    } catch { /* silently fail */ }
    finally { setLoading(false) }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-2 text-xs text-blue-600 animate-pulse">
        <span>✨</span> Carregando copy gerado pela IA...
      </div>
    </div>
  )

  if (!copy) return null

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
      {/* Headline */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Headline</p>
            <p className="font-bold text-gray-900 text-sm">{copy.headline}</p>
            {copy.subheadline && (
              <p className="text-gray-500 text-xs mt-0.5">{copy.subheadline}</p>
            )}
          </div>
          <button onClick={() => copyText(copy.headline, 'headline')}
            className="shrink-0 text-xs text-gray-400 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-white">
            {copied === 'headline' ? '✓' : '📋'}
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider shrink-0">CTA:</span>
        <span className="flex-1 text-xs font-semibold text-[#FF6B00] bg-orange-50 px-3 py-1.5 rounded-full">
          {copy.cta}
        </span>
        <button onClick={() => copyText(copy.cta, 'cta')}
          className="text-xs text-gray-400 hover:text-blue-600 transition-colors">
          {copied === 'cta' ? '✓' : '📋'}
        </button>
      </div>

      {/* Caption Instagram */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-500">📸 Caption Instagram</span>
          <button onClick={() => copyText(copy.caption_instagram, 'ig')}
            className="text-xs text-gray-400 hover:text-blue-600 transition-colors">
            {copied === 'ig' ? '✓ Copiado!' : '📋 Copiar'}
          </button>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{copy.caption_instagram}</p>
      </div>

      {/* Caption WhatsApp */}
      <div className="bg-green-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-500">💬 Mensagem WhatsApp</span>
          <button onClick={() => copyText(copy.caption_whatsapp, 'wa')}
            className="text-xs text-gray-400 hover:text-green-600 transition-colors">
            {copied === 'wa' ? '✓ Copiado!' : '📋 Copiar'}
          </button>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed">{copy.caption_whatsapp}</p>
      </div>

      {/* Hashtags + Dica design */}
      <div className="flex gap-2 flex-wrap">
        {copy.hashtags?.slice(0, 6).map((h, i) => (
          <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{h}</span>
        ))}
      </div>
      {copy.design_tip && (
        <div className="text-xs text-gray-400 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
          💡 <span className="font-medium text-yellow-700">Dica de layout:</span> {copy.design_tip}
        </div>
      )}
    </div>
  )
}

function RequestCard({
  req,
  onStatusChange,
}: {
  req: Request
  onStatusChange: () => void
}) {
  const [expanded, setExpanded] = useState(req.status === 'AGUARDANDO_REVISAO')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  async function callAction(endpoint: string, method = 'PATCH', body?: object) {
    setActionLoading(endpoint)
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/api/requests/${req.id}/${endpoint}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      onStatusChange()
    } catch { /* ignore */ }
    finally { setActionLoading(null) }
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/api/requests/${req.id}/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      // Polling por até 30s até mudar de status
      let attempts = 0
      const interval = setInterval(async () => {
        attempts++
        const res = await fetch(
          `${API_URL}/api/requests/${req.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()
        if (data.status !== 'PROCESSANDO' || attempts > 15) {
          clearInterval(interval)
          setGenerating(false)
          onStatusChange()
        }
      }, 2000)
    } catch {
      setGenerating(false)
    }
  }

  const hasCopy = req.resultArtUrl && req.status !== 'PENDENTE'

  return (
    <div className={`bg-white rounded-xl border transition-all ${
      req.status === 'AGUARDANDO_REVISAO' ? 'border-purple-200 shadow-sm shadow-purple-100' : 'border-gray-200'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span>{PRIORITY_ICON[req.priority]}</span>
              <h3 className="font-semibold text-gray-900 text-sm truncate">{req.title}</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{req.type}</span>
              <span>{req.store?.name}</span>
              <span>·</span>
              <span>{new Date(req.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            {req.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">{req.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_LABEL[req.status]?.color}`}>
              {STATUS_LABEL[req.status]?.label || req.status}
            </span>
            {hasCopy && (
              <button onClick={() => setExpanded(e => !e)}
                className="text-xs text-gray-400 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                {expanded ? '▲' : '✨ Copy'}
              </button>
            )}
          </div>
        </div>

        {/* Botão gerar para PENDENTE */}
        {req.status === 'PENDENTE' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2 text-xs font-medium text-white bg-gradient-to-r from-[#0066CC] to-purple-600 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {generating ? (
                <>
                  <span className="animate-spin">⟳</span> IA gerando copy... aguarde
                </>
              ) : (
                <>✨ Gerar copy com IA</>
              )}
            </button>
          </div>
        )}

        {/* Copy expandido */}
        {expanded && hasCopy && (
          <CopyPanel requestId={req.id} status={req.status} />
        )}

        {/* Botões de ação para revisão */}
        {req.status === 'AGUARDANDO_REVISAO' && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
            <button
              onClick={() => callAction('approve')}
              disabled={actionLoading !== null}
              className="flex-1 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-60">
              {actionLoading === 'approve' ? '...' : '✅ Aprovar'}
            </button>
            <button
              onClick={() => handleGenerate()}
              disabled={generating || actionLoading !== null}
              className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-60">
              {generating ? '⟳ Gerando...' : '✏️ Regerar'}
            </button>
            <button
              onClick={() => callAction('reject', 'PATCH', { reviewNotes: 'Rejeitado via painel' })}
              disabled={actionLoading !== null}
              className="flex-1 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-60">
              {actionLoading === 'reject' ? '...' : '✕ Rejeitar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PedidosPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('TODOS')

  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setRequests(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const pendingReview = requests.filter(r => r.status === 'AGUARDANDO_REVISAO').length
  const filtered = filter === 'TODOS' ? requests : requests.filter(r => r.status === filter)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pedidos de Arte</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pendingReview > 0
              ? `🔔 ${pendingReview} pedido${pendingReview > 1 ? 's' : ''} aguardando revisão`
              : 'Solicite conteúdo — a IA gera automaticamente'}
          </p>
        </div>
        <Link href="/pedidos/novo"
          className="px-4 py-2.5 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0052A3] transition-colors">
          + Novo Pedido
        </Link>
      </div>

      {/* Banner IA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white flex items-center gap-4">
        <span className="text-3xl">✨</span>
        <div className="flex-1">
          <p className="font-semibold text-sm">Claude gera headline, caption e copy completo</p>
          <p className="text-blue-100 text-xs mt-0.5">Inclui legenda para Instagram, mensagem WhatsApp, hashtags e dica de layout</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['TODOS', 'PENDENTE', 'PROCESSANDO', 'AGUARDANDO_REVISAO', 'APROVADO', 'PUBLICADO'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s ? 'bg-[#0066CC] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s === 'TODOS' ? `Todos (${requests.length})` : STATUS_LABEL[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">🎨</p>
          <p className="text-gray-500 font-medium">Nenhum pedido encontrado</p>
          <Link href="/pedidos/novo"
            className="mt-4 inline-block text-sm text-[#0066CC] hover:underline font-medium">
            Criar primeiro pedido →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <RequestCard key={req.id} req={req} onStatusChange={fetchRequests} />
          ))}
        </div>
      )}
    </div>
  )
}
