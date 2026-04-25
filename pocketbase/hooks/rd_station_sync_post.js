routerAdd(
  'POST',
  '/backend/v1/sync-rd-station',
  (e) => {
    const token = $secrets.get('RD_STATION_API_KEY')
    if (!token) {
      throw new BadRequestError(
        'Chave de API do RD Station não configurada nos secrets (RD_STATION_API_KEY).',
      )
    }

    const res = $http.send({
      url: `https://crm.rdstation.com/api/v1/deals?token=${token}&win=true`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 30,
    })

    if (res.statusCode !== 200) {
      throw new BadRequestError(
        'Erro ao comunicar com a API do RD Station. Status: ' + res.statusCode,
      )
    }

    const data = res.json || {}
    const deals = data.deals || (Array.isArray(data) ? data : [])
    let synced_count = 0

    const clientesCol = $app.findCollectionByNameOrId('clientes')

    for (const deal of deals) {
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

      if (!email) continue

      try {
        $app.findFirstRecordByData('clientes', 'email', email)
        continue // Já existe, ignora
      } catch (_) {
        // Não encontrado, cria o novo registro
        const record = new Record(clientesCol)
        record.set('nome', nome)
        record.set('email', email)
        record.set('valor_contrato', valor)

        if (closed_at) {
          record.set('data_venda', closed_at)
        }

        record.set('status_onboarding', 'pendente')

        try {
          $app.save(record)
          synced_count++
        } catch (err) {
          console.log('Erro ao salvar cliente do RD Station:', err.message)
        }
      }
    }

    return e.json(200, { status: 'success', synced_count })
  },
  $apis.requireAuth(),
)
