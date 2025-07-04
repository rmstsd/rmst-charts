import { Stage } from '../..'

export class ResizeMng {
  constructor(private stage: Stage) {
    const container = stage.container
    let mqString = `(resolution: ${window.devicePixelRatio}dppx)`

    const updatePixelRatio = () => {
      // 未完成
      // stage.render()
    }

    updatePixelRatio()

    matchMedia(mqString).addEventListener('change', updatePixelRatio)

    const ob = new ResizeObserver(() => {
      stage.render()
    })

    ob.observe(container)
  }

  dispose() {}
}
