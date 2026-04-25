migrate(
  (app) => {
    const collection = new Collection({
      name: 'sincronizacoes',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['sucesso', 'erro'],
        },
        { name: 'clientes_novos', type: 'number', required: true, onlyInt: true },
        { name: 'clientes_atualizados', type: 'number', required: true, onlyInt: true },
        { name: 'mensagem_erro', type: 'text' },
        {
          name: 'executado_por',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_sincronizacoes_created ON sincronizacoes (created DESC)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('sincronizacoes')
    app.delete(collection)
  },
)
