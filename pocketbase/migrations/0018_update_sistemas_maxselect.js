migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')
    const field = col.fields.getByName('sistemas')
    if (field) {
      field.maxSelect = 3
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')
    const field = col.fields.getByName('sistemas')
    if (field) {
      field.maxSelect = 1
      app.save(col)
    }
  },
)
