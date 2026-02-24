import WhiteboardEditor from '@/demo/7-whiteboard/whiteboardEditor'
import { ICustomHandleController, ITool } from '../../type'
import { Circle, IShape } from 'rmst-render'
import { applyToPoint, compose } from 'transformation-matrix'
import { Graph_Id } from '@/demo/7-whiteboard/constant'
import { primaryColor } from '@/demo/7-whiteboard/color'
import { ToolHandleEllipse } from './HandleEllipse'

export class EllipseController implements ICustomHandleController {
  renderHandles(wbEditor: WhiteboardEditor, selectedShape: IShape): IShape[] {
    const { width, height } = selectedShape.data
    const innerRatio: number = selectedShape.data.extraData?.innerRadius ?? 0

    // handle 在椭圆右侧、距右边缘 innerRatio*rx 处（水平中线上）
    const rx = width / 2
    const cx = width / 2
    const cy = height / 2

    // 局部坐标：右边缘向内偏移 innerRatio*rx
    const localX = cx + rx * (1 - innerRatio)
    const localY = cy

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
        handleType: 'ellipse_inner'
      }
    })

    return [handle]
  }

  getDragTool(wbEditor: WhiteboardEditor, handleType: string): ITool {
    return new ToolHandleEllipse(wbEditor)
  }
}
