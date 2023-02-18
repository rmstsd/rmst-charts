import Stage from './Stage'

export default class Path {
  onClick = () => {}
  onMove = () => {}
  onEnter = () => {}
  onLeave = () => {}

  isMouseInner = false

  stage: Stage

  // 不规则图形 离屏canvas 对比颜色值
  isInner(offsetX, offsetY) {
    return false
  }

  draw(ctx: CanvasRenderingContext2D) {}

  handleClick(offsetX: number, offsetY: number) {
    const isInner = this.isInner(offsetX, offsetY)
    if (isInner) this.onClick()
  }

  handleMove(offsetX: number, offsetY: number) {
    const isInner = this.isInner(offsetX, offsetY)

    if (isInner) {
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

  remove() {
    this.stage.elements = this.stage.elements.filter(item => item !== this)
    this.stage.renderStage()
  }
}
