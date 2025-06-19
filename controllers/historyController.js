const mongoose  = require('mongoose')
const History = require('../models/History')

const addUserToSessionHistory = async (req, res) => {
     try {
       const user = req.id

        const {tutorId, quizId} = req.body
    
     const userHistory = await History.create({
         userId: user,
         tutorId,
         quizId
      })

      res.status(201).json({
         message: 'User history fetched successfully.',
         userHistory
      })

     } catch(error) {
        console.log('Error fetching user history', error)  
        return res.status(500).json({
            message:'Error fetching user history', error
        })
     }
    
    }

    const getUserQuizHistory = async (req, res) => {
  try {
    const user = req.id;

    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const now = new Date();

    
    // Current month range (with precise time boundaries)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Last month range (with precise time boundaries)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDay())

    // Base query for quiz-only records
    const quizQuery = {
      userId: user,
      quizId: { $exists: true, $ne: null },
      tutorId: null // Ensure no tutorId exists
    };

    // Execute all queries in parallel for better performance
    const [currentMonthQuizzes, lastMonthQuizzes, currentDayQuiz, fullQuizHistory] = await Promise.all([
      History.countDocuments({
        ...quizQuery,
        createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
      }),
      History.countDocuments({
        ...quizQuery,
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd}
      }),
      History.countDocuments({
        ...quizQuery,
        createdAt: currentDay
      }),
      History.find(quizQuery)
        .populate('quizId', 'topic subject duration name questions voice level')
        .populate('userId', 'username profilePics')
        .sort({ createdAt: -1 }) // Newest first
    ]);

    res.status(200).json({
      message: 'Quiz history and statistics fetched successfully.',
      quizHistory: fullQuizHistory,
      stats: {
        quizCount: fullQuizHistory.length,
        currentMonthQuizzes,
        lastMonthQuizzes,
        currentDayQuiz
      }
    });

  } catch (error) {
    console.error('Failed to fetch quiz history:', error);
    res.status(500).json({
      message: 'Failed to fetch quiz history',
      error: error.message
    });
  }
};

const getUserTutorHistory = async (req, res) => {
  try {
    const user = req.id;

    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const now = new Date();
    
    // Current month range (1st day to last day)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Last month range (1st day to last day)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDay())

    // Fetch tutor-only lessons (no quizzes)
    const tutorQuery = { 
      userId: user,
      tutorId: { $exists: true, $ne: null },
      quizId: null // Ensure no quizId exists
    };

    // Get counts for current & last month
    const [currentMonthLessons, lastMonthLessons, currentDayLesson, tutorHistory] = await Promise.all([
      History.countDocuments({
        ...tutorQuery,
        createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
      }),
      History.countDocuments({
        ...tutorQuery,
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
      }),
      History.countDocuments({
        ...tutorQuery,
        createdAt: currentDay
      }),
      History.find(tutorQuery)
        .populate('tutorId', 'topic subject duration name')
        .populate('userId', 'username profilePics')
    ]);

    res.status(200).json({
      message: 'Tutor lesson history and statistics fetched successfully.',
      tutorHistory,
      stats: {
        tutorCount: tutorHistory.length,
        currentMonthLessons,
        lastMonthLessons,
        currentDayLesson
      }
    });

  } catch (error) {
    console.error('Failed to fetch tutor history:', error);
    res.status(500).json({
      message: 'Failed to fetch tutor history',
      error: error.message
    });
  }
};

 const getUserQuizStat = async (req, res) => {

      try {
        const userId = req.id;
        
        if (!userId) {
            return res.status(400).json({ message: 'No user found.' });
        }

        const subjectCounts = await History.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    quizId: { $exists: true, $ne: null },
                    tutorId: null
                }
            },
            {
                $lookup: {
                    from: 'quizzes', // The collection name for Tutor model
                    localField: 'quizId',
                    foreignField: '_id',
                    as: 'quizData'
                }
            },
            { $unwind: '$quizData' }, // Flatten the tutorData array
            {
                $group: {
                    _id: "$quizData.subject", // Group by the subject from tutor
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    subject: "$_id",
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: subjectCounts
        });

    } catch (error) {
        console.error('Error fetching quiz stats:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching quiz session counts",
            error: error.message
        });
    }

 }

 const getUserTutorStat = async (req, res) => {
    try {
        const userId = req.id;
        
        if (!userId) {
            return res.status(400).json({ message: 'No user found.' });
        }

        const subjectCounts = await History.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    tutorId: { $exists: true, $ne: null },
                    quizId: null
                }
            },
            {
                $lookup: {
                    from: 'tutors', // The collection name for Tutor model
                    localField: 'tutorId',
                    foreignField: '_id',
                    as: 'tutorData'
                }
            },
            { $unwind: '$tutorData' }, // Flatten the tutorData array
            {
                $group: {
                    _id: "$tutorData.subject", // Group by the subject from tutor
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    subject: "$_id",
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: subjectCounts
        });

    } catch (error) {
        console.error('Error fetching tutor stats:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching tutor session counts",
            error: error.message
        });
    }
};


 module.exports = {
     addUserToSessionHistory,
     getUserQuizHistory,
     getUserTutorHistory,
     getUserQuizStat,
     getUserTutorStat
 }