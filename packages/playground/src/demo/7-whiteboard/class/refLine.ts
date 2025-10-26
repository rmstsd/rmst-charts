import { ICoord, Line } from 'rmst-render'
import WhiteboardEditor from '../whiteboardEditor'
import { isNil } from 'es-toolkit'
import OpenColor from 'open-color'

export class RefLine {
  constructor(private wbEditor: WhiteboardEditor) {}

  refLine = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } }

  getOffset(points: ICoord[], excludeGraphIds: string[]) {
    const refGraphs = this.wbEditor.graphLayer.children.filter(item => !excludeGraphIds.includes(item.id))

    const vLineMap = new Map<number, number[]>()

    for (const item of refGraphs) {
      const { mt, width, height } = item.data

      vLineMap.set(mt.e, [mt.f, mt.f + height])
      vLineMap.set(mt.e + width / 2, [mt.f, mt.f + height])
      vLineMap.set(mt.e + width, [mt.f, mt.f + height])
    }

    const xks = [...vLineMap.keys()]

    let point = { x: 0, y: 0 }
    let closestXDist = Infinity
    let realOffsetX = 0
    let closestMinX_ans
    for (const item of points) {
      const closestMinX = getClosestVal(xks, item.x)
      const distMinX = Math.abs(closestMinX - item.x)

      if (distMinX < closestXDist) {
        closestXDist = distMinX

        point = item
        realOffsetX = closestMinX - item.x
        closestMinX_ans = closestMinX
      }
    }

    const isEqualNum = (a: number, b: number) => Math.abs(a - b) < 0.00001
    const tol = 5 // 最小距离不能超过这个

    let offsetX
    // 确认偏移值 offsetX
    if (closestXDist <= tol) {
      offsetX = realOffsetX
      // 这里考虑了一下浮点数误差
      // if (isEqualNum(closestXDist, distMinX)) {
      //   offsetX = closestMinX - minX
      // } else if (isEqualNum(closestXDist, distMaxX)) {
      //   offsetX = closestMaxX - maxX
      // }
    }

    if (!isNil(offsetX)) {
      const xs = points.filter(item => item.x + offsetX === closestMinX_ans).map(item => item.y)
      const values = vLineMap.get(closestMinX_ans).concat(xs)
      const minY = Math.min(...values)
      const maxY = Math.max(...values)

      this.refLine = {
        start: this.wbEditor.coordSys.scene2World({ x: closestMinX_ans, y: minY }),
        end: this.wbEditor.coordSys.scene2World({ x: closestMinX_ans, y: maxY })
      }
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
