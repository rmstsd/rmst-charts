import { useEffect, useRef } from 'react'
import { Stage, Rect, Line, deg2rad } from 'rmst-render'

import * as glMatrix from 'gl-matrix'
import * as math from 'mathjs'

import { Vector2 } from './Vector2'
import { Matrix3 } from './Matrix3'

const Debug = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = new Stage({ container: canvasRef.current })

    const { ctx } = stage

    /* 矩形的模型矩阵数据 */
    const position = new Vector2(150, 150)
    const rotate = deg2rad(45)
    const scale = new Vector2(2, 2)

    // 创建一个正方形
    const vertices = [100, 100, 200, 100, 200, 200, 100, 200]

    const rect_1 = new Line({
      points: vertices,
      fillStyle: 'purple',
      cursor: 'pointer',
      strokeStyle: 'red',
      closed: true
    })

    stage.append(rect_1)

    console.log(new Matrix3())

    const matrix = new Matrix3()
      .translate(-position.x, -position.y)
      .scale(scale.x, scale.y)
      .rotate(rotate)
      .translate(position.x, position.y)

    const transformedVertices = transformVertices(vertices, matrix)

    const rect_2 = new Line({
      points: transformedVertices,
      fillStyle: 'red',
      opacity: 0.5,
      cursor: 'pointer',
      strokeStyle: 'red',
      closed: true
    })

    stage.append(rect_2)

    // requestAnimationFrame(() => {
    //   ctx.fillRect(200, 200, 100, 100)

    //   ctx.translate(250, 250)
    //   ctx.scale(2, 2)
    //   ctx.translate(-250, -250)

    //   ctx.fillStyle = 'rgba(0,0,0, 0.5)'
    //   ctx.fillRect(200, 200, 100, 100)
    // })
  }, [])

  return (
    <div>
      <div className="canvas-container" ref={canvasRef}></div>
    </div>
  )
}

export default Debug

/* 顶点变换 */
function transformVertices(vertices: number[], matrix: Matrix3) {
  console.log(matrix)
  const worldVertices: number[] = []
  for (let i = 0, len = vertices.length; i < len; i += 2) {
    const { x, y } = new Vector2(vertices[i], vertices[i + 1]).applyMatrix3(matrix)
    worldVertices.push(x, y)
  }
  return worldVertices
}
