// 等腰梯形, 上面是短边

import { IShapeType } from '../type'
import UiBase, { UiBaseData } from './UiBase'

export interface TrapezoidData extends UiBaseData {
  x?: number
  y?: number
  width?: number
  height?: number
  shortLength: number | string // 字符串代表相对于长边的百分比
}

export class Trapezoid extends UiBase<TrapezoidData> {
  constructor(data: TrapezoidData) {
    super('Trapezoid', data)
  }

  type: IShapeType = 'Trapezoid'
  declare data: TrapezoidData
}

export default Trapezoid
