import * as React from 'react'
import { getStroke, getStrokePoints } from 'perfect-freehand'
import fitCurve from 'fit-curve'
import dogPng from '@/assets/zy.jpg'

import oc from 'open-color'

export default function Example() {
  const [points, setPoints] = React.useState<number[][]>([])

  function handlePointerDown(e: React.PointerEvent) {
    setPoints([[e.nativeEvent.offsetX, e.nativeEvent.offsetY, e.pressure]])
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (e.buttons === 1) {
      setPoints([...points, [e.nativeEvent.offsetX, e.nativeEvent.offsetY, e.pressure]])
    }
  }

  const stroke = getStroke(points, {
    size: 16,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5
  })

  let ss = getStrokePoints(stroke)

  // console.log(ss)

  // const d = getSvgPathFromStroke(stroke)
  // console.log(d)

  var error = 50 // The smaller the number - the much closer spline should be

  var bezierCurves = fitCurve(points, error)

  let dd = ''
  bezierCurves.forEach(item => {
    const [f1, c1, c2, s2] = item

    dd += `M ${f1[0]},${f1[1]} C ${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${s2[0]},${s2[1]}`
  })

  // React.useEffect(() => {
  //   const canvas = document.querySelector('canvas')
  //   const ctx = canvas.getContext('2d')

  //   ctx.clearRect(0, 0, 600, 600)

  //   ctx.save()
  //   ctx.beginPath()

  //   const rect2d = new Path2D()

  //   rect2d.rect(100, 100, 100, 100)

  //   ctx.clip(rect2d)

  //   ctx.beginPath()
  //   ctx.arc(100, 100, 50, 0, Math.PI * 2, true)
  //   ctx.fillStyle = 'red'
  //   ctx.fill()

  //   ctx.restore()

  //   ctx.fillStyle = 'pink'
  //   ctx.strokeStyle = 'orange'
  //   ctx.lineWidth = 4
  //   ctx.stroke(rect2d)
  // }, [])

  const onLoad = () => {}

  const list = Array.from({ length: 1000 }, (_, index) => index)

  return (
    <div>
      <div>
        {list.map(item => (
          <div key={item} style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 200px' }}>
            <span> 项目 {item}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <svg
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      className="border"
      width={700}
      height={600}
    >
      {/* {stroke.map((item, index) => (
        <circle key={index} cx={item[0]} cy={item[1]} r={2} />
      ))} */}

      {/* {points.map((item, index) => (
        <circle key={index} cx={item[0]} cy={item[1]} r={2} />
      ))} */}

      {/* <path d={dd} fill="none" stroke="red" strokeWidth={2} /> */}
      {/* {points && <path fill="pink" d={getSvgPathFromStroke(stroke)} />} */}
    </svg>
  )
}

export function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return ''

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const index = (i + 1) % arr.length

      const [x1, y1] = arr[index]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ['M', ...stroke[0], 'Q']
  )

  d.push('Z')
  return d.join(' ')
}
