import { useEffect } from 'react'

const arcAnimate = () => {
  useEffect(() => {
    class Circle {
      constructor(circleData: Circle['circleData']) {
        this.circleData = circleData
      }

      circleData = { x: 100, y: 100, radius: 10, index: 0, bgColor: '' }

      animateState = {
        rafTimer: null
      }

      isMouseInner = false

      animateExec(isReset?: boolean): void {
        cancelAnimationFrame(this.animateState.rafTimer)

        const targetRadius = isReset ? 10 : 20

        const per = 0.2
        let currRadius = this.circleData.radius

        const sizeAnimate = () => {
          if (isReset) currRadius -= per
          else currRadius += per
          this.circleData.radius = currRadius

          // 返回动画是否完成
          if (isReset) {
            if (currRadius <= targetRadius) return true
          } else {
            if (currRadius >= targetRadius) return true
          }
        }

        let curr = 0
        const colorAnimate = () => {
          curr += 4
          if (curr > 255) curr = 255

          const args = isReset ? ['red', 'pink'] : ['pink', 'red']

          const { height, rgba } = rgbaCanvas(curr, ...args)

          this.circleData.bgColor = rgba

          if (curr >= 255) return true
        }

        const drawAnimate = () => {
          const isAnimateFinish = colorAnimate()
          renderMain()
          if (isAnimateFinish) return

          this.animateState.rafTimer = requestAnimationFrame(drawAnimate)
        }

        drawAnimate()
      }

      drawArc(circleData: Circle['circleData']) {
        const { x, y, radius, index, bgColor } = circleData
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = bgColor
        ctx.fill()

        ctx.fillStyle = '#000'
        ctx.fillText(String(index), circleData.x, circleData.y)
      }

      handleMove(offsetX, offsetY) {
        const isInSingleCircle = isInnerCircle(offsetX, offsetY, this.circleData)

        if (isInSingleCircle) {
          if (!this.isMouseInner) {
            this.isMouseInner = true

            this.handleEnter()
          }

          console.log('move')
        } else {
          if (this.isMouseInner) {
            this.isMouseInner = false

            this.handleLeave()
          }
        }
      }

      handleEnter() {
        console.log('enter')
        canvas.style.cursor = 'pointer'
        this.animateExec()
      }

      handleLeave() {
        console.log('leave')
        canvas.style.cursor = ''
        this.animateExec(true)
      }
    }

    // class Circle

    const canvas = document.querySelector('canvas')
    const ctx = canvas.getContext('2d')

    function rgbaCanvas(curr: number, initColor: string, finishColor: string) {
      const canvas = document.createElement('canvas')
      const width = 2
      const height = 256

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      const grad = ctx.createLinearGradient(0, 0, 0, height)
      grad.addColorStop(0, initColor)
      grad.addColorStop(1, finishColor)

      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
      const { data } = ctx.getImageData(1, curr, 1, 1)
      const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`

      return { height, rgba }
    }

    const circleCoords = [
      new Circle({ x: 0, y: 66, radius: 10, index: 0, bgColor: 'pink' }),
      new Circle({ x: 50, y: 100, radius: 10, index: 1, bgColor: 'pink' }),
      new Circle({ x: 100, y: 86, radius: 10, index: 2, bgColor: 'pink' }),
      new Circle({ x: 150, y: 44, radius: 10, index: 3, bgColor: 'pink' }),
      new Circle({ x: 200, y: 80, radius: 10, index: 4, bgColor: 'pink' })
    ]

    renderMain()

    function renderMain() {
      ctx.clearRect(0, 0, 500, 400)

      circleCoords.forEach(item => {
        item.drawArc(item.circleData)
      })
    }

    canvas.addEventListener('mousemove', evt => {
      const { offsetX, offsetY } = evt

      const index = Math.round(offsetX / 50)
      const circle = circleCoords[index]

      if (!circle) {
        return
      }

      circle.handleMove(offsetX, offsetY)
    })

    const isInnerCircle = (x, y, circleData) => {
      const distance = Math.sqrt((x - circleData.x) ** 2 + (y - circleData.y) ** 2)

      return distance <= circleData.radius
    }

    document.addEventListener('keyup', evt => {
      if (evt.key === 'c') {
        console.clear()

        console.log('isMouseInner', circleCoords)
      }
      if (evt.key === 'b') {
        canvas.style.cursor = 'pointer'
      }
    })
  }, [])

  return (
    <div>
      <canvas width="500" height="400" style={{ border: '1px solid #333' }}></canvas>
    </div>
  )
}

export default arcAnimate
