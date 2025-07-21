import { isBoolean } from 'es-toolkit'
import WhiteboardEditor from '../../whiteboardEditor'
import { ToolEnum, ToolEnumKey } from './constant'
import { Pointer_Button } from 'rmst-render/constant'

import { startDrag } from '@/utils/util'
import { ITool } from './type'

import ToolSelect from './ToolSelect/ToolSelect'
import ToolDrawRect from './ToolDraw/ToolDrawRect'
import ToolDrawEllipse from './ToolDraw/ToolDrawEllipse'
import ToolDrawRhombus from './ToolDraw/ToolDrawRhombus'
import ToolDrawPencil from './ToolDraw/ToolDrawPencil'
import ToolDrawImage from './ToolDraw/ToolDrawImage'
import EventEmitter from 'rmst-render/event_emitter'

const ToolClassMap = {
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

  bindEvent() {
    const { wbEditor } = this
    const { container } = wbEditor

    let isPointerDown = false
    let isInWbCanvas = false

    const onPointerDown = (downEvt: PointerEvent) => {
      isPointerDown = true
      if (downEvt.button !== Pointer_Button.Left) {
        console.warn('非左键操作')
        return
      }

      this.currentToolClass.onPointerDown?.(downEvt, wbEditor.coordSys.client2Scene(downEvt))

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
          this.currentToolClass.onDragStart(downEvt, wbEditor.coordSys.client2Scene(downEvt))
        },
        onDragMove: moveEvt => {
          this.currentToolClass.onDragMove(moveEvt, wbEditor.coordSys.client2Scene(moveEvt))
        },
        onDragEnd: upEvt => {
          isPointerDown = false
          const exitCurrentTool = this.currentToolClass.onDragEnd(upEvt, wbEditor.coordSys.client2Scene(upEvt))
          drawWbGraphEnd(exitCurrentTool)
        },
        onPointerUp: upEvt => {
          isPointerDown = false
          const exitCurrentTool = this.currentToolClass.onPointerUp?.(upEvt, wbEditor.coordSys.client2Scene(upEvt))
          drawWbGraphEnd(exitCurrentTool)
        }
      })
    }

    const onPointerEnter = () => {
      isInWbCanvas = true
    }

    const onPointerLeave = () => {
      isInWbCanvas = false

      this.currentToolClass?.onPointerMoveNotDragging?.({ isInWbCanvas })
      this.currentToolClass?.onPointerMove?.({ isInWbCanvas })
    }

    const onDocumentPointerMove = (moveEvt: PointerEvent) => {
      const sceneCoord = wbEditor.coordSys.client2Scene(moveEvt)
      if (!isPointerDown) {
        this.currentToolClass?.onPointerMoveNotDragging?.({ moveEvt, sceneCoord, isInWbCanvas })
      }

      this.currentToolClass?.onPointerMove?.({ moveEvt, sceneCoord, isInWbCanvas })
    }

    container.addEventListener('pointerenter', onPointerEnter, { signal: this.abCt.signal })
    container.addEventListener('pointerleave', onPointerLeave, { signal: this.abCt.signal })
    container.addEventListener('pointerdown', onPointerDown, { signal: this.abCt.signal })
    container.addEventListener('pointermove', onDocumentPointerMove, { signal: this.abCt.signal })
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
    this.wbEditor.cursorManager.setCursor(this.currentToolClass.cursor || 'crosshair')
  }
}
