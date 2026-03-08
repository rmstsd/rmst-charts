import { Stage } from '../_stage'
import { Animator, AnimateCartoonConfig } from '../animate'
import AbsEvent, { EventOpt } from '../AbsEvent'
import { schedulerTask } from '../_stage/scheduler'
import { ICursor, IRect, IShape, IShapeType } from '../type'
import { attrDirty } from '../_stage/controller/DirtyRect'
import { compose, identity, Matrix, translate } from 'transformation-matrix'
import { normalizedAttrs } from '../utils/attr'
import { createLinePath2D, measureText, uuid } from '../utils'
import { createRectPath2D, setCirclePath2D, setEllipsePath2D, setRectPath2D, setTrapezoidPath2D } from '../renderer/canvas'
import Line from './Line'
import Text from './Text'
import RmstImage from './Image'
import { isNil } from 'es-toolkit'

export interface UiBaseData extends EventOpt {
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

  visible?: boolean // 不渲染, 也不拾取图形

  pointerEvents?: 'none' | 'all' // 是否响应鼠标事件 默认为 true

  rotate?: number // 角度

  extraData?: any // 不能存储函数 只能存 JSON

  mt?: Matrix

  children?: UiBase[]
}

export const getDefaultUiBaseDataData = (): UiBaseData => ({
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
  const defaultAbsData = getDefaultUiBaseDataData()
  const ans = { ...defaultAbsData, ...defaultShapeData, ...shapeData }

  return ans
}

export abstract class UiBase<T = UiBaseData> extends AbsEvent {
  constructor(shapeData, defaultShapeData?) {
    super()

    this.data = combineDefaultData(shapeData, defaultShapeData)

    if (!this.data.id) {
      this.data.id = uuid()
    }

    this.data.mt = compose(translate(this.data.x ?? 0, this.data.y ?? 0), this.data.mt)

    this.updatePath2D()
  }

  // 使用 getter 定义而不是属性, 是为了定义在原型上, 能在 new 的时候就访问到
  abstract get type(): IShapeType

  declare data: UiBaseData

  declare path2D: Path2D

  private updatePath2D() {
    if (this.type === 'Stage') {
      return
    }

    switch (this.type) {
      case 'Circle': {
        setCirclePath2D(this)
        break
      }
      case 'Ellipse': {
        setEllipsePath2D(this)
        break
      }
      case 'Path':
      case 'Star':
      case 'Polygon': {
        this.path2D = new Path2D(this.data.d)
        break
      }
      case 'Trapezoid': {
        setTrapezoidPath2D(this as any)
        break
      }
      case 'Line': {
        const { closed, path2D } = (this as Line).data
        this.path2D = path2D ? path2D : createLinePath2D(this.data)

        break
      }
      case 'Rect': {
        setRectPath2D(this)
        break
      }
      case 'Group': {
        break
      }
      case 'Box': {
        // 在有描边的情况下, 必须先 fill, 再 stoke, 否则会出现内容覆盖描边的问题
        setRectPath2D(this)
        break
      }
      case 'Image': {
        const rrImageElementItem = this as unknown as RmstImage
        let { width, height, cornerRadius, src, objectFit } = rrImageElementItem.data

        if (!src) {
          break
        }

        if (rrImageElementItem.nativeImage && rrImageElementItem._oldSrc === src) {
          const image = rrImageElementItem.nativeImage
          const ratio = image.naturalWidth / image.naturalHeight

          if (width && isNil(height)) {
            height = width / ratio
          } else if (height && isNil(width)) {
            width = height * ratio
          }

          rrImageElementItem.path2D = createRectPath2D({ x: 0, y: 0, width, height, cornerRadius })
        } else {
          rrImageElementItem.nativeImage = null
          rrImageElementItem._oldSrc = src

          const image = new Image()
          image.src = src

          image.onload = () => {
            rrImageElementItem.nativeImage = image
            const ratio = image.naturalWidth / image.naturalHeight

            // 如果只设置了宽或者高, 则根据图片的宽高比自动计算另一个属性, 保持图片不变形
            if (width && isNil(height)) {
              height = width / ratio
              rrImageElementItem.data.height = height
            } else if (height && isNil(width)) {
              width = height * ratio
              rrImageElementItem.data.width = width
            }

            rrImageElementItem.path2D = createRectPath2D({ x: 0, y: 0, width, height, cornerRadius })

            rrImageElementItem.onLoad?.()
            this.stage?.render()
          }
        }

        break
      }
      case 'Text': {
        const textElementItem = this as Text
        let { content, fontSize, textAlign = 'left', textBaseline, boxData } = textElementItem.data

        const textSize = measureText(content, fontSize)

        const padding = boxData?.padding ?? 0

        let x = 0
        if (textAlign === 'center') {
          x = -textSize.textWidth / 2
        } else if (textAlign === 'right') {
          x = -textSize.textWidth
        }

        textElementItem.path2D = createRectPath2D({
          x,
          y: 0,
          width: textSize.textWidth + padding * 2,
          height: fontSize + padding * 2,
          cornerRadius: boxData?.cornerRadius ?? 0
        })

        break
      }

      default:
        console.log(this.type, '该图形 暂未实现')
        break
    }
  }

  stage: Stage

  extraFunction

  get id() {
    return this.data.id
  }

  get children() {
    return this.data.children ?? []
  }

  clone() {
    // todo 对于有后代的元素还要深度 clone
    const Class = this.constructor as new (...args) => UiBase<T>
    const newData = structuredClone(this.data)
    newData.id = uuid()
    return new Class(newData)
  }

  getOutLineShape() {
    const Class = this.constructor as new (...args) => UiBase<T>
    return new Class(structuredClone(this.data))
  }

  pinTop() {
    if (!this.parent) {
      console.warn('还没有被 append')
      return
    }
    const parentChildren = this.parent.data.children as IShape[]

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

    this.updatePath2D()

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
    if (!this.parent) {
      return
    }
    const parentChildren = this.parent.data.children as IShape[]
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

export default UiBase
