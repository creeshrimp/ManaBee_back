import { Router } from 'express'
import * as chatroom from '../controllers/chatroom.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

// 建立聊天室
router.post('/:user', auth.jwt, chatroom.create)

// 取得聊天室列表
router.get('/', auth.jwt, chatroom.getUserChatrooms)

export default router
