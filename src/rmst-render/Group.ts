import Path from './Path'

export default class Group extends Path {
  constructor() {
    super()
  }

  elements = []

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
