import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socket from '../socket';
import BasicBoard from '../components/Board/BasicBoard';
import Chat from '../components/Chat';

// Importe as imagens das faces do dado
import dice1 from '../assets/dice1.png';
import dice2 from '../assets/dice2.png';
import dice3 from '../assets/dice3.png';
import dice4 from '../assets/dice4.png';
import dice5 from '../assets/dice5.png';
import dice6 from '../assets/dice6.png';

const RoomPage = () => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [round, setRound] = useState(1);
  const [players, setPlayers] = useState([]);
  const [playerPositions, setPlayerPositions] = useState({});
  const [diceRolling, setDiceRolling] = useState(false); // Estado para controlar se o dado está rolando
  const [currentDiceFace, setCurrentDiceFace] = useState(null); // Face atual do dado
  const [rollingPlayer, setRollingPlayer] = useState(null); // Jogador que está rolando o dado
  const [gameStarted, setGameStarted] = useState(false); // Novo estado para indicar se o jogo começou
  const [isAdmin, setIsAdmin] = useState(false); // Novo estado para verificar se o cliente é admin
  const [countdown, setCountdown] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { userName, roomName, avatar } = location.state;

  const cellSize = 65;

  useEffect(() => {
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

    socket.on('startGame', () => {
      setGameStarted(true)
      // Inicia o countdown de 3 até "Let\'s Party!"
      setCountdown('3');
      setTimeout(() => setCountdown('2'), 1000);
      setTimeout(() => setCountdown('1'), 2000);
      setTimeout(() => setCountdown('Let\'s Party!'), 3000);
      setTimeout(() => {
        setCountdown(null); // Remove o countdown após a mensagem final
      }, 4500); // Deixe "Let\'s Party!" visível por 1,5 segundos
    });     

    // Listener para o evento de dado rolado
    socket.on('DiceRoll', ({ username, rollResult }) => {
      console.log(`${username} rolled a ${rollResult}`);
      
      // Mostrar a animação de rolar o dado
      setRollingPlayer(username);
      rollDice(rollResult); // Chama a função de rolar o dado com o resultado final
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
      socket.off('DiceRoll');
      socket.off('startGame');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomName]);

  const startGame = () => {
    socket.emit('adminStartGame', roomName );
  };

  // Função para rolar o dado e mostrar uma animação
  const rollDice = (finalResult) => {
    setDiceRolling(true);
    setCurrentDiceFace(dice1); // Inicia mostrando uma face qualquer do dado

    const diceFaces = [dice1, dice2, dice3, dice4, dice5, dice6];

    // Simula o dado rolando por 1,5 segundos
    let rollCount = 0;
    const interval = setInterval(() => {
      const randomFace = diceFaces[Math.floor(Math.random() * 6)]; // Mostra uma face aleatória do dado
      setCurrentDiceFace(randomFace);
      rollCount++;
      
      if (rollCount > 10) { // Após algumas iterações, mostrar o número real
        clearInterval(interval);
        setCurrentDiceFace(diceFaces[finalResult - 1]); // Exibe o número sorteado
        setTimeout(() => {
          setDiceRolling(false); // Para a animação
          setRollingPlayer(null); // Limpa o jogador que rolou o dado
        }, 1500); // Mostra o resultado final por mais 1,5 segundos
      }
    }, 150); // Velocidade da rotação do dado
  };

  const rollTheDice = () => {
    socket.emit('rollTheDice', { roomName, username: userName }, (response) => {
      if (response.success) {
        console.log(`You rolled a ${response.rollResult}`);
      }
    });
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
            <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
              <h1 className="text-white text-6xl font-bold">{countdown}</h1>
            </div>
          ) : (
            <>
              <BasicBoard cellSize={cellSize} playerPositions={playerPositions} players={players} />

              {diceRolling && rollingPlayer && (
                <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white text-2xl mb-4">{rollingPlayer} is rolling the dice...</p>
                    <div className="dice-animation">
                      <img src={currentDiceFace} alt="dice face" className="w-24 h-24 mx-auto" />
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 z-10">
                <button
                  className="bg-green-500 hover:bg-green-400 text-white w-full p-2 rounded-lg shadow-lg transition transform hover:scale-110 hover:shadow-neon-green"
                  onClick={rollTheDice}
                >
                  🎲 Roll the Dice!
                </button>
              </div>
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
