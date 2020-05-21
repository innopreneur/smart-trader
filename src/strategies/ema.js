
export function calculateEMA(data, period) {
    //calculate initial EMA
    let sma_data = data.slice(0, period)
    //calculate SMA
    let initial_ema = sma(sma_data)
    let prev_ema = null
    let ema_data = data.reduce((output, point, i) => {
        if (i >= period) {
            if (i == period) {
                prev_ema = initial_ema
            }
            //calculate EMA
            let _ema = ema(point['close'], prev_ema, period)
            point['ema'] = _ema
            prev_ema = _ema
            output.push(point)
            return output
        } else {
            output.push(point)
            return output
        }
    }, [])
    return ema_data
}


export function sma(data) {
    let sum = data.reduce((a, b) => a + Number(b['close']), 0)
    return sum / data.length
}

export function ema(close, prev, period) {
    return ((Number(close) - Number(prev)) * (2 / (period + 1)) + Number(prev))
}


function emaCrossoverStrategy(lowerPeriod, highPeriod, candlePeriod, startDate, endDate, ticker) {
    //calculate Higher EMA
    //calculate Lower EMA
}
