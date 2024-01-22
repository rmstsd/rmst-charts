import { createLinePath2D } from '../utils'
import AbstractUi, { AbstractUiData } from './AbstractUi'

const defaultData: LineData = {
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  percent: 1
}

interface LineData extends AbstractUiData {
  path2D?: Path2D
  points?: number[]
  closed?: boolean
  smooth?: boolean
  percent?: number // 0 - 1
}

export class Line extends AbstractUi<LineData> {
  constructor(data: LineData) {
    super('Line', data, defaultData)

    this.path2D = data.path2D ? data.path2D : createLinePath2D(this.data)
  }

  declare data: LineData
}

export default Line
