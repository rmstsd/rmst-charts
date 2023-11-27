import Stage from '../Stage'

import { calcTargetValue } from 'rmst-render/animate'
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

  // 若为 undefined 则在绘制的时候暂时取 canvas 的宽高
  // 包围盒的实际盒子信息 仅在设置 clip 属性后执行动画才有用
  surroundBoxCoord: SurroundBoxCoord = { lt_x: 0, lt_y: 0, rb_x: 0, rb_y: 0 }

  clipWidth = 0
  clipHeight = 0

  declare data: AbstractUiData

  animateState = {
    startTime: null,
    rafTimer: null,
    curr: 0
  }

  getGroupSurroundBoxCoord(): SurroundBoxCoord {
    return
  }

  beforeDrawClip(ctx: CanvasRenderingContext2D) {
    if (!this.data.clip) {
      return
    }

    const surroundBoxCoord: SurroundBoxCoord = this.isGroup
      ? this.getGroupSurroundBoxCoord()
      : this.surroundBoxCoord

    ctx.save()
    ctx.beginPath()

    if (this.isText) {
      // 水印临时解决方案
      ctx.rect(
        surroundBoxCoord.lt_x,
        surroundBoxCoord.lt_y,
        surroundBoxCoord.rb_x - surroundBoxCoord.lt_x,
        surroundBoxCoord.rb_y - surroundBoxCoord.lt_y
      )
    } else {
      // charts 的图表动画 // 由于当初急于实现 组的动画效果, 此处是不合理的代码
      ctx.rect(surroundBoxCoord.lt_x, surroundBoxCoord.lt_y, this.clipWidth, this.clipHeight)
    }

    ctx.clip()
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

  animateCustomCartoon({
    startValue,
    endValue,
    totalTime = 500,
    frameCallback
  }: AnimateCustomCartoonParameter) {
    let currentValue = startValue

    const rafCallback: FrameRequestCallback = timestamp => {
      if (!this.animateState.startTime) {
        this.animateState.startTime = timestamp
      }

      const elapsedTime = timestamp - this.animateState.startTime
      const elapsedTimeRatio = Math.min(elapsedTime / totalTime, 1)
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
  animateCartoon(
    prop: {
      [key: string]: any
    },
    totalTime = 500,
    type?: 'top-bottom' | 'bottom-top' | 'left-right' | 'right-left',
    clipCallback?: (surroundBoxCoord: this['surroundBoxCoord'], clipWidth: number) => void
  ) {
    if (!this.findStage()) {
      console.warn('图形', this, '还没有 append 到 stage 上')
      return
    }

    if (this.data.clip) {
      if (type === 'left-right') {
        // 临时解决方案
        const _surroundBoxCoord = this.surroundBoxCoord || {
          lt_x: 0,
          lt_y: 0,
          rb_x: this.stage.canvasSize.width,
          rb_y: this.stage.canvasSize.height
        }

        const surroundBoxCoord = this.isGroup ? this.getGroupSurroundBoxCoord() : _surroundBoxCoord
        const surroundBoxWidth = surroundBoxCoord.rb_x - surroundBoxCoord.lt_x

        const startValue = this.clipWidth

        const exec = (timestamp: number) => {
          if (!this.animateState.startTime) {
            this.animateState.startTime = timestamp
          }

          const elapsedTime = timestamp - this.animateState.startTime
          const elapsedTimeRatio = Math.min(elapsedTime / totalTime, 1)

          const targetValue = calcTargetValue(startValue, surroundBoxWidth, elapsedTimeRatio)

          if (targetValue === surroundBoxWidth) {
            console.log('结束')
            return
          }

          this.clipWidth = targetValue as number
          this.clipHeight = surroundBoxCoord.rb_y - surroundBoxCoord.lt_y

          clipCallback?.(surroundBoxCoord, this.clipWidth)

          this.findStage().renderStage()

          this.animateState.rafTimer = requestAnimationFrame(exec)
        }

        requestAnimationFrame(exec)
      }

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
          const elapsedTimeRatio = Math.min(elapsedTime / totalTime, 1)

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
