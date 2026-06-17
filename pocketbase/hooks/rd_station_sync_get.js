routerAdd(
  'GET',
  '/backend/v1/sync-rd-station',
  (e) => {
    const authRecord = e.auth
    if (!authRecord) {
      throw new UnauthorizedError('Token de autorização ausente ou inválido')
    }
    const role = authRecord.getString('role')
    if (role !== 'admin' && role !== 'gerente_integracao') {
      throw new ForbiddenError('Permissão insuficiente para visualizar o status da sincronização')
    }

    const token = $secrets.get('RD_STATION_API_KEY')
    return e.json(200, {
      status: 'ready',
      configured: !!token,
    })
  },
  $apis.requireAuth(),
)
