import { ICoord, IShape } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from '../type'
import { ToolEnum } from '../constant'
import { Graph_Id } from '@/demo/7-whiteboard/constant'

import ToolBoxSelection from './ToolBoxSelection'
import ToolTranslate from './ToolTranslate'
import ToolRotate from './ToolRotate'
import ToolScale from './ToolScale'

export default class ToolSelect implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  currentStrategy: ITool // 平移 | 缩放 | 旋转 | 框选

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

    this.currentStrategy = null

    const stage_eventDispatcher = wbEditor.stage.eventDispatcher
    const hoveredShape = stage_eventDispatcher.hovered

    if (!hoveredShape) {
      console.log('按在 空白处')

      wbEditor.selectManager.clearSelect()
      this.currentStrategy = new ToolBoxSelection(wbEditor)

      wbEditor.triggerRender()
      return
    }

    if (isWbGraphShape(hoveredShape)) {
      wbEditor.selectManager.onHover(hoveredShape.data.id, false)
      wbEditor.selectManager.select(hoveredShape.data.id)

      this.currentStrategy = new ToolTranslate(wbEditor)

      wbEditor.triggerRender()
    } else if (hoveredShape.data.id === Graph_Id.graph_ctrl_translate) {
      console.log('平移操作')

      this.currentStrategy = new ToolTranslate(wbEditor)
    } else if (hoveredShape.data.id === Graph_Id.graph_ctrl_rotate) {
      console.log('旋转操作')

      this.currentStrategy = new ToolRotate(wbEditor)
    } else if (hoveredShape.data.id === Graph_Id.graph_ctrl_scale) {
      console.log('缩放操作')

      this.currentStrategy = new ToolScale(wbEditor, hoveredShape.data.extraData?.transformOrigin)
    }
  }

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.wbEditor.selectManager.disableHover()

    this.currentStrategy.onDragStart(downEvt, sceneCoord)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    this.currentStrategy.onDragMove(moveEvt, sceneCoord)
  }

  onDragEnd(upEvt: PointerEvent, sceneCoord: ICoord) {
    this.currentStrategy.onDragEnd(upEvt, sceneCoord)

    this.wbEditor.selectManager.enableHover()
  }
}

// 是用户绘制出来的图形
const isWbGraphShape = (shape: IShape) => {
  return ToolEnum.has(shape.data.extraData?.wbType)
}
