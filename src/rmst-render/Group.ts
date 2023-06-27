import Path from './shape/Path'

export class Group extends Path {
  constructor(data: any = {}) {
    super()

    this.data = { ...data }
  }

  isGroup = true
  elements: Group[] = []

  getGroupSurroundBoxCoord() {
    // 只是个临时解决方案
    const stage = this.findStage()
    return { lt_x: 0, lt_y: 0, rb_x: stage.canvasSize.width, rb_y: stage.canvasSize.height }

    const lt_x = Math.min(...this.elements.map(item => item.surroundBoxCoord.lt_x))
    const lt_y = Math.min(...this.elements.map(item => item.surroundBoxCoord.lt_y))
    const rb_x = Math.max(...this.elements.map(item => item.surroundBoxCoord.rb_x))
    const rb_y = Math.max(...this.elements.map(item => item.surroundBoxCoord.rb_y))

    return { lt_x, lt_y, rb_x, rb_y }
  }

  isInner(offsetX: number, offsetY: number): boolean {
    if (!this.elements.length) return false

    return this.elements.some(item => item.isInner(offsetX, offsetY))
  }

  findActualShape(offsetX: number, offsetY: number) {
    if (!this.elements.length) return null

    return this.elements.find(item => item.isInner(offsetX, offsetY))
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.beforeDrawClip(ctx)

    this.elements.forEach(item => {
      item.draw(ctx)
    })

    ctx.restore() // 恢复clip
  }

  append(element) {
    this.elements = this.elements.concat(element)
    this.elements = this.elements.map(item => Object.assign(item, { parent: this }))

    // console.log(this.elements)

    this.findStage()?.renderStage()
  }
}

export default Group
