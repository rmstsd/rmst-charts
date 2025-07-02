import { makeAutoObservable } from 'mobx'
import WhiteboardEditor from '../whiteboardEditor'
import { applyToPoint, compose, inverse, scale, translate } from 'transformation-matrix'
import EventEmitter from 'rmst-render/event_emitter'

const zoomSpeed = 1.2
const speed = 100

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
    const { container, graphLayer: graphGroup } = this.wbEditor
    container.onwheel = evt => {
      evt.preventDefault()

      let mt = graphGroup.data.mt

      if (evt.ctrlKey) {
        const center = { x: evt.offsetX, y: evt.offsetY }

        const nvOrigin = applyToPoint(inverse(mt), center)

        const newMt = scale(this.zoom, this.zoom, nvOrigin.x, nvOrigin.y)
        const tt = compose(mt, inverse(newMt))

        this.zoom = evt.deltaY > 0 ? this.zoom / zoomSpeed : this.zoom * zoomSpeed
        mt = compose(tt, scale(this.zoom, this.zoom, nvOrigin.x, nvOrigin.y))

        graphGroup.attr('mt', mt)
      } else {
        if (evt.shiftKey) {
          const tmt = evt.deltaY > 0 ? translate(-speed, 0) : translate(speed, 0)
          mt = compose(tmt, mt)
        } else {
          const tmt = evt.deltaY > 0 ? translate(0, -speed) : translate(0, speed)
          mt = compose(tmt, mt)
        }

        graphGroup.attr('mt', mt)
      }

      this.triggerCameraChange()
    }
  }

  triggerCameraChange() {
    this.eventEmitter.emit('cameraChange')
  }
}
