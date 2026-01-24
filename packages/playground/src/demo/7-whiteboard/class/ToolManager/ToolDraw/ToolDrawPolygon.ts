import { Polygon } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import ToolDrawByRect from './ToolDrawByRect'
import { ToolEnum } from './../constant'

// 多边形
export default class ToolDrawPolygon extends ToolDrawByRect {
  constructor(wbEditor: WhiteboardEditor) {
    super(wbEditor)
  }

  getShape() {
    const rect = { x: 0, y: 0, width: 1, height: 1 }
    const defaultSides = 3

    return new Polygon({
      side: defaultSides,
      ...rect,
      name: ToolEnum.label(ToolEnum.Polygon),
      extraData: {
        wbType: ToolEnum.Polygon
      }
    })
  }
}
