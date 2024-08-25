interface Ellipse {
  cx: number
  cy: number
  radiusX: number
  radiusY: number
}

// 根据弧度 求椭圆上的点的坐标
export function findPointInEllipseByRadian(ellipse: Ellipse, radian: number) {
  const { cx: c, cy: d, radiusX: a, radiusY: b } = ellipse

  if (radian === Math.PI / 2) {
    return { x: c, y: d + b }
  }

  if (radian === (Math.PI / 2) * 3) {
    return { x: c, y: d - b }
  }

  const k = Math.tan(radian)
  const a2 = a ** 2
  const b2 = b ** 2
  const c2 = c ** 2
  const k2 = k ** 2

  // 求根公式
  const gs_a = b2 + a2 * k2
  const gs_b = -(2 * b2 * c + 2 * k2 * a2 * c)
  const gs_c = b2 * c2 + a2 * k2 * c2 - a2 * b2

  const dt = gs_b ** 2 - 4 * gs_a * gs_c

  const sqrtValue = Math.sqrt(dt)
  const 分子 = radian > Math.PI / 2 && radian < (Math.PI / 2) * 3 ? -gs_b - sqrtValue : -gs_b + sqrtValue
  const 分母 = 2 * gs_a
  const ans = 分子 / 分母

  // y = kx + b
  const y = k * ans + (d - k * c)

  return { x: ans, y }
}

export function standardRadian(radian: number) {
  if (-Math.PI <= radian && radian < 0) {
    radian = Math.PI * 2 + radian
  }

  return radian
}

// 点在 在椭圆内,上,外
export function isInPosition(p: { x: number; y: number }, ellipse: Ellipse) {
  const { cx, cy, radiusX, radiusY } = ellipse

  const val = (p.x - cx) ** 2 / radiusX ** 2 + (p.y - cy) ** 2 / radiusY ** 2

  if (val > 1) {
    console.log('外')
  } else if (val === 1) {
    console.log('上')
  } else {
    console.log('内')
  }
}

// 依据椭圆的参数方程
function getPointByTheta(ellipse: Ellipse, theta: number) {
  const x = ellipse.radiusX * Math.cos(theta)
  const y = ellipse.radiusY * Math.sin(theta)

  return { x, y }
}

// 计算焦点
export function focalPoint(ellipse: Ellipse) {
  // 焦点在 x 轴
  if (ellipse.radiusX > ellipse.radiusY) {
    const jd = Math.sqrt(ellipse.radiusX ** 2 - ellipse.radiusY ** 2)

    const jd1 = { x: ellipse.cx + jd, y: ellipse.cy }
    const jd2 = { x: ellipse.cx - jd, y: ellipse.cy }

    return { jd1, jd2 }
  } else if (ellipse.radiusX < ellipse.radiusY) {
    // 焦点在 y 轴

    const focalLengthHalf = Math.sqrt(ellipse.radiusY ** 2 - ellipse.radiusX ** 2)

    const jd1 = { x: ellipse.cx, y: ellipse.cy + focalLengthHalf }
    const jd2 = { x: ellipse.cx, y: ellipse.cy - focalLengthHalf }

    return { jd1, jd2 }
  } else {
    console.log('椭圆是圆')
  }
}
