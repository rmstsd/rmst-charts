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

    const { canvasElement: canvasElement2, ctx: ctx2 } = srcCharts.init(
      document.querySelector('.canvas-container2')
    )

    const circleCoords1 = [
      new Circle(canvasElement, { x: 0, y: 66, radius: 10, index: 0, bgColor: 'pink' }), // .mouseEnter
      new Circle(canvasElement, { x: 50, y: 100, radius: 10, index: 1, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 100, y: 86, radius: 10, index: 2, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 150, y: 44, radius: 10, index: 3, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 200, y: 80, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 250, y: 80, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 300, y: 80, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 350, y: 80, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 400, y: 80, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 450, y: 80, radius: 10, index: 4, bgColor: 'pink' }),

      new Circle(canvasElement, { x: 0, y: 160, radius: 10, index: 0, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 50, y: 160, radius: 10, index: 1, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 100, y: 160, radius: 10, index: 2, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 150, y: 160, radius: 10, index: 3, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 200, y: 160, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 250, y: 160, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 300, y: 160, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 350, y: 160, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 400, y: 160, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 450, y: 160, radius: 10, index: 4, bgColor: 'pink' }),

      new Circle(canvasElement, { x: 0, y: 240, radius: 10, index: 0, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 50, y: 240, radius: 10, index: 1, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 100, y: 240, radius: 10, index: 2, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 150, y: 240, radius: 10, index: 3, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 200, y: 240, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 250, y: 240, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 300, y: 240, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 350, y: 240, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 400, y: 240, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 450, y: 240, radius: 10, index: 4, bgColor: 'pink' }),

      new Circle(canvasElement, { x: 0, y: 320, radius: 10, index: 0, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 50, y: 320, radius: 10, index: 1, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 100, y: 320, radius: 10, index: 2, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 150, y: 320, radius: 10, index: 3, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 200, y: 320, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 250, y: 320, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 300, y: 320, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 350, y: 320, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 400, y: 320, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 450, y: 320, radius: 10, index: 4, bgColor: 'pink' }),

      new Circle(canvasElement, { x: 0, y: 400, radius: 10, index: 0, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 50, y: 400, radius: 10, index: 1, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 100, y: 400, radius: 10, index: 2, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 150, y: 400, radius: 10, index: 3, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 200, y: 400, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 250, y: 400, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 300, y: 400, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 350, y: 400, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 400, y: 400, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement, { x: 450, y: 400, radius: 10, index: 4, bgColor: 'pink' })
    ]

    const circleCoords2 = [
      new Circle(canvasElement2, { x: 0, y: 480, radius: 10, index: 0, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 50, y: 480, radius: 10, index: 1, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 100, y: 480, radius: 10, index: 2, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 150, y: 480, radius: 10, index: 3, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 200, y: 480, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 250, y: 480, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 300, y: 480, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 350, y: 480, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 400, y: 480, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 450, y: 480, radius: 10, index: 4, bgColor: 'pink' }),

      new Circle(canvasElement2, { x: 0, y: 560, radius: 10, index: 0, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 50, y: 560, radius: 10, index: 1, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 100, y: 560, radius: 10, index: 2, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 150, y: 560, radius: 10, index: 3, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 200, y: 560, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 250, y: 560, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 300, y: 560, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 350, y: 560, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 400, y: 560, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 450, y: 560, radius: 10, index: 4, bgColor: 'pink' }),

      new Circle(canvasElement2, { x: 0, y: 640, radius: 10, index: 0, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 50, y: 640, radius: 10, index: 1, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 100, y: 640, radius: 10, index: 2, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 150, y: 640, radius: 10, index: 3, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 200, y: 640, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 250, y: 640, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 300, y: 640, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 350, y: 640, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 400, y: 640, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 450, y: 640, radius: 10, index: 4, bgColor: 'pink' }),

      new Circle(canvasElement2, { x: 0, y: 720, radius: 10, index: 0, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 50, y: 720, radius: 10, index: 1, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 100, y: 720, radius: 10, index: 2, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 150, y: 720, radius: 10, index: 3, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 200, y: 720, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 250, y: 720, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 300, y: 720, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 350, y: 720, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 400, y: 720, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 450, y: 720, radius: 10, index: 4, bgColor: 'pink' }),

      new Circle(canvasElement2, { x: 0, y: 800, radius: 10, index: 0, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 50, y: 800, radius: 10, index: 1, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 100, y: 800, radius: 10, index: 2, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 150, y: 800, radius: 10, index: 3, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 200, y: 800, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 250, y: 800, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 300, y: 800, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 350, y: 800, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 400, y: 800, radius: 10, index: 4, bgColor: 'pink' }),
      new Circle(canvasElement2, { x: 450, y: 800, radius: 10, index: 4, bgColor: 'pink' })
    ]

    renderMain2()

    function renderMain2() {
      ctx2.clearRect(0, 0, 500, 400)

      // console.log(
      //   circleCoords[0].circleData.radius,
      //   circleCoords[1].circleData.radius,
      //   circleCoords[circleCoords.length - 2].circleData.radius,
      //   circleCoords[circleCoords.length - 1].circleData.radius
      // )
      // console.log('--')

      circleCoords2.forEach(item => {
        item.drawArc({ ...item.circleData, radius: 10 })
      })

      // item.drawArc(item.circleData)
      // item.drawArc(item.circleData)
      // item.drawArc(item.circleData)
      // item.drawArc(item.circleData)
    }

    // circleCoords.forEach((circleItem, index) => {
    //   circleItem.onClick = () => {
    //     console.log(index)
    //   }
    // })

    // ctx.createElemant()

    circleCoords1.forEach(circleItem => {
      circleItem.onChange = renderMain
    })

    circleCoords2.forEach(circleItem => {
      circleItem.onChange = () => {}
    })

    renderMain()

    circleCoords1.forEach(item => {
      item.animateExec()
    })

    // circleCoords2.forEach(item => {
    //   item.animateExec()
    // })

    function renderMain() {
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
      ctx2.clearRect(0, 0, canvasElement2.width, canvasElement2.height)

      // console.log(
      //   circleCoords[0].circleData.radius,
      //   circleCoords[1].circleData.radius,
      //   circleCoords[circleCoords.length - 2].circleData.radius,
      //   circleCoords[circleCoords.length - 1].circleData.radius
      // )
      // console.log('--')

      circleCoords1.forEach(item => {
        item.drawArc(item.circleData)
      })

      circleCoords2.forEach(item => {
        item.drawArc({ ...item.circleData, radius: 10 })
      })

      // item.drawArc(item.circleData)
      // item.drawArc(item.circleData)
      // item.drawArc(item.circleData)
      // item.drawArc(item.circleData)
    }

    canvasElement.addEventListener('mousemove', evt => {
      // const { offsetX, offsetY } = evt

      // const index = Math.round(offsetX / 50)
      // const circle = circleCoords[index]

      // if (!circle) {
      //   return
      // }

      // circle.handleMove(offsetX, offsetY)

      circleCoords1.forEach(item => {
        item.handleMove(item.circleData.x, item.circleData.y)
      })

      circleCoords2.forEach(item => {
        item.handleMove(item.circleData.x, item.circleData.y)
      })
    })

    canvasElement.addEventListener('click', evt => {
      const { offsetX, offsetY } = evt

      const index = Math.round(offsetX / 50)
      const circle = circleCoords1[index]

      if (!circle) return

      if (circle.isInnerCircle(offsetX, offsetY)) {
        circle.onClick()
      }
    })

    document.addEventListener('keyup', evt => {
      if (evt.key === 'c') {
        console.clear()

        console.log('isMouseInner', circleCoords1)
      }
      if (evt.key === 'b') {
        canvasElement.style.cursor = 'pointer'
      }
    })
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <div className="canvas-container" style={{ height: 455 }}></div>
      <div className="canvas-container2" style={{ height: 910, marginTop: -455 }}></div>
    </div>
  )
}

export default arcAnimate
