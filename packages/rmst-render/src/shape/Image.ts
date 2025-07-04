import AbstractUi, { UiData, IRect } from './AbstractUi'

const defaultData: ImageData = {}

interface ImageData extends UiData {
  src?: string
}

export class RmstImage extends AbstractUi {
  constructor(data: ImageData) {
    super('Image', data, defaultData)
  }

  nativeImage: HTMLImageElement

  declare data: ImageData

  override getBBox(): IRect {
    return { x: 0, y: 0, width: this.data.width, height: this.data.height }
  }
}

export default RmstImage
