const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students', 
        required: true,
        unique: true
    },
    studentId: { 
        type: String, 
        required: true, 
        unique: true 
    }, // The Card ID provided by Admin
    dob: { type: String, required: true },
    duration: { type: String, default: "15 Months" },
    completionDate: { type: Date, required: true },
    serialNo: { type: String, unique: true, required: true },

    theoryExam: {
        sem: { type: String } // Stores Grade for both/combined e.g., "A+/A"
    },
    assignments: {
        sem1: { type: Number },
        sem2: { type: Number }
    },
    personalityProject: { type: Number },
    attendance: { type: Number },
    grandTotal: { type: Number },

    hasPersonalityCertificate: { type: Boolean, default: false }
}, { timestamps: true });

const Result = mongoose.model("results", resultSchema);
module.exports = Result;