import { ICoord, IShape } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from '../type'
import { ToolEnum } from '../constant'
import { Graph_Id } from '@/demo/7-whiteboard/constant'
import ToolBoxSelection from './ToolBoxSelection'
import ToolTranslate from './ToolTranslate'
import ToolRotate from './ToolRotate'
import ToolScale from './ToolScale'
import { isFunction } from 'es-toolkit'
import { getCursorRotation } from '../../cursorManager'
import { findHover_v2 } from 'rmst-render/_stage/findHover'

export default class ToolSelect implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

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

  hoveredId: string

  onPointerMoveNotDragging(moveEvt: PointerEvent) {
    const { wbEditor } = this
    const hovered = findHover_v2(wbEditor.stage, moveEvt.offsetX, moveEvt.offsetY)

    if (!hovered) {
      wbEditor.selectManager.onHover(null, false)
      wbEditor.cursorManager.setCursor('default')
      this.hoveredId = null
      return
    }
    // if (this.hoveredId === hovered.data.id) {
    //   return
    // }
    this.hoveredId = hovered.data.id

    if (hovered.data.id === Graph_Id.graph_ctrl_translate) {
      wbEditor.cursorManager.setCursor('default')
      return
    }

    if (hovered.data.id === Graph_Id.graph_ctrl_rotate) {
      const { downRect } = wbEditor.selectManager.transformDownRect
      const cursorType = hovered.data.extraData?.cursorType

      const rotation = getCursorRotation('rotation', cursorType, downRect.mt)
      wbEditor.cursorManager.setCursor({ type: 'rotation', rotation })
      return
    }
    if (hovered.data.id === Graph_Id.graph_ctrl_scale) {
      const { downRect } = wbEditor.selectManager.transformDownRect

      const cursorType = hovered.data.extraData?.cursorType

      const rotation = getCursorRotation('resize', cursorType, downRect.mt)
      wbEditor.cursorManager.setCursor({ type: 'resize', rotation })
      return
    }

    if (isWbGraphShape(hovered)) {
      wbEditor.selectManager.onHover(hovered.data.id, true)
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

    this.currentStrategyDispose = this.currentStrategy.onActive?.()
  }

  onPointerUp() {
    console.log('onPointerUp')
    this.isPointerDown = false
    this.disposePrev()

    this.currentStrategy = null
  }

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.wbEditor.selectManager.disableHover()

    this.currentStrategy.onDragStart(downEvt, sceneCoord)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    this.currentStrategy.onDragMove(moveEvt, sceneCoord)
  }

  onDragEnd(upEvt: PointerEvent, sceneCoord: ICoord) {
    this.isPointerDown = false

    this.currentStrategy.onDragEnd(upEvt, sceneCoord)

    this.wbEditor.selectManager.enableHover()

    this.disposePrev()
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

// 是用户绘制出来的图形
const isWbGraphShape = (shape: IShape) => {
  return ToolEnum.has(shape.data.extraData?.wbType)
}
