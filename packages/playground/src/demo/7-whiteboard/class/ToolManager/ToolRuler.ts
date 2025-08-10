import { ICoord, uuid } from 'rmst-render'
import { Graph_Id } from '../../constant'
import WhiteboardEditor from '../../whiteboardEditor'
import { ITool } from './type'
import { rulerRemoveCursor } from '../cursorManager'

export class ToolRuler implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  static Cursor_Horizontal = 'ns-resize'
  static Cursor_Vertical = 'ew-resize'

  private isX: boolean
  private isY: boolean

  private x_id: string
  private y_id: string

  private isRulerZone: boolean
  private line

  private visibleHor: boolean
  private visibleVer: boolean

  setRuler({ isRulerZone, zone, line }) {
    this.isRulerZone = isRulerZone
    if (isRulerZone) {
      this.isX = zone.id === Graph_Id.ruler_zone_horizontal
      this.isY = zone.id === Graph_Id.ruler_zone_vertical
    } else {
      this.line = line

      line.id
      line.isHor
      line.isVer
    }
  }

  onDragStart(evt: PointerEvent, sceneCoord: ICoord) {
    if (this.isRulerZone) {
      const addX = () => {
        this.x_id = uuid()
        this.wbEditor.ruler.addRuler('horizontal', this.x_id, sceneCoord.y)
      }

      const addY = () => {
        this.y_id = uuid()
        this.wbEditor.ruler.addRuler('vertical', this.y_id, sceneCoord.x)
      }

      if (this.isX) {
        addX()
      } else if (this.isY) {
        addY()
      } else {
        addX()
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

    if (!visibleHor || !visibleVer) {
      cursor = rulerRemoveCursor
    } else {
      cursor = this.isX || this.line?.isHor ? ToolRuler.Cursor_Horizontal : ToolRuler.Cursor_Vertical
    }

    this.wbEditor.cursorManager.setCursor(cursor)

    if (this.isRulerZone) {
      const updateX = () => {
        this.wbEditor.ruler.updateRuler('horizontal', this.x_id, sceneCoord.y, visibleHor)
      }
      const updateY = () => {
        this.wbEditor.ruler.updateRuler('vertical', this.y_id, sceneCoord.x, visibleVer)
      }

      if (this.isX) {
        updateX()
      } else if (this.isY) {
        updateY()
      }
    } else {
      const updateX = () => {
        this.wbEditor.ruler.updateRuler('horizontal', this.line.id, sceneCoord.y, visibleHor)
      }
      const updateY = () => {
        this.wbEditor.ruler.updateRuler('vertical', this.line.id, sceneCoord.x, visibleVer)
      }

      if (this.line.isHor) {
        updateX()
      } else if (this.line.isVer) {
        updateY()
      }
    }
  }

  onDragEnd(evt: PointerEvent, sceneCoord: ICoord) {
    const { ruler } = this.wbEditor

    if (!this.visibleHor) {
      ruler.removeRuler(this.x_id)
      ruler.removeRuler(this.line.id)
    }

    if (!this.visibleVer) {
      ruler.removeRuler(this.y_id)
      ruler.removeRuler(this.line.id)
    }
  }

  onDrawAfterEnd() {
    return false
  }
}
