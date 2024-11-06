import { AbstractUiData, defaultAbsData, isBoxHidden, IShape, Rect, Stage } from '../..'

const floOption: AbstractUiData = {
  ...defaultAbsData,
  draggable: false,
  pointerEvents: 'none',
  fillStyle: 'transparent',
  strokeStyle: '#0d99ff',
  zIndex: 9999
}

export class SelectedMgr {
  private hovered: IShape = null
  private cloned: IShape = null

  private lineWidth = 2

  constructor(private stage: Stage) {
    this.stage.camera.eventEmitter.on('zoomChange', zoom => {
      this.lineWidth = 2 / zoom

      if (this.cloned) {
        // @ts-ignore
        this.cloned.attr({ lineWidth: this.lineWidth })
      }
    })
  }

  public onHoveredChange(hovered: IShape) {
    if (hovered) {
      if (hovered !== this.hovered) {
        this.hovered = hovered
        this.cloned?.remove()

        this.cloned = getCloned(hovered)
        this.stage.append(this.cloned)

        // @ts-ignore
        this.cloned.attr({ ...floOption, lineWidth: this.lineWidth })
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
      this.cloned.attr({ ...structuredClone(target.data), ...floOption, lineWidth: this.lineWidth })
    }
  }
}

const getCloned = (shape: IShape) => {
  if (isBoxHidden(shape)) {
    return new Rect({ ...shape.data })
  }
  return shape.clone()
}
