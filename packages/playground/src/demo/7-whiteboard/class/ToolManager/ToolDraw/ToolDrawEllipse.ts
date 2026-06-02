import { Ellipse } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import ToolDrawByRect from './ToolDrawByRect'
import { ToolEnum } from './../constant'

export default class ToolDrawEllipse extends ToolDrawByRect {
  cursor = 'crosshair'

  constructor(wbEditor: WhiteboardEditor) {
    super(wbEditor)
  }

  getShape() {
    const rect = { x: 0, y: 0, width: 1, height: 1 }

    return new Ellipse({
      ...rect,
      name: ToolEnum.label(ToolEnum.Ellipse),
      extraData: { wbType: ToolEnum.Ellipse }
    })
  }
}
