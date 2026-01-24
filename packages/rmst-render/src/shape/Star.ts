import { calculateStarPath } from '../geometry/geometry'
import { IShapeType } from '../type'
import { normalizedAttrs } from '../utils/attr'
import Path, { PathData } from './Path'

const defaultData = {
  side: 5
}

export interface StarData extends PathData {
  side?: number
}

export class Star extends Path {
  constructor(data: StarData) {
    const d = calculateStarPath(data.width, data.height, data.side)

    super({ ...data, ...defaultData, d })
  }

  type: IShapeType = 'Star'

  override attr(...args: any[]): void {
    const attrs = normalizedAttrs(args) as StarData

    if (Reflect.has(attrs, 'side')) {
      this.data.d = calculateStarPath(this.data.width, this.data.height, attrs.side)
    }

    super.attr(attrs)
  }

  declare data: StarData
}

export default Star
