import { IRect } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import ToolDrawByRect from './ToolDrawByRect'
import { ToolEnum } from './../constant'

export default class ToolDrawEllipse extends ToolDrawByRect {
  constructor(wbEditor: WhiteboardEditor) {
    super(wbEditor)
  }

  getGraphPathD(rect: IRect) {
    const { width, height } = rect

    const cx = width / 2
    const cy = height / 2
    const rx = width / 2
    const ry = height / 2

    const d = drawEllipse(cx, cy, rx, ry)

    return { d, name: ToolEnum.label(ToolEnum.Ellipse), wbType: ToolEnum.Ellipse }
  }
}

function drawEllipse(cx: number, cy: number, rx: number, ry: number) {
  return `M ${cx - rx},${cy} A ${rx},${ry} 0 1,0 ${cx + rx},${cy} A ${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`
}
