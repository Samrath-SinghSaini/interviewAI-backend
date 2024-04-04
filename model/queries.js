const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

async function connectDB(){
 await mongoose.connect(process.env.MONGO_URL)
 console.log("Connected to db.")
}


module.exports = {connectDB}