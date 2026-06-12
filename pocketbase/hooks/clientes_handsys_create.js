onRecordAfterCreateSuccess((e) => {
  const sistemasRaw = e.record.get('sistemas')
  const sistemas = sistemasRaw ? (Array.isArray(sistemasRaw) ? sistemasRaw : [sistemasRaw]) : []
  const hasHandsys = sistemas.includes('Handsys')

  if (!hasHandsys) return e.next()

  const clienteId = e.record.id
  let existing = false

  try {
    $app.findFirstRecordByFilter(
      'tarefas_onboarding',
      "cliente_id = {:clienteId} && sistema = 'Handsys'",
      { clienteId: clienteId },
    )
    existing = true
  } catch (_) {
    existing = false
  }

  if (existing) return e.next()

  const HANDSYS_TASKS = [
    'Cadastro de entidades',
    'Cadastro de produtos',
    'Cadastros básicos',
    'Conferência de estoque',
    'Entrada por XML',
    'Vendas/Orçamentos/Consignados',
    'Contas a receber',
    'Caixa',
    'Contas a pagar',
    'Controle de cheque',
    'Controle bancário',
    'Produção interna',
    'Mão de obra externa',
    'Relatórios',
  ]

  const tarefasCol = $app.findCollectionByNameOrId('tarefas_onboarding')

  for (let i = 0; i < HANDSYS_TASKS.length; i++) {
    const taskRecord = new Record(tarefasCol)
    taskRecord.set('cliente_id', clienteId)
    taskRecord.set('titulo', HANDSYS_TASKS[i])
    taskRecord.set('concluido', false)
    taskRecord.set('ordem', i + 1)
    taskRecord.set('sistema', 'Handsys')
    $app.save(taskRecord)
  }

  return e.next()
}, 'clientes')
