import { getRectByTwoPoint, ICoord, RmstImage } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from '../type'
import { IGraph } from '../../../type'
import { uuid } from '@/utils'
import { ToolEnum } from '../constant'
import { showOpenFilePicker } from 'show-open-file-picker'
import { applyToPoint, translate } from 'transformation-matrix'
import OpenColor from 'open-color'

export default class ToolDrawImage implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  downPos: ICoord
  graphItem = {} as IGraph

  url = ''

  private previewedImage = new RmstImage({
    width: 100,
    height: 100,
    src: '',
    mt: translate(0, 0),
    opacity: 0,
    pointerEvents: 'none'
  })

  async enableActive() {
    const [file] = await showOpenFilePicker({
      types: [{ description: 'Images', accept: { 'image/*': ['.png', '.jpeg', '.jpg'] } }],
      multiple: false
    }).catch(err => {
      return []
    })

    if (!file) {
      return false
    }

    this.url = URL.createObjectURL(await file.getFile())
    this.previewedImage.attr({ src: this.url })

    return true
  }

  async onActive() {
    this.wbEditor.selectManager.clearSelect()
    this.wbEditor.stage.append(this.previewedImage)

    const { coordSys } = this.wbEditor
    const centerScene = coordSys.world2Scene(coordSys.centerWorld)

    const id = uuid()
    const graphShape = new RmstImage({
      id,
      width: 100,
      height: 100,
      strokeStyle: OpenColor.gray[5],
      lineWidth: 1,
      cornerRadius: 4,
      src: this.url,
      objectFit: 'cover',
      mt: translate(centerScene.x, centerScene.y),
      extraData: {
        wbType: ToolEnum.Image
      }
    })

    this.graphItem = { id, graphShape: graphShape }
  }

  onDeActive() {
    this.previewedImage.remove()
  }

  onPointerMove({ sceneCoord, isInContainer }) {
    const coord = applyToPoint(this.wbEditor.graphLayer.data.mt, sceneCoord as ICoord)

    this.previewedImage.attr({ x: coord.x + 4, y: coord.y + 4, opacity: isInContainer ? 1 : 0 })
  }

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.downPos = sceneCoord

    this.wbEditor.graphs.push(this.graphItem)

    this.wbEditor.graphLayer.append(this.graphItem.graphShape)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    const rect = getRectByTwoPoint(this.downPos, sceneCoord)

    this.graphItem.graphShape.attr({ width: rect.width, height: rect.height, mt: translate(rect.x, rect.y) })
  }

  onDragEnd(upEvt: PointerEvent) {
    this.previewedImage.remove()
  }
}
