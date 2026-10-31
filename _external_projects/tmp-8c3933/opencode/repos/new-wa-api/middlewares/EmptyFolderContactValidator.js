import response from './../response.js'
import FolderContactClass from '../class/FolderContactClass.js'

export async function validate(req, res, next) {

  if (req.body.folder_id) {
    var folder_contact_id = req.body.folder_id
  }else if(req.params.folder_id) {
    var folder_contact_id = req.params.folder_id
  }

  try {

    let isFolderExist = await new FolderContactClass()
      .setFolderContactId(folder_contact_id)
      .isExistFolder()

    if (isFolderExist) next()
    else return response(res, 404, false, "Folder not found")

  } catch(err) {

    console.error(err)
    return response(res, 500, false, err.message, {})

  }

}

export default validate