import React, { useState, useEffect } from 'react';
import dice1 from '../assets/dice1.png';
import dice2 from '../assets/dice2.png';
import dice3 from '../assets/dice3.png';
import dice4 from '../assets/dice4.png';
import dice5 from '../assets/dice5.png';
import dice6 from '../assets/dice6.png';
import socket from '../socket';

const DiceRoller = ({ roomName, userName, isMyTurn, onMiniGameTriggered }) => {
  const [diceRolling, setDiceRolling] = useState(false);
  const [currentDiceFace, setCurrentDiceFace] = useState(null);
  const [rollingPlayer, setRollingPlayer] = useState(null);

  const diceFaces = [dice1, dice2, dice3, dice4, dice5, dice6];

  useEffect(() => {
    const handleDiceRoll = ({ username, rollResult }) => {
      console.log(`${username} rolled a ${rollResult}`);
      setRollingPlayer(username);
      rollDice(rollResult);
    };

    socket.on('DiceRoll', handleDiceRoll);

    return () => {
      socket.off('DiceRoll', handleDiceRoll);
    };
  }, []);

  useEffect(() => {
    const handleMiniGame = ({ miniGameType }) => {
      console.log(`Mini-game triggered: ${miniGameType}`);
      // Envia a informação ao RoomPage, se necessário.
      if (miniGameType === 'PenaltyShootOut') {
        // Aqui você pode chamar um callback ou enviar um evento customizado.
      }
    };
  
    socket.on('miniGameEvent', handleMiniGame);
  
    return () => {
      socket.off('miniGameEvent', handleMiniGame);
    };
  }, []);

  const rollDice = (finalResult) => {
    setDiceRolling(true);
    setCurrentDiceFace(dice1); // Start with a random face

    let rollCount = 0;
    const interval = setInterval(() => {
      const randomFace = diceFaces[Math.floor(Math.random() * 6)];
      setCurrentDiceFace(randomFace);
      rollCount++;

      if (rollCount > 10) {
        clearInterval(interval);
        setCurrentDiceFace(diceFaces[finalResult - 1]);
        setTimeout(() => {
          setDiceRolling(false);
          setRollingPlayer(null);
        }, 1500);
      }
    }, 150);
  };

  const rollTheDice = () => {
    socket.emit('rollTheDice', { roomName, username: userName }, (response) => {
      if (response.success) {
        console.log(`You rolled a ${response.rollResult}`);


        if (response.miniGameEvent){
          console.log(`Mini-game triggered: ${response.miniGameType}`);
        
          if (onMiniGameTriggered) {
            onMiniGameTriggered(response.miniGameType);
          }
        }
      }
    });
    socket.emit('updatePlayerTurn', roomName)
  };

  return (
    <>
    {isMyTurn ? (
      <button
        className="bg-green-500 hover:bg-green-400 text-white w-1/2 p-2 rounded-lg shadow-lg transition transform hover:scale-110 hover:shadow-neon-green"
        onClick={rollTheDice}
      >
        🎲 Roll the Dice!
      </button>
      ) : null}
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
    </>
  );
};

export default DiceRoller;
