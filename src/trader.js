let path = require('path')

import moment from 'moment'
import { applyStrategy } from './strategies'
import { takeAction, checkPendingOrders } from './exchanges'
import { notify, reportError } from './notifiers'
import { logger } from './server/middlewares/index'
import { isItTime } from './timer'
import { sleep } from './utils/wait'
require('dotenv').config()

let fileName = path.basename(__filename)

//start trading
export async function startLoop() {
    try {
        logger.info(`Starting next loop at ${moment(Date.now()).format('DD/MM/YYYY HH:mm:ss')} `)
        //loop through all pairs
        console.log(Object.keys(global.pairs))
        await Promise.all(Object.keys(global.pairs).map(async (symbol) => {
            logger.debug(`${fileName} :  ${symbol}  :  ` + `Going for pair - ${symbol}`)
            logger.debug(`${fileName} :  ${symbol}  :  ` + "check existing order fulfillment")
            await checkPendingOrders(global.pairs[symbol])

            //check if its time to trade
            logger.debug(`${fileName} :  ${symbol}  :  ` + "checking its time to trade")
            if (isItTime(global.pairs[symbol]) && global.pairs[symbol].canTrade) {
                logger.debug(`${fileName} :  ${symbol}  :  ` + `it's trade time for ${symbol}`)
                logger.debug(`${fileName} :  ${symbol}  :  ` + "let's apply strategy and take trade decision")
                let tradeInfo = await applyStrategy(global.pairs[symbol])

                if (!tradeInfo) {
                    logger.debug(`${fileName} :  ${symbol}  :  ` + `nothing to process`)
                    return
                }

                logger.debug(`${fileName} :  ${symbol}  :  ` + `going to take ${tradeInfo.action} action now`)
                let result = await takeAction(tradeInfo)
                //  notify user about decision and results
                await notify(result)
            }
        }))
    } catch (err) {
        reportError(err)
    }
}



