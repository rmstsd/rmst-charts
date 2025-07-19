import { Box, getRectByTwoPoint, Group, ICoord, RmstImage, Text } from 'rmst-render'
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

  private downPos: ICoord
  private graphItem = {} as IGraph

  private urls: string[] = []
  private index = 0

  private previewedImageGroup = new Group({ pointerEvents: 'none' })
  private previewedImage = new RmstImage({ height: 80, src: '', mt: translate(0, 0) })
  private textBox = new Box({ width: 16, height: 16, cornerRadius: 4, fillStyle: OpenColor.red[7] })
  private text = new Text({ fillStyle: 'white' })

  private get count() {
    return this.urls.length - this.index
  }

  async enableActive() {
    const files = await showOpenFilePicker({
      types: [{ description: 'Images', accept: { 'image/*': ['.png', '.jpeg', '.jpg'] } }],
      multiple: true
    }).catch(err => {
      return false
    })

    if (!Array.isArray(files)) {
      return false
    }

    if (!files.length) {
      return false
    }

    const realFiles = await Promise.all(files.map(item => item.getFile()))
    this.urls = realFiles.map(item => URL.createObjectURL(item))

    this.previewedImage.attr({ src: this.urls[this.index] })
    this.text.attr({ content: this.count.toString() })

    return true
  }

  async onActive() {
    this.wbEditor.selectManager.clearSelect()

    this.textBox.append(this.text)
    this.previewedImageGroup.append(this.previewedImage, this.textBox)

    this.wbEditor.stage.append(this.previewedImageGroup)
  }

  onDeActive() {
    this.previewedImage.remove()
  }

  onPointerMove({ sceneCoord, isInContainer }) {
    const coord = applyToPoint(this.wbEditor.graphLayer.data.mt, sceneCoord as ICoord)

    this.previewedImageGroup.attr({ visible: isInContainer ? true : false })
    this.previewedImage.attr({ x: coord.x + 4, y: coord.y + 4 })
    this.textBox.attr({ x: coord.x + 4, y: coord.y + 4 })
  }

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.downPos = sceneCoord

    const url = this.urls[this.index]

    const id = uuid()
    const graphShape = new RmstImage({
      id,
      width: 100,
      height: 100,
      // strokeStyle: OpenColor.gray[5],
      // lineWidth: 1,
      cornerRadius: 8,
      src: url,
      objectFit: 'cover',
      mt: translate(0, 0),
      extraData: { wbType: ToolEnum.Image }
    })
    this.graphItem = { id, graphShape }

    this.wbEditor.graphs.push(this.graphItem)
    this.wbEditor.graphLayer.append(this.graphItem.graphShape)

    this.wbEditor.selectManager.select(this.graphItem.id)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    const rect = getRectByTwoPoint(this.downPos, sceneCoord)
    this.graphItem.graphShape.attr({ width: rect.width, height: rect.height, mt: translate(rect.x, rect.y) })
    this.wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent) {
    this.index++

    // 最后一个画完后, 移除预览图
    if (this.index > this.urls.length - 1) {
      this.previewedImageGroup.remove()
      return true
    }

    this.previewedImage.attr({ src: this.urls[this.index] })
    this.text.attr({ content: this.count.toString() })

    return false
  }

  onPointerUp(upEvt: PointerEvent, sceneCoord: ICoord) {
    const url = this.urls[this.index]

    const id = uuid()
    const graphShape = new RmstImage({
      id,
      width: 100,
      height: 100,
      // strokeStyle: OpenColor.gray[5],
      // lineWidth: 1,
      cornerRadius: 8,
      src: url,
      objectFit: 'cover',
      mt: translate(sceneCoord.x, sceneCoord.y),
      extraData: { wbType: ToolEnum.Image }
    })
    this.graphItem = { id, graphShape }

    this.wbEditor.graphs.push(this.graphItem)
    this.wbEditor.graphLayer.append(this.graphItem.graphShape)

    this.wbEditor.selectManager.select(this.graphItem.id)

    this.index++

    // 最后一个画完后, 移除预览图
    if (this.index > this.urls.length - 1) {
      this.previewedImageGroup.remove()
      return true
    }

    this.previewedImage.attr({ src: this.urls[this.index] })
    this.text.attr({ content: this.count.toString() })

    return false
  }
}
