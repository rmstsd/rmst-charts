import Konva from 'konva'
import { useEffect, useRef } from 'react'

const PolygonDe = () => {
  const groupRef = useRef<Konva.Group>()

  useEffect(() => {
    var width = 600
    var height = 400

    var stage = new Konva.Stage({
      container: 'container',
      width: width,
      height: height
    })
    const layer = new Konva.Layer()

    var redLine = new Konva.Line({
      points: [30, 70, 140, 23, 250, 60],
      stroke: 'red',
      strokeWidth: 30,
      lineCap: 'round',
      lineJoin: 'round'
    })

    layer.add(redLine)

    stage.add(layer)

    var tween = new Konva.Tween({
      // list of tween specific properties
      node: redLine,
      duration: 1,
      easing: Konva.Easings.EaseInOut,
      points: [30, 70, 100, 0, 200, 100]
    })

    // play tween
    tween.play()
  }, [])

  const addToGroup = () => {}

  return (
    <>
      <div id="container" className="border-shadow inline-block"></div>

      <button onClick={addToGroup}>向组添加元素</button>
    </>
  )
}

export default PolygonDe
