cronAdd('check_atrasados', '0 * * * *', () => {
  try {
    const now = new Date()
    const year = now.getUTCFullYear()
    const month = String(now.getUTCMonth() + 1).padStart(2, '0')
    const day = String(now.getUTCDate()).padStart(2, '0')
    const hours = String(now.getUTCHours()).padStart(2, '0')
    const minutes = String(now.getUTCMinutes()).padStart(2, '0')
    const seconds = String(now.getUTCSeconds()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.000Z`

    const records = $app.findRecordsByFilter(
      'clientes',
      `data_prazo < "${todayStr}" && data_prazo != "" && status_onboarding != 'concluido' && status_onboarding != 'cancelado' && status_onboarding != 'atrasado'`,
      '',
      1000,
      0,
    )

    for (let i = 0; i < records.length; i++) {
      records[i].set('status_onboarding', 'atrasado')
      $app.save(records[i])
    }
  } catch (err) {
    $app.logger().error('Error in check_atrasados cron', 'error', err.message)
  }
})
