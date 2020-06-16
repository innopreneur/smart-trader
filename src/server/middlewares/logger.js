/* logging middleware */
import { createLogger, format, transports } from 'winston'
require('winston-daily-rotate-file')
import fs from 'fs'
import moment from 'moment'
import path from 'path'

const env = process.env.NODE_ENV || 'development'
const logDir = 'logs'

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const filename = path.join(logDir, `SmartTrader-${moment().utc().format('DD-MM-YYYY_HH-mm')}.log`)

var transport = new transports.DailyRotateFile({
  filename,
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '50m',
  maxFiles: '14d'
});

transport.on('rotate', function (oldFilename, newFilename) {
  // do something fun
});

const logger = createLogger({
  // change level if in dev environment versus production
  level: env === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} BoxT ${info.level}: ${info.message}`)
  ),
  // You can also comment out the line above and uncomment the line below for JSON format
  //format: format.json(),
  transports: [
    new transports.Console({
      level: env === 'development' ? 'debug' : 'info',
      format: format.combine(
        format.colorize(),
        format.printf(info => `${info.timestamp} SmartTrader ${info.level}: ${info.message}`)
      )
    }),
    transport
  ]
})

export { logger }