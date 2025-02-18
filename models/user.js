import { Schema, model, ObjectId, Error } from 'mongoose'
import validator, { trim } from 'validator'
// import bcrypt from 'bcrypt'

// import UserRoles from '../enums/UserRoles.js'

// User Schema
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, '帳號不可為空'],
            unique: true,
            trim: true,
            minlength: [4, '帳號最少為 4 個字'],
            maxlength: [20, '帳號最多為 20 個字'],
            validate: {
                validator: (value) => validator.isAlphanumeric(value),
                message: '帳號只能包含字母與數字',
            },
        },
        password: {
            type: String,
            required: [true, '密碼不可為空'],
            minlength: [8, '密碼最少為 8 個字'],
            maxlength: [20, '密碼最多為 20 個字'],
        },
        tokens: {
            type: [String],
        },
        learningSkills: [skillSchema], // 想學的技能
        teachingSkills: [skillSchema], // 可教的技能
    },
    {
        versionKey: false, // 禁用 mongoose自動加上的 __v
        timestamps: true, // 自動加上 createdAt 和 updatedAt 欄位
    },
)

// 定義技能物件的結構
const skillSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    descriptions: {
        type: String,
        required: true,
    },
})

export default model('User', userSchema)
