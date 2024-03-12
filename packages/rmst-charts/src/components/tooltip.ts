import { ChartRoot } from '../ChartRoot'

export class Tooltip {
  cr: ChartRoot

  constructor(cr: ChartRoot) {
    this.cr = cr
  }

  tooltipContainer: HTMLDivElement

  onStageMousemove(evt) {
    if (!this.tooltipContainer) {
      const div = document.createElement('div')
      div.setAttribute('tooltip', '')

      this.tooltipContainer = div

      this.cr.wrapperContainer.appendChild(div)
    }
  }

  onStageMouseenter(evt) {}

  onStageMouseleave(evt) {}
}
