import React, { useState, useEffect } from 'react';
import API from '../../utils/API';
import './MessageNotification.css';

const MessageNotification = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Function to load conversations and count unread messages
    const loadUnreadMessages = () => {
      if (!localStorage.getItem('token')) return;
      
      API.getConversations()
        .then(res => {
          const conversations = res.data;
          const totalUnread = conversations.reduce(
            (total, conv) => total + (conv.unreadCount || 0), 
            0
          );
          setUnreadCount(totalUnread);
        })
        .catch(err => console.error('Error loading unread messages:', err));
    };

    // Load unread messages on mount
    loadUnreadMessages();
    
    // Set up interval to check for new messages every minute
    const interval = setInterval(loadUnreadMessages, 60000);
    
    // Clear interval on unmount
    return () => clearInterval(interval);
  }, []);

  return unreadCount > 0 ? (
    <span className="message-badge">{unreadCount}</span>
  ) : null;
};

export default MessageNotification;