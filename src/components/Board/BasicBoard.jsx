import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import DiceRoller from '../DiceRoller';
import { FaGift, FaPiggyBank, FaQuestion, FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown, FaSearchPlus, FaSearchMinus, FaRedo } from 'react-icons/fa';
import { GiCrossedSwords } from 'react-icons/gi';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const boardData = {
  "gridSize": 15,
  "gameSquares": [
    { "col": 0, "row": 0, "type": "Start", "directions": ["right"] },
    { "col": 1, "row": 0, "type": "Green", "directions": ["right"] },
    { "col": 2, "row": 0, "type": "Gift", "directions": ["right"] },
    { "col": 3, "row": 0, "type": "Gift", "directions": ["right"] },
    { "col": 4, "row": 0, "type": "Green", "directions": ["right"] },
    { "col": 5, "row": 0, "type": "Green", "directions": ["right"] },
    { "col": 6, "row": 0, "type": "Duel", "directions": ["right"] },
    { "col": 7, "row": 0, "type": "Green", "directions": ["right","down"] },
    { "col": 8, "row": 0, "type": "Red", "directions": ["right"] },
    { "col": 9, "row": 0, "type": "Green", "directions": ["right"] },
    { "col": 10, "row": 0, "type": "Green", "directions": ["right"] },
    { "col": 11, "row": 0, "type": "Event", "directions": ["right"] },
    { "col": 12, "row": 0, "type": "Green", "directions": ["right"] },
    { "col": 13, "row": 0, "type": "Teleport", "directions": ["right"] },
    { "col": 14, "row": 0, "type": "Duel", "directions": ["down"] },

    { "col": 0, "row": 1, "type": "Teleport", "directions": ["up"] },
    { "col": 7, "row": 1, "type": "Bank", "directions": ["down"] },
    { "col": 14, "row": 1, "type": "Green", "directions": ["down"] },

    { "col": 0, "row": 2, "type": "Red", "directions": ["up"] },
    { "col": 7, "row": 2, "type": "Red", "directions": ["down"] },
    { "col": 14, "row": 2, "type": "Gift", "directions": ["down"] },
    
    { "col": 0, "row": 3, "type": "Green", "directions": ["up"] },
    { "col": 3, "row": 3, "type": "Teleport", "directions": ["down"] },
    { "col": 4, "row": 3, "type": "Event", "directions": ["left"] },
    { "col": 5, "row": 3, "type": "Event", "directions": ["left"] },
    { "col": 6, "row": 3, "type": "Green", "directions": ["left"] },
    { "col": 7, "row": 3, "type": "Green", "directions": ["left"] },
    { "col": 8, "row": 3, "type": "Red", "directions": ["left"] },
    { "col": 9, "row": 3, "type": "Green", "directions": ["left"] },
    { "col": 10, "row": 3, "type": "Gift", "directions": ["left"] },
    { "col": 11, "row": 3, "type": "Teleport", "directions": ["left"] },
    { "col": 14, "row": 3, "type": "Red", "directions": ["down"] },

    { "col": 0, "row": 4, "type": "Event", "directions": ["up"] },
    { "col": 3, "row": 4, "type": "Green", "directions": ["down"] },
    { "col": 11, "row": 4, "type": "Green", "directions": ["up"] },
    { "col": 14, "row": 4, "type": "Green", "directions": ["down"] },

    { "col": 0, "row": 5, "type": "Bank", "directions": ["up"] },
    { "col": 1, "row": 5, "type": "Green", "directions": ["left"] },
    { "col": 2, "row": 5, "type": "Green", "directions": ["left"] },
    { "col": 3, "row": 5, "type": "Red", "directions": ["left"] },
    { "col": 11, "row": 5, "type": "Green", "directions": ["up"] },
    { "col": 12, "row": 5, "type": "Duel", "directions": ["left"] },
    { "col": 13, "row": 5, "type": "Jackpot", "directions": ["left"] },
    { "col": 14, "row": 5, "type": "Green", "directions": ["left","down"] },

    { "col": 0, "row": 6, "type": "Duel", "directions": ["up"] },
    { "col": 14, "row": 6, "type": "Green", "directions": ["down"] },

    { "col": 0, "row": 7, "type": "Green", "directions": ["up"] },
    { "col": 14, "row": 7, "type": "Event", "directions": ["down"] },

    { "col": 0, "row": 8, "type": "Red", "directions": ["up"] },
    { "col": 14, "row": 8, "type": "Green", "directions": ["down"] },

    { "col": 0, "row": 9, "type": "Gift", "directions": ["right","up"] },
    { "col": 1, "row": 9, "type": "Red", "directions": ["right"] },
    { "col": 2, "row": 9, "type": "Green", "directions": ["right"] },
    { "col": 3, "row": 9, "type": "Jackpot", "directions": ["down"] },
    { "col": 11, "row": 9, "type": "Green", "directions": ["right"] },
    { "col": 12, "row": 9, "type": "Red", "directions": ["right"] },
    { "col": 13, "row": 9, "type": "Event", "directions": ["right"] },
    { "col": 14, "row": 9, "type": "Bank", "directions": ["down"] },

    { "col": 0, "row": 10, "type": "Green", "directions": ["up"] },
    { "col": 3, "row": 10, "type": "Green", "directions": ["down"] },
    { "col": 11, "row": 10, "type": "Green", "directions": ["up"] },
    { "col": 14, "row": 10, "type": "Green", "directions": ["down"] },

    { "col": 0, "row": 11, "type": "Green", "directions": ["up"] },
    { "col": 3, "row": 11, "type": "Green", "directions": ["right"] },
    { "col": 4, "row": 11, "type": "Event", "directions": ["right"] },
    { "col": 5, "row": 11, "type": "Green", "directions": ["right"] },
    { "col": 6, "row": 11, "type": "Duel", "directions": ["right"] },
    { "col": 7, "row": 11, "type": "Teleport", "directions": ["right"] },
    { "col": 8, "row": 11, "type": "Green", "directions": ["right"] },
    { "col": 9, "row": 11, "type": "Jackpot", "directions": ["right"] },
    { "col": 10, "row": 11, "type": "Red", "directions": ["right"] },
    { "col": 11, "row": 11, "type": "Green", "directions": ["up"] },
    { "col": 14, "row": 11, "type": "Green", "directions": ["down"] },

    { "col": 0, "row": 12, "type": "Duel", "directions": ["up"] },
    { "col": 5, "row": 12, "type": "Gift", "directions": ["up"] },
    { "col": 9, "row": 12, "type": "Jackpot", "directions": ["up"] },
    { "col": 14, "row": 12, "type": "Gift", "directions": ["down"] },

    { "col": 0, "row": 13, "type": "Red", "directions": ["up"] },
    { "col": 5, "row": 13, "type": "Gift", "directions": ["up"] },
    { "col": 9, "row": 13, "type": "Green", "directions": ["up"] },
    { "col": 14, "row": 13, "type": "Teleport", "directions": ["down"] },

    { "col": 0, "row": 14, "type": "Jackpot", "directions": ["up"] },
    { "col": 1, "row": 14, "type": "Teleport", "directions": ["left"] },
    { "col": 2, "row": 14, "type": "Green", "directions": ["left"] },
    { "col": 3, "row": 14, "type": "Green", "directions": ["left"] },
    { "col": 4, "row": 14, "type": "Red", "directions": ["left"] },
    { "col": 5, "row": 14, "type": "Red", "directions": ["left","up"] },
    { "col": 6, "row": 14, "type": "Green", "directions": ["left"] },
    { "col": 7, "row": 14, "type": "Event", "directions": ["left"] },
    { "col": 8, "row": 14, "type": "Green", "directions": ["left"] },
    { "col": 9, "row": 14, "type": "Duel", "directions": ["left","up"] },
    { "col": 10, "row": 14, "type": "Event", "directions": ["left"] },
    { "col": 11, "row": 14, "type": "Event", "directions": ["left"] },
    { "col": 12, "row": 14, "type": "Green", "directions": ["left"] },
    { "col": 13, "row": 14, "type": "Green", "directions": ["left"] },
    { "col": 14, "row": 14, "type": "Red", "directions": ["left"] },

  ],
  "diceButton": { "col": 2, "row": 7 },
  "InfoScreen": { "startCol": 4, "startRow": 4, "endCol": 10, "endRow": 10 }
};

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

const BasicBoard = ({ playerPositions, players, roomName, userName, isMyTurn }) => {
  const containerRef = useRef(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setSize(Math.min(clientWidth, clientHeight));
    }
    console.log(playerPositions)
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
                  
                  // Verifica se a célula atual está dentro da área do InfoScreen
                  const isInfoScreenStart = 
                    row === boardData.InfoScreen.startRow && 
                    col === boardData.InfoScreen.startCol;
                  const isInsideInfoScreen = 
                    row >= boardData.InfoScreen.startRow &&
                    row <= boardData.InfoScreen.endRow &&
                    col >= boardData.InfoScreen.startCol &&
                    col <= boardData.InfoScreen.endCol;
                  
                  // Pula a renderização de todas as células dentro do InfoScreen, exceto a primeira
                  if (isInsideInfoScreen && !isInfoScreenStart) {
                    return null;
                  }

                  // Pula a renderização da segunda célula do botão
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
                        {/* Adicione o indicador de direção se houver um square */}
                        {square && <DirectionIndicator directions={square.directions} />}
                        
                        {/* Renderiza o ícone se existir */}
                        {square && getSquareStyle(square.type).content && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {getSquareStyle(square.type).content}
                          </div>
                        )}
                        
                        {isDiceButtonStart && (
                          <div className="absolute inset-0 p-1" style={{ zIndex: 50 }}>
                            <DiceRoller
                              roomName={roomName}
                              userName={userName}
                              isMyTurn={isMyTurn}
                            />
                          </div>
                        )}
                        {isInfoScreenStart && (
                        <div className="w-full h-full bg-black p-4">
                          {/* Aqui você pode adicionar o conteúdo do InfoScreen */}
                          <div className="text-white">Info Screen Area</div>
                        </div>
                      )}
                        {/*}
                        {playerPositions?.map((player, index) => {
                          if (player.col === col && player.row === row) {
                            return (
                              <div 
                                key={index}
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ zIndex: 2 }}
                              >
                                <div className="w-4 h-4 rounded-full bg-blue-500" />
                              </div>
                            );
                          }
                          return null;
                        })}
                          */}
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