import { ICoord } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from '../type'
import { Graph_Id, isCtrlHandleShape, isWbGraphShape } from '@/demo/7-whiteboard/constant'
import ToolBoxSelection from './ToolBoxSelection'
import ToolTranslate from './ToolTranslate'
import ToolRotate from './ToolRotate'
import ToolScale from './ToolScale'
import { isFunction } from 'es-toolkit'
import { getCursorRotation, WbCursor } from '../../cursorManager'

export default class ToolSelect implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  cursor?: WbCursor = { type: 'select' }

  currentStrategy: ITool // 平移 | 缩放 | 旋转 | 框选
  currentStrategyDispose

  currentHoverStrategyTypeId

  onActive() {}

  onDeActive() {}

  onPointerMoveNotDragging({ hovered, isInWbCanvas }) {
    const { wbEditor } = this

    if (!isInWbCanvas) {
      this.currentHoverStrategyTypeId = null

      wbEditor.selectManager.clearHover()
      wbEditor.cursorManager.setCursor(this.cursor)
      return
    }

    const isCtrlHandle = isCtrlHandleShape(hovered)
    const isWbGraph = isWbGraphShape(hovered)

    if (isCtrlHandle) {
      wbEditor.selectManager.clearHover()

      const downRect = wbEditor.selectManager.transformRect
      const cursorType = hovered.data.extraData?.cursorType

      switch (hovered.data.id) {
        case Graph_Id.graph_ctrl_translate: {
          this.currentHoverStrategyTypeId = Graph_Id.graph_ctrl_translate
          this.updateCursor_Select_Or_Duplicate()
          break
        }
        case Graph_Id.graph_ctrl_rotate: {
          this.currentHoverStrategyTypeId = Graph_Id.graph_ctrl_rotate
          const rotation = getCursorRotation('rotation', cursorType, downRect.mt)
          wbEditor.cursorManager.setCursor({ type: 'rotation', rotation })
          break
        }
        case Graph_Id.graph_ctrl_scale: {
          this.currentHoverStrategyTypeId = Graph_Id.graph_ctrl_scale
          const rotation = getCursorRotation('resize', cursorType, downRect.mt)
          wbEditor.cursorManager.setCursor({ type: 'resize', rotation })
          break
        }

        default: {
          console.error('未匹配')
          break
        }
      }
    } else if (isWbGraph) {
      this.currentHoverStrategyTypeId = Graph_Id.graph_ctrl_translate
      wbEditor.selectManager.onHover(hovered.data.id, true)

      this.updateCursor_Select_Or_Duplicate()
    }
  }

  onPointerDown(downEvt: PointerEvent) {
    const { wbEditor } = this
    const hovered = wbEditor.toolManager.pointerContext.hovered

    if (!hovered) {
      // 按在空白处 -> 框选

      wbEditor.selectManager.clearSelect()
      this.currentStrategy = new ToolBoxSelection(wbEditor)

      wbEditor.triggerRender()
    } else {
      if (isWbGraphShape(hovered)) {
        wbEditor.selectManager.clearHover()
        wbEditor.selectManager.select(hovered.data.id)

        this.currentStrategy = new ToolTranslate(wbEditor)

        wbEditor.triggerRender()
      } else if (hovered.data.id === Graph_Id.graph_ctrl_translate) {
        this.currentStrategy = new ToolTranslate(wbEditor)
      } else if (hovered.data.id === Graph_Id.graph_ctrl_rotate) {
        this.currentStrategy = new ToolRotate(wbEditor, hovered.data.extraData?.cursorType)
      } else if (hovered.data.id === Graph_Id.graph_ctrl_scale) {
        const { transformOrigin, cursorType } = hovered.data.extraData
        this.currentStrategy = new ToolScale(wbEditor, transformOrigin, cursorType)
      }
    }

    if (this.currentStrategy) {
      this.currentStrategyDispose = this.currentStrategy.onActive?.()
    }
  }

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.currentStrategy?.onDragStart(downEvt, sceneCoord)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    this.currentStrategy?.onDragMove(moveEvt, sceneCoord)
  }

  onDragEnd(upEvt: PointerEvent, sceneCoord: ICoord) {
    this.currentStrategy?.onDragEnd(upEvt, sceneCoord)
    this.disposePrev()
    this.currentStrategy = null
  }

  onPointerUp() {
    this.disposePrev()
    this.currentStrategy = null
  }

  onShiftToggle(isShiftKeyPressing: boolean) {
    this.currentStrategy?.onShiftToggle?.(isShiftKeyPressing)
  }

  onSpaceToggle(isSpaceKeyPressing: boolean) {
    this.currentStrategy?.onSpaceToggle?.(isSpaceKeyPressing)
  }

  onAltToggle(isAltKeyPressing: boolean) {
    this.currentStrategy?.onAltToggle?.(isAltKeyPressing)

    const { hovered } = this.wbEditor.toolManager.pointerContext
    const isDuplicate = isWbGraphShape(hovered) || hovered?.id === Graph_Id.graph_ctrl_translate
    if (isDuplicate) {
      this.updateCursor_Select_Or_Duplicate()
    }
  }

  private updateCursor_Select_Or_Duplicate() {
    // 如果鼠标按下了, 则应该由策略模式内部处理, 而不是在这里处理
    if (this.wbEditor.toolManager.pointerContext.isPointerDown) {
      return
    }

    const cursor = this.wbEditor.keyboard.isAltKeyPressing ? { type: 'duplicate' as const } : this.cursor
    this.wbEditor.cursorManager.setCursor(cursor)
  }

  private disposePrev() {
    const prev = this.currentStrategy
    if (prev) {
      prev.onDeActive?.()
    }

    if (isFunction(this.currentStrategyDispose)) {
      this.currentStrategyDispose()
    }
  }
}
