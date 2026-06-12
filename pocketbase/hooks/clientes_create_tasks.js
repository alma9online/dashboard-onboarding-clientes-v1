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

    let tasks = []

    const expedyTasks = [
      'Reunião inicial | Alinhamento de operação',
      'Integrações | Cadastro e configurações no fluxo de pedidos',
      'Empresas | Cadastro e configurações das regras fiscais',
      'Produtos | Cadastro e vínculo dos anúncios',
      'Pedidos | Emissão das notas fiscais e das etiquetas',
      'Expedição | Impressão das etiquetas e agendamentos',
      'Configuração | Controle de estoque',
      'Outras Funções | Dashboard, conferência de coleta, relatórios e APPs',
    ]

    const handsysTasks = [
      'Reunião inicial | Levantamento de requisitos Handsys',
      'Configuração | Parametrização do ambiente Handsys',
      'Treinamento | Capacitação dos usuários Handsys',
      'Homologação | Validação dos processos',
      'Go-Live | Acompanhamento do primeiro dia',
    ]

    const snapTasks = [
      'Reunião inicial | Escopo Snap',
      'Configuração | Ambiente Snap',
      'Treinamento | Usuários Snap',
    ]

    if (sistemasArray.includes('Expedy') || sistemasArray.length === 0) {
      tasks.push(...expedyTasks)
    }

    if (sistemasArray.includes('Handsys')) {
      tasks.push(...handsysTasks)
    }

    if (sistemasArray.includes('Snap')) {
      tasks.push(...snapTasks)
    }

    // Deduplicate shared or overlapping tasks
    const uniqueTasks = [...new Set(tasks)]

    for (let i = 0; i < uniqueTasks.length; i++) {
      const record = new Record(tarefasCollection)
      record.set('cliente_id', e.record.id)
      record.set('titulo', uniqueTasks[i])
      record.set('concluido', false)
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
