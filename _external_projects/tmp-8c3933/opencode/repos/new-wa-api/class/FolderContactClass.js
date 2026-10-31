import crypto from 'crypto'
import { Folders } from '../models/MongoDBModel.js'

export default class FolderContactClass {
  constructor() {
    this.folder_contact_id = null
    this.user_id = null
    this.name = null
    this.is_active = null
  }



  /* <------------ Define ------------> */

  setFolderContactId(folder_contact_id) {
    this.folder_contact_id = folder_contact_id
    return this
  }

  setUserId(user_id) {
    this.user_id = user_id
    return this
  }

  setName(name) {
    this.name = name
    return this
  }

  setIsActive(is_active) {
    this.is_active = is_active
    return this
  }



  /* <------------ Create, Read, Update, Delete ------------> */

  async storeFolder() {
    return await Folders.create({
      folder_contact_id: `FLDR${crypto.randomBytes(3).toString('hex')}`,
      user_id: this.user_id,
      name: this.name,
      is_active: true
    })
  }

  async getFolder() {
    return await Folders.findOne({
      folder_contact_id: this.folder_contact_id,
      is_active: true
    })
  }

  async getAllFolder() {
    return await Folders.find({
      user_id: this.user_id,
      is_active: true
    })
  }

  async updateFolder(update) {
    return await Folders.updateOne({
      folder_contact_id: this.folder_contact_id,
      is_active: true
    }, { ...update, $inc: { __v: 1 } }, { new: true })
  }

  async softDeleteFolder() {
    return await Folders.updateOne(
      { folder_contact_id: this.folder_contact_id },
      { is_active: false }
    )
  }

  async hardDeleteFolder() {
    return await Folders.deleteOne({ folder_contact_id: this.folder_contact_id })
  }



  async isExistFolder() {

    return (await this.getFolder() ? true : false)

  }

  async isUsedFolderName() {

    return (
      await Folders.findOne({
        user_id: this.user_id,
        name: this.name,
        is_active: true
      })
      ? true
      : false
    )

  }

}
