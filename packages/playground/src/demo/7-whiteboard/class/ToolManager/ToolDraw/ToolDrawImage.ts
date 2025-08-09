import { Group, ICoord, RmstImage, Text } from 'rmst-render'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ToolEnum } from '../constant'
import { showOpenFilePicker } from 'show-open-file-picker'
import { applyToPoint, translate } from 'transformation-matrix'
import OpenColor from 'open-color'
import ToolDrawByRect from './ToolDrawByRect'

export default class ToolDrawImage extends ToolDrawByRect {
  constructor(wbEditor: WhiteboardEditor) {
    super(wbEditor)
  }

  private urls: string[] = []
  private index = 0

  private get leftCount() {
    return this.urls.length - this.index
  }

  private previewedImageGroup = new Group({ name: 'previewed-image-group', pointerEvents: 'none', visible: false })
  private previewedImage = new RmstImage({ height: 100, mt: translate(0, 0), strokeStyle: '#ddd' })
  private text = new Text({
    fillStyle: 'white',
    fontSize: 12,
    boxData: { cornerRadius: 4, fillStyle: OpenColor.red[7], padding: 4 }
  })

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
    this.text.attr({ content: this.leftCount.toString() })

    return true
  }

  onActive() {
    super.onActive()

    this.previewedImageGroup.append(this.previewedImage, this.text)
    this.wbEditor.tempLayer.append(this.previewedImageGroup)
  }

  onDeActive() {
    super.onDeActive()

    this.previewedImageGroup.remove()
  }

  onTempActive() {
    this.previewedImageGroup.attr({ visible: false })
  }

  onTempDeActive() {
    this.previewedImageGroup.attr({ visible: true })
  }

  onPointerMove({ sceneCoord, isInWbCanvas }) {
    this.previewedImageGroup.attr({ visible: isInWbCanvas })

    if (isInWbCanvas) {
      const coord = applyToPoint(this.wbEditor.graphLayer.data.mt, sceneCoord as ICoord)
      this.previewedImage.attr({ x: coord.x + 4, y: coord.y + 4 })
      this.text.attr({ x: coord.x + 4, y: coord.y + 4 })
    }
  }

  override onPointerUp(upEvt: PointerEvent, sceneCoord: ICoord) {
    const graphShape = this.getShape()

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

    this.wbEditor.graphLayer.append(this.graphItem.graphShape)
    this.wbEditor.selectManager.select(this.graphItem.graphShape.id)
  }

  onDrawAfterEnd() {
    super.onDrawAfterEnd()

    this.index++

    // 最后一个画完后, 移除预览图
    if (this.index > this.urls.length - 1) {
      this.previewedImageGroup.remove()
      return true
    }

    this.previewedImage.attr({ src: this.urls[this.index] })
    this.text.attr({ content: this.leftCount.toString() })

    return false
  }

  getShape() {
    return new RmstImage({
      src: this.urls[this.index],
      objectFit: 'cover',
      cornerRadius: 4,
      name: ToolEnum.label(ToolEnum.Image),
      extraData: { wbType: ToolEnum.Image }
    })
  }
}
