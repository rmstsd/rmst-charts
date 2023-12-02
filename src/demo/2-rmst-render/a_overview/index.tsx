import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, Line } from 'rmst-render'

const Overview = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })
    const shadowColor = '#aaa'

    const rects = [
      new Rect({
        x: 10,
        y: 10,
        width: 80,
        height: 80,
        fillStyle: 'purple',
        cornerRadius: 20,
        cursor: 'pointer',
        shadowColor
      }),
      new Rect({
        x: 100,
        y: 10,
        width: 120,
        height: 80,
        fillStyle: '#a18cd1',
        draggable: true,
        cursor: 'move',
        shadowColor
      })
    ]

    const arcs = [
      new Circle({
        x: 300,
        y: 60,
        radius: 50,
        fillStyle: 'antiquewhite',
        cornerRadius: 20,
        cursor: 'pointer',
        shadowColor
      }),
      new Circle({
        x: 420,
        y: 60,
        radius: 50,
        innerRadius: 30,
        fillStyle: 'white',
        strokeStyle: '#aaa',
        draggable: true,
        cursor: 'move',
        shadowColor
      }),
      new Circle({
        x: 500,
        y: 60,
        radius: 50,
        startAngle: 0,
        endAngle: 120,
        fillStyle: 'navajowhite',
        draggable: true,
        cursor: 'move',
        shadowColor
      }),
      new Circle({
        x: 600,
        y: 60,
        radius: 50,
        innerRadius: 30,
        startAngle: 0,
        endAngle: 120,
        fillStyle: 'lightpink',
        draggable: true,
        cursor: 'move',
        shadowColor
      })
    ]

    const lines = [
      new Line({ points: [10, 120, 100, 120], lineWidth: 5, draggable: true, strokeStyle: 'orange', shadowColor }),
      new Line({
        points: [120, 120, 140, 120, 160, 140],
        lineWidth: 5,
        draggable: true,
        strokeStyle: 'blueviolet',
        shadowColor
      })
    ]

    const shapes = [...rects, ...arcs, ...lines]
    stage.append(shapes)

    shapes.forEach(item => {
      item.onmouseenter = () => {
        item.animateCartoon({ shadowBlur: 20 }, { duration: 300 })
      }
      item.onmouseleave = () => {
        item.animateCartoon({ shadowBlur: 0 }, { duration: 300 })
      }
    })
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default Overview
