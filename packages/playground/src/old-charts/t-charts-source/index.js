// @ts-check
import { dpr, canvasPaddingBottom, canvasPaddingLeft, canvasPaddingRight } from './constant.js'
import { drawSegmentLine, measureText } from './utils.js'
import { drawXAxis, getXAxis } from './calcAxis/calcXAxis.js'
import { drawYAxis, getYAxis } from './calcAxis/calcYAxis.js'

import * as lineMethod from './calcMain/calcLine.js'
import * as barMethod from './calcMain/calcBar.js'
import * as pieMethod from './calcMain/calcPie.js'

const tCharts = {
  init: initCanvas
}

export default tCharts

/**
 * @param {*} canvasContainer
 * @returns { { ctx: CanvasRenderingContext2D, setOption: () => void } } res
 */
function initCanvas(canvasContainer) {
  const { offsetWidth, offsetHeight } = canvasContainer

  const canvasElement = document.createElement('canvas')
  const canvasWidth = offsetWidth * dpr
  const canvasHeight = offsetHeight * dpr

  canvasElement.width = canvasWidth
  canvasElement.height = canvasHeight
  canvasElement.style.width = '100%'
  canvasElement.style.height = '100%'

  const ctx = canvasElement.getContext('2d')
  ctx.font = '16px 微软雅黑'
  ctx.scale(dpr, dpr)

  canvasContainer.append(canvasElement)

  return {
    ctx,
    setOption: option => {
      setOption(ctx, option, offsetWidth, offsetHeight)
    }
  }
}

const methodMap = { line: lineMethod, bar: barMethod, pie: pieMethod }

function setOption(ctx, option, offsetWidth, offsetHeight) {
  ctx.clearRect(0, 0, offsetWidth, offsetHeight)

  console.log(option)

  const { series } = option

  const renderTree = calcRenderTree()
  drawCharts(renderTree)

  function calcRenderTree() {
    const renderTree = {}

    if (series.type !== 'pie') renderTree.xAxis = getXAxis(ctx, option.xAxis.data, offsetWidth, offsetHeight)
    if (series.type !== 'pie') renderTree.yAxis = getYAxis(ctx, series.data, offsetHeight)
    renderTree.chartArray = lineMethod.calcMain(series.data, renderTree.xAxis, renderTree.yAxis)

    return renderTree
  }

  function drawCharts(renderTree) {
    console.log(renderTree)
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
