import response from '../response.js'
import StateClass from '../class/StateClass.js'

export async function storeState(req, res) {
  const { id: user_id } = req.verified_token
  let { name, message } = req.body
  try {
    const doc = await new StateClass()
      .setUserId(user_id)
      .setName(name)
      .setMessage(message)
      .storeState()
    return response(res, 201, true, 'Successfully store state', doc.toObject())
  } catch (err) {
    console.error(err)
    return response(res, 500, false, err.message, {})
  }
}

export async function showState(req, res) {
  const { id: user_id } = req.verified_token
  try {
    const doc = await new StateClass()
      .setUserId(user_id)
      .showState()
    return response(res, 200, true, 'Successfully retrieve all state', doc.map(e => e.toObject()))
  } catch (err) {
    console.error(err)
    return response(res, 500, false, err.message, {})
  }
}

export async function getState(req, res) {
  let { state_id } = req.params
  try {
    const doc = await new StateClass()
      .setStateId(state_id)
      .getState()
    return response(res, 200, true, 'Successfully retrieve state', doc.toObject())
  } catch (err) {
    console.error(err)
    return response(res, 500, false, err.message, {})
  }
}

export async function updateState(req, res) {
  let { state_id } = req.params
  let { name, message } = req.body
  try {
    const doc = await new StateClass()
      .setStateId(state_id)
      .updateState(name, message)
    return response(res, 200, true, 'Successfully update state', doc.toObject())
  } catch (err) {
    console.error(err)
    return response(res, 500, false, err.message, {})
  }
}

export async function deleteState(req, res) {
  let { state_id } = req.params
  try {
    const doc = await new StateClass()
      .setStateId(state_id)
      .deleteState()
    return response(res, 200, true, 'Successfully delete state', doc.toObject())
  } catch (err) {
    console.error(err)
    return response(res, 500, false, err.message, {})
  }
}