import { randomBytes } from 'crypto'
import { States } from '../models/MongoDBModel.js'

export default class StateClass {

  constructor() {
    this.state_id = null
    this.user_id = null
    this.name = null
    this.message = null
  }



  /* <------------ Define ------------> */

  setStateId(state_id) { this.state_id = state_id; return this }
  setUserId(user_id) { this.user_id = user_id; return this }
  setName(name) { this.name = name; return this }
  setMessage(message) { this.message = message; return this }



  /* <------------ Create, Read, Update, Delete ------------> */

  async storeState() {
    var state_id = "STATE"+randomBytes(5).toString('hex')
    return await States.create({
      state_id: state_id,
      user_id: this.user_id,
      name: this.name,
      message: this.message
    })
  }

  async showState() { return await States.find({ user_id: this.user_id }).exec() }

  async getState() { return await States.findOne({ state_id: this.state_id }).exec() }

  async updateState(name, message) {
    if (!(name && message)) {
      let doc = await this.getState()
      return await States.findOneAndUpdate({ state_id: this.state_id }, {
        name: doc.name ?? name,
        message: doc.message ?? message,
        $inc: { __v: 1 }
      }, { new: true }).exec()
    }
    return await States.findOneAndUpdate({ state_id: this.state_id }, { name, message, $inc: { __v: 1 }}, { new: true }).exec()
  }

  async deleteState() { return await States.findOneAndDelete({ state_id: this.state_id }).exec() }

}