
const Question = require('../models/Question');



// const getQuestionsByTechName = async (req, res) => {
//   const { techName } = req.params;

//   try {
//     const questions = await Question.find({ techName: techName.toLowerCase() });

//     if (!questions || questions.length === 0) {
//       return res.status(404).json({ message: 'No questions found for this topic.' });
//     }

//     res.status(200).json(questions);
//   } catch (error) {
//     console.error('Error fetching questions:', error);
//     res.status(500).json({ message: 'Server error while fetching questions.' });
//   }
// };


// GET /api/questions/:techName
const getQuestionsByTechName = async (req, res) => {
    const { techName } = req.params;
  
    try {
      const questions = await Question.aggregate([
        { $match: { techName: techName.toLowerCase() } },
        { $sample: { size: 15 } }  // Get 15 random questions
      ]);
  
      if (!questions || questions.length === 0) {
        return res.status(404).json({ message: 'No questions found for this topic.' });
      }
  
      res.status(200).json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ message: 'Server error while fetching questions.' });
    }
  };
  


const addQuestion = async (req, res) => {
  const { techName, text, options, correctAnswer } = req.body;


  if (!techName || !text || !Array.isArray(options) || options.length < 2 || typeof correctAnswer !== 'number') {
    return res.status(400).json({ message: 'Invalid question data.' });
  }


  if (correctAnswer < 0 || correctAnswer >= options.length) {
    return res.status(400).json({ message: 'correctAnswer index is out of range.' });
  }

  try {
    const newQuestion = new Question({
      techName: techName.toLowerCase(),
      text,
      options,
      correctAnswer
    });

    await newQuestion.save();
    res.status(201).json({ message: 'Question added successfully.', question: newQuestion });
  } catch (error) {
    console.error('Error saving question:', error);
    res.status(500).json({ message: 'Server error while adding question.' });
  }
};



const addManyQuestions = async (req, res) => {
    const questions = req.body;
  
  
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Request body should be an array of questions.' });
    }
  
    try {
      const result = await Question.insertMany(questions);
      res.status(201).json({ message: 'Questions added successfully.', insertedCount: result.length });
    } catch (error) {
      console.error('Error inserting questions:', error);
      res.status(500).json({ message: 'Server error while adding questions.' });
    }
  };

module.exports = {
  getQuestionsByTechName,
  addQuestion,
  addManyQuestions
};
