/* logging middleware */
import { createLogger, format, transports } from 'winston';
import fs from 'fs';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const logDir = 'logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const filename = path.join(logDir, `${Date.now()}.log`);

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
    new transports.File({ stream: fs.createWriteStream(filename, { flags: 'a' }) })
  ]
});

export { logger };