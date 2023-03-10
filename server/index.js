const express = require('express')
const next = require('next')
var cors = require('cors')
require('dotenv').config()

const devProxy = {
  '/api': {
    target: process.env.SERVER_PROXY_API_URL,
    headers: {
      Connection: 'keep-alive',
    },
    pathRewrite: { '^/api': '/' },
    changeOrigin: true,
  },
  '/api-local': {
    target: process.env.SERVER_PROXY_API_LOCAL_URL,
    headers: {
      Connection: 'keep-alive',
    },
    pathRewrite: { '^/api-local': '/' },
    changeOrigin: true,
  },
}

const port = parseInt(process.env.PORT, 10) || 3000
const env = process.env.NODE_ENV
const dev = env !== 'production'
const app = next({
  dir: '.', // base directory where everything is, could move to src later
  dev,
})

const handle = app.getRequestHandler()

let server = express()
app
  .prepare()
  .then(() => {
    server.use(cors({ origin: true, credentials: true }))

    // Set up the proxy.a
    if (devProxy) {
      const { createProxyMiddleware } = require('http-proxy-middleware')
      Object.keys(devProxy).forEach(function (context) {
        server.use(context, createProxyMiddleware(devProxy[context]))
      })
    }

    // time to run next
    server.use(function (req, res, next) {
      handle(req, res).catch((e) => {
        // use rejected promise to forward error to next express middleware
        next(e)
      })
    })

    // Default catch-all handler to allow Next.js to handle all other routes
    // server.all('*', (req, res) => handle(req, res))

    server.listen(port, (err) => {
      if (err) {
        throw err
      }
      console.log(`> Ready on port ${port} [${env}]`)
    })
  })
  .catch((err) => {
    console.log('An error occurred, unable to start the server')
    console.log(err)
  })
