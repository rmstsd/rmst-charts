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

type AnimateCartoonConfig = {
  duration?: number
  delay?: number
  during?: (percent: number, newState: Record<string, string | number>) => void
  done?: Function
  aborted?: Function
  scope?: string
  force?: boolean
  additive?: boolean
  setToFinal?: boolean
}

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
  animateCartoon(prop: { [key: string]: any }, cfg: AnimateCartoonConfig = {}) {
    if (!this.findStage()) {
      console.warn('图形', this, '还没有 append 到 stage 上')
      return
    }

    if (!prop) return

    const { duration = 1000, during } = cfg

    cancelAnimationFrame(this.animateState.rafTimer)

    const startValue = {}
    const keys = Object.keys(prop)
    keys.forEach(key => {
      startValue[key] = this.data[key]
    })

    return new Promise(resolve => {
      const update = (timestamp: number) => {
        if (!this.animateState.startTime) {
          this.animateState.startTime = timestamp
        }

        const elapsedTime = timestamp - this.animateState.startTime
        let elapsedTimeRatio = Math.min(elapsedTime / duration, 1)
        elapsedTimeRatio = easingFuncs.cubicInOut(elapsedTimeRatio)

        const newState = {}
        keys.forEach(propKey => {
          const targetValue = calcTargetValue(startValue[propKey], prop[propKey], elapsedTimeRatio)
          newState[propKey] = targetValue
        })

        this.attr({ ...this.data, ...newState })

        if (elapsedTimeRatio < 1) {
          this.animateState.rafTimer = requestAnimationFrame(update)
        }

        if (elapsedTimeRatio === 1) {
          console.log('ani end')

          this.animateState.startTime = null

          resolve(true)
        }

        if (during) {
          during(elapsedTimeRatio, newState)
        }
      }

      requestAnimationFrame(update)
    })
  }
}

export default AbstractUi
