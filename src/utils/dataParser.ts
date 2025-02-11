import { Point, Spline } from '../types/pedestrian'

export function parseTrajectoryData(data: string) {
  const lines = data.trim().split("\n")
  const numSplines = Number.parseInt(lines[0])
  let currentLine = 1
  const parsedSplines: Spline[] = []
  let minFrame = Number.POSITIVE_INFINITY,
    maxFrame = Number.NEGATIVE_INFINITY
  let minX = Number.POSITIVE_INFINITY,
    maxX = Number.NEGATIVE_INFINITY,
    minY = Number.POSITIVE_INFINITY,
    maxY = Number.NEGATIVE_INFINITY

  for (let i = 0; i < numSplines; i++) {
    const numControlPoints = Number.parseInt(lines[currentLine])
    currentLine++

    const points: Point[] = []
    for (let j = 0; j < numControlPoints; j++) {
      const [x, y, frameNumber, gazeDirection] = lines[currentLine].split(" ").map(Number)
      points.push({ x, y, frameNumber, gazeDirection })
      minFrame = Math.min(minFrame, frameNumber)
      maxFrame = Math.max(maxFrame, frameNumber)
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
      currentLine++
    }

    parsedSplines.push({ numControlPoints, points })
  }

  return { splines: parsedSplines, minFrame, maxFrame, minX, maxX, minY, maxY }
} 