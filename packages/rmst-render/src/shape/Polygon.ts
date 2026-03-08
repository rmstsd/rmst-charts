// 正多边形

import { calculatePolygonPath } from '../geometry/geometry'
import { IShapeType } from '../type'
import { normalizedAttrs } from '../utils/attr'
import Path, { PathData } from './Path'

const defaultData = {
  side: 3
}

export interface PolygonData extends PathData {
  side?: number
}

export class Polygon extends Path {
  constructor(data: PolygonData) {
    const d = calculatePolygonPath(data.width, data.height, data.side)

    super({ ...data, ...defaultData, d })
  }

  get type(): IShapeType {
    return 'Polygon'
  }

  override attr(...args: any[]): void {
    const attrs = normalizedAttrs(args) as PolygonData

    if (Reflect.has(attrs, 'side')) {
      this.data.d = calculatePolygonPath(this.data.width, this.data.height, attrs.side)
    }

    super.attr(attrs)
  }

  declare data: PolygonData
}

export default Polygon
