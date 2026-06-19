routerAdd('POST', '/backend/v1/webhook-rd', (e) => {
  $app.logger().info('RD Station Webhook received')

  const body = e.requestInfo().body || {}

  let deals = []
  if (Array.isArray(body)) {
    deals = body
  } else if (body.deals && Array.isArray(body.deals)) {
    deals = body.deals
  } else if (body.deal) {
    deals = [body.deal]
  } else {
    deals = [body]
  }

  let clientes_novos = 0
  let clientes_atualizados = 0

  const clientesCol = $app.findCollectionByNameOrId('clientes')
  const produtosCol = $app.findCollectionByNameOrId('produtos_contratados')

  for (const deal of deals) {
    if (!deal || !deal.name) continue

    const nome = deal.name || 'Sem Nome'
    let email = deal.email || ''

    if (!email && deal.contacts && deal.contacts.length > 0) {
      const contact = deal.contacts[0]
      if (contact.emails && contact.emails.length > 0) {
        email = contact.emails[0].email
      }
    }

    const valor = deal.amount || 0
    const closed_at = deal.closed_at || ''

    let cnpj = ''
    if (deal.deal_custom_fields && deal.deal_custom_fields.length > 0) {
      const cf = deal.deal_custom_fields.find(
        (f) =>
          f.custom_field &&
          f.custom_field.name &&
          f.custom_field.name.toUpperCase().includes('CNPJ'),
      )
      if (cf) cnpj = cf.value || ''
    }
    if (!cnpj && deal.organization) {
      cnpj = deal.organization.document || ''
    }
    if (!cnpj && deal.contacts && deal.contacts.length > 0) {
      cnpj = deal.contacts[0].document || ''
    }

    if (!email) {
      $app.logger().info('RD Webhook: Deal skipped, no email found', 'dealName', nome)
      continue
    }

    try {
      const existingRecord = $app.findFirstRecordByData('clientes', 'email', email)

      let updated = false
      if (valor && existingRecord.getFloat('valor_contrato') !== valor) {
        existingRecord.set('valor_contrato', valor)
        updated = true
      }

      if (closed_at) {
        const formattedClosedAt = closed_at.substring(0, 10) + ' 12:00:00.000Z'
        if (existingRecord.getString('data_venda') !== formattedClosedAt) {
          existingRecord.set('data_venda', formattedClosedAt)
          updated = true
        }
      }

      if (cnpj && existingRecord.getString('cnpj') !== cnpj) {
        existingRecord.set('cnpj', cnpj)
        updated = true
      }

      if (updated) {
        $app.save(existingRecord)
        clientes_atualizados++
      }

      try {
        const existingProducts = $app.findRecordsByFilter(
          'produtos_contratados',
          `cliente_id = '${existingRecord.id}'`,
          '',
          100,
          0,
        )
        for (const prod of existingProducts) {
          $app.delete(prod)
        }
      } catch (e) {}

      let produtos = deal.deal_products || []
      if (produtos.length === 0 && valor > 0) {
        produtos = [{ name: 'Serviço Padrão', recurrence: 'Única', price: valor }]
      }

      for (const dp of produtos) {
        const prodNome = dp.name || (dp.product && dp.product.name) || 'Produto sem nome'
        const recorrencia = dp.recurrence || 'Única'
        const val =
          dp.price !== undefined ? dp.price : dp.total !== undefined ? dp.total : dp.amount || 0

        const prodRec = new Record(produtosCol)
        prodRec.set('cliente_id', existingRecord.id)
        prodRec.set('nome', prodNome)
        prodRec.set('recorrencia', recorrencia)
        prodRec.set('valor', val)
        $app.save(prodRec)
      }

      $app.logger().info('RD Webhook: Deal updated', 'email', email)
    } catch (_) {
      const record = new Record(clientesCol)
      record.set('nome', nome)
      record.set('email', email)
      record.set('valor_contrato', valor)

      if (closed_at) {
        record.set('data_venda', closed_at.substring(0, 10) + ' 12:00:00.000Z')
      }

      if (cnpj) {
        record.set('cnpj', cnpj)
      }

      record.set('status_onboarding', 'pendente')

      try {
        $app.save(record)
        clientes_novos++

        let produtos = deal.deal_products || []
        if (produtos.length === 0 && valor > 0) {
          produtos = [{ name: 'Serviço Padrão', recurrence: 'Única', price: valor }]
        }

        for (const dp of produtos) {
          const prodNome = dp.name || (dp.product && dp.product.name) || 'Produto sem nome'
          const recorrencia = dp.recurrence || 'Única'
          const val =
            dp.price !== undefined ? dp.price : dp.total !== undefined ? dp.total : dp.amount || 0

          const prodRec = new Record(produtosCol)
          prodRec.set('cliente_id', record.id)
          prodRec.set('nome', prodNome)
          prodRec.set('recorrencia', recorrencia)
          prodRec.set('valor', val)
          $app.save(prodRec)
        }

        $app.logger().info('RD Webhook: Deal created', 'email', email)
      } catch (err) {
        $app.logger().error('Erro ao salvar cliente do RD Station webhook', 'erro', err.message)
      }
    }
  }

  $app
    .logger()
    .info(
      'RD Station Webhook processed',
      'clientes_novos',
      clientes_novos,
      'clientes_atualizados',
      clientes_atualizados,
    )

  return e.json(200, { status: 'success', clientes_novos, clientes_atualizados })
})
