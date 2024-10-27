import { Stage } from '../_stage'
import { Animator, AnimateCartoonConfig } from '../animate'
import AbsEvent, { EventOpt } from '../AbsEvent'
import { schedulerTask } from '../_stage/scheduler'
import { ICursor, IShape, IShapeType } from '../type'
import { attrDirty } from '../_stage/controller/DirtyRect'

export interface AbstractUiData extends EventOpt {
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

  lineDash?: number[]

  draggable?: boolean | 'horizontal' | 'vertical'
  cursor?: ICursor

  // transform?: number[] // [水平缩放, 垂直倾斜, 水平倾斜, 垂直缩放, 水平移动, 垂直移动]

  pointerEvents?: 'none' | 'all' // 是否响应鼠标事件 默认为 true

  scale?: number[] // [x, y]
  rotate?: number // 角度

  extraData?: any // 需要优化
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
  shadowColor: 'transparent',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  lineCap: 'butt',
  lineJoin: 'miter',
  lineDash: [],
  pointerEvents: 'all',
  zIndex: 0
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

    this.stage?.render()
  }

  // 应用层方法; 1000次 -> 渲染 1 次
  public attrAsync(data: Partial<T>) {
    schedulerTask(() => {
      this.data = { ...this.data, ...data }
    })

    this.stage?.render()
  }

  // 未完全实现
  attrDirty(data: Partial<T>) {
    attrDirty(this, data)
  }

  getBoundingRect(): BoundingRect {
    return
  }

  remove() {
    const parentChildren = this.parent.children as IShape[]
    parentChildren.splice(parentChildren.indexOf(this), 1)

    this.stage.render()
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

  dispose() {
    this.animators.forEach(item => {
      item.stop()
    })
  }
}

export default AbstractUi
