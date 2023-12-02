import Stage from '../Stage'

import { Easing, calcTargetValue, easingFuncs } from 'rmst-render/animate'
import AbsEvent from 'rmst-render/AbsEvent'
import Line from './Line'

export interface AbstractUiData {
  x?: number
  y?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  lineWidth?: number

  fillStyle?: CanvasFillStrokeStyles['fillStyle']
  strokeStyle?: CanvasFillStrokeStyles['strokeStyle']

  lineCap?: CanvasLineCap
  lineJoin?: CanvasLineJoin

  clip?: boolean
  draggable?: boolean | 'horizontal' | 'vertical'
  cursor?: ICursor

  [key: string]: any
}

type AnimateCartoonParameter = {}

type AnimateCartoonConfig = {
  duration?: number // 毫秒
  delay?: number
  during?: (percent: number, newState: Record<string, string | number>) => void
  done?: Function
  aborted?: Function
  scope?: string
  force?: boolean
  additive?: boolean
  setToFinal?: boolean
  easing?: Easing
}

type AnimateCustomCartoonParameter = {
  startValue: number
  endValue: number
  totalTime?: number
  frameCallback: (currentValue: number, elapsedTimeRatio: number) => void
}

export const defaultAbsData: AbstractUiData = {
  lineWidth: 1,
  shadowBlur: 0,
  shadowColor: 'orange',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  lineCap: 'butt',
  lineJoin: 'miter'
}

export abstract class AbstractUi extends AbsEvent {
  type: 'Line' | 'Rect' | 'Circle' | 'Text' | 'Group' | 'BoxHidden'

  extraData

  declare data: AbstractUiData

  declare path2D: Path2D

  stage: Stage

  rafTimer: number

  combineDefaultData(shapeData, defaultShapeData) {
    return { ...defaultAbsData, ...defaultShapeData, ...shapeData }
  }

  pinTop() {
    const parentChildren = this.parent.children as IShape[]

    parentChildren.splice(parentChildren.indexOf(this), 1)
    parentChildren.push(this)
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY } = this.data

    ctx.shadowOffsetX = shadowOffsetX
    ctx.shadowOffsetY = shadowOffsetY
    ctx.shadowColor = shadowColor
    ctx.shadowBlur = shadowBlur
  }

  attr(data) {
    this.data = { ...this.data, ...data }

    this.findStage()?.renderStage()
  }

  remove() {
    this.stage.children = this.stage.children.filter(item => item !== this)
    this.stage.renderStage()
  }

  animateCustomCartoon(customCartoonParameter: AnimateCustomCartoonParameter) {
    const { startValue, endValue, totalTime = 1000, frameCallback } = customCartoonParameter

    let startTime: number

    const rafCallback: FrameRequestCallback = timestamp => {
      if (!startTime) {
        startTime = timestamp
      }

      const elapsedTime = timestamp - startTime
      let elapsedTimeRatio = Math.min(elapsedTime / totalTime, 1)

      elapsedTimeRatio = easingFuncs.cubicInOut(elapsedTimeRatio)

      const currentValue = calcTargetValue(startValue, endValue, elapsedTimeRatio) as number

      if (typeof frameCallback === 'function') {
        frameCallback(currentValue, elapsedTimeRatio)
      }

      if (elapsedTimeRatio === 1) {
        console.log(`animateCustomCartoon end`)

        return
      }
      this.rafTimer = requestAnimationFrame(rafCallback)
    }

    requestAnimationFrame(rafCallback)
  }

  animateCartoon(prop: { [key: string]: any }, cfg: AnimateCartoonConfig = {}) {
    if (!this.findStage()) {
      console.warn('图形', this, '还没有 append 到 stage 上')
      return
    }

    if (!prop) return

    const { duration = 1000, easing = 'linear', during } = cfg

    cancelAnimationFrame(this.rafTimer)

    const startValue = {}
    const keys = Object.keys(prop)
    keys.forEach(key => {
      startValue[key] = this.data[key]
    })

    let startTime: number

    return new Promise(resolve => {
      const update = (timestamp: number) => {
        if (!startTime) {
          startTime = timestamp
        }

        const elapsedTime = timestamp - startTime
        let elapsedTimeRatio = Math.min(elapsedTime / duration, 1)
        elapsedTimeRatio = easingFuncs[easing](elapsedTimeRatio)

        const newState = {}
        keys.forEach(propKey => {
          const targetValue = calcTargetValue(startValue[propKey], prop[propKey], elapsedTimeRatio)
          newState[propKey] = targetValue
        })

        this.attr({ ...this.data, ...newState })

        if (elapsedTimeRatio < 1) {
          this.rafTimer = requestAnimationFrame(update)
        }

        if (elapsedTimeRatio === 1) {
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
