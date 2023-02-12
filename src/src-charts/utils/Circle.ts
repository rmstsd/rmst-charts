import { calcColorRgba } from './calcColorRgba'

export default class Circle {
  constructor(parent: HTMLCanvasElement, circleData: Circle['circleData']) {
    this.canvasElement = parent
    this.ctx = parent.getContext('2d')
    this.circleData = circleData
  }

  canvasElement: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  onChange = () => {}

  onClick = () => {}

  circleData = { x: 100, y: 100, radius: 10, index: 0, bgColor: '' }

  animateState = {
    rafTimer: null,
    curr: 0
  }

  isMouseInner = false

  isInnerCircle(x, y) {
    const distance = Math.sqrt((x - this.circleData.x) ** 2 + (y - this.circleData.y) ** 2)

    return distance <= this.circleData.radius
  }

  animateExec(isReset?: boolean): void {
    cancelAnimationFrame(this.animateState.rafTimer)

    const targetRadius = isReset ? 10 : 20

    const per = 0.1
    let currRadius = this.circleData.radius

    const sizeAnimate = () => {
      if (isReset) currRadius -= per
      else currRadius += per
      this.circleData.radius = currRadius

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

      this.circleData.bgColor = rgba

      if (isReset) {
        if (this.animateState.curr <= 0) return true
      } else {
        if (this.animateState.curr >= 255) return true
      }
    }

    const drawAnimate = () => {
      const isAnimateFinish = colorAnimate()
      const isSizeFinish = sizeAnimate()

      this.onChange()

      if (isAnimateFinish && isSizeFinish) return

      this.animateState.rafTimer = requestAnimationFrame(drawAnimate)
    }

    drawAnimate()
  }

  drawArc(circleData: Circle['circleData']) {
    const { x, y, radius, index, bgColor } = circleData
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fillStyle = bgColor
    this.ctx.fill()

    this.ctx.fillStyle = '#000'
    this.ctx.fillText(String(index), circleData.x, circleData.y)
  }

  handleMove(offsetX, offsetY) {
    const isInSingleCircle = this.isInnerCircle(offsetX, offsetY)

    if (isInSingleCircle) {
      if (!this.isMouseInner) {
        this.isMouseInner = true

        this.handleEnter()
      }

      console.log('move')
    } else {
      if (this.isMouseInner) {
        this.isMouseInner = false

        this.handleLeave()
      }
    }
  }

  handleEnter() {
    console.log('enter')
    this.canvasElement.style.cursor = 'pointer'
    this.animateExec()
  }

  handleLeave() {
    console.log('leave')
    this.canvasElement.style.cursor = ''
    this.animateExec(true)
  }
}
