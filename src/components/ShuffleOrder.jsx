import React, { useEffect, useState, useRef } from 'react';

const ShuffleOrder = ({ players, playerTurnOrder, onShuffleEnd, colorMap, getGlowColor }) => {
  const [shufflingPlayers, setShufflingPlayers] = useState([]);
  const shufflingPlayersRef = useRef([]);

  useEffect(() => {
    // Inicializa a ordem dos jogadores com base em playerTurnOrder
    const initialPlayerOrder = players.map(player => ({
      ...player,
      position: playerTurnOrder.indexOf(player.id),
    }));
    setShufflingPlayers(initialPlayerOrder);
    shufflingPlayersRef.current = initialPlayerOrder; // Certifique-se de que o ref também está atualizado

    // Após definir os players iniciais, realiza o shuffle
    performRandomShuffle(10, () => {
      // Após o shuffle aleatório, faz o shuffle predefinido
      performPredefinedShuffle(playerTurnOrder);
      setTimeout(() => {
        onShuffleEnd(); // Notifica o RoomPage que o shuffle terminou
      }, 3000);
    });
  }, [players, playerTurnOrder, onShuffleEnd]);

  const randomShuffle = (players) => {
    const newPlayers = [...players];
    const randomIndex = Math.floor(Math.random() * newPlayers.length);
    const randomMove = Math.random() > 0.5 ? 'swap' : 'rotate';

    if (randomMove === 'swap') {
      const secondRandomIndex = (randomIndex + Math.floor(Math.random() * (newPlayers.length - 1)) + 1) % newPlayers.length;
      [newPlayers[randomIndex], newPlayers[secondRandomIndex]] = [newPlayers[secondRandomIndex], newPlayers[randomIndex]];
    } else {
      const movingCard = newPlayers.splice(randomIndex, 1)[0];
      const targetIndex = (randomIndex + Math.floor(Math.random() * newPlayers.length)) % newPlayers.length;
      newPlayers.splice(targetIndex, 0, movingCard);
    }

    return newPlayers;
  };

  const performRandomShuffle = (steps, callback) => {
    if (steps === 0) {
      callback();
      return;
    }
    setTimeout(() => {
      setShufflingPlayers(prevPlayers => {
        const shuffled = randomShuffle(prevPlayers);
        shufflingPlayersRef.current = shuffled; // Atualiza o ref com o novo shuffle
        return shuffled;
      });
      performRandomShuffle(steps - 1, callback);
    }, 250);
  };

  const performPredefinedShuffle = (playerTurnOrder) => {
    const finalOrder = [...shufflingPlayersRef.current];

    for (let i = playerTurnOrder.length - 1; i >= 0; i--) {
      const playerToMove = finalOrder.find(player => player.id === playerTurnOrder[i]);
      if (playerToMove) {
        finalOrder.splice(finalOrder.indexOf(playerToMove), 1);
        finalOrder.splice(i, 0, playerToMove);
      }
    }

    setShufflingPlayers(finalOrder);
    shufflingPlayersRef.current = finalOrder; // Atualiza o ref com o shuffle final
  };

  return (
    <div className="flex justify-center items-center space-x-4 mt-10">
      {shufflingPlayers.map((player, index) => (
        <div
          key={player.id}
          className={`p-10 bg-gray-700 shadow-lg rounded-lg transition transform border-8 ${colorMap[player.clientColor] || 'border-gray-500'}`}
          style={{
            transform: `scale(${1})`, // Correção: se você não quiser aplicar transformação baseada em 'currentPlayerTurnId', pode usar 1 diretamente.
            boxShadow: `0 0 20px 5px ${getGlowColor(player.clientColor)}`, // Adiciona a borda luminosa
          }}
        >
          <img src={player.avatar} alt={player.username} className="w-20 h-20 rounded-full mb-2" />
          <p className="text-white font-bold text-xl">{player.username}</p>
        </div>
      ))}
    </div>
  );
};

export default ShuffleOrder;
