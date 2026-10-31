import { ChatFlows } from "../models/MongoDBModel.js"
import response from "../response.js"

export async function chatflowValidator(req, res, next) {

  const { id: user_id } = req.verified_token
  const { chatflow_id } = req.params
  
  try {
    const chatflow = await ChatFlows.findOne({chatflow_id: chatflow_id}).exec()
    if (chatflow) {
      if (chatflow.user_id === user_id) return next()
      return response(res, 403, false, "You don't have permission to access this chatflow")
    } else {
      return response(res, 404, false, `No chatflow associated with id: ${chatflow_id}`)
    }
  } catch(err) {
    console.error(err)
    return response(res, 401, false, err.message, {})
  }
}