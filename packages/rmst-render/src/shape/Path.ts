import svgPath from 'svgpath'
import { normalizedAttrs } from '../utils/attr'
import AbstractUi, { AbstractUiData, IRect } from './AbstractUi'
import { svgPathBbox } from 'svg-path-bbox'

const defaultData = {
  d: ''
}

interface PathData extends AbstractUiData {
  d?: string
  width?: number
  height?: number
}

export class Path extends AbstractUi<PathData> {
  constructor(data: PathData) {
    super('Path', data, defaultData)
  }

  declare data: PathData

  getBBox() {
    return getBBox(this.data.d)
  }

  override attr(...args: any[]): void {
    const attrs = normalizedAttrs(args)

    if (Reflect.has(attrs, 'width') || Reflect.has(attrs, 'height')) {
      let oldWidth = this.data.width
      let oldHeight = this.data.height

      const newWidth = attrs.width ?? oldWidth
      const newHeight = attrs.height ?? oldHeight

      if (oldWidth && oldHeight) {
        const nd = svgPath(this.data.d)
          .scale(newWidth / oldWidth, newHeight / oldHeight)
          .toString()

        this.data.d = nd
      }
    }

    super.attr(attrs)
  }
}

export default Path

export const getBBox = (d: string) => {
  const [x1, y1, x2, y2] = svgPathBbox(d)

  const rect = { x: x1, y: y1, width: x2 - x1, height: y2 - y1 }
  return rect
}
