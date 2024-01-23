import { useEffect } from 'react'
import { calculateControlPoint } from 'rmst-render'

// https://juejin.cn/post/7082701281969569829#heading-3
// 某一帧的时候 终点是p, a b 是控制点

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

      const { cp1, cp2, tempEnd } = calculateControlPoint(t, { start: p0, cp1: p1, cp2: p2, end: p3 })

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
