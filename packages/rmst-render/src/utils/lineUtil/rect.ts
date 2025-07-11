import { IRect } from '../../type'

// 检测两个矩形是否发生碰撞
export function isRectCollision(rect1: IRect, rect2: IRect) {
  const { x: x1, y: y1, width: w1, height: h1 } = rect1
  const { x: x2, y: y2, width: w2, height: h2 } = rect2

  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2
}
