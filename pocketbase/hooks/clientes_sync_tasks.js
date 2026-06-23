onRecordAfterUpdateSuccess((e) => {
  try {
    let oldSistemas = e.record.original().get('sistemas') || []
    if (typeof oldSistemas === 'string') {
      try {
        oldSistemas = JSON.parse(oldSistemas)
      } catch {
        oldSistemas = [oldSistemas]
      }
    }
    const oldArray = Array.isArray(oldSistemas) ? oldSistemas : []

    let newSistemas = e.record.get('sistemas') || []
    if (typeof newSistemas === 'string') {
      try {
        newSistemas = JSON.parse(newSistemas)
      } catch {
        newSistemas = [newSistemas]
      }
    }
    const newArray = Array.isArray(newSistemas) ? newSistemas : []

    const addedSistemas = newArray.filter((s) => !oldArray.includes(s))

    if (addedSistemas.length === 0) return e.next()

    const expedyTasks = [
      'Reunião inicial | Alinhamento de operação',
      'Empresas | Cadastro e configurações das regras fiscais',
      'Integrações | Cadastro e configurações no fluxo de pedidos',
      'Produtos | Cadastro e vínculo dos anúncios',
      'Pedidos | Emissão das notas fiscais e das etiquetas',
      'Expedição | Impressão das etiquetas e agendamentos',
      'Configuração | Controle de estoque',
      'Outras Funções | Dashboard, conferência de coleta, relatórios e APPs',
    ]

    const snapTasks = [
      'Reunião inicial | Alinhamento de operação',
      'Empresas | Cadastro e configurações das regras fiscais',
      'Integrações | Cadastro e configurações no fluxo de pedidos',
      'Produtos | Cadastro e vínculo dos anúncios',
      'Pedidos | Emissão das notas fiscais e das etiquetas',
      'Expedição | Impressão das etiquetas e agendamentos',
      'Outras Funções | Dashboard, conferência de coleta, relatórios e APPs',
    ]

    const handsysTasks = [
      'Cadastros básicos',
      'Cadastro de produtos',
      'Cadastro de entidades',
      'Relatórios',
      'Mão de obra externa',
      'Controle bancário',
      'Produção interna',
      'Controle de cheque',
      'Contas a pagar',
      'Contas a receber',
      'Caixa',
      'Vendas/Orçamentos/Consignados',
      'Conferência de estoque',
      'Entrada por XML',
    ]

    let tasksToCreate = []

    if (addedSistemas.includes('Expedy')) {
      expedyTasks.forEach((t) => tasksToCreate.push({ titulo: t, sistema: 'Expedy' }))
    }

    if (addedSistemas.includes('Snap')) {
      snapTasks.forEach((t) => tasksToCreate.push({ titulo: t, sistema: 'Snap' }))
    }

    if (addedSistemas.includes('Handsys')) {
      handsysTasks.forEach((t) => tasksToCreate.push({ titulo: t, sistema: 'Handsys' }))
    }

    if (tasksToCreate.length === 0) return e.next()

    const tarefasCollection = $app.findCollectionByNameOrId('tarefas_onboarding')

    const existingTasks = $app.findRecordsByFilter(
      'tarefas_onboarding',
      'cliente_id = {:clienteId}',
      '-ordem',
      1000,
      0,
      { clienteId: e.record.id },
    )

    let maxOrdem = 0
    const existingTitlesBySystem = {}

    for (let j = 0; j < existingTasks.length; j++) {
      const t = existingTasks[j]
      const ordem = t.getInt('ordem')
      if (ordem > maxOrdem) maxOrdem = ordem

      const sis = t.getString('sistema') || 'Expedy'
      const tit = t.getString('titulo')

      if (!existingTitlesBySystem[sis]) {
        existingTitlesBySystem[sis] = []
      }
      existingTitlesBySystem[sis].push(tit)
    }

    for (let i = 0; i < tasksToCreate.length; i++) {
      const task = tasksToCreate[i]

      if (
        existingTitlesBySystem[task.sistema] &&
        existingTitlesBySystem[task.sistema].includes(task.titulo)
      ) {
        continue
      }

      maxOrdem++
      const record = new Record(tarefasCollection)
      record.set('cliente_id', e.record.id)
      record.set('titulo', task.titulo)
      record.set('concluido', false)
      record.set('sistema', task.sistema)
      record.set('ordem', maxOrdem)
      $app.save(record)
    }
  } catch (err) {
    $app
      .logger()
      .error('Error syncing tasks for client', 'error', err.message, 'client_id', e.record.id)
  }

  return e.next()
}, 'clientes')
