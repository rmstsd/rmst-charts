// 等腰梯形, 上面是短边

import AbstractUi, { AbstractUiData } from './AbstractUi'

export interface TrapezoidData extends AbstractUiData {
  x?: number
  y?: number
  width?: number
  height?: number
  shortLength: number | string // 字符串代表相对于长边的百分比
}

export class Trapezoid extends AbstractUi<TrapezoidData> {
  constructor(data: TrapezoidData) {
    super('Trapezoid', data)
  }

  declare data: TrapezoidData
}

export default Trapezoid
