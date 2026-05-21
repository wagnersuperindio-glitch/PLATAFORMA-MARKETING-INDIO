import { Router, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { authenticate, AuthRequest } from '../middlewares/auth'

const router = Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── System prompt base do Índio ─────────────────────────────────────────────

const SYSTEM_BASE = `Você é o **Índio Assistente** — IA de marketing do Grupo Supermercado Índio, rede com 10 lojas no Rio Grande do Sul.

## Contexto da empresa
- **Nome**: Supermercados Índio (Grupo Super Índio)
- **CEO**: Wagner Antonelli
- **Lojas**: Guaíba (Matriz, Nestor, Passo Fundo, Centro), Eldorado do Sul, São Jerônimo, Arroio dos Ratos, Charqueadas (2 lojas)
- **Diferenciais**: Clube Mais (programa de fidelidade), carro de som nas cidades, rádio indoor nas lojas, 10 avatares IA
- **Concorrentes principais**: Tonin (Guaíba), Imperador (Charqueadas), BIG Supermercados, Macrofort

## Plataforma de Marketing Digital
A plataforma contém os módulos:
- **Fábrica de Conteúdo** (/fabrica): geração de packs semanais, encartes, campanhas via IA
- **Vídeos & Avatares** (/videos): 5 avatares IA (Beto, Seu Neri, Lurdes, Gabi, Gui) via HeyGen
- **Áudio & Carro de Som** (/audio): roteiros ElevenLabs, 2 rotas de carro de som
- **Templates** (/templates): 14 templates HTML prontos (semanais, encartes, sazonais)
- **Conteúdo Digital** (/conteudo): Reels, Stories, TikTok, YouTube Shorts, TV Interna via CapCut+Seedance
- **Publicar** (/publicar): publicação Instagram/Facebook/WhatsApp via Meta API
- **WhatsApp** (/whatsapp): disparos em massa, 5 templates aprovados Meta
- **Rádio Indoor** (/radio): programação musical + vinhetas para as 10 lojas
- **Dashboard** (/dashboard): métricas Instagram 45k, Facebook 58k, TikTok 2.7k
- **Pedidos de Arte** (/pedidos): fluxo de solicitação e aprovação
- **Campanhas** (/campanhas): gestão de campanhas ativas
- **Calendário** (/calendario): agenda de publicações
- **Concorrentes** (/concorrentes): monitoramento de preços e promoções
- **Analytics** (/analytics): relatórios de desempenho

## Calendário de campanhas fixas
- Segunda: Promoção do Dia
- Quarta: Quarta do Horti (hortifruti)
- Sexta: Sexta das Carnes
- Quinzenal: Encarte completo (WhatsApp + redes)
- Sazonais: Natal, Páscoa, Dia das Mães, Festa Junina, Black Friday, Farroupilha (20/set), Dia das Crianças (12/out)

## Tom de comunicação
- Gaúcho, próximo, família, qualidade
- Slogans: "Juntos Somos Mais Forte", "Gaúcho de Coração, Índio de Escolha"
- Hashtags fixas: #SuperIndio #IndioSupermercados #GauchoDeCoracao #ClubeIndio

## Seu papel
Você ajuda o time de marketing a:
1. **Criar conteúdo**: hooks, legendas, scripts, hashtags, textos para encartes
2. **Planejar campanhas**: sugestões de datas, formatos, canais
3. **Usar a plataforma**: orientar qual módulo usar para cada tarefa
4. **Gerar roteiros**: para carro de som, rádio indoor, vídeos com avatar
5. **Sugerir estratégias**: baseadas em sazonalidade, concorrência e datas

Seja direto, prático e use exemplos reais do Índio. Respostas em português brasileiro.`

// ─── contextos por página ─────────────────────────────────────────────────────

const PAGE_CONTEXT: Record<string, string> = {
  '/fabrica':    'O usuário está na Fábrica de Conteúdo — pode gerar packs semanais, encartes, campanhas por IA.',
  '/videos':     'O usuário está em Vídeos & Avatares — pode criar vídeos com os 5 avatares IA do Índio via HeyGen.',
  '/audio':      'O usuário está em Áudio & Carro de Som — pode gerar roteiros para ElevenLabs e programar o carro de som.',
  '/templates':  'O usuário está em Templates — tem 14 templates HTML prontos para editar e usar.',
  '/conteudo':   'O usuário está em Conteúdo Digital — pode gerar Reels, Stories, TikTok, YouTube Shorts e conteúdo para TV interna.',
  '/publicar':   'O usuário está em Publicar — pode postar em Instagram, Facebook e WhatsApp via Meta API.',
  '/whatsapp':   'O usuário está em WhatsApp Business — pode disparar mensagens em massa com os 5 templates aprovados pela Meta.',
  '/radio':      'O usuário está em Rádio Indoor — pode programar a rádio das 10 lojas e criar vinhetas.',
  '/dashboard':  'O usuário está no Dashboard — vê métricas de redes sociais, KPIs e status das integrações.',
  '/pedidos':    'O usuário está em Pedidos de Arte — pode criar e acompanhar solicitações de arte.',
  '/campanhas':  'O usuário está em Campanhas — gerencia campanhas de marketing ativas.',
  '/calendario': 'O usuário está no Calendário de Publicações — visualiza e planeja o calendário editorial.',
  '/concorrentes':'O usuário está em Concorrentes — monitora promoções e preços dos concorrentes.',
  '/analytics':  'O usuário está em Analytics — analisa desempenho das redes sociais e campanhas.',
}

// ─── sugestões rápidas por página ────────────────────────────────────────────

const QUICK_ACTIONS: Record<string, string[]> = {
  '/fabrica':    ['Criar pack semanal da Sexta das Carnes', 'Sugerir produtos para encarte quinzenal', 'Gerar hook para campanha de desconto'],
  '/videos':     ['Escrever roteiro para o avatar Seu Neri', 'Sugerir script de 30s para promoção', 'Criar introdução para vídeo do Beto'],
  '/audio':      ['Criar roteiro de carro de som para Sexta das Carnes', 'Escrever vinheta de rádio indoor 15s', 'Roteiro especial Dia das Mães'],
  '/templates':  ['Qual template usar para Black Friday?', 'Como editar preços no template HTML?', 'Sugerir produtos para o encarte quinzenal'],
  '/conteudo':   ['Criar hook para Reel da Sexta das Carnes', 'Sugerir música trending para TikTok', 'Legenda completa com hashtags para Stories'],
  '/publicar':   ['Qual horário postar no Instagram?', 'Escrever legenda para post do Clube Mais', 'Texto para post de promoção relâmpago'],
  '/whatsapp':   ['Escrever mensagem para disparar hoje', 'Sugerir horário ideal para disparo', 'Criar texto para cotação de fornecedor'],
  '/radio':      ['Criar vinheta de entrada de programação', 'Sugerir músicas gaúchas para a rádio', 'Texto de passagem comercial para rádio'],
  '/dashboard':  ['Como melhorar o engajamento no Instagram?', 'O que publicar esta semana?', 'Resumir desempenho da última campanha'],
  '/pedidos':    ['Como preencher um pedido de arte?', 'Urgência: preciso de arte para amanhã', 'Quais informações incluir no briefing?'],
  '/campanhas':  ['Criar campanha para a Farroupilha', 'Sugerir estratégia para aumentar vendas', 'Planejar campanha de lançamento de produto'],
  '/calendario': ['O que publicar na próxima semana?', 'Sugerir pauta para julho', 'Criar calendário editorial para o mês'],
  '/concorrentes':['Como responder à promoção do concorrente?', 'Criar campanha de contraposição de preços', 'Analisar estratégia dos concorrentes'],
  '/analytics':  ['Como interpretar esses números?', 'O que melhorar no conteúdo?', 'Qual canal tem melhor retorno?'],
}

// ─── endpoint: listar sugestões rápidas por página ───────────────────────────

router.get('/quick-actions', authenticate, (req: AuthRequest, res: Response) => {
  const page = (req.query.page as string) || '/dashboard'
  const actions = QUICK_ACTIONS[page] || [
    'Como usar esta funcionalidade?',
    'O que posso fazer aqui?',
    'Sugerir conteúdo para hoje',
  ]
  res.json({ page, actions })
})

// ─── endpoint: chat com o assistente ─────────────────────────────────────────

router.post('/chat', authenticate, async (req: AuthRequest, res: Response) => {
  const { messages, page, context } = req.body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages é obrigatório' })
  }

  // Sistema com contexto de página
  const pageCtx = PAGE_CONTEXT[page] || ''
  const systemPrompt = pageCtx
    ? `${SYSTEM_BASE}\n\n## Contexto atual\n${pageCtx}${context ? `\n\n## Informação adicional\n${context}` : ''}`
    : SYSTEM_BASE

  try {
    // Streaming SSE
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
    res.end()
  } catch (err: any) {
    console.error('[assistant/chat]', err.message)
    if (!res.headersSent) {
      res.status(500).json({ error: err.message })
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
      res.end()
    }
  }
})

export default router
