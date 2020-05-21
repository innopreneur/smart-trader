import { GoogleSpreadsheet } from 'google-spreadsheet'
import { logger } from '../server/middlewares/logger'
require('dotenv').config()
let path = require('path')
let fileName = path.basename(__filename)

export default class Sheets {
    constructor(sheetIndex) {
        this.doc = new GoogleSpreadsheet(process.env.SHEET_ID)
        this.creds = {
            client_email: process.env.CLIENT_EMAIL,
            private_key: process.env.PRIV_KEY
        }
        this.authenticated = false
        this.sheet = null
        this.sheetIndex = sheetIndex
    }

    async auth() {
        try {
            await this.doc.useServiceAccountAuth(this.creds)
        } catch (err) {
            throw new Error(err)
        }
    }

    async getSheet() {
        try {

            //authenticate if not authenticated
            if (!this.authenticated) {
                await this.auth()
                logger.debug(`${fileName} : ` + "Authenticated")
            }

            //get spreadsheet info
            await this.doc.loadInfo()
            logger.debug(`${fileName} : ` + `title - ${this.doc.title}`)
            let sheet = this.doc.sheetsByIndex[this.sheetIndex]
            return sheet
        } catch (err) {
            console.error(err)
            throw new Error(err)
        }
    }


    async getRecordWithDate(date) {
        return new Promise(async (resolve, reject) => {
            try {

                let sheet = await this.getSheet()
                //get rows from sheet
                let rows = await sheet.getRows()

                //find the entry that we need
                let row = rows.find((_row) => {
                    return (_row.date === date)
                })

                if (row) {
                    resolve(row)
                } else {
                    resolve(404)
                }

            } catch (error) {
                logger.error("Error -" + error)
                resolve(500)
            }
        })
    }

    async getAllRecords() {
        let sheet = await this.getSheet()
        let rows = await sheet.getRows()
        return rows
    }

    async addRecord(data) {

        let sheet = await this.getSheet()

        let rowsBefore = await sheet.getRows()

        let added = await sheet.addRow(data)
        logger.debug(`${fileName} : ` + added)
        let rowsAfter = await sheet.getRows()

        if (added && rowsAfter.length == rowsBefore.length + 1)
            return 200

        return 500

    }


    //get the sheets info from spreadsheets
    async _getSheetsInfo() {
        return await this.doc.loadInfo()
    }

}