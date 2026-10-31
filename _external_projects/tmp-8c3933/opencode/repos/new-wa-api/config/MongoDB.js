import mongoose from 'mongoose'

const MONGO_URI = process.env['MONGO_URI']
const mongoDbConnect = async () => mongoose.connect(MONGO_URI)

export default mongoDbConnect