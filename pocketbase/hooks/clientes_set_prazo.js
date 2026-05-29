onRecordCreate((e) => {
  try {
    let dataVendaStr = e.record.getString('data_venda')

    if (!dataVendaStr) {
      const now = new Date()
      dataVendaStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
    } else {
      // Extract only the date part YYYY-MM-DD
      dataVendaStr = dataVendaStr.split(' ')[0].split('T')[0]
    }

    // Set to 12:00 UTC to safely add days without timezone date shifting
    const dataVenda = new Date(dataVendaStr + 'T12:00:00Z')

    let daysToAdd = 15
    let currentDate = new Date(dataVenda)

    while (daysToAdd > 0) {
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
      const dayOfWeek = currentDate.getUTCDay() // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysToAdd--
      }
    }

    const year = currentDate.getUTCFullYear()
    const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getUTCDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day} 12:00:00.000Z`

    e.record.set('data_prazo', formattedDate)
  } catch (err) {
    $app.logger().error('Error calculating data_prazo', 'error', err.message)
  }

  return e.next()
}, 'clientes')
