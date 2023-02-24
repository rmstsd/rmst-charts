import Path from './Path'

export class Group extends Path {
  constructor(data?: any) {
    super()

    this.data = data
  }

  elements = []

  isInner(offsetX: any, offsetY: any): boolean {
    if (!this.elements.length) return false

    return this.elements.some(item => item.isInner(offsetX, offsetY))
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

    this.findStage().renderStage()
  }
}

export default Group
