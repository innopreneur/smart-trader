import { sortBy } from 'lodash'
import Kucoin from '../exchanges/Kucoin'



let kucoin = new Kucoin()

async function getCandlesData(period, startDate, endDate, ticker) {
    let endDateInSeconds = null
    if (!endDate) {
        endDateInSeconds = parseInt(Date.now() / 1000)
    } else {
        endDateInSeconds = parseInt((new Date(endDate)).getTime() / 1000)
    }
    let startDateInSeconds = parseInt((new Date(startDate)).getTime() / 1000)
    console.log('Start - ', startDateInSeconds)
    console.log('End - ', endDateInSeconds)
    let klines = await kucoin.getKlineCandles(period, startDateInSeconds, endDateInSeconds, ticker)
    let data = sortData(klines)
    //array of objects {timestamp, Open, Close, High, Low, Volume, Turnover]
    return await processCandlesData(data)
}

function sortData(data) {
    return sortBy(data, [function (o) { return o[0] }]);
}

function calculateCloseTime(data, interval) {
    return data[0] + intervaltoMs(interval)
}

async function processCandlesData(rawData, interval) {
    return await Promise.all(rawData.map(d => {
        return {
            "opentime": d[0],
            "closetime": calculateCloseTime(d, interval),
            "open": d[1],
            "close": d[2],
            "high": d[3],
            "low": d[4],
            "volume": d[5],
        }
    }))
}

function intervaltoMs(interval) {
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

export { getCandlesData }
