import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import storesRoutes from './routes/stores'
import contentRequestsRoutes from './routes/contentRequests'
import campaignsRoutes from './routes/campaigns'
import analyticsRoutes from './routes/analytics'
import competitorsRoutes from './routes/competitors'
import whatsappRoutes from './routes/whatsapp'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://54.232.189.113:3000',
    'http://10.1.1.92:3000',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'Índio Marketing API', version: '1.0.0' }))

// Rotas
app.use('/api/auth',        authRoutes)
app.use('/api/stores',      storesRoutes)
app.use('/api/requests',    contentRequestsRoutes)
app.use('/api/campaigns',   campaignsRoutes)
app.use('/api/analytics',   analyticsRoutes)
app.use('/api/competitors', competitorsRoutes)
app.use('/api/whatsapp',    whatsappRoutes)

app.listen(PORT, () => {
  console.log(`\n🚀 Índio Marketing API rodando em http://localhost:${PORT}`)
  console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'development'}\n`)
})

export default app
