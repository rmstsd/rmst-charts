import { Group } from './Group'
import { RectData, defaultRectData, drawRect } from './Rect'

export default class BoxHidden extends Group {
  constructor(data: RectData) {
    super()

    this.data = { ...data, ...defaultRectData }
  }

  declare data: RectData

  // 待实现
  isInner() {
    return false
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    const path2D = drawRect(ctx, this.data)
    ctx.clip(path2D)

    this.elements.forEach(item => {
      item.draw(ctx)
    })

    ctx.restore()
  }
}
