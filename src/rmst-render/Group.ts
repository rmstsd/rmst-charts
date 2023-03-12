import Path from './shape/Path'

export class Group extends Path {
  constructor(data: any = {}) {
    super()

    this.data = { ...data }
  }
  isGroup = true
  elements = []

  isInner(offsetX: number, offsetY: number): boolean {
    if (!this.elements.length) return false

    return this.elements.some(item => item.isInner(offsetX, offsetY))
  }

  findActualShape(offsetX: number, offsetY: number) {
    if (!this.elements.length) return null

    return this.elements.find(item => item.isInner(offsetX, offsetY))
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.elements.forEach(item => {
      item.draw(ctx)
    })
  }

  append(element) {
    this.elements = this.elements.concat(element)
    this.elements = this.elements.map(item => Object.assign(item, { parent: this }))

    // console.log(this.elements)

    this.findStage()?.renderStage()
  }
}

export default Group
