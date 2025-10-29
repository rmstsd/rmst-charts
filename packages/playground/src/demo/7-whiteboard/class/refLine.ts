import { ICoord, Line, mergeBox } from 'rmst-render'
import WhiteboardEditor from '../whiteboardEditor'
import { isNil, isNotNil } from 'es-toolkit'
import OpenColor from 'open-color'
import { applyToPoint } from 'transformation-matrix'

// 吸附线
export class RefLine {
  constructor(private wbEditor: WhiteboardEditor) {}

  private refLines: { start: ICoord; end: ICoord }[] = []
  private dots: ICoord[] = []

  getOffset(points: ICoord[], excludeGraphIds: string[]) {
    const refGraphs = this.wbEditor.graphLayer.children.filter(item => !excludeGraphIds.includes(item.id))

    const x_map = new Map<number, number[]>()
    for (const element of points) {
      if (x_map.has(element.x)) {
        const value = x_map.get(element.x)
        value.push(element.y)
      } else {
        x_map.set(element.x, [element.y])
      }
    }

    const y_map = new Map<number, number[]>()
    for (const element of points) {
      if (y_map.has(element.y)) {
        const value = y_map.get(element.y)
        value.push(element.x)
      } else {
        y_map.set(element.y, [element.x])
      }
    }

    const x_keys = [...x_map.keys()]
    const y_keys = [...y_map.keys()]

    const { ruler } = this.wbEditor

    const verticalRulers = ruler.rulerData.vertical.filter(item => !excludeGraphIds.includes(item.id)).map(item => item.pos)
    const horizontalRulers = ruler.rulerData.horizontal.filter(item => !excludeGraphIds.includes(item.id)).map(item => item.pos)

    const vLineMap = new Map<number, number[]>()

    for (const item of refGraphs) {
      const tl = applyToPoint(item.data.mt, { x: 0, y: 0 })
      const tr = applyToPoint(item.data.mt, { x: item.data.width, y: 0 })
      const br = applyToPoint(item.data.mt, { x: item.data.width, y: item.data.height })
      const bl = applyToPoint(item.data.mt, { x: 0, y: item.data.height })
      const selRect = { tl, tr, br, bl }
      const { minX, minY, maxX, maxY } = mergeBox([selRect])

      const value = [minY, maxY]
      vLineMap.set(minX, value)
      vLineMap.set((minX + maxX) / 2, value)
      vLineMap.set(maxX, value)
    }
    const v_xks = [...vLineMap.keys()]

    const hLineMap = new Map<number, number[]>()
    for (const item of refGraphs) {
      const tl = applyToPoint(item.data.mt, { x: 0, y: 0 })
      const tr = applyToPoint(item.data.mt, { x: item.data.width, y: 0 })
      const br = applyToPoint(item.data.mt, { x: item.data.width, y: item.data.height })
      const bl = applyToPoint(item.data.mt, { x: 0, y: item.data.height })
      const selRect = { tl, tr, br, bl }
      const { minX, minY, maxX, maxY } = mergeBox([selRect])

      const value = [minX, maxX]
      hLineMap.set(minY, value)
      hLineMap.set((minY + maxY) / 2, value)
      hLineMap.set(maxY, value)
    }
    const h_xks = [...hLineMap.keys()]

    const ddd_x_list = x_keys.map(item => {
      let closestMinX = getClosestVal(v_xks, item)
      const closestMinX_ruler = getClosestVal(verticalRulers, item)

      let isSnappingRuler = false
      if (closestMinX_ruler < closestMinX) {
        closestMinX = closestMinX_ruler
        isSnappingRuler = true
      }

      const distMinX = Math.abs(closestMinX - item)

      return { distMinX, realOffsetX: closestMinX - item, closestMinX, isSnappingRuler }
    })
    const closestXDist = Math.min(...ddd_x_list.map(item => item.distMinX))

    const ddd_y_list = y_keys.map(item => {
      let closestMinY = getClosestVal(h_xks, item)

      const closestMinY_ruler = getClosestVal(horizontalRulers, item)

      let isSnappingRuler = false
      if (closestMinY_ruler < closestMinY) {
        closestMinY = closestMinY_ruler
        isSnappingRuler = true
      }

      const distMinY = Math.abs(closestMinY - item)

      return { distMinY, realOffsetY: closestMinY - item, closestMinY, isSnappingRuler }
    })
    const closestYDist = Math.min(...ddd_y_list.map(item => item.distMinY))

    const tol = 5 / this.wbEditor.camera.zoom

    let offsetX
    let offsetY

    if (closestXDist <= tol) {
      const realOffsetX = ddd_x_list.find(item => item.distMinX === closestXDist).realOffsetX
      offsetX = realOffsetX
    }

    if (closestYDist <= tol) {
      const realOffsetY = ddd_y_list.find(item => item.distMinY === closestYDist).realOffsetY
      offsetY = realOffsetY
    }

    this.refLines = []
    this.dots = []

    if (!isNil(offsetX)) {
      // 垂直线
      const x_refLines = ddd_x_list
        .filter(item => !item.isSnappingRuler && item.distMinX === closestXDist)
        .map(dItem => {
          const xs = points.filter(item => item.x + offsetX === dItem.closestMinX).map(item => item.y)

          // 当垂直和水平都吸附的时候, 需要处理一下对方的偏移量
          if (isNotNil(offsetY)) {
            xs.forEach((item, index) => {
              xs[index] = item + offsetY
            })
          }

          const values = vLineMap.get(dItem.closestMinX).concat(xs)
          const minY = Math.min(...values)
          const maxY = Math.max(...values)

          return {
            start: { x: dItem.closestMinX, y: minY },
            end: { x: dItem.closestMinX, y: maxY },
            dots: values.map(item => ({ x: dItem.closestMinX, y: item }))
          }
        })

      const { coordSys } = this.wbEditor

      this.refLines.push(
        ...x_refLines.map(item => ({ start: coordSys.scene2World(item.start), end: coordSys.scene2World(item.end) }))
      )
      this.dots.push(...x_refLines.flatMap(item => item.dots))
    }
    if (!isNil(offsetY)) {
      // 水平线
      const y_refLines = ddd_y_list
        .filter(item => !item.isSnappingRuler && item.distMinY === closestYDist)
        .map(dItem => {
          const ys = points.filter(item => item.y + offsetY === dItem.closestMinY).map(item => item.x)

          if (isNotNil(offsetX)) {
            ys.forEach((item, index) => {
              ys[index] = item + offsetX
            })
          }

          const values = hLineMap.get(dItem.closestMinY).concat(ys)
          const minX = Math.min(...values)
          const maxX = Math.max(...values)

          return {
            start: { x: minX, y: dItem.closestMinY },
            end: { x: maxX, y: dItem.closestMinY },
            dots: values.map(item => ({ x: item, y: dItem.closestMinY }))
          }
        })

      const { coordSys } = this.wbEditor
      this.refLines.push(
        ...y_refLines.map(item => ({ start: coordSys.scene2World(item.start), end: coordSys.scene2World(item.end) }))
      )
      this.dots.push(...y_refLines.flatMap(item => item.dots))
    }

    return { x: offsetX ?? 0, y: offsetY ?? 0 }
  }

  drawRefLine() {
    const { refLineLayer } = this.wbEditor
    refLineLayer.removeAllChildren()

    this.refLines.forEach(item => {
      const line = new Line({ points: [item.start.x, item.start.y, item.end.x, item.end.y], strokeStyle: OpenColor.red[5] })
      refLineLayer.append(line)
    })

    const set = new Set<string>() // 去重
    this.dots.forEach(item => {
      if (set.has(`${item.x},${item.y}`)) {
        return
      }
      set.add(`${item.x},${item.y}`)

      item = this.wbEditor.coordSys.scene2World(item)

      const size = 6
      const halfSize = size / 2

      const tl = { x: item.x - halfSize, y: item.y - halfSize }
      const br = { x: item.x + halfSize, y: item.y + halfSize }

      const line_1 = new Line({ points: [tl.x, tl.y, br.x, br.y], strokeStyle: OpenColor.red[5] })
      const line_2 = new Line({ points: [tl.x, br.y, br.x, tl.y], strokeStyle: OpenColor.red[5] })

      refLineLayer.append(line_1, line_2)
    })
  }

  clearRefLine() {
    this.refLines = []
    this.dots = []
    this.drawRefLine()
  }
}

// 获取最近的
function getClosestVal(ks: number[], x: number) {
  if (ks.length === 0) {
    return Infinity
  }

  let ans = ks[0]
  let d = Math.abs(ks[0] - x)
  for (let i = 1; i < ks.length; i++) {
    if (Math.abs(ks[i] - x) < d) {
      d = Math.abs(ks[i] - x)
      ans = ks[i]
    }
  }

  return ans
}

const isEqualNum = (a: number, b: number) => Math.abs(a - b) < 0.00001
