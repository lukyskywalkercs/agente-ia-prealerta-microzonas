import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

const CONFIG_PATH = path.join(__dirname, '..', 'public', 'data', 'risk_config.json')

app.get('/api/risk-config', (req, res) => {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
    res.type('application/json').send(raw)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/risk-config', (req, res) => {
  try {
    const cfg = req.body
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2))
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/risk-recalc', (req, res) => {
  exec('npx tsx agents/risk_evaluator.ts', (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: error.message })
    res.json({ ok: true, stdout, stderr })
  })
})

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787
app.listen(PORT, () => {
  console.log(`[API] risk-config-server listening on http://localhost:${PORT}`)
})







