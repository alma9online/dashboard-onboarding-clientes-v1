onRecordAfterCreateSuccess((e) => {
  try {
    const tarefasCollection = $app.findCollectionByNameOrId('tarefas_onboarding')

    let sistemas = e.record.get('sistemas') || []
    if (typeof sistemas === 'string') {
      try {
        sistemas = JSON.parse(sistemas)
      } catch {
        sistemas = [sistemas]
      }
    }
    const sistemasArray = Array.isArray(sistemas) ? sistemas : []

    let tasksToCreate = []

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

    if (sistemasArray.includes('Expedy') || sistemasArray.length === 0) {
      const sis = sistemasArray.includes('Expedy') ? 'Expedy' : ''
      expedyTasks.forEach((t) => tasksToCreate.push({ titulo: t, sistema: sis }))
    }

    if (sistemasArray.includes('Snap')) {
      snapTasks.forEach((t) => tasksToCreate.push({ titulo: t, sistema: 'Snap' }))
    }

    if (sistemasArray.includes('Handsys')) {
      handsysTasks.forEach((t) => tasksToCreate.push({ titulo: t, sistema: 'Handsys' }))
    }

    for (let i = 0; i < tasksToCreate.length; i++) {
      const record = new Record(tarefasCollection)
      record.set('cliente_id', e.record.id)
      record.set('titulo', tasksToCreate[i].titulo)
      record.set('concluido', false)
      record.set('sistema', tasksToCreate[i].sistema)
      record.set('ordem', i + 1)
      $app.save(record)
    }
  } catch (err) {
    $app
      .logger()
      .error('Error creating tasks for client', 'error', err.message, 'client_id', e.record.id)
  }

  return e.next()
}, 'clientes')
