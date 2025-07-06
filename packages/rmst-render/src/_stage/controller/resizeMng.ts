import { Stage } from '../..'

export class ResizeMng {
  constructor(private stage: Stage) {
    const container = stage.container
    let mqString = `(resolution: ${window.devicePixelRatio}dppx)`

    const updatePixelRatio = () => {
      // console.log('dpr change', window.devicePixelRatio)
      // stage.render()
    }

    updatePixelRatio()

    const abCt = new AbortController()
    matchMedia(mqString).addEventListener('change', updatePixelRatio, { signal: abCt.signal })

    const ob = new ResizeObserver(() => {
      stage.render()
    })

    ob.observe(container)

    this.cancel = () => {
      ob.disconnect()
      abCt.abort()
    }
  }

  private cancel

  dispose() {
    this.cancel()
  }
}
