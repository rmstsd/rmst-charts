import { useEffect } from 'react'
import Circle from '@/rmst-charts-old/utils/Circle'

const genCircle = (canvas: HTMLCanvasElement) => {
  const array: Circle[] = []
  let x = 20
  let y = 20

  recur()

  return array
  function recur() {
    const cir = new Circle(canvas, { x, y, radius: 10, index: 0, bgColor: 'pink' })
    array.push(cir)

    x += 50
    if (x > canvas.width) {
      x = 20
      y += 50
    }

    if (y > canvas.height) return

    recur()
  }
}

const arcAnimate = () => {
  useEffect(() => {
    const canvas_1 = document.querySelector('.canvas_1') as HTMLCanvasElement
    const ctx_1 = canvas_1.getContext('2d')

    const canvas_2 = document.querySelector('.canvas_2') as HTMLCanvasElement
    const ctx_2 = canvas_2.getContext('2d')

    const circleCoords1 = genCircle(canvas_1)
    circleCoords1.forEach(item => {
      item.onChange = () => {
        renderMain()
        // renderMain2()
      }
    })

    const circleCoords2 = genCircle(canvas_2)
    circleCoords2.forEach(item => {
      item.onChange = renderMain2
    })

    renderMain()
    circleCoords1.forEach(item => {
      item.animateExec()
    })

    function renderMain() {
      ctx_1.clearRect(0, 0, canvas_1.width, canvas_1.height)
      circleCoords1.forEach(item => {
        item.drawArc()
      })
    }

    // 2

    renderMain2()
    circleCoords2.forEach(item => {
      item.animateExec()
    })

    function renderMain2() {
      ctx_2.clearRect(0, 0, canvas_2.width, canvas_2.height)

      circleCoords2.forEach(item => {
        item.drawArc()
      })
    }
  }, [])

  const wh = 500

  return (
    <div style={{ position: 'relative', display: 'flex' }}>
      <canvas className="canvas_1" width={wh} height={wh} style={{ border: '1px solid #333' }}></canvas>
      <canvas className="canvas_2" width={wh} height={wh} style={{ border: '1px solid #333' }}></canvas>
    </div>
  )
}

export default arcAnimate
