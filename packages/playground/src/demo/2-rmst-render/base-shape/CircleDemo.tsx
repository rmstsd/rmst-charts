import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, Text } from 'rmst-render'

const CircleDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const arcs = [
      new Circle({ x: 180, y: 70, radius: 60, fillStyle: 'orange', lineWidth: 2, strokeStyle: 'red' }),
      new Circle({ x: 50, y: 50, radius: 50, innerRadius: 20, fillStyle: 'pink', strokeStyle: 'blue' }),
      new Circle({
        x: 400,
        y: 60,
        radius: 50,
        innerRadius: 20,
        startAngle: 30,
        endAngle: 70,
        fillStyle: '#fcb69f'
      }),
      new Circle({ x: 500, y: 60, radius: 50, startAngle: 100, endAngle: 150, fillStyle: '#c2e9fb' }),
      new Circle({ x: 560, y: 60, radius: 50, startAngle: 190, endAngle: 240, fillStyle: '#764ba2' }),
      new Circle({ x: 100, y: 170, radius: 50, startAngle: 0, endAngle: 160, fillStyle: '#2575fc' }),
      new Circle({
        x: 240,
        y: 170,
        radius: 50,
        startAngle: 240,
        endAngle: 300,
        fillStyle: '#ff0844',
        strokeStyle: 'blue'
      })
    ]

    arcs.forEach(item => {
      stage.append(item)
    })

    // 注册鼠标事件
    arcs.forEach(item => {
      item.onmouseenter = () => {
        item.animateCartoon({ opacity: 0.5 }, { duration: 300, easing: 'linear' })
      }

      item.onmouseleave = () => {
        item.animateCartoon({ opacity: 1 }, { duration: 300, easing: 'linear' })
      }
    })
  }, [])

  return (
    <>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default CircleDemo
