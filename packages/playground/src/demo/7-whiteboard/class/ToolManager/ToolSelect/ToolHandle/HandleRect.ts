import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../../type'
import { distanceTowPoint, ICoord, Rect } from 'rmst-render'
import { applyToPoint, inverse } from 'transformation-matrix'

export class ToolHandleRect implements ITool {
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

export function maxCornerRadius(width: number, height: number) {
  return Math.floor(Math.min(width, height) / 2)
}
