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
import ToolDrawImage from './ToolDraw/ToolDrawImage'

const ToolClassMap = {
  [ToolEnum.Select]: ToolSelect,
  [ToolEnum.Rect]: ToolDrawRect,
  [ToolEnum.Ellipse]: ToolDrawEllipse,
  [ToolEnum.Rhombus]: ToolDrawRhombus,
  [ToolEnum.Pencil]: ToolDrawPencil,
  [ToolEnum.Image]: ToolDrawImage
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

      this.currentToolClass.onPointerDown?.(downEvt, wbEditor.coordSys.client2Scene(downEvt))

      startDrag(downEvt, {
        start: () => {
          this.currentToolClass.onDragStart(downEvt, wbEditor.coordSys.client2Scene(downEvt))
        },
        onMove: moveEvt => {
          this.currentToolClass.onDragMove(moveEvt, wbEditor.coordSys.client2Scene(moveEvt))
        },
        onUp: upEvt => {
          this.currentToolClass.onDragEnd(upEvt, wbEditor.coordSys.client2Scene(upEvt))
          this.switchTool(ToolEnum.Select)
        }
      })
    }
  }

  async switchTool(tool: ToolEnumKey) {
    const prevToolClass = this.currentToolClass
    if (prevToolClass) {
      prevToolClass.onDeActive?.()
    }

    this.currentTool = tool
    this.currentToolClass = new ToolClassMap[tool](this.wbEditor)
    this.currentToolClass.onActive?.()
  }
}
