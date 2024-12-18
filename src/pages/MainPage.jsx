import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket'; // Importa a instância do socket
import firefox from '../assets/avatars/fox_ref.png';
import mouse from '../assets/avatars/mouse.png';
import opera from '../assets/avatars/opera.jpg';
import pirate from '../assets/avatars/pirate.png';
import anonymous from '../assets/avatars/anonymous.png';

const avatarList = [firefox, mouse, opera, pirate, anonymous];

const MainPage = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name.trim()) {
      const selectedAvatar = avatarList[avatarIndex];
      socket.emit('setUsername', { name, avatar: selectedAvatar }, (response) => {
        if (response.success) {
          navigate('/rooms', { state: { name, avatar: selectedAvatar } });
        } else {
          setError(response.message);
        }
      });
    } else {
      setError('Please enter a valid name');
    }
  };

  const handlePreviousAvatar = () => {
    setAvatarIndex((prevIndex) => (prevIndex === 0 ? avatarList.length - 1 : prevIndex - 1));
  };

  const handleNextAvatar = () => {
    setAvatarIndex((prevIndex) => (prevIndex === avatarList.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
      <form className="p-6 bg-white shadow-lg rounded-xl max-w-sm text-center" onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold text-purple-600 mb-4">🎉 Party Game!</h1>
        <p className="text-lg text-gray-700 mb-6">Enter your name and pick an avatar to join the fun!</p>

        {/* Seletor de Avatar - Mover para cima */}
        <div className="flex items-center justify-center mb-4">
          <button
            type="button"
            className="text-purple-500 hover:text-purple-700 text-2xl mr-4"
            onClick={handlePreviousAvatar}
          >
            &#8592;
          </button>
          <img
            src={avatarList[avatarIndex]}
            alt="Selected Avatar"
            className="w-24 h-24 rounded-full border-4 border-purple-300"
          />
          <button
            type="button"
            className="text-purple-500 hover:text-purple-700 text-2xl ml-4"
            onClick={handleNextAvatar}
          >
            &#8594;
          </button>
        </div>

        {/* Input de nome - agora abaixo do avatar */}
        <input
          type="text"
          className="border-2 border-purple-300 focus:ring-purple-500 p-3 w-full rounded mb-4 text-center text-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Botão de Iniciar */}
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
