import { useEffect } from 'react'

export default function MyTest() {
  useEffect(() => {
    const container = document.querySelector('.container')
    const canvas = document.querySelector('canvas')
    const ctx = canvas.getContext('2d')

    const drawStage = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.rect(90, 90, 90, 90)
      ctx.fill()
    }

    let hasTask = false

    const render = () => {
      if (hasTask) {
        return
      }

      requestAnimationFrame(() => {
        drawStage()
        hasTask = false
      })
    }

    const ob = new ResizeObserver(() => {
      render()
    })

    ob.observe(container)
  }, [])

  return (
    <div>
      <div className="container  relative border" style={{ width: 400, height: 400, resize: 'both', overflow: 'hidden' }}>
        <canvas className="absolute"></canvas>
      </div>
    </div>
  )
}
