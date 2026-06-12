migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('tarefas_onboarding')
    col.fields.add(new TextField({ name: 'sistema' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('tarefas_onboarding')
    col.fields.removeByName('sistema')
    app.save(col)
  },
)
