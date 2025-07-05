import { ICoord } from 'rmst-render'
import WhiteboardEditor from '../whiteboardEditor'
import { applyToPoint, inverse } from 'transformation-matrix'

export class CoordSys {
  constructor(private wbEditor: WhiteboardEditor) {}

  // 世界坐标系 中心
  get centerWorld() {
    return { x: this.wbEditor.stage.canvasSize.width / 2, y: this.wbEditor.stage.canvasSize.height / 2 }
  }

  // 场景坐标系 中心 by 世界坐标的中心
  get centerScene() {
    return this.world2Scene(this.centerWorld)
  }

  client2World(evt: MouseEvent) {
    const rect = this.wbEditor.container.getBoundingClientRect()

    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }
  }

  world2Scene(coord: ICoord) {
    return applyToPoint(inverse(this.wbEditor.graphLayer.data.mt), coord)
  }

  client2Scene(evt: MouseEvent) {
    return this.world2Scene(this.client2World(evt))
  }
}
