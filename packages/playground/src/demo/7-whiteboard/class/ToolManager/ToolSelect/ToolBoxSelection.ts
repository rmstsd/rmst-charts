import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { applyToPoint } from 'transformation-matrix'
import { ICoord, Rect } from 'rmst-render'
import { primaryAlphaColor, primaryColor } from '@/demo/7-whiteboard/color'
import { noop } from 'es-toolkit'
import { Box, Polygon, System } from 'detect-collisions'

export default class ToolBoxSelection implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {
    console.log('ToolBoxSelection')
  }

  private downPos: ICoord

  private tl: ICoord
  private br: ICoord

  private system = new System()
  private selectionBox: Box
  private boxes: Polygon[] = []

  private unBind = noop

  private boxSelectionRect = new Rect({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fillStyle: primaryAlphaColor,
    strokeStyle: primaryColor,
    lineWidth: 2,
    pointerEvents: 'none'
  })

  onActive() {
    this.wbEditor.stage.append(this.boxSelectionRect)

    this.unBind = this.wbEditor.camera.eventEmitter.on('cameraChange', () => {
      this.updateBoxSelectionRect()
    })
  }

  onDeActive() {
    console.log('ToolBoxSelection onDeActive')
    this.unBind?.()
  }

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.system.clear()

    this.downPos = sceneCoord

    this.selectionBox = this.system.createBox({ x: 0, y: 0 }, 0, 0)

    this.boxes = this.wbEditor.graphLayer.children.map(item => {
      const points = [
        { x: 0, y: 0 },
        { x: item.data.width, y: 0 },
        { x: item.data.width, y: item.data.height },
        { x: 0, y: item.data.height }
      ].map(pointItem => applyToPoint(item.data.mt, pointItem))

      return this.system.createPolygon({ x: 0, y: 0 }, points, { userData: { id: item.data.id } })
    })
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    this.tl = { x: Math.min(this.downPos.x, sceneCoord.x), y: Math.min(this.downPos.y, sceneCoord.y) }
    this.br = { x: Math.max(this.downPos.x, sceneCoord.x), y: Math.max(this.downPos.y, sceneCoord.y) }

    this.updateBoxSelectionRect()

    const boxRectScene = { x: this.tl.x, y: this.tl.y, width: this.br.x - this.tl.x, height: this.br.y - this.tl.y }
    this.selectionBox.x = this.tl.x
    this.selectionBox.y = this.tl.y
    this.selectionBox.width = boxRectScene.width
    this.selectionBox.height = boxRectScene.height

    const selectedIds = this.boxes
      .filter(item => this.system.checkCollision(this.selectionBox, item))
      .map(item => item.userData.id)

    this.wbEditor.selectManager.batchSelect(selectedIds)

    this.wbEditor.triggerRender()
  }

  private updateBoxSelectionRect() {
    // 场景坐标转世界坐标
    const tl = applyToPoint(this.wbEditor.graphLayer.data.mt, this.tl)
    const br = applyToPoint(this.wbEditor.graphLayer.data.mt, this.br)

    this.boxSelectionRect.attr({ x: tl.x, y: tl.y, width: br.x - tl.x, height: br.y - tl.y })
  }

  onDragEnd(upEvt: PointerEvent) {
    this.system.clear()
    this.boxSelectionRect.remove()
  }
}
