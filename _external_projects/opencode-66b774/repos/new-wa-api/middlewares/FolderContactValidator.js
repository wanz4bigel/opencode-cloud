import response from './../response.js'
import FolderContactClass from '../class/FolderContactClass.js'

export async function validate(req, res, next) {

  let { id: user_id } = req.verified_token
  let { folder_id: folder_contact_id } = req.params

  try {

    let folder = await new FolderContactClass()
      .setFolderContactId(folder_contact_id)
      .getFolder()

    if (!folder) return response(res, 404, false, "Folder not found")
    if (folder.user_id !== user_id) return response(res, 403, false, "You don't have permission to access this folder")

    next()

  } catch(err) {

    console.error(err)
    return response(res, 500, false, err.message, {})

  }

}

export default validate