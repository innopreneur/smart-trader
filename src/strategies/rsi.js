

export function calculateRSI(data, period) {
    //classify data points into gains and losses
    let { gains, losses } = classifyGainsAndLosses(data)

    let rsi_data = data.reduce((output, point, i) => {
        //calculate RS

        if (i >= period) {
            if (i == period) {
                prev_ema = initial_ema
            }
            //calculate EMA
            let _ema = ema(point['close'], prev_ema, period)
            console.log('EMA - ', _ema)
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


export function rsi(data, period) {
    let rs = calculateRS(data, period)
    console.log(`RS - `, rs)
    let rsi = 100 - (100 / (1 + rs))
    console.log(`RSI - `, rsi)
}

function classifyGainsAndLosses(data) {
    let i = 1, gains = [], losses = []
    while (data.length > i) {
        let diff = data[i].close - data[i - 1].close
        if (diff > 0) {
            gains.push(data[i])
        } else if (diff < 0) {
            losses.push(data[i])
        }
        i++
    }
    return { gains, losses }
}

function calculateRS(candle, gains, losses, period) {
    // get relevant gains
    gains.map()
    let sumGains = 0, sumLosses = 0, i = data.length, g = 0, l = 0
    while (data.length > i
        && (g < period || l < period)) {

        let diff = data[i].close - data[i - 1].close
        if (diff < 0) {
            sumGains += diff
            g++
        } else {
            sumLosses += (diff * -1)
            l++
        }
        i++
    }
    let avgGains = sumGains / (data.length - 1)
    let avgLosses = sumLosses / (data.length - 1)
    return avgGains / avgLosses
}
