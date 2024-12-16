import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socket from '../socket';
import BasicBoard from '../components/Board/BasicBoard';
import Chat from '../components/Chat';
import DiceRoller from '../components/DiceRoller';
import ShuffleOrder from '../components/ShuffleOrder';
import Countdown from '../components/Countdown';


const RoomPage = () => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [round, setRound] = useState(1);
  const [players, setPlayers] = useState([]);
  const [playerTurnOrder, setPlayerTurnOrder] = useState([]);
  const [playerPositions, setPlayerPositions] = useState({});
  const [gameStarted, setGameStarted] = useState(false); // Novo estado para indicar se o jogo começou
  const [isAdmin, setIsAdmin] = useState(false); // Novo estado para verificar se o cliente é admin
  const [countdown, setCountdown] = useState(null);
  const [orderShuffle, setOrderShuffle] = useState(null);
  const [currentPlayerTurnId, setCurrentPlayerTurnId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { userName, roomName, avatar } = location.state;

  const [shufflingPlayers, setShufflingPlayers] = useState([]); // Estado para armazenar os cards durante a animação
  const shufflingPlayersRef = useRef(shufflingPlayers);

  const cellSize = 65;

  const colorMap = {
    red: 'border-red-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
    yellow: 'border-yellow-500',
    // Adicione mais cores conforme necessário
  };

  const getGlowColor = (colorKey) => {
    const glowColors = {
      red: 'rgba(255, 0, 0, 0.6)',
      blue: 'rgba(0, 0, 255, 0.6)',
      green: 'rgba(0, 255, 0, 0.6)',
      yellow: 'rgba(255, 255, 0, 0.6)',
      // Adicione mais cores conforme necessário
    };
  
    return glowColors[colorKey] || 'rgba(255, 255, 255, 0.4)'; // Cor padrão de brilho
  };
  

  useEffect(() => {
    
    shufflingPlayersRef.current = shufflingPlayers;
    let previousPlayers = [];
    
    socket.on('updateRoomData', (response) => {
      console.log('Updated Room Data:', response.roomData);
      setIsAdmin(response.roomData.adminPlayer.username === userName);

      if (response.roomData.players.length !== previousPlayers.length) {
        const newPlayers = response.roomData.players.filter(p => !previousPlayers.some(prev => prev.username === p.username));
        const removedPlayers = previousPlayers.filter(p => !response.roomData.players.some(upd => upd.username === p.username));

        if (newPlayers.length > 0) {
          setPlayerPositions((prevPositions) => {
            const newPositions = { ...prevPositions };
            newPlayers.forEach(player => {
              newPositions[player.username] = 0;
            });
            return newPositions;
          });
        }

        if (removedPlayers.length > 0) {
          setPlayerPositions((prevPositions) => {
            const newPositions = { ...prevPositions };
            removedPlayers.forEach(player => {
              delete newPositions[player.username];
            });
            return newPositions;
          });
        }

        //setPlayers(response.roomData.players);
        setPlayers(response.roomData.players.map(player => ({
          ...player,
          avatar: player.avatar // Certifique-se de que o avatar esteja sendo enviado para todos os jogadores
        })));
        previousPlayers = response.roomData.players;
      }
    });

    socket.on('startGame', ({ currentPlayerTurn, playerTurnOrder }) => {
      setPlayerTurnOrder(playerTurnOrder);
      setGameStarted(true);
      setCountdown('3');
      console.log(playerTurnOrder);
    });

    // Listener para antes de fechar a página
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ''; // Mostra uma mensagem genérica no navegador
    };

    // Adiciona o listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      socket.off('updatePlayers');
      socket.off('updateRoomData');
      socket.off('startGame');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomName, players]);

  const handleCountdownEnd = (newCountdown) => {
    setCountdown(newCountdown);
    if (newCountdown === null) {
      setOrderShuffle(true); // Avança para o shuffle quando o countdown termina
    }
  };  

  const handleShuffleEnd = () => {
    setOrderShuffle(false);
  };

  const randomShuffle = (players) => {
    const newPlayers = [...players];
    const randomIndex = Math.floor(Math.random() * newPlayers.length);
    const randomMove = Math.random() > 0.5 ? 'swap' : 'rotate';

    if (randomMove === 'swap') {
      // Trocar a posição de dois cards aleatoriamente
      const secondRandomIndex = (randomIndex + Math.floor(Math.random() * (newPlayers.length - 1)) + 1) % newPlayers.length;
      [newPlayers[randomIndex], newPlayers[secondRandomIndex]] = [newPlayers[secondRandomIndex], newPlayers[randomIndex]];
    } else {
      // Move um card para outra posição e ajusta os demais
      const movingCard = newPlayers.splice(randomIndex, 1)[0];
      const targetIndex = (randomIndex + Math.floor(Math.random() * newPlayers.length)) % newPlayers.length;
      newPlayers.splice(targetIndex, 0, movingCard);
    }
    console.log('random move')

    return newPlayers;
  };

  // Função para realizar a animação de movimentos aleatórios
  const performRandomShuffle = (steps, callback) => {
    if (steps === 0) {
      callback();
      return;
    }

    setTimeout(() => {
      setShufflingPlayers(prevPlayers => randomShuffle(prevPlayers));
      performRandomShuffle(steps - 1, callback);
    }, 250); // Velocidade da animação
  };

  // Função para realizar o shuffle predefinido com base em playerTurnOrder
  const performPredefinedShuffle = (playerTurnOrder) => {
    const finalOrder = [...shufflingPlayersRef.current];
    
    for (let i = 3; i >= 0; i--) {
      const playerToMove = finalOrder.find(player => player.id === playerTurnOrder[i]);
      finalOrder.splice(finalOrder.indexOf(playerToMove), 1); // Remove o player
      finalOrder.splice(i, 0, playerToMove); // Insere o player na nova posição
      console.log('move')
    }
  
    setShufflingPlayers(finalOrder);
  };  

  const startGame = () => {
    socket.emit('adminStartGame', roomName );
  };

  // Confirma antes de fechar a aba e chama handleLeaveRoom
  useEffect(() => {
    const confirmBeforeUnload = (event) => {
      event.preventDefault();
      const confirmationMessage = 'Você realmente deseja sair do jogo?';
      event.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    const handleUnload = () => {
      handleLeaveRoom();
    };

    // Adiciona os listeners para antes de fechar e antes de descarregar
    window.addEventListener('beforeunload', confirmBeforeUnload);
    window.addEventListener('unload', handleUnload);

    // Remove os listeners ao desmontar o componente
    return () => {
      window.removeEventListener('beforeunload', confirmBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [roomName]);

  const handleLeaveRoom = () => {
    console.log(shufflingPlayers)
    socket.emit('leaveRoom', roomName);
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white">
      <div className="flex flex-1">
        <div className="w-3/4 p-4 bg-gray-800/90 rounded-lg shadow-2xl flex items-center justify-center relative overflow-hidden">
          {/* Exibição condicional baseada no estado do jogo */}
          {!gameStarted ? (
            <div className="text-center">
              <p className="text-white text-xl mb-4">
                Players in room: <span className="font-bold">{players.length}</span>
              </p>
              {isAdmin ? (
                <button
                  className="bg-green-500 hover:bg-green-400 text-white p-4 rounded-lg shadow-lg transition transform hover:scale-110 hover:shadow-neon-green"
                  onClick={startGame}
                >
                  Start Game
                </button>
              ) : (
                <p className="text-gray-300">Waiting for the host to start the game...</p>
              )}
            </div>
          ) : countdown ? (
            <Countdown countdown={countdown} onCountdownEnd={handleCountdownEnd} />
          ) : orderShuffle ? (
            <ShuffleOrder
              players={players}
              playerTurnOrder={playerTurnOrder}
              onShuffleEnd={handleShuffleEnd}
              colorMap={colorMap}
              getGlowColor={getGlowColor}
            />
          ) : (
            <>
              <BasicBoard cellSize={cellSize} playerPositions={playerPositions} players={players} />
              <DiceRoller roomName={roomName} userName={userName} />
            </>
          )}
        </div>

        <div className="w-1/4 bg-gray-800/90 rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 p-4 text-center ${activeTab === 'leaderboard' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'} font-bold transition hover:bg-purple-400`}
              onClick={() => setActiveTab('leaderboard')}
            >
              🏆 Players
            </button>
            <button
              className={`flex-1 p-4 text-center ${activeTab === 'chat' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'} font-bold transition hover:bg-blue-400`}
              onClick={() => setActiveTab('chat')}
            >
              💬 Chat
            </button>
            <button
              className={`flex-1 p-4 text-center ${activeTab === 'settings' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'} font-bold transition hover:bg-red-400`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Settings
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-500 shadow rounded-lg text-center">
                  <h3 className="text-xl font-extrabold text-white">🎉 {roomName} 🎉</h3>
                  <p className="text-md text-gray-200">
                    Round: <span className="font-bold">{round}</span>
                  </p>
                </div>
                {players.map((player, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-700 shadow-md rounded-lg flex items-center justify-between hover:shadow-lg transition"
                  style={{ borderLeft: `8px solid ${player.clientColor}` }}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={player.avatar}  // Mostra o avatar do jogador
                      alt={player.username}
                      className="w-12 h-12 rounded-full border-2 border-purple-400"
                    />
                    <div>
                      <h3 className="text-lg font-extrabold text-pink-400">{player.username}</h3>
                      <p className="text-gray-300">Position: {playerPositions[player.username]}</p>
                    </div>
                  </div>
                  <div className="text-white font-bold">🎮</div>
                </div>
              ))}
              </div>
            )}

            {activeTab === 'chat' && <Chat roomName={roomName} userName={userName} socket={socket} />}

            {activeTab === 'settings' && (
              <div className="p-4 space-y-4">
                <button
                  className="w-full p-4 bg-red-500 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition"
                  onClick={handleLeaveRoom}
                >
                  🚪 Leave Room
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
