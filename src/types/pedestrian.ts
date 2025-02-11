export interface Point {
  x: number
  y: number
  frameNumber: number
  gazeDirection: number
}

export interface Spline {
  numControlPoints: number
  points: Point[]
}

export interface InterpolatedPoint {
  x: number
  y: number
  gazeDirection: number
}

export interface GridPosition {
  x: number
  y: number
}

export interface Neighbor {
  relativeX: number
  relativeY: number
  pedestrianIndex: number
}

export interface GridCell {
  x: number
  y: number
  width: number
  height: number
} 