// @ts-check
import { initCanvas, initToolTip } from './initElement.js'
import { getXAxis, drawXAxis } from './calcXAxis.js'
import { getYAxis, drawYAxis } from './calcYAxis.js'
import { getCandle, drawCandle } from './calcCandle.js'

import drawAssistLine from './drawAssistLine.js'
import { generateDataSource } from './dataSource.js'
import { renderTree } from './renderTree.js'
import { getYTickFromOffsetY, getActiveIndexFromOffsetX } from './convert.js'
import { defaultCandleCount, minCandleCount } from './constant.js'
import { isOuterRect } from './utils.js'

onload = () => {
  const canvasContainer = document.querySelector('.canvas-container')
  const { canvasElement, ctx } = initCanvas(canvasContainer)
  const { clientWidth, clientHeight } = canvasElement
  const canvasElementRect = canvasElement.getBoundingClientRect()

  let dataSource = []
  let start = 0
  let end = 0

  let isDownBool = false
  let mousedownOffsetX = 0

  let activeIndex = null
  let toolTip = null

  const [countInput, minInput, maxInput] = document.querySelectorAll('input')

  const genDrawBtn = document.querySelector('.gen-draw')
  genDrawBtn.addEventListener('click', handleClickGenDraw)

  canvasElement.addEventListener('mousedown', handleMousedown)
  canvasElement.addEventListener('mousemove', handleMousemove)
  canvasElement.addEventListener('mouseleave', resetActiveState)
  canvasElement.addEventListener('wheel', handleWheel)

  document.addEventListener('mouseup', () => (isDownBool = false))
  document.addEventListener('mousemove', handleDocumentMousemove)

  handleClickGenDraw()

  // 点击按钮
  function handleClickGenDraw() {
    dataSource = generateDataSource(Number(countInput.value), Number(minInput.value), Number(maxInput.value))
    console.log(dataSource)

    // 初始化的时候显示末尾的数据
    start = dataSource.length - defaultCandleCount
    end = dataSource.length

    reRenderCanvas()
  }

  // 截取数组, 计算 renderTree, 重新绘制
  function reRenderCanvas() {
    calcRenderTree(dataSource.slice(start, end))
    drawKLineChart()

    // console.log('原始数据', dataSource)
    // console.log('canvas 上所有东西的位置信息 renderTree', renderTree)
  }

  // 隐藏 tooltip 与 辅助十字线, 恢复初始状态
  function resetActiveState() {
    activeIndex = null
    renderTree.assistLine.visible = false
    drawKLineChart()

    if (!toolTip) return
    updateTooltipContainer(false, toolTip.toolTipElement)
  }

  // 计算所有 renderTree
  function calcRenderTree(dataSource) {
    // x轴的 renderTree
    const xAxis = getXAxis(ctx, dataSource, clientWidth, clientHeight)
    renderTree.xAxis = xAxis

    // y轴的 renderTree
    const yAxis = getYAxis(ctx, dataSource, clientHeight)
    renderTree.yAxis = yAxis

    // k线图的数据
    const candleArray = getCandle(dataSource, xAxis, yAxis)
    renderTree.candleArray = candleArray
  }

  // 绘制 K线图
  function drawKLineChart() {
    ctx.clearRect(0, 0, clientWidth, clientHeight)

    const { xAxis, yAxis, candleArray } = renderTree

    drawXAxis(ctx, xAxis) // 画 x轴
    drawYAxis(ctx, yAxis) // 画 y轴
    drawCandle(ctx, candleArray, activeIndex) // 画蜡烛图

    if (renderTree.assistLine.visible) drawAssistLine(ctx, renderTree.assistLine, '#aaa') // 画十字辅助线
  }

  // 更新 tooltip 容器的位置 与 显示隐藏
  function updateTooltipContainer(visible, toolTipElement, canvasWidth, canvasHeight, translateX, translateY) {
    toolTipElement.style.display = visible ? 'block' : 'none'
    if (!visible) return

    const { offsetWidth, offsetHeight } = toolTipElement
    const offsetDistance = 10

    const max_x = canvasWidth - offsetWidth - offsetDistance
    const max_y = canvasHeight - offsetHeight - offsetDistance

    if (translateX > max_x) translateX = translateX - offsetWidth - offsetDistance
    else translateX += offsetDistance

    if (translateY > max_y) translateY = translateY - offsetHeight - offsetDistance
    else translateY += offsetDistance

    toolTipElement.style.transform = `translate(${translateX}px, ${translateY}px)`
  }

  // 更新内容
  function updateTooltipContent(elementArray, dataItem) {
    const [dateEl, openPriceEl, closePriceEl, topPriceEl, bottomPriceEl] = elementArray

    dateEl.innerText = dataItem.date
    openPriceEl.innerText = dataItem.openPrice
    closePriceEl.innerText = dataItem.closePrice
    topPriceEl.innerText = dataItem.topPrice
    bottomPriceEl.innerText = dataItem.bottomPrice
  }

  // 更新辅助线的 renderTree
  function updateAssistLine(vertical_x, offsetY, realTimeTickValue) {
    const horizontal = { start: [0, offsetY], end: [clientWidth, offsetY], text: realTimeTickValue }
    const vertical = { start: [vertical_x, 0], end: [vertical_x, clientHeight] }
    renderTree.assistLine = { visible: true, horizontal, vertical }
  }

  // 逻辑归属问题 数据归属
  function handleMousemove(evt) {
    const { offsetX, offsetY } = evt

    const { xAxis, yAxis } = renderTree
    const xAxis_start_x = xAxis.axis.start[0]
    const xAxis_end_x = xAxis.axis.end[0]
    const yAxis_start_y = yAxis.axis.start[1]
    const yAxis_end_y = yAxis.axis.end[1]

    const { xAxisInterval } = xAxis.axis

    // 如果鼠标移出了图表坐标系
    if (isOuterRect(offsetX, offsetY, xAxis_start_x, xAxis_end_x, yAxis_start_y, yAxis_end_y)) {
      resetActiveState()
      return
    }

    const { tickInterval, realInterval, min } = yAxis.tickConstant

    const { assistY, realTickValue } = getYTickFromOffsetY(offsetY, yAxis_start_y, tickInterval, realInterval, min, yAxis.ticks)

    activeIndex = getActiveIndexFromOffsetX(offsetX, xAxis_start_x, xAxisInterval)
    const verticalX = xAxis.ticks[activeIndex].start[0]

    // 更新辅助十字线的 位置信息 和 实时刻度
    updateAssistLine(verticalX, assistY, realTickValue)
    drawKLineChart()

    if (!toolTip) toolTip = initToolTip(canvasContainer)

    updateTooltipContainer(true, toolTip.toolTipElement, clientWidth, clientHeight, offsetX, offsetY)
    updateTooltipContent(toolTip.valueElementArray, dataSource[start + activeIndex])
  }

  function handleMousedown(evt) {
    const { offsetX, offsetY } = evt
    const { xAxis, yAxis } = renderTree
    const xAxis_start_x = xAxis.axis.start[0]
    const xAxis_end_x = xAxis.axis.end[0]
    const yAxis_start_y = yAxis.axis.start[1]
    const yAxis_end_y = yAxis.axis.end[1]

    if (isOuterRect(offsetX, offsetY, xAxis_start_x, xAxis_end_x, yAxis_start_y, yAxis_end_y)) {
      return
    }

    isDownBool = true
    mousedownOffsetX = evt.offsetX
  }

  // 滚轮事件
  function handleWheel(evt) {
    evt.preventDefault()

    const changedCount = 2

    if (evt.wheelDelta > 0) {
      // 放大
      if (end - start <= minCandleCount) return

      start = start + changedCount
      end = end - changedCount
    } else {
      // 缩小
      if (start === 0 && end === dataSource.length) return

      let nvStart = start - changedCount
      let nvEnd = end + changedCount

      if (nvStart < 0) nvStart = 0
      if (nvEnd > dataSource.length) nvEnd = dataSource.length

      start = nvStart
      end = nvEnd
    }

    reRenderCanvas()
  }

  function handleDocumentMousemove(evt) {
    if (!isDownBool) return

    const { clientX } = evt
    const offsetCanvasLeft = clientX - canvasElementRect.left
    const offsetValue = offsetCanvasLeft - mousedownOffsetX

    const { xAxisInterval } = renderTree.xAxis.axis

    // 如果移动距离不够
    if (Math.abs(offsetValue) < xAxisInterval) return

    if (offsetValue > 0) {
      // 鼠标向右移动
      const nvStart = start - 1
      const nvEnd = end - 1

      if (nvStart < 0) return

      start = nvStart
      end = nvEnd
    } else {
      // 鼠标向左移动
      const nvStart = start + 1
      const nvEnd = end + 1

      if (nvEnd > dataSource.length) return

      start = nvStart
      end = nvEnd
    }

    reRenderCanvas()

    mousedownOffsetX = offsetCanvasLeft
  }
}
