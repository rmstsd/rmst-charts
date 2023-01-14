import React, { useEffect, useRef, useState } from 'react'

const TestGetColor: React.FC = props => {
  const canvasRef = useRef<HTMLCanvasElement>()

  const [rbga, setRgba] = useState('')

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')

    ctx.fillStyle = 'red'
    ctx.fillRect(0, 0, 1, 1)

    ctx.fillStyle = 'blue'
    ctx.fillRect(0, 1, 1, 1)

    const { data } = ctx.getImageData(0, 0, 1, 2)
    console.log(data)
    const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`

    setRgba(rgba)
  }, [])

  return (
    <div className="v-v">
      <canvas
        ref={canvasRef}
        width="4"
        height="256"
        style={{ transform: `scale(10)`, transformOrigin: '0% 0%' }}
      ></canvas>

      <div style={{ height: 100, width: 100, backgroundColor: rbga }}></div>
    </div>
  )
}

export default TestGetColor
