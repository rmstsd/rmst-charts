import AbstractUi from './AbstractUi'

export class Group extends AbstractUi {
  constructor(data = {}) {
    super()

    this.type = 'Group'

    this.data = { ...data }
  }

  children: IShape[] = []

  draw(ctx: CanvasRenderingContext2D): void {
    this.children.forEach(item => {
      item.draw(ctx)
    })
  }

  append(element) {
    this.children = this.children.concat(element)
    this.children = this.children.map(item => Object.assign(item, { parent: this }))

    this.findStage()?.renderStage()
  }
}

export default Group
