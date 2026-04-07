migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.listRule = "@request.auth.id != ''"
    users.viewRule = "@request.auth.id != ''"
    if (!users.fields.getByName('role')) {
      users.fields.add(new TextField({ name: 'role', required: true }))
    }
    if (!users.fields.getByName('ativo')) {
      users.fields.add(new BoolField({ name: 'ativo' }))
    }
    app.save(users)

    const clientes = new Collection({
      name: 'clientes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'data_venda', type: 'date' },
        { name: 'valor_contrato', type: 'number' },
        {
          name: 'status_onboarding',
          type: 'select',
          values: ['pendente', 'agendado', 'em_andamento', 'atrasado', 'concluido'],
          maxSelect: 1,
          required: true,
        },
        { name: 'data_prazo', type: 'date' },
        { name: 'implantador_id', type: 'relation', collectionId: users.id, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(clientes)

    const tarefas = new Collection({
      name: 'tarefas_onboarding',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'cliente_id',
          type: 'relation',
          collectionId: clientes.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'titulo', type: 'text', required: true },
        { name: 'descricao', type: 'text' },
        { name: 'concluido', type: 'bool' },
        { name: 'data_conclusao', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(tarefas)

    const atividades = new Collection({
      name: 'atividades',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'cliente_id',
          type: 'relation',
          collectionId: clientes.id,
          required: true,
          maxSelect: 1,
        },
        {
          name: 'usuario_id',
          type: 'relation',
          collectionId: users.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'tipo_atividade', type: 'text' },
        { name: 'descricao', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(atividades)
  },
  (app) => {
    const atividades = app.findCollectionByNameOrId('atividades')
    app.delete(atividades)
    const tarefas = app.findCollectionByNameOrId('tarefas_onboarding')
    app.delete(tarefas)
    const clientes = app.findCollectionByNameOrId('clientes')
    app.delete(clientes)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.fields.removeByName('role')
    users.fields.removeByName('ativo')
    app.save(users)
  },
)
