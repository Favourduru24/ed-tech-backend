const mongoose = require('mongoose')
const Quiz = require('../models/Quiz')
const {generateText} = require('ai')
const {google} = require('@ai-sdk/google')

// const createQuiz = async (req, res, next) => {
      
//     const session = await mongoose.startSession()

//      try {

//        await session.withTransaction(async () => {
        
//          const {name, subject, visibility, voice, voicePattern, duration, topic, user, amount, level} = req.body

//           const missingFields = []
//           if(!name) missingFields.push('name')
//           if(!subject) missingFields.push('subject')
//           if(!visibility) missingFields.push('visibility')
//           if(!voice) missingFields.push('voice')
//           if(!voicePattern) missingFields.push('voicePattern')
//           if(!duration) missingFields.push('duration')
//           if(!topic) missingFields.push('topic')
//           if(!amount) missingFields.push('amount')
//           if(!user) missingFields.push('user')
//           if(!level) missingFields.push('level')

//       let questionsForVoice; 
    
//     try {
      
//     const response =  await generateText({
//         model: google("gemini-2.0-flash-001"),
//         prompt: ` Generate ${amount} multiple-choice ${subject} questions.
//                       Topic: ${topic}
//                       Difficulty level: ${level} (e.g., beginner, intermediate, advanced)
//                        Important: Return ONLY a valid JSON array format without any Markdown code blocks or additional text.

//                       Each question should have 4 answer options labeled A–D.

//                       Format the output as:
//                       ["Question: What is 2 + 2? A. 3 B. 4 C. 5 D. 6", ...]

//                       Keep the language concise and suitable for audio delivery.
//                       Avoid using symbols like *, /, or [].
//                       Ensure the content is easy to understand and appropriate for learners worldwide.
                      
//                       Thank you! <3`
//      });


//        let cleanedResponse = response.text.replace(/```json/g, '').replace(/```/g, '').trim();

//                 const parsed = JSON.parse(cleanedResponse);
//                 const questionsArray = Array.isArray(parsed) ? parsed : [parsed];

//                 questionsForVoice = questionsArray
//                     .filter((_, index) => index % 2 === 0)
//                     .map((q, i) => {
//                         const questionText = q.replace('Question: ', '');
//                         const optionsText = questionText
//                             .split('?')[1]
//                             .trim()
//                             .replace(/\s+/g, ' ')
//                             .replace(/([A-D])\./g, ', $1. ');

//                         return {
//                             text: `Question ${i + 1}: ${questionText.split('?')[0]}?`,
//                             options: optionsText.slice(2),
//                         };
//                     });

//                 if (!questionsForVoice || questionsForVoice.length === 0) {
//                     console.error('AI returned empty response:', response);
//                     return res.status(400).json({
//                         message: 'AI returned empty response'
//                     });
//                 }
    
// } catch (aiError) {
//     console.error('AI call failed:', aiError);
//     return res.status(500).json({
//         message: 'Failed to generate questions from AI'
//     });
// }

//           const quiz = await Quiz.create([{
//         name,
//         subject,
//         visibility,
//         voice,
//         voicePattern,
//         duration,
//         topic,
//         questions: questionsForVoice,
//         userId: user,
//         level
//       }], { session });

//          if(!quiz) {
//              return res.status(400).json({
//                 message: 'Something went wrong creating Quiz!'
//              })
//          }

//       res.status(201).json(quiz[0]);
         
//        })

//      } catch(error) {
//        next(error)
//        console.log(error, 'Error creating Quiz')
//        return res.status(500).json({message: 'Something went wrong!'})
//      }
// }

const createQuiz = async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const { name, subject, visibility, voice, voicePattern, duration, topic, user, amount, level } = req.body;

            const missingFields = [];
            if (!name) missingFields.push('name');
            if (!subject) missingFields.push('subject');
            if (!visibility) missingFields.push('visibility');
            if (!voice) missingFields.push('voice');
            if (!voicePattern) missingFields.push('voicePattern');
            if (!duration) missingFields.push('duration');
            if (!topic) missingFields.push('topic');
            if (!amount) missingFields.push('amount');
            if (!user) missingFields.push('user');
            if (!level) missingFields.push('level');

            if (missingFields.length > 0) {
                return res.status(400).json({
                    message: 'Missing required fields',
                    fields: missingFields
                });
            }

            let questionsForVoice;

            try {
                const response = await generateText({
                    model: google("gemini-2.0-flash-001"),
                   prompt: ` Generate ${amount} multiple-choice ${subject} questions.
                      Topic: ${topic}
                      Difficulty level: ${level} (e.g., beginner, intermediate, advanced)
                       Important: Return ONLY a valid JSON array format without any Markdown code blocks or additional text.

                      Each question should have 4 answer options labeled A–D.

                      Format the output as:
                      ["Question: What is 2 + 2? A. 3 B. 4 C. 5 D. 6", ...]

                      Keep the language concise and suitable for audio delivery.
                      Avoid using symbols like *, /, or [].
                      Ensure the content is easy to understand and appropriate for learners worldwide.
                      
                      Thank you! <3`
     });

                let cleanedResponse = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanedResponse);
                const questionsArray = Array.isArray(parsed) ? parsed : [parsed];

                questionsForVoice = questionsArray
            .filter((_, index) => index % 2 === 0)
            .map((q, i) => {
              const questionText = q.replace('Question: ', '');
              const optionsText = questionText
                .split('?')[1]
                .trim()
                .replace(/\s+/g, ' ')
                .replace(/([A-D])\./g, ', $1. ');
          
              // Convert to string format if your schema requires strings
              return JSON.stringify({
            text: `Question ${i + 1}: ${questionText.split('?')[0]}?`,
                options: optionsText.slice(2),
              });
            });

                if (!questionsForVoice || questionsForVoice.length === 0) {
                    console.error('AI returned empty response:', response);
                    throw new Error('AI returned empty response');
                }
            } catch (aiError) {
                console.error('AI call failed:', aiError);
                throw new Error('Failed to generate questions from AI');
            }

            const quiz = await Quiz.create([{
                name,
                subject,
                visibility,
                voice,
                voicePattern,
                duration,
                topic,
                questions: questionsForVoice,
                userId: user,
                level
            }], { session });

            if (!quiz) {
                throw new Error('Failed to create quiz');
            }

            return res.status(201).json(quiz[0]);
        });
    } catch (error) {
        console.error('Error creating Quiz:', error);
        
        // Determine the appropriate status code based on error message
        let statusCode = 500;
        let message = 'Something went wrong!';
        
        if (error.message === 'AI returned empty response') {
            statusCode = 400;
            message = error.message;
        } else if (error.message === 'Failed to generate questions from AI') {
            statusCode = 500;
            message = error.message;
        } else if (error.message === 'Failed to create quiz') {
            statusCode = 400;
            message = error.message;
        }
        
        return res.status(statusCode).json({ message });
    }
};

 const getAllQuiz = async (req, res) => {
  
     try {
        
        const {level = '', subject = '', search = '', page = 1, limit = 9} = req.query

         const subjectCondition = subject ? { subject: {$regex: subject, $options: 'i' } } : {};
         const levelCondition = level ? {level: {$regex: level, $options: 'i' } } : {};
          const searchCondition = search ? {
                      $or: [
                     { topic: { $regex: search, $options: 'i' } },
                     { subject: { $regex: search, $options: 'i' } },
                ]
                 } : {};

         const conditions = {
           $and: [
            subjectCondition,
            levelCondition,
            searchCondition
           ].filter(cond => Object.keys(cond).length > 0)
         }

         const skipCount = (page - 1) * limit
       
        const quiz = await Quiz.find(conditions)
                                .populate("userId", "username profilePics")
                                .sort({createdAt: -1})
                                .skip(skipCount)
                                .limit(limit)

        if(!quiz?.length) {
             return res.status(400).json({
                 message: 'No Quiz found'
             })
        }

        const quizCount = await Quiz.countDocuments(conditions)

        return res.status(201).json({
           message: 'Quiz fetched successfully.',
            quiz,
            totalPages: Math.ceil(quizCount / limit)
        })

     } catch(error) {
         console.log(error, 'Something went wront fetching quiz.')
         return res.status(500).json({
            message: 'Something went wrong fetching quiz.'
         })
     }

 }

  const getUserQuiz = async (req, res) => {
     try {
       const user = req.params.userId

        if(!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({
             message: 'Invalid ID format!'
           })
        }

        const userQuiz = await Quiz.find({userId: user}).populate("userId", "username profilePics")

       if(!userQuiz) {
         return res.status(400).json({
           message: 'No user quiz found!'
         })
       }

        res.status(201).json({
           message: 'User quiz fetched successfully.',
            userQuiz
        })
     } catch (error) {
       console.log('Something went wrong fetching user quiz.', error)
     }
  }

  const getQuizById = async (req, res) => {
  
       try {
  
        const {id} = req.params
  
       if(!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({
          message: 'Invalid Id format'
         })
       }
  
       const quiz = await Quiz.findById(id)
                                 .populate("userId", "username id")
  
       if(quiz._id?.toString() !== id) {
         return res.status(400).json({message: 'Not matching ID'})
       }
  
       const quizId = await quiz
  
       return res.status(201).json({
         message: 'Quiz fetched successfully.', quizId
       })
       } catch(error) {
         console.log(error, 'Something went wrong fetching quizId')
       }
  
     }

module.exports = {
     createQuiz,
     getAllQuiz,
     getUserQuiz,
     getQuizById
}