import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    storeId?: string
  }
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Token não fornecido' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Sem permissão para esta ação' })
    }
    next()
  }
}

// RBAC: Admin vê todas as lojas, Gerente/Criador só a sua
export function requireStoreAccess(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  if (req.user.role === 'ADMIN') return next()

  const storeId = req.params.storeId || req.body.storeId
  if (storeId && req.user.storeId !== storeId) {
    return res.status(403).json({ error: 'Acesso negado a esta loja' })
  }
  next()
}
