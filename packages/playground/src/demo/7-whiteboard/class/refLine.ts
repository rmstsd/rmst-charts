import { ICoord, Line } from 'rmst-render'
import WhiteboardEditor from '../whiteboardEditor'
import { isNil } from 'es-toolkit'
import OpenColor from 'open-color'

export class RefLine {
  constructor(private wbEditor: WhiteboardEditor) {}

  refLine = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } }

  refLines = [] as { start: ICoord; end: ICoord }[]

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

    const x_keys = [...x_map.keys()]

    const vLineMap = new Map<number, number[]>()
    for (const item of refGraphs) {
      const { mt, width, height } = item.data

      vLineMap.set(mt.e, [mt.f, mt.f + height])
      vLineMap.set(mt.e + width / 2, [mt.f, mt.f + height])
      vLineMap.set(mt.e + width, [mt.f, mt.f + height])
    }

    const v_xks = [...vLineMap.keys()]

    // let closestXDist = Infinity
    // let realOffsetX = 0
    // let closestMinX_ans

    const ddd = x_keys.map(item => {
      const closestMinX = getClosestVal(v_xks, item)
      const distMinX = Math.abs(closestMinX - item)

      return {
        distMinX,
        realOffsetX: closestMinX - item,
        closestMinX
      }
    })

    const closestXDist = Math.min(...ddd.map(item => item.distMinX))

    // for (const item of x_keys) {
    //   const closestMinX = getClosestVal(v_xks, item)
    //   const distMinX = Math.abs(closestMinX - item)

    //   if (distMinX < closestXDist) {
    //     closestXDist = distMinX

    //     realOffsetX = closestMinX - item
    //     closestMinX_ans = closestMinX
    //   }
    // }

    const isEqualNum = (a: number, b: number) => Math.abs(a - b) < 0.00001
    const tol = 5 // 最小距离不能超过这个

    let offsetX
    // 确认偏移值 offsetX
    if (closestXDist <= tol) {
      const realOffsetX = ddd.find(item => item.distMinX === closestXDist).realOffsetX
      offsetX = realOffsetX
    }

    if (!isNil(offsetX)) {
      const refLines = ddd
        .filter(item => item.distMinX === closestXDist)
        .map(dItem => {
          const xs = points.filter(item => item.x + offsetX === dItem.closestMinX).map(item => item.y)
          const values = vLineMap.get(dItem.closestMinX).concat(xs)
          const minY = Math.min(...values)
          const maxY = Math.max(...values)

          return { start: { x: dItem.closestMinX, y: minY }, end: { x: dItem.closestMinX, y: maxY } }
        })

      const { coordSys } = this.wbEditor

      this.refLines = refLines.map(item => ({ start: coordSys.scene2World(item.start), end: coordSys.scene2World(item.end) }))
      //  {
      //   start: this.wbEditor.coordSys.scene2World({ x: dItem.closestMinX, y: minY }),
      //   end: this.wbEditor.coordSys.scene2World({ x: dItem.closestMinX, y: maxY })
      // }
    } else {
      this.refLines = []
    }

    return { x: offsetX, y: 0 }
  }

  drawRefLine() {
    const { refLineLayer } = this.wbEditor
    refLineLayer.removeAllChildren()

    this.refLines.forEach(item => {
      const line = new Line({
        points: [item.start.x, item.start.y, item.end.x, item.end.y],
        strokeStyle: OpenColor.red[5],
        pointerEvents: 'none'
      })

      refLineLayer.append(line)
    })
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
