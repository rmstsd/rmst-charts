import { ICoord } from 'rmst-render'
import WhiteboardEditor from '../whiteboardEditor'
import { applyToPoint, compose, inverse } from 'transformation-matrix'
import { rulerSize } from './ruler'

// world 坐标系 不包含标尺

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

  client2World(evt: MouseEvent, withRuler = false) {
    const rect = this.wbEditor.container.getBoundingClientRect()
    const coord = { x: evt.clientX - rect.left, y: evt.clientY - rect.top }

    if (withRuler) {
      return coord
    }
    return applyToPoint(inverse(this.wbEditor.graphLayerWithRulerWrapper.data.mt), coord)
  }

  scene2World(coord: ICoord) {
    return applyToPoint(compose(this.wbEditor.graphLayer.data.mt), coord)
  }

  world2Scene(coord: ICoord) {
    return applyToPoint(inverse(compose(this.wbEditor.graphLayer.data.mt)), coord)
  }

  client2Scene(evt: MouseEvent) {
    return this.world2Scene(this.client2World(evt))
  }
}
