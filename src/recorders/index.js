import Sheet from './gsheets'


export async function updateRecord(tradeInfo) {
    let sheet = new Sheet(tradeInfo.sheetIndex)
    return await sheet.addRecord(tradeInfo)
}

export async function addPairConfig(config) {
    let sheet = new Sheet(0)
    return await sheet.addRecord(config)
}

export async function getPairConfig() {
    let sheet = new Sheet(0)
    return await sheet.getAllRecords()
}