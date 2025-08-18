import { isBoolean } from 'es-toolkit'
import WhiteboardEditor from '../../whiteboardEditor'
import { ToolEnum, ToolEnumKey } from './constant'
import { Pointer_Button } from 'rmst-render/constant'

import { startDrag } from '@/utils/util'
import { ITool, PointerContext } from './type'

import ToolPan from './ToolPan'
import ToolSelect from './ToolSelect/ToolSelect'
import ToolDrawRect from './ToolDraw/ToolDrawRect'
import ToolDrawEllipse from './ToolDraw/ToolDrawEllipse'
import ToolDrawRhombus from './ToolDraw/ToolDrawRhombus'
import ToolDrawPencil from './ToolDraw/ToolDrawPencil'
import ToolDrawImage from './ToolDraw/ToolDrawImage'
import EventEmitter from 'rmst-render/event_emitter'
import { nextTick } from '@/utils'
import { ToolRuler } from './ToolRuler'
import { findHover_v2 } from 'rmst-render/_stage/findHover'
import { Graph_Id, isRulerLineHorizontal, isRulerLineVertical, rulerZoneIds } from '../../constant'

const ToolClassMap = {
  [ToolEnum.Pan]: ToolPan,
  [ToolEnum.Select]: ToolSelect,
  [ToolEnum.Rect]: ToolDrawRect,
  [ToolEnum.Ellipse]: ToolDrawEllipse,
  [ToolEnum.Rhombus]: ToolDrawRhombus,
  [ToolEnum.Pencil]: ToolDrawPencil,
  [ToolEnum.Image]: ToolDrawImage
}

type Events = {
  switchToolChange: (tool: ToolEnumKey) => void
}

export default class ToolManager {
  constructor(private wbEditor: WhiteboardEditor) {}

  private abCt = new AbortController()

  eventEmitter = new EventEmitter<Events>()

  currentTool: ToolEnumKey
  currentToolClass: ITool

  toolTempPan: ToolPan // 临时的 pan, 用于按下空格
  toolRuler: ToolRuler

  pointerContext: PointerContext = {} as any

  bindEvent() {
    const { wbEditor } = this
    const { container, keyboard } = wbEditor

    this.toolRuler = new ToolRuler(this.wbEditor)

    keyboard.onSpaceToggle = isSpaceKeyPressing => {
      if (isPointerDown) {
        this.currentToolClass?.onSpaceToggle?.(isSpaceKeyPressing)

        return
      }

      if (this.currentTool !== ToolEnum.Pan) {
        if (isSpaceKeyPressing) {
          this.toolTempPan = new ToolPan(this.wbEditor)
          this.wbEditor.cursorManager.setCursor(this.toolTempPan.cursor)

          this.wbEditor.selectManager.clearHover()
        } else {
          if (isPointerDown) {
          } else {
            this.toolTempPan = null
            this.wbEditor.cursorManager.setCursor(this.currentToolClass.cursor)
          }
        }
      }
    }

    keyboard.onShiftToggle = isShiftKeyPressing => {
      this.currentToolClass?.onShiftToggle?.(isShiftKeyPressing)
    }
    keyboard.onAltToggle = isAltKeyPressing => {
      this.currentToolClass?.onAltToggle?.(isAltKeyPressing)
    }

    let isPointerDown = false

    const onPointerDown = async (downEvt: PointerEvent) => {
      await nextTick() // 让输入框能触发 blur 事件

      if (downEvt.button !== Pointer_Button.Left) {
        console.warn('非左键操作')
        return
      }

      isPointerDown = true

      const hovered = this.findHover()
      this.pointerContext.hovered = hovered
      const handleInfo = this.handleInfo()

      let finalToolClass
      if (keyboard.isSpaceKeyPressing && this.toolTempPan) {
        finalToolClass = this.toolTempPan
      } else if (handleInfo) {
        this.toolRuler.setRuler({ handleInfo, id: hovered?.id })
        finalToolClass = this.toolRuler
      } else {
        finalToolClass = this.currentToolClass
      }

      finalToolClass.onPointerDown?.(downEvt, wbEditor.coordSys.client2Scene(downEvt))

      const drawWbGraphEnd = (exitCurrentTool: boolean | void) => {
        if (isBoolean(exitCurrentTool)) {
          if (exitCurrentTool) {
            this.switchTool(ToolEnum.Select)
          }
        } else {
          this.switchTool(ToolEnum.Select)
        }
      }

      startDrag(downEvt, {
        onDragStart: () => {
          finalToolClass.onDragStart(downEvt, wbEditor.coordSys.client2Scene(downEvt))
        },
        onDragMove: moveEvt => {
          finalToolClass.onDragMove(moveEvt, wbEditor.coordSys.client2Scene(moveEvt))
        },
        onDragEnd: upEvt => {
          isPointerDown = false
          finalToolClass.onDragEnd(upEvt, wbEditor.coordSys.client2Scene(upEvt))

          const exitCurrentTool = finalToolClass.onDrawAfterEnd?.()
          drawWbGraphEnd(exitCurrentTool)
        },
        onPointerUp: upEvt => {
          isPointerDown = false
          finalToolClass.onPointerUp?.(upEvt, wbEditor.coordSys.client2Scene(upEvt))

          const exitCurrentTool = finalToolClass.onDrawAfterEnd?.()
          drawWbGraphEnd(exitCurrentTool)
        }
      })
    }

    const onPointerEnter = () => {
      this.pointerContext.isInWbCanvas = true
    }

    const onPointerLeave = () => {
      this.pointerContext.isInWbCanvas = false

      this.currentToolClass?.onPointerMoveNotDragging?.(this.pointerContext)
      this.currentToolClass?.onPointerMove?.(this.pointerContext)
    }

    const onPointerMove = (moveEvt: PointerEvent) => {
      const sceneCoord = wbEditor.coordSys.client2Scene(moveEvt)
      this.pointerContext.moveEvt = moveEvt
      this.pointerContext.sceneCoord = sceneCoord
      this.pointerContext.hovered = this.findHover()

      if (!isPointerDown && !keyboard.isSpaceKeyPressing) {
        this.onPointerMoveNotDragging()
      }

      this.currentToolClass?.onPointerMove?.(this.pointerContext)
    }

    container.addEventListener('pointerenter', onPointerEnter, { signal: this.abCt.signal })
    container.addEventListener('pointerleave', onPointerLeave, { signal: this.abCt.signal })
    container.addEventListener('pointerdown', onPointerDown, { signal: this.abCt.signal })
    container.addEventListener('pointermove', onPointerMove, { signal: this.abCt.signal })
  }

  dispose() {
    this.abCt.abort()
  }

  async switchTool(tool: ToolEnumKey) {
    if (tool === this.currentTool) {
      return
    }

    this.eventEmitter.emit('switchToolChange', tool)

    const prevToolClass = this.currentToolClass
    if (prevToolClass) {
      prevToolClass.onDeActive?.()
    }

    this.currentTool = tool
    this.currentToolClass = new ToolClassMap[tool](this.wbEditor)

    if (this.currentToolClass.enableActive) {
      const enableSuccess = await this.currentToolClass.enableActive?.()
      if (!enableSuccess) {
        this.switchTool(ToolEnum.Select)
        return
      }
    }

    this.currentToolClass.onActive?.()
    this.wbEditor.cursorManager.setCursor(this.currentToolClass.cursor)
  }

  findHover() {
    const { wbEditor } = this
    const worldPoint = wbEditor.coordSys.client2World(this.pointerContext.moveEvt, true)
    const hovered = findHover_v2(wbEditor.stage, worldPoint.x, worldPoint.y)

    return hovered
  }

  onPointerMoveNotDragging() {
    const { wbEditor } = this
    const { hovered, isInWbCanvas } = this.pointerContext

    if (!isInWbCanvas) {
      return
    }

    if (!hovered) {
      wbEditor.cursorManager.setCursor(this.currentToolClass.cursor)
      wbEditor.selectManager.clearHover()
      return
    }

    const handleInfo = this.handleInfo()

    if (handleInfo) {
      this.wbEditor.cursorManager.setCursor(handleInfo.cursor)
      return
    }

    this.currentToolClass?.onPointerMoveNotDragging?.(this.pointerContext)
  }

  // todo  优化 handle 的拾取
  handleInfo(): { handleName: string; cursor: any } {
    const { wbEditor } = this
    const { hovered } = this.pointerContext
    if (!hovered) {
      return null
    }

    const isHorRedLine = isRulerLineHorizontal(hovered)
    const isVerRedLine = isRulerLineVertical(hovered)

    const isHitRulerRedLine = this.currentTool === ToolEnum.Select

    if (rulerZoneIds.includes(hovered.id) || isHorRedLine || isVerRedLine) {
      wbEditor.selectManager.clearHover()

      if (isHitRulerRedLine && isHorRedLine) {
        return { handleName: 'ruler_red_line_horizontal', cursor: ToolRuler.Cursor_Horizontal }
      }
      if (isHitRulerRedLine && isVerRedLine) {
        return { handleName: 'ruler_red_line_vertical', cursor: ToolRuler.Cursor_Vertical }
      }

      if (hovered.id === Graph_Id.ruler_zone_horizontal) {
        return { handleName: 'ruler_zone_horizontal', cursor: ToolRuler.Cursor_Horizontal }
      }

      if (hovered.id === Graph_Id.ruler_zone_vertical) {
        return { handleName: 'ruler_zone_vertical', cursor: ToolRuler.Cursor_Vertical }
      }

      if (hovered.id === Graph_Id.ruler_zone_both) {
        return { handleName: '', cursor: 'default' }
      }
    }

    return null
  }
}
