// M1 — Autenticação Multi-loja
import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middlewares/auth'

const router = Router()
const prisma = new PrismaClient()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { email },
      include: { store: { select: { id: true, name: true, city: true } } },
    })

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, storeId: user.storeId },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' } as any
    )

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.store,
      },
    })
  } catch (err: any) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors })
    return res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, name: true, email: true, role: true,
        store: { select: { id: true, name: true, city: true, instagramHandle: true } },
      },
    })
    return res.json(user)
  } catch {
    return res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
