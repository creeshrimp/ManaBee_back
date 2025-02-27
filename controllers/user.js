import User from '../models/user.js'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

/**
 * 建立帳號
 * @param {Object} req 欲建立的 user data
 * @param {Object} res 建立結果
 */
export async function create(req, res) {
    try {
        const user = await User.create(req.body)
        res.status(StatusCodes.OK).json({
            success: true,
            message: '帳號建立成功',
            result: user,
        })
    } catch (error) {
        // 錯誤處理
        // 用 Object.values 取出 errors 物件中的第一個 value
        const firstError = Object.values(error.errors)[0]
        switch (error.name) {
            // MongoServerError 包含帳號重複
            case 'MongoServerError':
                if (error.code === 11000) {
                    res.status(StatusCodes.CONFLICT).json({
                        success: false,
                        message: '欄位重複',
                    })
                } else {
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: 'MongoServerError 其他錯誤',
                    })
                }
                break

            // model 驗證錯誤
            case 'ValidationError':
                res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: firstError.message,
                })
                break

            // 其他錯誤
            default:
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: '其他錯誤',
                })
                break
        }
    }
}

/**
 * 用req傳來的user做登入(派發 JWT token)，並回傳token與使用者資料。更新資料庫的tokens陣列
 * @returns  物件 - 包含token與使用者資料
 */
export async function login(req, res) {
    try {
        // req.user 是從 middleware/auth.js 裡傳過來的
        // 簽發jwt token
        const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, {
            expiresIn: '7 days',
        })
        // 存入tokens陣列
        req.user.tokens.push(token)
        // 更新 資料庫 user 的 tokens 陣列
        await User.findByIdAndUpdate(req.user._id, { tokens: req.user.tokens })

        // await req.user.save()

        // 登入成功，回覆 token 與使用者資料
        res.status(StatusCodes.OK).json({
            success: true,
            message: '',
            result: {
                token,
                username: req.user.username,
            },
        })
    } catch (error) {
        console.log('controllers/user.js:', error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'serverError',
        })
    }
}
