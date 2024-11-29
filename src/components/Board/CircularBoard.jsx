import React from 'react';
import { Stage, Layer, Rect, Circle } from 'react-konva';

const CircularBoard = ({ cellSize, playerPosition }) => {
  // Definir o caminho circular para este tabuleiro
  const circularPath = [
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 2 },
    { x: 4, y: 3 }, { x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 2 }
  ];

  return (
    <Stage width={6 * cellSize} height={6 * cellSize}>
      <Layer>
        {/* Renderizar o grid */}
        {[...Array(6)].map((_, rowIndex) =>
          [...Array(6)].map((_, colIndex) => (
            <Rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex * cellSize}
              y={rowIndex * cellSize}
              width={cellSize}
              height={cellSize}
              fill={circularPath.some(p => p.x === colIndex && p.y === rowIndex) ? 'lightgreen' : 'white'}
              stroke="black"
            />
          ))
        )}

        {/* Renderizar o jogador */}
        {circularPath[playerPosition] && (
          <Circle
            x={circularPath[playerPosition].x * cellSize + cellSize / 2}
            y={circularPath[playerPosition].y * cellSize + cellSize / 2}
            radius={20}
            fill="blue"
          />
        )}
      </Layer>
    </Stage>
  );
};

export default CircularBoard;
