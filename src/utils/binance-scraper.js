import { sortBy } from 'lodash'
import axios from 'axios'
import { sleep } from './wait'
import { saveFile } from './file'

let limit = 1000

async function getCandlesData(period, startDate, endDate, ticker) {
    let endTime = null
    if (!endDate) {
        endTime = Date.now()
    } else {
        endTime = (new Date(endDate)).getTime()
    }
    let startTime = (new Date(startDate)).getTime()
    console.log('Start - ', startTime)
    console.log('End - ', endTime)
    let candlePeriodInMs = intervaltoMs(period)
    let timeData = getTimePages(startTime, endTime, candlePeriodInMs, limit)
    //loop through all timeslots and get data
    let j = 0
    let candleData = []

    while (timeData.length > j) {
        console.log(`Scraping ${j + 1}/${timeData.length} candle pages`)
        let klines = await getBinanceData(period, timeData[j].startTime, timeData[j].endTime, ticker)
        candleData = candleData.concat(klines)
        j++
        await sleep(1)
    }
    //array of objects {Open time, Open, Close, High, Low, Volume, Close time, Quote asset volume, # of trades, Taker buy base asset volume, Taker buy quote asset volume, ignore }
    let dataAsArrOfObj = await processCandlesData(candleData)
    //save data to disk
    saveFile(`${process.cwd()}/src/data/binance-${ticker}-${period}-${startTime}-to-${endTime}.csv`, JSON.stringify(dataAsArrOfObj, null, 4))
    return dataAsArrOfObj

}

function sortData(data) {
    return sortBy(data, [function (o) { return o[0] }]);
}


async function processCandlesData(rawData) {
    return await Promise.all(rawData.map(d => {
        return {
            "timestamp": d[0],
            "open": d[1],
            "close": d[2],
            "high": d[3],
            "low": d[4],
            "volume": d[5],
            "closeTime": d[6],
            "quoteAssetVolume": d[7],
            "noOfTrades": d[8],
            "takerBuyBaseAssetVolume": d[9],
            "takerBuyQuoteAssetVolume": d[10]
        }
    }))
}

async function getBinanceData(period, startTime, endTime, ticker) {
    try {
        let url = `https://api.binance.com/api/v3/klines?symbol=${ticker}&interval=${period}&startTime=${startTime}&endTime=${endTime}&limit=${limit}`
        let response = await axios(url)
        let resp = await response.data
        return resp
    } catch (err) {
        if (!err.message.includes('ENOTFOUND')) {
            console.error(`No data for period [${period}] between [${startTime}] and [${endTime}]`)
        } else {
            console.error(err)
        }
    }
}

function getTimePages(startTime, endTime, candlePeriodInMs, limit) {

    let timePerPage = limit * candlePeriodInMs
    let timeArr = []
    let i = 0
    while (startTime + (timePerPage * i) < endTime) {
        timeArr.push({
            page: i + 1,
            startTime: startTime + (timePerPage * i),
            endTime: startTime + (timePerPage * (i + 1))
        })
        i++
    }
    return timeArr
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
export { getCandlesData, getTimePages }
