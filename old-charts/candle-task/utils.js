// @ts-check

// 判断某个点是否在一个矩形范围外
export function isOuterRect(offsetX, offsetY, x1, x2, y1, y2) {
  const isOuter = offsetX <= x1 || offsetX >= x2 || offsetY > y1 || offsetY < y2
  if (isOuter) return true
  else return false
}
