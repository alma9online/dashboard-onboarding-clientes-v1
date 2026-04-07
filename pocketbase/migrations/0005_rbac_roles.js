migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    users.createRule = "@request.auth.role = 'admin'"
    users.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.deleteRule = "id = @request.auth.id || @request.auth.role = 'admin'"

    app.save(users)

    const clientes = app.findCollectionByNameOrId('clientes')
    const rule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gerente_integracao' || (@request.auth.role = 'implantador' && implantador_id = @request.auth.id))"

    clientes.listRule = rule
    clientes.viewRule = rule
    clientes.updateRule = rule

    app.save(clientes)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.createRule = ''
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)

    const clientes = app.findCollectionByNameOrId('clientes')
    clientes.listRule = "@request.auth.id != ''"
    clientes.viewRule = "@request.auth.id != ''"
    clientes.updateRule = "@request.auth.id != ''"
    app.save(clientes)
  },
)
