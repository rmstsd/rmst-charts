import Konva from 'konva'
import { useEffect, useRef } from 'react'

const KonvaLineAnimate = () => {
  const groupRef = useRef<Konva.Group>()

  useEffect(() => {
    var width = 600
    var height = 400

    var stage = new Konva.Stage({
      container: 'container',
      width: width,
      height: height
    })

    var layer = new Konva.Layer()

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'red',
      strokeWidth: 10
    })
    circle.addEventListener('mouseenter', () => {
      console.log('en')
    })
    layer.add(circle)

    stage.add(layer)
  }, [])

  return (
    <>
      <div id="container" className="border-shadow inline-block"></div>
    </>
  )
}

export default KonvaLineAnimate
