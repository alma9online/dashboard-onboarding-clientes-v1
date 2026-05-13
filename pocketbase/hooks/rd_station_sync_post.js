routerAdd(
  'POST',
  '/backend/v1/sync-rd-station',
  (e) => {
    const authHeader = e.request.header.get('Authorization') || ''
    $app
      .logger()
      .info(
        'Sync RD Station - Auth Header Debug',
        'hasHeader',
        !!authHeader,
        'prefix',
        authHeader ? authHeader.substring(0, 7) : 'none',
      )

    const authRecord = e.auth

    if (!authRecord) {
      throw new UnauthorizedError('Token de autorização ausente ou inválido')
    }

    if (authRecord.getString('role') !== 'admin') {
      throw new ForbiddenError('Permissão insuficiente para realizar a sincronização')
    }

    const token = $secrets.get('RD_STATION_API_KEY')

    const logSync = (status, novos, atualizados, msg) => {
      try {
        const sincCol = $app.findCollectionByNameOrId('sincronizacoes')
        const record = new Record(sincCol)
        record.set('status', status)
        record.set('clientes_novos', novos)
        record.set('clientes_atualizados', atualizados)
        record.set('mensagem_erro', msg)
        record.set('executado_por', authRecord.id)
        $app.save(record)
      } catch (err) {
        $app.logger().error('Erro ao salvar log de sincronização', 'erro', err.message)
      }
    }

    if (!token) {
      logSync(
        'erro',
        0,
        0,
        'Chave de API do RD Station não configurada nos secrets (RD_STATION_API_KEY).',
      )
      throw new BadRequestError(
        'Chave de API do RD Station não configurada nos secrets (RD_STATION_API_KEY).',
      )
    }

    let deals = []
    try {
      const res = $http.send({
        url: `https://crm.rdstation.com/api/v1/deals?token=${token}&win=true`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 30,
      })

      if (res.statusCode !== 200) {
        const errorMsg = 'Erro ao comunicar com a API do RD Station. Status: ' + res.statusCode
        logSync('erro', 0, 0, errorMsg)
        throw new BadRequestError(errorMsg)
      }

      const data = res.json || {}
      deals = data.deals || (Array.isArray(data) ? data : [])
    } catch (err) {
      if (err instanceof BadRequestError) {
        throw err
      }
      const errorMsg = 'Falha na comunicação com o RD Station: ' + err.message
      logSync('erro', 0, 0, errorMsg)
      throw new BadRequestError(errorMsg)
    }

    let clientes_novos = 0
    let clientes_atualizados = 0

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

        if (updated) {
          $app.save(existingRecord)
          clientes_atualizados++
        }
      } catch (_) {
        const record = new Record(clientesCol)
        record.set('nome', nome)
        record.set('email', email)
        record.set('valor_contrato', valor)

        if (closed_at) {
          record.set('data_venda', closed_at.substring(0, 10) + ' 12:00:00.000Z')
        }

        record.set('status_onboarding', 'pendente')

        try {
          $app.save(record)
          clientes_novos++
        } catch (err) {
          $app.logger().error('Erro ao salvar cliente do RD Station', 'erro', err.message)
        }
      }
    }

    logSync('sucesso', clientes_novos, clientes_atualizados, '')

    return e.json(200, { status: 'success', clientes_novos, clientes_atualizados })
  },
  $apis.requireAuth(),
)
