import { Star } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import ToolDrawByRect from './ToolDrawByRect'
import { ToolEnum } from '../constant'

// 星形
export default class ToolDrawStar extends ToolDrawByRect {
  constructor(wbEditor: WhiteboardEditor) {
    super(wbEditor)
  }

  getShape() {
    const rect = { x: 0, y: 0, width: 1, height: 1 }
    const defaultSides = 5

    return new Star({
      side: defaultSides,
      ...rect,
      name: ToolEnum.label(ToolEnum.Star),
      extraData: {
        wbType: ToolEnum.Star
      }
    })
  }
}
