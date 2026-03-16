const express = require('express')
const router = express.Router()
const Student = require("../model/User")
const { Authenticate, AdminAuthorize } = require('../middleware/Auth')
const Attendance = require("../model/Attendance");

router.post('/getstudent',async(req,res)=>{
    const {cardId} = req.body
   
    try {
        const student  = await Student.findOne({card:cardId})
        
    if(student){
          return  res.status(200).send({student})
        }else{
           return res.status(400).json({message:"Record Not Found"})
        }
    } catch (error) {
       return res.status(400).json({message:"Internal Server Error "})
    }
})

router.get("/getallstudent",Authenticate,AdminAuthorize ,async (req, res) => {
    try {
       
        const students = await Student.find(); // Fetch all student records

        if (students.length > 0) {
          return  res.status(200).json({ students });
        } else {
         return   res.status(404).json({ message: "No students found" });
        }
    } catch (error) {
        console.error("Error fetching all students:", error);
       return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/deletestudent/:id", Authenticate, AdminAuthorize, async (req, res) => {
    const studentId = req.params.id;

    try {
        // Find the student by ID and delete
        const student = await Student.findByIdAndDelete(studentId);

        if (student) {
            return res.status(200).json({ message: "Student deleted successfully" });
        } else {
            return res.status(404).json({ message: "Student not found" });
        }
    } catch (error) {
        console.error("Error deleting student:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});




router.post("/markattendance", async (req, res) => {
  const { cardId } = req.body;

  try {

    const student = await Student.findOne({ card: cardId });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    // Delete records older than 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    await Attendance.deleteMany({
      date: { $lt: sixMonthsAgo }
    });



    const alreadyMarked = await Attendance.findOne({
      student: student._id,
      date: today
    });

    if (alreadyMarked) {
      return res.status(400).json({
        message: "Attendance already marked today"
      });
    }

    const attendance = new Attendance({
      student: student._id,
      date: today,
      status: "present"
    });

    await attendance.save();

    res.json({
      success: true,
      message: "Attendance marked successfully",
      student
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router