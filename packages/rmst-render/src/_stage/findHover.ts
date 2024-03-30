import { dpr } from '../constant'
import { isBoxHidden, isGroup, isLine, isStage, isText } from '../utils'
import { Text, measureText } from '..'
import { IShape } from '../type'

export function findHover(ctx: CanvasRenderingContext2D, children: IShape[], x: number, y: number): IShape {
  const _elements = children.toReversed()

  for (const elementItem of _elements) {
    if (elementItem.data.pointerEvents === 'none') {
      continue
    }

    if (isGroup(elementItem) || isBoxHidden(elementItem)) {
      if (isBoxHidden(elementItem)) {
        if (isShapeInner(ctx, elementItem, x, y)) {
          const hovered = findHover(ctx, elementItem.children, x, y)
          if (hovered) {
            return hovered
          }

          return elementItem
        } else {
          continue
        }
      }

      const hovered = findHover(ctx, elementItem.children, x, y)
      if (hovered) {
        return hovered
      }
    } else {
      const isInner = isShapeInner(ctx, elementItem, x, y)
      if (isInner) {
        return elementItem
      }
    }
  }

  return null
}

// 需要通过 四叉树算法 优化图形的拾取
export function findHover_v2(ctx: CanvasRenderingContext2D, children: IShape[], x: number, y: number) {
  const possible: IShape[] = []

  detectHit(children)

  console.log(possible)

  function detectHit(_children) {
    _children.forEach(elementItem => {
      if (elementItem.data.pointerEvents === 'none') {
        return
      }

      if (isGroup(elementItem) || isBoxHidden(elementItem)) {
        if (isGroup(elementItem)) {
          const shape = findShape(elementItem.children)
          if (shape.length) {
            possible.push(...shape)
          }
        } else {
          if (isShapeInner(ctx, elementItem, x, y)) {
            const shape = findShape(elementItem.children)
            if (shape.length) {
              possible.push(...shape)
            } else {
              possible.push(elementItem)
            }
          }
        }
      } else {
        if (isShapeInner(ctx, elementItem, x, y)) {
          possible.push(elementItem)
        }
      }
    })
  }

  function findShape(children: any[]) {
    const ans = []
    for (const elementItem of children) {
      if (isShapeInner(ctx, elementItem, x, y)) {
        ans.push(elementItem)
      }

      if (elementItem.children) {
        return findShape(elementItem.children)
      }
    }

    return ans
  }

  let ans: IShape = null

  const stack = []
  possible.forEach(item => {
    let parent = item

    while (parent && !isStage(parent.parent)) {
      parent = parent.parent
    }

    if (stack.includes(parent)) {
      return
    }
    stack.push(parent)
  })

  console.log(stack)

  let temp

  for (const item of stack) {
    if (!temp) {
      temp = item
    } else {
      if (item.data.zIndex >= temp.data.zIndex) {
        temp = item
      }
    }

    if (possible.includes(temp)) {
      console.log(temp)

      break
    } else {
    }
  }

  possible.forEach(item => {
    if (!ans) {
      ans = item
    } else {
      if (item.parent === ans) {
        ans = item
        return
      } else if (item.data.zIndex >= ans.data.zIndex) {
        ans = item
      }
    }
  })

  return ans
}

function isShapeInner(ctx: CanvasRenderingContext2D, elementItem: IShape, x: number, y: number) {
  const hit_x = x * dpr
  const hit_y = y * dpr

  if (isText(elementItem)) {
    return isHitText(elementItem)
  }

  if (!elementItem.path2D) {
    return false
  }

  ctx.lineWidth = elementItem.data.lineWidth + 5

  if (isLine(elementItem) && !elementItem.data.closed) {
    return isInStroke()
  }

  const isHit = isInPath() || isInStroke()

  return isHit

  function isInPath() {
    return ctx.isPointInPath(elementItem.path2D, hit_x, hit_y)
  }

  function isInStroke() {
    return ctx.isPointInStroke(elementItem.path2D, hit_x, hit_y)
  }

  function isHitText(elementItem: Text): boolean {
    const { data } = elementItem
    const { textWidth, textHeight } = measureText(data.content, data.fontSize)

    const halfWidth = textWidth / 2

    const textRect_x = (() => {
      if (data.textAlign === 'left') {
        return data.x
      }
      if (data.textAlign === 'center') {
        return data.x - halfWidth
      }
      if (data.textAlign === 'right') {
        return data.x - textWidth
      }
    })()

    const textRect_y = (() => {
      if (data.textBaseline === 'middle') {
        return data.y - textHeight / 2
      }
      return data.y
    })()

    const is_x = textRect_x <= x && x <= textRect_x + textWidth
    const is_y = textRect_y <= y && y <= textRect_y + textHeight

    return is_x && is_y
  }
}
