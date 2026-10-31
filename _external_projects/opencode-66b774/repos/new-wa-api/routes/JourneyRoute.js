import { Router } from 'express'
import { storeJourney, getJourney, updateJourney, deleteJourney, showJourney } from '../controllers/JourneyController.js'
import { journeyValidator, keyValidator } from '../middlewares/JourneyValidator.js'

const router = new Router()

router.get('/show-journey', showJourney)
router.post('/store-journey', keyValidator, storeJourney)
router.get('/get-journey/:journey_id', journeyValidator, getJourney)
router.put('/update-journey/:journey_id', journeyValidator, keyValidator, updateJourney)
router.delete('/delete-journey/:journey_id', journeyValidator, deleteJourney)

export default router