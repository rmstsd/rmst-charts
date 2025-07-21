import * as React from 'react'
import { getStroke, getStrokePoints } from 'perfect-freehand'
import fitCurve from 'fit-curve'
import dogPng from '@/assets/zy.jpg'
import jntmPng from '@/assets/jntm.png'
import { Box, deg2rad, rad2deg, System } from 'detect-collisions'

import oc from 'open-color'
import { applyToPoint, compose, rotate, rotateDEG, skew, toCSS, translate } from 'transformation-matrix'
import { startDrag } from '@/utils/util'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { cloneDeep } from 'es-toolkit'
import clsx from 'clsx'

const Example = observer(function Example() {
  const rect1 = {
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    mt: compose(rotateDEG(30), skew(0.3, 0.4))
  }

  const state = useLocalObservable(() => {
    const box_sel = {
      x: 90,
      y: 90,
      width: 50,
      height: 50
    }
    return { box_sel, cursor: 'move', bool: true }
  })
  const { box_sel } = state

  const system = new System()

  const points = [
    { x: rect1.x, y: rect1.y },
    { x: rect1.x + rect1.width, y: rect1.y },
    { x: rect1.x + rect1.width, y: rect1.y + rect1.height },
    { x: rect1.x, y: rect1.y + rect1.height }
  ].map(item => applyToPoint(rect1.mt, item))

  const r_1 = system.createPolygon({ x: 0, y: 0 }, points)
  const sel = system.createBox({ x: box_sel.x, y: box_sel.y }, box_sel.width, box_sel.height)

  const isCollision = system.checkCollision(sel, r_1)

  // 示例用法
  const midPointA = { x: 100, y: 100 }
  const midPointB = { x: 400, y: 200 }
  const vertices = calculateRectangleVertices(midPointA, midPointB)

  return (
    <svg className={clsx('border', state.bool ? 'move-cursor' : 'pointer-cursor')} width={700} height={600}>
      <polygon points={vertices.map(item => `${item.x},${item.y}`).join(' ')} fill="orange" />
      <circle cx={midPointA.x} cy={midPointA.y} r={4} fill="red" />
      <circle cx={midPointB.x} cy={midPointB.y} r={4} fill="red" />

      {vertices.map((item, index) => (
        <circle key={index} cx={item.x} cy={item.y} fill={item.fill} r={4} />
      ))}

      <g transform={toCSS(translate(10, 10))}>
        <rect {...rect1} stroke="red" fill={isCollision ? 'pink' : 'none'} transform={toCSS(rect1.mt)} />

        <rect
          {...box_sel}
          stroke="blue"
          fill="rgba(0, 0, 0, 0.1)"
          onPointerDown={downEvt => {
            const downRect = cloneDeep(box_sel)

            startDrag(downEvt, {
              onDragMove: moveEvt => {
                const dx = moveEvt.clientX - downEvt.clientX
                const dy = moveEvt.clientY - downEvt.clientY
                state.box_sel.x = downRect.x + dx
                state.box_sel.y = downRect.y + dy

                state.bool = false
              }
            })
          }}
        />
      </g>
    </svg>
  )
})

export default Example

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

function calculateRectangleVertices(midPoint1, midPoint2) {
  // 计算两点之间的距离，作为矩形的一条边长
  const length = Math.sqrt(Math.pow(midPoint2.x - midPoint1.x, 2) + Math.pow(midPoint2.y - midPoint1.y, 2))

  // 计算从 midPoint1 到 midPoint2 的方向向量
  const dx = midPoint2.x - midPoint1.x
  const dy = midPoint2.y - midPoint1.y

  // 计算方向向量的单位向量
  const magnitude = Math.sqrt(dx * dx + dy * dy) // 两点之间的距离
  const unitX = dx / magnitude
  const unitY = dy / magnitude

  console.log(unitX, unitY)

  // 计算垂直于方向向量的单位向量（旋转90度）
  const perpendicularUnitX = -unitY
  const perpendicularUnitY = unitX

  const halfWidth = 10

  // 计算四个顶点的坐标
  const vertex1 = {
    x: midPoint1.x + halfWidth * perpendicularUnitX,
    y: midPoint1.y + halfWidth * perpendicularUnitY,
    fill: 'red'
  }

  const vertex2 = {
    x: midPoint1.x - halfWidth * perpendicularUnitX,
    y: midPoint1.y - halfWidth * perpendicularUnitY,
    fill: 'blue'
  }

  const vertex3 = {
    x: midPoint2.x - halfWidth * perpendicularUnitX,
    y: midPoint2.y - halfWidth * perpendicularUnitY,
    fill: 'yellow'
  }

  const vertex4 = {
    x: midPoint2.x + halfWidth * perpendicularUnitX,
    y: midPoint2.y + halfWidth * perpendicularUnitY,
    fill: 'green'
  }

  return [vertex1, vertex2, vertex3, vertex4]
}
