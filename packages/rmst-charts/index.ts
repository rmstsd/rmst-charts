import { Stage } from 'rmst-render'

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
        if (coordinateSystem.hasCartesian2d) {
          finalElements.push(...coordinateSystem.cartesian2d.cartesian2dAllShapes)
        }
        if (coordinateSystem.hasPolar) {
          finalElements.push(...coordinateSystem.polar.polarAllShapes)
        }

        const mainChartsElements = finalSeries
          .map(seriesItem => {
            switch (seriesItem.type) {
              case 'line': {
                return line.createRenderElements(
                  stage,
                  seriesItem,
                  coordinateSystem,
                  finalSeries as ICharts.LineSeries[]
                )
              }
              case 'bar': {
                return bar.createRenderElements(stage, seriesItem, coordinateSystem)
              }
              case 'pie': {
                return pie.createRenderElements(stage, seriesItem)
              }
              default: {
                console.log('新图待实现')
              }
            }
          })
          .reverse() // 堆叠面积图需要倒序绘制 -错误的做法, 需要优化代码

        const afterAppendStageTasks = []

        mainChartsElements.forEach(item => {
          if (item.elements) {
            finalElements.push(...item.elements)
          }

          if (item.afterAppendStage) {
            afterAppendStageTasks.push(item.afterAppendStage)
          }
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
        switch (serItem.type) {
          case 'line':
            if (serItem.stack !== 'Total') {
              return serItem
            }

            const lineSeries = series.filter(item => item.type === 'line') as ICharts.LineSeries[]

            return {
              ...serItem,
              data: serItem.data.map((dataItem, dataIndex) => {
                return (
                  dataItem +
                  lineSeries
                    .filter(item => item.stack === 'Total')
                    .slice(0, serIndex)
                    .map(item => item.data[dataIndex])
                    .reduce((prev, cur) => prev + cur, 0)
                )
              })
            }

          default:
            return serItem
        }
      })
  )
}
