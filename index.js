import 'dotenv/config'
import express from 'express'
import { StatusCodes } from 'http-status-codes'

// 手動建立 http server
import { createServer } from 'node:http'
import { Server } from 'socket.io'

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// 路由
// import routerUser from './routers/user.js'

import cors from 'cors'
import './passport.js'

const app = express()

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
// app.use('/user', routerUser)

app.listen(process.env.PORT || 4000, async () => {
    try {
        // server 啟動
        console.log('listening on port', process.env.PORT || 4000)
    } catch (error) {
        console.log(' connect error: ' + error)
    }
})
