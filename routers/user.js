import { Router } from 'express'
import * as user from '../controllers/user.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

router.post('/', user.create)
router.post('/login', auth.localLogin, user.login)
router.delete('/logout', auth.jwt, user.logout)
router.get('/profile', auth.jwt, user.profile)
router.put('/profile', auth.jwt, user.updateProfile)
router.get('/profiles', user.getAllProfiles)
export default router
