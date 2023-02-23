import Konva from 'konva'
import { useEffect } from 'react'

const KonvaBase = () => {
  useEffect(() => {
    var width = 600
    var height = 400

    var stage = new Konva.Stage({
      container: 'container',
      width: width,
      height: height
    })

    var shapesLayer = new Konva.Layer()
    var group = new Konva.Group({
      draggable: true
    })
    var colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']

    for (let i = 0; i < 4; i++) {
      var box = new Konva.Rect({
        x: i * 80 + 10,
        y: i * 78 + 40,
        width: 100,
        height: 50,
        name: colors[i],
        fill: colors[i],
        stroke: 'black',
        strokeWidth: 4
      })
      box.on('click', () => {
        console.log('box', i)
      })
      group.add(box)
    }

    group.on('mouseover', function () {
      document.body.style.cursor = 'pointer'
    })
    group.on('mouseout', function () {
      document.body.style.cursor = 'default'
    })

    group.on('click', function () {
      console.log('g')
    })

    shapesLayer.add(group)
    stage.add(shapesLayer)
  }, [])
  return (
    <div id="container" className="canvas-container">
      KonvaBase
    </div>
  )
}

export default KonvaBase
