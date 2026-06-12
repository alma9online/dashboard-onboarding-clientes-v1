migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')

    if (!col.fields.getByName('motivo_encerramento')) {
      col.fields.add(new TextField({ name: 'motivo_encerramento' }))
    }

    const sistemas = col.fields.getByName('sistemas')
    if (sistemas) {
      sistemas.maxSelect = 3
    }

    const status = col.fields.getByName('status_onboarding')
    if (status) {
      const vals = status.values
      if (!vals.includes('arquivado')) {
        vals.push('arquivado')
        status.values = vals
      }
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')

    if (col.fields.getByName('motivo_encerramento')) {
      col.fields.removeByName('motivo_encerramento')
    }

    const sistemas = col.fields.getByName('sistemas')
    if (sistemas) {
      sistemas.maxSelect = 1
    }

    const status = col.fields.getByName('status_onboarding')
    if (status) {
      status.values = status.values.filter((v) => v !== 'arquivado')
    }

    app.save(col)
  },
)
