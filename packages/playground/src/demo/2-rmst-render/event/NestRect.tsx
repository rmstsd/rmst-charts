import { useEffect, useRef, useState } from 'react'

import { Stage, Rect, Circle, BoxHidden } from 'rmst-render'

const NestRect = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const box_pink = new BoxHidden({ x: 100, y: 100, width: 180, height: 150, fillStyle: 'pink', cursor: 'move' })
    const inn_rect = new Rect({ x: 100, y: 120, width: 80, height: 80, fillStyle: 'green', cursor: 'pointer' })
    box_pink.append(inn_rect)

    const box_2 = new BoxHidden({ x: 200, y: 150, width: 60, height: 60, fillStyle: 'antiquewhite' })
    const inn_cir = new Circle({ x: 220, y: 170, radius: 16, fillStyle: 'blue' })
    box_2.append(inn_cir)

    box_pink.append(box_2)

    const ot = new Circle({ x: 220, y: 320, radius: 30, fillStyle: 'red' })

    stage.append(box_pink, ot)

    ot.onmouseenter = () => {
      logLog('红色圆形 enter')
    }

    ot.onmouseleave = () => {
      logLog('红色圆形 leave')
    }

    box_pink.onmouseenter = () => {
      logLog('粉色矩形 enter')
    }

    box_pink.onmouseleave = () => {
      logLog('粉色矩形 leave')
    }

    inn_rect.onmouseenter = () => {
      logLog('绿色矩形 enter')
    }

    inn_rect.onmouseleave = () => {
      logLog('绿色矩形 leave')
    }
    // ----

    box_2.onmouseenter = () => {
      logLog('米色矩形 enter')
    }

    box_2.onmouseleave = () => {
      logLog('米色矩形 leave')
    }

    inn_cir.onmouseenter = () => {
      logLog('蓝色圆形 enter')
    }

    inn_cir.onmouseleave = () => {
      logLog('蓝色圆形 leave')
    }
  }, [])

  const logLog = (msg: string) => {
    console.log(msg)
    setLogs(v => v.concat(msg))
  }

  const [logs, setLogs] = useState([])

  return (
    <div>
      <h3>父子嵌套时 与 dom行为一致</h3>

      <div className="flex gap-2">
        <div className="canvas-container" ref={canvasRef} style={{ width: 400 }}></div>
        <div>
          {logs.map((item, idx) => (
            <div key={idx}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NestRect
