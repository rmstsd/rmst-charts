import { Line, Rect, Text } from 'rmst-render'

import { ChartRoot } from '../ChartRoot'
import { getActiveIndexFromOffsetX, getYTickFromOffsetY, isInnerRect } from '../utils'

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
    this.horizontal = new Line({ points: [0, 0, 0, 0], strokeStyle: '#ccc', ...reusedOption })
    this.vertical = new Line({ points: [0, 0, 0, stage.canvasSize.height], strokeStyle: '#ccc', ...reusedOption })
    const height = 22
    this.tickRect = new Rect({ x: 0, y: 0, width: 80, height, fillStyle: '#eee', cornerRadius: 4, zIndex: 8 })
    this.tickText = new Text({ x: 0, y: 0, fillStyle: '#444', content: '', zIndex: 10 })

    this.setVisible(false)

    this.elements = [this.horizontal, this.vertical, this.tickRect, this.tickText]

    stage.onmouseenter = evt => {
      this.setVisible(true)
    }
    stage.onmousemove = evt => {
      const offsetX = evt.x
      const offsetY = evt.y

      const { yAxisData, xAxisData } = this.cr.coordinateSystem.cartesian2d.cartesian2dAxisData

      const xAxis_start_x = xAxisData.axis.start.x
      const xAxis_end_x = xAxisData.axis.end.x

      const yAxis_start_y = yAxisData.axis.start.y
      const yAxis_end_y = yAxisData.axis.end.y

      if (!isInnerRect(offsetX, offsetY, xAxis_start_x, xAxis_end_x, yAxis_end_y, yAxis_start_y)) {
        this.setVisible(false)
      } else {
        this.setVisible(true)

        const { assistY, realTickValue } = getYTickFromOffsetY(
          offsetY,
          yAxis_start_y,
          yAxisData.tickConstant.tickInterval,
          yAxisData.tickConstant.realInterval,
          yAxisData.tickConstant.min,
          yAxisData.ticks
        )

        const activeIndex = getActiveIndexFromOffsetX(offsetX, xAxis_start_x, xAxisData.axis.xAxisInterval)
        const verticalX = xAxisData.ticks[activeIndex].start.x

        this.horizontal.attr({ points: [0, assistY, stage.canvasSize.width, assistY] })
        this.vertical.attr({ points: [verticalX, 0, verticalX, stage.canvasSize.height] })

        const tickRectCoord: ICoord = { x: xAxis_start_x + 10, y: assistY - height / 2 }
        this.tickRect.attr({ x: tickRectCoord.x, y: tickRectCoord.y })
        this.tickText.attr({ x: tickRectCoord.x + 10, y: tickRectCoord.y + 5, content: realTickValue })
      }
    }
    stage.onmouseleave = evt => {
      this.setVisible(false)
    }
  }

  elements = []
}
