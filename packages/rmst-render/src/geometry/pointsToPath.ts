import { ICoord } from '../type'

export const pointsToPath = (points: ICoord[]): string => {
  const pathData =
    points.reduce((acc, point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${acc}${command}${point.x.toFixed(3)},${point.y.toFixed(3)} `
    }, '') + 'Z'
  return pathData
}
