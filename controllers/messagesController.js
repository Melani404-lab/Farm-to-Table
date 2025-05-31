const express = require("express");
const router = express.Router();
const db = require("../models");
const jwt = require("jsonwebtoken");

// Middleware to verify the JWT token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header is missing" });
    }
    
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Token is missing" });
    }
    
    const jwtSecret = process.env.JWT_SIGNATURE;
    
    if (!jwtSecret) {
      console.error("JWT_SIGNATURE is not defined in environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }
    
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err.message);
        return res.status(403).json({ error: "Invalid token" });
      }
      
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
};

// Send a message
router.post("/api/messages", authenticateToken, async (req, res) => {
  try {
    const { recipient, content } = req.body;
    
    if (!content || !recipient) {
      return res.status(400).json({ error: "Recipient and content are required" });
    }
    
    // Get the sender ID from the token
    const senderId = req.user._id;
    
    if (!senderId) {
      return res.status(400).json({ error: "User ID not found in token" });
    }
    
    const newMessage = await db.Message.create({
      sender: senderId,
      recipient: recipient,
      content: content
    });

    // Populate sender and recipient information
    const populatedMessage = await db.Message.findById(newMessage._id)
      .populate("sender", "firstName lastName email")
      .populate("recipient", "firstName lastName email");

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get conversation between two users
router.get("/api/messages/conversation/:userId", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;
    
    // Get messages where currentUser is either sender or recipient
    const messages = await db.Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate("sender", "firstName lastName email")
    .populate("recipient", "firstName lastName email");
    
    res.json(messages);
  } catch (err) {
    console.error("Error retrieving conversation:", err);
    res.status(500).json({ error: "Failed to retrieve conversation" });
  }
});

// Get all conversations for current user
router.get("/api/messages", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    // Find all messages where user is either sender or recipient
    const messages = await db.Message.find({
      $or: [
        { sender: currentUserId },
        { recipient: currentUserId }
      ]
    })
    .sort({ createdAt: -1 })
    .populate("sender", "firstName lastName email")
    .populate("recipient", "firstName lastName email");
    
    // Group messages by conversation partner
    const conversations = {};
    
    messages.forEach(message => {
      // Determine the conversation partner (the other user)
      const partnerId = String(message.sender._id) === String(currentUserId)
        ? String(message.recipient._id)
        : String(message.sender._id);
      
      const partner = String(message.sender._id) === String(currentUserId)
        ? message.recipient 
        : message.sender;
        
      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          user: partner,
          lastMessage: message,
          unreadCount: 0
        };
      }
      
      // Count unread messages where current user is the recipient
      if (!message.read && String(message.recipient._id) === String(currentUserId)) {
        conversations[partnerId].unreadCount += 1;
      }
    });
    
    res.json(Object.values(conversations));
  } catch (err) {
    console.error("Error retrieving conversations:", err);
    res.status(500).json({ error: "Failed to retrieve conversations" });
  }
});

// Mark messages as read
router.put("/api/messages/read/:userId", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const senderId = req.params.userId;
    
    // Update all unread messages from sender to current user
    const result = await db.Message.updateMany(
      { 
        sender: senderId,
        recipient: currentUserId,
        read: false
      },
      { read: true }
    );
    
    res.json({ success: true, updatedCount: result.nModified || result.modifiedCount });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

// Get all users for messaging
router.get("/api/messages/users", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    // Find all users except current user
    const users = await db.User.find({ _id: { $ne: currentUserId } })
      .select("firstName lastName email role");
    
    res.json(users);
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).json({ error: "Failed to retrieve users" });
  }
});

module.exports = router;