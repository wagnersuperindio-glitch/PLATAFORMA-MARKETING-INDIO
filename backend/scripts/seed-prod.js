const { Client } = require('pg')
const bcrypt = require('bcryptjs')

async function setup() {
  const client = new Client({
    host: 'yamanote.proxy.rlwy.net',
    port: 31600,
    database: 'indio_marketing',
    user: 'indio',
    password: 'IndioMarketing2025!',
    ssl: false
  })

  await client.connect()
  console.log('✅ Conectado ao PostgreSQL Railway!\n')

  // Check se já existe
  const check = await client.query("SELECT count(*) as c FROM users WHERE email = 'wagner@supermercadoindio.com.br'")
  if (parseInt(check.rows[0].c) > 0) {
    console.log('⏭️  Usuários já existem. Pulando seed.')
    await client.end()
    return
  }

  // Criar lojas
  console.log('🏪 Criando lojas...')
  const lojas = [
    ['Matriz', 'Guaiba', 'Vila Iolanda'],
    ['Nestor', 'Guaiba', 'Coronel Nassuca'],
    ['Passo Fundo', 'Guaiba', 'Passo Fundo'],
    ['Centro Guaiba', 'Guaiba', 'Centro'],
    ['Eldorado Cidade Verde', 'Eldorado do Sul', 'Cidade Verde'],
    ['Eldorado Centro', 'Eldorado do Sul', 'Centro'],
    ['Sao Jeronimo', 'Sao Jeronimo', 'Centro'],
    ['Arroio dos Ratos', 'Arroio dos Ratos', 'Centro'],
    ['Charqueadas 1 Maio', 'Charqueadas', 'Centro'],
    ['Charqueadas Salgado Filho', 'Charqueadas', 'Centro'],
  ]

  const storeIds = []
  for (const [name, city, neighborhood] of lojas) {
    const q = `INSERT INTO stores (id, name, city, neighborhood, active, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW()) RETURNING id`
    const r = await client.query(q, [name, city, neighborhood])
    storeIds.push(r.rows[0].id)
    console.log(`   ✓ ${name} — ${city}`)
  }

  // Criar usuários
  console.log('\n👥 Criando usuários...')
  const hAdmin = await bcrypt.hash('indio@2026', 10)
  const hMkt   = await bcrypt.hash('marketing@2026', 10)
  const hGer   = await bcrypt.hash('gerente@2026', 10)

  const users = [
    ['Wagner Antonelli',    'wagner@supermercadoindio.com.br',        hAdmin, 'ADMIN',   null],
    ['Time Marketing',      'marketing@supermercadoindio.com.br',      hMkt,   'CRIADOR', storeIds[0]],
    ['Gerente Guaiba',      'guaiba@supermercadoindio.com.br',         hGer,   'GERENTE', storeIds[0]],
    ['Gerente Charqueadas', 'charqueadas@supermercadoindio.com.br',    hGer,   'GERENTE', storeIds[8]],
    ['Gerente Eldorado',    'eldorado@supermercadoindio.com.br',       hGer,   'GERENTE', storeIds[4]],
  ]

  for (const [name, email, pwd, role, sid] of users) {
    const q = `INSERT INTO users (id, name, email, password, role, active, "createdAt", "updatedAt", "storeId") VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW(), $5)`
    await client.query(q, [name, email, pwd, role, sid])
    console.log(`   ✓ ${email} [${role}]`)
  }

  console.log('\n✅ SETUP COMPLETO!')
  console.log('\n📋 CREDENCIAIS:')
  console.log('   Admin:     wagner@supermercadoindio.com.br  /  indio@2026')
  console.log('   Marketing: marketing@supermercadoindio.com.br  /  marketing@2026')
  console.log('   Gerentes:  guaiba/charqueadas/eldorado@supermercadoindio.com.br  /  gerente@2026')

  await client.end()
}

setup().catch(e => { console.error('❌ ERRO:', e.message); process.exit(1) })
