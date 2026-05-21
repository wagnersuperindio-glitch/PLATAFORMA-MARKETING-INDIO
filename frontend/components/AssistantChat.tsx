'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { API_URL } from '@/lib/api'

type Message = { role: 'user' | 'assistant'; content: string; ts?: number }

const PAGE_LABELS: Record<string, string> = {
  '/fabrica':    'Fábrica de Conteúdo',
  '/videos':     'Vídeos & Avatares',
  '/audio':      'Áudio & Carro de Som',
  '/templates':  'Templates',
  '/conteudo':   'Conteúdo Digital',
  '/publicar':   'Publicar',
  '/whatsapp':   'WhatsApp',
  '/radio':      'Rádio Indoor',
  '/dashboard':  'Dashboard',
  '/pedidos':    'Pedidos de Arte',
  '/campanhas':  'Campanhas',
  '/calendario': 'Calendário',
  '/concorrentes':'Concorrentes',
  '/analytics':  'Analytics',
}

const QUICK_DEFAULTS = [
  'Como usar esta funcionalidade?',
  'O que posso fazer aqui?',
  'Sugerir conteúdo para hoje',
]

export default function AssistantChat() {
  const pathname = usePathname()
  const [open, setOpen]               = useState(false)
  const [messages, setMessages]       = useState<Message[]>([])
  const [input, setInput]             = useState('')
  const [streaming, setStreaming]     = useState(false)
  const [quickActions, setQuickActions] = useState<string[]>(QUICK_DEFAULTS)
  const [showQuick, setShowQuick]     = useState(true)
  const bottomRef                     = useRef<HTMLDivElement>(null)
  const inputRef                      = useRef<HTMLTextAreaElement>(null)
  const abortRef                      = useRef<AbortController | null>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  // Detectar página e carregar quick actions
  useEffect(() => {
    if (!open) return
    fetch(`${API_URL}/api/assistant/quick-actions?page=${encodeURIComponent(pathname)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.actions) setQuickActions(d.actions) })
      .catch(() => {})
  }, [pathname, open])

  // Scroll ao fundo
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  // Foco no input ao abrir
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  // Saudação inicial ao abrir pela primeira vez
  useEffect(() => {
    if (open && messages.length === 0) {
      const page = PAGE_LABELS[pathname] || 'plataforma'
      setMessages([{
        role: 'assistant',
        content: `👋 Olá! Sou o **Índio Assistente**, sua IA de marketing.\n\nEstou aqui para ajudar com **${page}**. Posso criar conteúdo, sugerir campanhas, escrever roteiros e muito mais!\n\nO que vamos fazer hoje?`,
        ts: Date.now(),
      }])
    }
  }, [open])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return

    const userMsg: Message = { role: 'user', content: text.trim(), ts: Date.now() }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setInput('')
    setShowQuick(false)
    setStreaming(true)

    // Placeholder do assistente
    const assistantIdx = newHistory.length
    setMessages(h => [...h, { role: 'assistant', content: '', ts: Date.now() }])

    try {
      abortRef.current = new AbortController()

      const res = await fetch(`${API_URL}/api/assistant/chat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          page: pathname,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error('Erro na API')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.text) {
              setMessages(h => {
                const updated = [...h]
                updated[assistantIdx] = {
                  ...updated[assistantIdx],
                  content: (updated[assistantIdx].content || '') + data.text,
                }
                return updated
              })
            }
            if (data.done || data.error) break
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(h => {
          const updated = [...h]
          updated[assistantIdx] = { ...updated[assistantIdx], content: '❌ Erro ao conectar. Tente novamente.' }
          return updated
        })
      }
    }

    setStreaming(false)
  }, [messages, pathname, streaming, token])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function clearChat() {
    setMessages([])
    setShowQuick(true)
    setInput('')
    // nova saudação
    setTimeout(() => {
      const page = PAGE_LABELS[pathname] || 'plataforma'
      setMessages([{
        role: 'assistant',
        content: `🔄 Nova conversa iniciada! Estou pronto para ajudar com **${page}**.\n\nO que vamos criar?`,
        ts: Date.now(),
      }])
    }, 100)
  }

  function stopStreaming() {
    abortRef.current?.abort()
    setStreaming(false)
  }

  // Renderizar markdown simples
  function renderMd(text: string) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>')
      .replace(/\n/g, '<br/>')
  }

  const pageName = PAGE_LABELS[pathname] || 'Plataforma'

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-gray-700 rotate-45 scale-90'
            : 'bg-gradient-to-br from-[#0066CC] to-[#004499] hover:scale-110'
        }`}
        title="Índio Assistente IA"
      >
        {open ? (
          <span className="text-white text-xl">✕</span>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
        {/* Badge pulsante quando fechado */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B00] rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Painel do chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-[#0066CC] to-[#004499] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl flex-shrink-0">
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Índio Assistente IA</p>
              <p className="text-blue-200 text-xs truncate">📍 {pageName} · Claude Haiku</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={clearChat} title="Nova conversa"
                className="text-blue-200 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors">
                🔄
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#0066CC] flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                    🤖
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#0066CC] text-white rounded-tr-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                }`}>
                  {m.role === 'assistant' ? (
                    <div dangerouslySetInnerHTML={{ __html: renderMd(m.content) || '▌' }} />
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            {/* Indicador de streaming */}
            {streaming && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-[#0066CC] flex items-center justify-center text-sm mr-2 flex-shrink-0">🤖</div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-[#0066CC] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#0066CC] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#0066CC] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Quick actions */}
            {showQuick && messages.length <= 1 && !streaming && (
              <div className="pt-1 space-y-1.5">
                <p className="text-xs text-gray-400 text-center">Sugestões rápidas:</p>
                {quickActions.map((qa, i) => (
                  <button key={i} onClick={() => sendMessage(qa)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-white border border-blue-100 hover:border-[#0066CC] hover:bg-blue-50 text-xs text-gray-700 transition-colors shadow-sm">
                    ⚡ {qa}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte algo ou peça ajuda..."
                rows={1}
                disabled={streaming}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-[#0066CC] disabled:bg-gray-50 max-h-28 overflow-y-auto"
                style={{ minHeight: '42px' }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 112) + 'px'
                }}
              />
              {streaming ? (
                <button onClick={stopStreaming}
                  className="w-10 h-10 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center flex-shrink-0 text-sm">
                  ⏹
                </button>
              ) : (
                <button onClick={() => sendMessage(input)} disabled={!input.trim()}
                  className="w-10 h-10 bg-[#0066CC] text-white rounded-xl hover:bg-[#0052A3] disabled:opacity-40 transition-colors flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              Enter para enviar · Shift+Enter para nova linha
            </p>
          </div>
        </div>
      )}
    </>
  )
}
