import moment from 'moment'
import Sheet from './recorders/gsheets'
let path = require('path')
let fileName = path.basename(__filename)
import { logger } from './server/middlewares'

export function isItTime(pair) {
    switch (pair.strategy) {
        case 'ema':
            return timer.ema.isItTime(pair)
        default:
            return timer.ema.isItTime(pair)
    }
}

export async function updateTradeTimes(pair) {
    switch (pair.strategy) {
        case 'ema':
            return await timer.ema.updateTradeTimes(pair)
        default:
            return await timer.ema.updateTradeTimes(pair)
    }
}

export const timer = {
    ema: {
        updateTradeTimes: async function (pair) {
            let sheet = new Sheet(pair.sheetIndex)
            let records = await sheet.getAllRecords()
            logger.info(`${fileName} : total fetched records - ${records.length}`)
            // get next time slot using last date
            let startTime = Number(records[records.length - 1].closetime)
            logger.info(`${fileName} : updated start time for ${pair.symbol} - ${startTime}`)
            let endTime = startTime + global.pairs[pair.symbol].exchange.intervaltoMs(pair.interval)
            global.pairs[pair.symbol].startTime = startTime
            global.pairs[pair.symbol].endTime = endTime
        },
        isItTime: function (pair) {

            let currentTime = 0, tradeDay = null

            switch (pair.exchangeId) {
                case 'kucoin':
                    currentTime = moment().valueOf() / 1000
                    tradeDay = moment(pair.startTime * 1000)
                    break
                case 'binance':
                    currentTime = moment().valueOf()
                    tradeDay = moment(pair.startTime)
                    break
                default:
                    currentTime = moment().valueOf()
                    tradeDay = moment(pair.startTime)
                    break
            }

            logger.debug(`${fileName} :  ${pair.symbol}  :  ` + `Current Time - ${currentTime}`)
            logger.debug(`${fileName} :  ${pair.symbol}  :  ` + `Next Trade Time - ${pair.startTime}`)

            if (currentTime > pair.startTime) {
                logger.debug(`${fileName} :  ${pair.symbol}  :  ` + "YES! its time to trade")
                return true
            }

            logger.debug(`${fileName} :  ${pair.symbol}  :  ` + "its NOT time to trade")
            return false
        }
    }
}

