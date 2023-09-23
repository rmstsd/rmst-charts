import { useEffect, useRef } from 'react'
import { calculateControlPoint } from './贝塞尔曲线计算动画'
import { Line, Stage } from 'rmst-render'

const 贝塞尔曲线峰值吸附 = () => {
  const ref = useRef<HTMLCanvasElement>()
  const ctxRef = useRef<CanvasRenderingContext2D>()

  const p0 = { x: 100, y: 100 }
  const p1 = { x: 100, y: 40 } // 控制点 1
  const p2 = { x: 300, y: 240 } // 控制点 2
  const p3 = { x: 300, y: 100 }

  useEffect(() => {
    const stage = new Stage({
      container: document.querySelector('.canvas-container')
    })

    const line = new Line({
      points: [100, 100, 200, 100],
      draggable: true,
      lineWidth: 2
    })

    line.onClick = () => {
      console.log(122)
    }

    stage.append(line)
  }, [])

  useEffect(() => {
    const ctx = ctxRef.current

    // ctx.beginPath()
    // ctx.moveTo(p0.x, p0.y)
    // ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)
    // ctx.stroke()

    let t = 0

    const pointsAtCurve = calcPointAtCurve()

    const boundingRect = findBounding(pointsAtCurve)
    ctx.strokeStyle = 'pink'
    ctx.strokeRect(
      boundingRect.left_top.x,
      boundingRect.left_top.y,
      boundingRect.right_bottom.x - boundingRect.left_top.x,
      boundingRect.right_bottom.y - boundingRect.left_top.y
    )

    function findBounding(points) {
      const left_top = {
        x: Math.min(...points.map(item => item.x)),
        y: Math.min(...points.map(item => item.y))
      }
      const right_bottom = {
        x: Math.max(...points.map(item => item.x)),
        y: Math.max(...points.map(item => item.y))
      }

      return {
        left_top,
        right_bottom
      }
    }

    pointsAtCurve.forEach((item, index) => {
      if (index === 0 || index === pointsAtCurve.length - 1) {
        return
      }
      if (item.y < pointsAtCurve[index - 1].y && item.y < pointsAtCurve[index + 1].y) {
        console.log(1111)
        item.peak = true
      }
    })

    pointsAtCurve.forEach(item => {
      if (item.peak) {
        ctx.fillStyle = 'red'
        ctx.fillRect(item.x, item.y, 2, 2)
      }

      ctx.fillStyle = '#333'
      ctx.fillRect(item.x, item.y, 1, 1)
    })

    function calcPointAtCurve() {
      const ans = []

      const { cp1, cp2, tempEnd } = calculateControlPoint(t, { start: p0, p1, p2, end: p3 })
      ans.push(tempEnd)

      dg()

      console.log(ans)

      return ans

      function dg() {
        if (t === 1) {
          return
        }

        t += 0.1
        if (t > 1) {
          t = 1
        }

        const { cp1, cp2, tempEnd } = calculateControlPoint(t, { start: p0, p1, p2, end: p3 })

        ans.push(tempEnd)
        dg()
      }
    }
  }, [])

  return (
    <div>
      <div className="canvas-container"></div>

      <canvas
        ref={el => {
          ref.current = el
          ctxRef.current = el?.getContext('2d')
        }}
        width={500}
        height={500}
        className="border"
      ></canvas>
    </div>
  )
}

export default 贝塞尔曲线峰值吸附
