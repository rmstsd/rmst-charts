import { Stage } from '../_stage'
import { Animator, AnimateCartoonConfig } from '../animate'
import AbsEvent from '../AbsEvent'
import { schedulerTask } from '../_stage/scheduler'
import { ICursor, IShape, IShapeType } from '../type'
import { createRectPath2D, drawCircle, setCtxStyleProp } from '../renderer/canvas'
import { clipRect } from '../utils'

export interface AbstractUiData {
  name?: string
  x?: number
  y?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  lineWidth?: number
  opacity?: number
  zIndex?: number

  fillStyle?: CanvasFillStrokeStyles['fillStyle']
  strokeStyle?: CanvasFillStrokeStyles['strokeStyle']

  lineCap?: CanvasLineCap
  lineJoin?: CanvasLineJoin

  draggable?: boolean | 'horizontal' | 'vertical'
  cursor?: ICursor

  pointerEvents?: 'none' | 'all' // 是否响应鼠标事件 默认为 true

  extraData?: any
}

export interface BoundingRect {
  x: number
  y: number
  width: number
  height: number
}

export const defaultAbsData: AbstractUiData = {
  lineWidth: 1,
  opacity: 1,
  shadowBlur: 0,
  shadowColor: 'orange',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  lineCap: 'butt',
  lineJoin: 'miter',
  pointerEvents: 'all'
}

export const combineDefaultData = (shapeData, defaultShapeData) => {
  return { ...defaultAbsData, ...defaultShapeData, ...shapeData }
}

export abstract class AbstractUi<T = {}> extends AbsEvent {
  constructor(type: IShapeType, shapeData, defaultShapeData?) {
    super()

    this.type = type

    this.data = combineDefaultData(shapeData, defaultShapeData)
  }

  readonly type: IShapeType

  extraData

  declare data: AbstractUiData

  declare path2D: Path2D

  stage: Stage

  pinTop() {
    if (!this.parent) {
      console.warn('还没有被 append')
      return
    }
    const parentChildren = this.parent.children as IShape[]

    parentChildren.splice(parentChildren.indexOf(this), 1)
    parentChildren.push(this)
  }

  public attr(data: Partial<T>): void
  public attr<K extends keyof T>(key: K, value: T[K]): void

  public attr(...args) {
    switch (args.length) {
      case 1: {
        const [data] = args
        this.data = { ...this.data, ...data }
        break
      }
      case 2: {
        const [key, value] = args
        this.data[key] = value
        break
      }

      default:
        console.log('未实现的参数数量')
        break
    }

    this.stage?.renderStage()
  }

  // 应用层方法; 1000次 -> 渲染 1 次
  public attrAsync(data: Partial<T>) {
    schedulerTask(() => {
      this.data = { ...this.data, ...data }
    })

    this.stage?.renderStage()
  }

  attrDirty(data: Partial<T>) {
    const oldSb = this.getBoundingRect()

    this.data = { ...this.data, ...data }

    const nSb = this.getBoundingRect()

    const x = Math.min(oldSb.x, nSb.x)
    const y = Math.min(oldSb.y, nSb.y)
    const sb: BoundingRect = {
      x,
      y,
      width: Math.max(oldSb.x + oldSb.width, nSb.x + nSb.width) - x,
      height: Math.max(oldSb.y + oldSb.height, nSb.y + nSb.height) - y
    }

    this.stage.renderDirtyRectUi(sb)

    const { ctx } = this.stage

    ctx.clearRect(sb.x, sb.y, sb.width, sb.height)

    const overlapShapes = this.stage.children
      .filter(item => item.type === 'Circle')
      .filter(item => item !== this)
      .filter(item => isRectShapeCollision(sb, item.getBoundingRect()))

    clipRect(ctx, createRectPath2D(sb), () => {
      const neededUpdatedShapes = overlapShapes.concat(this)
      const correctSortedShapes = this.stage.children.filter(item => neededUpdatedShapes.includes(item))

      correctSortedShapes.forEach(item => {
        setCtxStyleProp(ctx, item)
        drawCircle(ctx, item as any)
      })
    })
  }

  getBoundingRect(): BoundingRect {
    return
  }

  remove() {
    const parentChildren = this.parent.children as IShape[]
    parentChildren.splice(parentChildren.indexOf(this), 1)

    this.stage.renderStage()
  }

  animators: Animator[] = []
  animateCartoon(targetProp: Partial<T>, cfg: AnimateCartoonConfig = {}) {
    if (!this.stage) {
      console.warn('图形', this, '还没有 append 到 stage 上')
      return
    }

    const startProp = Object.keys(targetProp).reduce((acc, k) => Object.assign(acc, { [k]: this.data[k] }), {})
    const animator = new Animator(startProp, targetProp, cfg)
    this.animators.push(animator)

    animator.start()
    animator.onUpdate = curProp => {
      this.attr({ ...this.data, ...curProp })
    }

    return new Promise<void>(resolve => {
      animator.onDone = () => {
        this.animators = this.animators.filter(item => item !== animator)
        resolve()
      }
    })
  }
}

export default AbstractUi

// 左上角 和 右下角 的坐标
function isRectCollision(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
  const overlapWidth = Math.min(ax2, bx2) - Math.max(ax1, bx1)
  const overlapHeight = Math.min(ay2, by2) - Math.max(ay1, by1)

  return overlapWidth > 0 && overlapHeight > 0
}

export function isRectShapeCollision(rect_1: BoundingRect, rect_2: BoundingRect) {
  return isRectCollision(
    rect_1.x,
    rect_1.y,
    rect_1.x + rect_1.width,
    rect_1.y + rect_1.height,

    rect_2.x,
    rect_2.y,
    rect_2.x + rect_2.width,
    rect_2.y + rect_2.height
  )
}
