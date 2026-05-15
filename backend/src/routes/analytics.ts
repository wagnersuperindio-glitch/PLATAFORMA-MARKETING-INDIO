import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middlewares/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/analytics/summary  — resumo geral de todas as lojas (ADMIN) ou da loja do usuário
router.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN'

    const [totalRequests, pendingRequests, approvedRequests, publishedRequests] = await Promise.all([
      prisma.contentRequest.count({
        where: isAdmin ? {} : { storeId: req.user!.storeId ?? undefined },
      }),
      prisma.contentRequest.count({
        where: { status: 'PENDENTE', ...(isAdmin ? {} : { storeId: req.user!.storeId ?? undefined }) },
      }),
      prisma.contentRequest.count({
        where: { status: 'APROVADO', ...(isAdmin ? {} : { storeId: req.user!.storeId ?? undefined }) },
      }),
      prisma.contentRequest.count({
        where: { status: 'PUBLICADO', ...(isAdmin ? {} : { storeId: req.user!.storeId ?? undefined }) },
      }),
    ])

    const activeCampaigns = await prisma.campaign.count({ where: { status: 'ATIVA' } })

    // Requests dos últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentRequests = await prisma.contentRequest.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        ...(isAdmin ? {} : { storeId: req.user!.storeId ?? undefined }),
      },
      select: { createdAt: true, status: true, type: true },
      orderBy: { createdAt: 'desc' },
    })

    // Agrupar por tipo
    const byType: Record<string, number> = {}
    recentRequests.forEach(r => {
      byType[r.type] = (byType[r.type] || 0) + 1
    })

    res.json({
      totals: { totalRequests, pendingRequests, approvedRequests, publishedRequests, activeCampaigns },
      byType,
      recentRequests: recentRequests.slice(0, 10),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar analytics' })
  }
})

// GET /api/analytics/stores — performance por loja (ADMIN only)
router.get('/stores', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' })

    const stores = await prisma.store.findMany({
      include: {
        _count: {
          select: { contentRequests: true, campaigns: true },
        },
      },
    })

    const storeStats = await Promise.all(stores.map(async (store) => {
      const published = await prisma.contentRequest.count({
        where: { storeId: store.id, status: 'PUBLICADO' },
      })
      const pending = await prisma.contentRequest.count({
        where: { storeId: store.id, status: 'PENDENTE' },
      })
      return {
        id:       store.id,
        name:     store.name,
        city:     store.city,
        requests: store._count.contentRequests,
        campaigns:store._count.campaigns,
        published,
        pending,
      }
    }))

    res.json(storeStats)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar stats por loja' })
  }
})

export default router
