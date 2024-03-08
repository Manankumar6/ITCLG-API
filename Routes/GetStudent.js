const express = require('express')
const router = express.Router()
const Student = require("../model/User")


router.post('/getstudent',async(req,res)=>{
    const {cardId} = req.body
   
    try {
        const student  = await Student.findOne({card:cardId})
        
    if(student){
            res.status(200).send({student})
        }else{
            res.status(400).json({message:"Record Not Found"})
        }
    } catch (error) {
        res.status(400).json({message:"Internal Server Error "})
    }
})

module.exports = router