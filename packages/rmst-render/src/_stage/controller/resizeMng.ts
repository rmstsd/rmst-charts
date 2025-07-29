import { noop } from 'es-toolkit'
import { Stage } from '../..'

export class ResizeMng {
  constructor(private stage: Stage) {
    const container = stage.container
    let mqString = `(resolution: ${window.devicePixelRatio}dppx)`

    const updatePixelRatio = () => {}
    updatePixelRatio()

    const abCt = new AbortController()
    matchMedia(mqString).addEventListener('change', updatePixelRatio, { signal: abCt.signal })

    const ob = new ResizeObserver(() => {
      stage.updateCanvasSize()
      this.onResize()

      stage.syncRender()
    })

    ob.observe(container)

    this.cancel = () => {
      ob.disconnect()
      abCt.abort()
    }
  }

  onResize = noop

  private cancel

  dispose() {
    this.cancel()
  }
}
