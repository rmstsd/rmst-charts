import colorRgba from 'color-rgba'
import Group from './Group'

import Stage from './Stage'

export class Path {
  onClick = () => {}
  onMove = () => {}
  onEnter = () => {}
  onLeave = () => {}

  isMouseInner = false

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

  handleMove(offsetX: number, offsetY: number) {
    const isInner = this.isInner(offsetX, offsetY)

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
