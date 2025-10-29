import { ICoord, uuid } from 'rmst-render'
import { Graph_Id } from '../../constant'
import WhiteboardEditor from '../../whiteboardEditor'
import { ITool } from './type'
import { rulerRemoveCursor } from '../cursorManager/icon'

export class ToolRuler implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  static Cursor_Horizontal = 'ns-resize'
  static Cursor_Vertical = 'ew-resize'

  private isRulerZone: boolean

  private visibleHor: boolean
  private visibleVer: boolean

  private isHorizontal: boolean
  private isVertical: boolean

  private id = ''

  setRuler({ handleInfo, id }) {
    this.isRulerZone = handleInfo.handleName === 'ruler_zone_horizontal' || handleInfo.handleName === 'ruler_zone_vertical'

    this.id = id

    this.isHorizontal = handleInfo.handleName.includes('horizontal')
    this.isVertical = handleInfo.handleName.includes('vertical')
  }

  onDragStart(evt: PointerEvent, sceneCoord: ICoord) {
    if (this.isRulerZone) {
      const addX = () => {
        this.id = uuid()
        this.wbEditor.ruler.addRuler('horizontal', this.id, sceneCoord.y)
      }

      const addY = () => {
        this.id = uuid()
        this.wbEditor.ruler.addRuler('vertical', this.id, sceneCoord.x)
      }

      if (this.isHorizontal) {
        addX()
      } else if (this.isVertical) {
        addY()
      }
    }
  }

  onDragMove(evt: PointerEvent, sceneCoord: ICoord) {
    // 吸附
    const offset = this.wbEditor.refLine.getOffset([sceneCoord], [this.id])
    sceneCoord.x += offset.x
    sceneCoord.y += offset.y

    const worldCoord = this.wbEditor.coordSys.scene2World(sceneCoord)

    const visibleHor = worldCoord.y > 0
    const visibleVer = worldCoord.x > 0

    this.visibleHor = visibleHor
    this.visibleVer = visibleVer

    let cursor

    if ((this.isHorizontal && !visibleHor) || (this.isVertical && !visibleVer)) {
      cursor = rulerRemoveCursor
    } else {
      cursor = this.isHorizontal ? ToolRuler.Cursor_Horizontal : ToolRuler.Cursor_Vertical
    }

    this.wbEditor.cursorManager.setCursor(cursor)

    const updateX = () => {
      this.wbEditor.ruler.updateRuler('horizontal', this.id, sceneCoord.y)
    }
    const updateY = () => {
      this.wbEditor.ruler.updateRuler('vertical', this.id, sceneCoord.x)
    }

    if (this.isHorizontal) {
      updateX()
    } else if (this.isVertical) {
      updateY()
    }
  }

  onDragEnd(evt: PointerEvent, sceneCoord: ICoord) {
    const { ruler } = this.wbEditor

    if (this.isHorizontal && !this.visibleHor) {
      ruler.removeRuler(this.id)
    }

    if (this.isVertical && !this.visibleVer) {
      ruler.removeRuler(this.id)
    }
  }

  onDrawAfterEnd() {
    return false
  }
}
