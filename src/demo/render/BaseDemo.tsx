import { useEffect, useRef } from 'react'

import { Stage, Rect, Circle, Text } from '@/rmst-render'

const BaseRenderDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const canvasRef2 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({
      container: canvasRef.current
    })

    const rects = [
      new Rect({ x: 120, y: 10, width: 80, height: 80, bgColor: 'purple', cornerRadius: 20 }),
      new Rect({ x: 210, y: 10, width: 120, height: 80, bgColor: '#a18cd1' })
    ]

    const arcs = [
      new Circle({ x: 60, y: 60, radius: 50, innerRadius: 20, bgColor: 'pink', strokeStyle: 'blue' })
      // new Circle({ x: 400, y: 60, radius: 50, startsAngle: 30, endAngle: 70, bgColor: '#fcb69f' }),
      // new Circle({ x: 500, y: 60, radius: 50, startAngle: 100, endAngle: 150, bgColor: '#c2e9fb' }),
      // new Circle({ x: 560, y: 60, radius: 50, startAngle: 190, endAngle: 240, bgColor: '#764ba2' }),
      // new Circle({ x: 100, y: 170, radius: 50, startAngle: 0, endAngle: 160, bgColor: '#2575fc' }),
      // new Circle({
      //   x: 240,
      //   y: 170,
      //   radius: 50,
      //   startAngle: 240,
      //   endAngle: 300,
      //   bgColor: '#ff0844',
      //   strokeStyle: 'blue'
      // })
    ]

    const texts = [
      new Text({ x: 0, y: 0, content: '人美声甜', color: '#333' }),
      new Text({ x: 210, y: 10, content: '君不见黄河之水天上来', color: '#333' })
    ]

    const shapeArray = [...rects, ...arcs, ...texts]

    stage.append(shapeArray)

    console.log(shapeArray)

    // 注册鼠标事件
    shapeArray.forEach(item => {
      item.onEnter = () => {
        stage.canvasElement.style.cursor = 'pointer'
        console.log('onEnter', item.constructor.name)
      }

      item.onLeave = () => {
        stage.canvasElement.style.cursor = null
        console.log('onLeave', item.constructor.name)
      }

      item.onClick = () => {
        console.log('c')
      }
    })
  }, [])

  return (
    <>
      <div className="canvas-container" ref={canvasRef}></div>

      {/* <svg
        xmlns="http://www.w3.org/2000/svg"
        // xmlnsxlink="http://www.w3.org/1999/xlink"
        version="1.1"
        baseProfile="full"
        width="906"
        height="926"
      >
        <rect width="906" height="926" x="0" y="0" id="0" fill="none"></rect>
        <g>
          <path d="M450 200 A226 226 0 1 1, 449.9774 200Z" fill="rgb(84,112,198)"></path>
        </g>
      </svg>

      <hr />

      <svg width="325" height="325" xmlns="http://www.w3.org/2000/svg">
        <path d="M 80 80 A45 45 0 1 1, 79.99999 80Z" fill="green" />
      </svg> */}
    </>
  )
}

export default BaseRenderDemo
