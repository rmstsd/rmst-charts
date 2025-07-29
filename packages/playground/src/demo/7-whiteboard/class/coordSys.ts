import { ICoord } from 'rmst-render'
import WhiteboardEditor from '../whiteboardEditor'
import { applyToPoint, compose, inverse } from 'transformation-matrix'
import { rulerSize } from './ruler'

export class CoordSys {
  constructor(private wbEditor: WhiteboardEditor) {}

  get viewportSize() {
    const canvasSize = this.wbEditor.stage.canvasSize
    return { width: canvasSize.width - rulerSize, height: canvasSize.height - rulerSize }
  }

  // 世界坐标系 中心
  get centerWorld() {
    const { viewportSize } = this

    return { x: viewportSize.width / 2, y: viewportSize.height / 2 }
  }

  // 场景坐标系 中心
  get centerScene() {
    return this.world2Scene(this.centerWorld)
  }

  client2World(evt: MouseEvent) {
    const rect = this.wbEditor.container.getBoundingClientRect()

    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }
  }

  world2Scene(coord: ICoord) {
    const { wbEditor } = this

    return applyToPoint(inverse(compose(wbEditor.graphLayerWithRulerWrapper.data.mt, wbEditor.graphLayer.data.mt)), coord)
  }

  scene2World(coord: ICoord) {
    const { wbEditor } = this

    return applyToPoint(compose(wbEditor.graphLayerWithRulerWrapper.data.mt, wbEditor.graphLayer.data.mt), coord)
  }

  client2Scene(evt: MouseEvent) {
    return this.world2Scene(this.client2World(evt))
  }
}
