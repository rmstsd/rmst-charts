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
}

export default Path

export const getBBox = (d: string) => {
  const [x1, y1, x2, y2] = svgPathBbox(d)

  const rect = { x: x1, y: y1, width: x2 - x1, height: y2 - y1 }
  return rect
}
