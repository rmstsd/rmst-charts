import colorAlpha from 'color-alpha'
import { useEffect, useRef, useState } from 'react'

import { Stage, Rect, Circle, BoxHidden, Group, Text, Line } from 'rmst-render'

const useRefState = <T,>(t: T) => {
  const ref = useRef<T>(t)

  return ref.current
}

const ZIndex = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  const rect_1 = useRefState(
    new Rect({
      name: '粉色',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fillStyle: colorAlpha('pink', 0.8),
      cursor: 'pointer',
      zIndex: 1
    })
  )
  const rect_2 = useRefState(
    new Rect({
      name: '紫色',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fillStyle: colorAlpha('purple', 0.8),
      cursor: 'move'
    })
  )

  useEffect(() => {
    const stage = new Stage({ container: canvasRef.current })

    const group = new Group({ zIndex: 4 })
    const circle_1 = new Circle({ name: '蓝色', x: 170, y: 100, radius: 40, fillStyle: 'blue', cursor: 's-resize' })
    const circle_2 = new Circle({
      name: '红色',
      x: 220,
      y: 100,
      radius: 40,
      fillStyle: colorAlpha('red', 0.8),
      cursor: 'e-resize'
    })
    const text = new Text({ name: '文字 qwer', x: 220, y: 100, content: 'qwer', cursor: 'text' })

    const group_2 = new Group({ zIndex: 4 })
    const circle_5 = new Circle({
      name: '灰色',
      x: 180,
      y: 140,
      radius: 40,
      fillStyle: colorAlpha('gray', 0.8),
      cursor: 'crosshair'
    })
    group_2.append(circle_5)

    group.append(circle_1, circle_2, text, group_2)

    const bh = new BoxHidden({
      name: '橘色',
      x: 210,
      y: 120,
      width: 400,
      height: 300,
      fillStyle: colorAlpha('orange', 0.8),
      cursor: 'help',
      zIndex: 3
    })
    const circle_3 = new Circle({
      name: '绿色',
      x: 260,
      y: 110,
      radius: 40,
      fillStyle: 'greenyellow',
      cursor: 'wait'
    })
    bh.append(circle_3)

    const groupRoot = new Group()
    groupRoot.append(rect_1, rect_2, group, bh)

    groupRoot.onclick = evt => {
      setName(evt.target.data.name)
    }

    const line = new Line({
      name: '黑色',
      points: [250, 200, 400, 300],
      strokeStyle: 'black',
      lineWidth: 15,
      cursor: 'se-resize'
    })

    const dbx = new Line({
      name: '棕色',
      points: [250, 200, 400, 300, 500, 200],
      fillStyle: 'saddlebrown',
      lineWidth: 1,
      closed: true,
      cursor: 'ne-resize'
    })

    bh.append(line, dbx)

    const cor = new Circle({
      name: '红色圆 2',
      x: 230,
      y: 300,
      radius: 100,
      fillStyle: colorAlpha('red', 0.8),
      cursor: 'e-resize'
    })

    cor.onclick = evt => {
      setName(evt.target.data.name)
    }

    stage.append(cor, groupRoot)
  }, [])

  const [name, setName] = useState('无')

  return (
    <div>
      <button onClick={() => rect_1.attr({ zIndex: 0 })}>将粉色矩形 zIndex 由1 改为0</button>
      <button onClick={() => rect_1.attr({ zIndex: 1 })}>将粉色矩形 zIndex 由0 改为1</button>

      <span className="ml-2">
        点击图形查看拾取情况, 拾取到了: <span className="font-bold">{name}</span>
      </span>

      <div className="canvas-container" ref={canvasRef} style={{ width: 1000, height: 700 }}></div>
    </div>
  )
}

export default ZIndex
