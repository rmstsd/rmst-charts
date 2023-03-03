import Konva from 'konva'
import { useEffect, useRef } from 'react'

const KonvaBase = () => {
  const groupRef = useRef<Konva.Group>()

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
    groupRef.current = group

    var colors = ['red', 'orange', 'purple', 'green', 'blue', 'purple']

    for (let i = 0; i < 4; i++) {
      var box = new Konva.Rect({
        x: i * 80 + 10,
        y: i * 78 + 40,
        width: 100,
        height: 50,
        fill: colors[i]
      })
      box.on('click', evt => {
        console.log('box', i)
      })
      group.add(box)
    }

    // group.on('mouseover', function () {
    //   document.body.style.cursor = 'pointer'
    // })
    // group.on('mouseout', function () {
    //   document.body.style.cursor = 'default'
    // })

    group.on('click', function () {
      console.log('g')
    })

    shapesLayer.add(group)
    stage.add(shapesLayer)

    var box1 = new Konva.Rect({
      x: 400,
      y: 100,
      width: 100,
      height: 50,
      fill: 'purple',
      draggable: true
    })
    box1.on('click', evt => {
      console.log('box', 1)
    })
    var box2 = new Konva.Rect({
      x: 450,
      y: 120,
      width: 100,
      height: 50,
      fill: 'coral',
      draggable: true
    })
    box2.on('click', evt => {
      console.log('box', 2)
    })
    box1.on('mouseup', () => {
      console.log('box1 mouseup')
    })

    box2.on('mouseup', () => {
      console.log('box2 mouseup')
    })

    shapesLayer.add(box1)
    shapesLayer.add(box2)
  }, [])

  const addToGroup = () => {
    groupRef.current.add(
      new Konva.Rect({
        x: 200,
        y: 100,
        width: 100,
        height: 50,
        name: 'pink',
        fill: 'pink',
        stroke: 'black',
        strokeWidth: 4
      })
    )

    console.log(groupRef.current)
  }

  return (
    <>
      <div id="container" className="border-shadow inline-block"></div>

      <button onClick={addToGroup}>向组添加元素</button>
    </>
  )
}

export default KonvaBase
