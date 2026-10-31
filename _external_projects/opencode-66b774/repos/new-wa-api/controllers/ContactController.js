import { join } from 'node:path'
import { createReadStream } from 'node:fs'
import csv from 'csv-parser'
import response from '../response.js'
import ChatClass from '../class/ChatClass.js'
import FolderContactClass from '../class/FolderContactClass.js'
import ContactClass from '../class/ContactClass.js'
import DeviceClass from '../class/DeviceClass.js'
import AuthClass from '../class/AuthClass.js'

export async function storeFolderContact(req, res) {

  let { name } = req.body
  let { id: user_id } = req.verified_token

  try {

    let folder = new FolderContactClass()
      .setUserId(user_id)
      .setName(name)

    if (await folder.isUsedFolderName())
      return response(res, 409, false, "This folder already exist!")

    await folder.storeFolder()
    return response(res, 201, true, "Folder created successfully!")

  } catch (err) {

    console.error(err)
    return response(res, 500, false, err.message, {})

  }

}

export async function showFolderContact(req, res) {
  
  let { id: user_id } = req.verified_token

  try {

    let folders = await new FolderContactClass()
      .setUserId(user_id)
      .getAllFolder()

      console.log(user_id)
    console.log(folders)

    if (folders.length === 0) return response(res, 404, true, "No folders were created yet!")

    let data = folders.map(({ folder_contact_id, name: title }) =>  ({ folder_contact_id, title }))
    return response(res, 200, true, "Contact found!", data)

  } catch (err) {

    console.error(err)
    return response(res, 500, false, err.message)

  }

}

export async function showContact(req, res) {

  let { folder_id: folder_contact_id } = req.params

  try {

    let data = 
      (await new ContactClass()
      .setFolderContactId(folder_contact_id)
      .getContactWithinFolder())
      .map(({ contact_id, name, telp }) => ({ contact_id, name, telp }))
      
    return response(res, 200, true, "Contacts found!", data)

  } catch (err) {
    return response(res, 500, false, err.message)
  }
}

export async function deleteFolderContact(req, res) {

  let { folder_id: folder_contact_id } = req.params

  try {

    let contacts = await new ContactClass()
      .setFolderContactId(folder_contact_id)
      .getContactWithinFolder()

    if (contacts.length > 0)
      return response(res, 422, false, "This folder has no empty contact!")

    await new FolderContactClass()
      .setFolderContactId(folder_contact_id)
      .softDeleteFolder()

    return response(res, 200, true, "Folder deleted successfully!")

  } catch (err) {

    console.error(err)
    return response(res, 500, false, err.message)

  }

}

export async function importContact(req, res) {
  const {folder_id} = req.body
  const { id: user_id } = req.verified_token
  if(!req.file) {
    return response(res, 422, false, "Template required!", {})
  }

  let isFolderExist = await new FolderContactClass()
    .setFolderContactId(folder_id)
    .isExistFolder()

  if (!isFolderExist){
    return response(res, 404, false, "Folder not found")
  }

  const csvFilePath = join(process.cwd(), req.file.path)
  const results = []
  const contacts = []
  const errors = [];

  createReadStream(csvFilePath).pipe(csv())
    .on('data', (data) => {
      if(!data.telp || !data.name || data.telp == null || data.name == null){
        errors.push(data);
      }else{
        results.push(data)
      }
    })
    .on('end', async () => {
      if(errors.length > 0) {
        return response(res, 422, false, "File must contain telp & name!", {})
      }

      try {
        for (const result of results) {
          const formatted_telp = new AuthClass()
            .normalizeTelp(result.telp)

          const validWhatsappNumber = await new DeviceClass()
            .setTelp(formatted_telp)
            .isValidWhatsappNumber()
          
          if (!validWhatsappNumber) {
            continue
          } 

          var contact = new ContactClass()
            .setUserId(user_id)
            .setTelp(formatted_telp)
            .setName(result.name)
            .setProfilePicture(result.profile_picture)
            .setFolderContactId(folder_id)
          
          const is_exist_contact = await contact.getContact()
          if (is_exist_contact) {
            if (!is_exist_contact.folder_contact_id.includes(contact.folder_contact_id)) {
              var contact = await contact.addContactFolder()
            }else {
              var contact = is_exist_contact
            }
          }else{
            var contact = await contact.storeContact()
          }
          contacts.push(contact)
        }

        return response(res, 200, true, 'Contact imported successfully!', contacts)

      } catch (err) {
        return response(res, 422, false, err.message, {})
      }
    })
    .on('error', (err) => {
      return response(res, 422, false, err.message, {})
    })
}