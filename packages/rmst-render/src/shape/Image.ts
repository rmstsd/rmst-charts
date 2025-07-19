import { FitMode } from 'object-fit-math/dist/types'
import { IRect, IShapeType } from '../type'
import Box, { BoxData } from './Box'

interface ImageData extends BoxData {
  src?: string
  objectFit?: FitMode
}

export class RmstImage extends Box {
  constructor(data: ImageData) {
    super(data)
  }

  oldSrc: string // 内部私有 用于渲染时比较

  type: IShapeType = 'Image'

  nativeImage: HTMLImageElement

  data: ImageData

  override getBBox(): IRect {
    return { x: 0, y: 0, width: this.data.width, height: this.data.height }
  }

  // 图片加载完成后 会调用该方法
  onLoad() {}
}

export default RmstImage
