import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { IToolCustomHandle, ITool } from '../../type'
import { IShape, Rect, Circle } from 'rmst-render'
import { applyToPoint, inverse } from 'transformation-matrix'
import { Graph_Id } from '@/demo/7-whiteboard/constant'
import { primaryColor } from '@/demo/7-whiteboard/color'
import { cornerRadiusCursor } from '@/demo/7-whiteboard/class/cursorManager/icon'
import { ICoord } from 'rmst-render'

class ToolHandleRect implements ITool {
  private downPos: ICoord

  constructor(
    private wbEditor: WhiteboardEditor,
    private handleType
  ) {}

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    console.log('handle rect drag start')

    const selectedShape = this.wbEditor.selectManager.selectedGraphs[0]
    this.downPos = applyToPoint(selectedShape.data.mt, sceneCoord)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    const selectedShape = this.wbEditor.selectManager.selectedGraphs[0]
    const movePos = applyToPoint(inverse(selectedShape.data.mt), sceneCoord)

    let originPos
    let angle
    switch (this.handleType) {
      case 'tl': {
        originPos = { x: 0, y: 0 }
        angle = Math.PI / 4
        break
      }
      case 'tr': {
        originPos = { x: selectedShape.data.width, y: 0 }
        angle = (Math.PI / 4) * 3
        break
      }

      case 'br': {
        originPos = { x: selectedShape.data.width, y: selectedShape.data.height }
        angle = (Math.PI / 4) * 5
        break
      }
      case 'bl': {
        originPos = { x: 0, y: selectedShape.data.height }
        angle = (Math.PI / 4) * 7
        break
      }
    }

    const pos = projectToLine(movePos.x, movePos.y, originPos.x, originPos.y, angle)

    // 判断  originPos -> angle 与 originPos -> pos 方向相同
    const dx = pos.x - originPos.x
    const dy = pos.y - originPos.y
    // 数学里的 点积 (dot product)
    let dotProduct = dx * Math.cos(angle) + dy * Math.sin(angle)
    dotProduct = Math.max(dotProduct, 0) // 不允许负数，负数表示反方向

    // const distance = distanceTowPoint(pos, originPos)
    // console.log(dotProduct, distance)

    // distance 是 直角三角形的斜边长，求出等边三角形的边长
    let edgeLength = Math.floor(dotProduct / Math.sqrt(2))

    const maxEdgeLength = maxCornerRadius(selectedShape.data.width, selectedShape.data.height)
    edgeLength = Math.min(edgeLength, maxEdgeLength)

    const selGraph = this.wbEditor.selectManager.selectedGraphs[0] as Rect
    selGraph.attr({ cornerRadius: edgeLength })

    this.wbEditor.triggerRender()

    // 计算
  }

  onDragEnd(upEvt: PointerEvent, sceneCoord: ICoord) {}
}

// 将点 (x, y) 投影到经过 (x0, y0)，方向为 angle（弧度）的直线上
function projectToLine(x, y, x0, y0, angle) {
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)

  const vx = x - x0
  const vy = y - y0

  const t = vx * dx + vy * dy // 点乘

  return {
    x: x0 + t * dx,
    y: y0 + t * dy
  }
}

function maxCornerRadius(width: number, height: number) {
  return Math.floor(Math.min(width, height) / 2)
}

export class ToolCustomHandleRect implements IToolCustomHandle {
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
