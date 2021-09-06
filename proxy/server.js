const BASE_PATH = ''
const PORT = 3001

const SERVICE_HOST = process.env.SERVICE_HOST || 'localhost';
const SERVICE_PORT = process.env.SERVICE_PORT || 3000;

const mockMiddleware = () => {
  return async (req, res, next) => {
    console.log('here')
    req.originalUrl = `https://google.com`
    next();
  }
}

const express = require('express')
const proxy = require('express-http-proxy')

const app = express()

app.use(`${BASE_PATH}/blog`, mockMiddleware())
app.use('/', proxy(`${SERVICE_HOST}:${SERVICE_PORT}`, () => ({
  proxyReqPathResolver: (req) => req.originalUrl,
})));

app.listen({ port: PORT }, () => {})