import colorAlpha from 'color-alpha'
import { Circle, Line, BoxHidden, pointToFlatArray } from 'rmst-render'

import { colorPalette } from '../constant'
import { getCanvasPxFromRealNumber } from '../utils/convert'
import { IXAxisElements } from '../coordinateSystem/cartesian2d/calcXAxis'
import { IYAxisElements } from '../coordinateSystem/cartesian2d/calcYAxis'
import _Chart from './_chart'
import { style } from '../style'

function calcLineData(
  dataSource: ICharts.LineSeries['data'],
  xAxisData: IXAxisElements['xAxisData'],
  yAxisData: IYAxisElements['yAxisData']
) {
  const { min, realInterval, tickInterval } = yAxisData.tickConstant

  const yAxis_start_y = yAxisData.axis.start.y

  return dataSource.map((dataItem, index) => {
    const { x: tick_x } = xAxisData.ticks[index].start
    const y = getCanvasPxFromRealNumber(dataItem, yAxis_start_y, min, realInterval, tickInterval)

    return { x: tick_x, y: y }
  })
}

const defaultLineSeriesItem = {
  animationDuration: 1000,
  animation: true,
  lineStyle: { width: 2, cap: 'butt', join: 'bevel' },
  symbol: 'circle',
  symbolSize: 3
} as ICharts.LineSeries

const activeDuration = 200

export default class LineMain extends _Chart<ICharts.LineSeries> {
  lineElements: { mainPolyline: BoxHidden; arcs: Circle[] }

  color: string

  opacity = 1

  render(seriesItem: ICharts.LineSeries, index: number) {
    this.seriesItem = { ...defaultLineSeriesItem, ...seriesItem }
    this.color = colorPalette[index]

    const { coordinateSystem, stage } = this.cr
    const finalSeries = this.cr.finalSeries as ICharts.LineSeries[]

    const xAxisData = coordinateSystem.cartesian2d.cartesian2dAxisData.xAxisData
    const yAxisData = coordinateSystem.cartesian2d.cartesian2dAxisData.yAxisData

    const pointData = calcLineData(seriesItem.data, xAxisData, yAxisData)

    const { areaStyle, smooth, step, lineStyle, symbol } = this.seriesItem
    // 计算出 阶梯折线图 要绘制的额外的点
    const finalCoordPoints = smooth ? pointData : calcPointsByUserPoints(pointData, step)

    const boxHidden = new BoxHidden({
      x: xAxisData.ticks[0].start.x - lineStyle.width,
      y: yAxisData.axis.end.y,
      width: this.seriesItem.animation ? 0 : stage.canvasSize.width,
      height: stage.canvasSize.height,
      lineWidth: 0,
      pointerEvents: 'none'
    })

    if (finalCoordPoints.length !== 1) {
      const mainLinePoints = pointToFlatArray(finalCoordPoints)

      // 主折线
      const mainLine = new Line({
        name: 'mainline',
        points: mainLinePoints,
        strokeStyle: this.color,
        lineWidth: lineStyle.width,
        lineCap: lineStyle.cap,
        lineJoin: lineStyle.join,
        smooth,
        opacity: this.opacity
      })

      if (areaStyle) {
        const createArea = () => {
          const prevSeries = finalSeries[index - 1]

          const prevPointData =
            index === 0
              ? [
                  { x: finalCoordPoints.at(0).x, y: xAxisData.axis.start.y },
                  { x: finalCoordPoints.at(-1).x, y: xAxisData.axis.end.y }
                ]
              : calcLineData(prevSeries.data as number[], xAxisData, yAxisData)

          const calcAreaFillStyle = () => {
            // 是数组则认为是渐变
            if (Array.isArray(areaStyle.color)) {
              const max_y = Math.max(...pointData.map(item => item.y))
              const min_y = Math.min(...prevPointData.map(item => item.y))

              const gradient = stage.ctx.createLinearGradient(0, 0, max_y, min_y)
              areaStyle.color.forEach(item => {
                gradient.addColorStop(
                  item.offset,
                  areaStyle.opacity ? colorAlpha(item.color, areaStyle.opacity) : item.color
                )
              })
              return gradient
            }

            return areaStyle.color || colorAlpha(this.color, 0.6)
          }

          // 注意点的顺序是 从右向左的
          const prevLinePoints = pointToFlatArray(prevPointData.reverse())

          const mainLinePath2DCopy = new Path2D(mainLine.path2D)
          mainLinePath2DCopy.lineTo(prevLinePoints[0], prevLinePoints[1])

          const prevLinePath2D = new Line({
            points: prevLinePoints,
            smooth: index === 0 ? false : prevSeries.smooth,
            lineWidth: 0
          }).path2D

          prevLinePath2D.lineTo(mainLinePoints[0], mainLinePoints[1])
          prevLinePath2D.addPath(mainLinePath2DCopy)

          const innerSingleArea = new Line({
            name: 'innerSingleArea',
            path2D: prevLinePath2D,
            fillStyle: calcAreaFillStyle() as CanvasFillStrokeStyles['fillStyle'],
            strokeStyle: 'transparent',
            closed: true,
            lineWidth: 0,
            cursor: 'pointer',
            opacity: this.opacity
          })

          innerSingleArea.onmouseenter = () => {
            innerSingleArea.animateCartoon({ opacity: 0.9 }, { duration: 200 })
          }
          innerSingleArea.onmouseleave = () => {
            innerSingleArea.animateCartoon({ opacity: 1 }, { duration: 200 })
          }

          return innerSingleArea
        }
        boxHidden.append(createArea())
      }

      boxHidden.append(mainLine)
    }

    let arcs: Circle[] = []
    if (symbol !== 'none') {
      arcs = this.createSymbol(pointData)
    }

    this.lineElements = { mainPolyline: boxHidden, arcs }
  }

  createSymbol(pointData) {
    const initRadius = 0

    const arcs = pointData.map(item => {
      const arcItem = new Circle({
        x: item.x,
        y: item.y,
        radius: this.seriesItem.animation ? initRadius : this.seriesItem.symbolSize,
        fillStyle: 'white',
        strokeStyle: this.color,
        lineWidth: 2,
        cursor: 'pointer',
        opacity: this.opacity,
        zIndex: 3
      })

      arcItem.onmouseenter = () => {
        this.arcActive(arcItem)
      }

      arcItem.onmouseleave = () => {
        this.arcCancelActive(arcItem)
      }

      return arcItem
    })

    return arcs
  }

  afterAppendStage() {
    if (!this.seriesItem.animation) {
      return
    }
    const { stage, coordinateSystem } = this.cr

    const xAxisData = coordinateSystem.cartesian2d.cartesian2dAxisData.xAxisData

    const elapsedIndex = []
    this.lineElements.mainPolyline.animateCartoon(
      { width: stage.canvasSize.width },
      {
        duration: this.seriesItem.animationDuration,
        easing: 'quadraticInOut',
        during: (percent, newState) => {
          if (this.seriesItem.symbol === 'none') {
            return
          }
          const currentWidth = xAxisData.axis.start.x + (newState.width as number)
          const curIndex = Math.floor(currentWidth / xAxisData.axis.xAxisInterval)

          const prev = elapsedIndex.at(-1) ?? 0
          for (let i = prev; i <= curIndex; i++) {
            elapsedIndex.push(i)
            this.lineElements.arcs[i]?.animateCartoon({ radius: this.seriesItem.symbolSize }, { duration: 300 })
          }
        }
      }
    )
  }

  private arcActive(arcItem: Circle) {
    arcItem.animateCartoon({ radius: this.seriesItem.symbolSize + 4 }, { duration: activeDuration })
  }

  private arcCancelActive(arcItem: Circle) {
    arcItem.animateCartoon({ radius: this.seriesItem.symbolSize }, { duration: activeDuration })
  }

  select() {
    this.lineElements.arcs.forEach(item => {
      item.animateCartoon({ opacity: 1 }, { duration: activeDuration })

      this.arcActive(item)
    })
  }

  cancelSelect() {
    this.lineElements.mainPolyline.children.forEach(item => {
      item.animateCartoon({ opacity: 0.1 }, { duration: activeDuration })
    })
    this.lineElements.arcs.forEach(item => {
      item.animateCartoon({ opacity: 0.1 }, { duration: activeDuration })
    })
  }

  resetNormal() {
    this.lineElements.mainPolyline.children.forEach(item => {
      item.animateCartoon({ opacity: 1 }, { duration: activeDuration })
    })
    this.lineElements.arcs.forEach(item => {
      item.animateCartoon({ opacity: 1 }, { duration: activeDuration })

      this.arcCancelActive(item)
    })
  }

  getTooltipContent(index: number) {
    return `
    <div style="${style.row}">
      <div style="${style.tagSign(this.color)}"></div> 
      <div>${this.seriesItem.name || ''}</div>
      <div style="${style.value}">${this.seriesItem.data[index]}</div>
    </div>`
  }
}

// 阶梯折线图 - smooth 应该失效
function calcPointsByUserPoints(pointData: ICoord[], step: ICharts.LineSeries['step']): ICoord[] {
  if (!step) return pointData

  const finalPointsCoord = pointData.reduce((acc, item, idx, originArr) => {
    if (idx === originArr.length - 1) {
      return acc.concat(item)
    }

    const addPoint = []

    const nextPoint = originArr[idx + 1]

    // 在某个点开始的时候拐弯
    if (step === 'start') {
      addPoint.push({ x: item.x, y: nextPoint.y })
    }

    // 结束的时候拐弯
    if (step === 'end') {
      addPoint.push({ x: nextPoint.x, y: item.y })
    }

    if (step === 'middle') {
      const centerX = (item.x + nextPoint.x) / 2
      addPoint.push({ x: centerX, y: item.y })
      addPoint.push({ x: centerX, y: nextPoint.y })
    }

    return acc.concat(item, addPoint)
  }, [])

  return finalPointsCoord
}
