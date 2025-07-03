import AbstractUi, { AbstractUiData, IRect } from './AbstractUi'

const defaultData: ImageData = {}

interface ImageData extends AbstractUiData {
  src?: string
}

export class Image extends AbstractUi<ImageData> {
  constructor(data: ImageData) {
    super('Image', data, defaultData)
  }

  declare data: ImageData

  override getBBox(): IRect {
    return { x: 0, y: 0, width: this.data.width, height: this.data.height }
  }
}

export default Image
