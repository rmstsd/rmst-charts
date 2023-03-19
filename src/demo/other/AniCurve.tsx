import { useEffect } from 'react'

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
    let prev = { ...p0 }
    drdr()
    function drdr() {
      ctx.clearRect(0, 0, 500, 500)
      const a_x = (1 - t) * p0.x + t * p1.x
      const a_y = (1 - t) * p0.y + t * p1.y

      const b_x = (1 - t) * p1.x + t * p2.x
      const b_y = (1 - t) * p1.y + t * p2.y

      const c_x = (1 - t) * p2.x + t * p3.x
      const c_y = (1 - t) * p2.y + t * p3.y

      const d_x = (1 - t) * a_x + t * b_x
      const d_y = (1 - t) * a_y + t * b_y

      const e_x = (1 - t) * b_x + t * c_x
      const e_y = (1 - t) * b_y + t * c_y

      const p_x = (1 - t) * d_x + t * e_x
      const p_y = (1 - t) * d_y + t * e_y

      ctx.beginPath()

      ctx.strokeStyle = 'red'
      ctx.lineWidth = 2
      // ctx.moveTo(prev.x, prev.y)
      // ctx.lineTo(p_x, p_y)

      ctx.moveTo(p0.x, p0.y)
      ctx.bezierCurveTo(a_x, a_y, d_x, d_y, p_x, p_y)

      ctx.stroke()

      prev.x = p_x
      prev.y = p_y

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
