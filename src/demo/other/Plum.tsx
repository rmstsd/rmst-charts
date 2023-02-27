import { useEffect } from 'react'

const Plum = () => {
  useEffect(() => {
    const btn = document.querySelector('button')
    const rafIds = []
    btn.onclick = () => {
      ctx.clearRect(0, 0, 800, 600)
      rafIds.forEach(cancelAnimationFrame)

      count = 0
      step(line)
    }

    const canvas = document.querySelector('canvas')
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#aaa'

    const Width = 800
    const Height = 600

    const line = { start: { x: Width / 2, y: Height }, length: 20, theta: -Math.PI / 2 }

    step(line)

    let count = 0
    async function step(line, depth = 0) {
      if (depth > 10) return

      await drawLineRaf(line)
      const end = getEndPoint(line)

      count++
      const rafId = requestAnimationFrame(() => {
        if (Math.random() < 0.5 || depth < 3)
          step(
            {
              start: end,
              length: line.length, // + Math.random() * -10 + 5,
              theta: line.theta - Math.random() * 0.4
            },
            depth + 1
          )
        if (Math.random() < 0.5 || depth < 3)
          step(
            {
              start: end,
              length: line.length, // + Math.random() * -10 + 5,
              theta: line.theta + Math.random() * 0.4
            },
            depth + 1
          )
      })

      rafIds.push(rafId)
    }

    function drawLineRaf(line) {
      return new Promise(resolve => {
        let total = 0
        const perLength = 3

        dd(line.start)

        function dd(start) {
          if (total === line.length) {
            resolve(1)
            return
          }

          total += perLength
          if (total > line.length) total = line.length

          const end = getEndPoint({ start, length: perLength, theta: line.theta })
          lineTo(start, end)

          const rafId = requestAnimationFrame(() => dd(end))
          rafIds.push(rafId)
        }
      })
    }

    function lineTo(start, end) {
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }

    function getEndPoint(lineDesc) {
      const { start, length, theta } = lineDesc
      const end = {
        x: start.x + length * Math.cos(theta),
        y: start.y + length * Math.sin(theta)
      }
      return end
    }
  }, [])

  return (
    <div>
      <button>画</button>

      <br />
      <canvas width="800" height="600" className="canvas-container" />
    </div>
  )
}

export default Plum
