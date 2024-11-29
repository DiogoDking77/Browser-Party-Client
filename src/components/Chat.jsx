import React, { useState, useEffect } from 'react';

const Chat = ({ userName, roomName, socket }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = { userName, message };
      socket.emit('sendMessage', { roomName, ...newMessage });
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Lista de mensagens */}
      <div className="flex-1 overflow-y-auto mb-4 bg-gradient-to-b from-gray-800 to-gray-700 p-4 rounded-lg">
        {messages.map((msg, index) => (
          <p
            key={index}
            className={`mb-2 ${msg.isSystem ? 'text-gray-500 italic' : ''}`}
          >
            <strong className={`${msg.isSystem ? 'text-gray-600' : 'text-pink-600'}`}>
              {msg.userName}:
            </strong>{' '}
            {msg.message}
          </p>
        ))}
      </div>

      {/* Campo de entrada */}
      <div className="flex">
        <input
          type="text"
          className="border p-2 flex-1 rounded-l text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="bg-pink-500 hover:bg-pink-700 text-white p-2 rounded-r shadow-lg transition transform hover:scale-110"
          onClick={handleSendMessage}
        >
          📨 Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
