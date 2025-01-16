import React, { useState, useEffect } from 'react';
import socket from '../../socket';

const DuckHunt = ({ onMiniGameEnd, players }) => {
  const [ducks, setDucks] = useState([]);
  const [timer, setTimer] = useState(30); // Tempo total do mini-jogo
  const [scores, setScores] = useState({}); // Armazena pontuações dos jogadores

  const gridSize = { rows: 3, cols: 6 };

  useEffect(() => {
    // Inicializa pontuações
    const initialScores = {};
    players.forEach((player) => {
      initialScores[player.username] = 0;
    });
    setScores(initialScores);

    // Atualiza o tempo restante
    const countdownInterval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdownInterval);
          onMiniGameEnd(); // Finaliza o mini-jogo
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    // Ouve eventos do servidor para gerar patos
    socket.on('spawnDuck', ({ x, y, color }) => {
      setDucks((prevDucks) => [...prevDucks, { x, y, color }]);
    });

    // Remove pato após um tempo
    socket.on('removeDuck', ({ x, y }) => {
      setDucks((prevDucks) => prevDucks.filter((duck) => duck.x !== x || duck.y !== y));
    });

    // Limpeza
    return () => {
      clearInterval(countdownInterval);
      socket.off('spawnDuck');
      socket.off('removeDuck');
    };
  }, [onMiniGameEnd, players]);

  const handleDuckClick = (duck) => {
    const currentUser = players.find((player) => player.username === socket.id);
    const playerColor = currentUser.clientColor;

    // Emite evento para o servidor
    socket.emit('duckHit', {
      clickedBy: playerColor,
      duckColor: duck.color,
    });

    // Atualiza os pontos localmente (exibição em tempo real)
    setScores((prevScores) => {
      const newScores = { ...prevScores };
      if (duck.color === playerColor) {
        newScores[currentUser.username] += 1; // Acertou o próprio pato
      } else if (duck.color === 'golden') {
        newScores[currentUser.username] += 3; // Pato dourado
      } else {
        newScores[currentUser.username] -= 1; // Errou o pato
        const targetPlayer = players.find((player) => player.clientColor === duck.color);
        if (targetPlayer) {
          newScores[targetPlayer.username] += 1; // Ponto para o jogador da cor do pato
        }
      }
      return newScores;
    });

    // Remove o pato clicado
    setDucks((prevDucks) => prevDucks.filter((d) => d !== duck));
  };

  return (
    <div className="relative w-full h-full bg-green-700 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-yellow-300">Duck Hunt</h1>
      <p className="text-lg text-white">Time Left: {timer}s</p>
      <div className="grid grid-cols-6 gap-2 p-4 bg-gray-900 rounded-lg">
        {Array.from({ length: gridSize.rows * gridSize.cols }).map((_, index) => {
          const x = index % gridSize.cols;
          const y = Math.floor(index / gridSize.cols);
          const duck = ducks.find((d) => d.x === x && d.y === y);

          return (
            <div
              key={index}
              className="w-16 h-16 border border-gray-600 bg-gray-800 flex items-center justify-center"
            >
              {duck && (
                <div
                  className={`w-10 h-10 rounded-full cursor-pointer ${
                    duck.color === 'golden' ? 'bg-yellow-400' : `bg-${duck.color}-500`
                  }`}
                  onClick={() => handleDuckClick(duck)}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="absolute top-4 right-4 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-white font-bold">Scores</h2>
        <ul>
          {players.map((player) => (
            <li key={player.username} className="text-white">
              {player.username}: {scores[player.username] || 0}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DuckHunt;
