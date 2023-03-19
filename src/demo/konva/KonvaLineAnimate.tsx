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

    const points = [
      { x: 50, y: 50 },
      { x: 100, y: 100 },
      { x: 150, y: 50 },
      { x: 200, y: 10 },
      { x: 250, y: 300 }
    ]
    const linePoints = points.reduce((acc, item) => acc.concat(item.x, item.y), [])

    var redLine = new Konva.Line({
      points: linePoints,
      stroke: 'red',
      strokeWidth: 1,
      lineCap: 'round',
      lineJoin: 'round',
      tension: 0.3
    })

    const arcs = points.map(item => new Konva.Circle({ x: item.x, y: item.y, radius: 3, fill: 'purple' }))

    layer.add(redLine)

    layer.add(...arcs)

    stage.add(layer)

    // var tween = new Konva.Tween({
    //   node: redLine,
    //   duration: 1,
    //   points: [50, 50, 200, 200, 200, 100],
    //   onUpdate: () => {
    //     console.log(123)
    //   }
    // })

    // tween.play()
  }, [])

  return (
    <>
      <div id="container" className="border-shadow inline-block"></div>
    </>
  )
}

export default KonvaLineAnimate
