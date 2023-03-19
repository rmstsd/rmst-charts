import { calcColorRgba } from './calcColorRgba'

export default class Circle {
  constructor(parent: HTMLCanvasElement, circleData: Circle['circleData']) {
    this.canvasElement = parent
    this.ctx = parent.getContext('2d')
    this.circleData = circleData
  }

  canvasElement: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  circleData = { x: 100, y: 100, radius: 10, index: 0, bgColor: '' }

  onChange = () => {}

  onClick = () => {}

  animateState = {
    rafTimer: null,
    curr: 0
  }

  isMouseInner = false

  isInnerCircle(x: number, y: number) {
    const distance = Math.sqrt((x - this.circleData.x) ** 2 + (y - this.circleData.y) ** 2)

    return distance <= this.circleData.radius
  }

  animateExec(): void {
    cancelAnimationFrame(this.animateState.rafTimer)

    const targetRadius = 20

    const per = 0.4
    let currRadius = this.circleData.radius

    const sizeAnimate = () => {
      currRadius += per
      this.circleData.radius = currRadius

      // 返回动画是否完成

      if (currRadius >= targetRadius) return true
    }

    const colorAnimate = () => {
      const per = 2
      this.animateState.curr += per

      if (this.animateState.curr > 255) this.animateState.curr = 255

      const args = ['pink', 'red'] as const
      const { rgba } = calcColorRgba(this.animateState.curr, ...args)

      this.circleData.bgColor = rgba

      if (this.animateState.curr >= 255) return true
    }

    const drawAnimate = () => {
      console.log('raf')
      // const isAnimateFinish = colorAnimate()
      const isSizeFinish = sizeAnimate()

      this.onChange()

      if (isSizeFinish) return

      this.animateState.rafTimer = requestAnimationFrame(drawAnimate)
    }

    drawAnimate()
  }

  drawArc() {
    const { x, y, radius, index, bgColor } = this.circleData
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fillStyle = bgColor
    this.ctx.fill()

    this.ctx.fillStyle = '#000'
    this.ctx.fillText(String(index), x, y)
  }

  handleMove(offsetX: number, offsetY: number) {
    // console.log('move')

    const isInSingleCircle = this.isInnerCircle(offsetX, offsetY)

    if (isInSingleCircle) {
      if (!this.isMouseInner) {
        this.isMouseInner = true

        this.handleEnter()
      }
    } else {
      if (this.isMouseInner) {
        this.isMouseInner = false

        this.handleLeave()
      }
    }
  }

  handleEnter() {
    // console.log('enter')
    this.canvasElement.style.cursor = 'pointer'
    this.animateExec()
  }

  handleLeave() {
    // console.log('leave')
    this.canvasElement.style.cursor = '' // 这一行为应该在 layer 设置
    this.animateExec(true)
  }
}
