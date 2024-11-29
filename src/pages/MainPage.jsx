import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket'; // Importa a instância do socket

const MainPage = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name.trim()) {
      socket.emit('setUsername', name, (response) => {
        if (response.success) {
          navigate('/rooms', { state: { name } });
        } else {
          setError(response.message);
        }
      });
    } else {
      setError('Please enter a valid name');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
      <form className="p-6 bg-white shadow-lg rounded-xl max-w-sm text-center" onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold text-purple-600 mb-4">🎉 Party Game!</h1>
        <p className="text-lg text-gray-700 mb-6">Enter your name to join the fun!</p>
        <input
          type="text"
          className="border-2 border-purple-300 focus:ring-purple-500 p-3 w-full rounded mb-4 text-center text-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="bg-purple-500 hover:bg-purple-700 text-white p-3 rounded w-full text-lg transition transform hover:scale-105"
        >
          Start Party 🎈
        </button>
      </form>
    </div>
  );
};

export default MainPage;
