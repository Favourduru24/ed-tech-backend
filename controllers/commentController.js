const mongoose = require('mongoose')
const Comment = require('../models/Comment')

const createComment = async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        await session.withTransaction(async () => {
            const { feedId, content } = req.body;
            const userId = req.id;

            if(!mongoose.Types.ObjectId.isValid(userId)) {
               return res.status(400).json({
                message:'Invalid ID format'
               })
            }
            
            // Validate input
            if (!feedId || !content || !userId) {
                return res.status(400).json({ message: 'Missing required fields!' });
            }
            
            if (!mongoose.Types.ObjectId.isValid(feedId)) {
                return res.status(400).json({ message: 'Invalid feed ID!' });
            }
            
            const commentObject = {
                feedId,
                content,
                userId
            };
            
            const comment = await Comment.create([commentObject], { session });
            
            if (!comment) {
                throw new Error('Failed to create comment');
            }
            
            // If you need to update other collections, do it here within the same transaction
            
            res.status(201).json({ message: 'Comment created successfully', comment });
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Failed to create comment' });
    } finally {
        await session.endSession();
    }
};
 
const getComment = async (req, res) => {
  try {
    const { feedId } = req.params; // Changed from req.body to req.query

    if (!mongoose.Types.ObjectId.isValid(feedId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const comment = await Comment.find({feedId: feedId})
                                .populate('userId', 'username profilePics');

    if (!comment) {
      return res.status(404).json({ message: 'No Comment Found!' }); // 404 is better for "Not Found"
    }

    res.json({ comment });
  } catch (error) {
    console.log('Error fetching comments', error);
    res.status(500).json({ message: 'Server error' }); // Always send a response
  }
};

    const deleteComment  = async (req, res) => {
          
        try {
         const {commentId} = req.params

         if(!mongoose.Types.ObjectId.isValid(commentId)) {
           return res.status(400).json({
             message: 'Invalid ID format.'
           })
         }
             
         const comment = await Comment.deleteOne({
            _id: commentId,
            userId: req.id
         })

        if(!comment) {
              return res.status(404).json({ message: 'Comment not found' });
         }
        
            res.json({ message: 'Comment deleted' });
 
            } catch(error) {
                 console.log("Error deleting comment", error)
    }

    }

    const likeComment = async (req, res) => {

         try {
         const user = req.id
        const { commentId } = req.params;

      if(!mongoose.Types.ObjectId.isValid(commentId)) {
         return res.status(400).json({
             message: 'Invalid ID format.'
         })
      }

       if(!user) {
          return res.status(400).json({
             message: 'Invalid userID format.'
         })
       }

       const comment = await Comment.findById(commentId)

        if(!comment){
             return res.status(404).json({
                message: 'No comment found'
             })
        }
       
        const likeIndex = comment.likes.indexOf(user)

        if(likeIndex > -1) {
         comment.likes.splice(likeIndex, 1)
          await comment.save()
           return res.status(200).json({
            message: 'Comment unliked successfully!',
            liked: false,
            likeCount: comment.likes.length,
           })
       } else {
         comment.likes.push(user)
         await comment.save()
         return res.status(200).json({
             message: 'Comment liked successfully',
             likeCount: comment.likes.length,
            comment
         })
       }
         } catch(error) {
            console.log(error, 'Something went wrong with the comment.')
            return res.status(500).json({
                message: 'Something went wrong with the comment.',
               error
            })
         }
     
    }
     

module.exports = {
     createComment,
     getComment,
     deleteComment,
     likeComment,

}