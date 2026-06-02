import { omit } from 'es-toolkit'
import { IShapeType } from '../type'
import { normalizedAttrs } from '../utils/attr'
import UiBase, { UiBaseData } from './UiBase'
import { drawDonutEllipsePath } from '../renderer/canvas'
import Path from './Path'

const defaultData = {
  width: 200,
  height: 100
}

interface EllipseData extends UiBaseData {
  width?: number
  height?: number
  innerRadius?: number
}

export class Ellipse extends UiBase<EllipseData> {
  constructor(data: EllipseData) {
    super(data, defaultData)
  }

  get type(): IShapeType {
    return 'Ellipse'
  }

  declare data: EllipseData

  override attr(...args: any[]): void {
    const attrs = normalizedAttrs(args)

    if (Reflect.has(attrs, 'width') || Reflect.has(attrs, 'height')) {
      if (attrs.width <= 0) {
        attrs.width = 0.01
      }
      if (attrs.height <= 0) {
        attrs.height = 0.01
      }
    }

    super.attr(attrs)
  }

  override getOutLineShape(): UiBase<EllipseData> {
    let newData = omit(this.data, ['children'])

    newData = structuredClone(newData)

    const { width, height, innerRadius = 0 } = newData

    const cx = width / 2
    const cy = height / 2
    const rx = width / 2
    const ry = height / 2

    newData.d = drawDonutEllipsePath(cx, cy, rx, ry, innerRadius)

    return new Path(newData)
  }

  getBBox() {
    const data = this.data

    return { x: 0, y: 0, width: data.width, height: data.height }
  }
}

export default Ellipse
