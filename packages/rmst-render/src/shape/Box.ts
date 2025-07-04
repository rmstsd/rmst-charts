import { mountStage } from '../_stage/renderUi'
import AbstractUi from './AbstractUi'
import { RectData, defaultRectData } from './Rect'
import { IShape } from '../type'

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

  declare data: RectData

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
}

export default Box
