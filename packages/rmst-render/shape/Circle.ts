import AbstractUi, { AbstractUiData } from './AbstractUi'

const defaultData = {
  lineWidth: 1,
  startAngle: 0,
  endAngle: 360,
  offsetAngle: 0
}

interface CircleData extends AbstractUiData {
  x: number
  y: number

  radius: number
  innerRadius?: number

  startAngle?: number // 圆弧 饼图 角度 60 180 360
  endAngle?: number // 圆弧 饼图
  offsetAngle?: number // 默认情况下, 圆弧的起始角度是 0, 但是如果需要从其他角度开始, 可以设置 offsetAngle
}

export class Circle extends AbstractUi<CircleData> {
  constructor(data: CircleData) {
    super('Circle', data, defaultData)
  }

  declare data: CircleData
}

export default Circle
