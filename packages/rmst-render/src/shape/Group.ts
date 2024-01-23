import { mountStage } from '../_stage/renderUi'
import AbstractUi, { AbstractUiData } from './AbstractUi'
import { IShape } from '../type'

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

  append(p: IShape[]): void
  append(p: IShape): void
  append(...args: IShape[]): void
  append(...args) {
    const elements = args.flat(1)

    this.children = this.children.concat(elements)
    this.children = this.children.map(item => Object.assign(item, { parent: this }))

    mountStage(this.children, this.stage)

    this.stage?.renderStage()
  }
}

export default Group
