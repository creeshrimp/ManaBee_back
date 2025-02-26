import passport from '../passport/strategies.js'
import { StatusCodes } from 'http-status-codes'
import jsonwebtoken from 'jsonwebtoken'
import { session } from 'passport'

/**
 * 驗證用的 middleware req res next 從 router傳來
 * (err, user, info) 從 passport/strategies.js 的 done(err, user, info) 傳來
 */
function localLogin(req, res, next) {
    passport.authenticate('localLogin', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'localLogin auth error: ' + err,
            })
        }
        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'localLogin auth error: ' + info.message,
            })
        }
        // 傳給後續的controller用
        req.user = user
        next()
    })(req, res, next)
}

/**
 *
 * (error, data, info) 從 passport/strategies.js 的 done(error, data, info) 傳來
 */
function jwt(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, data, info) => {
        console.log('middleware/auth.js:', err, data, info)
        if (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'jwt auth error: ' + err,
            })
        }
        if (!data) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'jwt auth error: ' + info.message,
            })
        }
        // 傳給後續的controller用
        req.user = data.user
        req.token = data.token
        next()
    })(req, res, next)
}
export { localLogin, jwt }
