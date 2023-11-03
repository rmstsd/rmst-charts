import Group from '../Group'

import Stage, { dpr } from '../Stage'
import { pointToFlatArray } from 'rmst-charts/utils/utils'
import { convertToNormalPoints } from 'rmst-render/utils'
import { calcTargetValue } from 'rmst-render/animate'

const debugOption: DebugOption = {
  // disabledCanvasHandleMouseMove: true,
  // disabledCanvasHandleMouseDown: true,
  // disabledCanvasHandleMouseUp: true
}

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
  [key: string]: any
}

type AnimateCustomCartoonParameter = {
  startValue: number
  endValue: number
  totalTime?: number
  frameCallback: (currentValue: number, elapsedTimeRatio: number) => void
}

let isEnter = false

export abstract class AbstractUi {
  onClick = () => {}
  onMove = () => {}
  onEnter = () => {}
  onLeave = () => {}
  onDown = () => {}
  onUp = () => {}
  onDragMove = () => {}

  isGroup = false

  isLine = false

  isText = false

  elements = []

  isMouseInner = false // 鼠标是否已经移入某个元素

  mouseDownOffset = { x: 0, y: 0 } // 鼠标按下的时候 鼠标位置相对于 图形的 x, y 的偏移量

  mouseDownOffsetPoints: { x: number; y: number }[] = []

  extraData

  path2D: Path2D

  stage: Stage

  parent: Stage | Group = null

  findStage() {
    let stage = this.parent

    while (stage && stage.parent) {
      stage = stage.parent
    }

    return stage as unknown as Stage
  }

  // 若为 undefined 则在绘制的时候暂时取 canvas 的宽高
  // 包围盒的实际盒子信息 仅在设置 clip 属性后执行动画才有用
  surroundBoxCoord: SurroundBoxCoord = { lt_x: 0, lt_y: 0, rb_x: 0, rb_y: 0 }

  clipWidth = 0
  clipHeight = 0

  data: AbstractUiData

  animateState = {
    startTime: null,
    rafTimer: null,
    curr: 0
  }

  getGroupSurroundBoxCoord(): SurroundBoxCoord {
    return
  }

  isInner(offsetX: number, offsetY: number) {
    const stage = this.findStage()

    if (!stage) return

    stage.ctx.lineWidth = this.data.lineWidth + 5
    const isInPath = () => {
      return stage.ctx.isPointInPath(this.path2D, offsetX * dpr, offsetY * dpr)
    }
    const isInStroke = () => {
      return stage.ctx.isPointInStroke(this.path2D, offsetX * dpr, offsetY * dpr)
    }
    const isInSurroundBox = () => {
      const surroundBoxCoord = this.surroundBoxCoord
        ? this.surroundBoxCoord
        : { lt_x: 0, lt_y: 0, rb_x: 0, rb_y: 0 }

      return (
        offsetX > surroundBoxCoord.lt_x &&
        offsetX < surroundBoxCoord.lt_x + this.clipWidth &&
        offsetY > surroundBoxCoord.lt_y &&
        offsetY < surroundBoxCoord.lt_y + this.clipHeight
      )
    }

    if (this.isLine && !this.data.closed) {
      return isInStroke()
    }

    if (this.data.clip) {
      return isInSurroundBox() && (isInPath() || isInStroke())
    }

    return isInPath() || isInStroke()
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

  handleClick(offsetX: number, offsetY: number) {
    const isInner = this.isInner(offsetX, offsetY)
    if (isInner) {
      this.onClick()
    }

    return isInner
  }

  documentMousemove(evt: MouseEvent) {
    evt.preventDefault() // 防止选中文本

    if (this.data.draggable) {
      const { pageX, pageY } = evt

      const stage = this.findStage()
      const canvasRect = stage.canvasElement.getBoundingClientRect()

      const offsetX = pageX - canvasRect.left
      const offsetY = pageY - canvasRect.top

      this.dndAttr(offsetX, offsetY)

      this.onDragMove()
    }
  }

  handleMouseDown(offsetX: number, offsetY: number) {
    if (debugOption.disabledCanvasHandleMouseDown) {
      return
    }
    const isInner = this.isInner(offsetX, offsetY)
    if (isInner) {
      this.onDown()

      if (this.data.draggable) {
        this.dndRecordMouseDownOffset(offsetX, offsetY)

        document.onmousemove = this.documentMousemove.bind(this)
        document.onmouseup = () => {
          document.onmousemove = null
        }
      }
    }

    return isInner
  }

  handleMouseUp(offsetX: number, offsetY: number) {
    if (debugOption.disabledCanvasHandleMouseUp) {
      return
    }
    const isInner = this.isInner(offsetX, offsetY)

    if (isInner) {
      this.onUp()
    }

    return isInner
  }

  handleMouseMove(offsetX: number, offsetY: number) {
    if (debugOption.disabledCanvasHandleMouseMove) {
      return
    }

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

  dndAttr(offsetX: number, offsetY: number) {
    if (this.isGroup) {
      this.elements.forEach(item => {
        item.dndAttr(offsetX, offsetY)
      })
    } else {
      const x = offsetX - this.mouseDownOffset.x
      const y = offsetY - this.mouseDownOffset.y

      const pos = this.data.draggableControl
        ? this.data.draggableControl({ mouseCoord: { offsetX, offsetY }, shapeCoord: { x, y } })
        : { x, y }

      if (this.isLine) {
        const c = convertToNormalPoints(this.data.points)
        c.forEach((item, index) => {
          const o = this.mouseDownOffsetPoints[index]
          item.x = offsetX - o.x
          item.y = offsetY - o.y
        })
        this.attr({ points: pointToFlatArray(c) })
      } else {
        this.attr({ x: pos.x, y: pos.y })
      }
    }
  }

  dndRecordMouseDownOffset(offsetX: number, offsetY: number) {
    if (this.isGroup) {
      this.elements.forEach(item => {
        item.dndRecordMouseDownOffset(offsetX, offsetY)
      })
    } else {
      if (this.isLine) {
        this.mouseDownOffsetPoints = convertToNormalPoints(this.data.points).map(item => ({
          x: offsetX - item.x,
          y: offsetY - item.y
        }))
      } else {
        this.mouseDownOffset.x = offsetX - this.data.x
        this.mouseDownOffset.y = offsetY - this.data.y
      }
    }
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
      animateCallback?: (_prop: Record<string, any>, elapsedTimeRatio: number) => void
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

    const { animateCallback } = prop

    const startValue = {}
    const keys = Object.keys(prop).filter(item => item !== 'animateCallback')
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

          if (typeof animateCallback === 'function') {
            animateCallback({ [propKey]: targetValue }, elapsedTimeRatio)
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
