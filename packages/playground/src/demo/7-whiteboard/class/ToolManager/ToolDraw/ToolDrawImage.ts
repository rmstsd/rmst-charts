import { Box, getRectByTwoPoint, ICoord, RmstImage } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from '../type'
import { IGraph } from '../../../type'
import { uuid } from '@/utils'
import { ToolEnum } from '../constant'
import { showOpenFilePicker } from 'show-open-file-picker'
import { translate } from 'transformation-matrix'
import OpenColor from 'open-color'

export default class ToolDrawImage implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  downPos: ICoord
  graphItem = {} as IGraph

  async onActive() {
    this.wbEditor.selectManager.clearSelect()

    const [file] = await showOpenFilePicker({
      types: [{ description: 'Images', accept: { 'image/*': ['.png', '.jpeg', '.jpg'] } }],
      multiple: false
    })
    if (!file) {
      return
    }

    let url = URL.createObjectURL(await file.getFile())

    const { coordSys } = this.wbEditor
    const centerScene = coordSys.world2Scene(coordSys.centerWorld)

    const id = uuid()
    const graphShape = new Box({
      id,
      width: 100,
      height: 100,
      strokeStyle: OpenColor.gray[5],
      lineWidth: 1,
      cornerRadius: 4,
      mt: translate(centerScene.x, centerScene.y),
      children: [new RmstImage({ width: 100, height: 100, src: url })],
      extraData: {
        wbType: ToolEnum.Image
      }
    })

    this.graphItem = { id, graphShape: graphShape }
  }

  onPointerDown(downEvt: PointerEvent) {}

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.downPos = sceneCoord

    this.wbEditor.graphs.push(this.graphItem)

    this.wbEditor.graphLayer.append(this.graphItem.graphShape)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    const rect = getRectByTwoPoint(this.downPos, sceneCoord)

    this.graphItem.graphShape.attr({
      width: rect.width,
      height: rect.height,
      mt: translate(rect.x, rect.y)
    })
    ;(this.graphItem.graphShape as Box).children[0].attr({ width: rect.width, height: rect.height })
  }

  onDragEnd(upEvt: PointerEvent) {}
}
