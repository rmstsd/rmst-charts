export default class Rect {
  constructor(data: Rect['data']) {
    this.data = data
  }

  data: { x: number; y: number; width: number; height: number; bgColor: string; [key: string]: any }

  onChange = () => {}
  onClick = () => {}
  onMove = () => {}
  onEnter = () => {}
  onLeave = () => {}

  isMouseInner = false

  draw(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height, bgColor } = this.data

    ctx.fillStyle = bgColor
    ctx.fillRect(x, y, width, height)
  }

  isInnerRect(x: number, y: number) {
    const isInnerRect =
      x >= this.data.x &&
      x <= this.data.x + this.data.width &&
      y >= this.data.y &&
      y <= this.data.y + this.data.height

    return isInnerRect
  }

  handleClick(offsetX: number, offsetY: number) {
    if (this.isInnerRect(offsetX, offsetY)) this.onClick()
  }

  handleMove(offsetX: number, offsetY: number) {
    const isInnerRect = this.isInnerRect(offsetX, offsetY)

    if (isInnerRect) {
      if (!this.isMouseInner) {
        this.isMouseInner = true

        this.onEnter()
      }

      this.onMove()
    } else {
      if (this.isMouseInner) {
        this.isMouseInner = false

        this.onLeave()
      }
    }
  }
}
