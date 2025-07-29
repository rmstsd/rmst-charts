import { ICoord } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from '../type'
import { Graph_Id, isCtrlHandleShape, isWbGraphShape } from '@/demo/7-whiteboard/constant'
import ToolBoxSelection from './ToolBoxSelection'
import ToolTranslate from './ToolTranslate'
import ToolRotate from './ToolRotate'
import ToolScale from './ToolScale'
import { isFunction } from 'es-toolkit'
import { duplicateCursor, getCursorRotation, WbCursor } from '../../cursorManager'
import { findHover_v2 } from 'rmst-render/_stage/findHover'

export default class ToolSelect implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  cursor?: WbCursor = { type: 'select' }

  currentStrategy: ITool // 平移 | 缩放 | 旋转 | 框选
  currentStrategyDispose

  isPointerDown = false

  onActive() {
    const { wbEditor } = this
    wbEditor.selectManager.enableHover()
  }

  onDeActive() {
    const { wbEditor } = this
    wbEditor.selectManager.disableHover()
  }

  onPointerMoveNotDragging({ moveEvt, isInWbCanvas }) {
    const { wbEditor } = this

    if (!isInWbCanvas) {
      wbEditor.selectManager.onHover(null, false)
      wbEditor.cursorManager.setCursor(this.cursor)
      return
    }

    const worldPoint = wbEditor.coordSys.client2World(moveEvt)
    const hovered = findHover_v2(wbEditor.stage, worldPoint.x, worldPoint.y)

    if (!hovered) {
      wbEditor.selectManager.onHover(null, false)
      wbEditor.cursorManager.setCursor(this.cursor)
      return
    }

    const isCtrlHandle = isCtrlHandleShape(hovered)
    const isWbGraph = isWbGraphShape(hovered)

    if (isCtrlHandle) {
      wbEditor.selectManager.onHover(null, false)

      const downRect = wbEditor.selectManager.transformRect
      const cursorType = hovered.data.extraData?.cursorType

      switch (hovered.data.id) {
        case Graph_Id.graph_ctrl_translate: {
          this.updateCursor_Select_Or_Duplicate()
          break
        }
        case Graph_Id.graph_ctrl_rotate: {
          const rotation = getCursorRotation('rotation', cursorType, downRect.mt)
          wbEditor.cursorManager.setCursor({ type: 'rotation', rotation })
          break
        }
        case Graph_Id.graph_ctrl_scale: {
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
      wbEditor.selectManager.onHover(hovered.data.id, true)

      this.updateCursor_Select_Or_Duplicate()
    } else {
      // 标尺
      wbEditor.selectManager.onHover(null, false)
      wbEditor.cursorManager.setCursor(this.cursor)
    }
  }

  onPointerDown(downEvt: PointerEvent) {
    this.isPointerDown = true

    const { wbEditor } = this

    const stage_eventDispatcher = wbEditor.stage.eventDispatcher
    const hovered = stage_eventDispatcher.hovered

    if (!hovered) {
      console.log('按在 空白处')

      wbEditor.selectManager.clearSelect()
      this.currentStrategy = new ToolBoxSelection(wbEditor)

      wbEditor.triggerRender()
    } else {
      if (isWbGraphShape(hovered)) {
        wbEditor.selectManager.onHover(hovered.data.id, false)
        wbEditor.selectManager.select(hovered.data.id)

        this.currentStrategy = new ToolTranslate(wbEditor)

        wbEditor.triggerRender()
      } else if (hovered.data.id === Graph_Id.graph_ctrl_translate) {
        console.log('平移操作')

        this.currentStrategy = new ToolTranslate(wbEditor)
      } else if (hovered.data.id === Graph_Id.graph_ctrl_rotate) {
        console.log('旋转操作')

        this.currentStrategy = new ToolRotate(wbEditor, hovered.data.extraData?.cursorType)
      } else if (hovered.data.id === Graph_Id.graph_ctrl_scale) {
        console.log('缩放操作')

        const { transformOrigin, cursorType } = hovered.data.extraData
        this.currentStrategy = new ToolScale(wbEditor, transformOrigin, cursorType)
      }
    }

    if (this.currentStrategy) {
      this.currentStrategyDispose = this.currentStrategy.onActive?.()
    }
  }

  onPointerUp() {
    console.log('onPointerUp')

    this.isPointerDown = false
    this.disposePrev()
    this.currentStrategy = null
  }

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.wbEditor.selectManager.disableHover()

    this.currentStrategy?.onDragStart(downEvt, sceneCoord)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    this.currentStrategy?.onDragMove(moveEvt, sceneCoord)
  }

  onDragEnd(upEvt: PointerEvent, sceneCoord: ICoord) {
    this.isPointerDown = false

    this.currentStrategy?.onDragEnd(upEvt, sceneCoord)
    this.currentStrategy = null
    this.disposePrev()

    this.wbEditor.selectManager.enableHover()
  }

  onShiftToggle(isShiftKeyPressing: boolean) {
    this.currentStrategy?.onShiftToggle(isShiftKeyPressing)
  }

  onAltToggle(isAltPressing: boolean) {
    this.currentStrategy?.onAltToggle(isAltPressing)

    this.updateCursor_Select_Or_Duplicate()
  }

  private updateCursor_Select_Or_Duplicate() {
    const cursor = this.wbEditor.keyboard.isAltPressing ? duplicateCursor : this.cursor
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
