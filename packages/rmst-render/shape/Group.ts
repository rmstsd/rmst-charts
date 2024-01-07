import { mountStage } from 'rmst-render/_stage/utils'
import AbstractUi, { AbstractUiData } from './AbstractUi'

interface GroupData extends AbstractUiData {
  children?: IShape[]
}

const defaultData: GroupData = {
  children: []
}

export class Group extends AbstractUi<any> {
  constructor(data: GroupData = {}) {
    super('Group', data, defaultData)
  }

  children: IShape[] = []

  draw(ctx: CanvasRenderingContext2D): void {
    this.children.forEach(item => {
      item.draw(ctx)
    })
  }

  append(...args) {
    const elements = args.flat(1)

    this.children = this.children.concat(elements)
    this.children = this.children.map(item => Object.assign(item, { parent: this }))

    mountStage(this.children, this.stage)

    this.stage?.renderStage()
  }
}

export default Group
