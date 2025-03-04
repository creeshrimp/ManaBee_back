import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import { StatusCodes } from 'http-status-codes'

// 手動建立 http server
import { createServer } from 'node:http'
import { Server } from 'socket.io'

// 路由
import routerUser from './routers/user.js'

import cors from 'cors'

// use passport 驗證策略
// import strategies from './passport/strategies.js'
// strategies.useAll()

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
    },
})

// cors 全開
app.use(cors())

// 錯誤處理
app.use(express.json())
app.use((error, req, res, next) => {
    res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'requestFormatError',
    })
})

// 路由
app.use('/user', routerUser)

// 📌 WebSocket
io.on('connection', (socket) => {
    console.log('新用戶連接:', socket.id)

    // joinRoom
    socket.on('joinRoom', (room) => {
        socket.join(room)
        console.log(`User ${socket.id} joined room ${room}`)
    })

    // sendMessage
    socket.on('sendMessage', (data) => {
        console.log('收到訊息:', data)

        // 要符合套件格式
        // date: 日期(不含時間)
        data.date = new Date().toDateString()
        // timestamp: 時間(不含日期)
        data.timestamp = new Date().toString().substring(16, 21)

        io.to(data.roomId).emit('receiveMessage', data)
        console.log(`Message sent to room ${data.roomId}:`, data)
        // io.emit('receiveMessage', data)
    })

    // disconnect
    socket.on('disconnect', () => {
        console.log('用戶離開:', socket.id)
    })
})

// 📌 啟動server 本來都是 app.listen websocket 掛在 server 上 所以用 server.listen
server.listen(process.env.PORT || 4000, async () => {
    try {
        // server 啟動
        console.log('listening on port', process.env.PORT || 4000)
        // 連線資料庫
        await mongoose.connect(process.env.DB_URL)
        // mongoose 內建的消毒 防注入
        mongoose.set('sanitizeFilter', true)
        console.log('資料庫連線成功')
    } catch (error) {
        console.log(' connect error: ' + error)
    }
})
