let path = require('path')
let fileName = path.basename(__filename)
import kucoin from './KucoinTest'
import binance from './Binance'
import { updateRecord } from '../recorders'
import { updateTradeTimes } from '../timer'
import { remove } from 'lodash'
import { logger } from '../server/middlewares'

export async function takeAction(decision) {
    let { exchange, exchangeId, action, symbol, position, size } = decision
    switch (action) {
        case 'BUY':
            logger.info(`${fileName} : ` + `get best BUY price at Exchange - ${exchangeId}`)
            let buyPrice = await exchange.getBestPrice(symbol, 'BUY')
            // calculate quantity and price
            let quantity = position / buyPrice
            // place buy order
            logger.info(`${fileName} : ` + `placing BUY order at Exchange - ${exchangeId}`)
            let buyOrderId = await exchange.placeOrder(symbol, 'BUY', quantity, buyPrice)
            if (!buyOrderId) {
                logger.error(`${fileName} : ` + `Something went wrong while BUYing ${symbol}`)
                throw new Error(`Something went wrong while BUYing ${symbol}`)
            }

            await updateTradeTimes(global.pairs[symbol])
            logger.debug(`${fileName} : ` + `updated next start time to [${global.pairs[symbol].startTime}]`)
            global.pairs[symbol].canTrade = false
            logger.debug(`${fileName} : ` + `trading flag turned OFF for pair - ${symbol}`)
            let buyTradeInfo = { ...decision, size: quantity, price: buyPrice, orderId: buyOrderId, position: 0 }
            logger.debug(`${fileName} : ` + `added orderId ${buyOrderId} to tradeInfo for pair - ${symbol}`)
            logger.debug(`${fileName} : ` + `added trade info for pair - ${symbol}`)
            global.pairs[symbol].orders.push(buyTradeInfo)
            return buyTradeInfo

        case 'SELL':
            logger.info(`${fileName} : ` + `get best SELL price at Exchange - ${exchangeId}`)
            let sellPrice = await exchange.getBestPrice(symbol, 'SELL')
            // place sell order
            logger.info(`${fileName} : ` + `placing SELL order at Exchange - ${exchangeId}`)
            let sellOrderId = await exchange.placeOrder(symbol, 'SELL', size, sellPrice)
            if (!sellOrderId) {
                logger.error(`${fileName} : ` + `Something went wrong while SELLing ${symbol}`)
                throw new Error(`Something went wrong while SELLing ${symbol}`)
            }
            //update position value
            position = sellPrice * size

            logger.debug(`${fileName} : ` + `trading flag turned OFF for pair - ${symbol}`)
            global.pairs[symbol].canTrade = false
            logger.debug(`${fileName} : ` + `added orderId ${sellOrderId} to trade info for pair - ${symbol}`)
            let sellTradeInfo = { ...decision, size: 0, position, orderId: sellOrderId }
            global.pairs[symbol].orders.push(sellTradeInfo)
            return sellTradeInfo

        default:
            logger.info(`${fileName} : ` + `doing nothing for action [${action}] for pair [${symbol}] and exchange [${exchangeId}]`)
            logger.info(`${fileName} : ` + `updating record in spreadsheet`)
            await updateRecord(decision)
            await updateTradeTimes(global.pairs[symbol])
            logger.debug(`${fileName} : ` + `updated next start time to [${global.pairs[symbol].startTime}]`)
            return decision
    }
}

export function intializeExchange(exchangeId) {
    switch (exchangeId) {
        case 'kucoin':
            return kucoin
        case 'binance':
            return binance
        default:
            return binance
    }
}

export async function checkPendingOrders(pair) {
    await Promise.all(pair.orders.map(async tradeInfo => {
        logger.info(`${fileName} : ` + `Check status of order - ${tradeInfo.orderId}`)
        let isOrderFilled = await pair.exchange.isOrderComplete(tradeInfo.orderId)
        console.log(isOrderFilled)
        if (isOrderFilled) {
            logger.info(`${fileName} : ` + `order [${tradeInfo.orderId}] is complete`)
            //remove order from list
            logger.debug(`${fileName} : ` + `orders for ${pair.symbol} before removal`)
            logger.debug(global.pairs[pair.symbol].orders)
            let removedItems = remove(global.pairs[pair.symbol].orders, (info) => {
                return tradeInfo.orderId == info.orderId
            })
            logger.debug(`${fileName} : ` + `removed ${JSON.stringify(removedItems)}`)
            //check if actually removed
            if (removedItems.length != 1) {
                throw Error(`unable to remove order [${tradeInfo.orderId}] for ${pair.symbol} after order fulfillment`)
            }
            logger.debug(`${fileName} : ` + `${tradeInfo.orderId} removed from order list`)
            logger.debug(`${fileName} : ` + `orders for ${tradeInfo.symbol} after removal`)
            logger.debug(global.pairs[pair.symbol].orders)
            logger.debug(`${fileName} : ` + `now pair ${tradeInfo.symbol} can trade again`)
            global.pairs[tradeInfo.symbol].canTrade = true
            logger.info(`${fileName} : ` + `update record in spreadsheet`)
            await updateRecord(tradeInfo)
            logger.info(`${fileName} : ` + "updated trade record in tradebook")
            await updateTradeTimes(global.pairs[tradeInfo.symbol])
            logger.debug(`${fileName} : ` + `updated next start time to [${global.pairs[tradeInfo.symbol].startTime}]`)
        }
    }))
}