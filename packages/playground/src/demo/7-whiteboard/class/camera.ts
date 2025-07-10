import { makeAutoObservable } from 'mobx'
import WhiteboardEditor from '../whiteboardEditor'
import { applyToPoint, compose, identity, inverse, scale, translate } from 'transformation-matrix'
import EventEmitter from 'rmst-render/event_emitter'
import { ICoord, mergeBox, Rect } from 'rmst-render'
import { cloneDeep } from 'es-toolkit'
import { fitAndPosition } from 'object-fit-math'

const zoomSpeed = 1.2
const speed = 100

const Min_Zoom = 0.01
const Max_Zoom = 10

interface Events {
  cameraChange: () => void
}

export default class Camera {
  constructor(private wbEditor: WhiteboardEditor) {
    makeAutoObservable(this)
  }

  eventEmitter = new EventEmitter<Events>()

  zoom = 1
  tx = 0
  ty = 0

  bindEvent() {
    const { wbEditor } = this
    const { container, graphLayer: graphGroup } = this.wbEditor
    container.onwheel = evt => {
      evt.preventDefault()

      let mt = graphGroup.data.mt

      if (evt.ctrlKey) {
        const nvOrigin = wbEditor.coordSys.client2Scene(evt)
        let newZoom = evt.deltaY > 0 ? this.zoom / zoomSpeed : this.zoom * zoomSpeed
        this.zoomTo(newZoom, nvOrigin)
      } else {
        if (evt.shiftKey) {
          const tmt = evt.deltaY > 0 ? translate(-speed, 0) : translate(speed, 0)
          mt = compose(tmt, mt)
        } else {
          const tmt = evt.deltaY > 0 ? translate(0, -speed) : translate(0, speed)
          mt = compose(tmt, mt)
        }

        graphGroup.attr('mt', mt)
        this.triggerCameraChange()
      }
    }
  }

  // 放大
  zoomIn() {
    this.zoomTo(this.zoom * zoomSpeed, this.wbEditor.coordSys.centerScene)
  }

  // 缩小
  zoomOut() {
    this.zoomTo(this.zoom / zoomSpeed)
  }

  // 缩小
  zoomToValue(newZoom: number) {
    this.zoomTo(newZoom)
  }

  // origin: 场景坐标系
  zoomTo(newZoom: number, origin?: ICoord) {
    if (!origin) {
      origin = this.wbEditor.coordSys.centerScene
    }

    const { wbEditor } = this

    let mt = cloneDeep(wbEditor.graphLayer.data.mt)

    const newMt = scale(this.zoom, this.zoom, origin.x, origin.y)
    const tt = compose(mt, inverse(newMt))

    newZoom = Math.max(Min_Zoom, Math.min(Max_Zoom, newZoom))

    this.zoom = newZoom

    mt = compose(tt, scale(newZoom, newZoom, origin.x, origin.y))
    wbEditor.graphLayer.attr('mt', mt)

    this.triggerCameraChange()
  }

  // 缩放到适合 (适应画布)
  zoomToFit() {
    const { wbEditor } = this

    const selRects = wbEditor.graphLayer.data.children.map(item => {
      const data = item.data
      const tl = applyToPoint(data.mt, { x: 0, y: 0 })
      const tr = applyToPoint(data.mt, { x: data.width, y: 0 })
      const br = applyToPoint(data.mt, { x: data.width, y: data.height })
      const bl = applyToPoint(data.mt, { x: 0, y: data.height })
      return { tl, tr, br, bl }
    })

    const { minX, minY, maxX, maxY } = mergeBox(selRects)

    const tl = applyToPoint(identity(), { x: minX, y: minY })
    const br = applyToPoint(identity(), { x: maxX, y: maxY })

    const contentRect = { x: tl.x, y: tl.y, width: br.x - tl.x, height: br.y - tl.y }
    console.log(contentRect)

    {
      const viewportSize = wbEditor.coordSys.viewportSize
      const padding = 40
      const stageRect = {
        x: padding,
        y: padding,
        width: viewportSize.width - padding * 2,
        height: viewportSize.height - padding * 2
      }
      const zoomX = stageRect.width / contentRect.width
      const zoomY = stageRect.height / contentRect.height
      const zoom = Math.min(zoomX, zoomY)
      this.zoom = zoom

      const scaleMt = compose(
        translate(-contentRect.x + stageRect.x, -contentRect.y + stageRect.y),
        scale(zoom, zoom, contentRect.x, contentRect.y)
      )

      let tx = 0
      let ty = 0

      {
        const ppp = applyToPoint(inverse(scale(zoom)), { x: stageRect.width, y: stageRect.height })
        tx = (stageRect.width / zoom - contentRect.width) / 2
        ty = (stageRect.height / zoom - contentRect.height) / 2
      }

      const newMt = compose(scaleMt, translate(tx, ty))

      wbEditor.graphLayer.attr({ mt: newMt })

      this.triggerCameraChange()
    }

    return

    {
      const viewportSize = wbEditor.coordSys.viewportSize

      const zoomX = viewportSize.width / contentRect.width
      const zoomY = viewportSize.height / contentRect.height

      const zoom = Math.min(zoomX, zoomY)

      this.zoomTo(zoom, { x: 0, y: 0 })

      //（3）计算视口 x 和 y 值
      const newViewportX = contentRect.x - (viewportSize.width / zoom - contentRect.width) / 2
      const newViewportY = contentRect.y - (viewportSize.height / zoom - contentRect.height) / 2

      const tmt = translate(newViewportX, newViewportY) // 内容居中

      wbEditor.graphLayer.attr({ mt: compose(wbEditor.graphLayer.data.mt, tmt) })
    }
  }

  triggerCameraChange() {
    this.eventEmitter.emit('cameraChange')
  }
}

function fitToViewport(contentRect, canvasSize) {
  // 计算缩放比例
  const scaleX = canvasSize.width / contentRect.width
  const scaleY = canvasSize.height / contentRect.height
  const zoom = Math.min(scaleX, scaleY)

  // 计算内容中心点
  const center = {
    x: contentRect.x + contentRect.width / 2,
    y: contentRect.y + contentRect.height / 2
  }

  // 计算需要平移的距离，使内容居中
  const viewportCenter = {
    x: canvasSize.width / 2,
    y: canvasSize.height / 2
  }

  // 应用缩放后的偏移量
  const offset = {
    x: viewportCenter.x - center.x * zoom,
    y: viewportCenter.y - center.y * zoom
  }

  return { zoom, offset }
}
