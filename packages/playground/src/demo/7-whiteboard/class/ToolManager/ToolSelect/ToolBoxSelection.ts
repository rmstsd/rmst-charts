import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { applyToPoint } from 'transformation-matrix'
import { ICoord, Rect } from 'rmst-render'
import { primaryAlphaColor, primaryColor } from '@/demo/7-whiteboard/color'
import { noop } from 'es-toolkit'
import { calcRotateRad } from '@/demo/7-whiteboard/constant'
import { System } from 'detect-collisions'

export default class ToolBoxSelection implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {
    console.log('ToolBoxSelection')
  }

  downPos: ICoord

  tl: ICoord
  br: ICoord

  unBind = noop

  boxSelectionRect = new Rect({
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
    this.downPos = sceneCoord
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    this.tl = { x: Math.min(this.downPos.x, sceneCoord.x), y: Math.min(this.downPos.y, sceneCoord.y) }
    this.br = { x: Math.max(this.downPos.x, sceneCoord.x), y: Math.max(this.downPos.y, sceneCoord.y) }

    this.updateBoxSelectionRect()

    const boxRectScene = { x: this.tl.x, y: this.tl.y, width: this.br.x - this.tl.x, height: this.br.y - this.tl.y }

    const system = new System()
    const boxes = this.wbEditor.graphLayer.children.map(item => {
      const boxItem = system.createBox({ x: item.data.mt.e, y: item.data.mt.f }, item.data.width, item.data.height, {
        angle: calcRotateRad(item.data.mt)
      })

      return { id: item.data.id, boxItem }
    })

    const selectionBox = system.createBox(
      { x: boxRectScene.x, y: boxRectScene.y },
      boxRectScene.width,
      boxRectScene.height
    )
    const selectedIds = boxes.filter(item => system.checkCollision(selectionBox, item.boxItem)).map(item => item.id)

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
    this.boxSelectionRect.remove()
  }
}
