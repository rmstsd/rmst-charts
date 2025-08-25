import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { applyToPoint } from 'transformation-matrix'
import { ICoord, Rect } from 'rmst-render'
import { primaryAlphaColor, primaryColor } from '@/demo/7-whiteboard/color'
import { cloneDeep, noop } from 'es-toolkit'
import { Box, Polygon, System } from 'detect-collisions'
import { ass } from '../ass'

export default class ToolBoxSelection implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  private downPos: ICoord
  private movePos: ICoord

  private spaceDownPos: ICoord
  private spacePrevPos: ICoord

  private tl: ICoord
  private br: ICoord

  private system = new System()
  private selectionBox: Box
  private boxes: Polygon[] = []

  private unBind = noop

  private boxSelectionRect = new Rect({
    name: '框选 box rect',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fillStyle: primaryAlphaColor,
    strokeStyle: primaryColor,
    lineWidth: 1,
    pointerEvents: 'none'
  })

  onActive() {
    this.wbEditor.graphLayerWithRulerWrapper.append(this.boxSelectionRect)

    this.unBind = this.wbEditor.camera.eventEmitter.on('cameraChange', () => {
      this.updateBoxSelectionRect()
    })
  }

  onDeActive() {
    this.boxSelectionRect.remove()
    this.unBind?.()
  }

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.boxSelectionRect.attr({ visible: true })

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
    this.movePos = sceneCoord
    this.updateRect()
  }

  private updateBoxSelectionRect() {
    // 场景坐标转世界坐标
    const tl = this.wbEditor.coordSys.scene2World(this.tl)
    const br = this.wbEditor.coordSys.scene2World(this.br)

    this.boxSelectionRect.attr({ x: tl.x, y: tl.y, width: br.x - tl.x, height: br.y - tl.y })
  }

  onDragEnd(upEvt: PointerEvent) {
    this.boxSelectionRect.attr({ visible: false })
    this.system.clear()
  }

  private updateRect() {
    const { downPos, movePos } = this

    if (!downPos || !movePos) {
      return
    }

    const { isSpaceKeyPressing, isAltKeyPressing, isShiftKeyPressing } = this.wbEditor.keyboard

    const rectAns = ass(downPos, movePos, {
      isSpaceKeyPressing,
      isAltKeyPressing,
      isShiftKeyPressing,
      spacePrevPos: this.spacePrevPos,
      spaceDownPos: this.spaceDownPos
    })

    this.tl = { x: rectAns.x, y: rectAns.y }
    this.br = { x: rectAns.x + rectAns.width, y: rectAns.y + rectAns.height }

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

  onSpaceToggle(isSpaceKeyPressing: boolean) {
    this.spaceDownPos = cloneDeep(this.downPos)
    this.spacePrevPos = cloneDeep(this.movePos)

    this.updateRect()
  }
  onShiftToggle(isShiftKeyPressing: boolean) {
    this.updateRect()
  }
  onAltToggle(isAltKeyPressing: boolean) {
    this.updateRect()
  }
}
