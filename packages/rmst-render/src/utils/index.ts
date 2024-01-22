export * from './isShape'
export * from './lineUtil'
export * from './math'
export * from './clipRect'

// 测量文本宽高
let ctx: CanvasRenderingContext2D
export function measureText(text: string, fontSize: number) {
  if (!ctx) {
    ctx = document.createElement('canvas').getContext('2d')
  }

  setCtxFontSize(ctx, fontSize)
  const { actualBoundingBoxAscent, actualBoundingBoxDescent, width: textWidth } = ctx.measureText(text)

  // qq 浏览器只返回了 `width`
  const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent || parseInt(ctx.font)

  return { textWidth, textHeight }
}

export function setCtxFontSize(ctx: CanvasRenderingContext2D, fontSize = 14) {
  ctx.font = `${fontSize}px 微软雅黑`
}

export function isShallowEqual(objA, objB): boolean {
  if (Object.is(objA, objB)) {
    return true
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i]

    if (!Reflect.has(objB, currentKey) || !Object.is(objA[currentKey], objB[currentKey])) {
      return false
    }
  }

  return true
}
