// models/user.js
import { Schema, model } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'

// skill
const skillSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    descriptions: {
        type: String,
        required: false,
    },
})

// User schema
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
            minlength: [4, '密碼最少為 4 個字'],
            maxlength: [20, '密碼最多為 20 個字'],
            validate: [
                {
                    validator: (value) => /^[\x20-\x7E]+$/.test(value),
                    message: '密碼只能包含英文字母、數字和特殊符號',
                },
            ],
        },
        gender: {
            type: String,
            enum: ['male', 'female', false],
            required: [true, '性別不可為空'],
        },
        nickname: {
            type: String,
            required: false,
            trim: true,
            maxlength: [20, '暱稱最多為 10 個字'],
        },
        tokens: {
            type: [String],
        },
        learningSkills: [skillSchema], // 想學的技能
        teachingSkills: [skillSchema], // 想教的技能
        introduction: {
            type: String,
            default: '',
        },
    },
    {
        versionKey: false, // 禁用 mongoose 自動加上的 __v
        timestamps: true, // 自動加上 createdAt 和 updatedAt 欄位
    },
)

// mongoose pre save hook: 加密並儲存
userSchema.pre('save', async function () {
    const user = this
    if (this.isModified('password')) {
        user.password = await bcrypt.hash(this.password, 10)
    }
})

export default model('User', userSchema)
