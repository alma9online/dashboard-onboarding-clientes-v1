migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    try {
      app.findAuthRecordByEmail('users', 'contato@alma9.com.br')
      return // already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('contato@alma9.com.br')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Administrador')
    record.set('role', 'admin')
    record.set('ativo', true)
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'contato@alma9.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
