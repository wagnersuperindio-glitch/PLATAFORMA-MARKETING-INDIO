import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireRole, AuthRequest } from '../middlewares/auth'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

const CreateCampaignSchema = z.object({
  name:       z.string().min(3),
  type:       z.enum(['ENCARTE','SAZONAL','OFERTA','LANCAMENTO','FIDELIDADE']),
  storeIds:   z.array(z.string()).min(1),
  channels:   z.array(z.string()),
  startDate:  z.string(),
  endDate:    z.string(),
  description:z.string().optional(),
})

// GET /api/campaigns
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: (req.user!.role === 'ADMIN'
        ? {}
        : { stores: { some: { id: req.user!.storeId ?? undefined } } }) as any,
      include: {
        stores: { select: { id: true, name: true } },
        _count: { select: { arts: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(campaigns)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar campanhas' })
  }
})

// POST /api/campaigns
router.post('/', authenticate, requireRole('ADMIN','GERENTE','CRIADOR'), async (req: AuthRequest, res: Response) => {
  try {
    const data = CreateCampaignSchema.parse(req.body)
    const campaign = await prisma.campaign.create({
      data: {
        name:       data.name,
        type:       data.type as any,
        channels:   JSON.stringify(data.channels),
        startDate:  new Date(data.startDate),
        endDate:    new Date(data.endDate),
        description:data.description,
        status:     'RASCUNHO',
        stores:     { connect: data.storeIds.map(id => ({ id })) },
        createdById: req.user!.id,
      },
      include: { stores: true },
    })
    res.status(201).json(campaign)
  } catch (err: any) {
    if (err?.name === 'ZodError') return res.status(400).json({ error: err.errors })
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar campanha' })
  }
})

// PATCH /api/campaigns/:id/status
router.patch('/:id/status', authenticate, requireRole('ADMIN','GERENTE'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body
    const validStatuses = ['RASCUNHO','ATIVA','PAUSADA','ENCERRADA']
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Status inválido' })

    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data:  { status },
    })
    res.json(campaign)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status' })
  }
})

// DELETE /api/campaigns/:id
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.campaign.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar campanha' })
  }
})

export default router
