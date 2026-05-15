import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireRole, AuthRequest } from '../middlewares/auth'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

const CreateCompetitorSchema = z.object({
  name:        z.string().min(2),
  city:        z.string().min(2),
  instagram:   z.string().optional(),
  facebook:    z.string().optional(),
  website:     z.string().optional(),
  threatLevel: z.enum(['BAIXA','MEDIA','ALTA','CRITICA']),
  notes:       z.string().optional(),
})

// GET /api/competitors
router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const competitors = await prisma.competitor.findMany({
      include: {
        posts: {
          orderBy: { detectedAt: 'desc' },
          take: 3,
        },
        _count: { select: { posts: true } },
      },
      orderBy: [{ threatLevel: 'desc' }, { city: 'asc' }],
    })
    res.json(competitors)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar concorrentes' })
  }
})

// POST /api/competitors
router.post('/', authenticate, requireRole('ADMIN','GERENTE'), async (req: AuthRequest, res: Response) => {
  try {
    const data = CreateCompetitorSchema.parse(req.body)
    const competitor = await prisma.competitor.create({ data: data as any })
    res.status(201).json(competitor)
  } catch (err: any) {
    if (err?.name === 'ZodError') return res.status(400).json({ error: err.errors })
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar concorrente' })
  }
})

// PATCH /api/competitors/:id
router.patch('/:id', authenticate, requireRole('ADMIN','GERENTE'), async (req: AuthRequest, res: Response) => {
  try {
    const competitor = await prisma.competitor.update({
      where: { id: req.params.id },
      data:  req.body,
    })
    res.json(competitor)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar concorrente' })
  }
})

// GET /api/competitors/:id/posts — posts monitorados
router.get('/:id/posts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const posts = await prisma.competitorPost.findMany({
      where:   { competitorId: req.params.id },
      orderBy: { detectedAt: 'desc' },
      take:    20,
    })
    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar posts' })
  }
})

// POST /api/competitors/:id/toggle-monitor — ativa/desativa monitoramento
router.post('/:id/toggle-monitor', authenticate, requireRole('ADMIN','GERENTE'), async (req: AuthRequest, res: Response) => {
  try {
    const current = await prisma.competitor.findUnique({ where: { id: req.params.id } })
    if (!current) return res.status(404).json({ error: 'Concorrente não encontrado' })

    const updated = await prisma.competitor.update({
      where: { id: req.params.id },
      data:  { isMonitored: !current.isMonitored },
    })
    res.json({ id: updated.id, isMonitored: updated.isMonitored })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao alternar monitoramento' })
  }
})

export default router
