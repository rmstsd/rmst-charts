import { combineDefaultData } from './AbstractUi'
import { Group } from './Group'
import { RectData, defaultRectData, drawRect } from './Rect'

export class BoxHidden extends Group {
  constructor(data: RectData) {
    super()

    this.type = 'BoxHidden'

    this.data = combineDefaultData(data, defaultRectData)
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    this.path2D = drawRect(ctx, this.data)
    ctx.clip(this.path2D)

    this.children.forEach(item => {
      item.draw(ctx)
    })

    ctx.restore()
  }
}
