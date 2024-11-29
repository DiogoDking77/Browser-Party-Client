import React from 'react';
import { Stage, Layer, Rect, Circle, Text, Line } from 'react-konva';

const BasicBoard = ({  cellSize, playerPositions, players  }) => {
  // Caminho principal
  const mainPath = [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, 
    { x: 6, y: 0, bifurcation: 'alternativePath' }, // Adicionando a bifurcação
    { x: 7, y: 0 }, { x: 8, y: 0 },
    { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 }, { x: 8, y: 6 }, { x: 8, y: 7 }, { x: 8, y: 8 },
    { x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 }, 
    { x: 0, y: 7 }, { x: 0, y: 6 }, { x: 0, y: 5 }, { x: 0, y: 4 }, { x: 0, y: 3 }, { x: 0, y: 2 }, { x: 0, y: 1 }
  ];

  // Caminho alternativo 1
  const alternativePath = [
    { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, 
    { x: 5, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 3 }, { x: 2, y: 3 }, 
    { x: 1, y: 3, connection: 'mainPath', connectionCell: { x: 0, y: 3 } } // Conecta ao mainPath
];


  const gridSize = 9; // Tamanho do grid (9x9)

  const getPlayersInCell = (x, y) => {
    return Object.entries(playerPositions).filter(([player, position]) => {
      const path = position >= mainPath.length ? alternativePath : mainPath;
      const cellPosition = path[position % path.length];
      return cellPosition.x === x && cellPosition.y === y;
    });
  };

  // Função para verificar se uma célula está em um dos caminhos
  const isPathCell = (x, y) => {
    return mainPath.some(p => p.x === x && p.y === y) || alternativePath.some(p => p.x === x && p.y === y);
  };

  // Função para verificar se uma célula é uma bifurcação
  const hasBifurcation = (x, y) => {
    const cell = mainPath.find(p => p.x === x && p.y === y);
    return cell && cell.bifurcation;
  };

  return (
    <Stage width={gridSize * cellSize} height={gridSize * cellSize}>
      <Layer>
        {/* Renderizar o grid */}
        {[...Array(gridSize)].map((_, rowIndex) =>
          [...Array(gridSize)].map((_, colIndex) => {
            const inMainPath = mainPath.some(p => p.x === colIndex && p.y === rowIndex);
            const inAltPath = alternativePath.some(p => p.x === colIndex && p.y === rowIndex);
            const fillColor = inMainPath ? '#6fcf97' : inAltPath ? '#f2994a' : '#f2f2f2';

            return (
              <Rect
                key={`${rowIndex}-${colIndex}`}
                x={colIndex * cellSize}
                y={rowIndex * cellSize}
                width={cellSize}
                height={cellSize}
                fill={fillColor}
                stroke="black"
                strokeWidth={3}
                cornerRadius={10}
              />
            );
          })
        )}

        {/* Renderizar os peões para cada jogador */}
        {[...Array(gridSize)].map((_, rowIndex) =>
          [...Array(gridSize)].map((_, colIndex) => {
            const playersInCell = getPlayersInCell(colIndex, rowIndex);
            const numPlayers = playersInCell.length;

            // Se não houver jogadores na célula, não renderiza peões
            if (numPlayers === 0) return null;

            // Calcular o tamanho do peão conforme o número de jogadores na célula
            const pieceSize = cellSize / (numPlayers > 1 ? numPlayers + 1 : 1.5);
            const offsets = [
              { x: -pieceSize / 2, y: -pieceSize / 2 },
              { x: pieceSize / 2, y: -pieceSize / 2 },
              { x: -pieceSize / 2, y: pieceSize / 2 },
              { x: pieceSize / 2, y: pieceSize / 2 },
            ];

            return playersInCell.map(([player, position], index) => {
              const playerColor = players.find(p => p.username === player)?.clientColor || 'transparent'; // Se o jogador foi removido, não renderiza
              const offset = offsets[index] || { x: 0, y: 0 };

              if (playerColor === 'transparent') return null;

              return (
                <Circle
                  key={`${player}-${index}`}
                  x={colIndex * cellSize + cellSize / 2 + offset.x}
                  y={rowIndex * cellSize + cellSize / 2 + offset.y}
                  radius={pieceSize / 2}
                  fill={playerColor}
                  shadowBlur={10}
                  shadowColor={`rgba(0, 0, 0, 0.4)`}
                />
              );
            });
          })
        )}
      </Layer>
    </Stage>
  );
};

export default BasicBoard;
