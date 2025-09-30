// scripts/test-env.ts
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

console.log('AEMET_API_KEY =', process.env.AEMET_API_KEY)
