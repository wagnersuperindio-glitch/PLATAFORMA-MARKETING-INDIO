import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const LOJAS = [
  { name: 'Matriz',                   city: 'Guaíba',           neighborhood: 'Vila Iolanda',    address: 'Rua Adão Foques, 777',             phone: '(51) 3480-0001' },
  { name: 'Nestor',                   city: 'Guaíba',           neighborhood: 'Coronel Nassuca', address: 'Av. Nestor de Moura Jardim, 420',  phone: '(51) 3480-0002' },
  { name: 'Passo Fundo',              city: 'Guaíba',           neighborhood: 'Passo Fundo',     address: 'Rua Carlos Motta, 60',             phone: '(51) 3480-0003' },
  { name: 'Centro',                   city: 'Guaíba',           neighborhood: 'Centro',          address: 'Rua Vinte de Setembro, 999',       phone: '(51) 3480-0004' },
  { name: 'Eldorado Cidade Verde',    city: 'Eldorado do Sul',  neighborhood: 'Cidade Verde',    address: 'Av. Getúlio Vargas, 1001',         phone: '(51) 3480-0005' },
  { name: 'Eldorado Centro',          city: 'Eldorado do Sul',  neighborhood: 'Centro',          address: 'Av. Getúlio Vargas, 270',          phone: '(51) 3480-0006' },
  { name: 'São Jerônimo',             city: 'São Jerônimo',     neighborhood: 'São Thomas',      address: 'Rua Antonio Pinto, 220',           phone: '(51) 3480-0007' },
  { name: 'Arroio dos Ratos',         city: 'Arroio dos Ratos', neighborhood: 'Centro',          address: 'Rua Argemiro Dorneles, 36',        phone: '(51) 3480-0008' },
  { name: 'Charqueadas 1º Maio',      city: 'Charqueadas',      neighborhood: 'Centro',          address: 'Av. Primeiro de Maio, 1035',       phone: '(51) 3480-0009' },
  { name: 'Charqueadas Salgado Filho',city: 'Charqueadas',      neighborhood: 'Centro',          address: 'Av. Sen. Salgado Filho, 867',      phone: '(51) 3480-0010' },
]

const CONCORRENTES = [
  { name: 'Ecoatacarejo',          city: 'Guaíba',           instagram: '@ecoatacarejo',          threatLevel: 'ALTA' as const,    isMonitored: true  },
  { name: 'Sup. do Paulinho',      city: 'Guaíba',           instagram: '@paulinhomercado',       threatLevel: 'MEDIA' as const,   isMonitored: false },
  { name: 'Sup. Atual',            city: 'Guaíba',           instagram: '@superatual',            threatLevel: 'MEDIA' as const,   isMonitored: false },
  { name: 'Bonato',                city: 'Charqueadas',      instagram: '@bonatosupermercado',    threatLevel: 'CRITICA' as const, isMonitored: true  },
  { name: 'Macropan',              city: 'Charqueadas',      instagram: '@macropan',              threatLevel: 'CRITICA' as const, isMonitored: true  },
  { name: 'Santos',                city: 'Charqueadas',      instagram: '@supermarketosantos',    threatLevel: 'CRITICA' as const, isMonitored: true  },
  { name: 'Desco',                 city: 'Charqueadas',      instagram: '@descosupermercado',     threatLevel: 'ALTA' as const,    isMonitored: false },
  { name: 'Merc. Bandeira',        city: 'São Jerônimo',     instagram: '@mercadobandeira',       threatLevel: 'MEDIA' as const,   isMonitored: false },
  { name: 'Supermercados locais',  city: 'Arroio dos Ratos', instagram: '(múltiplos)',            threatLevel: 'BAIXA' as const,   isMonitored: false },
]

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n')

  // Verificar se já foi seedado
  const jaExiste = await prisma.user.findUnique({ where: { email: 'wagner@supermercadoindio.com.br' } })
  if (jaExiste) {
    console.log('⏭️  Seed já executado anteriormente. Pulando...')
    return
  }

  // Limpar tabelas (em dev)
  if (process.env.NODE_ENV !== 'production') {
    await prisma.whatsappBroadcast.deleteMany()
    await prisma.contentRequest.deleteMany()
    await prisma.campaign.deleteMany()
    await prisma.competitorPost.deleteMany()
    await prisma.competitor.deleteMany()
    await prisma.user.deleteMany()
    await prisma.store.deleteMany()
    console.log('🗑️  Dados anteriores removidos\n')
  }

  // 1. Criar lojas
  console.log('🏪 Criando 10 lojas...')
  const lojas = await Promise.all(
    LOJAS.map(loja => prisma.store.create({ data: loja }))
  )
  console.log(`   ✓ ${lojas.length} lojas criadas\n`)

  // 2. Criar usuários
  console.log('👥 Criando usuários...')

  const senhaAdmin = await bcrypt.hash('indio@2026', 10)
  const senhaMarketing = await bcrypt.hash('marketing@2026', 10)

  const admin = await prisma.user.create({
    data: {
      name:     'Wagner Antonelli',
      email:    'wagner@supermercadoindio.com.br',
      password: senhaAdmin,
      role:     'ADMIN',
    },
  })

  const marketing = await prisma.user.create({
    data: {
      name:     'Time Marketing',
      email:    'marketing@supermercadoindio.com.br',
      password: senhaMarketing,
      role:     'CRIADOR',
      storeId:  lojas[0].id, // Matriz
    },
  })

  // Gerente de cada cidade
  const gerentes = await Promise.all([
    prisma.user.create({ data: { name: 'Gerente Guaíba',      email: 'guaiba@supermercadoindio.com.br',      password: await bcrypt.hash('gerente@2026', 10), role: 'GERENTE', storeId: lojas[0].id } }),
    prisma.user.create({ data: { name: 'Gerente Charqueadas', email: 'charqueadas@supermercadoindio.com.br', password: await bcrypt.hash('gerente@2026', 10), role: 'GERENTE', storeId: lojas[8].id } }),
    prisma.user.create({ data: { name: 'Gerente Eldorado',    email: 'eldorado@supermercadoindio.com.br',    password: await bcrypt.hash('gerente@2026', 10), role: 'GERENTE', storeId: lojas[4].id } }),
  ])

  console.log(`   ✓ ${2 + gerentes.length} usuários criados`)
  console.log(`   📧 Admin:     wagner@supermercadoindio.com.br / indio@2026`)
  console.log(`   📧 Marketing: marketing@supermercadoindio.com.br / marketing@2026\n`)

  // 3. Criar concorrentes
  console.log('👁️  Criando concorrentes...')
  const concorrentes = await Promise.all(
    CONCORRENTES.map(c => prisma.competitor.create({ data: c }))
  )
  console.log(`   ✓ ${concorrentes.length} concorrentes cadastrados\n`)

  // 4. Criar campanha de exemplo
  console.log('📣 Criando campanha de exemplo...')
  const campanha = await prisma.campaign.create({
    data: {
      name:        'Sexta das Carnes — Maio 2026',
      type:        'OFERTA',
      status:      'ATIVA',
      channels:    JSON.stringify(['Instagram', 'WhatsApp', 'Facebook']),
      startDate:   new Date('2026-05-01'),
      endDate:     new Date('2026-05-30'),
      description: 'Promoção semanal de carnes toda sexta-feira',
      createdById: admin.id,
      stores:      { connect: lojas.map(l => ({ id: l.id })) },
    },
  })
  console.log(`   ✓ Campanha "${campanha.name}" criada\n`)

  // 5. Criar pedido de arte de exemplo
  console.log('🎨 Criando pedido de arte de exemplo...')
  await prisma.contentRequest.create({
    data: {
      title:       'Post Sexta das Carnes 09/05',
      type:        'POST',
      priority:    'ALTA',
      status:      'PENDENTE',
      description: 'Post feed Instagram com alcatra R$29,90/kg, frango inteiro R$12,90/kg e costela R$24,90/kg',
      channels:    JSON.stringify(['Instagram']),
      products:    JSON.stringify([
        { name: 'Alcatra', price: '29,90/kg' },
        { name: 'Frango Inteiro', price: '12,90/kg' },
        { name: 'Costela Bovina', price: '24,90/kg' },
      ]),
      storeId:     lojas[0].id,
      requestedById: marketing.id,
      campaignId:  campanha.id,
    },
  })
  console.log(`   ✓ Pedido de arte criado\n`)

  console.log('✅ Seed concluído com sucesso!')
  console.log('\n📊 Resumo:')
  console.log(`   🏪 ${lojas.length} lojas`)
  console.log(`   👥 ${2 + gerentes.length} usuários`)
  console.log(`   👁️  ${concorrentes.length} concorrentes`)
  console.log(`   📣 1 campanha`)
  console.log(`   🎨 1 pedido de arte`)
  console.log('\n🚀 Plataforma pronta para uso!')
}

main()
  .catch(e => { console.error('❌ Erro no seed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
