import { Router } from 'express'
import * as user from '../controllers/user.js'
// import * as auth from '../controllers/auth.js'

const router = Router()

router.post('/', user.create)

export default router
