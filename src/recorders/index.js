import Sheet from './gsheets'
import { reportError } from '../notifiers'

export async function updateRecord(tradeInfo) {
    //let sheet = new Sheet(tradeInfo.sheetIndex)
    let sheet = new Sheet(1)
    if (await shouldAddThisRecord(sheet, tradeInfo)) {
        return await sheet.addRecord(tradeInfo)
    }
    return null
}

export async function addPairConfig(config) {
    let sheet = new Sheet(0)
    return await sheet.addRecord(config)
}

export async function getPairConfig() {
    let sheet = new Sheet(0)
    return await sheet.getAllRecords()
}

async function shouldAddThisRecord(sheet, record) {
    let records = await sheet.getAllRecords()
    let prevCloseTime = records[records.length - 1].closetime
    if (prevCloseTime !== record.opentime) {
        await reportError(
            `Previous closetime [${prevCloseTime} doesn't match current opentime [${record.opentime}] ]`)
        return false
    }
    return true
}