import { Box, Cursor, DragEvent, Leafer, Line, Rect } from 'leafer-ui'
import { Animate } from '@leafer-in/animate'
import { useEffect } from 'react'
import anime from 'animejs'
import { random } from 'es-toolkit'
import { randomColor } from '@/utils'

const QuickStart = () => {
  useEffect(() => {
    const leafer = new Leafer({
      view: document.querySelector('.canvas-container'),
      wheel: { zoomMode: true },
      // hittable: false,
      pointer: { hitRadius: 0 }
    })

    const rects = Array.from({ length: 5000 }, (_, i) => {
      return new Rect({
        draggable: true,
        x: random(10, leafer.width - 20),
        y: random(10, leafer.height- 20),
        width: random(2, 10),
        height: random(2, 10),
        fill: randomColor(),
        cursor: 'move'
      })
    })

    rects.forEach(item => {
      leafer.add(item)

      // new Animate(
      //   item,
      //   { x: 500, cornerRadius: 0, fill: '#ffcd00' }, // style keyframe
      //   {
      //     duration: 1,
      //     swing: true // 摇摆循环播放
      //   } // options
      // )
    })
  }, [])

  return <div className="canvas-container" style={{ width: '100%', height: 600 }}></div>
}

export default QuickStart
