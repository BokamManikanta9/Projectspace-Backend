
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  techName: { type: String, required: true },
  text: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true } 
});

module.exports = mongoose.model('Question', questionSchema);
