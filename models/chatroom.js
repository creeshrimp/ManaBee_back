// models/user.js
import { Schema, model } from 'mongoose'

// message schema、須符合vue-advanced-chat 的格式
const messageSchema = new Schema({
    // 訊息內容
    content: {
        type: String,
        required: true,
    },
    // 發送者 ID
    senderId: {
        type: String,
        required: true,
    },
    // 日期(不含時間)
    date: {
        type: String,
        required: true,
    },
    // 時間(不含日期)
    timestamp: {
        type: String,
        required: true,
    },
})

// chatroom schema
const chatroomSchema = new Schema(
    {
        users: [String],
        messages: [messageSchema],
    },
    {
        versionKey: false,
        timestamps: true,
    },
)

export default model('Chatroom', chatroomSchema)
