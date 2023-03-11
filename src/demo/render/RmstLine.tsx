import { useEffect, useRef } from 'react'
import { Stage } from '../../rmst-render'
import Line from '../../rmst-render/Line'

const RmstLine = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const line = new Line({
      points: [0, 0, 100, 100, 200, 100, 200, 300],
      lineWidth: 5,
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

    stage.append(line)
  }, [])

  return <div className="canvas-container" ref={canvasRef}></div>
}

export default RmstLine
