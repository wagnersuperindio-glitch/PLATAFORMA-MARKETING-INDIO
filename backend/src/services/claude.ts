// Serviço Claude API — geração de copy, análise de produtos, sugestões de campanha
import Anthropic from '@anthropic-ai/sdk'
import { PrismaClient } from '@prisma/client'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const prisma = new PrismaClient()

// Gera copy e sugestão de arte a partir de um pedido de conteúdo
export async function generateArtFromRequest(requestId: string) {
  const request = await prisma.contentRequest.findUnique({
    where: { id: requestId },
    include: { store: true },
  })
  if (!request) throw new Error('Pedido não encontrado')

  await prisma.contentRequest.update({
    where: { id: requestId },
    data: { status: 'PROCESSANDO' },
  })

  try {
    const products: any[] = request.products ? JSON.parse(request.products as unknown as string) : []
    const productList = products?.map((p: any) => `- ${p.name}: R$${p.price}`).join('\n') || ''

    const systemPrompt = `Você é o assistente de marketing dos Supermercados Índio, rede no Rio Grande do Sul com 10 lojas.
Slogan: "Como é bom servir você e sua família"
Cores da marca: azul #0066CC e laranja #FF6B00
Tom: gaúcho, direto, próximo, animado, honesto
Loja atual: ${request.store.name} — ${request.store.city}`

    const userPrompt = `Crie o texto para um(a) ${request.type} de ${request.title}.
${request.description ? `Contexto: ${request.description}` : ''}
${productList ? `Produtos:\n${productList}` : ''}
Canais: ${(JSON.parse(request.channels as unknown as string) as string[]).join(', ')}

Responda em JSON com:
{
  "headline": "título principal impactante (max 10 palavras)",
  "subheadline": "subtítulo complementar (max 15 palavras)",
  "cta": "chamada para ação (max 8 palavras)",
  "caption_instagram": "legenda completa para Instagram com emojis e hashtags",
  "caption_whatsapp": "mensagem para WhatsApp — mais pessoal e direta",
  "hashtags": ["array", "de", "hashtags"],
  "design_tip": "dica de layout para o designer"
}`

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const copy = jsonMatch ? JSON.parse(jsonMatch[0]) : { headline: text }

    await prisma.contentRequest.update({
      where: { id: requestId },
      data: {
        status: 'AGUARDANDO_REVISAO',
        resultArtUrl: JSON.stringify(copy), // temporário — depois aponta para imagem real
      },
    })

    return copy
  } catch (err) {
    await prisma.contentRequest.update({
      where: { id: requestId },
      data: { status: 'PENDENTE' },
    })
    throw err
  }
}

// Gera sugestão de produtos para o encarte baseado no contexto da loja
export async function suggestProducts(storeId: string, category: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) throw new Error('Loja não encontrada')

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Para um supermercado em ${store.city} (RS), sugira 5 produtos de ${category} com preços competitivos para esta semana. Responda em JSON: [{"name": "produto", "price": 0.00, "category": "categoria"}]`
    }]
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : []
}

// Analisa post do concorrente e extrai oferta
export async function analyzeCompetitorPost(caption: string, imageDescription?: string) {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `Analise este post de supermercado concorrente e extraia informações:
Caption: "${caption}"
${imageDescription ? `Imagem: ${imageDescription}` : ''}

Responda em JSON:
{
  "hasOffer": true/false,
  "category": "carne|padaria|FLV|mercearia|bebidas|null",
  "productName": "nome do produto ou null",
  "price": 0.00 ou null,
  "isCompetitive": true/false
}`
    }]
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : { hasOffer: false }
}
