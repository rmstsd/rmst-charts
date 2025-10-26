import { ICoord, Line } from 'rmst-render'
import WhiteboardEditor from '../whiteboardEditor'
import { isNil } from 'es-toolkit'
import OpenColor from 'open-color'

export class RefLine {
  constructor(private wbEditor: WhiteboardEditor) {}

  refLine = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } }

  getOffset(point: ICoord, excludeGraphIds: string[]) {
    const refGraphs = this.wbEditor.graphLayer.children.filter(item => !excludeGraphIds.includes(item.id))

    const vLineMap = new Map<number, number[]>()

    for (const item of refGraphs) {
      const { mt, width, height } = item.data

      vLineMap.set(mt.e, [mt.f, mt.f + height])
      vLineMap.set(mt.e + width, [mt.f, mt.f + height])
    }

    const xks = [...vLineMap.keys()]

    const minX = point.x
    const maxX = point.y
    const closestMinX = getClosestVal(xks, minX)
    const closestMaxX = getClosestVal(xks, maxX)

    const distMinX = Math.abs(closestMinX - minX)
    const distMaxX = Math.abs(closestMaxX - maxX)

    // 找到最近距离
    const closestXDist = Math.min(distMinX, distMaxX)

    const isEqualNum = (a: number, b: number) => Math.abs(a - b) < 0.00001
    const tol = 5 // 最小距离不能超过这个

    let offsetX
    let kx = closestMinX
    // 确认偏移值 offsetX
    if (closestXDist <= tol) {
      // 这里考虑了一下浮点数误差
      if (isEqualNum(closestXDist, distMinX)) {
        kx = closestMinX
        offsetX = closestMinX - minX
      } else if (isEqualNum(closestXDist, distMaxX)) {
        kx = closestMaxX
        offsetX = closestMaxX - maxX
      }
    }

    if (!isNil(offsetX)) {
      const values = vLineMap.get(kx).concat(point.y, point.y)
      const minY = Math.min(...values)
      const maxY = Math.max(...values)

      this.refLine = { start: { x: kx, y: minY }, end: { x: kx, y: maxY } }
    } else {
      this.refLine = null
    }

    return { x: offsetX, y: 0 }
  }

  drawRefLine() {
    const { refLineLayer } = this.wbEditor
    refLineLayer.removeAllChildren()

    if (this.refLine) {
      const line = new Line({
        points: [this.refLine.start.x, this.refLine.start.y, this.refLine.end.x, this.refLine.end.y],
        strokeStyle: OpenColor.red[5],
        pointerEvents: 'none'
      })

      refLineLayer.append(line)
    }
  }
}

// 获取最近的
function getClosestVal(ks: number[], x: number) {
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
