const Feed = require('../models/Feed')
const mongoose = require('mongoose')
const Category = require('../models/Category')
const Comment = require('../models/Comment')
const User = require('../models/User')
const cloudinary = require('../config/cloudinary')
const {emitLikeNotification, io} = require('../config/socket')

const createFeed = async (req, res, next) => {
  const session = await mongoose.startSession();
  
  try {
      await session.startTransaction()
      
      const { title, pitch, category, userId, image, description } = req.body;

      // More detailed validation
      const missingFields = [];
      if (!title) missingFields.push('title');
      if (!pitch) missingFields.push('pitch');
      if (!category) missingFields.push('category');
      if (!userId) missingFields.push('userId');
      if (!description) missingFields.push('description');

      if (missingFields.length > 0) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
              message: 'Missing required fields',
              missingFields
          });
      }

      const feedObject = { title, pitch, category, image, userId, description };

      const feed = await Feed.create([feedObject], { session });

      if (!feed) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: 'Feed creation failed' });
      }

      await session.commitTransaction();
      session.endSession();
      return res.status(201).json({ message: 'Feed created successfully!', feed });

  } catch (error) {
       next(error)
      await session.abortTransaction();
      session.endSession();
      console.error('Error in createFeed:', error);
      return res.status(500).json({ 
          message: 'Internal server error',
          error: error.message 
      });
  }
};

  const getCategoryByName = async (name) => {
    return Category.findOne({ name: { $regex: name, $options: 'i' } })
  }

  const getAllFeed = async (req, res) => {
    try {
        const { search, page = 1, limit = 5, category = '', date } = req.query; 
        const numPage = Number(page);
        const numLimit = Number(limit);

        let timeCondition = {};
     
        if (date) {
            const now = new Date();
            
            if (date === '1hr') {
                timeCondition.createdAt = { $gte: new Date(now - 60 * 60 * 1000) };
            } 
            else if (date === 'yesterday') {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                timeCondition.createdAt = { $gte: yesterday };
            } 
            else if (date === '1week') {
                const lastWeek = new Date(now);
                lastWeek.setDate(lastWeek.getDate() - 7);
                timeCondition.createdAt = { $gte: lastWeek };
            }
        }

        const searchCondition = search ? {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ]
        } : {};

        const categoryCondition = category ? await getCategoryByName(category) : null;

        if (category && !categoryCondition) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const conditions = {
            $and: [
                timeCondition,
                searchCondition, 
                categoryCondition ? { category: categoryCondition._id } : {}
            ].filter(cond => Object.keys(cond).length > 0)
        };

        const skipAmount = (numPage - 1) * numLimit;

        const feeds = await Feed.find(conditions)
            .sort({ createdAt: -1 })
            .skip(skipAmount)
            .limit(numLimit)
            .populate("userId", "username profilePics")
            .populate("category", "_id name");

        if(!feeds.length) return res.status(404).json({ message: 'No feed found!' });

        // Get comment counts for all feeds at once
        const feedIds = feeds.map(feed => feed._id);
        const commentCounts = await Comment.aggregate([
            { $match: { feedId: { $in: feedIds } } },
            { $group: { _id: "$feedId", count: { $sum: 1 } } }
        ]);

        // Convert to a map for easy lookup
        const commentCountMap = commentCounts.reduce((map, item) => {
            map[item._id.toString()] = item.count;
            return map;
        }, {});

        // Add comment counts to each feed
        const feedsWithCommentCounts = feeds.map(feed => {
            return {
                ...feed.toObject(),
                commentCount: commentCountMap[feed._id.toString()] || 0
            };
        });
       
        const feedsCount = await Feed.countDocuments(conditions);

        return res.status(200).json({
            feeds: feedsWithCommentCounts, 
            totalPages: Math.ceil(feedsCount / numLimit),
        });
  
    } catch(error) {
        console.error('Error fetching feeds:', error);
        return res.status(500).json({ message: 'Server error fetching feeds' });
    }
}
 
  const getFeedById = async (req, res) => {

         try{
         const {id } = req.params

         if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: 'Invalid ID format' });
        }

       const feedQuery = await Feed.findById(id)
                          .populate("category", "name")
                          .populate("userId", "username profilePics")

        if(feedQuery._id.toString() !== id) {
         return res.status(400).json({message: 'No feedId found!'})
        }

         const feedId = await feedQuery

         return res.status(200).json({message: 'Fetch Feed Successfully', feedId})

      } catch(error) {
        console.log('Error fetching feedId', error)
       }
  }

  const updateFeed = async (req, res, next) => {
    const session = await mongoose.startSession();
    
    try {
        await session.startTransaction();
        const { id } = req.params
        const { title, pitch, category, image, description} = req.body;
         
           
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Update operation
        const updatedFeed = await Feed.findByIdAndUpdate(
          id,
          { 
            title,
            pitch,
            category,
            description, // Optional
            image: image || null,
          },
          { new: true, runValidators: true, session }
        );

        if (!updatedFeed) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(404).json({ message: 'Feed not found'});
        }

        await session.commitTransaction();
        await session.endSession();
        
        return res.status(200).json({
            message: 'Feed updated successfully',
            feed: updatedFeed
        });

    } catch (error) {
        // Make sure we abort transaction if anything fails
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        if (session) {
            await session.endSession();
        }
        
        console.error('Error updating feed:', error);
        return res.status(500).json({
            message: 'Failed to update feed',
            error: error.message
        });
    }
};

const deleteFeed = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // Explicitly start transaction

  try {
    const { id } = req.params;
    const user = req.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid ID Format' });
    }

    const feed = await Feed.findOne({ _id: id, userId: user }).session(session);
    
    if (!feed) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'No feed found with this ID' });
    }

    // Delete Cloudinary image (if exists)
    if (feed.image?.cloudinaryPublicId) {
      const cloudinaryResult = await cloudinary.uploader.destroy(
        feed.image.cloudinaryPublicId
      );
      if (cloudinaryResult.result !== 'ok') {
        throw new Error('Cloudinary deletion failed');
      }
    }

    // Delete MongoDB data
    await Feed.deleteOne({ _id: id }).session(session);
    await Comment.deleteMany({ feedId: id }).session(session);

    await session.commitTransaction();
    res.status(200).json({ message: 'Feed deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error deleting feed:", error);
    res.status(500).json({ message: 'Failed to delete feed' });
  } finally {
    session.endSession();
  }
};


  const getUserFeed = async (req, res) => {

     try {
       
       const user = req.params.userId

       const userFeed = await Feed.find({userId: user})
        .sort({createdAt: -1})
        .populate("userId", "username profilePics")

      if(!userFeed) {
        return res.status(400).json({
        message: 'No Feed Found!'
        })
      }

      res.status(201).json({message: 'Feed fetched successfully!', userFeed})
      
     } catch(error) {
      console.log('Error Fetching Feed!', error)
       res.status(500).json({message: 'Something went wrong fetching feed.'})
      }}


       const likeFeed = async (req, res) => {
        try {
            const {userId }= req.body;
            const { id } = req.params;
            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid ID format!' });
            }
    
            const feed = await Feed.findById(id);
            if (!feed) {
                return res.status(404).json({ message: 'No Feed Found!' });
            }
    
            // Toggle like
            const likeIndex = feed.likes.indexOf(userId);
            if (likeIndex > -1) {
                feed.likes.splice(likeIndex, 1);
                await feed.save();
                return res.status(200).json({ 
                    message: 'Post unliked successfully',
                    liked: false,
                    likeCount: feed.likes.length
                });
            } else {
                feed.likes.push(userId);
                await feed.save();
                return res.status(200).json({ 
                    message: 'Post liked successfully',
                    liked: true,
                    likeCount: feed.likes.length,
                    feed
                });
            }

          // if (feed.userId.toString() !== userId) {
          //       await emitLikeNotification({
          //         postOwnerId: feed.userId,
          //         likerId: userId,
          //         postId: feed._id
          //       });
          //     }

        } catch (error) {
            console.error('Like error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

     const getRelatedFeedByCategory = async (req, res) => {
  try {
    const { id, categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        message: 'Invalid credentials received.'   
      });
    }
   
    const conditions = { 
      $and: [
        { category: categoryId }, 
        { _id: { $ne: id } }
      ] 
    };
    
    const feeds = await Feed.find(conditions)
                          .populate("userId", 'username profilePics')
                          .sort({ createdAt: -1 });

    if (!feeds || feeds.length === 0) {
      return res.status(404).json({
        message: 'No related feeds found.'
      });
    }

    return res.status(200).json(feeds); // Directly return the array

  } catch(error) {
    console.log("Error fetching feed by category!", error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};



module.exports = {
                   createFeed,
                   getAllFeed,
                   getFeedById,
                   updateFeed,
                   likeFeed,
                   deleteFeed,
                   getUserFeed,
                   getRelatedFeedByCategory
                  }