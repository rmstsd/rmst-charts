import { makeAutoObservable } from 'mobx'
import WhiteboardEditor from '../whiteboardEditor'
import { applyToPoint, compose, inverse, scale, translate } from 'transformation-matrix'
import EventEmitter from 'rmst-render/event_emitter'
import { ICoord, mergeBox } from 'rmst-render'
import { cloneDeep } from 'es-toolkit'

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
    this.zoomTo(this.zoom / zoomSpeed, this.wbEditor.coordSys.centerScene)
  }

  // 缩小
  zoomToValue(newZoom: number) {
    this.zoomTo(newZoom, this.wbEditor.coordSys.centerScene)
  }

  // origin: 场景坐标系
  zoomTo(newZoom: number, origin: ICoord) {
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

    const rect = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  triggerCameraChange() {
    this.eventEmitter.emit('cameraChange')
  }
}
