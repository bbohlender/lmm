"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { parseTrajectoryData } from "./utils/dataParser";
import { getActivePedestrians } from "./utils/trajectoryCalculations";
import {
  generateGridLines,
  getGridCell,
  getNeighborhood,
} from "./utils/gridCalculations";
import type { InterpolatedPoint } from "./types/pedestrian";
import { generateTrajectoryStrings } from "./utils/trajectoryStringGenerator";

interface Point {
  x: number;
  y: number;
  frameNumber: number;
  gazeDirection: number;
}

interface Spline {
  numControlPoints: number;
  points: Point[];
}

interface PedestrianTrajectoriesProps {
  data: string;
}

interface GridPosition {
  x: number;
  y: number;
}

interface Neighbor {
  relativeX: number;
  relativeY: number;
  pedestrianIndex: number;
}

const PedestrianTrajectories: React.FC<PedestrianTrajectoriesProps> = ({
  data,
}) => {
  const { splines, minFrame, maxFrame, minX, maxX, minY, maxY } = useMemo(
    () => parseTrajectoryData(data),
    [data]
  );

  const [currentFrame, setCurrentFrame] = useState(minFrame);
  const [gridSize, setGridSize] = useState(20);
  const [neighborhoodSize, setNeighborhoodSize] = useState(1);
  const [keyframeSize, setKeyframeSize] = useState(10);

  const width = 800;
  const height = 600;
  const padding = 20;

  const scaleX = (x: number) =>
    ((x - minX) / (maxX - minX)) * (width - 2 * padding) + padding;
  const scaleY = (y: number) =>
    ((y - minY) / (maxY - minY)) * (height - 2 * padding) + padding;

  const currentKeyframe =
    Math.floor(currentFrame / keyframeSize) * keyframeSize;
  const activePedestrians = getActivePedestrians(splines, currentKeyframe);

  const gridLines = generateGridLines(width, height, padding, gridSize);

  const handleDownload = () => {
    const content = generateTrajectoryStrings(
      splines,
      minFrame,
      maxFrame,
      keyframeSize,
      width,
      height,
      padding,
      gridSize,
      neighborhoodSize,
      scaleX,
      scaleY
    );
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trajectories.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black text-zinc-100">
      {/* Left Control Panel */}
      <div className="w-64 bg-zinc-900/30 backdrop-blur-xl p-6 flex flex-col gap-8 
                      border-r border-zinc-800/40 overflow-auto">
        {/* More spacious controls with bolder labels */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-3 flex justify-between">
            <span>Grid Size</span>
            <span className="text-zinc-400">{gridSize}</span>
          </label>
          {/* Same slider styles but larger */}
          <input
            type="range"
            min={2}
            max={50}
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                      [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-zinc-300 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 
                      [&::-moz-range-thumb]:bg-zinc-300 [&::-moz-range-thumb]:rounded-full 
                      [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-3 flex justify-between">
            <span>Neighborhood Size</span>
            <span className="text-zinc-400">{neighborhoodSize}</span>
          </label>
          <input
            type="range"
            min={0}
            max={5}
            value={neighborhoodSize}
            onChange={(e) => setNeighborhoodSize(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                      [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-zinc-300 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 
                      [&::-moz-range-thumb]:bg-zinc-300 [&::-moz-range-thumb]:rounded-full 
                      [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-3 flex justify-between">
            <span>Keyframe Size</span>
            <span className="text-zinc-400">{keyframeSize}</span>
          </label>
          <input
            type="range"
            min={1}
            max={50}
            value={keyframeSize}
            onChange={(e) => setKeyframeSize(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                      [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-zinc-300 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 
                      [&::-moz-range-thumb]:bg-zinc-300 [&::-moz-range-thumb]:rounded-full 
                      [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>
      </div>

      {/* Center Panel with Grid and Timeline */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Main visualization */}
        <div className="flex-1 min-h-0 relative p-4">
          <svg 
            className="w-full h-full bg-black"
            preserveAspectRatio="xMidYMid meet"
            viewBox={`0 0 ${width} ${height}`}
          >
            {/* Grid lines - More prominent */}
            {gridLines}
            {/* Trajectories - More vibrant */}
            {splines.map((spline, index) => (
              <polyline
                key={index}
                points={spline.points.map((p) => `${scaleX(p.x)},${scaleY(p.y)}`).join(" ")}
                fill="none"
                stroke={`hsl(${(index * 360) / splines.length}, 40%, 85%)`}
                strokeWidth="1.5"
                strokeOpacity="0.8"
              />
            ))}
            {/* Pedestrians - More prominent */}
            {Array.from(activePedestrians.entries()).map(([index, pedestrian]) => {
              const cell = getGridCell(
                pedestrian.x,
                pedestrian.y,
                width,
                height,
                padding,
                gridSize,
                scaleX,
                scaleY
              );

              const neighborhoodWidth = cell.width * (neighborhoodSize * 2 + 1);
              const neighborhoodHeight = cell.height * (neighborhoodSize * 2 + 1);
              const neighborhoodX = cell.x - neighborhoodSize * cell.width;
              const neighborhoodY = cell.y - neighborhoodSize * cell.height;

              return (
                <g key={index}>
                  <rect
                    x={neighborhoodX}
                    y={neighborhoodY}
                    width={neighborhoodWidth}
                    height={neighborhoodHeight}
                    fill={`hsl(${(index * 360) / splines.length}, 40%, 85%)`}
                    fillOpacity="0.15"
                    stroke={`hsl(${(index * 360) / splines.length}, 40%, 85%)`}
                    strokeOpacity="0.3"
                    strokeWidth="1"
                    rx="3"
                    className="drop-shadow-lg"
                  />
                  <rect
                    x={cell.x}
                    y={cell.y}
                    width={cell.width}
                    height={cell.height}
                    fill={`hsl(${(index * 360) / splines.length}, 40%, 85%)`}
                    fillOpacity="0.3"
                    stroke={`hsl(${(index * 360) / splines.length}, 40%, 85%)`}
                    strokeWidth="1.5"
                    rx="2"
                    className="drop-shadow-xl"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Timeline Panel */}
        <div className="bg-zinc-900/30 backdrop-blur-xl p-6 border-t border-zinc-800/40">
          {/* Larger, more prominent timeline */}
          <div className="w-full h-6 relative mb-1">
            {Array.from({ length: Math.floor((maxFrame - minFrame) / keyframeSize) + 1 }).map((_, i) => {
              const frame = minFrame + i * keyframeSize;
              const position = ((frame - minFrame) / (maxFrame - minFrame)) * 100;
              return (
                <div
                  key={i}
                  className="absolute w-px h-2 bg-zinc-700"
                  style={{ left: `${position}%` }}
                >
                  <div className="text-xs text-zinc-600 mt-3 transform -translate-x-1/2">
                    {frame}
                  </div>
                </div>
              );
            })}
          </div>
          <input
            type="range"
            min={minFrame}
            max={maxFrame}
            value={currentFrame}
            onChange={(e) => setCurrentFrame(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                      [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-zinc-300 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 
                      [&::-moz-range-thumb]:bg-zinc-300 [&::-moz-range-thumb]:rounded-full 
                      [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-sm text-zinc-400 mt-3">
            <span>{minFrame}</span>
            <span className="text-zinc-300 font-medium">Frame {currentFrame}</span>
            <span>{maxFrame}</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-96 bg-zinc-900/30 backdrop-blur-xl p-6 flex flex-col 
                      border-l border-zinc-800/40 overflow-hidden">
        <div className="flex-1 overflow-auto min-h-0">
          <div className="space-y-3">
            {Array.from(activePedestrians.entries()).map(([index, pedestrian]) => {
              const color = `hsl(${(index * 360) / splines.length}, 40%, 85%)`;
              const neighbors = getNeighborhood(
                index,
                activePedestrians,
                width,
                height,
                padding,
                gridSize,
                neighborhoodSize,
                scaleX,
                scaleY
              );

              return (
                <div key={index} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/20 
                                          hover:bg-zinc-900/70 transition-colors">
                  <div className="flex items-center mb-2">
                    <div
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="ml-2 text-sm font-medium text-zinc-300">
                      Pedestrian {index + 1}
                    </span>
                  </div>
                  {neighbors.length > 0 ? (
                    <div className="space-y-1.5">
                      {neighbors.map((neighbor, nIndex) => (
                        <div key={nIndex} className="flex items-center text-xs text-zinc-400">
                          <div
                            className="w-2 h-2 rounded-sm"
                            style={{
                              backgroundColor: `hsl(${
                                (neighbor.pedestrianIndex * 360) / splines.length
                              }, 40%, 85%)`
                            }}
                          />
                          <span className="ml-2">
                            P{neighbor.pedestrianIndex + 1} ({neighbor.relativeX}, {neighbor.relativeY})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500">No neighbors</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-zinc-800/20">
          <div className="text-sm text-zinc-400 mb-4 font-medium">
            {activePedestrians.size} Active Pedestrians
          </div>
          <button
            onClick={handleDownload}
            className="w-full px-4 py-3 text-sm font-medium text-zinc-200 bg-zinc-800/50 
                     rounded-xl hover:bg-zinc-800/70 transition-all hover:scale-[1.02] 
                     active:scale-[0.98] backdrop-blur-sm cursor-pointer"
          >
            Download Trajectories
          </button>
        </div>
      </div>
    </div>
  );
};

export default PedestrianTrajectories;
