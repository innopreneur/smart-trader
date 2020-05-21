import { sendMessage } from './messenger'


export async function notify(result) {
    let { action, symbol, size, price, exchangeId } = result

    await sendMessage(`
    ---- SMART-TRADER ----
    [ ${action} -  ${symbol}]
    Price - ${price}
    New Size - ${size}
    New Position - ${size * price}
    Exchange - ${exchangeId}
    `)
}


export async function reportError(message) {
    await sendMessage(`
    ---- SMART-TRADER ----
    [ ERROR REPORT]
    ${message}
    `)
}