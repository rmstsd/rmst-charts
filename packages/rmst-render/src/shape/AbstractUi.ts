import { Stage } from '../_stage'
import { Animator, AnimateCartoonConfig } from '../animate'
import AbsEvent, { EventOpt } from '../AbsEvent'
import { schedulerTask } from '../_stage/scheduler'
import { ICursor, IShape, IShapeType } from '../type'
import { attrDirty } from '../_stage/controller/DirtyRect'
import { compose, identity, Matrix, translate } from 'transformation-matrix'
import { normalizedAttrs } from '../utils/attr'

export interface UiData extends EventOpt {
  id?: string
  name?: string
  x?: number
  y?: number
  width?: number
  height?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  lineWidth?: number
  opacity?: number
  zIndex?: number

  d?: string

  fillStyle?: CanvasFillStrokeStyles['fillStyle']
  strokeStyle?: CanvasFillStrokeStyles['strokeStyle']

  lineCap?: CanvasLineCap
  lineJoin?: CanvasLineJoin

  lineDash?: number[]

  draggable?: boolean | 'horizontal' | 'vertical'
  cursor?: ICursor

  visible?: boolean

  pointerEvents?: 'none' | 'all' // 是否响应鼠标事件 默认为 true

  rotate?: number // 角度

  extraData?: any

  mt?: Matrix
}

export interface IRect {
  x: number
  y: number
  width: number
  height: number
}

export const getDefaultAbsData = (): UiData => ({
  x: 0,
  y: 0,
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
  zIndex: 0,
  visible: true,
  mt: identity()
})
export const combineDefaultData = (shapeData, defaultShapeData) => {
  return { ...getDefaultAbsData(), ...defaultShapeData, ...shapeData }
}

export abstract class AbstractUi<T = {}> extends AbsEvent {
  constructor(type: IShapeType, shapeData, defaultShapeData?) {
    super()

    this.type = type

    this.data = combineDefaultData(shapeData, defaultShapeData)

    this.data.mt = compose(translate(this.data.x ?? 0, this.data.y ?? 0), this.data.mt)
  }

  readonly type: IShapeType

  extraData

  declare data: UiData

  declare path2D: Path2D

  stage: Stage

  clone() {
    const Class = this.constructor as new (...args) => AbstractUi<T>
    return new Class(structuredClone(this.data))
  }

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
    const attrs = normalizedAttrs(args)
    this.data = { ...this.data, ...attrs }

    if (Reflect.has(attrs, 'x')) {
      this.data.mt.e = attrs.x
    }
    if (Reflect.has(attrs, 'y')) {
      this.data.mt.f = attrs.y
    }

    this.stage?.selectedMgr.updateFlo(this)
    this.stage?.render()
  }

  // 应用层方法; 1000次 -> 渲染 1 次
  public attrAsync(data: Partial<T>) {
    schedulerTask(() => {
      this.data = { ...this.data, ...data }
    })

    // this.stage?.render()
  }

  // 未完全实现
  attrDirty(data: Partial<T>) {
    attrDirty(this, data)
  }

  getBoundingRect(): IRect {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  getBBox(): IRect {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  remove() {
    const parentChildren = this.parent.children as IShape[]
    const index = parentChildren.indexOf(this)

    if (index !== -1) {
      parentChildren.splice(index, 1)
      this.stage.render()
    }
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
