import crypto from 'crypto'
import { randomBytes } from 'crypto'
import { Contacts } from '../models/MongoDBModel.js'

export default class ContactClass {
  constructor() {
    this.contact_id = null
    this.folder_contact_id = null
    this.name = null
    this.telp = null
    this.profile_picture = null
    this.user_id = null
  }

  /* <------------ Define ------------> */

  setUserId(user_id) { 
    this.user_id = user_id; 
    return this 
  }

  setContactId(contact_id) {
    this.contact_id = contact_id
    return this
  }

  setFolderContactId(folder_contact_id) {
    this.folder_contact_id = folder_contact_id
    return this
  }

  setName(name) {
    this.name = name
    return this
  }

  setTelp(telp) {
    this.telp = telp
    return this
  }

  setProfilePicture(profile_picture) {
    this.profile_picture = profile_picture
    return this
  }



  /* <------------ Create, Read, Update, Delete ------------> */

  async showContact() {
    const contacts = await Contacts.find({ folder_contact_id: { $in: this.folder_id }})
    return contacts
  }  

  async storeContact() {
    return await Contacts.create({
      contact_id: `CNT${randomBytes(3).toString('hex')}`,
      user_id: this.user_id,
      folder_contact_id: this.folder_contact_id,
      name: this.name,
      telp: this.telp,
      profile_picture: this.profile_picture,
    })
  }

  async getContact() {
    const contact = await Contacts.findOne({ telp: this.telp })
    return contact
  }

  async getContactWithinFolder() {
    return await Contacts.find({
      folder_contact_id: this.folder_contact_id
    })
  }

  async updateContact(update) {
    return await Contacts.updateOne({
      contact_id: this.contact_id,
    }, { ...update, $inc: { __v: 1 } }, { new: true })
  }

  async deleteContact() {
    return await Contacts.deleteOne({
      contact_id: this.contact_id,
    })
  }

  async addContactFolder() {
    const contact = await Contacts.findOneAndUpdate(
      { telp: this.telp },
      { $push: { folder_contact_id: this.folder_contact_id }},
      { new: true }
    )

    return contact
  }

  async isExistContact() {
    return (await Contacts.findOne({ contact_id: this.contact_id }) ? true : false)
  }

  async isUsedContactName() {
    return (await Contacts.findOne({ name: this.name }) ? true : false)
  }
}
