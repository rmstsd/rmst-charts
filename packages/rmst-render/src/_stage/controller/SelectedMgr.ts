import { AbstractUiData, defaultAbsData, IShape, Stage } from '../..'

const floOption: AbstractUiData = Object.assign({}, defaultAbsData, {
  draggable: false,
  pointerEvents: 'none',
  fillStyle: undefined,
  lineWidth: 2,
  strokeStyle: '#0d99ff'
})

export class SelectedMgr {
  private hovered: IShape = null
  private cloned: IShape = null

  constructor(private stage: Stage) {}

  public onHoveredChange(hovered: IShape) {
    if (hovered) {
      if (hovered !== this.hovered) {
        this.hovered = hovered
        this.cloned?.remove()

        this.cloned = hovered.clone()
        this.stage.append(this.cloned)

        // @ts-ignore
        this.cloned.attr(floOption)
      }
    } else {
      this.hovered = null
      this.cloned?.remove()
      this.cloned = null
    }
  }

  public setHoveredVisible(visible: boolean) {
    if (visible) {
      this.onHoveredChange(this.stage.eventDispatcher.hovered)
    } else {
      this.hovered = null
      this.cloned?.remove()
      this.cloned = null
    }
  }

  public updateFlo(target) {
    if (this.hovered && this.hovered === target) {
      // @ts-ignore
      this.cloned.attr({ ...structuredClone(target.data), ...floOption })
    }
  }
}
