migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'contato@alma9.com.br')
    } catch (_) {
      admin = new Record(users)
      admin.setEmail('contato@alma9.com.br')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Administrador')
      admin.set('role', 'admin')
      admin.set('ativo', true)
      app.save(admin)
    }

    const clientes = app.findCollectionByNameOrId('clientes')
    let cliente1
    try {
      cliente1 = app.findFirstRecordByData('clientes', 'email', 'cliente1@exemplo.com')
    } catch (_) {
      cliente1 = new Record(clientes)
      cliente1.set('nome', 'TechCorp S.A.')
      cliente1.set('email', 'cliente1@exemplo.com')
      cliente1.set('data_venda', '2023-10-01 10:00:00.000Z')
      cliente1.set('valor_contrato', 15000)
      cliente1.set('status_onboarding', 'em_andamento')
      cliente1.set('data_prazo', '2023-11-01 10:00:00.000Z')
      cliente1.set('implantador_id', admin.id)
      app.save(cliente1)
    }

    let cliente2
    try {
      cliente2 = app.findFirstRecordByData('clientes', 'email', 'cliente2@exemplo.com')
    } catch (_) {
      cliente2 = new Record(clientes)
      cliente2.set('nome', 'Inova Store')
      cliente2.set('email', 'cliente2@exemplo.com')
      cliente2.set('data_venda', '2023-09-15 10:00:00.000Z')
      cliente2.set('valor_contrato', 8500)
      cliente2.set('status_onboarding', 'atrasado')
      cliente2.set('data_prazo', '2023-10-15 10:00:00.000Z')
      cliente2.set('implantador_id', admin.id)
      app.save(cliente2)
    }

    let cliente3
    try {
      cliente3 = app.findFirstRecordByData('clientes', 'email', 'cliente3@exemplo.com')
    } catch (_) {
      cliente3 = new Record(clientes)
      cliente3.set('nome', 'Agência XYZ')
      cliente3.set('email', 'cliente3@exemplo.com')
      cliente3.set('data_venda', '2023-10-20 10:00:00.000Z')
      cliente3.set('valor_contrato', 12000)
      cliente3.set('status_onboarding', 'agendado')
      cliente3.set('data_prazo', '2023-11-20 10:00:00.000Z')
      cliente3.set('implantador_id', admin.id)
      app.save(cliente3)
    }

    const tarefas = app.findCollectionByNameOrId('tarefas_onboarding')
    try {
      app.findFirstRecordByData('tarefas_onboarding', 'titulo', 'Reunião de Kickoff')
    } catch (_) {
      const t1 = new Record(tarefas)
      t1.set('cliente_id', cliente1.id)
      t1.set('titulo', 'Reunião de Kickoff')
      t1.set('descricao', 'Alinhar expectativas com a equipe do cliente.')
      t1.set('concluido', true)
      t1.set('data_conclusao', '2023-10-05 14:00:00.000Z')
      app.save(t1)
    }

    try {
      app.findFirstRecordByData('tarefas_onboarding', 'titulo', 'Importação de Dados')
    } catch (_) {
      const t2 = new Record(tarefas)
      t2.set('cliente_id', cliente1.id)
      t2.set('titulo', 'Importação de Dados')
      t2.set('descricao', 'Importar planilha de clientes legados.')
      t2.set('concluido', false)
      app.save(t2)
    }

    const atividades = app.findCollectionByNameOrId('atividades')
    try {
      app.findFirstRecordByData('atividades', 'descricao', 'Onboarding iniciado pelo sistema.')
    } catch (_) {
      const a1 = new Record(atividades)
      a1.set('cliente_id', cliente1.id)
      a1.set('usuario_id', admin.id)
      a1.set('tipo_atividade', 'system')
      a1.set('descricao', 'Onboarding iniciado pelo sistema.')
      app.save(a1)
    }
  },
  (app) => {},
)
