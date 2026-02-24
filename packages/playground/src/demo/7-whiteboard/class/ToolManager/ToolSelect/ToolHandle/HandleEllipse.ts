import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ITool } from '../../type'
import { ICoord, Path } from 'rmst-render'
import { applyToPoint, inverse } from 'transformation-matrix'
import { drawDonutEllipsePath } from '../../ToolDraw/ToolDrawEllipse'

export class ToolHandleEllipse implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {}

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    const selectedShape = this.wbEditor.selectManager.selectedGraphs[0] as Path

    // 转到 shape 局部坐标
    const localPos = applyToPoint(inverse(selectedShape.data.mt), sceneCoord)

    const { width, height } = selectedShape.data
    const cx = width / 2
    const cy = height / 2
    const rx = width / 2
    const ry = height / 2

    // handle 在右侧 (x > cx)，拖向左边增大内圆
    // innerRatio = (右边缘 - localX) / rx，clamp 到 [0, 1)
    const rawRatio = (width - localPos.x) / rx
    const innerRatio = Math.max(0, Math.min(0.99, rawRatio))

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

  onDragEnd(upEvt: PointerEvent, sceneCoord: ICoord) {}
}
