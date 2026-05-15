import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireRole, AuthRequest } from '../middlewares/auth'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

const BroadcastSchema = z.object({
  title:     z.string().min(3),
  message:   z.string().min(5),
  imageUrl:  z.string().optional(),
  storeIds:  z.array(z.string()).min(1),
  scheduledAt: z.string().optional(),
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

// POST /api/whatsapp/broadcasts — agenda um disparo
router.post('/broadcasts', authenticate, requireRole('ADMIN','GERENTE','CRIADOR'), async (req: AuthRequest, res: Response) => {
  try {
    const data = BroadcastSchema.parse(req.body)

    // Criar um broadcast por loja selecionada
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

// GET /api/whatsapp/stats — métricas de envio
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN'
    const where = isAdmin ? {} : { storeId: req.user!.storeId ?? undefined }

    const [total, enviados, agendados, pendentes] = await Promise.all([
      prisma.whatsappBroadcast.count({ where }),
      prisma.whatsappBroadcast.count({ where: { ...where, status: 'ENVIADO' } }),
      prisma.whatsappBroadcast.count({ where: { ...where, status: 'AGENDADO' } }),
      prisma.whatsappBroadcast.count({ where: { ...where, status: 'PENDENTE' } }),
    ])

    res.json({ total, enviados, agendados, pendentes })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar stats' })
  }
})

export default router
