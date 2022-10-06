import { drawXAxis, getXAxis } from './calcAxis/calcXAxis'
import { drawYAxis, getYAxis } from './calcAxis/calcYAxis'

import * as lineMethod from './calcMain/calcLine'
import * as barMethod from './calcMain/calcBar'
import * as pieMethod from './calcMain/calcPie'

import { createCanvas } from './utils/domHelper'

const methodMap = { line: lineMethod, bar: barMethod, pie: pieMethod }

function initCanvas(canvasContainer: HTMLElement) {
  const { offsetWidth, offsetHeight } = canvasContainer
  const { canvasElement, ctx } = createCanvas(offsetWidth, offsetHeight)

  canvasContainer.append(canvasElement)

  return {
    canvasElement,
    ctx,
    setOption: (option: ICharts.IOption) => {
      setOption(ctx, option, offsetWidth, offsetHeight)
    }
  }
}

function setOption(
  ctx: CanvasRenderingContext2D,
  option: ICharts.IOption,
  offsetWidth: number,
  offsetHeight: number
) {
  ctx.clearRect(0, 0, offsetWidth, offsetHeight)

  const { series } = option
  const { calcMain, drawMain } = methodMap[series.type]

  const renderTree = calcRenderTree()
  drawCharts(renderTree)

  function calcRenderTree() {
    const renderTree = {} as ICharts.IRenderTree

    if (series.type !== 'pie') {
      renderTree.xAxis = getXAxis(ctx, option.xAxis.data, offsetWidth, offsetHeight)
      renderTree.yAxis = getYAxis(ctx, series.data, offsetHeight, renderTree.xAxis.axis.end.x)
    }

    const parameter = [series.data]
    if (series.type !== 'pie') parameter.push(renderTree)
    renderTree.chartArray = calcMain(...parameter)

    return renderTree
  }

  function drawCharts(renderTree: ICharts.IRenderTree) {
    const { xAxis, yAxis, chartArray } = renderTree

    if (xAxis) drawXAxis(ctx, xAxis)
    if (yAxis) drawYAxis(ctx, yAxis)

    drawMain(ctx, chartArray, { renderTree, option }, offsetWidth, offsetHeight)
  }
}

const srcCharts = {
  init: initCanvas
}

export default srcCharts
