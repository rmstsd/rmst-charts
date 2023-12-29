import { Stage } from '../_stage'
import { Animator, AnimateCartoonConfig } from '../animate'
import AbsEvent from '../AbsEvent'

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

  clip?: boolean
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

export abstract class AbstractUi<T> extends AbsEvent {
  constructor(type: IShapeType, shapeData, defaultShapeData?) {
    super()

    this.type = type

    this.data = combineDefaultData(shapeData, defaultShapeData)
  }

  type: IShapeType

  extraData

  declare data: AbstractUiData

  declare path2D: Path2D

  stage: Stage

  pinTop() {
    const parentChildren = this.parent.children as IShape[]

    parentChildren.splice(parentChildren.indexOf(this), 1)
    parentChildren.push(this)
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, opacity } = this.data

    ctx.globalAlpha = opacity

    ctx.shadowOffsetX = shadowOffsetX
    ctx.shadowOffsetY = shadowOffsetY
    ctx.shadowColor = shadowColor
    ctx.shadowBlur = shadowBlur
  }

  attr(data: Partial<T>) {
    this.data = { ...this.data, ...data }

    this.stage.renderStage()
  }

  remove() {
    this.stage.children = this.stage.children.filter(item => item !== this)
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
