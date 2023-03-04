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

  isGroup = false

  isMouseInner = false // 鼠标是否已经移入某个元素

  mouseDownOffset: { x: number; y: number } = { x: 0, y: 0 } // 鼠标按下的时候 鼠标位置相对于 图形的 x, y 的偏移量

  stage: Stage

  parent: Stage | Group = null

  findStage() {
    let stage = this.parent

    while (stage && stage.parent) {
      stage = stage.parent
    }

    return stage as unknown as Stage
  }

  data: {
    x?: number
    y?: number
    shadowColor?: string
    shadowBlur?: number
    shadowOffsetX?: number
    shadowOffsetY?: number
    [key: string]: any
  }

  animateState = {
    rafTimer: null,
    curr: 0
  }

  // 不规则图形 离屏canvas 对比颜色值
  isInner(offsetX, offsetY) {
    return false
  }

  // 获取组内的具体的某个图形 请查看Group类
  findActualShape(offsetX: number, offsetY: number) {
    return this
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
    evt.preventDefault() // 防止选中

    const { pageX, pageY } = evt

    const stage = this.findStage()

    const offsetX = pageX - stage.canvasElement.getBoundingClientRect().left
    const offsetY = pageY - stage.canvasElement.getBoundingClientRect().top

    if (this.data.draggable) {
      if (this.isGroup) {
        this.elements.forEach(item => {
          const x = offsetX - item.mouseDownOffset.x
          const y = offsetY - item.mouseDownOffset.y
          item.attr({ x, y })
        })
      } else {
        const x = offsetX - this.mouseDownOffset.x
        const y = offsetY - this.mouseDownOffset.y
        this.attr({ x, y })
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
  animate(prop, totalTime = 1000) {
    if (!this.findStage()) {
      console.warn('还没有 append 到 stage 上')
      return
    }

    cancelAnimationFrame(this.animateState.rafTimer)

    const { animateCallback } = prop
    console.log(prop)
    return new Promise(resolve => {
      Object.keys(prop).forEach(propKey => {
        // per 的计算要在递归外
        const per = calcPer(this.data[propKey], prop[propKey], totalTime)

        const exec = () => {
          // console.log('exec')

          const targetValue = calcTargetValue(this.data[propKey], prop[propKey], per)

          // 兼容数组的情况 (做法不太合理)
          if (this.data[propKey].toString() === prop[propKey].toString()) {
            console.log(`${propKey} 的动画结束`)
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

//
function calcPer(initVal, targetVal, totalTime) {
  if (Array.isArray(initVal)) {
    return initVal.map((item, index) => Math.abs(item - targetVal[index]) / (totalTime / (1000 / 60)))
  }

  return Math.abs(initVal - targetVal) / (totalTime / (1000 / 60))
}
