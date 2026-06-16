/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')
    col.fields.add(new TextField({ name: 'cnpj' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')
    col.fields.removeByName('cnpj')
    app.save(col)
  },
)
