const express = require('express')
const router = express.Router()
const Student = require("../model/User")
const { body, validationResult } = require('express-validator');

router.post('/createstudent',[
    body('name').isLength({min:3 ,max: 25}).withMessage('Name must be between 3 and 25 characters'),
    body("card").isLength({min:4,max:10}).withMessage('Card Id should be atleast 4 characters')
],async (req,res)=>{
    const {card,name,session,fname,address,city,state,course,image} = req.body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const existStudent  = await Student.findOne({card});
        if(existStudent){
         return   res.status(400).json({message:"Student with this id alreadt exist "})
        }
        const userData = await Student.create({
            card,name,session,fname,address,city,state,course,image
        })
        res.status(200).json({message:"Create Successfully"})
      
    } catch (error) {
        console.log(error)
       res.status(400).json({message:"Invaild Details"})
    }


})
module.exports = router