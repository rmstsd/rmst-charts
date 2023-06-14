import { Stage } from '../rmst-render'

import { createRenderElements as createXAxisElements, IXAxisElements } from './calcAxis/calcXAxis'
import { createRenderElements as createYAxisElements, IYAxisElements } from './calcAxis/calcYAxis'

import * as line from './calcMain/calcLine'
import * as bar from './calcMain/calcBar'
import * as pie from './calcMain/calcPie'

const map = { line, bar, pie }

const rmstCharts = {
  init: (canvasContainer: HTMLElement) => {
    const stage = new Stage({
      container: canvasContainer
    })

    return {
      stage,
      setOption: (innerOption: ICharts.IOption) => {
        stage.removeAllElements()

        const finalSeries = calcSeries(innerOption.series)
        const chartTypes = finalSeries.map(item => item.type) // pie line bar

        const finalElements = []

        let XAxisShape: IXAxisElements
        let YAxisShape: IYAxisElements
        // 绘制坐标轴
        if (!chartTypes.includes('pie')) {
          XAxisShape = createXAxisElements(stage, innerOption)
          YAxisShape = createYAxisElements(stage, finalSeries)

          finalElements.push(
            XAxisShape.xAxisLine,
            ...XAxisShape.ticksLines,
            ...XAxisShape.tickTexts,

            // YAxisShape.yAxisLine,
            ...YAxisShape.ticksLines,
            ...YAxisShape.tickTexts
          )
        }

        const renderElements = finalSeries
          .map(seriesItem => {
            const { createRenderElements } = map[seriesItem.type]

            return createRenderElements(
              stage,
              seriesItem,
              XAxisShape?.xAxisData,
              YAxisShape?.yAxisData,
              finalSeries
            )
          })
          .reverse() // 堆叠面积图需要倒序绘制

        const afterAppendStageTasks = []

        renderElements.forEach(item => {
          if (item.elements) finalElements.push(...item.elements)
          if (item.afterAppendStage) afterAppendStageTasks.push(item.afterAppendStage)
        })

        stage.append(finalElements)

        afterAppendStageTasks.forEach(task => task?.())
      }
    }
  }
}

export type IChartInstance = {
  setOption: (option) => void
}

export default rmstCharts

// 折线图堆叠 data求和计算
function calcSeries(series: ICharts.series[]) {
  return series.map((serItem, serIndex) => {
    if (serItem.stack !== 'Total') {
      return serItem
    }

    return {
      ...serItem,
      data: serItem.data.map((dataItem, dataIndex) => {
        return (
          dataItem +
          series
            .filter(item => item.stack === 'Total')
            .slice(0, serIndex)
            .map(item => item.data[dataIndex])
            .reduce((prev, cur) => prev + cur, 0)
        )
      })
    }
  })
}
