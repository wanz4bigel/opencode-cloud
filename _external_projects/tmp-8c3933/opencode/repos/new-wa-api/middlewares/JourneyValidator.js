import { ChatFlows, Journeys, States } from "../models/MongoDBModel.js"
import response from "../response.js"

export async function journeyValidator(req, res, next) {

  let { id: user_id } = req.verified_token
  let { chatflow_id, current_state, next_state } = req.body
  let { journey_id } = req.params

  try {
    const journey = await Journeys.findOne({journey_id: journey_id})
    if (journey) {
      if (journey.user_id === user_id) {
        chatflow_id ?? journey.chatflow_id
        current_state ?? journey.current_state
        next_state ?? journey.next_state
        return next()
      }
      return response(res, 403, false, "You don't have permission to access this journey")
    } else {
      return response(res, 404, false, `No journey associated with id: ${journey_id}`)
    }
  } catch(err) {
    console.error(err)
    return response(res, 401, false, err.message, {})
  }
}

export async function keyValidator(req, res, next) {
  const { id: user_id } = req.verified_token
  const { chatflow_id, current_state, next_state } = req.body

  try {

    if (!(await ChatFlows.findOne({ chatflow_id: chatflow_id, user_id: user_id })))
      return response(res, 403, false, `You don't have any chatflow with id: ${chatflow_id}`)

    if (!(await States.findOne({ state_id: current_state, user_id: user_id })))
      return response(res, 403, false, `You don't have any state with id: ${current_state}`)
    
    if (!(await States.findOne({ state_id: next_state, user_id: user_id })))
      return response(res, 403, false, `You don't have any state with id: ${next_state}`)

    next()

  } catch(err) {
    console.error(err)
    return response(res, 401, false, err.message, {})
  }
}