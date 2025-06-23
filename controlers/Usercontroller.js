const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ------------------------------
// Register a new user
// ------------------------------
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('registerUser error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------
// Login a user
// ------------------------------
const loginUser = async (req, res) => {
  const { email, password } = req.body;


  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    user.loginHistory.push(new Date());
    await user.save();

    user.loginCount += 1;
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      message: 'Login successful',
      email: user.email,
      name: user.name
    });
  } catch (err) {
    console.error('loginUser error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------
// Submit coding contest score
// ------------------------------
const submitContestScore = async (req, res) => {
  const { email, score } = req.body;

  if (!email || score === undefined)
    return res.status(400).json({ message: 'Email and score are required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const contestCode = `contest-${user.codingContestsTaken.length + 1}`;

    user.codingContestsTaken.push({
      contestCode,
      score,
      dateTaken: new Date()
    });

    await user.save();

    res.status(200).json({
      message: 'Contest score submitted successfully',
      contestCode
    });
  } catch (err) {
    console.error('submitContestScore error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------
// Submit MCQ test score
// ------------------------------
const submitMcqScore = async (req, res) => {
  const { email, technology, score } = req.body;

  if (!email || !technology || score === undefined)
    return res.status(400).json({ message: 'Email, technology and score are required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const techLower = technology.toLowerCase();
    const count = user.mcqTestsTaken.filter(mcq =>
      mcq.technology.toLowerCase() === techLower
    ).length;

    const testCode = `mcq-${techLower}-${count + 1}`;

    user.mcqTestsTaken.push({
      testCode,
      technology,
      score,
      dateTaken: new Date()
    });

    await user.save();

    res.status(200).json({
      message: 'MCQ test submitted successfully',
      testCode
    });
  } catch (err) {
    console.error('submitMcqScore error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------------------
// Submit AI mock interview result
// ------------------------------
const submitAiInterview = async (req, res) => {
  const { email, score, feedback } = req.body;

  if (!email || score === undefined)
    return res.status(400).json({ message: 'Email and score are required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const interviewCode = `ai-${user.aiMockInterviewsTaken.length + 1}`;

    user.aiMockInterviewsTaken.push({
      interviewCode,
      score,
      feedback: feedback || '',
      dateTaken: new Date()
    });

    await user.save();

    res.status(200).json({
      message: 'AI interview submitted successfully',
      interviewCode
    });
  } catch (err) {
    console.error('submitAiInterview error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// ---------------------------------------------
// @desc    Get total number of users
// @route   GET /api/stats/total-users
// ---------------------------------------------
const getTotalUsers = async (req, res) => {
  try {
    const total = await User.countDocuments();
    res.json({ totalUsers: total });
  } catch (err) {
    console.error('Error in getTotalUsers:', err);
    res.status(500).json({ message: 'Error fetching total users' });
  }
};

// ---------------------------------------------
// @desc    Get total number of coding contests taken (across all users)
// @route   GET /api/stats/total-contests
// ---------------------------------------------
const getTotalContests = async (req, res) => {
  try {
    const users = await User.find({}, 'codingContestsTaken.contestCode');

    const uniqueContests = new Set();

    users.forEach(user => {
      user.codingContestsTaken.forEach(contest => {
        if (contest.contestCode) {
          uniqueContests.add(contest.contestCode);
        }
      });
    });

    res.json({ totalContests: uniqueContests.size });
  } catch (err) {
    console.error('Error in getTotalContests:', err);
    res.status(500).json({ message: 'Error fetching total contest count' });
  }
};


// ---------------------------------------------
// @desc    Get number of students who participated in at least one contest
// @route   GET /api/stats/contest-participants
// ---------------------------------------------
const getContestParticipants = async (req, res) => {
  try {
    const participants = await User.countDocuments({
      "codingContestsTaken.0": { $exists: true }
    });
    res.json({ contestParticipants: participants });
  } catch (err) {
    console.error('Error in getContestParticipants:', err);
    res.status(500).json({ message: 'Error fetching contest participants' });
  }
};

// ---------------------------------------------
// @desc    Get contest participation percentage
// @route   GET /api/stats/contest-percentage
// ---------------------------------------------
const getContestParticipationPercentage = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const participants = await User.countDocuments({
      "codingContestsTaken.0": { $exists: true }
    });

    const percentage = totalUsers === 0
      ? 0
      : ((participants / totalUsers) * 100).toFixed(2);

    res.json({
      totalUsers,
      contestParticipants: participants,
      participationPercentage: `${percentage}%`
    });
  } catch (err) {
    console.error('Error in getContestParticipationPercentage:', err);
    res.status(500).json({ message: 'Error calculating contest percentage' });
  }
};






// ---------------------------------------------
// @desc    Get monthly contest participation stats
// @route   GET /api/stats/monthly-contest-participation
// @access  Public
// ---------------------------------------------
const getMonthlyContestParticipation = async (req, res) => {
  try {
    const pipeline = [
      { $unwind: "$codingContestsTaken" },
      {
        $group: {
          _id: {
            year: { $year: "$codingContestsTaken.dateTaken" },
            month: { $month: "$codingContestsTaken.dateTaken" }
          },
          participants: { $addToSet: "$email" } // ensures unique participants
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          participantsCount: { $size: "$participants" }
        }
      },
      { $sort: { year: 1, month: 1 } }
    ];

    const result = await User.aggregate(pipeline);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Format result
    const formatted = result.map(r => ({
      month: monthNames[r.month - 1],
      participants: r.participantsCount
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error in getMonthlyContestParticipation:", error);
    res.status(500).json({ message: "Failed to fetch monthly contest participation" });
  }
};






const getWeeklyContestParticipation = async (req, res) => {
  try {
    const pipeline = [
      { $unwind: "$codingContestsTaken" },
      {
        $addFields: {
          day: { $dayOfMonth: "$codingContestsTaken.dateTaken" }
        }
      },
      {
        $addFields: {
          week: {
            $switch: {
              branches: [
                { case: { $lte: ["$day", 7] }, then: "Week 1" },
                { case: { $lte: ["$day", 14] }, then: "Week 2" },
                { case: { $lte: ["$day", 21] }, then: "Week 3" },
                { case: { $lte: ["$day", 31] }, then: "Week 4" }
              ],
              default: "Unknown"
            }
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$codingContestsTaken.dateTaken" },
            month: { $month: "$codingContestsTaken.dateTaken" },
            week: "$week"
          },
          participants: { $addToSet: "$email" }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          week: "$_id.week",
          participantsCount: { $size: "$participants" }
        }
      },
      { $sort: { month: 1, week: 1 } }
    ];

    const result = await User.aggregate(pipeline);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formatted = result.map(r => ({
      month: monthNames[r.month - 1], // Only month name
      week: r.week,
      participants: r.participantsCount
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error in getWeeklyContestParticipation:", err);
    res.status(500).json({ message: "Failed to fetch weekly participation" });
  }
};








const getStudentProfile = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const student = await User.findOne({ email }).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Error fetching student by email:", error);
    res.status(500).json({ message: "Server error" });
  }
};



const getDriveParticipationStats = async (req, res) => {
  try {
    const users = await User.find({});

    const participatedInContest = new Set();
    const participatedInMCQ = new Set();
    const participatedInAI = new Set();

    users.forEach(user => {
      if (user.codingContestsTaken.length > 0) {
        participatedInContest.add(user.email);
      }
      if (user.mcqTestsTaken.length > 0) {
        participatedInMCQ.add(user.email);
      }
      if (user.aiMockInterviewsTaken.length > 0) {
        participatedInAI.add(user.email);
      }
    });

    res.json([
      { category: "Coding Contest", count: participatedInContest.size },
      { category: "AI Interview", count: participatedInAI.size },
      { category: "MCQ'S", count: participatedInMCQ.size },
    ]);
  } catch (error) {
    console.error("Error fetching drive participation stats:", error);
    res.status(500).json({ message: "Error fetching drive participation stats" });
  }
};



const getAllStudentTestSummary = async (req, res) => {
  try {
    const users = await User.find();

    const summary = users.map((user) => {
      const codingCount = user.codingContestsTaken?.length || 0;
      const mcqCount = user.mcqTestsTaken?.length || 0;
      const interviewCount = user.aiMockInterviewsTaken?.length || 0;

      const totalTestsTaken = codingCount + mcqCount + interviewCount;

      const codingScore = user.codingContestsTaken.reduce((sum, c) => sum + (c.score || 0), 0);
      const mcqScore = user.mcqTestsTaken.reduce((sum, m) => sum + (m.score || 0), 0);
      const interviewScore = user.aiMockInterviewsTaken.reduce((sum, i) => sum + (i.score || 0), 0);

      const totalScore = codingScore + mcqScore + interviewScore;

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        totalTestsTaken,
        totalScore,
      };
    });

    res.json(summary);
  } catch (err) {
    console.error("Error fetching student summaries:", err);
    res.status(500).json({ message: "Failed to fetch student test summaries" });
  }
};





module.exports = {
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
  getStudentProfile,
  getDriveParticipationStats,
  getAllStudentTestSummary
};
