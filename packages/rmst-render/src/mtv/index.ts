import { deg2rad } from '../utils'
import { Matrix3 } from './Matrix3'
import { Vector2 } from './Vector2'

/* 矩形的模型矩阵数据 */
const position = new Vector2(150, 150)
const rotate = deg2rad(45)
const scale = new Vector2(2, 2)

const matrix = new Matrix3()
  .translate(-position.x, -position.y)
  .scale(scale.x, scale.y)
  .rotate(rotate)
  .translate(position.x, position.y)

/* 顶点变换 */
export function transformVertices(vertices: number[], matrix: Matrix3) {
  console.log(matrix)
  const worldVertices: number[] = []
  for (let i = 0, len = vertices.length; i < len; i += 2) {
    const { x, y } = new Vector2(vertices[i], vertices[i + 1]).applyMatrix3(matrix)
    worldVertices.push(x, y)
  }
  return worldVertices
}
