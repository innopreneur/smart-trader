import Binance from 'binance-api-node'
require('dotenv').config()

// Authenticated client, can make signed calls
const binance = Binance({
    apiKey: process.env.binance_API_KEY,
    apiSecret: process.env.binance_SECRET
})

binance.getBestPrice = async function (symbol, side) {
    let tickers = await binance.allBookTickers()
    if (side == 'BUY') {
        return tickers[symbol].askPrice
    } else {
        return tickers[symbol].bidPrice
    }
}

binance.placeOrder = async function (symbol, side, quantity, price, type = "MARKET") {
    return await binance.orderTest({
        symbol,
        side,
        quantity,
        price,
        type
    })
}

binance.isOrderComplete = async function (symbol, orderId) {
    let order = binance.getOrder({
        symbol,
        orderId
    })

    if (order.status == "FILLED") {
        return true
    }
    return false

}

binance.intervaltoMs = function (interval) {
    switch (interval) {
        case '1m':
            return 60000
        case '3m':
            return 180000
        case '5m':
            return 300000
        case '15m':
            return 15 * 60000
        case '30m':
            return 30 * 60000
        case '1h':
            return 60 * 60000
        case '2h':
            return 120 * 60000
        case '4h':
            return 240 * 60000
        case '6h':
            return 360 * 60000
        case '8h':
            return 480 * 60000
        case '12h':
            return 12 * 60 * 60000
        case '1d':
            return 24 * 60 * 60000
        case '3d':
            return 3 * 24 * 60 * 60000
        case '1w':
            return 7 * 24 * 60 * 60000
        case '1M':
            return 30 * 24 * 60 * 60000
    }
}

binance.getBalance = async function (currency) {
    let { balances } = await binance.accountInfo()
    let found = balances.filter(bal => bal.asset == currency)
    return found[0].free
}

export default binance