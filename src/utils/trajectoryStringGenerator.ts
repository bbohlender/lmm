import { Spline, GridPosition, InterpolatedPoint } from "../types/pedestrian";
import { getActivePedestrians } from "./trajectoryCalculations.js";
import { getGridCell, getNeighborhood } from "./gridCalculations.js";

export function generateTrajectoryStrings(
  splines: Spline[],
  minFrame: number,
  maxFrame: number,
  keyframeSize: number,
  width: number,
  height: number,
  padding: number,
  gridSize: number,
  neighborhoodSize: number,
  scaleX: (x: number) => number,
  scaleY: (y: number) => number
): string {
  const pedestrianStrings: Map<number, string> = new Map();
  const previousPositions: Map<number, GridPosition> = new Map();

  for (let frame = minFrame; frame <= maxFrame; frame += keyframeSize) {
    const active = getActivePedestrians(splines, frame);

    active.forEach((pedestrian, index) => {
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
      const effectiveWidth = width - 2 * padding;
      const effectiveHeight = height - 2 * padding;
      const cellWidth = effectiveWidth / gridSize;
      const cellHeight = effectiveHeight / gridSize;

      const currentPos: GridPosition = {
        x: Math.floor((cell.x - padding) / cellWidth),
        y: Math.floor((cell.y - padding) / cellHeight),
      };

      const prevPos = previousPositions.get(index)!;
      previousPositions.set(index, currentPos);

      if (!pedestrianStrings.has(index)) {
        pedestrianStrings.set(index, `pw_${currentPos.x}_${currentPos.y}`);
        return;
      }

      if (prevPos == null) {
        return;
      }

      const rx = currentPos.x - prevPos.x;
      const ry = currentPos.y - prevPos.y;

      pedestrianStrings.set(
        index,
        pedestrianStrings.get(index)! +
          " " +
          (rx === 0 && ry === 0
            ? "0"
            : [
                rx < 0 ? `${-rx}W` : rx > 0 ? `${rx}E` : "",
                ry < 0 ? `${-ry}N` : ry > 0 ? `${ry}S` : "",
              ].join(""))
      );

      const neighbors = getNeighborhood(
        index,
        active,
        width,
        height,
        padding,
        gridSize,
        neighborhoodSize,
        scaleX,
        scaleY
      );
      pedestrianStrings.set(
        index,
        pedestrianStrings.get(index)! +
          neighbors
            .map((n) => {
              const rx = n.relativeX;
              const ry = n.relativeY;
              return [
                "_pw",
                rx < 0 ? `${-rx}W` : rx > 0 ? `${rx}E` : "",
                ry < 0 ? `${-ry}N` : ry > 0 ? `${ry}S` : "",
              ]
                .filter(Boolean)
                .join("");
            })
            .join("")
      );
    });
  }

  return Array.from(pedestrianStrings.values()).join("\n");
}
