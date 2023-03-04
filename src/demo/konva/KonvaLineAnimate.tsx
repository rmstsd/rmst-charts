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

    var redLine = new Konva.Line({
      points: [50, 50, 50, 50],
      stroke: 'red',
      strokeWidth: 1,
      lineCap: 'round',
      lineJoin: 'round'
    })

    layer.add(redLine)
    stage.add(layer)

    var tween = new Konva.Tween({
      node: redLine,
      duration: 1,
      points: [50, 50, 200, 200]
    })

    tween.play()
  }, [])

  return (
    <>
      <div id="container" className="border-shadow inline-block"></div>
    </>
  )
}

export default KonvaLineAnimate
