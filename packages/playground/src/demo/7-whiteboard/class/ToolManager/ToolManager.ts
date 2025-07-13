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
import { isInnerRect } from 'rmst-charts/utils'

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

  currentTool: ToolEnumKey
  currentToolClass: ITool

  isPointerDown = false

  bindEvent() {
    const { wbEditor } = this
    const { container } = wbEditor

    let isInContainer = false

    document.onpointermove = moveEvt => {
      if (!this.isPointerDown) {
        this.currentToolClass?.onPointerMoveNotDragging?.(moveEvt, wbEditor.coordSys.client2Scene(moveEvt))
      }

      this.currentToolClass?.onPointerMove?.({
        moveEvt: moveEvt,
        sceneCoord: wbEditor.coordSys.client2Scene(moveEvt),
        isInContainer
      })
    }

    container.onpointerenter = () => {
      isInContainer = true
    }
    container.onpointerleave = () => {
      isInContainer = false
    }

    container.onpointerdown = downEvt => {
      this.isPointerDown = true
      if (downEvt.button !== Pointer_Button.Left) {
        console.warn('非左键操作')
        return
      }

      this.currentToolClass.onPointerDown?.(downEvt, wbEditor.coordSys.client2Scene(downEvt))

      startDrag(downEvt, {
        onDragStart: () => {
          this.currentToolClass.onDragStart(downEvt, wbEditor.coordSys.client2Scene(downEvt))
        },
        onDragMove: moveEvt => {
          this.currentToolClass.onDragMove(moveEvt, wbEditor.coordSys.client2Scene(moveEvt))
        },
        onDragEnd: upEvt => {
          this.isPointerDown = false

          this.currentToolClass.onDragEnd(upEvt, wbEditor.coordSys.client2Scene(upEvt))
          this.switchTool(ToolEnum.Select)
        },
        onPointerUp: upEvt => {
          this.isPointerDown = false

          this.currentToolClass.onPointerUp?.(upEvt, wbEditor.coordSys.client2Scene(upEvt))
          this.switchTool(ToolEnum.Select)
        }
      })
    }
  }

  async switchTool(tool: ToolEnumKey) {
    if (tool === this.currentTool) {
      return
    }

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
  }
}
