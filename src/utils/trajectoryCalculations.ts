import { Spline, InterpolatedPoint } from '../types/pedestrian'

export function getInterpolatedPosition(spline: Spline, frame: number): InterpolatedPoint | null {
  const points = spline.points
  if (!points || points.length === 0) {
    return null
  }

  if (frame < points[0].frameNumber || frame > points[points.length - 1].frameNumber) {
    return null
  }

  for (let i = 0; i < points.length - 1; i++) {
    if (frame >= points[i].frameNumber && frame <= points[i + 1].frameNumber) {
      const t = (frame - points[i].frameNumber) / (points[i + 1].frameNumber - points[i].frameNumber)
      return {
        x: points[i].x + t * (points[i + 1].x - points[i].x),
        y: points[i].y + t * (points[i + 1].y - points[i].y),
        gazeDirection: points[i].gazeDirection + t * (points[i + 1].gazeDirection - points[i].gazeDirection),
      }
    }
  }

  return null
}

export function getActivePedestrians(splines: Spline[], frame: number): Map<number, InterpolatedPoint> {
  const activeMap = new Map<number, InterpolatedPoint>();
  
  splines.forEach((spline, index) => {
    const position = getInterpolatedPosition(spline, frame);
    if (position !== null) {
      activeMap.set(index, position);
    }
  });
  
  return activeMap;
} 