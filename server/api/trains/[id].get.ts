import type { DataSource, TrainDetail } from '#shared/krl'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const api = krlApi(event)

  let train: TrainDetail | null
  let source: DataSource = 'simulasi'
  if (api) {
    try {
      train = await apiTrain(api, id)
      source = 'krl'
    } catch (err) {
      console.error('[krl] train request failed:', err)
      throw createError({ statusCode: 502, statusMessage: 'API KRL tidak dapat dihubungi' })
    }
  } else {
    train = simTrain(id)
  }

  if (!train) throw createError({ statusCode: 404, statusMessage: 'Kereta tidak ditemukan' })
  return { source, train }
})
