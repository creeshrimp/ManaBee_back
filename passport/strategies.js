import passport from '../passport/strategies.js'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

import User from './models/user.js'
import bcrypt from 'bcrypt'

// 定義驗證策略

// 本地登入驗證
const loginStrategy = new LocalStrategy(
    {
        // 設定分別要用 req(請求) 裡的哪個欄位當帳號，哪個欄位當密碼
        // 預設為 username 與 password
        usernameField: 'account',
        passwordField: 'password',
    },
    async (account, password, done) => {
        try {
            // 查詢有沒有符合帳號的使用者
            const user = await User.findOne({ account: account })
            // 找不到使用者
            if (!user) {
                return done(null, false, { message: '找不到使用者' })
            }
            // 密碼錯誤
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, { message: '密碼錯誤' })
            }
            // 驗證成功
            // done(錯誤訊息, 資料資料, 驗證失敗訊息)
            return done(null, user)
        } catch (error) {
            console.error('loginStrategy error: ' + error)
            return done(error)
        }
    },
)

// 編寫 jwt 驗證方式
const jwtStrategy = new JwtStrategy(
    {
        // jwt 的位置
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        // secret
        secretOrKey: process.env.JWT_SECRET,

        // 讓後面的function能使用req
        passReqToCallback: true,

        // 允許過期的 jwt 通過(在下方手動檢查過期)
        ignoreExpiration: true,
    },
    async (req, payload, done) => {
        try {
            // 因為沒有提供原始的 jwt 所以用套件語法取得
            // const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req)
            // 自行取得token
            const token = req.get('Authorization').replace('Bearer ', '')

            // 手動檢查過期
            const expired = payload.exp * 1000 < new Date().getTime()

            // 請求路徑
            const url = req.baseUrl + req.path
            // 只有 refresh 和 logout 允許過期的 jwt
            if (expired && url !== '/user/refresh' && url !== '/user/logout') {
                return done(null, false, { message: 'expired token and bad request url' })
            }

            // 用解碼的資料查詢有沒有使用者
            const user = await User.findById(payload._id)
            if (!user) {
                return done(null, false, { message: 'userNotFound' })
            }
            // 找到使用者後，檢查資料庫有沒有這個 jwt
            if (!user.tokens.includes(token)) {
                return done(null, false, { message: 'userTokenInvalid' })
            }
            // 完成驗證方式，將資料帶入下一步處理
            return done(null, { user, token })
        } catch (error) {
            console.error('jwtStrategy error: ' + error)
            return done(error)
        }
    },
)

// 掛載定義好的驗證策略
passport.use('localLogin', loginStrategy)
passport.use('jwt', jwtStrategy)

export default passport
