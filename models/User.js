const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
 
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, 

 
//   loginCount: { type: Number, default: 0 },
//   lastLogin: { type: Date },

  codingContestsTaken: [
    {
      contestCode: { type: String },           
      score: { type: Number },
      dateTaken: { type: Date, default: Date.now } 
    }
  ],


  mcqTestsTaken: [
    {
      testCode: { type: String },                
      technology: { type: String },               
      score: { type: Number },
      dateTaken: { type: Date, default: Date.now }
    }
  ],


  aiMockInterviewsTaken: [
    {
      interviewCode: { type: String },         
      score: { type: Number },
      feedback: { type: String },
      dateTaken: { type: Date, default: Date.now }
    }
  ],

 
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
