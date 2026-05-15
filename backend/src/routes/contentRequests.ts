// Portal de Pedidos do Time de Marketing
// O time pede → agente processa → resultado aparece para aprovação
import { Router, Response } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middlewares/auth'
import { generateArtFromRequest } from '../services/claude'

const router = Router()
const prisma = new PrismaClient()

const requestSchema = z.object({
  storeId: z.string().uuid(),
  type: z.enum(['ENCARTE', 'POST', 'STORY', 'REELS', 'ANUNCIO', 'WHATSAPP']),
  title: z.string().min(3),
  description: z.string().optional(),
  products: z.array(z.object({
    name: z.string(),
    price: z.number(),
    imageUrl: z.string().optional(),
  })).optional(),
  channels: z.array(z.string()),
  priority: z.enum(['URGENTE', 'ALTA', 'NORMAL', 'BAIXA']).default('NORMAL'),
  templateId: z.string().uuid().optional(),
  scheduledFor: z.string().datetime().optional(),
})

// GET /api/requests — listar pedidos da loja
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const status = req.query.status as string | undefined
  const storeId = req.query.storeId as string | undefined
  const where: any = {}

  // RBAC: admin vê tudo, outros veem só a sua loja
  if (req.user!.role !== 'ADMIN') {
    where.storeId = req.user!.storeId
  } else if (storeId) {
    where.storeId = storeId
  }
  if (status) where.status = status

  const requests = await prisma.contentRequest.findMany({
    where,
    include: {
      store: { select: { name: true, city: true } },
      requestedBy: { select: { name: true, email: true } },
    },
    orderBy: [
      { priority: 'asc' },
      { createdAt: 'desc' },
    ],
  })
  return res.json(requests)
})

// POST /api/requests — fazer um pedido de conteúdo
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = requestSchema.parse(req.body)

    // Verifica acesso à loja
    if (req.user!.role !== 'ADMIN' && req.user!.storeId !== data.storeId) {
      return res.status(403).json({ error: 'Sem acesso a esta loja' })
    }

    const request = await prisma.contentRequest.create({
      data: {
        storeId:        data.storeId,
        type:           data.type,
        title:          data.title,
        description:    data.description,
        priority:       data.priority,
        templateId:     data.templateId,
        requestedById:  req.user!.id,
        channels:       JSON.stringify(data.channels),
        products:       data.products ? JSON.stringify(data.products) : undefined,
        scheduledFor:   data.scheduledFor ? new Date(data.scheduledFor) : undefined,
      } as any,
      include: { store: { select: { name: true } } },
    })

    // Inicia geração automática com IA se tiver produtos
    if (data.products && data.products.length > 0) {
      // Não aguarda — processa em background
      generateArtFromRequest(request.id).catch(console.error)
    }

    return res.status(201).json({
      message: 'Pedido criado! A IA está gerando o conteúdo.',
      requestId: request.id,
      status: request.status,
    })
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors })
    return res.status(500).json({ error: 'Erro ao criar pedido' })
  }
})

// PATCH /api/requests/:id/approve — aprovação pelo gerente/admin
router.patch('/:id/approve', authenticate, async (req: AuthRequest, res: Response) => {
  const { reviewNotes } = req.body
  const request = await prisma.contentRequest.update({
    where: { id: req.params.id },
    data: { status: 'APROVADO', reviewNotes },
  })
  return res.json({ message: 'Conteúdo aprovado', request })
})

// PATCH /api/requests/:id/reject — rejeitar com nota
router.patch('/:id/reject', authenticate, async (req: AuthRequest, res: Response) => {
  const { reviewNotes } = req.body
  const request = await prisma.contentRequest.update({
    where: { id: req.params.id },
    data: { status: 'REJEITADO', reviewNotes },
  })
  return res.json({ message: 'Conteúdo rejeitado', request })
})

// GET /api/requests/:id — detalhe do pedido
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const request = await prisma.contentRequest.findUnique({
    where: { id: req.params.id },
    include: {
      store: { select: { name: true, city: true } },
      requestedBy: { select: { name: true, email: true } },
    },
  })
  if (!request) return res.status(404).json({ error: 'Pedido não encontrado' })
  return res.json(request)
})

// GET /api/requests/:id/copy — retorna o copy gerado pela IA (JSON parsed)
router.get('/:id/copy', authenticate, async (req: AuthRequest, res: Response) => {
  const request = await prisma.contentRequest.findUnique({
    where: { id: req.params.id },
    select: { id: true, status: true, resultArtUrl: true, title: true },
  })
  if (!request) return res.status(404).json({ error: 'Pedido não encontrado' })
  if (!request.resultArtUrl) return res.json({ copy: null, status: request.status })

  try {
    const copy = JSON.parse(request.resultArtUrl)
    return res.json({ copy, status: request.status })
  } catch {
    return res.json({ copy: request.resultArtUrl, status: request.status })
  }
})

// POST /api/requests/:id/generate — aciona geração de copy pela IA (manual ou regeação)
router.post('/:id/generate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const request = await prisma.contentRequest.findUnique({
      where: { id: req.params.id },
    })
    if (!request) return res.status(404).json({ error: 'Pedido não encontrado' })

    // Dispara em background
    generateArtFromRequest(req.params.id).catch(console.error)

    return res.json({ message: 'Geração iniciada', requestId: req.params.id })
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao iniciar geração' })
  }
})

export default router
