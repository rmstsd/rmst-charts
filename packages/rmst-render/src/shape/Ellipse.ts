import { IShapeType } from '../type'
import UiBase, { UiBaseData } from './UiBase'

const defaultData = {
  width: 200,
  height: 100
}

interface EllipseData extends UiBaseData {
  width?: number
  height?: number
}

export class Ellipse extends UiBase<EllipseData> {
  constructor(data: EllipseData) {
    super(data, defaultData)
  }

  type: IShapeType = 'Ellipse'

  declare data: EllipseData

  getBBox() {
    const data = this.data

    return { x: 0, y: 0, width: data.width, height: data.height }
  }
}

export default Ellipse
