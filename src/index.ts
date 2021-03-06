import fastify from 'fastify'
import helmet from 'fastify-helmet'
import cors from 'fastify-cors'
import config from './config'
import { apiGetAccountAssets, apiGetAccountTransactions } from './blockscout'
import { apiGetGasPrices } from './gas-price'
import {
  apiGetAccountNonce,
  apiGetGasLimit,
  apiGetBlockNumber,
  apiGetCustomRPC
} from './rpc'
import { sanitizeHex } from './utilities'
import { convertStringToNumber } from './bignumber'
import supportedChains from './chains'
import { apiGetEthPrices } from './cryptocompare'

const app = fastify({ logger: config.debug })

app.register(helmet)
app.register(cors)

app.get('/hello', (req, res) => {
  res.status(200).send(`Hello World`)
})

app.get('/account-assets', async (req, res) => {
  const address = sanitizeHex(req.query.address)
  const chainId = convertStringToNumber(req.query.chainId)

  if (!address || typeof address !== 'string') {
    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Missing or invalid address parameter'
    })
  }

  if (!chainId || typeof chainId !== 'number') {
    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Missing or invalid chainId parameter'
    })
  }
  try {
    const assets = await apiGetAccountAssets(address, chainId)

    res.status(200).send({
      success: true,
      result: assets
    })
  } catch (error) {
    console.error(error)

    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    })
  }
})

app.get('/account-transactions', async (req, res) => {
  const address = sanitizeHex(req.query.address)
  const chainId = convertStringToNumber(req.query.chainId)

  if (!address || typeof address !== 'string') {
    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Missing or invalid address parameter'
    })
  }

  if (!chainId || typeof chainId !== 'number') {
    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Missing or invalid chainId parameter'
    })
  }

  try {
    const transactions = await apiGetAccountTransactions(address, chainId)

    res.status(200).send({
      success: true,
      result: transactions
    })
  } catch (error) {
    console.error(error)

    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    })
  }
})

app.get('/account-nonce', async (req, res) => {
  const address = sanitizeHex(req.query.address)
  const chainId = convertStringToNumber(req.query.chainId)

  if (!address || typeof address !== 'string') {
    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Missing or invalid address parameter'
    })
  }

  if (!chainId || typeof chainId !== 'number') {
    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Missing or invalid chainId parameter'
    })
  }

  try {
    const nonce = await apiGetAccountNonce(address, chainId)

    res.status(200).send({
      success: true,
      result: nonce
    })
  } catch (error) {
    console.error(error)

    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    })
  }
})

app.get('/gas-limit', async (req, res) => {
  const contractAddress = sanitizeHex(req.query.contractAddress)
  const data = sanitizeHex(req.query.data) || '0x'
  const chainId = convertStringToNumber(req.query.chainId)

  if (!contractAddress || typeof contractAddress !== 'string') {
    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Missing or invalid contractAddress parameter'
    })
  }

  if (!data || typeof data !== 'string') {
    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Missing or invalid data parameter'
    })
  }

  if (!chainId || typeof chainId !== 'number') {
    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Missing or invalid chainId parameter'
    })
  }

  try {
    const gasLimit = await apiGetGasLimit(contractAddress, data)

    res.status(200).send({
      success: true,
      result: gasLimit
    })
  } catch (error) {
    console.error(error)

    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    })
  }
})

app.get('/gas-prices', async (req, res) => {
  try {
    const gasPrices = await apiGetGasPrices()

    res.status(200).send({
      success: true,
      result: gasPrices
    })
  } catch (error) {
    console.error(error)

    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    })
  }
})

app.get('/eth-prices', async (req, res) => {
  let fiat = req.query.fiat

  if (!fiat || typeof fiat !== 'string') {
    fiat = 'USD,EUR,GBP'
  }

  try {
    const ethPrices = await apiGetEthPrices(fiat)

    res.status(200).send({
      success: true,
      result: ethPrices
    })
  } catch (error) {
    console.error(error)

    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    })
  }
})

app.get('/block-number', async (req, res) => {
  const chainId = convertStringToNumber(req.query.chainId)

  if (!chainId || typeof chainId !== 'number') {
    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Missing or invalid chainId parameter'
    })
  }

  try {
    const blockNumber = await apiGetBlockNumber(chainId)

    res.status(200).send({
      success: true,
      result: blockNumber
    })
  } catch (error) {
    console.error(error)

    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    })
  }
})

app.post('/custom-request', async (req, res) => {
  const chainId = convertStringToNumber(req.query.chainId)

  if (!chainId || typeof chainId !== 'number') {
    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: 'Missing or invalid chainId parameter'
    })
  }

  try {
    const response = await apiGetCustomRPC(chainId, req.body)

    res.status(200).send({
      success: true,
      result: response
    })
  } catch (error) {
    console.error(error)

    res.status(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    })
  }
})

app.get('/supported-chains', async (req, res) => {
  res.status(200).send({
    success: true,
    result: supportedChains
  })
})

app.listen(config.port, (error: Error) => {
  if (error) {
  }
})
