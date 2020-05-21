
/****************************************|
 * ********    BACKTESTS   *******************
 * ***************************************
 ****************************************/

export async function simulateEMALongs(data, initialFunds) {
    let tradeStates = { LONG: 'long', SHORT: 'short', OUT: 'out' }
    let inTrade = tradeStates.OUT

    let size = 0
    let currentFunds = initialFunds
    let results = await Promise.all(data.map((point, i) => {
        //skip till we have EMA
        if (point['ema']) {
            // CLOSE > EMA 
            if (point['close'] > point['ema']) {
                //position = "out" => BUY
                if (inTrade == tradeStates.OUT) {
                    //BUY
                    size = currentFunds / point['close']
                    currentFunds = 0
                    point['action'] = 'BUY'
                    inTrade = tradeStates.LONG

                } else if (inTrade == tradeStates.LONG) {
                    //HOLD if already bought
                    point['action'] = 'HOLD'
                }

                //CLOSE < EMA
            } else if (point['close'] <= point['ema']) {

                if (inTrade == tradeStates.LONG) {
                    //SELL
                    currentFunds = size * point['close']
                    size = 0
                    point['action'] = 'SELL'

                    //check if the trade was bad
                    if (currentFunds < initialFunds) {
                        point['result'] = 'BAD'
                    } else {
                        point['result'] = 'GOOD'
                    }

                    inTrade = tradeStates.OUT
                } else if (inTrade == tradeStates.OUT) {
                    //stay 'OUT' of trade
                    point['action'] = 'OUT'
                }
            }
        } else {
            // ema at 0
            point['ema'] = 0
            point['action'] = 'OUT'
        }

        point['position'] = currentFunds
        point['size'] = size

        if (!point['result']) {
            point['result'] = ""
        }

        //funds at any day
        if (size > 0) {
            point['current'] = point['close'] * point['size']
        } else {
            point['current'] = currentFunds
        }
        return point

    }))

    return results
}

export async function simulateEMAShorts(data, initialFunds) {
    let tradeStates = { LONG: 'long', SHORT: 'short', OUT: 'out' }
    let inTrade = tradeStates.OUT
    let size = 0
    let currentFunds = 0
    let results = await Promise.all(data.map((point, i) => {
        //skip till we have EMA
        if (point['ema']) {
            // CLOSE > EMA 
            if (point['close'] >= point['ema']) {
                //position = "out" => BUY
                if (inTrade == tradeStates.SHORT) {
                    //BUY
                    currentFunds = size * point['close']
                    size = 0
                    point['action'] = 'BUY'
                    inTrade = tradeStates.OUT
                } else if (inTrade == tradeStates.OUT) {
                    //stay OUT if already OUT
                    point['action'] = 'OUT'
                }

                //CLOSE < EMA
            } else if (point['close'] < point.ema) {
                //position = "out" => SELL
                if (inTrade == tradeStates.OUT) {
                    //set the initial max budget
                    if (initialFunds > 0) {
                        size = initialFunds / point['close']
                        initialFunds = 0
                    } else {
                        //SELL to SHORT
                        size = currentFunds / point['close']
                        currentFunds = 0
                    }

                    point['action'] = 'SELL'
                    inTrade = tradeStates.SHORT
                } else if (inTrade == tradeStates.SHORT) {
                    //stay in 'HOLD' position
                    point['action'] = 'HOLD'
                }
            }
        } else {
            // ema at 0
            point['ema'] = 0
            point['action'] = 'OUT'
        }

        point['position'] = currentFunds
        point['size'] = size

        //funds at any day
        if (size > 0) {
            point['current'] = point['close'] * point['size']
        } else {
            point['current'] = currentFunds
        }

        return point

    }))

    return results
}

export async function simulateEMALongShort(data, initialFunds) {
    let tradeStates = { LONG: 'long', SHORT: 'short', OUT: 'out' }
    let inTrade = tradeStates.OUT
    let size = 0
    let currentFunds = 0
    let results = await Promise.all(data.map((point, i) => {
        //skip till we have EMA
        if (point['ema']) {
            // CLOSE > EMA 
            if (point['close'] >= point['ema']) {
                //position = "out" => BUY
                if (inTrade == tradeStates.SHORT) {
                    //BUY
                    currentFunds = size * point['close']
                    size = 0
                    point['action'] = 'BUY'
                    inTrade = tradeStates.OUT
                } else if (inTrade == tradeStates.OUT) {
                    //stay OUT if already OUT
                    point['action'] = 'OUT'
                }

                //CLOSE < EMA
            } else if (point['close'] < point.ema) {
                //position = "out" => SELL
                if (inTrade == tradeStates.OUT) {
                    //set the initial max budget
                    if (initialFunds > 0) {
                        size = initialFunds / point['close']
                        initialFunds = 0
                    } else {
                        //SELL to SHORT
                        size = currentFunds / point['close']
                        currentFunds = 0
                    }

                    point['action'] = 'SELL'
                    inTrade = tradeStates.SHORT
                } else if (inTrade == tradeStates.SHORT) {
                    //stay in 'HOLD' position
                    point['action'] = 'HOLD'
                }
            }
        } else {
            // ema at 0
            point['ema'] = 0
            point['action'] = 'OUT'
        }

        point['position'] = currentFunds
        point['size'] = size

        //funds at any day
        if (size > 0) {
            point['current'] = point['close'] * point['size']
        } else {
            point['current'] = currentFunds
        }

        return point

    }))

    return results
}