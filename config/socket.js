const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const Notification = require('../models/Notification')

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

let onlineUsers = [];

 const addNewUser = (userId, username, socketId) => {
  if(!onlineUsers.some(user => user.userId === userId)) {
     onlineUsers.push({
      userId,
       socketId,
       username
     })
  }
 }

 const removeUser = (socketId) => {
   onlineUsers = onlineUsers.filter(user => user.socketId !== socketId)
 }

const getUserById = (userId) => {
    return onlineUsers.find(user => user.userId === userId)
}

const getUserByName = (username) => {
   return onlineUsers.find(user => user.username === username)
}

   const sendNotification = async ({senderName, senderId, receiverId, postId, type}) => {

     try {

            const title = type === 'like' ? 'New Like on Your Feed!' : 
                 type === 'comment' ? 'New Comment on Your Feed!' : 
                 type === 'share' ? 'New Share on Your Feed!' : 
                 type === 'quiz' ? '' : type === 'tutor' ? '' : '' 

        const notification = new Notification({
              recipient:  receiverId,
              sender: senderId,
              post: postId,
              type: type,
              title,
              read: false
      })

         await notification.save()

        //  const recipient = getUserById(receiverId) || getUserByName(receiverName)

              if(receiverId) {
              io.to(receiverId).emit('getNotification', {  // receiver.socketId
                     _id: notification._id,
                     sender: {
                       _id: senderId,
                       username: senderName
                     },
                     post: postId,
                     type,
                     read: false,
                     createdAt: notification.createdAt
                   });
          }

            return notification

     } catch (error) {
        console.error('Error emitting notification:', error);
        throw error;
     }
   }

   io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
  
    // Register user when they authenticate
    socket.on("newUser", ({ userId, username }) => {
      addNewUser(userId, username, socket.id);
      console.log(`User ${username} (${userId}) connected with socket ${socket.id}`);
    });
  
    // Handle notification requests
    socket.on("sendNotification", async ({ senderId, senderName, receiverName, postId, type, receiverId }) => {
      try {
        // In a real app, you'd verify the sender is who they claim to be
        await sendNotification({
          senderId,
          senderName,
          receiverName,
          postId,
          receiverId,
          type
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    });
  
    socket.on("disconnect", () => {
      removeUser(socket.id);
      console.log(`User disconnected: ${socket.id}`);
    });
  });
   
  module.exports = { app, io, server };