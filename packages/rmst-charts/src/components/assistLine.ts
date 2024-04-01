import { AnimatorSingle, Line, Rect, Text } from 'rmst-render'

import { ChartRoot } from '../ChartRoot'
import { getYTickFromOffsetY, detectNear } from '../utils'

export class AssistLine {
  cr: ChartRoot

  constructor(cr: ChartRoot) {
    this.cr = cr
  }

  horizontal: Line
  vertical: Line
  tickRect: Rect
  tickText: Text

  setVisible(visible: boolean) {
    const opacity = visible ? 1 : 0

    this.horizontal.attr({ opacity })
    this.vertical.attr({ opacity })
    this.tickRect.attr({ opacity })
    this.tickText.attr({ opacity })
  }

  render() {
    const { cr } = this
    const { stage } = cr

    const reusedOption = { zIndex: 8, pointerEvents: 'none' as const, lineDash: [4] }
    this.horizontal = new Line({ points: [0, 0, 0, 0], strokeStyle: '#bbb', ...reusedOption })
    this.vertical = new Line({ points: [0, 0, 0, stage.canvasSize.height], strokeStyle: '#bbb', ...reusedOption })
    this.tickRect = new Rect({ x: 0, y: 0, width: 50, height: 22, fillStyle: '#eee', cornerRadius: 4, zIndex: 8 })
    this.tickText = new Text({ x: 0, y: 0, fillStyle: '#444', content: '', zIndex: 10, textAlign: 'center' })

    this.setVisible(false)

    this.elements = [this.horizontal, this.vertical, this.tickRect, this.tickText]
  }

  elements = []
  activeIndex: number

  ani = new AnimatorSingle(0, 0)

  onCartesian2dRectMousemove(evt) {
    const { cr } = this
    const { stage } = cr

    const offsetX = evt.x
    const offsetY = evt.y

    const { yAxisData, xAxisData } = cr.coordinateSystem.cartesian2d.cartesian2dAxisData

    const xAxis_start_x = xAxisData.axis.start.x
    const xAxis_end_x = xAxisData.axis.end.x

    const yAxis_start_y = yAxisData.axis.start.y
    const yAxis_end_y = yAxisData.axis.end.y

    const { assistY, realTickValue } = getYTickFromOffsetY(
      offsetY,
      yAxis_start_y,
      yAxisData.tickConstant.tickInterval,
      yAxisData.tickConstant.realInterval,
      yAxisData.tickConstant.min,
      yAxisData.ticks
    )

    let activeIndex = 0

    const xAxisDataTicks = xAxisData.ticks

    if (offsetX < xAxisDataTicks.at(0).start.x) {
      activeIndex = 0
    } else if (offsetX > xAxisDataTicks.at(-1).start.x) {
      activeIndex = xAxisDataTicks.length - 1
    } else {
      const tickCount = (offsetX - xAxisDataTicks.at(0).start.x) / xAxisData.axis.xAxisInterval

      const neared = detectNear(tickCount, 0.5)
      if (neared.isNear) {
        activeIndex = neared.nearValue
      }
    }

    if (this.activeIndex !== activeIndex) {
      this.activeIndex = activeIndex
      const verticalX = xAxisDataTicks[this.activeIndex].start.x
      // this.vertical.animateCartoon(
      //   { points: [verticalX, 0, verticalX, stage.canvasSize.height] },
      //   { duration: 200, easing: 'quadraticInOut' }
      // )

      this.ani.setAheadEnd()
      this.ani = new AnimatorSingle(this.ani.centerValue, verticalX, { duration: 150 })
      this.ani.onUpdate = _cv => {
        this.vertical.attr({ points: [_cv, 0, _cv, stage.canvasSize.height] })
      }

      this.ani.setEndValue(verticalX)

      this.onActiveIndexChange(this.activeIndex)
    }

    this.horizontal.attr({ points: [0, assistY, stage.canvasSize.width, assistY] })

    const tickRectData = this.tickRect.data
    const tickRectCoord: ICoord = { x: xAxis_start_x - tickRectData.width, y: assistY - tickRectData.height / 2 }
    this.tickRect.attr({ x: tickRectCoord.x, y: tickRectCoord.y })
    this.tickText.attr({
      x: tickRectCoord.x + tickRectData.width / 2,
      y: tickRectCoord.y + 5,
      content: String(realTickValue)
    })
  }

  show() {
    this.setVisible(true)
  }

  hide() {
    this.setVisible(false)
  }

  onActiveIndexChange(index: number) {}
}
