import { useEffect } from 'react'
import srcCharts from '../src-charts'
import { calcColorRgba } from '../src-charts/utils/calcColorRgba'

const arcAnimate = () => {
  useEffect(() => {
    class Circle {
      constructor(circleData: Circle['circleData']) {
        this.circleData = circleData
      }

      circleData = { x: 100, y: 100, radius: 10, index: 0, bgColor: '' }

      animateState = {
        rafTimer: null,
        curr: 0
      }

      isMouseInner = false

      animateExec(isReset?: boolean): void {
        cancelAnimationFrame(this.animateState.rafTimer)

        const targetRadius = isReset ? 10 : 20

        const per = 0.1
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

        const colorAnimate = () => {
          const per = 2
          if (isReset) this.animateState.curr -= per
          else this.animateState.curr += per

          if (isReset) {
            if (this.animateState.curr < 0) this.animateState.curr = 0
          } else {
            if (this.animateState.curr > 255) this.animateState.curr = 255
          }

          const args = ['pink', 'red'] as const
          const { rgba } = calcColorRgba(this.animateState.curr, ...args)

          this.circleData.bgColor = rgba

          if (isReset) {
            if (this.animateState.curr <= 0) return true
          } else {
            if (this.animateState.curr >= 255) return true
          }
        }

        const drawAnimate = () => {
          const isAnimateFinish = colorAnimate()
          const isSizeFinish = sizeAnimate()

          renderMain()
          if (isAnimateFinish && isSizeFinish) return

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
        canvasElement.style.cursor = 'pointer'
        this.animateExec()
      }

      handleLeave() {
        console.log('leave')
        canvasElement.style.cursor = ''
        this.animateExec(true)
      }
    }

    // class Circle

    const { canvasElement, ctx } = srcCharts.init(document.querySelector('.canvas-container'))

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

    canvasElement.addEventListener('mousemove', evt => {
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
        canvasElement.style.cursor = 'pointer'
      }
    })
  }, [])

  return <div className="canvas-container"></div>
}

export default arcAnimate
