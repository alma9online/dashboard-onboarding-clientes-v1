onRecordAfterCreateSuccess((e) => {
  try {
    const tarefasCollection = $app.findCollectionByNameOrId('tarefas_onboarding')
    const tasks = [
      'Reunião inicial | Alinhamento de operação',
      'Integrações | Cadastro e configurações no fluxo de pedidos',
      'Empresas | Cadastro e configurações das regras fiscais',
      'Produtos | Cadastro e vínculo dos anúncios',
      'Pedidos | Emissão das notas fiscais e das etiquetas',
      'Expedição | Impressão das etiquetas e agendamentos',
      'Configuração | Controle de estoque',
      'Outras Funções | Dashboard, conferência de coleta, relatórios e APPs',
    ]

    for (let i = 0; i < tasks.length; i++) {
      const record = new Record(tarefasCollection)
      record.set('cliente_id', e.record.id)
      record.set('titulo', tasks[i])
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
