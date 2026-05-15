// M18 — Configurações: CRUD de Lojas e Usuários
import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticate, requireRole, AuthRequest } from '../middlewares/auth'

const router = Router()
const prisma = new PrismaClient()

const storeSchema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  instagramHandle: z.string().optional(),
  facebookHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  whatsappNumber: z.string().optional(),
})

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'GERENTE', 'CRIADOR', 'VISUALIZADOR']).default('CRIADOR'),
  storeId: z.string().uuid().optional(),
})

// ── LOJAS ──────────────────────────────────────────────────────────────────────

// GET /api/stores — lista todas (admin) ou a própria (gerente)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const where = req.user!.role === 'ADMIN' ? {} : { id: req.user!.storeId! }
  const stores = await prisma.store.findMany({
    where: { ...where, active: true },
    select: {
      id: true, name: true, city: true, address: true,
      instagramHandle: true, facebookHandle: true, tiktokHandle: true,
      whatsappNumber: true, active: true, createdAt: true,
      _count: { select: { users: true, campaigns: true } },
    },
    orderBy: { name: 'asc' },
  })
  return res.json(stores)
})

// POST /api/stores — criar loja (apenas admin)
router.post('/', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const data = storeSchema.parse(req.body)
    const store = await prisma.store.create({ data })
    return res.status(201).json(store)
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors })
    return res.status(500).json({ error: 'Erro ao criar loja' })
  }
})

// PUT /api/stores/:id — editar loja
router.put('/:id', authenticate, requireRole('ADMIN', 'GERENTE'), async (req: AuthRequest, res: Response) => {
  try {
    const data = storeSchema.partial().parse(req.body)
    const store = await prisma.store.update({ where: { id: req.params.id }, data })
    return res.json(store)
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors })
    return res.status(500).json({ error: 'Erro ao atualizar loja' })
  }
})

// PATCH /api/stores/:id/tokens — salvar tokens de redes sociais
router.patch('/:id/tokens', authenticate, requireRole('ADMIN', 'GERENTE'), async (req: AuthRequest, res: Response) => {
  const { metaAccessToken, metaPageId, whatsappToken } = req.body
  const store = await prisma.store.update({
    where: { id: req.params.id },
    data: { metaAccessToken, metaPageId, whatsappToken },
  })
  return res.json({ message: 'Tokens atualizados', storeId: store.id })
})

// ── USUÁRIOS ───────────────────────────────────────────────────────────────────

// GET /api/stores/:id/users
router.get('/:id/users', authenticate, requireRole('ADMIN', 'GERENTE'), async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    where: { storeId: req.params.id, active: true },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { name: 'asc' },
  })
  return res.json(users)
})

// POST /api/stores/:id/users — criar usuário
router.post('/:id/users', authenticate, requireRole('ADMIN', 'GERENTE'), async (req: AuthRequest, res: Response) => {
  try {
    const data = userSchema.parse({ ...req.body, storeId: req.params.id })
    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) return res.status(400).json({ error: 'E-mail já cadastrado' })

    const hashedPassword = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, password: hashedPassword, role: data.role, storeId: data.storeId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return res.status(201).json(user)
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors })
    return res.status(500).json({ error: 'Erro ao criar usuário' })
  }
})

// DELETE /api/stores/:id/users/:userId — desativar usuário
router.delete('/:id/users/:userId', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  await prisma.user.update({ where: { id: req.params.userId }, data: { active: false } })
  return res.json({ message: 'Usuário desativado' })
})

export default router
