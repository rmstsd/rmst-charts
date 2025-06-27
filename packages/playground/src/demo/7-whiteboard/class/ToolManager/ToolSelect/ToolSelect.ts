import { ICoord, IShape } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from '../type'
import { ToolEnum } from '../constant'
import { Graph_Id } from '@/demo/7-whiteboard/constant'

import ToolBoxSelection from './ToolBoxSelection'
import ToolTranslate from './ToolTranslate'

export default class ToolSelect implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  currentStrategy: ITool // 平移 | 选装 | 缩放 | 框选

  downPos: ICoord

  onActive() {
    const { wbEditor } = this
    const stage_eventDispatcher = wbEditor.stage.eventDispatcher
    wbEditor.selectManager.enableHover()

    stage_eventDispatcher.onPointerEnter = evt => {
      const shape = evt.target
      if (!shape) {
        return
      }

      if (isWbGraphShape(shape)) {
        wbEditor.selectManager.onHover(shape.data.id, true)
      }
    }
    stage_eventDispatcher.onPointerLeave = evt => {
      const shape = evt.target
      if (!shape) {
        return
      }

      if (isWbGraphShape(shape)) {
        wbEditor.selectManager.onHover(shape.data.id, false)
      }
    }
  }

  onDeActive() {
    const { wbEditor } = this
    wbEditor.selectManager.disableHover()
    const stage_eventDispatcher = wbEditor.stage.eventDispatcher
    stage_eventDispatcher.onPointerEnter = null
    stage_eventDispatcher.onPointerLeave = null
  }

  onPointerDown(downEvt: PointerEvent) {
    const { wbEditor } = this
    const stage_eventDispatcher = wbEditor.stage.eventDispatcher

    const shape = stage_eventDispatcher.hovered

    this.currentStrategy = null

    if (!shape) {
      console.log('按在 空白处')

      wbEditor.selectManager.clearSelect()
      this.currentStrategy = new ToolBoxSelection(wbEditor)

      return
    }

    if (isWbGraphShape(shape)) {
      wbEditor.selectManager.select(shape.data.id)
      wbEditor.selectManager.onHover(shape.data.id, false)
      this.currentStrategy = new ToolTranslate(wbEditor)
    } else if (shape.data.id === Graph_Id.graph_ctrl_translate) {
      console.log('平移操作')

      this.currentStrategy = new ToolTranslate(wbEditor)
    }
  }

  onDragStart(downEvt: PointerEvent) {
    this.currentStrategy.onDragStart(downEvt)
  }

  onDragMove(moveEvt: PointerEvent) {
    this.currentStrategy.onDragMove(moveEvt)
  }

  onDragEnd(upEvt: PointerEvent) {
    this.currentStrategy.onDragEnd(upEvt)
  }
}

// 是绘制出来的图形
const isWbGraphShape = (shape: IShape) => {
  return ToolEnum.has(shape.data.extraData?.wbType)
}
