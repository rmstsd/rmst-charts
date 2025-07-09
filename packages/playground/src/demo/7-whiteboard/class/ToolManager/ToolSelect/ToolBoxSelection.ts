import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../type'
import { applyToPoint } from 'transformation-matrix'
import { ICoord, isRectCollision, isRectCollisionOBB, Rect } from 'rmst-render'
import { primaryAlphaColor, primaryColor } from '@/demo/7-whiteboard/color'
import { noop } from 'es-toolkit'
import { calcRotateRad } from '@/demo/7-whiteboard/constant'

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
    lineWidth: 2
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

    const boxRectScene = {
      x: this.tl.x,
      y: this.tl.y,
      width: this.br.x - this.tl.x,
      height: this.br.y - this.tl.y
    }

    const selectedIds = this.wbEditor.graphLayer.children
      .filter(item =>
        // isRectCollision(boxRectScene, {
        //   x: item.data.mt.e,
        //   y: item.data.mt.f,
        //   width: item.data.width,
        //   height: item.data.height
        // })

        isRectCollisionOBB(boxRectScene, {
          x: item.data.mt.e,
          y: item.data.mt.f,
          width: item.data.width,
          height: item.data.height,
          rotation: calcRotateRad(item.data.mt)
        })
      )
      .map(item => item.data.id)

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
