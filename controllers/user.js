import User from '../models/user.js'
import { StatusCodes } from 'http-status-codes'
import validator from 'validator'

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
                        message: '帳號重複',
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
