const mongoose = require('mongoose')


const studentSchema = new mongoose.Schema({
    card:{
        type:String,
        require:true,
        unique: true
    },
    name:{
        type:String,
        required:true,
    },
    session:{
        type:String,
        required:true
    },
    fname:{
        type:String,
        required:true
    },
    course:{
        type:String

    },
    address:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    image:{
        type:String
    }
})
const Student = new mongoose.model("students",studentSchema)
module.exports = Student