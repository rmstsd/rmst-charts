import { useEffect } from 'react'
import { Circle, Group, Rect, Stage, Text, measureText } from 'rmst-render'

const width = 700
const height = 700

const content = '最近在一次理解vue项目的代码时，发现周一对好多'

const WatermarkClip = () => {
  useEffect(() => {
    const stage = new Stage({ container: document.querySelector('.wc') as HTMLDivElement })

    const { ctx } = stage

    const paperBgRect = new Rect({ x: 0, y: 0, width: width, height, fillStyle: '#ddd' })
    const paperOption = {
      x: width / 4,
      y: 0,
      width: width / 2,
      height,
      fillStyle: '#fff',
      strokeStyle: '#aaa'
    }
    const paperRect = new Rect(paperOption)

    const textOption: Text['data'] = {
      x: 100,
      y: 100,
      content,
      fontSize: 24,
      fillStyle: '#333',
      draggable: true
    }

    const { textWidth, textHeight } = measureText(ctx, textOption.content, textOption.fontSize)
    const controlRect = new Rect({
      x: textOption.x,
      y: textOption.y,
      width: textWidth,
      height: textHeight,
      draggable: true,
      fillStyle: 'rgba(0,0,0,0.2)',
      strokeStyle: 'blue'
    })

    const controlGroup = new Group({
      draggable: true
    })

    const controlP_lt = new Circle({ x: textOption.x, y: textOption.y, radius: 4, fillStyle: 'red' })
    const controlP_rt = new Circle({
      x: textOption.x + textWidth,
      y: textOption.y,
      radius: 4,
      fillStyle: 'red'
    })
    const control_rb = new Circle({
      x: textOption.x,
      y: textOption.y + textHeight,
      radius: 4,
      fillStyle: 'red'
    })
    const control_lb = new Circle({
      x: textOption.x + textWidth,
      y: textOption.y + textHeight,
      radius: 4,
      fillStyle: 'red'
    })

    controlGroup.append([controlRect, controlP_lt, controlP_rt, control_rb, control_lb])

    const text = new Text(textOption)

    stage.append([paperBgRect, paperRect, text, controlGroup])
  }, [])

  return (
    <div>
      <div className="wc border" style={{ width, height, margin: 'auto' }}></div>
    </div>
  )
}

export default WatermarkClip
