import { mountParentInChildren, mountStageInChildren } from '../_stage/renderUi'
import UiBase, { UiBaseData } from './UiBase'
import { IShape, IShapeType } from '../type'
import { cloneDeep } from 'es-toolkit'

interface GroupData extends UiBaseData {
  children?: IShape[]
}

const defaultData: GroupData = {
  children: []
}

export class Group<Data = GroupData> extends UiBase<Data> {
  constructor(data: GroupData = cloneDeep(defaultData)) {
    super(data, cloneDeep(defaultData))

    mountParentInChildren(this)
  }

  type: IShapeType = 'Group'

  data: GroupData

  append(p: IShape[]): void
  append(p: IShape): void
  append(...args: IShape[]): void
  append(...args) {
    const elements = args.flat(1).filter(Boolean)

    if (!Array.isArray(this.data.children)) {
      this.data.children = []
    }

    this.data.children = this.data.children.concat(elements)

    mountParentInChildren(this)
    mountStageInChildren(this.data.children, this.stage)

    this.stage?.render()
  }

  removeAllChildren() {
    disposeAll(this.data.children)
    this.data.children = []

    this.stage?.render()
  }
}

export default Group

const disposeAll = (children: IShape[]) => {
  children.forEach(item => {
    item.dispose()

    if (Array.isArray(item.children)) {
      disposeAll(item.children)
    }
  })
}
