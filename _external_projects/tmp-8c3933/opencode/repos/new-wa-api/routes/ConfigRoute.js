import { Router } from 'express'
import * as controller from './../controllers/ConfigController.js'

const router = Router()

router.get('/get-bank-account', controller.getBankAccount)

export default router