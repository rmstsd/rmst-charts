import { IRect } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import ToolDrawByRect from './ToolDrawByRect'
import { ToolEnum } from './../constant'

export default class ToolDrawRect extends ToolDrawByRect {
  constructor(wbEditor: WhiteboardEditor) {
    super(wbEditor)
  }

  override getGraphPathD(rect: IRect) {
    const d = `M${rect.x},${rect.y}h${rect.width}v${rect.height}h-${rect.width}z`

    return { d, name: ToolEnum.label(ToolEnum.Rect), wbType: ToolEnum.Rect }
  }
}
