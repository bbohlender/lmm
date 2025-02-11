import {
  GridCell,
  GridPosition,
  InterpolatedPoint,
  Neighbor,
} from "../types/pedestrian";
import React from "react";

export function generateGridLines(
  width: number,
  height: number,
  padding: number,
  gridSize: number
) {
  const lines = [];
  const effectiveWidth = width - 2 * padding;
  const effectiveHeight = height - 2 * padding;

  // Vertical lines
  for (let i = 0; i <= gridSize; i++) {
    const x = padding + (i * effectiveWidth) / gridSize;
    lines.push(
      <line
        key={`vertical-${i}`}
        x1={x}
        y1={padding}
        x2={x}
        y2={height - padding}
        stroke="rgba(82, 82, 91, 0.15)"
        strokeWidth="1"
      />
    );
  }

  // Horizontal lines
  for (let i = 0; i <= gridSize; i++) {
    const y = padding + (i * effectiveHeight) / gridSize;
    lines.push(
      <line
        key={`horizontal-${i}`}
        x1={padding}
        y1={y}
        x2={width - padding}
        y2={y}
        stroke="rgba(82, 82, 91, 0.15)"
        strokeWidth="1"
      />
    );
  }
  return lines;
}

export function getGridCell(
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number,
  gridSize: number,
  scaleX: (x: number) => number,
  scaleY: (y: number) => number
): GridCell {
  const effectiveWidth = width - 2 * padding;
  const effectiveHeight = height - 2 * padding;
  const cellWidth = effectiveWidth / gridSize;
  const cellHeight = effectiveHeight / gridSize;

  const screenX = scaleX(x);
  const screenY = scaleY(y);

  const cellX = Math.floor((screenX - padding) / cellWidth);
  const cellY = Math.floor((screenY - padding) / cellHeight);

  return {
    x: padding + cellX * cellWidth,
    y: padding + cellY * cellHeight,
    width: cellWidth,
    height: cellHeight,
  };
}

export function getNeighborhood(
  pedestrianIndex: number,
  activePedestrians: Map<number, InterpolatedPoint>,
  width: number,
  height: number,
  padding: number,
  gridSize: number,
  neighborhoodSize: number,
  scaleX: (x: number) => number,
  scaleY: (y: number) => number
): Neighbor[] {
  const pedestrian = activePedestrians.get(pedestrianIndex)!;
  const neighbors: Neighbor[] = [];

  const gridPositions: GridPosition[] = Array.from(
    activePedestrians.values()
  ).map((ped) => {
    const cell = getGridCell(
      ped.x,
      ped.y,
      width,
      height,
      padding,
      gridSize,
      scaleX,
      scaleY
    );
    const effectiveWidth = width - 2 * padding;
    const effectiveHeight = height - 2 * padding;
    const cellWidth = effectiveWidth / gridSize;
    const cellHeight = effectiveHeight / gridSize;

    return {
      x: Math.floor((cell.x - padding) / cellWidth),
      y: Math.floor((cell.y - padding) / cellHeight),
    };
  });

  const mainPosition = gridPositions[pedestrianIndex];

  activePedestrians.forEach((_, index) => {
    if (index === pedestrianIndex) return;

    const otherPosition = gridPositions[index];
    const relativeX = otherPosition.x - mainPosition.x;
    const relativeY = otherPosition.y - mainPosition.y;

    if (
      Math.abs(relativeX) <= neighborhoodSize &&
      Math.abs(relativeY) <= neighborhoodSize
    ) {
      neighbors.push({
        relativeX,
        relativeY,
        pedestrianIndex: index,
      });
    }
  });

  return neighbors;
}
