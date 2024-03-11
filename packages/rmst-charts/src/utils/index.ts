export * from './convert'
import structuredClone from '@ungap/structured-clone'

export const stClone = <T>(value: T): T => {
  return structuredClone(value)
}

// 判断某个点是否在一个矩形范围内
export function isInnerRect(offsetX: number, offsetY: number, x1: number, x2: number, y1: number, y2: number) {
  const isInner = offsetX >= x1 && offsetX <= x2 && offsetY >= y1 && offsetY <= y2

  return isInner
}
