import { startDrag } from '@/utils/util'
import { cloneDeep, isNil } from 'es-toolkit'
import { observer, useLocalObservable } from 'mobx-react-lite'

const XiFu = observer(function XiFuIn() {
  const state = useLocalObservable(() => {
    return {
      source: { x: 0, y: 0, width: 100, height: 80 },
      line: { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } }
    }
  })

  const otherRect = { x: 100, y: 200, width: 60, height: 50 }

  const onPointerDown = downEvt => {
    const snap = cloneDeep(state.source)

    const vLineMap = new Map<number, number[]>()
    const hLineMap = new Map<number, number[]>()

    vLineMap.set(otherRect.x, [otherRect.y, otherRect.y + otherRect.height])
    vLineMap.set(otherRect.x + otherRect.width, [otherRect.y, otherRect.y + otherRect.height])

    // hLineMap.set(otherRect.y, [otherRect.x, otherRect.x + otherRect.width])
    // hLineMap.set(otherRect.y + otherRect.width, [otherRect.x, otherRect.x + otherRect.width])

    const vks = [...vLineMap.keys()]

    startDrag(downEvt, {
      onDragMove(moveEvt) {
        const dx = moveEvt.clientX - downEvt.clientX
        const dy = moveEvt.clientY - downEvt.clientY

        const ansX = snap.x + dx
        const ansY = snap.y + dy

        state.source.x = ansX
        state.source.y = ansY

        const minX = ansX
        const maxX = ansX + state.source.width

        const closestMinX = getClosestVal(vks, minX)
        const closestMaxX = getClosestVal(vks, maxX)

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
          state.source.x += offsetX

          const values = vLineMap.get(kx).concat(state.source.y, state.source.y + state.source.height)
          const minY = Math.min(...values)
          const maxY = Math.max(...values)

          state.line = { start: { x: kx, y: minY }, end: { x: kx, y: maxY } }
        } else {
          state.line = null
        }
      }
    })
  }

  return (
    <div className="h-full relative border">
      <div
        className="absolute bg-pink-300"
        style={{ left: otherRect.x, top: otherRect.y, width: otherRect.width, height: otherRect.height }}
      ></div>

      <div
        className="absolute bg-gray-400/70"
        onPointerDown={onPointerDown}
        style={{ left: state.source.x, top: state.source.y, width: state.source.width, height: state.source.height }}
      ></div>

      {state.line && (
        <div
          className="absolute bg-red-500 z-10"
          style={{ width: 1, left: state.line.start.x, top: state.line.start.y, height: state.line.end.y - state.line.start.y }}
        ></div>
      )}
    </div>
  )
})

export default XiFu

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
