import { makeAutoObservable } from 'mobx'
import { showOpenFilePicker } from 'show-open-file-picker'
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
import { Box, RmstImage } from 'rmst-render'
import { uuid } from '@/utils'

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
        onUp: upEvt => {
          this.currentToolClass.onDragEnd(upEvt)
          this.switchTool(ToolEnum.Select)
        }
      })
    }
  }

  async switchTool(tool: ToolEnumKey) {
    if (tool === ToolEnum.Image) {
      const [file] = await showOpenFilePicker({
        types: [{ description: 'Images', accept: { 'image/*': ['.png', '.jpeg', '.jpg'] } }],
        multiple: false
      })
      if (!file) {
        return
      }

      let url = URL.createObjectURL(await file.getFile())
      console.log(url)

      const { coordSys } = this.wbEditor
      const centerScene = coordSys.world2Scene(coordSys.centerWorld)

      const graphShape = new Box({
        x: centerScene.x,
        y: centerScene.y,
        width: 100,
        height: 100,
        strokeStyle: 'red',
        lineWidth: 4,
        cornerRadius: 10,
        children: [new RmstImage({ width: 100, height: 100, src: url })]
      })

      const graphItem = {
        id: uuid(),
        name: ToolEnum.label(ToolEnum.Image),
        graphShape: graphShape,
        extraData: {
          wbType: ToolEnum.Image
        }
      }
      this.wbEditor.graphs.push(graphItem)

      this.wbEditor.graphLayer.append(graphItem.graphShape)

      return
    }

    const prevToolClass = this.currentToolClass
    if (prevToolClass) {
      prevToolClass.onDeActive?.()
    }

    this.currentTool = tool
    this.currentToolClass = new ToolClassMap[tool](this.wbEditor)
    this.currentToolClass.onActive?.()
  }
}
