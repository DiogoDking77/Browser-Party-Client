import React, { useState, useEffect } from 'react';
import dice1 from '../assets/dice1.png';
import dice2 from '../assets/dice2.png';
import dice3 from '../assets/dice3.png';
import dice4 from '../assets/dice4.png';
import dice5 from '../assets/dice5.png';
import dice6 from '../assets/dice6.png';
import socket from '../socket';

const InfoScreen = ({ roomName, userName }) => {
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

  const rollDice = (finalResult) => {
    setDiceRolling(true);
    setCurrentDiceFace(dice1);

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

  return (
    <div className="w-full h-full border-gray-700 border-2 text-white bg-gradient-to-br from-gray-900 to-black rounded-lg relative overflow-hidden">
      {/* Container fixo para o conteúdo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {/* Header fixo */}
        <h2 className="text-2xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Smart Party
        </h2>

        {/* Área de conteúdo dinâmico */}
        <div className="w-full flex-1 flex items-center justify-center">
          {!diceRolling && (
            <div className="text-center">
              <p className="text-gray-400">Waiting for actions...</p>
            </div>
          )}
          
          {diceRolling && rollingPlayer && (
            <div className="text-center">
              <p className="text-lg mb-2 font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                {rollingPlayer} is rolling the dice...
              </p>
              <div className="dice-animation relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <img 
                  src={currentDiceFace} 
                  alt="face do dado" 
                  className="w-24 h-24 mx-auto animate-bounce relative z-10"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoScreen; 