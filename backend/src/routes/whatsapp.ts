import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireRole, AuthRequest } from '../middlewares/auth'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

const WA_API_VERSION = 'v25.0'
const WA_URL = `https://graph.facebook.com/${WA_API_VERSION}`

// ─── helpers Meta API ─────────────────────────────────────────────────────────

function getWaCredentials() {
  const token   = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneId) throw new Error('Credenciais WhatsApp ausentes no servidor.')
  return { token, phoneId }
}

async function metaSendTemplate(to: string, templateName: string, languageCode: string, bodyParams: string[]) {
  const { token, phoneId } = getWaCredentials()

  const components = bodyParams.length
    ? [{ type: 'body', parameters: bodyParams.map(v => ({ type: 'text', text: String(v) })) }]
    : undefined

  const res = await fetch(`${WA_URL}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(components ? { components } : {}),
      },
    }),
  })
  const payload = await res.json() as any
  if (!res.ok) throw new Error(payload?.error?.message || `Erro Meta ${res.status}`)
  return payload
}

async function metaSendText(to: string, body: string) {
  const { token, phoneId } = getWaCredentials()

  const res = await fetch(`${WA_URL}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { preview_url: false, body },
    }),
  })
  const payload = await res.json() as any
  if (!res.ok) throw new Error(payload?.error?.message || `Erro Meta ${res.status}`)
  return payload
}

// ─── templates aprovados (Meta Business Account) ──────────────────────────────

const APPROVED_TEMPLATES = [
  {
    id:       'cotacao_abertura_indio',
    nome:     'Abertura de Cotação',
    descricao:'Convite inicial para fornecedor participar de cotação de preços.',
    categoria:'COTAÇÃO B2B',
    language: 'pt_BR',
    params:   ['Nome do fornecedor', 'Número da cotação', 'Data limite'],
    preview:  'Olá {{1}}! O Supermercado Índio está realizando cotação {{2}}. Responda até {{3}} com seus melhores preços.',
    emoji:    '📋',
  },
  {
    id:       'cotacao_lembrete_indio',
    nome:     'Lembrete de Cotação',
    descricao:'Lembrete para fornecedor que ainda não respondeu a cotação.',
    categoria:'COTAÇÃO B2B',
    language: 'pt_BR',
    params:   ['Nome do fornecedor', 'Número da cotação', 'Horas restantes'],
    preview:  'Olá {{1}}! Lembrete: cotação {{2}} encerra em {{3}}h. Não perca a oportunidade!',
    emoji:    '⏰',
  },
  {
    id:       'cotacao_confirmacao_indio',
    nome:     'Confirmação de Cotação',
    descricao:'Confirma recebimento da proposta enviada pelo fornecedor.',
    categoria:'COTAÇÃO B2B',
    language: 'pt_BR',
    params:   ['Nome do fornecedor', 'Número da cotação'],
    preview:  'Olá {{1}}! Recebemos sua proposta para a cotação {{2}}. Em breve entraremos em contato. Obrigado!',
    emoji:    '✅',
  },
  {
    id:       'cotacao_encerramento_indio',
    nome:     'Encerramento de Cotação',
    descricao:'Aviso de encerramento e resultado da cotação.',
    categoria:'COTAÇÃO B2B',
    language: 'pt_BR',
    params:   ['Nome do fornecedor', 'Número da cotação', 'Resultado'],
    preview:  'Olá {{1}}! A cotação {{2}} foi encerrada. {{3}}. Agradecemos sua participação!',
    emoji:    '🏁',
  },
  {
    id:       'cotacao_extra_indio',
    nome:     'Item Extra de Cotação',
    descricao:'Solicita inclusão de produto extra em cotação já aberta.',
    categoria:'COTAÇÃO B2B',
    language: 'pt_BR',
    params:   ['Nome do fornecedor', 'Produto', 'Quantidade', 'Número da cotação'],
    preview:  'Olá {{1}}! Incluímos o produto {{2}} (qty: {{3}}) na cotação {{4}}. Por favor atualize sua proposta.',
    emoji:    '➕',
  },
]

// ─── rotas ────────────────────────────────────────────────────────────────────

// GET /api/whatsapp/templates — lista templates aprovados
router.get('/templates', authenticate, (_req, res: Response) => {
  res.json(APPROVED_TEMPLATES)
})

// GET /api/whatsapp/broadcasts — histórico de disparos
router.get('/broadcasts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const broadcasts = await prisma.whatsappBroadcast.findMany({
      where: req.user!.role === 'ADMIN'
        ? {}
        : { storeId: req.user!.storeId ?? undefined },
      include: { store: { select: { id: true, name: true, city: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(broadcasts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar broadcasts' })
  }
})

// POST /api/whatsapp/broadcasts — agenda/cria um broadcast
router.post('/broadcasts', authenticate, requireRole('ADMIN','GERENTE','CRIADOR'), async (req: AuthRequest, res: Response) => {
  const BroadcastSchema = z.object({
    title:       z.string().min(3),
    message:     z.string().min(5),
    imageUrl:    z.string().optional(),
    storeIds:    z.array(z.string()).min(1),
    scheduledAt: z.string().optional(),
  })
  try {
    const data = BroadcastSchema.parse(req.body)
    const broadcasts = await Promise.all(
      data.storeIds.map(storeId =>
        prisma.whatsappBroadcast.create({
          data: {
            title:       data.title,
            message:     data.message,
            imageUrl:    data.imageUrl,
            storeId,
            status:      data.scheduledAt ? 'AGENDADO' : 'PENDENTE',
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
            createdById: req.user!.id,
          },
        })
      )
    )
    res.status(201).json(broadcasts)
  } catch (err: any) {
    if (err?.name === 'ZodError') return res.status(400).json({ error: err.errors })
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar broadcast' })
  }
})

// POST /api/whatsapp/send — envia uma mensagem única via Meta API
router.post('/send', authenticate, requireRole('ADMIN','GERENTE'), async (req: AuthRequest, res: Response) => {
  const SendSchema = z.object({
    to:           z.string().min(10),    // número com DDI ex: 5551999999999
    type:         z.enum(['template','text']),
    templateName: z.string().optional(),
    language:     z.string().default('pt_BR'),
    params:       z.array(z.string()).default([]),
    text:         z.string().optional(),
  })
  try {
    const data = SendSchema.parse(req.body)
    let result: any

    if (data.type === 'template') {
      if (!data.templateName) throw new Error('templateName obrigatório para type=template')
      result = await metaSendTemplate(data.to, data.templateName, data.language, data.params)
    } else {
      if (!data.text) throw new Error('text obrigatório para type=text')
      result = await metaSendText(data.to, data.text)
    }

    res.json({ ok: true, messageId: result?.messages?.[0]?.id, result })
  } catch (err: any) {
    console.error('[WhatsApp send]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/whatsapp/dispatch — disparo em massa para lista de números
router.post('/dispatch', authenticate, requireRole('ADMIN','GERENTE'), async (req: AuthRequest, res: Response) => {
  const DispatchSchema = z.object({
    title:        z.string().min(3),
    phones:       z.array(z.string()).min(1).max(5000),   // máx 5k por chamada
    type:         z.enum(['template','text']),
    templateName: z.string().optional(),
    language:     z.string().default('pt_BR'),
    params:       z.array(z.string()).default([]),
    text:         z.string().optional(),
    storeId:      z.string().optional(),
  })

  try {
    const data = DispatchSchema.parse(req.body)

    // cria registro de broadcast no BD
    // storeId obrigatório no schema — usa do usuário ou '1' (MATRIZ) como fallback
    const storeId = data.storeId || req.user!.storeId || '1'
    const broadcast = await prisma.whatsappBroadcast.create({
      data: {
        title:        data.title,
        message:      data.type === 'template' ? `[template: ${data.templateName}]` : (data.text || ''),
        storeId,
        contactCount: data.phones.length,
        status:       'ENVIANDO',
        createdById:  req.user!.id,
      },
    })

    // disparo assíncrono (fire-and-forget) com rate-limit 1/seg
    ;(async () => {
      let sent = 0, failed = 0
      for (const phone of data.phones) {
        try {
          if (data.type === 'template') {
            await metaSendTemplate(phone, data.templateName!, data.language, data.params)
          } else {
            await metaSendText(phone, data.text!)
          }
          sent++
        } catch {
          failed++
        }
        // 1 mensagem por segundo (regra Meta)
        await new Promise(r => setTimeout(r, 1000))
      }

      await prisma.whatsappBroadcast.update({
        where: { id: broadcast.id },
        data: {
          status:      failed === data.phones.length ? 'ERRO' : 'ENVIADO',
          sentCount:   sent,
          failedCount: failed,
          sentAt:      new Date(),
        },
      })
    })()

    res.status(202).json({
      ok: true,
      broadcastId: broadcast.id,
      total: data.phones.length,
      message: `Disparo iniciado para ${data.phones.length} números. Processando em background.`,
    })
  } catch (err: any) {
    if (err?.name === 'ZodError') return res.status(400).json({ error: err.errors })
    console.error('[dispatch]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/whatsapp/stats — métricas de envio
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN'
    const where   = isAdmin ? {} : { storeId: req.user!.storeId ?? undefined }

    const [total, enviados, agendados, pendentes, enviando] = await Promise.all([
      prisma.whatsappBroadcast.count({ where }),
      prisma.whatsappBroadcast.count({ where: { ...where, status: 'ENVIADO'  } }),
      prisma.whatsappBroadcast.count({ where: { ...where, status: 'AGENDADO' } }),
      prisma.whatsappBroadcast.count({ where: { ...where, status: 'PENDENTE' } }),
      prisma.whatsappBroadcast.count({ where: { ...where, status: 'ENVIANDO' } }),
    ])

    // total de mensagens enviadas
    const agg = await prisma.whatsappBroadcast.aggregate({
      where: { ...where, status: 'ENVIADO' },
      _sum: { sentCount: true, failedCount: true },
    })

    res.json({
      total, enviados, agendados, pendentes, enviando,
      totalMensagens: agg._sum.sentCount  || 0,
      totalFalhas:    agg._sum.failedCount || 0,
    })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar stats' })
  }
})

export default router
