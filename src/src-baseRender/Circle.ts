import { calcColorRgba } from '../src-charts/utils/calcColorRgba'

export default class Circle {
  constructor(data: Circle['data']) {
    this.data = data
  }

  data: { x: number; y: number; radius: number; bgColor: string; [key: string]: any }

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, radius, bgColor } = this.data
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = bgColor
    ctx.fill()
  }

  onChange = () => {}
  onClick = () => {}
  onMove = () => {}
  onEnter = () => {}
  onLeave = () => {}

  animateState = {
    rafTimer: null,
    curr: 0
  }

  isMouseInner = false

  isInnerCircle(x: number, y: number) {
    const distance = Math.sqrt((x - this.data.x) ** 2 + (y - this.data.y) ** 2)

    return distance <= this.data.radius
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

  handleClick(offsetX: number, offsetY: number) {
    const isInSingleCircle = this.isInnerCircle(offsetX, offsetY)
    if (isInSingleCircle) this.onClick()
  }

  handleMove(offsetX: number, offsetY: number) {
    const isInSingleCircle = this.isInnerCircle(offsetX, offsetY)

    if (isInSingleCircle) {
      if (!this.isMouseInner) {
        this.isMouseInner = true

        this.onEnter()
      }

      this.onMove()
    } else {
      if (this.isMouseInner) {
        this.isMouseInner = false

        this.onLeave()
      }
    }
  }
}
