import colorRgba from 'color-rgba'
import Group from '../Group'

import Stage, { dpr, IExtraData } from '../Stage'

type SurroundBoxCoord = { lt_x: number; lt_y: number; rb_x: number; rb_y: number }

export abstract class Path {
  constructor() {
    this.extraData = Stage.createExtraData()
  }

  onClick = () => {}
  onMove = () => {}
  onEnter = () => {}
  onLeave = () => {}
  onDown = () => {}
  onUp = () => {}
  onDragMove = () => {}

  isGroup = false

  isLine = false

  isMouseInner = false // 鼠标是否已经移入某个元素

  mouseDownOffset = { x: 0, y: 0 } // 鼠标按下的时候 鼠标位置相对于 图形的 x, y 的偏移量

  extraData: IExtraData

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

  data: {
    x?: number
    y?: number
    shadowColor?: string
    shadowBlur?: number
    shadowOffsetX?: number
    shadowOffsetY?: number
    clip?: boolean
    [key: string]: any
  }

  animateState = {
    startValue: {},
    startTime: null,
    rafTimer: null,
    curr: 0
  }

  isInner(offsetX, offsetY) {
    const stage = this.findStage()

    if (!stage) return

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

  // 通过唯一颜色值拾取图形
  setFillStyle(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.extraData.rgb
    ctx.strokeStyle = this.extraData.rgb
  }

  // 获取组内的具体的某个图形 查看Group类
  findActualShape(offsetX: number, offsetY: number) {
    return this
  }

  beforeDrawClip(ctx: CanvasRenderingContext2D) {
    if (!this.data.clip) return

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
      // charts 的图标动画 // 由于当初急于实现组的动画效果, 此处是不合理的代码
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
    if (isInner) this.onClick()

    return isInner
  }

  documentMousemove(evt: MouseEvent) {
    evt.preventDefault() // 防止选中文本

    const { pageX, pageY } = evt

    const stage = this.findStage()

    const offsetX = pageX - stage.canvasElement.getBoundingClientRect().left
    const offsetY = pageY - stage.canvasElement.getBoundingClientRect().top

    if (this.data.draggable) {
      if (this.isGroup) {
        ;(this as unknown as Group).elements.forEach(item => {
          const x = offsetX - item.mouseDownOffset.x
          const y = offsetY - item.mouseDownOffset.y
          item.attr({ x, y })
        })
        this.onDragMove()
      } else {
        const x = offsetX - this.mouseDownOffset.x
        const y = offsetY - this.mouseDownOffset.y
        this.attr({ x, y })
        this.onDragMove()
      }
    }
  }

  handleMouseDown(offsetX: number, offsetY: number) {
    const isInner = this.isInner(offsetX, offsetY)
    if (isInner) {
      this.onDown()

      if (this.data.draggable) {
        document.onmousemove = this.documentMousemove.bind(this)
        document.onmouseup = () => {
          // 拖拽结束
          document.onmousemove = null
        }

        if (this.isGroup) {
          this.elements.forEach(item => {
            item.mouseDownOffset.x = offsetX - item.data.x
            item.mouseDownOffset.y = offsetY - item.data.y
          })
        } else {
          this.mouseDownOffset.x = offsetX - this.data.x
          this.mouseDownOffset.y = offsetY - this.data.y
        }
      }
    }

    return isInner
  }

  handleMouseUp(offsetX: number, offsetY: number) {
    const isInner = this.isInner(offsetX, offsetY)

    if (isInner) {
      this.onUp()
    }

    return isInner
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

        this.animateState.startValue = this.clipWidth
        const surroundBoxWidth = surroundBoxCoord.rb_x - surroundBoxCoord.lt_x

        const exec = (timestamp: number) => {
          if (!this.animateState.startTime) {
            this.animateState.startTime = timestamp
          }

          const elapsedTime = timestamp - this.animateState.startTime
          const elapsedTimeRatio = Math.min(elapsedTime / totalTime, 1)

          const targetValue = calcTargetValue_2(
            this.animateState.startValue,
            surroundBoxWidth,
            elapsedTimeRatio
          )

          if (targetValue === surroundBoxWidth) {
            console.log('结束')
            return
          }

          this.clipWidth = targetValue as number
          this.clipHeight = surroundBoxCoord.rb_y - surroundBoxCoord.lt_y

          clipCallback?.(surroundBoxCoord, this.clipWidth)

          this.parent.renderStage()

          this.animateState.rafTimer = requestAnimationFrame(exec)
        }

        requestAnimationFrame(exec)
      }

      return
    }

    if (!prop) return

    cancelAnimationFrame(this.animateState.rafTimer)

    const { animateCallback } = prop

    const keys = Object.keys(prop).filter(item => item !== 'animateCallback')

    keys.forEach(key => {
      this.animateState.startValue[key] = this.data[key]
    })

    return new Promise(resolve => {
      keys.forEach(propKey => {
        // per 的计算要在递归外
        // const per = calcPer(this.data[propKey], prop[propKey], totalTime)

        const exec = (timestamp: number) => {
          if (!this.animateState.startTime) {
            this.animateState.startTime = timestamp
          }

          const elapsedTime = timestamp - this.animateState.startTime

          const currDataValue = this.data[propKey]
          if (currDataValue === undefined) return

          const elapsedTimeRatio = Math.min(elapsedTime / totalTime, 1)

          const targetValue = calcTargetValue_2(
            this.animateState.startValue[propKey],
            prop[propKey],
            elapsedTimeRatio
          )

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

export default Path

// initCount 和 targetCount 目前只存在都为 number 或者 都为 number[] 的情况; 暂时不考虑字符串的情况(颜色)
const calcTargetValue = (
  initCount: number | number[],
  targetCount: number | number[],
  per: number | number[]
) => {
  if (typeof initCount === 'number' && typeof targetCount === 'number' && typeof per === 'number') {
    return calcValue(initCount, targetCount, per)
  } else if (Array.isArray(initCount) && Array.isArray(targetCount)) {
    return initCount.map((item, index) => calcValue(item, targetCount[index], per[index]))
  }

  function calcValue(initVal: number, targetVal: number, per: number) {
    if (initVal < targetVal) {
      const currCount = initVal + per
      return currCount > targetVal ? targetVal : currCount
    }

    if (initVal > targetVal) {
      const currCount = initVal - per

      return currCount < targetVal ? targetVal : currCount
    }

    return targetVal
  }
}

const calcTargetValue_2 = (
  startCount: number | number[],
  targetCount: number | number[],
  elapsedTimeRatio: number
) => {
  if (typeof startCount === 'number' && typeof targetCount === 'number') {
    return calcValue(startCount, targetCount)
  } else if (Array.isArray(startCount) && Array.isArray(targetCount)) {
    return startCount.map((item, index) => calcValue(item, targetCount[index]))
  }

  function calcValue(startVal: number, targetVal: number) {
    const totalChangedVal = Math.abs(startVal - targetVal)
    const per = elapsedTimeRatio * totalChangedVal

    if (startVal < targetVal) {
      const currCount = startVal + per
      return currCount > targetVal ? targetVal : currCount
    }

    if (startVal > targetVal) {
      const currCount = startVal - per

      return currCount < targetVal ? targetVal : currCount
    }

    return targetVal
  }
}

//
function calcPer(initVal, targetVal, totalTime) {
  if (Array.isArray(initVal)) {
    return initVal.map((item, index) => Math.abs(item - targetVal[index]) / (totalTime / (1000 / 60)))
  }

  return Math.abs(initVal - targetVal) / (totalTime / (1000 / 60))
}
