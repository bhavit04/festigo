import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Messages.css';

const CollegeMessages = ({ collegeId, collegeName }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/conversations/college/${collegeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const newConversations = Array.isArray(response.data) ? response.data : [];
      setConversations(newConversations);

      // If there's a selected conversation, update it with the latest data
      if (selectedConversation) {
        const updatedConversation = newConversations.find(
          conv => conv._id === selectedConversation._id
        );
        if (updatedConversation) {
          setSelectedConversation(updatedConversation);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collegeId) {
      const init = async () => {
        const searchParams = new URLSearchParams(location.search);
        const brandId = searchParams.get('brandId');
        const eventId = searchParams.get('eventId');

        if (brandId && eventId) {
          await initializeConversation(brandId, eventId);
        }
        
        await fetchConversations();
      };

      init();
      
      const pollInterval = setInterval(fetchConversations, 3000);
      
      return () => clearInterval(pollInterval);
    }
  }, [collegeId, location.search]);

  const initializeConversation = async (brandId, eventId) => {
    try {
      // First, cleanup any duplicates
      await axios.post('http://localhost:5000/api/conversations/cleanup', {
        collegeId,
        brandId,
        eventId
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Then proceed with conversation initialization
      const response = await axios.post('http://localhost:5000/api/conversations', {
        collegeId,
        brandId,
        eventId,
        initialMessage: true
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Conversation initialized:', response.data);
      setSelectedConversation(response.data);
      await fetchConversations();
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Send the message
      const messageResponse = await axios.post('http://localhost:5000/api/messages', {
        conversationId: selectedConversation._id,
        senderId: collegeId,
        senderType: 'college',
        content: newMessage
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Clear the input
      setNewMessage('');
      
      // Update the selected conversation with the response data
      setSelectedConversation(messageResponse.data);
      
      // Also update the conversations list
      await fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  console.log('Current conversations:', conversations);
  console.log('Is conversations an array?', Array.isArray(conversations));

  return (
    <div className="messages-container">
      <div className="conversations-list">
        <h2>Messages</h2>
        {loading ? (
          <div className="loading">Loading conversations...</div>
        ) : !Array.isArray(conversations) || conversations.length === 0 ? (
          <div className="no-conversations">No conversations yet</div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv._id}
              className={`conversation-item ${selectedConversation?._id === conv._id ? 'selected' : ''} ${conv.unread ? 'unread' : ''}`}
              onClick={() => setSelectedConversation(conv)}
            >
              <div className="conversation-header">
                <h3>{conv.brand?.companyName || 'Unknown Brand'}</h3>
                <span className="timestamp">
                  {conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp).toLocaleDateString() : 'No messages'}
                </span>
              </div>
              <div className="event-info">
                <small>Re: {conv.event?.title || 'Unknown Event'}</small>
              </div>
              <p className="last-message">{conv.lastMessage?.content || 'No messages yet'}</p>
            </div>
          ))
        )}
      </div>

      <div className="message-view">
        {selectedConversation ? (
          <>
            <div className="message-header">
              <h3>{selectedConversation.brand.companyName}</h3>
              <div className="event-details">
                <small>Event: {selectedConversation.event.title}</small>
              </div>
            </div>
            <div className="messages-list">
              {selectedConversation.event && (
                <div className="event-card-message">
                  <h4>{selectedConversation.event.title}</h4>
                  <p>Date: {new Date(selectedConversation.event.date).toLocaleDateString()}</p>
                  <p>Sponsorship: ${selectedConversation.event.sponsorshipNeeded}</p>
                </div>
              )}
              {selectedConversation.messages?.map(message => (
                <div 
                  key={message._id}
                  className={`message ${
                    message.isSystemMessage 
                      ? 'system' 
                      : message.senderType === 'college' 
                        ? 'sent' 
                        : 'received'
                  }`}
                >
                  <div className="message-content">
                    {message.isSystemMessage ? 'Conversation started' : message.content}
                  </div>
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeMessages; 
