// 获取圆弧上的点 圆心 半径 角度: 60°
export function getPointOnArc(x0: number, y0: number, r: number, deg: number) {
  const alpha = deg2rad(deg)

  const x = x0 + r * Math.cos(alpha) // Math.cos 传入弧度
  const y = y0 + r * Math.sin(alpha)

  return { x, y }
}

// 角度转弧度
export function deg2rad(deg: number) {
  return (deg * Math.PI) / 180
}

// 弧度转角度
export function rad2deg(radian: number) {
  return (radian * 180) / Math.PI
}
