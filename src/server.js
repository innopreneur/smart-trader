/**
 * (main entry file) express server module
 */
import express from 'express'
import cors from 'cors'
import path from 'path'
import { getPairConfig } from './recorders'
import { addPair } from './admin'
import { mainRouter, unknownRouter } from './server/routes'
import { handleErrors, requestInterceptor, responseInterceptor, logger } from './server/middlewares'
require('dotenv').config()

let fileName = path.basename(__filename)

export const app = express()

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// parse application/json
app.use(express.json())

// configure CORS headers
app.use(cors())

//use request interceptors
app.use(requestInterceptor)


//handle normal routes
app.use('/', mainRouter)

//handle unknown routes
app.use('*', unknownRouter)

//handle errors
app.use(handleErrors)

//use response interceptors
app.use(responseInterceptor)

app.listen(process.env.PORT || 4040, async () => {
        logger.info(`${fileName} : Server started on port - " + ${process.env.PORT}`)
})

