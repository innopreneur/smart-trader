import { remove, findIndex } from 'lodash'

export function checkIfPairExists(symbol) {
    return findIndex(global.pairs, { symbol })
}

// remove exisiting trading pair
export function removePair(symbol) {
    if (global.pairs[symbol]) {
        delete global.pairs[symbol]
    }
    ƒ
    if (global.pairs[symbol]) {
        return { code: 500, message: `couldn't remove pair - ${symbol}` }
    } else {
        return { code: 200, message: global.pairs }
    }
}