import { AbstractUiData, defaultAbsData, IShape, Stage } from '../..'

const floOption: AbstractUiData = Object.assign({}, defaultAbsData, {
  draggable: false,
  pointerEvents: 'none',
  fillStyle: undefined,
  lineWidth: 2,
  strokeStyle: '#0d99ff'
})

export class SelectedMgr {
  private wm = new WeakMap()

  private hovered = new Set<IShape>()

  constructor(private stage: Stage) {}

  public onElementEnter(target: IShape) {
    const cloned: IShape = target.clone()

    this.wm.set(target, cloned)
    this.hovered.add(cloned)
    this.stage.append(cloned)

    // @ts-ignore
    cloned.attr(floOption)
  }

  public onElementLeave(target) {
    const sel = this.wm.get(target)
    this.hovered.delete(sel)
    sel.remove()
  }

  public updateFlo(target) {
    const sel = this.wm.get(target)

    if (sel) {
      sel.attr({ ...structuredClone(target.data), ...floOption })
    }
  }
}
