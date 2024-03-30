import { Stage, Line, Text, measureText, Group, pointToFlatArray } from 'rmst-render'

import {
  canvasPaddingBottom,
  canvasPaddingLeft,
  canvasPaddingRight,
  dataZoomHeight,
  tickColor
} from '../../constant.js'
import { hasDataZoom } from '../../components/dataZoom'

function getXAxis(option: ICharts.IOption, containerWidth, containerHeight) {
  const start_x = canvasPaddingLeft
  const axis_y = containerHeight - canvasPaddingBottom - (hasDataZoom(option) ? dataZoomHeight : 0)
  const end_x = containerWidth - canvasPaddingRight

  const { data, boundaryGap = true } = option.xAxis

  const count = boundaryGap ? data.length : data.length - 1 // x轴刻度值左右的空余距离
  const xAxisInterval = (end_x - start_x) / count
  const firstPaddingLeft = boundaryGap ? xAxisInterval / 2 : 0

  const axis = { start: { x: start_x, y: axis_y }, end: { x: end_x, y: axis_y }, xAxisInterval }

  const ticks = data.map((valueString, index) => {
    const { textWidth, textHeight } = measureText(valueString, 14)
    const tickLength = 10

    const x = firstPaddingLeft + start_x + index * xAxisInterval
    const y_start = axis_y
    const y_end = axis_y + tickLength

    return {
      start: { x, y: y_start },
      end: { x, y: y_end },
      text: { x, y: y_end + 5, textWidth, value: valueString }
    }
  })

  return { axis, ticks }
}

export type IXAxisElements = ReturnType<typeof createXAxisElements>
export function createXAxisElements(stage: Stage, innerOption: ICharts.IOption) {
  const xAxisData = getXAxis(innerOption, stage.canvasElement.offsetWidth, stage.canvasElement.offsetHeight)

  const xAxisLine = new Line({
    points: [xAxisData.axis.start.x, xAxisData.axis.start.y, xAxisData.axis.end.x, xAxisData.axis.end.y],
    strokeStyle: tickColor
  })

  let prevTextEndX = 0
  const ticks: Group[] = []
  xAxisData.ticks.forEach(item => {
    if (item.text.x < prevTextEndX + 10) {
      return
    }

    prevTextEndX = item.text.x + item.text.textWidth

    const tickGroupItem = new Group()
    const tickLine = new Line({ points: pointToFlatArray([item.start, item.end]), strokeStyle: tickColor })
    const tickText = new Text({
      x: item.text.x,
      y: item.text.y,
      content: item.text.value,
      fillStyle: tickColor,
      textAlign: 'center',
      cursor: 'pointer'
    })

    tickGroupItem.append([tickLine, tickText])

    ticks.push(tickGroupItem)
  })

  return { xAxisLine, ticks, xAxisData }
}
