import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m ThalAssist+, your AI assistant for thalassemia information. I can help you with treatment info, symptoms, diet advice, and more. How can I assist you today?',
      timestamp: new Date(),
      suggestions: [
        'What is thalassemia?',
        'Find blood banks near me',
        'Thalassemia treatment options',
        'Diet for thalassemia patients'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickQuestions = [
    { text: 'What is thalassemia?', icon: '❓' },
    { text: 'Thalassemia symptoms', icon: '🩺' },
    { text: 'Treatment options', icon: '💊' },
    { text: 'Diet and nutrition', icon: '🍎' },
    { text: 'Blood transfusion info', icon: '🩸' },
    { text: 'Find blood banks', icon: '🏥' },
    { text: 'Prevention tips', icon: '🛡️' },
    { text: 'Living with thalassemia', icon: '💪' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/chat?query=${encodeURIComponent(text.trim())}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Simulate typing delay
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: data.response,
          timestamp: new Date(),
          topic: data.topic,
          confidence: data.confidence,
          relatedTopics: data.related_topics,
          followUpQuestions: data.follow_up_questions,
          actionButton: data.action_button,
          severity: data.severity,
          suggestions: data.available_topics,
          emergencyContacts: data.emergency_contacts
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds

    } catch (error) {
      console.error('Chat error:', error);
      setTimeout(() => {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Sorry, I\'m having trouble connecting right now. Please try again or contact support if the problem persists.',
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleQuickQuestion = (question) => {
    sendMessage(question);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      type: 'bot',
      text: 'Chat cleared! How can I help you with thalassemia information?',
      timestamp: new Date(),
      suggestions: [
        'What is thalassemia?',
        'Find blood banks near me',
        'Thalassemia treatment options',
        'Diet for thalassemia patients'
      ]
    }]);
  };

  const renderMessage = (message) => {
    const isBot = message.type === 'bot';
    
    return (
      <div key={message.id} className={`message ${message.type}`}>
        <div className="message-avatar">
          {isBot ? '🤖' : '👤'}
        </div>
        
        <div className="message-content">
          <div className={`message-bubble ${message.isError ? 'error' : ''} ${message.severity || ''}`}>
            <p className="message-text">{message.text}</p>
            
            {message.topic && (
              <div className="message-meta">
                <span className="topic-tag">Topic: {message.topic}</span>
                {message.confidence && (
                  <span className={`confidence-badge ${message.confidence}`}>
                    {message.confidence} confidence
                  </span>
                )}
              </div>
            )}

            {message.actionButton && (
              <div className="action-button">
                <button 
                  className="btn btn-action"
                  onClick={() => {
                    if (message.actionButton.action === 'blood_search') {
                      window.location.href = '/blood-availability';
                    }
                  }}
                >
                  {message.actionButton.text}
                </button>
                <small>{message.actionButton.description}</small>
              </div>
            )}

            {message.emergencyContacts && (
              <div className="emergency-contacts">
                <h4>🚨 Emergency Contacts:</h4>
                <div className="contacts-grid">
                  {Object.entries(message.emergencyContacts).map(([name, number]) => (
                    <div key={name} className="contact-item">
                      <span className="contact-name">{name}:</span>
                      <a href={`tel:${number}`} className="contact-number">{number}</a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message.relatedTopics && message.relatedTopics.length > 0 && (
              <div className="related-topics">
                <h4>Related Topics:</h4>
                <div className="topics-list">
                  {message.relatedTopics.map((topic, index) => (
                    <button
                      key={index}
                      className="topic-btn"
                      onClick={() => handleSuggestionClick(`Tell me about ${topic}`)}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {message.followUpQuestions && message.followUpQuestions.length > 0 && (
              <div className="follow-up-questions">
                <h4>You might also ask:</h4>
                <div className="questions-list">
                  {message.followUpQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="question-btn"
                      onClick={() => handleSuggestionClick(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {message.suggestions && message.suggestions.length > 0 && (
              <div className="suggestions">
                <h4>Available Topics:</h4>
                <div className="suggestions-list">
                  {message.suggestions.slice(0, 4).map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-btn"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="message-time">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chatbot">
      <div className="container">
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-title">
              <h1>🤖 ThalAssist+ AI Assistant</h1>
              <p>Get instant answers about thalassemia care and treatment</p>
            </div>
            <button className="clear-btn" onClick={clearChat}>
              🗑️ Clear Chat
            </button>
          </div>

          <div className="quick-questions">
            <h3>Quick Questions:</h3>
            <div className="questions-grid">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-question-btn"
                  onClick={() => handleQuickQuestion(question.text)}
                >
                  <span className="question-icon">{question.icon}</span>
                  <span className="question-text">{question.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="chat-messages">
            {messages.map(renderMessage)}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="message-bubble typing">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="chat-input-form">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me about thalassemia..."
                className="chat-input"
                disabled={isTyping}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={!inputText.trim() || isTyping}
              >
                {isTyping ? '⏳' : '🚀'}
              </button>
            </div>
          </form>

          <div className="chat-footer">
            <div className="chat-info">
              <p>
                <strong>Disclaimer:</strong> This AI assistant provides general information about thalassemia. 
                Always consult with healthcare professionals for medical advice and treatment decisions.
              </p>
              <div className="capabilities">
                <h4>I can help with:</h4>
                <ul>
                  <li>✅ General thalassemia information</li>
                  <li>✅ Treatment and care guidance</li>
                  <li>✅ Diet and lifestyle tips</li>
                  <li>✅ Blood bank and donor information</li>
                  <li>✅ Emergency procedures</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;