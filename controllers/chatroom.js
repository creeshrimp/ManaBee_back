import Chatroom from '../models/chatroom.js'
import { StatusCodes } from 'http-status-codes'

export async function create(req, res) {
    try {
        const chatroom = await Chatroom.create({
            users: [req.user._id, req.params.user],
            messages: [],
        })
        res.status(StatusCodes.OK).json({
            success: true,
            message: '聊天室建立成功',
            result: chatroom,
        })
    } catch (error) {
        console.log('controllers/chatroom.js:', error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'serverError',
        })
    }
}

// 取得當前user的所有聊天室id
export async function getUserChatrooms(req, res) {
    try {
        const chatrooms = await Chatroom.find({ users: req.user._id })
    } catch (error) {}
}
