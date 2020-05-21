const api = require('kucoin-node-api')
let path = require('path')
let fileName = path.basename(__filename)
import axios from 'axios'
import moment from 'moment'
import { logger } from '../server/middlewares'
require('dotenv').config()



class Kucoin {
    constructor() {
        const config = {
            apiKey: process.env.kucoin_API_KEY,
            secretKey: process.env.kucoin_SECRET,
            passphrase: process.env.kucoin_PASSWORD,
            environment: 'live'
        }

        api.init(config)
    }

    async placeOrder(symbol, side, quantity, price, type = "limit") {
        try {
            let params = {
                clientOid: Date.now(),
                side,
                symbol,
                type,
                price,
                size: quantity
            }
            console.log(params)
            return `fake-${side}-` + Date.now()
        } catch (err) {
            console.error(err)
            process.exit(1)
        }
    }

    async getOrders(params) {
        try {
            return await api.getOrders(params)
        } catch (err) {
            console.error(err)
        }
    }

    async getOrderbook(ticker) {
        try {
            return await api.getPartOrderBook({ amount: 20, symbol: ticker })
        } catch (err) {
            console.error(err)
        }
    }

    async isOrderComplete(orderId) {
        try {
            return true
        } catch (err) {
            console.error(err)
        }
    }

    async getBestPrice(ticker, side) {
        try {
            let url = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${ticker}`
            let response = await axios(url)
            let resp = await response.data
            if (resp.code != "200000") {
                return Error(JSON.stringify(resp))
            }
            if (side == 'BUY') {
                return resp.data.bestAsk
            } else {
                return resp.data.bestBid
            }

        } catch (err) {
            console.error(err)
        }
    }


    async  getAccounts() {
        try {
            const config = {
                apiKey: process.env.kucoin_API_KEY,
                secretKey: process.env.kucoin_SECRET,
                passphrase: process.env.kucoin_PASSWORD,
                environment: 'live'
            }

            api.init(config)

            let r = await api.getAccounts()
            console.log(r.data)
        } catch (err) {
            console.log(err)
        }
    }

    async candles({ symbol, interval, startTime, endTime }) {
        let url = `https://api.kucoin.com/api/v1/market/candles?type=${interval}&symbol=${symbol}&startAt=${startTime}&endAt=${endTime}`
        logger.info(`${fileName} : ` + "sending GET request")
        let response = await axios(url)
        let resp = await response.data
        console.log(JSON.stringify(resp))
        if (resp.code != "200000") {
            return Error(JSON.stringify(resp))
        }
        logger.info(`${fileName} : ` + "Fetched Candle data before processing")
        logger.info(`${fileName} : ` + resp.data)
        let data = await this.processCandlesData(resp.data, interval)
        logger.info(`${fileName} : ` + "Candle data after processing")
        logger.info(`${fileName} : ` + JSON.stringify(data))
        return data
    }

    calculateCloseTime(data, interval) {
        return Number(data[0]) + this.intervaltoMs(interval)
    }

    async processCandlesData(rawData, interval) {
        return await Promise.all(rawData.map(d => {
            return {
                "date": moment(d[0] * 1000).format('DD/MM/YYYY'),
                "opentime": d[0],
                "closetime": this.calculateCloseTime(d, interval),
                "open": d[1],
                "close": d[2],
                "high": d[3],
                "low": d[4],
                "volume": d[5],
            }
        }))
    }

    intervaltoMs(interval) {
        switch (interval) {
            case '1min':
                return 60
            case '3min':
                return 180
            case '5min':
                return 300
            case '15min':
                return 15 * 60
            case '30min':
                return 30 * 60
            case '1hour':
                return 60 * 60
            case '2hour':
                return 120 * 60
            case '4hour':
                return 240 * 60
            case '6hour':
                return 360 * 60
            case '8hour':
                return 480 * 60
            case '12hour':
                return 12 * 60 * 60
            case '1day':
                return 24 * 60 * 60
            case '1week':
                return 7 * 24 * 60 * 60
        }
    }
}

const kucoin = new Kucoin()
export default kucoin