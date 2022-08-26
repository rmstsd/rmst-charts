import { dpr, canvasPaddingBottom, canvasPaddingLeft, canvasPaddingRight } from './constant'
import { drawSegmentLine, measureText } from './utils'
import { drawXAxis, getXAxis } from './calcAxis/calcXAxis'
import { drawYAxis, getYAxis } from './calcAxis/calcYAxis'

import * as lineMethod from './calcMain/calcLine'
import * as barMethod from './calcMain/calcBar'
import * as pieMethod from './calcMain/calcPie'
import { createCanvas } from './initElement'

const methodMap = { line: lineMethod, bar: barMethod, pie: pieMethod }

const tCharts = {
  init: initCanvas
}

export default tCharts

function initCanvas(canvasContainer: HTMLElement) {
  const { offsetWidth, offsetHeight } = canvasContainer
  const { canvasElement, ctx } = createCanvas(offsetWidth, offsetHeight)

  canvasContainer.append(canvasElement)

  return {
    canvasElement,
    ctx,
    setOption: (option: TCharts.IOption) => {
      setOption(ctx, option, offsetWidth, offsetHeight)
    }
  }
}

function setOption(
  ctx: CanvasRenderingContext2D,
  option: TCharts.IOption,
  offsetWidth: number,
  offsetHeight: number
) {
  ctx.clearRect(0, 0, offsetWidth, offsetHeight)

  const { series } = option

  const renderTree = calcRenderTree()
  drawCharts(renderTree)

  function calcRenderTree() {
    const renderTree = {} as TCharts.IRenderTree

    if (series.type !== 'pie') renderTree.xAxis = getXAxis(ctx, option.xAxis.data, offsetWidth, offsetHeight)
    if (series.type !== 'pie') renderTree.yAxis = getYAxis(ctx, series.data, offsetHeight)
    renderTree.chartArray = lineMethod.calcMain(series.data, renderTree.xAxis, renderTree.yAxis)

    return renderTree
  }

  function drawCharts(renderTree: TCharts.IRenderTree) {
    const { xAxis, yAxis, chartArray } = renderTree
    const { xAxisInterval } = xAxis?.axis ?? {}

    const { aniConfig, checkStop } = lineMethod.calcInitRafValue(chartArray, { xAxisInterval })

    draw()

    function draw() {
      if (xAxis) drawXAxis(ctx, xAxis)
      if (yAxis) drawYAxis(ctx, yAxis)

      lineMethod.drawMain(ctx, chartArray, {
        // smooth: series.smooth,
        xAxisInterval,
        // circleCenter: { x: offsetWidth / 2, y: offsetHeight / 2 },
        dataSource: series.data
      })
    }
  }
}
