import { makeAutoObservable } from 'mobx'
import WhiteboardEditor from '../whiteboardEditor'
import { applyToPoint, compose, scale, translate } from 'transformation-matrix'
import EventEmitter from 'rmst-render/event_emitter'
import { ICoord, mergeBox } from 'rmst-render'

const zoomSpeed = 1.4
const scrollSpeed = 100

const Min_Zoom = 0.01
const Max_Zoom = 10

interface Events {
  cameraChange: () => void
}

export default class Camera {
  constructor(private wbEditor: WhiteboardEditor) {
    makeAutoObservable(this)
  }

  private abCt = new AbortController()

  eventEmitter = new EventEmitter<Events>()

  zoom = 1

  bindEvent() {
    const { wbEditor } = this

    wbEditor.container.addEventListener(
      'wheel',
      evt => {
        evt.preventDefault()

        if (evt.ctrlKey) {
          const nvOrigin = wbEditor.coordSys.client2Scene(evt)

          let delta = evt.deltaY
          const isTrackpad = evt.deltaMode === 0 && Math.abs(evt.deltaY) < 50
          const speed = isTrackpad ? 0.01 : 0.002
          let zoom = Math.exp(-delta * speed)
          let newZoom = this.zoom * zoom

          this.zoomTo(newZoom, nvOrigin)
        } else {
          // 当触发了鼠标按下平移, 则禁止滚轮平移
          if (wbEditor.toolManager.toolTempPan.isPointerDown) {
            return
          }

          let tmt

          if (evt.shiftKey) {
            tmt = evt.deltaY > 0 ? translate(-scrollSpeed, 0) : translate(scrollSpeed, 0)
          } else {
            // tmt = evt.deltaY > 0 ? translate(0, -scrollSpeed) : translate(0, scrollSpeed)

            tmt = translate(-evt.deltaX, -evt.deltaY)
          }

          const sceneCoord = { x: tmt.e / this.zoom, y: tmt.f / this.zoom }
          this.pan(sceneCoord.x, sceneCoord.y)
        }
      },
      { signal: this.abCt.signal }
    )
  }

  dispose() {
    this.abCt.abort()
  }

  // 平移
  pan(deltaX: number, deltaY: number) {
    const { graphLayer } = this.wbEditor

    const newMt = compose(graphLayer.data.mt, translate(deltaX, deltaY))
    graphLayer.attr('mt', newMt)

    this.triggerCameraChange()
  }

  // 放大
  zoomIn() {
    this.zoomTo(this.zoom * zoomSpeed)
  }

  // 缩小
  zoomOut() {
    this.zoomTo(this.zoom / zoomSpeed)
  }

  zoomToValue(newZoom: number) {
    this.zoomTo(newZoom)
  }

  // origin: 场景坐标系
  zoomTo(newZoom: number, origin?: ICoord) {
    if (!origin) {
      origin = this.wbEditor.coordSys.centerScene
    }

    const { wbEditor } = this

    newZoom = Math.max(Min_Zoom, Math.min(Max_Zoom, newZoom))

    // https://codesandbox.io/p/sandbox/tm25rv gg_demo
    const delta = newZoom / this.zoom
    this.zoom = newZoom

    const mt = compose(wbEditor.graphLayer.data.mt, scale(delta, delta, origin.x, origin.y))
    wbEditor.graphLayer.attr('mt', mt)
    this.triggerCameraChange()
  }

  // 缩放到适合 (适应画布)
  zoomToFit() {
    const { wbEditor } = this

    if (!wbEditor.graphLayer.data.children.length) {
      this.zoomTo(1)
      return
    }

    const selRects = wbEditor.graphLayer.data.children.map(item => {
      const data = item.data
      const tl = applyToPoint(data.mt, { x: 0, y: 0 })
      const tr = applyToPoint(data.mt, { x: data.width, y: 0 })
      const br = applyToPoint(data.mt, { x: data.width, y: data.height })
      const bl = applyToPoint(data.mt, { x: 0, y: data.height })
      return { tl, tr, br, bl }
    })

    const { minX, minY, maxX, maxY } = mergeBox(selRects) // 场景坐标系

    const contentRect = { x: minX, y: minY, width: maxX - minX, height: maxY - minY }

    const viewportSize = wbEditor.coordSys.viewportSize
    const padding = 80
    const viewportRect = {
      x: padding,
      y: padding,
      width: viewportSize.width - padding * 2,
      height: viewportSize.height - padding * 2
    }
    const zoomX = viewportRect.width / contentRect.width
    const zoomY = viewportRect.height / contentRect.height
    const zoom = Math.min(zoomX, zoomY)
    this.zoom = zoom

    const scaleMt = compose(
      translate(-contentRect.x + viewportRect.x, -contentRect.y + viewportRect.y),
      scale(zoom, zoom, contentRect.x, contentRect.y)
    )

    const tx = (viewportRect.width / zoom - contentRect.width) / 2
    const ty = (viewportRect.height / zoom - contentRect.height) / 2

    const newMt = compose(scaleMt, translate(tx, ty))
    wbEditor.graphLayer.attr({ mt: newMt })

    this.triggerCameraChange()
  }

  triggerCameraChange() {
    this.eventEmitter.emit('cameraChange')
  }
}
