import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

import authRoutes from './routes/auth'
import storesRoutes from './routes/stores'
import contentRequestsRoutes from './routes/contentRequests'
import campaignsRoutes from './routes/campaigns'
import analyticsRoutes from './routes/analytics'
import competitorsRoutes from './routes/competitors'
import whatsappRoutes from './routes/whatsapp'
import assistantRoutes from './routes/assistant'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const prisma = new PrismaClient()

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    // Sem origin = curl / Postman / mobile / SSR
    if (!origin) return callback(null, true)
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://54.232.189.113:3000',
      'http://10.1.1.92:3000',
      'https://plataforma-marketing-indio.vercel.app',
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
    ].filter(Boolean) as string[]
    // Aceita qualquer subdomínio *.vercel.app (previews e aliases)
    if (allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true)
    }
    // Em dev aceita tudo
    if (process.env.NODE_ENV !== 'production') return callback(null, true)
    return callback(new Error(`CORS bloqueado: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'Índio Marketing API', version: '1.0.0' }))

// Setup endpoint — cria usuários iniciais (idempotente)
app.post('/api/setup', async (_, res) => {
  try {
    const jaExiste = await prisma.user.findUnique({ where: { email: 'wagner@supermercadoindio.com.br' } })
    if (jaExiste) return res.json({ message: 'Já configurado', status: 'skip' })

    const LOJAS = [
      { name: 'Matriz', city: 'Guaíba', neighborhood: 'Vila Iolanda' },
      { name: 'Nestor', city: 'Guaíba', neighborhood: 'Coronel Nassuca' },
      { name: 'Passo Fundo', city: 'Guaíba', neighborhood: 'Passo Fundo' },
      { name: 'Centro Guaíba', city: 'Guaíba', neighborhood: 'Centro' },
      { name: 'Eldorado Cidade Verde', city: 'Eldorado do Sul', neighborhood: 'Cidade Verde' },
      { name: 'Eldorado Centro', city: 'Eldorado do Sul', neighborhood: 'Centro' },
      { name: 'São Jerônimo', city: 'São Jerônimo', neighborhood: 'Centro' },
      { name: 'Arroio dos Ratos', city: 'Arroio dos Ratos', neighborhood: 'Centro' },
      { name: 'Charqueadas 1º Maio', city: 'Charqueadas', neighborhood: 'Centro' },
      { name: 'Charqueadas Salgado Filho', city: 'Charqueadas', neighborhood: 'Centro' },
    ]
    const lojas = await Promise.all(LOJAS.map(l => prisma.store.create({ data: l })))

    await prisma.user.create({
      data: { name: 'Wagner Antonelli', email: 'wagner@supermercadoindio.com.br', password: await bcrypt.hash('indio@2026', 10), role: 'ADMIN' }
    })
    await prisma.user.create({
      data: { name: 'Time Marketing', email: 'marketing@supermercadoindio.com.br', password: await bcrypt.hash('marketing@2026', 10), role: 'CRIADOR', storeId: lojas[0].id }
    })
    await prisma.user.create({
      data: { name: 'Gerente Guaíba', email: 'guaiba@supermercadoindio.com.br', password: await bcrypt.hash('gerente@2026', 10), role: 'GERENTE', storeId: lojas[0].id }
    })
    await prisma.user.create({
      data: { name: 'Gerente Charqueadas', email: 'charqueadas@supermercadoindio.com.br', password: await bcrypt.hash('gerente@2026', 10), role: 'GERENTE', storeId: lojas[8].id }
    })
    await prisma.user.create({
      data: { name: 'Gerente Eldorado', email: 'eldorado@supermercadoindio.com.br', password: await bcrypt.hash('gerente@2026', 10), role: 'GERENTE', storeId: lojas[4].id }
    })

    return res.json({ message: '✅ Setup concluído! 10 lojas + 5 usuários criados.', status: 'done' })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
})

// Rotas
app.use('/api/auth',        authRoutes)
app.use('/api/stores',      storesRoutes)
app.use('/api/requests',    contentRequestsRoutes)
app.use('/api/campaigns',   campaignsRoutes)
app.use('/api/analytics',   analyticsRoutes)
app.use('/api/competitors', competitorsRoutes)
app.use('/api/whatsapp',    whatsappRoutes)
app.use('/api/assistant',  assistantRoutes)

app.listen(PORT, () => {
  console.log(`\n🚀 Índio Marketing API rodando em http://localhost:${PORT}`)
  console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'development'}\n`)
})

export default app
