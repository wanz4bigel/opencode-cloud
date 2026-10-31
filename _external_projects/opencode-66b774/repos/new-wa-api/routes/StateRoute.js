import { Router } from 'express'
import { storeState, getState, updateState, deleteState, showState } from '../controllers/StateController.js'
import { stateValidator } from '../middlewares/StateValidator.js'

const router = new Router()

router.get('/show-state', showState)
router.post('/store-state', storeState)
router.get('/get-state/:state_id', stateValidator, getState)
router.put('/update-state/:state_id', stateValidator, updateState)
router.delete('/delete-state/:state_id', stateValidator, deleteState)

export default router