let path = require('path')
let fileName = path.basename(__filename)
import { ema as calcEMA } from './ema'
import { reportError } from '../notifiers'
import { logger } from '../server/middlewares'
import Sheet from '../recorders/gsheets'

export async function applyStrategy(pair) {
    switch (pair.strategy) {
        case 'ema':
            logger.info(`${fileName} : ` + `strategy ${pair.strategy} matched`)
            return await applyEMA(pair)
        default:
            return await applyEMA(pair)
    }
}

async function applyEMA(pair) {
    let { symbol, interval, startTime, endTime } = pair

    logger.info(`${fileName} : ` + "getting candles for " + symbol + " and startTime [" + startTime + "] and endTime [" + endTime + "]")
    let candles = await pair.exchange.candles({ symbol, interval, startTime, endTime })
    let { close } = candles[candles.length - 1]

    //perform action if any
    let sheet = new Sheet(pair.sheetIndex)
    let records = await sheet.getAllRecords()
    console.log(close, " : ", records[records.length - 1].ema, " : ", pair.options.emaPeriod)
    let ema = calcEMA(close, records[records.length - 1].ema, pair.options.emaPeriod)
    logger.info(`${fileName} : ` + `calculated EMA for ${symbol} is ${ema}`)


    let { position, size } = records[records.length - 1]

    let decision = {}

    if (close > ema && position > 0 && size == 0) {
        logger.info(`${fileName} : ` + `calculated Action for ${symbol} is BUY`)
        decision.action = 'BUY'
    } else if (close > ema && position == 0 && size > 0) {
        logger.info(`${fileName} : ` + `calculated Action for ${symbol} is HOLD`)
        decision.action = 'HOLD'
    } else if (close <= ema && position == 0 && size > 0) {
        logger.info(`${fileName} : ` + `calculated Action for ${symbol} is SELL`)
        decision.action = 'SELL'
    } else if (close <= ema && position > 0 && size == 0) {
        logger.info(`${fileName} : ` + `calculated Action for ${symbol} is OUT`)
        decision.action = 'OUT'
    } else {
        logger.error(`${fileName} : ` + `calculated EMA Action for ${symbol} is ERROR`)
        decision.action = 'ERROR'
        await reportError(`
        message - ${fileName} : EMA Action for ${symbol} is ERROR
        pair id  - ${pair.id.substring(0, 5)}... 
        close - ${close}
        ema - ${ema}
        postion - ${position}
        size - ${size}
         `)
    }

    decision = { ...pair, ...candles[candles.length - 1], ...decision }
    decision.position = position
    decision.size = size
    decision.ema = ema

    return decision

}