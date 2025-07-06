import UiBase from './UiBase'
import { RectData, defaultRectData } from './Rect'
import { IRect, IShape, IShapeType } from '../type'
import { omit } from 'es-toolkit'
import Path from './Path'
import Group from './Group'

export interface BoxData extends RectData {
  children?: IShape[]
}

export class Box extends Group {
  constructor(data: BoxData) {
    super({ ...defaultRectData, ...data })
  }

  data: BoxData

  type: IShapeType = 'Box'

  override getOutLineShape(): UiBase<RectData> {
    let newData = omit(this.data, ['children'])

    newData = structuredClone(newData)
    const d = `M${newData.x},${newData.y}h${newData.width}v${newData.height}h-${newData.width}z`
    newData.d = d

    return new Path(newData)
  }

  override getBBox(): IRect {
    return { x: 0, y: 0, width: this.data.width, height: this.data.height }
  }
}

export default Box
