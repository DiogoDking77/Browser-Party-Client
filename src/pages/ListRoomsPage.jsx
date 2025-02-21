import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import socket from '../socket'; // Importa a instância do socket

const ListRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controla a visibilidade do modal
  const [newRoomName, setNewRoomName] = useState(''); // Armazena o nome da nova sala
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
    setIsModalOpen(true); // Abre o modal
  };

  const handleModalSubmit = () => {
    if (newRoomName.trim()) {
      socket.emit('createRoom', newRoomName);  // Cria a sala e automaticamente o jogador é adicionado
      socket.emit('getRooms');              // Atualiza a lista de salas
      navigate(`/room/${newRoomName}`, { state: { userName, roomName: newRoomName } }); // Navega diretamente
      setIsModalOpen(false); // Fecha o modal após criar a sala
    } else {
      alert('Room name cannot be empty!');
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
          id="createRoom"
        >
          Create a Room 🎉
        </button>
      </div>

      {/* Modal para criar sala */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold text-center mb-4">Enter Room Name</h2>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              placeholder="Enter the room name"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)} // Fecha o modal sem fazer nada
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                id="submit"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

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
              id={room.name}
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