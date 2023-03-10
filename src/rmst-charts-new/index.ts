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

        const chartType = innerOption.series.type // pie line bar

        const { createRenderElements } = map[chartType]

        const finalElements = []

        let XAxisShape: IXAxisElements
        let YAxisShape: IYAxisElements
        // 绘制坐标轴
        if (chartType !== 'pie') {
          XAxisShape = createXAxisElements(stage, innerOption)
          YAxisShape = createYAxisElements(stage, innerOption)

          finalElements.push(
            XAxisShape.xAxisLine,
            ...XAxisShape.ticksLines,
            ...XAxisShape.tickTexts,

            YAxisShape.yAxisLine,
            ...YAxisShape.ticksLines,
            ...YAxisShape.tickTexts
          )
        }

        const { elements, afterAppendStage } = createRenderElements(
          stage,
          innerOption,
          XAxisShape?.xAxisData,
          YAxisShape?.yAxisData
        )
        if (elements) finalElements.push(...elements)

        // console.log('finalElements', finalElements)
        stage.append(finalElements)

        afterAppendStage?.()
      }
    }
  }
}

export type IChartInstance = {
  setOption: (option) => void
}

export default rmstCharts
