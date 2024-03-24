import { ChartRoot } from '../ChartRoot'
import PieMain from '../chart/PieMain'
import { tooltipContainerStyle } from '../style'

export class Tooltip {
  cr: ChartRoot

  constructor(cr: ChartRoot) {
    this.cr = cr

    if (this.cr.assistLine) {
      this.cr.assistLine.onActiveIndexChange = index => {
        const tick = cr.coordinateSystem.cartesian2d.cartesian2dAxisData.xAxisData.ticks[index]

        const html = cr.seriesManager.getAxisTooltipContent(index)

        let innerHtml = `<div style=${tooltipContainerStyle.title}>${tick.text.value}</div>`
        this.tooltipContainer.innerHTML = innerHtml + html
      }
    } else {
      this.cr.stage.on('mousemove', evt => {
        if (this.isShow) {
        }
      })
    }
  }

  isShow = false

  tooltipContainer: HTMLDivElement

  onCartesian2dRectMousemove(evt) {
    const offset = 8

    let x = evt.x + offset
    let y = evt.y + offset

    const { canvasSize } = this.cr.stage

    let max_x = canvasSize.width - this.tooltipContainer.offsetWidth
    let max_y = canvasSize.height - this.tooltipContainer.offsetHeight

    if (x > max_x) {
      x = x - tooltipContainerStyle.width - offset * 2
    }
    if (y > max_y) {
      y = y - this.tooltipContainer.offsetHeight - offset * 2
    }

    const css = tooltipContainerStyle(x, y)
    for (const key in css) {
      this.tooltipContainer.style[key] = css[key]
    }
  }

  private initContainer() {
    if (!this.tooltipContainer) {
      const div = document.createElement('div')
      div.setAttribute('tooltip', '')
      this.tooltipContainer = div
      this.cr.wrapperContainer.appendChild(div)
    }
  }

  onCartesian2dRectMouseenter(evt) {
    this.initContainer()

    this.show()
  }

  onCartesian2dRectMouseleave(evt) {
    this.hide()
  }

  private hide() {
    this.tooltipContainer.style.display = 'none'
  }

  private show() {
    this.tooltipContainer.style.display = 'flex'
  }

  externalShow(pie: PieMain, index: number) {
    this.initContainer()

    this.show()

    console.log(pie.seriesItem.data[index], pie.data[index].color)
  }
}
