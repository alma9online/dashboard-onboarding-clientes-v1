/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = new Collection({
      name: 'produtos_contratados',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gerente_integracao' || (@request.auth.role = 'implantador' && (cliente_id.implantador_id = @request.auth.id || cliente_id.implantador_secundario_id = @request.auth.id)))",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gerente_integracao' || (@request.auth.role = 'implantador' && (cliente_id.implantador_id = @request.auth.id || cliente_id.implantador_secundario_id = @request.auth.id)))",
      createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gerente_integracao' || (@request.auth.role = 'implantador' && (cliente_id.implantador_id = @request.auth.id || cliente_id.implantador_secundario_id = @request.auth.id)))",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'cliente_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('clientes').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'nome', type: 'text', required: true },
        { name: 'recorrencia', type: 'text', required: true },
        { name: 'valor', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_produtos_contratados_cliente ON produtos_contratados (cliente_id)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('produtos_contratados')
    app.delete(collection)
  },
)
