import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import DiceRoller from '../DiceRoller';
import InfoScreen from '../InfoScreen';
import { FaGift, FaPiggyBank, FaQuestion, FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown, FaSearchPlus, FaSearchMinus, FaRedo } from 'react-icons/fa';
import { GiCrossedSwords } from 'react-icons/gi';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import boardData from '../../data/boardData.json';
import socket from '../../socket';

const getColor = (type) => {
  const colors = {
    Start: "black",
    Green: "#4CAF50",
    Red: "#E53935",
    Gift: "#2196F3",
    Duel: "#FF9800",
    Bank: "#FFC107",
    Teleport: "purple", // Ajustado no fillPattern
    Event: "#9C27B0",
    Jackpot:"#FF0000"
  };
  return colors[type] || "";
};

const getSquareStyle = (type) => {
  switch (type) {
    case 'Gift':
      return {
        background: '#2196F3',
        content: <FaGift className="text-black text-2xl" />,
      };
    case 'Bank':
      return {
        background: '#FFC107',
        content: <FaPiggyBank className="text-black text-2xl" />,
      };
    case 'Duel':
      return {
        background: '#FF9800',
        content: <GiCrossedSwords className="text-black text-2xl" />,
      };
    case 'Event':
      return {
        background: '#9C27B0',
        content: <FaQuestion className="text-black text-2xl" />,
      };
    case 'Teleport':
      return {
        background: 'linear-gradient(45deg, #FFFFFF, #FF148A, #7B1FF2, #9F22B0, #FF68C0, #FFFFFF)',
        content: null,
      };
    case 'Jackpot':
      return {
        background: 'repeating-conic-gradient(#842928 0% 25%, #000000 25% 50%) 50% / 50px 50px',
        content: null,
      };
    case 'Start':
      return {
        background: 'repeating-conic-gradient(#FFFFFF 0% 25%, #000000 25% 50%) 50% / 15px 15px',
        content: null,
      };
    default:
      return {
        background: getColor(type),
        content: null,
      };
  }
};

const DirectionIndicator = ({ directions }) => {
  return (
    <>
      {directions.map((direction, index) => {
        let Icon;
        let position;
        
        switch (direction) {
          case 'right':
            Icon = FaArrowRight;
            position = "absolute -right-3 top-1/2 -translate-y-1/2";
            break;
          case 'left':
            Icon = FaArrowLeft;
            position = "absolute -left-3 top-1/2 -translate-y-1/2";
            break;
          case 'up':
            Icon = FaArrowUp;
            position = "absolute top-[-12px] left-1/2 -translate-x-1/2";
            break;
          case 'down':
            Icon = FaArrowDown;
            position = "absolute bottom-[-12px] left-1/2 -translate-x-1/2";
            break;
          default:
            return null;
        }

        return (
          <div key={index} className={`${position} text-gray-700 text-[8px] z-10`}>
            <Icon />
          </div>
        );
      })}
    </>
  );
};

const BasicBoard = ({ playerPositions, players, roomName, userName, isMyTurn, diceRolling, currentDiceFace, rollingPlayer }) => {
  const containerRef = useRef(null);
  const [size, setSize] = useState(0);
  const [animatingPawns, setAnimatingPawns] = useState({});

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setSize(Math.min(clientWidth, clientHeight));
    }
  }, []);

  useEffect(() => {
    const handleDiceRoll = ({ username, path, finalPosition }) => {
      if (!path || path.length === 0) return;

      // Iniciar animação para o peão do jogador
      setAnimatingPawns(prev => ({
        ...prev,
        [username]: {
          path,
          currentStep: 0,
          isAnimating: true
        }
      }));

      // Animar o peão através do caminho
      const animatePawn = (username, path, currentStep) => {
        if (currentStep >= path.length) {
          // Finalizar animação
          setAnimatingPawns(prev => ({
            ...prev,
            [username]: {
              ...prev[username],
              isAnimating: false,
              currentPosition: path[path.length - 1]
            }
          }));
          return;
        }

        // Atualizar posição atual
        setAnimatingPawns(prev => ({
          ...prev,
          [username]: {
            ...prev[username],
            currentStep
          }
        }));

        // Continuar animação
        setTimeout(() => {
          animatePawn(username, path, currentStep + 1);
        }, 500); // Velocidade da animação (500ms por movimento)
      };

      animatePawn(username, path, 0);
    };

    socket.on('DiceRoll', handleDiceRoll);

    return () => {
      socket.off('DiceRoll', handleDiceRoll);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={2}
        centerOnInit={true}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controles de Zoom */}
            <div className="absolute top-4 right-4 flex gap-2 z-50">
              <button
                onClick={() => zoomIn()}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <FaSearchPlus className="text-gray-700" />
              </button>
              <button
                onClick={() => zoomOut()}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <FaSearchMinus className="text-gray-700" />
              </button>
              <button
                onClick={() => resetTransform()}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <FaRedo className="text-gray-700" />
              </button>
            </div>

            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%"
              }}
            >
              <div 
                className="relative"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${boardData.gridSize}, 1fr)`,
                  gap: '2px',
                  width: `${size}px`,
                  height: `${size}px`
                }}
              >
                {[...Array(boardData.gridSize)].map((_, row) =>
                  [...Array(boardData.gridSize)].map((_, col) => {
                    const square = boardData.gameSquares.find((sq) => sq.row === row && sq.col === col);
                    const isDiceButtonStart = 
                      row === boardData.diceButton.row && 
                      col === boardData.diceButton.col;
                    const isDiceButtonSecondCell = 
                      row === boardData.diceButton.row && 
                      col === boardData.diceButton.col + 1;
                    
                    const isInfoScreenStart = 
                      row === boardData.InfoScreen.startRow && 
                      col === boardData.InfoScreen.startCol;
                    const isInsideInfoScreen = 
                      row >= boardData.InfoScreen.startRow &&
                      row <= boardData.InfoScreen.endRow &&
                      col >= boardData.InfoScreen.startCol &&
                      col <= boardData.InfoScreen.endCol;
                    
                    if (isInsideInfoScreen && !isInfoScreenStart) {
                      return null;
                    }

                    if (isDiceButtonSecondCell) {
                      return null;
                    }

                    return (
                      <div
                        key={`${row}-${col}`}
                        style={{
                          backgroundColor: isDiceButtonStart 
                            ? 'transparent'
                            : isInfoScreenStart
                            ? 'black'
                            : 'transparent',
                          background: !isDiceButtonStart && !isInfoScreenStart && square 
                            ? getSquareStyle(square.type).background 
                            : undefined,
                          gridColumn: isDiceButtonStart 
                            ? 'span 2' 
                            : isInfoScreenStart
                            ? `span ${boardData.InfoScreen.endCol - boardData.InfoScreen.startCol + 1}`
                            : 'auto',
                          gridRow: isInfoScreenStart
                            ? `span ${boardData.InfoScreen.endRow - boardData.InfoScreen.startRow + 1}`
                            : 'auto',
                          borderRadius: isDiceButtonStart ? '0.75rem' : '0.375rem',
                          border: square ? '2px solid black' : isDiceButtonStart || isInfoScreenStart ? '1px solid rgba(0,0,0,0.2)' : 'none',
                          position: 'relative'
                        }}
                        className="w-full h-full"
                      >
                        {square && <DirectionIndicator directions={square.directions} />}
                        
                        {square && getSquareStyle(square.type).content && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {getSquareStyle(square.type).content}
                          </div>
                        )}

                        {/* Renderização dos peões dos jogadores */}
                        {players && players.map((player, index) => {
                          const isAnimating = animatingPawns[player.username]?.isAnimating;
                          const currentStep = animatingPawns[player.username]?.currentStep;
                          const path = animatingPawns[player.username]?.path;
                          
                          // Determinar a posição atual do peão
                          let currentPosition;
                          if (isAnimating && path && currentStep !== undefined) {
                            currentPosition = path[currentStep];
                          } else {
                            currentPosition = animatingPawns[player.username]?.currentPosition || { col: 0, row: 0 };
                          }

                          // Só renderiza o peão se estiver na célula atual
                          if (currentPosition.col === col && currentPosition.row === row) {
                            // Calcula a posição na grade 2x2
                            const gridRow = Math.floor(index / 2);
                            const gridCol = index % 2;
                            
                            return (
                              <div 
                                key={player.username}
                                className={`absolute flex items-center justify-center transition-all duration-500 ${isAnimating ? 'animate-bounce' : ''}`}
                                style={{ 
                                  zIndex: 20,
                                  width: '45%',
                                  height: '45%',
                                  left: `${(gridCol * 55) + 2.5}%`,
                                  top: `${(gridRow * 55) + 2.5}%`,
                                  transform: 'none'
                                }}
                              >
                                <div 
                                  className="w-full h-full rounded-full shadow-lg transform transition-transform hover:scale-110"
                                  style={{
                                    backgroundColor: player.clientColor,
                                    border: '1px solid white',
                                    boxShadow: `0 0 10px ${player.clientColor}`
                                  }}
                                />
                              </div>
                            );
                          }
                          return null;
                        })}
                        
                        {isDiceButtonStart && (
                          <div className="absolute inset-0" style={{ zIndex: 50 }}>
                            <DiceRoller
                              roomName={roomName}
                              userName={userName}
                              isMyTurn={isMyTurn}
                            />
                          </div>
                        )}
                        {isInfoScreenStart && (
                          <div className="w-full h-full bg-gray-900 p-2 rounded-lg">
                            <InfoScreen 
                              roomName={roomName}
                              userName={userName}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default BasicBoard;