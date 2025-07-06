import { IShapeType } from '../type'
import { createLinePath2D } from '../utils'
import UiBase, { UiBaseData } from './UiBase'

const defaultData: LineData = {
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  percent: 1
}

interface LineData extends UiBaseData {
  path2D?: Path2D
  points?: number[]
  closed?: boolean
  smooth?: boolean
  percent?: number // 0 - 1
}

export class Line extends UiBase<LineData> {
  constructor(data: LineData) {
    super(data, defaultData)

    this.path2D = data.path2D ? data.path2D : createLinePath2D(this.data)
  }

  type: IShapeType = 'Line'

  declare data: LineData
}

export default Line
