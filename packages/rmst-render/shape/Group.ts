import AbstractUi from './AbstractUi'

export class Group extends AbstractUi {
  constructor(data = {}) {
    super()

    this.data = { ...data }
  }

  isGroup = true
  elements: Group[] = []

  draw(ctx: CanvasRenderingContext2D): void {
    this.elements.forEach(item => {
      item.draw(ctx)
    })
  }

  append(element) {
    this.elements = this.elements.concat(element)
    this.elements = this.elements.map(item => Object.assign(item, { parent: this }))

    this.findStage()?.renderStage()
  }
}

export default Group
