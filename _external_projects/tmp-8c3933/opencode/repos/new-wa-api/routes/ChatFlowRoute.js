import { Router } from 'express'
import { storeChatFlow, showChatFlow, getChatFlow, updateChatFlow, deleteChatFlow } from '../controllers/ChatFlowController.js'
import { chatflowValidator } from '../middlewares/ChatFlowValidator.js'

const router = new Router()

router.get('/show-chatflow', showChatFlow)
router.post('/store-chatflow', storeChatFlow)
router.get('/get-chatflow/:chatflow_id', chatflowValidator, getChatFlow)
router.put('/update-chatflow/:chatflow_id', chatflowValidator, updateChatFlow)
router.delete('/delete-chatflow/:chatflow_id', chatflowValidator, deleteChatFlow)

export default router