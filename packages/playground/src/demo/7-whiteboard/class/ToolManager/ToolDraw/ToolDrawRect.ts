import { IRect, Path } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import ToolDrawByRect from './ToolDrawByRect'
import { ToolEnum } from './../constant'

export default class ToolDrawRect extends ToolDrawByRect {
  constructor(wbEditor: WhiteboardEditor) {
    super(wbEditor)
  }

  getGraphPathD(rect: IRect) {
    const d = `M${rect.x},${rect.y}h${rect.width}v${rect.height}h-${rect.width}z`

    return d
  }

  getShape() {
    const rect = { x: 0, y: 0, width: 1, height: 1 }

    return new Path({
      d: this.getGraphPathD(rect),
      ...rect,
      name: ToolEnum.label(ToolEnum.Rect),
      extraData: { wbType: ToolEnum.Rect }
    })
  }
}
