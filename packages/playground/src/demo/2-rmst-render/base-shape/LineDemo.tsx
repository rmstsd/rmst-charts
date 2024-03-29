import { useEffect, useRef } from 'react'

import { Stage, Line } from 'rmst-render'

const LineDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({ container: canvasRef.current })

    const line = new Line({
      points: [666, 83, 566, 153, 466, 103, 386, 23],
      strokeStyle: 'pink',
      lineWidth: 2,
      draggable: true,
      smooth: true,
      cursor: 'move'
    })

    const line5 = new Line({
      points: [354, 142, 434, 242, 534, 272, 634, 202],
      strokeStyle: 'brown',
      lineWidth: 20,
      draggable: true,
      percent: 0,
      smooth: true,
      cursor: 'move'
    })

    const line2 = new Line({
      points: [0, 0, 100, 100, 200, 100, 300, 300],
      lineWidth: 5,
      strokeStyle: '#45eeb8',
      cursor: 'move'
      // closed: true
    })

    line2.onmouseenter = () => {
      line2.attr({ lineWidth: 10 })
    }

    line2.onmouseleave = () => {
      line2.attr({ lineWidth: 5 })
    }

    const line3 = new Line({
      points: [0, 0, 0, 0, 0, 0, 0, 0],
      strokeStyle: 'orange',
      lineWidth: 10,
      draggable: true,
      cursor: 'move'
    })

    const line4 = new Line({
      points: [43, 156, 143, 300, 243, 350, 343, 333],
      strokeStyle: 'purple',
      lineWidth: 20,
      draggable: true,
      percent: 0,
      cursor: 'move'
    })

    stage.append([line, line2, line3, line4, line5])

    line3.animateCartoon({ points: [616, 314, 516, 384, 416, 334, 336, 254] })
    line4.animateCartoon({ percent: 1 }, { duration: 5000 })
    line5.animateCartoon({ percent: 1 }, { duration: 5000 })
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

const LineDemo_2 = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({ container: canvasRef.current })

    const line = new Line({
      points: [10, 10, 100, 10, 120, 60],
      strokeStyle: 'pink',
      lineWidth: 2,
      draggable: true,
      percent: 0.8,
      smooth: true
    })

    stage.append([line])
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default LineDemo
