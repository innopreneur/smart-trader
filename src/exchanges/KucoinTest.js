const api = require('kucoin-node-api')
let path = require('path')
import hmacSHA256 from 'crypto-js/hmac-sha256'
import Base64 from 'crypto-js/enc-base64'
let fileName = path.basename(__filename)
import axios from 'axios'
import moment from 'moment'
import { logger } from '../server/middlewares'
import { reportError } from '../notifiers'
require('dotenv').config()



class Kucoin {
    constructor() {
        const config = {
            apiKey: process.env.kucoin_API_KEY,
            secretKey: process.env.kucoin_SECRET,
            passphrase: process.env.kucoin_PASSWORD,
            environment: 'live'
        }
        this.name = process.env.kucoin_NAME
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
            reportError(err)
            process.exit(0)
        }
    }

    async getOrders(params) {
        try {
            return await api.getOrders(params)
        } catch (err) {
            reportError(err)
        }
    }

    async getOrderbook(ticker) {
        try {
            return await api.getPartOrderBook({ amount: 20, symbol: ticker })
        } catch (err) {
            reportError(err)
        }
    }

    async isOrderComplete(orderId) {
        try {
            return true
        } catch (err) {
            reportError(err)
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
            reportError(err)
        }
    }

    async testMethodToSign() {

        let endpoint = `/api/v1/sub-accounts`
        let url = `https://api.kucoin.com` + endpoint
        logger.info(`${fileName} : ` + "getting sub-accounts")
        let timestamp = Date.now()
        let headers = {
            "KC-API-KEY": process.env.kucoin_API_KEY,
            "KC-API-SIGN": this.sign(timestamp, endpoint, 'GET', ""),
            "KC-API-PASSPHRASE": process.env.kucoin_PASSWORD,
            "KC-API-TIMESTAMP": timestamp
        }

        let response = await axios(url, { headers })
        let resp = await response.data
        console.log(JSON.stringify(resp))
        if (resp.code != "200000") {
            return Error(JSON.stringify(resp))
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

    async  getBalance(currency = null) {
        let resp = await api.getAccounts()
        if (resp.code != "200000") {
            return Error(JSON.stringify(resp))
        }
        let accounts = resp.data
        console.log(accounts)
        let balances = accounts.filter(acct => acct.currency == currency)
        if (balances.length > 0) {
            return balances[0].available
        } else {
            return 0
        }

    }

    sign(timestamp, endpoint, method, body) {
        let messageToSign = timestamp + method + endpoint + body
        return Base64.stringify(hmacSHA256(messageToSign, process.env.kucoin_SECRET));
    }
}

const kucoin = new Kucoin()
export default kucoin