import { randomBytes } from 'crypto'
import { Journeys, ChatFlows, States } from "../models/MongoDBModel.js";

export default class JourneyClass {

  constructor() {
    this.journey_id = null
    this.user_id = null
    this.chatflow_id = null
    this.current_state = null
    this.next_state = null
    this.option = null
  }



  /* <------------ Define ------------> */

  setJourneyId(journey_id) { this.journey_id = journey_id; return this }
  setUserId(user_id) { this.user_id = user_id; return this }
  setChatFlowId(chatflow_id) { this.chatflow_id = chatflow_id; return this }
  setCurrentState(current_state) { this.current_state = current_state; return this }
  setNextState(next_state) { this.next_state = next_state; return this }
  setOption(option) { this.option = option; return this }



  /* <------------ Create, Read, Update, Delete ------------> */

  async storeJourney() {
    const journey_id = "JRN"+randomBytes(3).toString('hex')
    return await Journeys.create({
      journey_id: journey_id,
      user_id: this.user_id,
      chatflow_id: this.chatflow_id,
      current_state: this.current_state,
      next_state: this.next_state,
      option: this.option
    })
  }

  async showJourney() { return await Journeys.find({user_id: this.user_id}).exec() }

  async getJourney() { return await Journeys.findOne({journey_id: this.journey_id}).exec() }

  /* async getJourneyByChatflowId() { return await Journeys.findOne({ chatflow_id: this.chatflow_id }).exec() }

  async getJourneyByCurrentState() { return await Journeys.findOne({ current_state: this.current_state }).exec() }

  async getJourneyByNextState() { return await Journeys.findOne({ next_state: this.next_state }).exec() } */

  async updateJourney(chatflow_id, current_state, next_state, option) {
    return await Journeys.findOneAndUpdate({journey_id: this.journey_id}, {
      chatflow_id,
      current_state,
      next_state,
      option,
      $inc: { __v: 1 }
    }, { new: true }).exec()
  }

  async deleteJourney() { return await Journeys.findOneAndDelete({journey_id: this.journey_id}, { new: true }).exec() }

}