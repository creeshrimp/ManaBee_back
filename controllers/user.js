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
                userId: req.user._id,
                gender: req.user.gender,
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
/**
 * 登出，會自己抓header的token
 * @returns
 */
export async function logout(req, res) {
    try {
        const idx = req.user.tokens.findIndex((token) => token === req.token)
        req.user.tokens.splice(idx, 1)
        // 更新 資料庫 user 的 tokens 陣列
        await User.findByIdAndUpdate(req.user._id, { tokens: req.user.tokens })
        res.status(StatusCodes.OK).json({
            success: true,
            message: '',
        })
    } catch (error) {
        console.log('controllers/user.js:', error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'serverError',
        })
    }
}

/**
 * 取得使用者資料
 */
export async function profile(req, res) {
    res.status(StatusCodes.OK).json({
        success: true,
        message: '',
        result: {
            username: req.user.username,
            userId: req.user._id,
            gender: req.user.gender,
            learningSkills: req.user.learningSkills,
            teachingSkills: req.user.teachingSkills,
            introduction: req.user.introduction,
        },
    })
}

export async function getAllProfiles(req, res) {
    try {
        // 從資料庫查詢所有使用者，只挑選必要的欄位
        const users = await User.find(
            {},
            '_id username gender learningSkills teachingSkills introduction',
        )
        res.status(StatusCodes.OK).json({
            success: true,
            message: '',
            result: users,
        })
    } catch (error) {
        console.error('getAllProfiles error:', error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: '取得所有個人資料失敗',
        })
    }
}

export async function updateProfile(req, res) {
    try {
        const { username, learningSkills, teachingSkills, introduction } = req.body

        // 輔助函式：將技能陣列中每個元素轉換成 { name, descriptions }
        const normalizeSkills = (skills) => {
            if (!Array.isArray(skills)) return []
            return skills.map(
                (skill) => (typeof skill === 'string' ? { name: skill, descriptions: '' } : skill), // 假設已經是物件的就直接使用
            )
        }

        // 建立要更新的資料物件
        const updateData = {}
        if (username !== undefined) updateData.username = username
        if (learningSkills !== undefined)
            updateData.learningSkills = normalizeSkills(learningSkills)
        if (teachingSkills !== undefined)
            updateData.teachingSkills = normalizeSkills(teachingSkills)
        if (introduction !== undefined) updateData.introduction = introduction

        // 使用 findByIdAndUpdate 更新，並回傳新的文件
        const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
            new: true,
            runValidators: true,
        })

        res.status(StatusCodes.OK).json({
            success: true,
            message: '個人資料更新成功',
            result: {
                username: updatedUser.username,
                userId: updatedUser._id,
                gender: updatedUser.gender,
                learningSkills: updatedUser.learningSkills,
                teachingSkills: updatedUser.teachingSkills,
                introduction: updatedUser.introduction,
            },
        })
    } catch (error) {
        console.log('updateProfile error:', error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: '更新失敗',
        })
    }
}
