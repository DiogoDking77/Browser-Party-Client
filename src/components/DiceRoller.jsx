import React, { useState, useEffect } from 'react';
import dice1 from '../assets/dice1.png';
import dice2 from '../assets/dice2.png';
import dice3 from '../assets/dice3.png';
import dice4 from '../assets/dice4.png';
import dice5 from '../assets/dice5.png';
import dice6 from '../assets/dice6.png';
import socket from '../socket';

const DiceRoller = ({ roomName, userName, isMyTurn, onDiceRoll }) => {
  const [diceRolling, setDiceRolling] = useState(false);
  const [currentDiceFace, setCurrentDiceFace] = useState(null);
  const [rollingPlayer, setRollingPlayer] = useState(null);

  const diceFaces = [dice1, dice2, dice3, dice4, dice5, dice6];

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
      }
    });
    socket.emit('updatePlayerTurn', roomName);
  };

  return (
    <div className="w-full h-full relative">
      {isMyTurn ? (
        <button
          className="
            w-full h-full 
            bg-green-500
            text-white font-bold
            rounded-xl
            shadow-[0_6px_0_#15803d]
            hover:shadow-[0_4px_0_#15803d]
            hover:translate-y-[2px]
            active:shadow-[0_0px_0_#15803d]
            active:translate-y-[6px]
            transition-all duration-150
            flex items-center justify-center gap-2
          "
          onClick={rollTheDice}
        >
          <span className="text-2xl">🎲</span>
          <span className="text-sm font-semibold">Roll!</span>
        </button>
      ) : (
        <div 
          className="
            w-full h-full 
            bg-gray-400
            rounded-xl
            shadow-inner
            flex items-center justify-center gap-2
            opacity-50 cursor-not-allowed
            text-gray-100
          "
        >
          <span className="text-2xl">🎲</span>
          <span className="text-sm font-semibold">Wait...</span>
        </div>
      )}
      {diceRolling && rollingPlayer && (
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 9999
          }}
        >
          <div className="text-center">
            <p className="text-white text-2xl mb-4">{rollingPlayer} está rolando o dado...</p>
            <div className="dice-animation">
              <img 
                src={currentDiceFace} 
                alt="face do dado" 
                className="w-24 h-24 mx-auto animate-bounce"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
