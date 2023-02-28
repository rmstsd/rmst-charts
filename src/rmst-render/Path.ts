import colorRgba from 'color-rgba'
import Group from './Group'

import Stage from './Stage'

export class Path {
  onClick = () => {}
  onMove = () => {}
  onEnter = () => {}
  onLeave = () => {}
  onDown = () => {}
  onUp = () => {}

  isMouseInner = false // 鼠标是否已经移入某个元素

  isMouseDown = false // 鼠标是否处于按下状态
  mouseDownOffset: { x: number; y: number } = { x: 0, y: 0 } // 鼠标按下的时候 鼠标位置相对于 图形的 x, y 的偏移量

  stage: Stage

  parent: Group = null

  findStage() {
    let stage = this.parent

    while (stage && stage.parent) {
      stage = stage.parent
    }

    return stage as unknown as Stage
  }

  data: { x: number; y: number; [key: string]: any }

  animateState = {
    rafTimer: null,
    curr: 0
  }

  // 不规则图形 离屏canvas 对比颜色值
  isInner(offsetX, offsetY) {
    return false
  }

  draw(ctx: CanvasRenderingContext2D) {}

  attr(data) {
    this.data = { ...this.data, ...data }

    this.findStage()?.renderStage()
  }

  handleClick(offsetX: number, offsetY: number) {
    const isInner = this.isInner(offsetX, offsetY)
    if (isInner) this.onClick()
  }

  handleMouseDown(offsetX: number, offsetY: number) {
    const isInner = this.isInner(offsetX, offsetY)
    if (isInner) {
      this.onDown()
      this.isMouseDown = true

      this.mouseDownOffset.x = offsetX - this.data.x
      this.mouseDownOffset.y = offsetY - this.data.y
    }
  }

  handleMouseUp(offsetX: number, offsetY: number) {
    const isInner = this.isInner(offsetX, offsetY)

    if (isInner) {
      this.onUp()
      this.isMouseDown = false
    }
  }

  handleMove(offsetX: number, offsetY: number) {
    const isInner = this.isInner(offsetX, offsetY)

    if (this.isMouseDown && this.data.draggable) {
      const x = offsetX - this.mouseDownOffset.x
      const y = offsetY - this.mouseDownOffset.y

      this.attr({ x, y })
    }

    if (isInner) {
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

  remove() {
    this.stage.elements = this.stage.elements.filter(item => item !== this)
    this.stage.renderStage()
  }

  animate(prop) {
    if (!this.findStage()) {
      console.warn('还没有 append 到 stage 上')
      return
    }

    cancelAnimationFrame(this.animateState.rafTimer)

    const { animateCallback } = prop
    const [propKey] = Object.keys(prop)

    const totalTime = 1000 // 毫秒

    return new Promise(resolve => {
      const per = Math.abs(this.data[propKey] - prop[propKey]) / (totalTime / (1000 / 60))

      const exec = () => {
        const targetValue = calcCount(this.data[propKey], prop[propKey], per)

        if (this.data[propKey] === prop[propKey]) {
          resolve(true)
          return
        }

        if (typeof animateCallback === 'function') {
          animateCallback({ [propKey]: targetValue })
        }
        this.attr({ ...this.data, [propKey]: targetValue })

        this.animateState.rafTimer = requestAnimationFrame(exec)
      }

      exec()
    })
  }
}

export default Path

const calcCount = (initCount: number, targetCount: number, per: number) => {
  if (initCount < targetCount) {
    const currCount = initCount + per

    return currCount > targetCount ? targetCount : currCount
  }

  if (initCount > targetCount) {
    const currCount = initCount - per

    return currCount < targetCount ? targetCount : currCount
  }

  return targetCount
}
