import { useEffect, useRef } from 'react'
import { Stage, Rect } from 'rmst-render'

const Over = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage>()

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })
    stageRef.current = stage

    window.stageOver = stage

    const rect_1 = new Rect({ x: 10, y: 10, width: 100, height: 100, bgColor: 'blueviolet', draggable: true })
    const rect_2 = new Rect({ x: 50, y: 50, width: 100, height: 100, bgColor: 'pink', draggable: true })

    rect_1.onClick = () => {
      console.log('rect_1')
    }
    rect_1.onEnter = () => {
      setCursor('move')
      console.log('rect_1 enter')
    }
    rect_1.onLeave = () => {
      setCursor('auto')
      console.log('rect_1 leave')
    }

    rect_2.onClick = () => {
      console.log('rect_2')
    }
    rect_2.onEnter = () => {
      setCursor('move')
      console.log('rect_2 enter')
    }
    rect_2.onLeave = () => {
      setCursor('auto')
      console.log('rect_2 leave')
    }

    const rect_3 = new Rect({ x: 200, y: 50, width: 100, height: 100, bgColor: 'blue' })
    const rect_4 = new Rect({ x: 200, y: 150, width: 100, height: 100, bgColor: 'pink' })

    rect_3.onEnter = () => {
      setCursor('move')
      console.log('rect_3 enter')
    }
    rect_3.onLeave = () => {
      setCursor('auto')
      console.log('rect_3 leave')
    }

    rect_4.onEnter = () => {
      setCursor('move')
      console.log('rect_4 enter')
    }
    rect_4.onLeave = () => {
      setCursor('auto')
      console.log('rect_4 leave')
    }

    function setCursor(cu) {
      document.querySelector('.cursor').innerHTML = cu
    }

    stage.append([rect_1, rect_2, rect_3, rect_4])
  }, [])

  return (
    <>
      <h3>
        测试 同级的图形重叠时 onEnter onLeave 的触发 <span className="cursor"></span>
      </h3>
      <div className="canvas-container" ref={canvasRef}></div>
    </>
  )
}

export default Over
