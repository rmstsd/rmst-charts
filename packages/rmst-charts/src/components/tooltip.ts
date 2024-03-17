import { ChartRoot } from '../ChartRoot'

export class Tooltip {
  cr: ChartRoot

  constructor(cr: ChartRoot) {
    this.cr = cr

    if (this.cr.assistLine) {
      this.cr.assistLine.onActiveIndexChange = index => {
        const dd = this.cr.finalSeries.map(item => item.data[index])

        console.log(dd)
      }
    }
  }

  tooltipContainer: HTMLDivElement

  onStageMousemove(evt) {
    if (!this.tooltipContainer) {
      const div = document.createElement('div')
      div.setAttribute('tooltip', '')

      this.tooltipContainer = div

      this.cr.wrapperContainer.appendChild(div)
    }

    const css = {
      position: 'absolute',
      left: evt.x,
      top: evt.y
    }

    // this.tooltipContainer.setAttribute('style', JSON.stringify(css))
  }

  onStageMouseenter(evt) {}

  onStageMouseleave(evt) {}
}
