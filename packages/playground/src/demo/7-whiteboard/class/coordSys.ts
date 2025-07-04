import { ICoord } from 'rmst-render'
import WhiteboardEditor from '../whiteboardEditor'
import { applyToPoint, inverse } from 'transformation-matrix'

export class CoordSys {
  constructor(private wbEditor: WhiteboardEditor) {}

  get centerWorld() {
    return { x: this.wbEditor.stage.canvasSize.width / 2, y: this.wbEditor.stage.canvasSize.height / 2 }
  }

  client2World(evt: PointerEvent) {
    const rect = this.wbEditor.container.getBoundingClientRect()

    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }
  }

  world2Scene(coord: ICoord) {
    return applyToPoint(inverse(this.wbEditor.graphLayer.data.mt), coord)
  }
}
