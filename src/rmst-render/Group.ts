import Path from './Path'

export default class Group extends Path {
  constructor() {
    super()
  }

  elements = []

  isInner(offsetX: any, offsetY: any): boolean {
    if (!this.elements.length) return false

    return this.elements.some(item => item.isInner(offsetX, offsetY))
  }

  draw(ctx: CanvasRenderingContext2D): void {
    console.log(this)

    this.elements.forEach(item => {
      item.draw(ctx)
    })
  }

  append(element) {
    this.elements.push(element)
  }
}
