import { v4 as uuidv4 } from 'uuid'
import { logger } from './logger'


export function requestInterceptor(req, res, next) {
    //assign a custom id to request to match with response
    req.custId = uuidv4().replace(/-/g, '')
    let remoteIP = getClientIp(req) != "" ? getClientIp(req) : "localhost"
    switch (req.method) {

        case 'GET':
            logger.info(`REQ || ${remoteIP} || ${req.custId} || ${req.method} || ${JSON.stringify(req.headers)} || ${JSON.stringify(req.query)} `)
            break
        case 'DELETE':
            logger.info(`REQ || ${remoteIP} || ${req.custId} || ${req.method} || ${JSON.stringify(req.headers)} || ${JSON.stringify(req.query)} `)
            break
        default:
            logger.info(`REQ || ${remoteIP} || ${req.custId} || ${req.method} || ${JSON.stringify(req.headers)} || ${JSON.stringify(req.body)} `)
    }
    next()
}

export function responseInterceptor(arg, req, res, next) {
    let remoteIP = getClientIp(req) ? getClientIp(req) : "localhost"
    logger.info(`RESP || ${remoteIP} || ${req.custId} || ${arg.code} || ${JSON.stringify(arg.message)} `)
    return res.status(arg.code).json(arg.message)
}



const getClientIp = (req) => {
    let ipAddress
    // The request may be forwarded from local web server.
    let forwardedIpsStr = req.header('x-forwarded-for')
    if (forwardedIpsStr) {
        // 'x-forwarded-for' header may return multiple IP addresses in
        // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
        // the first one
        let forwardedIps = forwardedIpsStr.split(',')
        ipAddress = forwardedIps[0]
    }
    if (!ipAddress) {
        // If request was not forwarded
        ipAddress = req.connection.remoteAddress
    }
    return ipAddress
}
