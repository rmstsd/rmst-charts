import { Line } from '../../shape'
import { ICoord } from '../../type'
import { calcSmoothPath2D } from './curve'
import { calcStraightPath2D } from './straight'

export * from './straight'
export * from './curve'

export function pointToFlatArray(list: ICoord[]) {
  return list.reduce((acc, item) => acc.concat(item.x, item.y), [])
}

export function convertToNormalPoints(points: number[]): ICoord[] {
  return points
    .reduce((acc, item, index) => {
      const tarIndex = Math.floor(index / 2)
      if (index % 2 == 0) acc.push([item])
      else acc[tarIndex].push(item)
      return acc
    }, [])
    .map(([x, y]) => ({ x, y }))
}

export function createLinePath2D(data: Line['data']) {
  const { points, closed, smooth, percent } = data

  const path2D = smooth ? calcSmoothPath2D(points, percent) : calcStraightPath2D(points, percent)

  if (closed) {
    path2D.closePath()
  }

  return path2D
}
