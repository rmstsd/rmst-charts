import { calcColorRgba } from '../src-charts/utils/calcColorRgba'
import Path from './Path'

const defaultData = { startAngle: 0, endAngle: 360 } as Circle['data']
export default class Circle extends Path {
  constructor(data: Circle['data']) {
    super()

    this.data = { ...defaultData, ...data }
  }

  data: {
    x: number
    y: number
    radius: number
    bgColor: string
    startAngle?: number // 圆弧 饼图
    endAngle?: number // 圆弧 饼图
    [key: string]: any
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, radius, bgColor, startAngle, endAngle } = this.data

    // 传入角度 返回 弧度
    const radian = (angle: number) => (Math.PI * angle) / 180

    ctx.beginPath()
    ctx.arc(x, y, radius, radian(startAngle), radian(endAngle))
    ctx.lineTo(x, y)
    ctx.fillStyle = bgColor
    ctx.fill()
  }

  onChange = () => {}

  animateState = {
    rafTimer: null,
    curr: 0
  }

  calcAngle(x: number, y: number) {
    const sinOfAngleX = (y - this.data.y) / (x - this.data.x)
    const angle = Math.round((Math.atan(sinOfAngleX) * 180) / Math.PI)
    return angle
  }

  isInner(offsetX, offsetY) {
    const { x, y, radius, startAngle, endAngle } = this.data

    const distance = Math.sqrt((offsetX - x) ** 2 + (offsetY - y) ** 2)
    const isRadiusInner = distance <= radius

    if (!isRadiusInner) return

    const angle = this.calcAngle(offsetX, offsetY) - startAngle

    if (angle > 0 && angle < endAngle - startAngle) {
      return true
    }

    return false
  }

  animateExec(isReset?: boolean): void {
    cancelAnimationFrame(this.animateState.rafTimer)

    const targetRadius = isReset ? 10 : 20

    const per = 0.1
    let currRadius = this.data.radius

    const sizeAnimate = () => {
      if (isReset) currRadius -= per
      else currRadius += per
      this.data.radius = currRadius

      // 返回动画是否完成
      if (isReset) {
        if (currRadius <= targetRadius) return true
      } else {
        if (currRadius >= targetRadius) return true
      }
    }

    const colorAnimate = () => {
      const per = 2
      if (isReset) this.animateState.curr -= per
      else this.animateState.curr += per

      if (isReset) {
        if (this.animateState.curr < 0) this.animateState.curr = 0
      } else {
        if (this.animateState.curr > 255) this.animateState.curr = 255
      }

      const args = ['pink', 'red'] as const
      const { rgba } = calcColorRgba(this.animateState.curr, ...args)

      this.data.bgColor = rgba

      if (isReset) {
        if (this.animateState.curr <= 0) return true
      } else {
        if (this.animateState.curr >= 255) return true
      }
    }

    const drawAnimate = () => {
      // console.log('raf')
      const isAnimateFinish = colorAnimate()
      const isSizeFinish = sizeAnimate()

      this.onChange()

      if (isAnimateFinish && isSizeFinish) return

      this.animateState.rafTimer = requestAnimationFrame(drawAnimate)
    }

    drawAnimate()
  }
}
