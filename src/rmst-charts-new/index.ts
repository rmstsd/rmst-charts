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
      setOption: (innerOption: ICharts.IOption) => {
        stage.removeAllElements()

        const series = [].concat(innerOption.series)

        const chartTypes = series.map(item => item.type) // pie line bar

        const finalElements = []

        let XAxisShape: IXAxisElements
        let YAxisShape: IYAxisElements
        // 绘制坐标轴
        if (!chartTypes.includes('pie')) {
          XAxisShape = createXAxisElements(stage, innerOption)
          YAxisShape = createYAxisElements(stage, innerOption)

          finalElements.push(
            XAxisShape.xAxisLine,
            ...XAxisShape.ticksLines,
            ...XAxisShape.tickTexts,

            // YAxisShape.yAxisLine,
            ...YAxisShape.ticksLines,
            ...YAxisShape.tickTexts
          )
        }

        const renderElements = series.map(seriesItem => {
          const { createRenderElements } = map[seriesItem.type]

          return createRenderElements(stage, seriesItem, XAxisShape?.xAxisData, YAxisShape?.yAxisData)
        })

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
