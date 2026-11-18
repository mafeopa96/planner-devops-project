const express = require('express')
const client  = require('prom-client')

const app  = express()
const PORT = process.env.PORT || 8080

const register = new client.Registry()
client.collectDefaultMetrics({ register })

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
})

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    })
  })
  next()
})

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    tool: 'Azure DevOps',
    build: process.env.BUILD_BUILDNUMBER || 'local',
    timestamp: new Date().toISOString()
  })
})

app.get('/api/hello', (req, res) => {
  const name = req.query.name || 'mundo'
  res.json({ message: `Hola ${name} desde Azure DevOps + Azure Web App!` })
})

app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType)
  res.send(await register.metrics())
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})
