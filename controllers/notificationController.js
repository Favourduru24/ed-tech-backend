const Notification = require('../models/Notification')
const mongoose = require('mongoose')

const getNotification = async (req, res) => {
  try {
        
     const {search} = req.query

    const titleCondition = search ? { title: { $regex: search, $options: 'i' } } : {};

    const notifications = await Notification.find(titleCondition)
      .populate('sender', 'username _id') // Include sender details
      .lean()
      .sort({ createdAt: -1 });

    // Return empty array instead of 404 for consistency
    res.status(200).json(notifications.map(notif => ({
      id: notif._id,  // Convert _id to id
      type: notif.type,
      read: notif.read,
      title: notif.title,
      createdAt: notif.createdAt,
      sender: notif.sender, // Already populated
      postId: notif.post
    })));

  } catch (error) {
    console.error('Notification fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

 const deleteNotification = async(req, res) =>{
      
  try {
    
   const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)) {
       return res.status(400).json({
        message: 'Invalid ID format'
       })
    }

    await Notification.deleteOne({_id: id})
    res.status(200).json({message: 'Notification deleted successfully!'})
    
  } catch(error) {
    console.log('Error occur deleting notification!', error)
    return res.status(500).json({message: 'Something went wrong'})
  }
    
 }

module.exports = {
    getNotification,
    deleteNotification
}