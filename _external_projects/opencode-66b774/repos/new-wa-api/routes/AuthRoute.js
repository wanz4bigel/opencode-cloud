import { Router } from 'express'
import * as controller from './../controllers/AuthController.js'
import EmptyUserValidator from './../middlewares/EmptyUserValidator.js'
import CharacterValidator from './../middlewares/CharacterValidator.js'
import formatTelpValidator from './../middlewares/formatTelpValidator.js'

const router = Router()

router.get('/get-user', controller.getUser)
router.post('/register', formatTelpValidator, CharacterValidator, controller.register)
router.post('/login', formatTelpValidator, EmptyUserValidator, controller.login)
router.post('/verify-otp', formatTelpValidator, EmptyUserValidator, controller.verifyOtp)

export default router
