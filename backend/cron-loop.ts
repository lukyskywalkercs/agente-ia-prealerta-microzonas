// backend/cron-loop.ts
import cron from 'node-cron'
import { runOnce } from './cron-aemet'

// Ejecuta el cron cada 60 minutos, en el minuto 0 de cada hora (hora del sistema)
cron.schedule('0 * * * *', async () => {
  console.log('[CRON] ⏰ Ejecutando cron AEMET cada hora...')
  await runOnce()
})

// También lo ejecuta una vez al arrancar (opcional)
runOnce()
