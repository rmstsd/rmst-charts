import { useEffect, useRef, useState } from 'react'

import { Stage, Rect, Circle, Line } from 'rmst-render'

const Overview = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<Stage>()

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current,
      enableRuler: true
    })

    setStage(stage)

    const shadowColor = '#aaa'

    const rects = [
      new Rect({
        x: 20,
        y: 10,
        width: 80,
        height: 80,
        fillStyle: 'purple',
        cursor: 'pointer',
        draggable: true,
        shadowColor,
        rotate: 30
      }),
      new Rect({
        x: 100,
        y: 10,
        width: 0,
        height: 80,
        fillStyle: '#a18cd1',
        draggable: true,
        cursor: 'move',
        cornerRadius: 2,
        shadowColor
      })
    ]

    const arcs = [
      new Circle({
        x: 300,
        y: 60,
        radius: 50,
        endAngle: 0,
        fillStyle: 'antiquewhite',
        cursor: 'pointer',
        draggable: true,
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
      }),
      new Line({
        points: [180, 120, 230, 120, 250, 140, 270, 140],
        lineWidth: 5,
        draggable: true,
        strokeStyle: 'firebrick',
        shadowColor
      })
    ]
    const line = new Line({
      points: [354, 142, 434, 222, 534, 272, 634, 202],
      strokeStyle: 'gold',
      lineWidth: 20,
      draggable: true,
      shadowColor,
      percent: 0
    })

    const line3 = new Line({
      points: [0, 0, 0, 0, 0, 0, 0, 0],
      strokeStyle: 'orange',
      lineWidth: 10,
      draggable: true,
      cursor: 'move'
    })

    const line4 = new Line({
      points: [27, 189, 107, 269, 207, 319, 307, 249],
      strokeStyle: 'blueviolet',
      lineWidth: 20,
      draggable: true,
      shadowColor,
      smooth: true,
      percent: 0
    })

    const shapes = [...rects, ...arcs, ...lines, line, line3, line4]
    stage.append(shapes)
    shapes.forEach(item => {
      item.onmouseenter = () => {
        item.animateCartoon({ shadowBlur: 20 }, { duration: 300 })
      }
      item.onmouseleave = () => {
        item.animateCartoon({ shadowBlur: 0 }, { duration: 300 })
      }
    })

    arcs[0].animateCartoon({ endAngle: 360 }, { easing: 'sinusoidalInOut' })

    rects[1].animateCartoon({ width: 120 }, { duration: 3000 })
    line.animateCartoon({ percent: 1 }, { duration: 3000 })
    line3.animateCartoon({ points: [616, 314, 516, 384, 416, 334, 336, 254] }, { duration: 3000 })

    line4.animateCartoon({ percent: 1 }, { duration: 5000 })

    const rectrt = new Rect({
      x: stage.canvasSize.width - 100,
      y: stage.canvasSize.height - 100,
      width: 100,
      height: 100,
      fillStyle: 'orange'
    })

    stage.append(rectrt)

    setTimeout(() => {
      rects[0].animateCartoon({ fillStyle: 'red' })

      rectrt.animateCartoon({ x: stage.canvasSize.width - 140, y: stage.canvasSize.height - 140, fillStyle: 'pink' })
    }, 1000)
  }, [])

  return (
    <div>
      <header className="flex items-center gap-4">
        <button onClick={() => stage.camera.zoomIn()}>放大</button>
        <button onClick={() => stage.camera.zoomOut()}>缩小</button>
        <button
          onClick={() => {
            stage.enableRuler = !stage.enableRuler
            stage.render()
          }}
        >
          显示/隐藏 标尺
        </button>
        <span className="border p-1 border-gray-400">空格 + 左键 平移</span>
        <span className="border p-1 border-gray-400">ctrl + 滚轮 缩放</span>
      </header>

      <hr />

      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default Overview
