routerAdd(
  'GET',
  '/backend/v1/sync-rd-station',
  (e) => {
    const token = $secrets.get('RD_STATION_API_KEY')
    return e.json(200, {
      status: 'ready',
      configured: !!token,
    })
  },
  $apis.requireAuth(),
)
