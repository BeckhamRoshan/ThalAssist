import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalytics, setAiAnalytics] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with AI greeting
    const initChat = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'hello' }),
        });

        const data = await response.json();
        setMessages([{
          type: 'bot',
          content: data.response,
          timestamp: new Date(),
          aiCategory: data.ai_category,
          confidence: data.confidence,
          aiActions: data.ai_actions,
          suggestedQueries: data.suggested_queries
        }]);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initChat();
    loadAiAnalytics();
  }, []);

  const loadAiAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/ai/analytics');
      const analytics = await response.json();
      setAiAnalytics(analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const sendMessage = async (messageText = null) => {
    const message = messageText || inputMessage.trim();
    if (!message) return;

    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message, location: 'Hyderabad' }),
      });

      const data = await response.json();

      setTimeout(() => {
        const botMessage = {
          type: 'bot',
          content: data.response,
          timestamp: new Date(),
          aiCategory: data.ai_category,
          confidence: data.confidence,
          severity: data.severity,
          aiActions: data.ai_actions,
          relatedTopics: data.related_topics,
          suggestedQueries: data.suggested_queries,
          emergencyContacts: data.emergency_contacts
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        setIsLoading(false);

        loadAiAnalytics();
      }, 1000 + Math.random() * 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        type: 'bot',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleBloodBridgeAction = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/blood-bridge/coordinate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blood_type: 'B+',
          location: 'Hyderabad',
          urgency: 'high',
          contact: 'user@example.com'
        }),
      });

      const data = await response.json();
      const actionMessage = {
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
        isAction: true,
        actionData: data
      };

      setMessages(prev => [...prev, actionMessage]);
    } catch (error) {
      console.error('Error with blood bridge action:', error);
    }
  };

  const handleEmergencyRequest = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/emergency/blood-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blood_type: 'O-',
          location: 'Hyderabad',
          urgency: 'emergency',
          contact: 'emergency@example.com'
        }),
      });

      const data = await response.json();
      const emergencyMessage = {
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
        isEmergency: true,
        emergencyData: data
      };

      setMessages(prev => [...prev, emergencyMessage]);
    } catch (error) {
      console.error('Error with emergency request:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const renderMessage = (message, index) => {
    const isBot = message.type === 'bot';
    return (
      <div key={index} className={`message ${isBot ? 'bot-message' : 'user-message'}`}>
        <div className="message-content">
          {isBot && <div className="bot-avatar">🤖</div>}
          <div className="message-bubble">
            <div className="message-text">{message.content}</div>

            {isBot && message.aiCategory && (
              <div className="ai-metadata">
                <span className="ai-category">Category: {message.aiCategory}</span>
                {message.confidence && (
                  <span className="ai-confidence">
                    Confidence: {Math.round(message.confidence * 100)}%
                  </span>
                )}
                {message.severity && (
                  <span className={`severity ${message.severity}`}>
                    {message.severity.toUpperCase()}
                  </span>
                )}
              </div>
            )}

            {message.emergencyContacts && (
              <div className="emergency-contacts">
                <h4>🚨 Emergency Contacts:</h4>
                {message.emergencyContacts.map((contact, idx) => (
                  <div key={idx} className="emergency-contact">
                    <strong>{contact.service}:</strong> 
                    <a href={`tel:${contact.number}`}>{contact.number}</a>
                  </div>
                ))}
              </div>
            )}

            {message.aiActions && (
              <div className="ai-actions">
                <button 
                  className="action-button primary"
                  onClick={() => {
                    if (message.aiActions.primary === "Start Blood Bridge") handleBloodBridgeAction();
                    if (message.aiActions.primary === "Activate Emergency Network") handleEmergencyRequest();
                  }}
                >
                  {message.aiActions.primary}
                </button>
              </div>
            )}

            {message.suggestedQueries && message.suggestedQueries.length > 0 && (
              <div className="suggested-queries">
                <h4>💡 Try asking:</h4>
                {message.suggestedQueries.map((query, idx) => (
                  <button key={idx} onClick={() => handleSuggestionClick(query)}>
                    {query}
                  </button>
                ))}
              </div>
            )}

            <div className="message-time">
              {message.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chatbot-container">
      {aiAnalytics && (
        <div className="ai-analytics-header">
          <div>Conversations: {aiAnalytics.total_conversations}</div>
          <div>Active Requests: {aiAnalytics.active_blood_requests}</div>
          <div>AI Accuracy: {aiAnalytics.ai_routing_accuracy}</div>
        </div>
      )}

      <div className="chat-header">
        <h2>🤖 ThalAssist+ AI Chatbot</h2>
      </div>

      <div className="chat-messages">
        {messages.map(renderMessage)}
        {isTyping && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="bot-avatar">🤖</div>
              <div className="message-bubble">
                <div className="typing-indicator"><span></span><span></span><span></span></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="quick-actions">
        <button onClick={handleEmergencyRequest}>🚨 Emergency Blood</button>
        <button onClick={() => sendMessage('Find blood banks near me')}>🩸 Find Blood Banks</button>
        <button onClick={() => sendMessage('I want to donate blood')}>💝 Become Donor</button>
      </div>

      <div className="chat-input">
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about thalassemia, blood needs, or emergencies..."
          onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
          disabled={isLoading}
        />
        <button onClick={() => sendMessage()} disabled={isLoading || !inputMessage.trim()}>
          {isLoading ? '⏳' : '🚀'}
        </button>
        <button onClick={clearChat}>🗑️ Clear Chat</button>
      </div>
    </div>
  );
};

export default Chatbot;
