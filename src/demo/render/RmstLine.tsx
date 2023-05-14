import { useEffect, useRef } from 'react'
import { Stage, Rect, Line } from '@/rmst-render'

const RmstLine = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const rect = new Rect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      bgColor: 'pink',
      cornerRadius: 20
    })

    rect.onEnter = () => {
      rect.attr({ bgColor: 'blue', width: 200 })
      stage.setCursor('pointer')
    }

    rect.onLeave = () => {
      rect.attr({ bgColor: 'pink', width: 100 })
      stage.setCursor('auto')
    }

    const line = new Line({
      points: [0, 0, 100, 100, 200, 100, 300, 300],
      lineWidth: 5,
      strokeStyle: '#45eeb8'
      // closed: true
    })

    line.onEnter = () => {
      line.attr({ lineWidth: 10 })
      stage.setCursor('pointer')
    }

    line.onLeave = () => {
      line.attr({ lineWidth: 5 })
      stage.setCursor('auto')
    }

    const rect_2 = new Rect({
      x: 400,
      y: 50,
      width: 100,
      height: 100,
      bgColor: 'pink',
      cornerRadius: 20
    })

    rect_2.onEnter = () => {
      rect_2.animateCartoon({ width: 150 })
      stage.setCursor('pointer')
    }

    rect_2.onLeave = () => {
      rect_2.animateCartoon({ width: 100 })
      stage.setCursor('auto')
    }

    stage.append([line, rect, rect_2])
  }, [])

  return (
    <>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default RmstLine
