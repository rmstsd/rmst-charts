import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ICustomHandleController, ITool } from '../../type'
import { IShape, Rect, Circle } from 'rmst-render'
import { applyToPoint, inverse } from 'transformation-matrix'
import { Graph_Id } from '@/demo/7-whiteboard/constant'
import { primaryColor } from '@/demo/7-whiteboard/color'
import { cornerRadiusCursor } from '@/demo/7-whiteboard/class/cursorManager/icon'
import { maxCornerRadius, ToolHandleRect } from './HandleRect'

export class RectController implements ICustomHandleController {
  renderHandles(wbEditor: WhiteboardEditor, selectedShape: IShape): IShape[] {
    const rectShape = selectedShape as Rect

    // Extracted from selectedManager.ts
    const downRect = wbEditor.selectManager.transformRect
    const tlCoord = applyToPoint(wbEditor.graphLayer.data.mt, applyToPoint(downRect.mt, { x: 0, y: 0 }))
    const trCoord = applyToPoint(wbEditor.graphLayer.data.mt, applyToPoint(downRect.mt, { x: downRect.width, y: 0 }))
    const brCoord = applyToPoint(
      wbEditor.graphLayer.data.mt,
      applyToPoint(downRect.mt, { x: downRect.width, y: downRect.height })
    )
    const blCoord = applyToPoint(wbEditor.graphLayer.data.mt, applyToPoint(downRect.mt, { x: 0, y: downRect.height }))

    let w = brCoord.x - tlCoord.x
    let h = brCoord.y - tlCoord.y
    let minSize = Math.min(w, h)

    if (minSize <= 50) {
      return []
    }

    let radius = rectShape.data.cornerRadius || 0
    radius = Math.min(radius, maxCornerRadius(rectShape.data.width, rectShape.data.height))

    const mtWorld = { ...wbEditor.graphLayer.data.mt }
    mtWorld.e += downRect.mt.e
    mtWorld.f += downRect.mt.f

    if (!wbEditor.toolManager.pointerContext.isPointerDown) {
      let mmt = { ...mtWorld, e: 0, f: 0 }
      const point = applyToPoint(mmt, { x: 0, y: radius })
      if (point.y < 14) {
        point.y = 14
        let invPoint = applyToPoint(inverse(mmt), { x: 0, y: point.y })
        radius = invPoint.y
      }
    }

    const tr = { x: downRect.width, y: 0 }
    const br = { x: downRect.width, y: downRect.height }
    const bl = { x: 0, y: downRect.height }

    const cornerHandles = [
      { x: radius, y: radius, type: 'tl' },
      { x: tr.x - radius, y: radius, type: 'tr' },
      { x: br.x - radius, y: br.y - radius, type: 'br' },
      { x: radius, y: bl.y - radius, type: 'bl' }
    ].map(item => {
      const point = applyToPoint(mtWorld, item)
      return new Circle({
        id: Graph_Id.corner_handle,
        x: point.x,
        y: point.y,
        radius: 5,
        fillStyle: 'white',
        strokeStyle: primaryColor,
        extraData: {
          cursorType: cornerRadiusCursor,
          handleType: item.type
        }
      })
    })

    return cornerHandles
  }

  getDragTool(wbEditor: WhiteboardEditor, handleType: string): ITool {
    return new ToolHandleRect(wbEditor, handleType)
  }
}
