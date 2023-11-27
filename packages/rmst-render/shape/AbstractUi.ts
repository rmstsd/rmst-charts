import Stage from '../Stage'

import { calcTargetValue, easingFuncs } from 'rmst-render/animate'
import AbsEvent from 'rmst-render/AbsEvent'

export interface AbstractUiData {
  x?: number
  y?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  clip?: boolean
  draggable?: boolean
  draggableControl?: DraggableControl
  cursor?: ICursor
  [key: string]: any
}

type AnimateCartoonParameter = {}

type AnimateCustomCartoonParameter = {
  startValue: number
  endValue: number
  totalTime?: number
  frameCallback: (currentValue: number, elapsedTimeRatio: number) => void
}

export abstract class AbstractUi extends AbsEvent {
  isGroup = false
  isLine = false
  isText = false

  elements = []

  extraData

  declare path2D: Path2D

  stage: Stage

  clipWidth = 0
  clipHeight = 0

  declare data: AbstractUiData

  animateState = {
    startTime: null,
    rafTimer: null,
    curr: 0
  }

  draw(ctx: CanvasRenderingContext2D) {}

  setShadow(ctx: CanvasRenderingContext2D, prop) {
    ctx.shadowColor = prop.shadowColor || 'transparent'
    ctx.shadowBlur = prop.shadowBlur || 0
    ctx.shadowOffsetX = prop.shadowOffsetX || 0
    ctx.shadowOffsetY = prop.shadowOffsetY || 0
  }

  attr(data) {
    this.data = { ...this.data, ...data }

    this.findStage()?.renderStage()
  }

  remove() {
    this.stage.elements = this.stage.elements.filter(item => item !== this)
    this.stage.renderStage()
  }

  animateCustomCartoon(customCartoonParameter: AnimateCustomCartoonParameter) {
    const { startValue, endValue, totalTime = 1000, frameCallback } = customCartoonParameter

    let currentValue = startValue

    const rafCallback: FrameRequestCallback = timestamp => {
      if (!this.animateState.startTime) {
        this.animateState.startTime = timestamp
      }

      const elapsedTime = timestamp - this.animateState.startTime
      let elapsedTimeRatio = Math.min(elapsedTime / totalTime, 1)

      elapsedTimeRatio = easingFuncs.cubicInOut(elapsedTimeRatio)

      currentValue = calcTargetValue(startValue, endValue, elapsedTimeRatio) as number

      if (typeof frameCallback === 'function') {
        frameCallback(currentValue, elapsedTimeRatio)
      }

      if (elapsedTimeRatio === 1) {
        console.log(`动画结束`)

        this.animateState.startTime = null
        return
      }
      this.animateState.rafTimer = requestAnimationFrame(rafCallback)
    }

    requestAnimationFrame(rafCallback)
  }

  // totalTime 毫秒
  animateCartoon(prop: { [key: string]: any }, totalTime = 1000) {
    if (!this.findStage()) {
      console.warn('图形', this, '还没有 append 到 stage 上')
      return
    }

    if (!prop) return

    cancelAnimationFrame(this.animateState.rafTimer)

    const startValue = {}
    const keys = Object.keys(prop)
    keys.forEach(key => {
      startValue[key] = this.data[key]
    })

    return new Promise(resolve => {
      keys.forEach(propKey => {
        const exec = (timestamp: number) => {
          if (!this.animateState.startTime) {
            this.animateState.startTime = timestamp
          }

          const currDataValue = this.data[propKey]
          if (currDataValue === undefined) {
            return
          }

          const elapsedTime = timestamp - this.animateState.startTime
          let elapsedTimeRatio = Math.min(elapsedTime / totalTime, 1)
          elapsedTimeRatio = easingFuncs.cubicInOut(elapsedTimeRatio)

          const targetValue = calcTargetValue(startValue[propKey], prop[propKey], elapsedTimeRatio)

          // 兼容数组的情况 (做法不太合理)
          if (currDataValue.toString() === prop[propKey].toString()) {
            // console.log(`${propKey} 的动画结束`)

            this.animateState.startTime = null

            resolve(true)
            return
          }

          this.attr({ ...this.data, [propKey]: targetValue })

          this.animateState.rafTimer = requestAnimationFrame(exec)
        }

        requestAnimationFrame(exec)
      })
    })
  }
}

export default AbstractUi
