import { useEffect } from 'react'
import { Stage } from 'rmst-render'

const LineAnimate = () => {
  useEffect(() => {
    const stage = new Stage({
      container: document.querySelector('.canvas-container')
    })

    const { ctx } = stage

    const points = [
      { x: 100, y: 100 },
      { x: 200, y: 200 },
      { x: 300, y: 100 },
      { x: 400, y: 100 }
    ]

    drawLine(points)

    let startTimestamp = undefined

    function calcTotalLineLength() {
      const lines = points.reduce((acc, item, index) => {
        if (index === 0) {
          return acc
        }

        const lineItem = { start: points[index - 1], end: item }

        return acc.concat(lineItem)
      }, [])

      const lineLengths = []

      const totalLineLength = lines.reduce((acc, item) => {
        const lengthItem = calcLength(item.start, item.end)

        lineLengths.push(lengthItem)

        return acc + lengthItem
      }, 0)

      return { totalLineLength, lines, lineLengths }

      function calcLength(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
      }
    }

    const totalTime = 3000

    function drawLine(points) {
      ctx.clearRect(0, 0, 1000, 1000)
      const [start, ...rest] = points
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      rest.forEach(item => {
        ctx.lineTo(item.x, item.y)
      })

      ctx.strokeStyle = 'pink'
      ctx.lineWidth = 20
      ctx.lineJoin = 'round'
      ctx.stroke()
    }

    drawAnimateLine()

    function drawAnimateLine() {
      const { totalLineLength, lines, lineLengths } = calcTotalLineLength()

      let currIndex = 0

      requestAnimationFrame(function exec(timestamp) {
        if (!startTimestamp) {
          startTimestamp = timestamp
        }

        const elapsedTime = timestamp - startTimestamp
        const elapsedRatio = Math.min(elapsedTime / totalTime, 1)
        const elapsedLength = elapsedRatio * totalLineLength

        if (elapsedLength === totalLineLength) {
          startTimestamp = undefined
          console.log('wan le')
          return
        }

        let tempL = 0

        for (let i = 0; i < lineLengths.length; i++) {
          tempL += lineLengths[i]
          if (tempL >= elapsedLength) {
            currIndex = i
            break
          }
        }

        const lastOnePoint = (() => {
          const currLine = lines[currIndex]

          const currLineElapsedLength =
            elapsedLength - lineLengths.slice(0, currIndex).reduce((acc, item) => acc + item, 0)

          const ratio = currLineElapsedLength / lineLengths[currIndex]

          // currLineElapsedLength / lineLengths[currIndex] = x - x1 /  x2 - x1

          const x = ratio * (currLine.end.x - currLine.start.x) + currLine.start.x
          const y = ratio * (currLine.end.y - currLine.start.y) + currLine.start.y

          return { x, y }
        })()

        const _points = points.slice(0, currIndex + 1).concat(lastOnePoint)
        drawLine(_points)

        // ctx.beginPath()
        // ctx.fillStyle = 'red'
        // ctx.arc(lastOnePoint.x, lastOnePoint.y, 2, 0, Math.PI * 2)
        // ctx.fill()

        requestAnimationFrame(exec)
      })
    }
  }, [])

  return <div className="canvas-container"></div>
}

export default LineAnimate
