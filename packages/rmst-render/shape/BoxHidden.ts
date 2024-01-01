import AbstractUi from './AbstractUi'
import { RectData, defaultRectData, drawRect } from './Rect'

export class BoxHidden extends AbstractUi<RectData> {
  constructor(data: RectData) {
    super('BoxHidden', data, defaultRectData)
  }

  children: IShape[] = []

  append(...args) {
    const elements = args.flat(1)

    this.children = this.children.concat(elements)
    this.children = this.children.map(item => Object.assign(item, { parent: this }))

    this.stage?.renderStage()
  }

  draw(ctx: CanvasRenderingContext2D): void {
    super.draw(ctx)

    ctx.save()

    this.path2D = drawRect(ctx, this.data)
    ctx.clip(this.path2D)

    this.children.forEach(item => {
      item.draw(ctx)
    })

    ctx.restore()
  }
}
