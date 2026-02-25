import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { IToolCustomHandle, ITool } from '../../type'
import { Circle, IShape } from 'rmst-render'
import { applyToPoint, compose } from 'transformation-matrix'
import { Graph_Id } from '@/demo/7-whiteboard/constant'
import { primaryColor } from '@/demo/7-whiteboard/color'
import { cornerRadiusCursor } from '../../../cursorManager/icon'
import { ICoord, Path } from 'rmst-render'
import { inverse } from 'transformation-matrix'
import { drawDonutEllipsePath } from '../../ToolDraw/ToolDrawEllipse'

export let activeInnerDragAngle: number | null = null

class ToolHandleEllipse implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    activeInnerDragAngle = null
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    const selectedShape = this.wbEditor.selectManager.selectedGraphs[0] as Path

    // 转到 shape 局部坐标
    const localPos = applyToPoint(inverse(selectedShape.data.mt), sceneCoord)

    const { width, height } = selectedShape.data
    const cx = width / 2
    const cy = height / 2
    const rx = width / 2
    const ry = height / 2

    const dx = localPos.x - cx
    const dy = localPos.y - cy

    // 支持任意角度拖拽：计算当前位置相当于此时椭圆(长轴rx,短轴ry)的同心内缩比
    const rawRatio = Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2)
    const innerRatio = Math.max(0, Math.min(0.99, rawRatio))

    activeInnerDragAngle = Math.atan2(dy, dx)

    const newD = drawDonutEllipsePath(cx, cy, rx, ry, innerRatio)

    selectedShape.attr({
      d: newD,
      extraData: {
        ...selectedShape.data.extraData,
        innerRadius: innerRatio
      }
    })

    this.wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent, sceneCoord: ICoord) {
    activeInnerDragAngle = null
    this.wbEditor.triggerRender()
  }
}

export class ToolCustomHandleEllipse implements IToolCustomHandle {
  renderHandles(wbEditor: WhiteboardEditor, selectedShape: IShape): IShape[] {
    const { width, height } = selectedShape.data
    const innerRatio: number = selectedShape.data.extraData?.innerRadius ?? 0

    // 计算 handle 位置
    const rx = width / 2
    const ry = height / 2
    const cx = width / 2
    const cy = height / 2

    let localX: number
    let localY: number

    if (activeInnerDragAngle !== null) {
      // 局部坐标：根据拉伸比例和真实的极坐标角度反推准确的拖拽原位
      const cosA = Math.cos(activeInnerDragAngle)
      const sinA = Math.sin(activeInnerDragAngle)
      const currentRadius = (rx * ry) / Math.sqrt(Math.pow(ry * cosA, 2) + Math.pow(rx * sinA, 2))
      const r = innerRatio * currentRadius

      localX = cx + r * cosA
      localY = cy + r * sinA
    } else {
      // 局部坐标：固定在水平方向中心向左偏移 innerRatio*rx
      localX = cx - rx * innerRatio
      localY = cy
    }

    // 转到世界坐标
    const mtWorld = compose(wbEditor.graphLayer.data.mt, selectedShape.data.mt)
    const worldPos = applyToPoint(mtWorld, { x: localX, y: localY })

    // 最小显示阈值：shape 在屏幕上太小就不显示
    const tlWorld = applyToPoint(mtWorld, { x: 0, y: cy })
    const trWorld = applyToPoint(mtWorld, { x: width, y: cy })
    const screenWidth = Math.abs(trWorld.x - tlWorld.x)
    if (screenWidth < 40) {
      return []
    }

    const handle = new Circle({
      id: Graph_Id.corner_handle,
      x: worldPos.x,
      y: worldPos.y,
      radius: 5,
      fillStyle: 'white',
      strokeStyle: primaryColor,
      extraData: {
        handleType: 'ellipse_inner',
        cursorType: cornerRadiusCursor
      }
    })

    return [handle]
  }

  getDragTool(wbEditor: WhiteboardEditor, handleType: string): ITool {
    return new ToolHandleEllipse(wbEditor)
  }
}
