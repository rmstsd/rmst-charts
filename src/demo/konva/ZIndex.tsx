import Konva from 'konva'
import { useEffect, useRef } from 'react'

let circle: Konva.Circle
let circle2: Konva.Circle

const ZIndex = () => {
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

    circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'red',
      strokeWidth: 10
    })

    circle2 = new Konva.Circle({
      x: stage.width() / 2 + 30,
      y: stage.height() / 2 + 30,
      radius: 70,
      fill: 'pink',
      strokeWidth: 10
    })

    layer.add(circle, circle2)
    stage.add(layer)
  }, [])

  return (
    <>
      <button
        onClick={() => {
          circle.zIndex(1)
        }}
      >
        置顶
      </button>

      <div id="container" className="border-shadow inline-block"></div>
    </>
  )
}

export default ZIndex
