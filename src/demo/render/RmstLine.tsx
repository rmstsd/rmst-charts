import { useEffect, useRef } from 'react'
import { Stage, Rect } from '../../rmst-render'
import Line from '../../rmst-render/Line'

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
      rect.attr({ bgColor: 'blue' })
      stage.setCursor('pointer')
    }

    rect.onLeave = () => {
      rect.attr({ bgColor: 'pink' })
      stage.setCursor('auto')
    }

    const line = new Line({
      points: [0, 0, 100, 100, 200, 100, 200, 300],
      lineWidth: 5,
      strokeStyle: 'purple',
      closed: true
    })

    line.onEnter = () => {
      line.attr({ lineWidth: 10 })
      stage.setCursor('pointer')
    }

    line.onLeave = () => {
      line.attr({ lineWidth: 5 })
      stage.setCursor('auto')
    }

    stage.append([line, rect])
  }, [])

  return <div className="canvas-container" ref={canvasRef}></div>
}

export default RmstLine
