import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const ChatbotModal = ({ user, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Hello ${user?.name}! I'm your ThalAssist AI assistant. I can help you with information about your ${user?.userType === 'donor' ? 'donations' : 'medical needs'}, blood availability, and answer any questions you have. How can I assist you today?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
  if (!inputValue.trim()) return;

  const userMessage = {
    id: messages.length + 1,
    type: 'user',
    content: inputValue,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputValue('');
  setIsTyping(true);

  try {
    const botResponse = await sendMessageToAPI(inputValue);
    const botMessage = {
      id: messages.length + 2,
      type: 'bot',
      content: botResponse,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = {
      id: messages.length + 2,
      type: 'bot',
      content: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMessage]);
  }
  
  setIsTyping(false);
};

  const sendMessageToAPI = async (message) => {
  const response = await fetch('/api/chatbot/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ message }),
  });
  
  const data = await response.json();
  return data.response;
};


  const getCompatibleBloodGroups = (bloodGroup, userType) => {
    const compatibility = {
      'O-': userType === 'donor' ? 'You can donate to anyone! You\'re a universal donor.' : 'You can only receive O- blood.',
      'O+': userType === 'donor' ? 'You can donate to O+, A+, B+, AB+' : 'You can receive from O+, O-',
      'A-': userType === 'donor' ? 'You can donate to A+, A-, AB+, AB-' : 'You can receive from A-, O-',
      'A+': userType === 'donor' ? 'You can donate to A+, AB+' : 'You can receive from A+, A-, O+, O-',
      'B-': userType === 'donor' ? 'You can donate to B+, B-, AB+, AB-' : 'You can receive from B-, O-',
      'B+': userType === 'donor' ? 'You can donate to B+, AB+' : 'You can receive from B+, B-, O+, O-',
      'AB-': userType === 'donor' ? 'You can donate to AB+, AB-' : 'You can receive from AB-, A-, B-, O-',
      'AB+': userType === 'donor' ? 'You can only donate to AB+' : 'You can receive from anyone! You\'re a universal recipient.'
    };
    return compatibility[bloodGroup] || 'Blood group compatibility information not available.';
  };

  const getCompatibleDonors = (recipientBloodGroup) => {
    const donorCompatibility = {
      'O-': ['O-'],
      'O+': ['O-', 'O+'],
      'A-': ['O-', 'A-'],
      'A+': ['O-', 'O+', 'A-', 'A+'],
      'B-': ['O-', 'B-'],
      'B+': ['O-', 'O+', 'B-', 'B+'],
      'AB-': ['O-', 'A-', 'B-', 'AB-'],
      'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
    };
    return donorCompatibility[recipientBloodGroup] || [];
  };

  const quickQuestions = [
    "What's my blood group compatibility?",
    "Show my profile details",
    user?.userType === 'donor' ? "When can I donate next?" : "When is my next transfusion?",
    "Find nearby blood banks",
    "Emergency help needed"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-red-600 text-white rounded-t-lg">
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">ThalAssist AI</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Questions */}
        <div className="p-2 border-t bg-gray-50">
          <div className="flex flex-wrap gap-1 mb-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputValue(question);
                  handleSendMessage();
                }}
                className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex p-4 border-t">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2 bg-red-600 text-white rounded-r-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotModal;