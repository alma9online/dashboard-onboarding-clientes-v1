migrate(
  (app) => {
    const clientesCol = app.findCollectionByNameOrId('clientes')

    // Idempotent: skip if seeded data already exists
    try {
      app.findFirstRecordByData('clientes', 'email', 'joao.silva@exemplo.com')
      return
    } catch (_) {}

    // Try to get the admin user to use as implantador
    let adminId = ''
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'contato@alma9.com.br')
      adminId = admin.id
    } catch (_) {}

    const cliente1 = new Record(clientesCol)
    cliente1.set('nome', 'Tech Solutions Inc.')
    cliente1.set('email', 'contato@techsolutions.com')
    cliente1.set('data_venda', '2024-05-10 10:00:00.000Z')
    cliente1.set('valor_contrato', 15000)
    cliente1.set('status_onboarding', 'em_andamento')
    const prazo1 = new Date()
    prazo1.setDate(prazo1.getDate() + 15)
    cliente1.set('data_prazo', prazo1.toISOString())
    if (adminId) cliente1.set('implantador_id', adminId)
    app.save(cliente1)

    const cliente2 = new Record(clientesCol)
    cliente2.set('nome', 'Comercial Silva & Cia')
    cliente2.set('email', 'joao.silva@exemplo.com')
    cliente2.set('data_venda', '2024-05-01 14:00:00.000Z')
    cliente2.set('valor_contrato', 8500)
    cliente2.set('status_onboarding', 'atrasado')
    const prazo2 = new Date()
    prazo2.setDate(prazo2.getDate() - 5)
    cliente2.set('data_prazo', prazo2.toISOString())
    if (adminId) cliente2.set('implantador_id', adminId)
    app.save(cliente2)

    const cliente3 = new Record(clientesCol)
    cliente3.set('nome', 'Inovação Digital Ltda')
    cliente3.set('email', 'hello@inovacaodigital.com.br')
    cliente3.set('data_venda', '2024-04-15 09:30:00.000Z')
    cliente3.set('valor_contrato', 22000)
    cliente3.set('status_onboarding', 'concluido')
    const prazo3 = new Date()
    prazo3.setDate(prazo3.getDate() - 20)
    cliente3.set('data_prazo', prazo3.toISOString())
    if (adminId) cliente3.set('implantador_id', adminId)
    app.save(cliente3)

    // Add Tasks for the seeded clients
    const tarefasCol = app.findCollectionByNameOrId('tarefas_onboarding')

    const t1 = new Record(tarefasCol)
    t1.set('cliente_id', cliente1.id)
    t1.set('titulo', 'Reunião de Kick-off')
    t1.set('descricao', 'Apresentar a equipe e definir expectativas de implantação.')
    t1.set('concluido', true)
    t1.set('data_conclusao', new Date().toISOString())
    app.save(t1)

    const t2 = new Record(tarefasCol)
    t2.set('cliente_id', cliente1.id)
    t2.set('titulo', 'Importação de Dados Base')
    t2.set('descricao', 'Receber planilhas do cliente e importar no sistema.')
    t2.set('concluido', false)
    app.save(t2)

    const t3 = new Record(tarefasCol)
    t3.set('cliente_id', cliente2.id)
    t3.set('titulo', 'Treinamento da Equipe')
    t3.set('descricao', 'Realizar sessão online de 2h com a equipe comercial.')
    t3.set('concluido', false)
    app.save(t3)
  },
  (app) => {
    try {
      const c1 = app.findFirstRecordByData('clientes', 'email', 'joao.silva@exemplo.com')
      app.delete(c1)
    } catch (_) {}
    try {
      const c2 = app.findFirstRecordByData('clientes', 'email', 'contato@techsolutions.com')
      app.delete(c2)
    } catch (_) {}
    try {
      const c3 = app.findFirstRecordByData('clientes', 'email', 'hello@inovacaodigital.com.br')
      app.delete(c3)
    } catch (_) {}
  },
)
