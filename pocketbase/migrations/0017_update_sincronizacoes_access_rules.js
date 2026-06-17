migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('sincronizacoes')

    const newRule = "@request.auth.role = 'admin' || @request.auth.role = 'gerente_integracao'"

    collection.listRule = newRule
    collection.viewRule = newRule
    collection.createRule = newRule

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('sincronizacoes')

    collection.listRule = "@request.auth.role = 'admin'"
    collection.viewRule = "@request.auth.role = 'admin'"
    collection.createRule = null

    app.save(collection)
  },
)
