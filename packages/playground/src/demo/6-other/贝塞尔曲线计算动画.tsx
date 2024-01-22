import { useEffect } from 'react'
import { ICoord } from 'rmst-render'

// https://juejin.cn/post/7082701281969569829#heading-3
// 某一帧的时候 终点是p, a b 是控制点

type FinalPoint = {
  start: ICoord // 起点
  p1: ICoord // 控制点1 控制起点
  p2: ICoord // 控制点2 控制终点
  end: ICoord // 终点
}
export function calculateControlPoint(t: number, finalPoint: FinalPoint) {
  const { start, p1, p2, end } = finalPoint

  const a_x = (1 - t) * start.x + t * p1.x
  const a_y = (1 - t) * start.y + t * p1.y

  const b_x = (1 - t) * p1.x + t * p2.x
  const b_y = (1 - t) * p1.y + t * p2.y

  const c_x = (1 - t) * p2.x + t * end.x
  const c_y = (1 - t) * p2.y + t * end.y

  const d_x = (1 - t) * a_x + t * b_x
  const d_y = (1 - t) * a_y + t * b_y

  const e_x = (1 - t) * b_x + t * c_x
  const e_y = (1 - t) * b_y + t * c_y

  const p_x = (1 - t) * d_x + t * e_x
  const p_y = (1 - t) * d_y + t * e_y

  return { cp1: { x: a_x, y: a_y }, cp2: { x: d_x, y: d_y }, tempEnd: { x: p_x, y: p_y } }
}

const AniCurve = () => {
  useEffect(() => {
    const ctx = document.querySelector('canvas')?.getContext('2d')

    const p0 = { x: 100, y: 100 }
    const p1 = { x: 100, y: 50 } // 控制点 1
    const p2 = { x: 300, y: 50 } // 控制点 2
    const p3 = { x: 300, y: 100 }

    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)
    ctx.stroke()

    let t = 0
    drdr()
    function drdr() {
      ctx.clearRect(0, 0, 500, 500)

      const { cp1, cp2, tempEnd } = calculateControlPoint(t, { start: p0, p1, p2, end: p3 })

      ctx.beginPath()

      ctx.strokeStyle = 'red'
      ctx.lineWidth = 10
      ctx.moveTo(p0.x, p0.y)
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, tempEnd.x, tempEnd.y)
      ctx.stroke()

      if (t < 1) {
        requestAnimationFrame(drdr)
        t += 0.01
        if (t > 1) t = 1
      }
    }

    //
  }, [])

  return (
    <div>
      <canvas width={500} height={500} className="border"></canvas>
    </div>
  )
}

export default AniCurve
