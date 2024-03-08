const mongoose = require('mongoose')
const URL = process.env.MONGO_URL;
const connectDB = async () =>{
    try {
        await mongoose.connect(URL)
        console.log("connect successfully")
    } catch (error) {
        console.log(error,"connection failed")
    }
}

module.exports = connectDB;