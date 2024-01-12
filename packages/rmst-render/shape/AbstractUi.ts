import { Stage } from '../_stage'
import { Animator, AnimateCartoonConfig } from '../animate'
import AbsEvent from '../AbsEvent'
import { schedulerTask } from 'rmst-render/_stage/scheduler'
import { ICursor, IShape, IShapeType } from 'rmst-render/type'

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

  // [key: string]: any
}

export const defaultAbsData: AbstractUiData = {
  lineWidth: 1,
  opacity: 1,
  shadowBlur: 0,
  shadowColor: 'orange',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  lineCap: 'butt',
  lineJoin: 'miter'
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
    const parentChildren = this.parent.children as IShape[]

    parentChildren.splice(parentChildren.indexOf(this), 1)
    parentChildren.push(this)
  }

  public attr<K extends keyof T>(key: K, value: T[K]): void
  public attr(data: Partial<T>): void

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

    this.stage.renderStage()
  }

  // 应用层方法; 1000次 -> 渲染 1 次
  public attrAsync(data: Partial<T>) {
    schedulerTask(() => {
      this.data = { ...this.data, ...data }
    })

    this.stage.renderStage()
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
