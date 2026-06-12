migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')

    if (!col.fields.getByName('codigo_cliente')) {
      col.fields.add(new TextField({ name: 'codigo_cliente' }))
    }
    if (!col.fields.getByName('implantador_secundario_id')) {
      col.fields.add(
        new RelationField({
          name: 'implantador_secundario_id',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('qtd_reunioes')) {
      col.fields.add(new NumberField({ name: 'qtd_reunioes' }))
    }
    if (!col.fields.getByName('horas_estimadas_reuniao')) {
      col.fields.add(new NumberField({ name: 'horas_estimadas_reuniao' }))
    }

    const sistemasField = col.fields.getByName('sistemas')
    if (sistemasField) {
      sistemasField.values = ['Expedy', 'Snap', 'Handsys']
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')

    try {
      col.fields.removeByName('codigo_cliente')
    } catch (_) {}
    try {
      col.fields.removeByName('implantador_secundario_id')
    } catch (_) {}
    try {
      col.fields.removeByName('qtd_reunioes')
    } catch (_) {}
    try {
      col.fields.removeByName('horas_estimadas_reuniao')
    } catch (_) {}

    app.save(col)
  },
)
