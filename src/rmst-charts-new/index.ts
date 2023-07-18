import { Stage } from '../rmst-render'

import * as line from './calcMain/calcLine'
import * as bar from './calcMain/calcBar'
import * as pie from './calcMain/calcPie'

import { createCoordinateSystemElements } from './coordinateSystem'

const rmstCharts = {
  init: (canvasContainer: HTMLElement) => {
    const stage = new Stage({
      container: canvasContainer
    })

    return {
      stage,
      setOption: (innerOption: ICharts.IOption) => {
        stage.removeAllElements()

        const finalSeries = handleSeries(innerOption.series)

        const finalElements = []

        const coordinateSystem = createCoordinateSystemElements(stage, innerOption, finalSeries)
        const XAxisShape = coordinateSystem.cartesian2d.XAxisShape
        const YAxisShape = coordinateSystem.cartesian2d.YAxisShape

        if (coordinateSystem.hasCartesian2d) {
          finalElements.push(XAxisShape.xAxisLine, ...XAxisShape.ticksLines, ...XAxisShape.tickTexts)
          finalElements.push(
            // YAxisShape.yAxisLine,
            ...YAxisShape.ticksLines,
            ...YAxisShape.tickTexts
          )
        }

        const renderElements = finalSeries
          .map(seriesItem => {
            switch (seriesItem.type) {
              case 'line': {
                return line.createRenderElements(stage, seriesItem, coordinateSystem, finalSeries)
              }
              case 'bar': {
                return bar.createRenderElements(stage, seriesItem, coordinateSystem)
              }
              case 'pie': {
                return pie.createRenderElements(stage, seriesItem)
              }
              default: {
                console.log('新图')
              }
            }
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

function handleSeries(series: ICharts.series[]): ICharts.series[] {
  return (
    series
      // 设置默认的 2d 坐标系
      .map(item => {
        const nvItem = { ...item }

        // 饼图没有坐标系
        if (nvItem.type === 'pie') {
          nvItem.coordinateSystem = undefined
          return nvItem
        }

        // 默认坐标系为 二维的直角坐标系
        if (!nvItem.coordinateSystem) {
          nvItem.coordinateSystem = 'cartesian2d'
          return nvItem
        }

        return nvItem
      })
      // 折线图堆叠 data求和计算
      .map((serItem, serIndex) => {
        if (serItem.stack !== 'Total') {
          return serItem
        }

        return {
          ...serItem,
          data: (serItem.data as number[]).map((dataItem, dataIndex) => {
            return (
              dataItem +
              series
                .filter(item => item.stack === 'Total')
                .slice(0, serIndex)
                .map(item => item.data[dataIndex] as number)
                .reduce((prev, cur) => prev + cur, 0)
            )
          })
        } as ICharts.series
      })
  )
}
