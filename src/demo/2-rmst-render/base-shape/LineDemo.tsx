import { useEffect, useRef } from 'react'

import { Stage, Line } from 'rmst-render'

const LineDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({ container: canvasRef.current })

    const line = new Line({
      points: [666, 83, 566, 153, 466, 103, 386, 23],
      bgColor: 'pink',
      lineWidth: 2,
      draggable: true,
      smooth: true
    })

    const line5 = new Line({
      points: [354, 142, 434, 222, 534, 272, 634, 202],
      bgColor: 'brown',
      lineWidth: 20,
      draggable: true,
      smooth: true
    })

    const line2 = new Line({
      points: [0, 0, 100, 100, 200, 100, 300, 300],
      lineWidth: 5,
      strokeStyle: '#45eeb8'
      // closed: true
    })

    line2.onmouseenter = () => {
      line2.attr({ lineWidth: 10 })
      stage.setCursor('pointer')
    }

    line2.onmouseleave = () => {
      line2.attr({ lineWidth: 5 })
      stage.setCursor('auto')
    }

    const line3 = new Line({
      points: [0, 0, 0, 0, 0, 0, 0, 0],
      bgColor: 'orange',
      lineWidth: 10,
      draggable: true
    })

    const line4 = new Line({
      points: [43, 156, 143, 300, 243, 350, 343, 333],
      bgColor: 'purple',
      lineWidth: 20,
      draggable: true
    })

    stage.append([line, line2, line3, line4, line5])

    line3.animateCartoon({ points: [616, 314, 516, 384, 416, 334, 336, 254] })
    line4.animateE2e(3000)
    line5.animateE2e(3000)
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default LineDemo
