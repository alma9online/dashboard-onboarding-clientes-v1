migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('clientes')

    const newRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gerente_integracao' || (@request.auth.role = 'implantador' && (implantador_id = @request.auth.id || implantador_secundario_id = @request.auth.id)))"

    collection.listRule = newRule
    collection.viewRule = newRule
    collection.updateRule = newRule

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('clientes')

    const oldRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gerente_integracao' || (@request.auth.role = 'implantador' && implantador_id = @request.auth.id))"

    collection.listRule = oldRule
    collection.viewRule = oldRule
    collection.updateRule = oldRule

    app.save(collection)
  },
)
