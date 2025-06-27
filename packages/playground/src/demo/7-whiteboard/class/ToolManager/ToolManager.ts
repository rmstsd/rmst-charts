import { makeAutoObservable } from 'mobx'
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

const ToolClassMap = {
  [ToolEnum.Select]: ToolSelect,
  [ToolEnum.Rect]: ToolDrawRect,
  [ToolEnum.Ellipse]: ToolDrawEllipse,
  [ToolEnum.Rhombus]: ToolDrawRhombus,
  [ToolEnum.Pencil]: ToolDrawPencil
}

export default class ToolManager {
  constructor(private wbEditor: WhiteboardEditor) {
    makeAutoObservable(this)
  }

  currentTool: ToolEnumKey = ToolEnum.Select
  currentToolClass: ITool

  bindEvent() {
    const { wbEditor } = this
    const { container } = wbEditor

    container.onpointerdown = downEvt => {
      if (downEvt.button !== Pointer_Button.Left) {
        console.warn('非左键操作')
        return
      }

      this.currentToolClass.onPointerDown?.(downEvt)

      startDrag(downEvt, {
        start: () => {
          this.currentToolClass.onDragStart(downEvt)
        },
        onMove: moveEvt => {
          this.currentToolClass.onDragMove(moveEvt)
        },
        end: upEvt => {
          this.currentToolClass.onDragEnd(upEvt)
          this.switchTool(ToolEnum.Select)
        }
      })
    }
  }

  switchTool(tool: ToolEnumKey) {
    const prevToolClass = this.currentToolClass
    if (prevToolClass) {
      prevToolClass.onDeActive?.()
    }

    this.currentTool = tool
    this.currentToolClass = new ToolClassMap[tool](this.wbEditor)
    this.currentToolClass.onActive?.()
  }
}
