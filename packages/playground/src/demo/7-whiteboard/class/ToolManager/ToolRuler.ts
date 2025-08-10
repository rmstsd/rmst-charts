import { ICoord, uuid } from 'rmst-render'
import { Graph_Id } from '../../constant'
import WhiteboardEditor from '../../whiteboardEditor'
import { ITool } from './type'
import { rulerRemoveCursor } from '../cursorManager'

export class ToolRuler implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  private isX: boolean
  private isY: boolean
  private isBoth: boolean

  private x_id: string
  private y_id: string

  private isRulerZone: boolean
  private line

  setRuler({ isRulerZone, zone, line }) {
    this.isRulerZone = isRulerZone
    if (isRulerZone) {
      this.isX = zone.id === Graph_Id.ruler_zone_horizontal
      this.isY = zone.id === Graph_Id.ruler_zone_vertical
      this.isBoth = zone.id === Graph_Id.ruler_zone_both
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
    // this.wbEditor.cursorManager.setCursor(rulerRemoveCursor)

    if (this.isRulerZone) {
      const updateX = () => {
        this.wbEditor.ruler.updateRuler('horizontal', this.x_id, sceneCoord.y)
      }
      const updateY = () => {
        this.wbEditor.ruler.updateRuler('vertical', this.y_id, sceneCoord.x)
      }

      if (this.isX) {
        updateX()
      } else if (this.isY) {
        updateY()
      }
    } else {
      const updateX = () => {
        this.wbEditor.ruler.updateRuler('horizontal', this.line.id, sceneCoord.y)
      }
      const updateY = () => {
        this.wbEditor.ruler.updateRuler('vertical', this.line.id, sceneCoord.x)
      }

      if (this.line.isHor) {
        updateX()
      } else if (this.line.isVer) {
        updateY()
      }
    }
  }

  onDragEnd(evt: PointerEvent, sceneCoord: ICoord) {}

  onDrawAfterEnd() {
    return false
  }
}
