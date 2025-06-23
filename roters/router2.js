const express = require('express')
const route = express.Router();
// const controller = require('../controlers/Day3_')
// const controller_ = require('../controlers/Emailcontoller')
const { getQuestionsByTechName,addQuestion,addManyQuestions } = require('../controlers/questionController');

const {
  registerUser,
  loginUser,
  submitContestScore,
  submitMcqScore,
  submitAiInterview,
  getTotalUsers,
  getTotalContests,
  getContestParticipants,
  getContestParticipationPercentage,
  getMonthlyContestParticipation,
  getWeeklyContestParticipation,
  getStudentProfile ,
} = require('../controlers/Usercontroller');


// route.post("/register",controller.data);
// route.post("/update",controller.upd);
// route.post("/send-email",controller_.sendEmail);
route.get('/questions/:techName', getQuestionsByTechName);
route.post('/addquestion', addQuestion);
route.post('/addmany', addManyQuestions);

route.post('/register', registerUser);
route.post('/login', loginUser);
route.post('/submit-contest-score', submitContestScore);
route.post('/submit-mcq-score', submitMcqScore);
route.post('/submit-ai-interview', submitAiInterview);

route.get('/total-users', getTotalUsers);
route.get('/total-contests', getTotalContests);
route.get('/contest-participants', getContestParticipants);
route.get('/contest-percentage', getContestParticipationPercentage);
route.get('/monthly-contest-participation', getMonthlyContestParticipation);
route.get("/weekly-contest-participation", getWeeklyContestParticipation);
route.post("/get-student-by-email", getStudentProfile);

module.exports = route;
