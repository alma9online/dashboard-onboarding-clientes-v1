migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')

    const statusField = col.fields.getByName('status_onboarding')
    statusField.values = [
      'pendente',
      'agendar',
      'aguardando_retorno',
      'agendado',
      'em_implantacao',
      'pausado',
      'atrasado',
      'em_acompanhamento',
      'concluido',
      'cancelado',
    ]

    if (!col.fields.getByName('telefone')) {
      col.fields.add(new TextField({ name: 'telefone' }))
    }
    if (!col.fields.getByName('funcoes_avancadas')) {
      col.fields.add(new BoolField({ name: 'funcoes_avancadas' }))
    }
    if (!col.fields.getByName('sistemas')) {
      col.fields.add(
        new SelectField({
          name: 'sistemas',
          values: ['Expedy', 'Snap', 'Handsys'],
          maxSelect: 3,
        }),
      )
    }
    if (!col.fields.getByName('horas_acumuladas')) {
      col.fields.add(new NumberField({ name: 'horas_acumuladas' }))
    }

    app.save(col)

    app
      .db()
      .newQuery(
        "UPDATE clientes SET status_onboarding = 'em_implantacao' WHERE status_onboarding = 'em_andamento'",
      )
      .execute()
  },
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')

    const statusField = col.fields.getByName('status_onboarding')
    statusField.values = ['pendente', 'agendado', 'em_andamento', 'atrasado', 'concluido']

    col.fields.removeByName('telefone')
    col.fields.removeByName('funcoes_avancadas')
    col.fields.removeByName('sistemas')
    col.fields.removeByName('horas_acumuladas')

    app.save(col)

    app
      .db()
      .newQuery(
        "UPDATE clientes SET status_onboarding = 'em_andamento' WHERE status_onboarding = 'em_implantacao'",
      )
      .execute()
  },
)
