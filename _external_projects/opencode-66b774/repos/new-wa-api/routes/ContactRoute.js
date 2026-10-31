import { Router } from 'express'
import multer from 'multer'
import {
  storeFolderContact,
  showFolderContact,
  deleteFolderContact,
  showContact,
  importContact
} from '../controllers/ContactController.js'
import EmptyFolderContactValidator from './../middlewares/EmptyFolderContactValidator.js'

const router = Router()
const upload = multer({ dest: 'csv/' })

router.post('/store-folder', storeFolderContact)
router.get('/show-folder',  showFolderContact)
router.delete('/delete-folder/:folder_id', EmptyFolderContactValidator, deleteFolderContact)

router.get('/show-contact/:folder_id', EmptyFolderContactValidator, showContact)
router.post('/import-contact', upload.single('template'), importContact)

export default router