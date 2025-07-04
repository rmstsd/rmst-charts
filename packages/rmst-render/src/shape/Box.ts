import { mountStage } from '../_stage/renderUi'
import AbstractUi, { IRect } from './AbstractUi'
import Rect, { RectData, defaultRectData } from './Rect'
import { IShape } from '../type'
import { omit } from 'es-toolkit'
import Path from './Path'

interface BoxData extends RectData {
  children?: IShape[]
}

export class Box extends AbstractUi<BoxData> {
  constructor(data: BoxData) {
    super('BoxHidden', data, defaultRectData)

    if (data.children) {
      this.children = data.children
    }
  }

  declare data: BoxData

  children: IShape[] = []

  append(p: IShape[]): void
  append(p: IShape): void
  append(...args: IShape[]): void
  append(...args) {
    const elements = args.flat(1)

    this.children = this.children.concat(elements)
    this.children = this.children.map(item => Object.assign(item, { parent: this }))

    mountStage(this.children, this.stage)

    this.stage?.render()
  }

  override getOutLineShape(): AbstractUi<RectData> {
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
