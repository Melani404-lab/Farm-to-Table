import React, { useState, useEffect, useRef } from "react";
import API from "../../utils/API";
import "./Messages.css";
import moment from "moment";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messageEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user")) || { _id: localStorage.getItem("userId") };

  // Load conversations when component mounts
  useEffect(() => {
    loadConversations();
    loadUsers();
  }, []);

  // Scroll to bottom of messages when messages change or user is selected
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  // Load all conversations
  const loadConversations = () => {
    setIsLoading(true);
    API.getConversations()
      .then((res) => {
        setConversations(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading conversations:", err);
        setIsLoading(false);
      });
  };

  // Load all users for new message
  const loadUsers = () => {
    API.getUsers()
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.error("Error loading users:", err));
  };

  // Select a conversation
  const selectConversation = (userId) => {
    setSelectedUser(userId);
    
    // Mark messages as read
    API.markAsRead(userId)
      .then(() => {
        // Update unread count in conversations
        setConversations(prevConversations => 
          prevConversations.map(conv => {
            if (conv.user._id === userId) {
              return { ...conv, unreadCount: 0 };
            }
            return conv;
          })
        );
      })
      .catch(err => console.error("Error marking messages as read:", err));

    // Load conversation messages
    API.getConversation(userId)
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => console.error("Error loading conversation:", err));
  };

  // Send a message
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const messageData = {
      recipient: selectedUser,
      content: newMessage
    };
    
    API.sendMessage(messageData)
      .then((res) => {
        setNewMessage("");
        // Add new message to messages
        setMessages([...messages, res.data]);
        
        // Update conversations list
        loadConversations();
      })
      .catch((err) => console.error("Error sending message:", err));
  };

  // Start a new conversation
  const startNewConversation = (userId) => {
    setSelectedUser(userId);
    setMessages([]);
    setShowNewMessage(false);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = moment(timestamp);
    const now = moment();
    
    if (date.isSame(now, 'day')) {
      return date.format('LT'); // Today at HH:MM AM/PM
    } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
      return 'Yesterday ' + date.format('LT');
    } else if (date.isSame(now, 'year')) {
      return date.format('MMM D'); // Month Day
    } else {
      return date.format('MM/DD/YYYY'); // Full date
    }
  };

  // Get user display name - handles cases where firstName/lastName might not be available
  const getUserDisplayName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.email) {
      return user.email.split('@')[0]; // Use part before @ in email
    } else {
      return "User";
    }
  };

  // Get user initials for avatar
  const getUserInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    } else if (user.firstName) {
      return user.firstName.charAt(0);
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    } else {
      return "U";
    }
  };

  return (
    <div className="messages-container">
      <div className="messages-sidebar">
        <div className="messages-header">
          <h2>Messages</h2>
          <button 
            className="new-message-button"
            onClick={() => setShowNewMessage(!showNewMessage)}
          >
            {showNewMessage ? "Cancel" : "New Message"}
          </button>
        </div>
        
        {showNewMessage ? (
          <div className="new-message-users">
            <h3>Select a user</h3>
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  className="user-item"
                  onClick={() => startNewConversation(user._id)}
                >
                  <div className="user-avatar">
                    {getUserInitials(user)}
                  </div>
                  <div className="user-info">
                    <div className="user-name">
                      {getUserDisplayName(user)}
                    </div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>
              ))
            ) : (
              <p>No users available</p>
            )}
          </div>
        ) : (
          <div className="conversations-list">
            {isLoading ? (
              <div className="loading">Loading conversations...</div>
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.user._id}
                  className={`conversation-item ${
                    selectedUser === conversation.user._id ? "active" : ""
                  } ${conversation.unreadCount > 0 ? "unread" : ""}`}
                  onClick={() => selectConversation(conversation.user._id)}
                >
                  <div className="conversation-avatar">
                    {getUserInitials(conversation.user)}
                  </div>
                  <div className="conversation-details">
                    <div className="conversation-header">
                      <div className="conversation-name">
                        {getUserDisplayName(conversation.user)}
                      </div>
                      <div className="conversation-time">
                        {formatTime(conversation.lastMessage.createdAt)}
                      </div>
                    </div>
                    <div className="conversation-preview">
                      {String(conversation.lastMessage.sender._id) === String(currentUser._id) ? (
                        <span className="sent-prefix">You: </span>
                      ) : null}
                      {conversation.lastMessage.content.length > 30
                        ? conversation.lastMessage.content.substring(0, 30) + "..."
                        : conversation.lastMessage.content}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="unread-badge">{conversation.unreadCount}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-messages">No conversations yet</p>
            )}
          </div>
        )}
      </div>

      <div className="messages-content">
        {selectedUser ? (
          <>
            <div className="messages-header">
              {conversations.find((c) => c.user._id === selectedUser) ? (
                <h2>
                  {getUserDisplayName(conversations.find((c) => c.user._id === selectedUser).user)}
                </h2>
              ) : users.find((u) => u._id === selectedUser) ? (
                <h2>
                  {getUserDisplayName(users.find((u) => u._id === selectedUser))}
                </h2>
              ) : (
                <h2>New Conversation</h2>
              )}
            </div>
            
            <div className="messages-list">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`message ${
                    String(message.sender._id) === String(currentUser._id) ? "sent" : "received"
                  }`}
                >
                  <div className="message-content">{message.content}</div>
                  <div className="message-time">{formatTime(message.createdAt)}</div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
            
            <form className="message-form" onSubmit={sendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
              />
              <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <h2>Select a conversation or start a new one</h2>
            <p>Choose a user from the list to send messages</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;