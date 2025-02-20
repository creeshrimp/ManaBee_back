import { Schema, model, ObjectId, Error } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'

// import UserRoles from '../enums/UserRoles.js'

// User
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
            validate: [
                {
                    validator: (value) =>
                        validator.isStrongPassword(value, {
                            minLength: 8,
                            minLowercase: 1,
                            minUppercase: 1,
                            minNumbers: 1,
                            minSymbols: 1,
                        }),
                    message: '密碼必須包含至少 1 個大寫字母、1 個小寫字母、1 個數字和 1 個特殊符號',
                },
                {
                    validator: (value) => /^[\x20-\x7E]+$/.test(value),
                    message: '密碼只能包含英文字母、數字和特殊符號',
                },
            ],
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

// skill
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

// mongoose pre save hook
// 加密並儲存
userSchema.pre('save', async function () {
    const user = this
    if (this.isModified('password')) {
        user.password = await bcrypt.hash(this.password, 10)
    }
})

export default model('User', userSchema)
