import { useEffect } from 'react'
import srcCharts from '../src-charts'
import { calcColorRgba } from '../src-charts/utils/calcColorRgba'
import Circle from '../src-charts/utils/Circle'

const arcAnimate = () => {
  useEffect(() => {
    // class Circle

    // { x: 0, y: 66, radius: 10, index: 0, bgColor: 'pink' }
    // const circle = new Circle({ x: 0, y: 66, radius: 10, index: 0, bgColor: 'pink' })
    // circle.onChange = () => {
    //   renderMain()
    // }

    const { canvasElement, ctx } = srcCharts.init(document.querySelector('.canvas-container'))

    // 什么时候干什么事情
    const circleCoords = [
      new Circle(canvasElement, { x: 0, y: 66, radius: 10, index: 0, bgColor: 'pink' }), // .mouseEnter
      new Circle(canvasElement, { x: 50, y: 100, radius: 10, index: 1, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 100, y: 86, radius: 10, index: 2, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 150, y: 44, radius: 10, index: 3, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 200, y: 80, radius: 10, index: 4, bgColor: 'pink' })
    ]

    circleCoords.onClick = () => {
      console.log(0)
    }

    // ctx.createElemant()

    circleCoords.forEach(circleItem => {
      circleItem.onChange = renderMain
    })

    renderMain()

    function renderMain() {
      ctx.clearRect(0, 0, 500, 400)

      circleCoords.forEach(item => {
        item.drawArc(item.circleData)
      })
    }

    canvasElement.addEventListener('mousemove', evt => {
      const { offsetX, offsetY } = evt

      const index = Math.round(offsetX / 50)
      const circle = circleCoords[index]

      if (!circle) {
        return
      }

      circle.handleMove(offsetX, offsetY)
    })

    canvasElement.addEventListener('click', evt => {
      const { offsetX, offsetY } = evt

      const index = Math.round(offsetX / 50)
      const circle = circleCoords[index]

      if (!circle) {
        return
      }

      circle.onClick(offsetX, offsetY)
    })

    document.addEventListener('keyup', evt => {
      if (evt.key === 'c') {
        console.clear()

        console.log('isMouseInner', circleCoords)
      }
      if (evt.key === 'b') {
        canvasElement.style.cursor = 'pointer'
      }
    })
  }, [])

  return <div className="canvas-container"></div>
}

export default arcAnimate
