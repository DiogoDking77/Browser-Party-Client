import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import socket from '../socket'; // Importa a instância do socket

const ListRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.name;

  useEffect(() => {
    socket.emit('getRooms');
    socket.on('roomsList', (roomsList) => setRooms(roomsList));
  
    // Listener para quando a sala for criada com sucesso
    socket.on('roomCreated', ({ roomName }) => {
      navigate(`/room/${roomName}`, { state: { userName, roomName } });
    });
  
    socket.on('roomExists', (message) => {
      alert(message);  // Exibe um alerta ao usuário
    });
  
    return () => {
      socket.off('roomsList');
      socket.off('roomJoined');
      socket.off('roomCreated');
      socket.off('roomExists');
    };
  }, [navigate, userName]);

  const handleCreateRoom = () => {
    const roomName = prompt('Enter room name:');
    if (roomName) {
      socket.emit('createRoom', roomName);  // Cria a sala e automaticamente o jogador é adicionado
      socket.emit('getRooms');              // Atualiza a lista de salas
      navigate(`/room/${roomName}`, { state: { userName, roomName } }); // Navega diretamente
    }
  };
  
  
  const handleJoinRoom = (roomName) => {
    // Emite o evento joinRoom para o servidor
    socket.emit('joinRoom', roomName);
  
    // O frontend só navega para a sala após receber a confirmação de sucesso do servidor
    socket.on('roomJoined', (roomName) => {
      navigate(`/room/${roomName}`, { state: { userName, roomName } });
    });
  
    // Lida com erros de sala cheia ou outro erro
    socket.on('roomFull', (message) => {
      alert(message);
    });
  };
  
  
  

  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-yellow-400 via-red-400 to-pink-500">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        🎮 Welcome, {userName}!
      </h1>
      <div className="text-center mb-6">
        <button
          className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-full font-bold transition transform hover:scale-105"
          onClick={handleCreateRoom}
        >
          Create a Room 🎉
        </button>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room, index) => (
          <li
            key={index}
            className="bg-white rounded-lg shadow-lg p-4 text-center hover:shadow-xl transition"
          >
            <h2 className="text-lg font-bold text-gray-800">{room.name}</h2>
            <p className="text-sm text-gray-600">{room.playerCount}/4 Players</p> {/* Exibe o número de jogadores */}
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 mt-2 rounded-full font-semibold transition transform hover:scale-105"
              onClick={() => handleJoinRoom(room.name)}
            >
              Join 🚪
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListRoomsPage;
