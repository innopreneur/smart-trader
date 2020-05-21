/**
 * router to handle all app routes
 */
import express from 'express'
import {
  startTrading,
  stopTrading,
  pauseTrading,
  resumeTrading,
  addPair
} from '../../admin'

import { removePair } from '../../utils/operations'

const mainRouter = express.Router()



// route to start trading
mainRouter.get('/start',
  async (req, res, next) => {
    try {
      console.log("Trading Started")
      startTrading()
      let code = 200
      let message = "trading started"
      next({ code, message })
    }
    catch (error) {
      next(new Error(error))
    }
  })

// route to pause all trading
mainRouter.get('/pause',
  async (req, res, next) => {
    try {
      pauseTrading()
      console.log("Trading Paused")
      let code = 200
      let message = "trading paused"
      next({ code, message })
    }
    catch (error) {
      next(new Error(error))
    }
  })

// route to resume all trading
mainRouter.get('/resume',
  async (req, res, next) => {
    try {
      resumeTrading()
      console.log("Trading Resumed")
      let code = 200
      let message = "trading resumed"
      next({ code, message })
    }
    catch (error) {
      next(new Error(error))
    }
  })

// route to stop all trading
mainRouter.get('/stop',
  async (req, res, next) => {
    try {
      stopTrading()
      console.log("Trading Stopped")
      let code = 200
      let message = "trading stopped"
      next({ code, message })
    }
    catch (error) {
      next(new Error(error))
    }
  })


// route to get all trading pairs
mainRouter.get('/pairs',
  async (req, res, next) => {
    try {
      console.log("Getting all trading pairs")
      let code = 200
      next({ code, message: global.pairs })
    }
    catch (error) {
      next(new Error(error))
    }
  })

// route to add pair
mainRouter.post('/addPair',
  async (req, res, next) => {
    try {
      console.log(req.body)
      //add pair to trader
      let { code, message } = await addPair(req.body)
      console.log(code, message)
      next({ code, message })
    }
    catch (error) {
      next(new Error(error))
    }
  })

// route to remove a trading Pair
mainRouter.delete('/removePair',
  async (req, res, next) => {
    try {
      //remove pair from trading pairs
      let { code, message } = removePair(req.query.symbol)
      next({ code, message })
    }
    catch (error) {
      next(new Error(error))
    }
  })

// route to get all trading pairs
mainRouter.get('/orders',
  async (req, res, next) => {
    try {
      console.log("Getting open orders")
      let { code, message } = await getOpenOrders()
      next({ code, message })
    }
    catch (error) {
      next(new Error(error))
    }
  })

export default mainRouter
