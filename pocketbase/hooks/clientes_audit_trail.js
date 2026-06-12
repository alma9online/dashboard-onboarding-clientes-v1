onRecordAfterUpdateSuccess((e) => {
  try {
    const atividadesCol = $app.findCollectionByNameOrId('atividades')
    const userId = e.auth?.id

    if (!userId) return e.next()

    // 1. Status tracking
    const oldStatus = e.record.original().getString('status_onboarding')
    const newStatus = e.record.getString('status_onboarding')

    if (oldStatus !== newStatus) {
      const act = new Record(atividadesCol)
      act.set('cliente_id', e.record.id)
      act.set('usuario_id', userId)
      act.set('tipo_atividade', 'Status Atualizado')
      act.set(
        'descricao',
        `O status do onboarding foi alterado de '${oldStatus || 'nenhum'}' para '${newStatus}'.`,
      )
      $app.save(act)
    }

    // 2. Primary Owner (Implantador) tracking
    const oldImpl = e.record.original().getString('implantador_id')
    const newImpl = e.record.getString('implantador_id')

    if (oldImpl !== newImpl) {
      const act = new Record(atividadesCol)
      act.set('cliente_id', e.record.id)
      act.set('usuario_id', userId)
      act.set('tipo_atividade', 'Implantador Atribuído')
      act.set(
        'descricao',
        newImpl ? 'Novo implantador principal atribuído.' : 'Implantador principal removido.',
      )
      $app.save(act)
    }

    // 3. Secondary Owner tracking
    const oldImplSec = e.record.original().getString('implantador_secundario_id')
    const newImplSec = e.record.getString('implantador_secundario_id')

    if (oldImplSec !== newImplSec) {
      const act = new Record(atividadesCol)
      act.set('cliente_id', e.record.id)
      act.set('usuario_id', userId)
      act.set('tipo_atividade', 'Implantador Secundário Atribuído')
      act.set(
        'descricao',
        newImplSec ? 'Novo implantador secundário atribuído.' : 'Implantador secundário removido.',
      )
      $app.save(act)
    }
  } catch (err) {
    $app.logger().error('Audit trail error on client update', 'error', err.message)
  }

  return e.next()
}, 'clientes')

onRecordAfterUpdateSuccess((e) => {
  try {
    const atividadesCol = $app.findCollectionByNameOrId('atividades')
    const userId = e.auth?.id

    if (!userId) return e.next()

    const oldConcluido = e.record.original().getBool('concluido')
    const newConcluido = e.record.getBool('concluido')
    const titulo = e.record.getString('titulo')

    if (!oldConcluido && newConcluido) {
      const act = new Record(atividadesCol)
      act.set('cliente_id', e.record.getString('cliente_id'))
      act.set('usuario_id', userId)
      act.set('tipo_atividade', 'Tarefa Concluída')
      act.set('descricao', `A tarefa '${titulo}' foi concluída.`)
      $app.save(act)
    }
  } catch (err) {
    $app.logger().error('Audit trail error on task update', 'error', err.message)
  }

  return e.next()
}, 'tarefas_onboarding')

onRecordAfterCreateSuccess((e) => {
  try {
    const atividadesCol = $app.findCollectionByNameOrId('atividades')
    const userId = e.auth?.id

    if (!userId) return e.next()

    const act = new Record(atividadesCol)
    act.set('cliente_id', e.record.getString('cliente_id'))
    act.set('usuario_id', userId)
    act.set('tipo_atividade', 'Anotação Criada')
    act.set('descricao', `Uma nova anotação colaborativa foi adicionada.`)
    $app.save(act)
  } catch (err) {
    $app.logger().error('Audit trail error on note create', 'error', err.message)
  }

  return e.next()
}, 'anotacoes_clientes')
