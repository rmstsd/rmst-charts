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

    const line = new Konva.Line({
      points: [73, 70, 340, 300, 450, 60, 500, 20],
      stroke: 'red',
      strokeWidth: 2
      // closed: true
    })

    line.addEventListener('mouseenter', () => {
      console.log('mouseenter')
    })

    line.addEventListener('mouseleave', () => {
      console.log('mouseleave')
    })

    layer.add(line)

    stage.add(layer)
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
