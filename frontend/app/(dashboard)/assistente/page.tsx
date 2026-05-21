'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { API_URL } from '@/lib/api'

type Message = { role: 'user' | 'assistant'; content: string }

// ─── Assistentes especializados ──────────────────────────────────────────────

const ASSISTENTES = [
  {
    id: 'marketing',
    nome: 'Índio Marketing',
    emoji: '📣',
    desc: 'Campanhas, conteúdo, redes sociais e estratégias de marketing',
    cor: 'from-blue-600 to-blue-800',
    saudacao: 'Olá! Sou o **Índio Marketing**. Posso ajudar a criar campanhas, legendas, hooks para redes sociais, hashtags e estratégias completas. O que vamos criar hoje?',
    exemplos: [
      'Criar campanha da Sexta das Carnes completa',
      'Legenda + hashtags para post de promoção',
      'Planejamento editorial para julho',
      'Hook irresistível para Reel de desconto',
    ],
    page: '/campanhas',
  },
  {
    id: 'conteudo',
    nome: 'Criador de Conteúdo',
    emoji: '🎬',
    desc: 'Roteiros, scripts, hooks para vídeos, áudio e carro de som',
    cor: 'from-purple-600 to-purple-800',
    saudacao: 'Olá! Sou o **Criador de Conteúdo** do Índio. Especializado em roteiros para Reels, TikTok, vídeos com avatar, carro de som e rádio indoor. Qual conteúdo criar?',
    exemplos: [
      'Roteiro de 30s para Reel da Sexta das Carnes',
      'Script para o avatar Seu Neri falar sobre promoção',
      'Texto de carro de som para quinta-feira',
      'Vinheta de abertura para a rádio indoor',
    ],
    page: '/conteudo',
  },
  {
    id: 'encarte',
    nome: 'Especialista em Encartes',
    emoji: '📋',
    desc: 'Seleção de produtos, preços, layout e textos para encartes',
    cor: 'from-orange-500 to-red-700',
    saudacao: 'Olá! Sou o **Especialista em Encartes** do Índio. Posso ajudar a selecionar produtos para o encarte, sugerir textos de destaque, organizar seções e muito mais!',
    exemplos: [
      'Sugerir 12 produtos para encarte quinzenal',
      'Texto de chamada para destaque de carne',
      'Organizar seções do encarte por categoria',
      'Criar slogan para encarte de fim de ano',
    ],
    page: '/templates',
  },
  {
    id: 'whatsapp',
    nome: 'Redator WhatsApp',
    emoji: '💬',
    desc: 'Mensagens, templates e estratégias para disparos em massa',
    cor: 'from-green-600 to-green-800',
    saudacao: 'Olá! Sou o **Redator WhatsApp** do Índio. Posso criar mensagens para disparos, adaptar templates aprovados e sugerir estratégias de comunicação com o Clube Mais!',
    exemplos: [
      'Mensagem de oferta relâmpago para o Clube Mais',
      'Texto para convite de cotação ao fornecedor',
      'Criar sequência de 3 mensagens para campanha',
      'Adaptar encarte quinzenal para WhatsApp',
    ],
    page: '/whatsapp',
  },
  {
    id: 'estrategia',
    nome: 'Estrategista Comercial',
    emoji: '📈',
    desc: 'Análise de concorrentes, estratégias de preço e posicionamento',
    cor: 'from-teal-600 to-cyan-800',
    saudacao: 'Olá! Sou o **Estrategista Comercial** do Índio. Posso ajudar a analisar concorrentes, sugerir estratégias de precificação e posicionamento para cada cidade!',
    exemplos: [
      'Como responder à promoção do Tonin em Guaíba?',
      'Estratégia para aumentar ticket médio',
      'Sugestão de produto âncora para a semana',
      'Como fortalecer o Clube Mais em Charqueadas?',
    ],
    page: '/concorrentes',
  },
  {
    id: 'calendario',
    nome: 'Planejador Editorial',
    emoji: '📅',
    desc: 'Calendário de conteúdo, datas comemorativas e pauta mensal',
    cor: 'from-indigo-600 to-blue-900',
    saudacao: 'Olá! Sou o **Planejador Editorial** do Índio. Posso montar o calendário de conteúdo completo, sugerir campanhas por data comemorativa e organizar toda a pauta!',
    exemplos: [
      'Montar calendário editorial para o próximo mês',
      'Quais datas comemorativas trabalhar em agosto?',
      'Planejar campanha da Farroupilha completa',
      'Sugerir 4 temas semanais para Instagram',
    ],
    page: '/calendario',
  },
]

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AssistentePage() {
  const [assistenteId, setAssistenteId] = useState<string | null>(null)
  const [messages, setMessages]         = useState<Message[]>([])
  const [input, setInput]               = useState('')
  const [streaming, setStreaming]       = useState(false)
  const bottomRef                       = useRef<HTMLDivElement>(null)
  const inputRef                        = useRef<HTMLTextAreaElement>(null)
  const abortRef                        = useRef<AbortController | null>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const assistente = ASSISTENTES.find(a => a.id === assistenteId)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (assistenteId) setTimeout(() => inputRef.current?.focus(), 100) }, [assistenteId])

  function selecionarAssistente(id: string) {
    const a = ASSISTENTES.find(x => x.id === id)!
    setAssistenteId(id)
    setMessages([{ role: 'assistant', content: a.saudacao }])
    setInput('')
  }

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming || !assistente) return

    const userMsg: Message = { role: 'user', content: text.trim() }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setInput('')
    setStreaming(true)

    const assistantIdx = newHistory.length
    setMessages(h => [...h, { role: 'assistant', content: '' }])

    try {
      abortRef.current = new AbortController()
      const res = await fetch(`${API_URL}/api/assistant/chat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          page: assistente.page,
          context: `Modo especializado: ${assistente.nome}. ${assistente.desc}`,
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
                const u = [...h]
                u[assistantIdx] = { ...u[assistantIdx], content: (u[assistantIdx].content || '') + data.text }
                return u
              })
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(h => {
          const u = [...h]
          u[assistantIdx] = { ...u[assistantIdx], content: '❌ Erro. Tente novamente.' }
          return u
        })
      }
    }
    setStreaming(false)
  }, [messages, streaming, assistente, token])

  function renderMd(text: string) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>')
      .replace(/\n/g, '<br/>')
  }

  // ─── Tela de seleção ─────────────────────────────────────────────────────

  if (!assistenteId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🤖 Assistentes IA</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            6 assistentes especializados para ajudar o time de marketing do Índio
          </p>
        </div>

        {/* Assistente flutuante */}
        <div className="bg-gradient-to-r from-[#0066CC] to-[#004499] rounded-2xl p-5 text-white flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">🤖</div>
          <div className="flex-1">
            <h2 className="font-bold text-lg">Índio Assistente (Flutuante)</h2>
            <p className="text-blue-200 text-sm">Disponível em <strong>todas as páginas</strong> da plataforma — clique no botão 🤖 no canto inferior direito.</p>
          </div>
          <div className="bg-green-400 text-green-900 text-xs font-bold px-3 py-1.5 rounded-full">ATIVO</div>
        </div>

        {/* Grid de assistentes especializados */}
        <div>
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">Assistentes Especializados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ASSISTENTES.map(a => (
              <button key={a.id} onClick={() => selecionarAssistente(a.id)}
                className="text-left bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                {/* Header colorido */}
                <div className={`bg-gradient-to-br ${a.cor} p-4 flex items-center gap-3`}>
                  <span className="text-4xl">{a.emoji}</span>
                  <div>
                    <p className="text-white font-bold">{a.nome}</p>
                    <p className="text-white/70 text-xs mt-0.5">{a.desc}</p>
                  </div>
                </div>
                {/* Exemplos */}
                <div className="p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Exemplos do que posso fazer:</p>
                  {a.exemplos.slice(0, 3).map((e, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <span className="text-[#0066CC] mt-0.5 flex-shrink-0">→</span>
                      <span>{e}</span>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                    <span className="text-xs font-semibold text-[#0066CC] group-hover:underline">
                      Iniciar conversa →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dica de uso */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
          <p className="font-bold mb-1">💡 Como usar os assistentes</p>
          <p>Selecione um assistente especializado para tarefas específicas. O assistente flutuante 🤖 (canto inferior direito) está sempre disponível para ajuda rápida em qualquer página.</p>
        </div>
      </div>
    )
  }

  // ─── Tela de chat ─────────────────────────────────────────────────────────

  if (!assistente) return null

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header do chat */}
      <div className={`bg-gradient-to-r ${assistente.cor} rounded-2xl p-4 mb-4 flex items-center gap-3`}>
        <span className="text-3xl">{assistente.emoji}</span>
        <div className="flex-1">
          <h1 className="text-white font-bold">{assistente.nome}</h1>
          <p className="text-white/70 text-xs">{assistente.desc}</p>
        </div>
        <button onClick={() => setAssistenteId(null)}
          className="text-white/60 hover:text-white text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
          ← Outros assistentes
        </button>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl p-4 space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${assistente.cor} flex items-center justify-center text-lg mr-3 flex-shrink-0 mt-1`}>
                {assistente.emoji}
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-[#0066CC] text-white rounded-tr-sm'
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
            }`}>
              {m.role === 'assistant'
                ? <div dangerouslySetInnerHTML={{ __html: renderMd(m.content) || '<span class="animate-pulse">▌</span>' }} />
                : m.content
              }
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {streaming && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${assistente.cor} flex items-center justify-center text-lg mr-3`}>
              {assistente.emoji}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center h-4">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Exemplos (só no início) */}
        {messages.length === 1 && !streaming && (
          <div className="pt-2 space-y-2">
            <p className="text-xs text-gray-400 text-center">Experimente perguntar:</p>
            {assistente.exemplos.map((e, i) => (
              <button key={i} onClick={() => sendMessage(e)}
                className="w-full text-left bg-white border border-gray-200 hover:border-[#0066CC] hover:bg-blue-50 rounded-xl px-4 py-2.5 text-sm text-gray-700 transition-colors shadow-sm">
                ⚡ {e}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border border-gray-200 rounded-2xl p-3 flex gap-3 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
          placeholder={`Pergunte ao ${assistente.nome}...`}
          rows={1}
          disabled={streaming}
          className="flex-1 text-sm resize-none focus:outline-none disabled:text-gray-400 max-h-32 overflow-y-auto"
          style={{ minHeight: '36px' }}
          onInput={e => {
            const t = e.target as HTMLTextAreaElement
            t.style.height = 'auto'
            t.style.height = Math.min(t.scrollHeight, 128) + 'px'
          }}
        />
        <div className="flex gap-2 flex-shrink-0">
          {messages.length > 1 && (
            <button onClick={() => { setMessages([{ role: 'assistant', content: assistente.saudacao }]); setInput('') }}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-2 transition-colors">
              🔄
            </button>
          )}
          {streaming ? (
            <button onClick={() => abortRef.current?.abort()}
              className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors">
              ⏹ Parar
            </button>
          ) : (
            <button onClick={() => sendMessage(input)} disabled={!input.trim()}
              className="px-5 py-2 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052A3] disabled:opacity-40 transition-colors">
              Enviar →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
