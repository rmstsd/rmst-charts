import { getRectByTwoPoint, Group, ICoord, RmstImage, Text } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from '../type'
import { IGraph } from '../../../type'
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

  private previewedImageGroup = new Group({ name: 'previewed-image-group', pointerEvents: 'none', visible: false })
  private previewedImage = new RmstImage({ height: 80, mt: translate(0, 0), strokeStyle: '#ddd' })
  private text = new Text({
    fillStyle: 'white',
    fontSize: 12,
    boxData: { cornerRadius: 4, fillStyle: OpenColor.red[7], padding: 4 }
  })

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

    this.previewedImageGroup.append(this.previewedImage, this.text)

    this.wbEditor.stage.append(this.previewedImageGroup)
  }

  onDeActive() {
    this.previewedImage.remove()
  }

  onPointerMove({ sceneCoord, isInWbCanvas }) {
    this.previewedImageGroup.attr({ visible: isInWbCanvas })

    if (isInWbCanvas) {
      const coord = applyToPoint(this.wbEditor.graphLayer.data.mt, sceneCoord as ICoord)
      this.previewedImage.attr({ x: coord.x + 4, y: coord.y + 4 })
      this.text.attr({ x: coord.x + 4, y: coord.y + 4 })
    }
  }

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.downPos = sceneCoord

    const url = this.urls[this.index]

    this.graphItem = {
      graphShape: new RmstImage({
        width: 100,
        height: 100,
        cornerRadius: 8,
        src: url,
        objectFit: 'cover',
        extraData: { wbType: ToolEnum.Image }
      })
    }

    this.wbEditor.graphs.push(this.graphItem)
    this.wbEditor.graphLayer.append(this.graphItem.graphShape)

    this.wbEditor.selectManager.select(this.graphItem.graphShape.id)
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

    const graphShape = new RmstImage({
      cornerRadius: 8,
      src: url,
      objectFit: 'cover',
      extraData: { wbType: ToolEnum.Image }
    })
    this.graphItem = { graphShape }

    graphShape.onLoad = () => {
      const { nativeImage } = graphShape

      graphShape.attr({
        width: nativeImage.naturalWidth,
        height: nativeImage.naturalHeight,
        mt: translate(sceneCoord.x - nativeImage.naturalWidth / 2, sceneCoord.y - nativeImage.naturalHeight / 2)
      })

      this.wbEditor.triggerRender()

      graphShape.onLoad = null
    }

    this.wbEditor.graphs.push(this.graphItem)
    this.wbEditor.graphLayer.append(this.graphItem.graphShape)

    this.wbEditor.selectManager.select(this.graphItem.graphShape.id)

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
