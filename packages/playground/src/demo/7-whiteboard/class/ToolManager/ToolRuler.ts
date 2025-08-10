import { ICoord, uuid } from 'rmst-render'
import { Graph_Id } from '../../constant'
import WhiteboardEditor from '../../whiteboardEditor'
import { ITool } from './type'
import { rulerRemoveCursor } from '../cursorManager'

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

  setRuler({ isRulerZone, zone, line }) {
    this.isRulerZone = isRulerZone

    this.id = line.id

    this.isHorizontal = zone.id === Graph_Id.ruler_zone_horizontal || line.isHor
    this.isVertical = zone.id === Graph_Id.ruler_zone_vertical || line.isVer
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
      this.wbEditor.ruler.updateRuler('horizontal', this.id, sceneCoord.y, visibleHor)
    }
    const updateY = () => {
      this.wbEditor.ruler.updateRuler('vertical', this.id, sceneCoord.x, visibleVer)
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
